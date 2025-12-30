# CI/CD Pipeline Documentation

## 📋 Overview

This is a **production-grade, zero-cost CI/CD pipeline** for the Zoom Clone project using **GitHub Actions (free tier)**. The pipeline follows industry best practices used by top product-based companies.

## 🏗️ Architecture

The pipeline consists of **6 parallel jobs** that run on every pull request and push to main:

```
┌─────────────┐
│   Install   │ ← Installs dependencies, sets up caching
└──────┬──────┘
       │
       ├─────────┬─────────┬─────────┬──────────┐
       │         │         │         │          │
   ┌───▼───┐ ┌──▼──┐  ┌───▼────┐ ┌──▼─────┐ ┌─▼────┐
   │ Lint  │ │Test │  │ Build  │ │Security│ │ ...  │
   └───┬───┘ └──┬──┘  └───┬────┘ └──┬─────┘ └─┬────┘
       │        │         │         │          │
       └────────┴─────────┴─────────┴──────────┘
                        │
                  ┌─────▼──────┐
                  │ CI Success │ ← Final status check
                  └────────────┘
```

## 🎯 Pipeline Jobs

### 1. **Install** (Foundation)
- Checks out code
- Sets up Node.js 18.x and pnpm 8.15.5
- Configures intelligent caching for pnpm store
- Installs dependencies with `--frozen-lockfile` (fails if lockfile is out of sync)
- Caches `node_modules` for subsequent jobs

**Why it matters:** Ensures deterministic, reproducible builds. The frozen lockfile prevents supply chain attacks.

### 2. **Lint & Type Check** (Code Quality)
- Runs ESLint across all packages
- Performs TypeScript type checking with `tsc --noEmit`
- **Fails fast** on any lint or type errors

**Why it matters:** Catches bugs before they reach production. Type safety prevents runtime errors.

### 3. **Test** (Database & Unit Tests)
- Spins up **PostgreSQL 15 Alpine** service container
- Generates Prisma Client from schema
- Runs database migrations
- Verifies schema matches migrations
- Executes Jest unit tests across all services
- Uploads coverage reports as artifacts

**Environment Variables:**
```bash
DATABASE_URL=postgresql://test_user:test_password@localhost:5432/zoom_clone_test
NODE_ENV=test
JWT_SECRET=test-jwt-secret-key-for-ci
JWT_REFRESH_SECRET=test-jwt-refresh-secret-key-for-ci
```

**Why it matters:** Tests against real PostgreSQL (not mocks) to catch schema issues early.

### 4. **Build** (Production Validation)
- Generates Prisma Client
- Builds all NestJS microservices (auth, meeting, signaling)
- Builds Next.js frontend
- Verifies all build artifacts exist
- Uploads artifacts (only on main branch)

**Why it matters:** Ensures code compiles and is production-ready. Catches build errors before deployment.

### 5. **Security** (Vulnerability Scanning)
- Runs `pnpm audit` to check for known vulnerabilities
- Generates security audit report
- Uploads report as artifact for review

**Why it matters:** Identifies vulnerable dependencies. Free alternative to paid tools like Snyk.

### 6. **CI Success** (Final Gate)
- Checks status of all previous jobs
- **Fails if any job failed**
- Provides clear success/failure message

**Why it matters:** Single source of truth for PR merge decisions.

## ⚡ Performance Optimizations

### Caching Strategy
1. **pnpm store cache**: Reuses downloaded packages across runs
2. **node_modules cache**: Skips reinstallation if lockfile unchanged
3. **Turbo cache**: Leverages Turborepo's intelligent caching

### Parallel Execution
- Lint, Test, Build, and Security run **in parallel** after Install
- Reduces total CI time from ~15min to **~5-7min**

### Smart Triggers
```yaml
on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]
```

## 🔒 Security Best Practices

1. **Least Privilege Permissions**
   ```yaml
   permissions:
     contents: read
     pull-requests: read
   ```

2. **No Hardcoded Secrets**
   - Uses GitHub Secrets for sensitive data
   - Test environment uses safe dummy values

3. **Frozen Lockfile**
   - `pnpm install --frozen-lockfile` prevents lockfile tampering
   - Ensures exact dependency versions

4. **Service Container Isolation**
   - PostgreSQL runs in isolated Docker container
   - Destroyed after test job completes

## 📁 Project Structure

```
zoom-clone/
├── .github/
│   └── workflows/
│       └── ci.yml                    # Main CI pipeline
├── apps/
│   ├── auth-service/
│   │   ├── src/
│   │   ├── jest.config.js            # Jest configuration
│   │   ├── jest.setup.ts             # Test environment setup
│   │   ├── .eslintrc.js              # ESLint rules
│   │   └── package.json              # Scripts: test, type-check, lint
│   ├── meeting-service/
│   │   ├── src/
│   │   ├── jest.config.js
│   │   ├── jest.setup.ts
│   │   ├── .eslintrc.js
│   │   └── package.json
│   └── frontend/
│       └── package.json
├── packages/
│   └── shared/
│       ├── prisma/
│       │   └── schema.prisma         # Database schema
│       └── package.json
├── package.json                      # Root scripts
├── turbo.json                        # Turbo task configuration
└── pnpm-lock.yaml                    # Locked dependencies
```

