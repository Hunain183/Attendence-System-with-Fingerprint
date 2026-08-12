# Deployment Guide - Attendance Management System

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Render Backend Deployment](#render-backend-deployment)
4. [Vercel Frontend Deployment](#vercel-frontend-deployment)
5. [Database Setup](#database-setup)
6. [Local Development](#local-development)
7. [Post-Deployment Testing](#post-deployment-testing)
8. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      PRODUCTION SETUP                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐      ┌──────────────────┐             │
│  │   Vercel CDN     │      │  Vercel Frontend │             │
│  │  (Static Assets) │◄─────┤  (React App)     │             │
│  │  react, css, js  │      │  https://...     │             │
│  └──────────────────┘      └────────┬─────────┘             │
│                                     │                        │
│                              API Requests (HTTPS)            │
│                                     │                        │
│                                     ▼                        │
│                           ┌──────────────────┐              │
│                           │  Render FastAPI  │              │
│                           │  Backend         │              │
│                           │  https://...     │              │
│                           └────────┬─────────┘              │
│                                     │                        │
│                            Database Connection               │
│                                     │                        │
│                                     ▼                        │
│                           ┌──────────────────┐              │
│                           │  PostgreSQL DB   │              │
│                           │  (Render)        │              │
│                           │  Employees       │              │
│                           │  Attendance      │              │
│                           │  Salaries        │              │
│                           │  Users           │              │
│                           └──────────────────┘              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

### Tools and Accounts Required
- [GitHub](https://github.com) account (for source control)
- [Render](https://render.com) account (free tier available)
- [Vercel](https://vercel.com) account (free tier available)
- [Node.js](https://nodejs.org) 18+ (for local development)
- [Python](https://www.python.org) 3.9+ (for local development)
- Git CLI installed

### Environment Variables Checklist
Before deployment, you'll need:
- ✅ Strong `SECRET_KEY` (JWT secret)
- ✅ Strong `DEVICE_API_KEY` for fingerprint devices
- ✅ 32-character `ENCRYPTION_KEY`
- ✅ Secure `ADMIN_PASSWORD` (not "admin123")
- ✅ Frontend URL (Vercel deployment URL)
- ✅ Backend URL (Render deployment URL)

---

## Render Backend Deployment

### Step 1: Prepare Backend Code

1. Create `.env` file in backend directory:
```bash
cp backend/.env.example backend/.env
```

2. Edit `backend/.env` with strong secrets:
```bash
cd backend
# Generate strong keys
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

3. Update `backend/.env`:
```env
# Database - PostgreSQL (will be set on Render dashboard)
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/attendance_db

# Security
SECRET_KEY=<generated-strong-key-here>
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# API
DEVICE_API_KEY=<generated-secure-key>
ENCRYPTION_KEY=<32-character-string>

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<secure-password>

# Frontend
FRONTEND_URL=https://your-frontend.vercel.app

# Server
SERVER_HOST=0.0.0.0
SERVER_PORT=8000
ENVIRONMENT=production
```

### Step 2: Push Code to GitHub

```bash
git add .
git commit -m "prepare: setup production deployment configuration"
git push origin main
```

### Step 3: Create Render Web Service

1. Go to [render.com](https://render.com) → Dashboard
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `attendance-system-backend`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Region**: Choose closest to users

### Step 4: Create PostgreSQL Database on Render

1. Go to Render Dashboard → **New +** → **PostgreSQL**
2. Configure:
   - **Name**: `attendance-system-db`
   - **Database**: `attendance_db`
   - **User**: `attendance_user`
   - **Region**: Same as backend service
   - **PostgreSQL Version**: 15

3. After creation, copy the **Internal Database URL**

### Step 5: Set Environment Variables on Render

In your Web Service settings, add Environment Variables:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql+asyncpg://user:password@hostname:5432/attendance_db` |
| `SECRET_KEY` | [Generated strong key] |
| `JWT_ALGORITHM` | `HS256` |
| `JWT_EXPIRATION_HOURS` | `24` |
| `DEVICE_API_KEY` | [Generated secure key] |
| `ENCRYPTION_KEY` | [32-char string] |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD` | [Secure password] |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` |
| `SERVER_HOST` | `0.0.0.0` |
| `ENVIRONMENT` | `production` |

### Step 6: Deploy and Test Backend

1. Click **Deploy** on Render
2. Wait for build to complete (3-5 minutes)
3. Test health endpoint:
   ```bash
   curl https://your-backend.onrender.com/health
   ```
   
   Expected response:
   ```json
   {
     "status": "healthy",
     "message": "Fingerprint Attendance Management System is running",
     "environment": "production"
   }
   ```

4. Initialize database:
   ```bash
   # Connect to Render shell and run:
   cd /app
   python init_db_production.py
   python create_demo_admin.py
   ```

---

## Vercel Frontend Deployment

### Step 1: Prepare Frontend Code

1. Create `.env.production` in frontend directory:
```bash
cat > frontend/.env.production << EOF
VITE_API_URL=https://your-backend.onrender.com
EOF
```

Replace `your-backend.onrender.com` with your actual Render backend URL.

### Step 2: Push Code to GitHub

```bash
git add .
git commit -m "prepare: configure frontend for production"
git push origin main
```

### Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → Dashboard
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure:
   - **Framework**: React
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 4: Add Environment Variables

In Vercel Project Settings → Environment Variables:

| Key | Value | Environment |
|-----|-------|-------------|
| `VITE_API_URL` | `https://your-backend.onrender.com` | Production |

### Step 5: Deploy

1. Click **Deploy**
2. Wait for build (2-3 minutes)
3. Test frontend:
   ```bash
   # Visit your Vercel URL
   https://your-project.vercel.app
   ```

---

## Database Setup

### Automatic Initialization (Recommended)

After deploying to Render, the database tables are created automatically on first startup.

### Manual Database Initialization

If needed, you can manually initialize the database:

1. **Connect to Render Shell**:
   - Go to Render Dashboard → Your Web Service
   - Click **Shell** tab
   - Run commands:

```bash
# Initialize database tables
python init_db_production.py

# Create demo admin account (for testing)
python create_demo_admin.py

# Create demo employees (for testing)
# Already done by create_demo_admin.py
```

### Database Schema

The system creates these tables automatically:

- **users**: Admin and user accounts
  - id, username, password_hash, role, is_active, created_at, updated_at

- **employees**: Employee records
  - id, name, email, phone, designation, department, status, created_at, updated_at
  - Plus 30+ optional fields (date_of_birth, cnic, picture, etc.)

- **attendance**: Attendance records
  - id, employee_id, attendance_date, time_in, time_out, total_work_minutes, leave_type
  - Created_at, updated_at

- **salaries**: Salary management
  - id, employee_id, month, rate_of_pay, total_days_worked, amount, net_amount, status
  - created_at, updated_at

---

## Local Development

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Initialize local SQLite database
python -c "from database import init_db; init_db(); print('✅ Database initialized')"

# Run the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Access API docs
# Open: http://localhost:8000/docs
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
cat > .env.local << EOF
VITE_API_URL=http://localhost:8000
EOF

# Start development server
npm run dev

# Access application
# Open: http://localhost:3000
```

### Testing Login

**Demo Credentials** (after running `create_demo_admin.py`):
- Username: `demo_admin`
- Password: `change_me_123`

---

## Post-Deployment Testing

### 1. Health Check
```bash
curl https://your-backend.onrender.com/health
# Expected: {"status": "healthy", ...}
```

### 2. Frontend Access
```bash
# Open in browser: https://your-project.vercel.app
# Should see login page
```

### 3. Login Test
1. Go to frontend URL
2. Login with:
   - Username: `demo_admin` (if demo data created)
   - Password: `change_me_123`
3. Should see dashboard

### 4. API Test
```bash
# Get auth token
curl -X POST https://your-backend.onrender.com/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"<password>"}'

# Use token to access employees
curl https://your-backend.onrender.com/employees \
  -H "Authorization: Bearer <token>"
```

### 5. Database Connectivity
- Check Render logs for database errors
- Verify DATABASE_URL environment variable
- Confirm PostgreSQL service is running

---

## Troubleshooting

### Common Issues

#### 1. **502 Bad Gateway on Render**
**Cause**: Backend failed to start
**Solution**:
```bash
# Check Render logs
# Verify DATABASE_URL format
# Ensure Python dependencies installed: pip install -r requirements.txt
```

#### 2. **CORS Error in Browser**
**Cause**: Frontend URL not in backend CORS list
**Solution**:
```bash
# Update FRONTEND_URL in Render environment variables
# Must match your Vercel URL exactly
FRONTEND_URL=https://your-project.vercel.app
```

#### 3. **Database Connection Failed**
**Cause**: Invalid DATABASE_URL or database down
**Solution**:
```bash
# Verify DATABASE_URL format:
# postgresql+asyncpg://user:password@host:5432/dbname

# Test connection:
psql postgresql://user:password@host:5432/dbname
```

#### 4. **Login Fails with 401**
**Cause**: Wrong password or user doesn't exist
**Solution**:
```bash
# Verify ADMIN_PASSWORD environment variable
# Try with demo credentials if available
# Check database contains users table
```

#### 5. **Frontend Can't Connect to Backend**
**Cause**: VITE_API_URL not set or incorrect
**Solution**:
```bash
# Verify VITE_API_URL in Vercel
# Should be: https://your-backend.onrender.com
# Not: http://localhost:8000
```

#### 6. **Fingerprint Device Can't Connect**
**Cause**: Device API key mismatch or CORS issue
**Solution**:
```bash
# Verify DEVICE_API_KEY matches
# Ensure device uses: https://your-backend.onrender.com/device
# Check X-API-Key header sent by device
```

### Debug Commands

```bash
# Check backend logs (Render)
# Go to: Render Dashboard → Web Service → Logs

# Test database connection (Render Shell)
python -c "from database import engine; print(engine.url)"

# Check if tables exist (Render Shell)
python -c "from database import Base; from sqlalchemy import inspect; print(inspect(engine).get_table_names())"

# Restart backend (Render Dashboard)
# Click "Manual Deploy" or "Restart" button
```

---

## Security Checklist

Before production:
- [ ] Change all default passwords
- [ ] Generate strong SECRET_KEY
- [ ] Generate strong DEVICE_API_KEY
- [ ] Remove demo data if not needed
- [ ] Set ENVIRONMENT=production
- [ ] Verify CORS only allows frontend URL
- [ ] Enable HTTPS (automatic on Vercel and Render)
- [ ] Monitor logs for errors/attacks
- [ ] Backup PostgreSQL database regularly
- [ ] Use strong database password
- [ ] Rotate keys periodically
- [ ] Set up monitoring alerts

---

## Support

For issues:
1. Check logs: Render Dashboard → Logs tab
2. Verify environment variables
3. Test with health endpoint: `/health`
4. Check database connection
5. Review CORS configuration
6. Test locally first before production

---

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
