# 🚀 CI/CD Pipeline - Quick Start

## ✅ What's Included

This production-grade CI/CD pipeline includes:

- ✅ **Automated Testing** with PostgreSQL service container
- ✅ **Code Quality Checks** (ESLint + TypeScript)
- ✅ **Build Validation** for all microservices
- ✅ **Security Auditing** with pnpm audit
- ✅ **Intelligent Caching** for fast builds
- ✅ **Parallel Job Execution** (~5-7 min total)
- ✅ **100% Free** (GitHub Actions free tier)

## 🏃 Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env with your actual values
```

### 3. Generate Prisma Client
```bash
pnpm run db:generate
```

### 4. Run Tests Locally
```bash
pnpm run test
```

### 5. Run Linting
```bash
pnpm run lint
```

### 6. Type Check
```bash
pnpm run type-check
```

### 7. Build All Services
```bash
pnpm run build
```

## 📋 CI Pipeline Overview

The pipeline runs automatically on:
- Every **pull request** to `main` or `develop`
- Every **push** to `main`

### Pipeline Jobs (Parallel Execution)

```
Install → ┬─ Lint & Type Check
          ├─ Test (with PostgreSQL)
          ├─ Build All Services
          └─ Security Audit
                    ↓
              CI Success ✅
```

### Estimated Runtime
- **First run**: ~8-10 minutes (no cache)
- **Subsequent runs**: ~5-7 minutes (with cache)

## 🔧 Adding Tests to New Services

### 1. Create Jest Config
```javascript
// apps/your-service/jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/?(*.)+(spec|test).ts'],
  // ... see existing configs for full setup
};
```

### 2. Add Scripts to package.json
```json
{
  "scripts": {
    "test": "jest",
    "type-check": "tsc --noEmit",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\""
  }
}
```

### 3. Create Test Files
```typescript
// apps/your-service/src/your.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { YourService } from './your.service';

describe('YourService', () => {
  let service: YourService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [YourService],
    }).compile();

    service = module.get<YourService>(YourService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

## 🐛 Troubleshooting

### CI Fails: "Cannot find module '@prisma/client'"
**Fix:** Ensure `pnpm run db:generate` runs before build/test

### CI Fails: "Lockfile out of sync"
**Fix:** Run `pnpm install` locally and commit `pnpm-lock.yaml`

### Tests Fail Locally but Pass in CI
**Fix:** Check environment variables in `.env.test`

### Slow CI Performance
**Fix:** Check cache is working (should see "Cache restored" in logs)

## 📊 Viewing Results

### Test Coverage
1. Go to **Actions** tab in GitHub
2. Click on the workflow run
3. Download **coverage-report** artifact
4. Open `coverage/lcov-report/index.html`

### Security Audit
1. Go to **Actions** tab
2. Download **security-audit** artifact
3. Review `audit-report.json`

## 🔒 Security Notes

- Never commit `.env` files (already in `.gitignore`)
- Use GitHub Secrets for production credentials
- Test environment uses safe dummy values
- Lockfile ensures dependency integrity

## 📚 Full Documentation

For detailed documentation, see:
- [CI/CD Documentation](./.github/CI_CD_DOCUMENTATION.md)

## 🎯 Quality Gates

All PRs must pass:
- ✅ ESLint (no errors)
- ✅ TypeScript type check (no errors)
- ✅ All unit tests
- ✅ Build succeeds for all services
- ✅ Lockfile integrity check

## 💡 Tips

1. **Run tests before pushing**: `pnpm run test`
2. **Fix linting issues**: `pnpm run lint`
3. **Check types**: `pnpm run type-check`
4. **Keep lockfile updated**: Commit `pnpm-lock.yaml` changes
5. **Write tests**: Aim for >80% coverage

---

**Questions?** Check the [full documentation](./.github/CI_CD_DOCUMENTATION.md)