## 🚀 Usage

### Running Locally

```bash
# Install dependencies
pnpm install

# Run linting
pnpm run lint

# Run type checking
pnpm run type-check

# Run tests
pnpm run test

# Build all services
pnpm run build
```

### CI Behavior

**On Pull Request:**
- Runs all 6 jobs
- Must pass before merge
- Uploads test coverage and security reports

**On Push to Main:**
- Runs all 6 jobs
- Uploads build artifacts
- Artifacts retained for 7 days

## 🔧 Configuration

### Adding New Services

1. Create service in `apps/` directory
2. Add `jest.config.js` and `.eslintrc.js`
3. Update `package.json` with scripts:
   ```json
   {
     "scripts": {
       "build": "nest build",
       "test": "jest",
       "type-check": "tsc --noEmit",
       "lint": "eslint \"{src,apps,libs,test}/**/*.ts\""
     }
   }
   ```
4. Turbo will automatically include it in CI

### Environment Variables

**For CI (GitHub Secrets):**
- `DATABASE_URL` (test database - set in workflow)
- `JWT_SECRET` (test secret - set in workflow)
- `JWT_REFRESH_SECRET` (test secret - set in workflow)

**For Local Development:**
Create `.env` files in each service:
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/zoom_clone
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
```

## 📊 Monitoring & Debugging

### View Test Coverage
1. Go to Actions → Select workflow run
2. Download `coverage-report` artifact
3. Open `coverage/lcov-report/index.html`

### View Security Audit
1. Go to Actions → Select workflow run
2. Download `security-audit` artifact
3. Review `audit-report.json`

### View Build Artifacts
1. Go to Actions → Select workflow run (main branch only)
2. Download `build-artifacts` artifact

## 🎯 Quality Gates

The pipeline enforces these gates:

✅ **Lockfile Integrity**: Fails if `pnpm-lock.yaml` is out of sync  
✅ **Linting**: Fails on ESLint errors  
✅ **Type Safety**: Fails on TypeScript errors  
✅ **Tests**: Fails if any test fails  
✅ **Database Schema**: Fails if schema doesn't match migrations  
✅ **Build**: Fails if any service fails to build  

## 🆓 Cost Breakdown

| Resource | Cost | Notes |
|----------|------|-------|
| GitHub Actions | **$0** | 2,000 min/month free for private repos |
| PostgreSQL Container | **$0** | Runs in GitHub-hosted runner |
| Node.js | **$0** | Pre-installed on ubuntu-latest |
| Caching | **$0** | 10GB cache storage included |
| Artifacts | **$0** | 500MB storage, 7-day retention |
| **TOTAL** | **$0/month** | 🎉 |

## 🔄 Optional Improvements (Still Free)

### 1. **Codecov Integration** (Free for Open Source)
```yaml
- name: Upload to Codecov
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

### 2. **Dependabot** (Free)
Enable in `.github/dependabot.yml`:
```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
```

### 3. **Branch Protection Rules**
- Require status checks to pass
- Require pull request reviews
- Require linear history

### 4. **Slack Notifications** (Free)
```yaml
- name: Slack Notification
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 5. **Docker Build** (For Future Deployment)
```yaml
- name: Build Docker Images
  run: |
    docker build -t auth-service ./apps/auth-service
    docker build -t meeting-service ./apps/meeting-service
```

## 🐛 Troubleshooting

### Issue: "pnpm: command not found"
**Solution:** Ensure `pnpm/action-setup@v3` is used before running pnpm commands

### Issue: "Cannot find module '@prisma/client'"
**Solution:** Add `pnpm run db:generate` step before build/test

### Issue: "Database connection failed"
**Solution:** Verify PostgreSQL service is healthy and DATABASE_URL is correct

### Issue: "Tests timeout"
**Solution:** Increase `testTimeout` in `jest.config.js` or add `timeout-minutes` to job

## 📚 References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Turborepo CI/CD Guide](https://turbo.build/repo/docs/ci)
- [Jest Testing Best Practices](https://jestjs.io/docs/getting-started)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)

## ✅ Checklist

Before merging this PR, ensure:

- [ ] All services have `test`, `type-check`, and `lint` scripts
- [ ] Jest configurations are in place
- [ ] ESLint configurations are in place
- [ ] Database migrations are up to date
- [ ] `.env.example` files exist for each service
- [ ] CI pipeline passes on a test PR

---

**Built with ❤️ for production-grade, zero-cost CI/CD**
