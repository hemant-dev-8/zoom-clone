# 🚀 Zoom Clone - Complete Setup Guide

## ⚠️ Current Issue

Your frontend is trying to connect to backend services that aren't running:
- ❌ Signaling Service (port 3003) - **NOT RUNNING**
- ❌ Media SFU (port 3004) - **NOT RUNNING**
- ✅ Auth Service (port 3001) - Running
- ❓ Meeting Service (port 3002) - Unknown
- ❓ Recording Service (port 3005) - Unknown

## 📋 Prerequisites

1. **PostgreSQL Database** must be running
2. **Redis** (for signaling service)
3. **Node.js 18+** and **pnpm**

## 🔧 Quick Start - All Services

### Step 1: Start Database & Redis

```bash
# Start PostgreSQL and Redis using Docker
docker-compose up -d postgres redis
```

### Step 2: Run Database Migrations

```bash
# Generate Prisma Client
pnpm run db:generate

# Run migrations
cd packages/shared
pnpm exec prisma migrate deploy
cd ../..
```

### Step 3: Start All Backend Services

Open **5 separate terminals** and run:

#### Terminal 1: Auth Service
```bash
cd apps/auth-service
pnpm run dev
```

#### Terminal 2: Meeting Service
```bash
cd apps/meeting-service
pnpm run dev
```

#### Terminal 3: Signaling Service
```bash
cd apps/signaling-service
pnpm run dev
```

#### Terminal 4: Media SFU
```bash
cd apps/media-sfu
pnpm run dev
```

#### Terminal 5: Recording Service (Optional)
```bash
cd apps/recording-service
pnpm run dev
```

### Step 4: Start Frontend

#### Terminal 6: Frontend
```bash
cd apps/frontend
pnpm run dev
```

## 🎯 Verify Services Are Running

Check that all services are accessible:

```bash
# Auth Service
curl http://localhost:3001/health

# Meeting Service
curl http://localhost:3002/health

# Signaling Service
curl http://localhost:3003/health

# Media SFU
curl http://localhost:3004/health

# Recording Service
curl http://localhost:3005/health
```

## 📝 Environment Variables

Make sure each service has proper `.env` file:

### Root `.env`
```env
DATABASE_URL=postgresql://user:password@localhost:5432/zoom_clone
REDIS_URL=redis://localhost:6379
```

### `apps/auth-service/.env`
```env
DATABASE_URL=postgresql://user:password@localhost:5432/zoom_clone
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
PORT=3001
```

### `apps/meeting-service/.env`
```env
DATABASE_URL=postgresql://user:password@localhost:5432/zoom_clone
PORT=3002
```

### `apps/signaling-service/.env`
```env
REDIS_URL=redis://localhost:6379
PORT=3003
```

### `apps/media-sfu/.env`
```env
PORT=3004
RTC_MIN_PORT=40000
RTC_MAX_PORT=49999
```

### `apps/frontend/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_MEETING_API_URL=http://localhost:3002
NEXT_PUBLIC_SIGNALING_URL=http://localhost:3003
NEXT_PUBLIC_MEDIA_SFU_URL=http://localhost:3004
NEXT_PUBLIC_RECORDING_URL=http://localhost:3005
```

## 🐛 Troubleshooting

### Issue: "Cannot connect to database"
**Solution:**
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# If not, start it
docker-compose up -d postgres
```

### Issue: "Cannot connect to Redis"
**Solution:**
```bash
# Check if Redis is running
docker ps | grep redis

# If not, start it
docker-compose up -d redis
```

### Issue: "Port already in use"
**Solution:**
```bash
# Find process using the port (e.g., 3003)
netstat -ano | findstr :3003

# Kill the process
taskkill /PID <process_id> /F
```

### Issue: "Module not found: @prisma/client"
**Solution:**
```bash
# Regenerate Prisma Client
pnpm run db:generate
```

## 🎉 Testing the Complete Flow

1. **Open Frontend**: http://localhost:3000
2. **Join a Meeting**: Go to http://localhost:3000/meeting/123
3. **Open in Another Tab/Browser**: Join the same meeting ID
4. **Verify**:
   - ✅ Both participants appear in participants list
   - ✅ Participant count shows "2 Participants"
   - ✅ Chat messages work
   - ✅ Video/audio controls work
   - ✅ Share link button works

## 📊 Service Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (3000)                     │
│                    Next.js Application                   │
└────────┬────────────────────────────────────────────┬───┘
         │                                             │
         ├─────────────────────────────────────────────┤
         │                                             │
    ┌────▼────┐  ┌──────────┐  ┌───────────┐  ┌──────▼─────┐
    │  Auth   │  │ Meeting  │  │ Signaling │  │ Media SFU  │
    │ Service │  │ Service  │  │  Service  │  │  Service   │
    │  :3001  │  │  :3002   │  │   :3003   │  │   :3004    │
    └────┬────┘  └────┬─────┘  └─────┬─────┘  └────────────┘
         │            │               │
         └────────────┴───────────────┘
                      │
              ┌───────┴────────┐
              │   PostgreSQL   │
              │     Redis      │
              └────────────────┘
```

## 🔥 Quick Start Script (All at Once)

Use the provided `start-all.sh` script:

```bash
# Make executable
chmod +x start-all.sh

# Run
./start-all.sh
```

Or use Turbo to start all dev servers:

```bash
# Start all services in parallel
pnpm run dev
```

---

**Need Help?** Check the logs in each terminal for specific error messages.
