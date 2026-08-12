# Vercel + Neon Deployment Guide

## Overview

This project is prepared for a single Vercel deployment in which:

- Frontend runs at the root domain, for example: https://your-app.vercel.app
- FastAPI API runs under /api, for example: https://your-app.vercel.app/api/admin/login
- PostgreSQL production database uses Neon
- SQLite remains available for local development only

This keeps the React UI unchanged, preserves the existing API behavior, and avoids forcing a large backend refactor.

---

## Architecture

```text
Browser
  ├─ Frontend: https://your-app.vercel.app/
  └─ API:      https://your-app.vercel.app/api/*

Vercel Project
  ├─ frontend/      React + Vite build output
  ├─ api/index.py  FastAPI serverless entry point
  └─ vercel.json    route rules for /api/* and SPA fallback

Neon PostgreSQL
  └─ external production database for all app data
```

---

## Required accounts and tools

- GitHub account
- Vercel account
- Neon account
- Node.js 18+
- Python 3.11+
- Git CLI

---

## Project structure used for Vercel

This project already contains:

- frontend/ - React + TypeScript app
- backend/ - existing FastAPI app
- api/index.py - Vercel entry point that imports the existing FastAPI app
- vercel.json - route rules for API and frontend SPA routing

The rule is: re-use the existing backend code instead of duplicating the app.

---

## Required environment variables

### Frontend environment variables (browser-visible)

Only VITE_* variables should be exposed to the browser.

```env
VITE_API_URL=/api
```

This is the preferred setting for a same-domain Vercel deployment.

### Backend environment variables (server-only)

Set these in Vercel Project Settings > Environment Variables for the Python runtime.

```env
DATABASE_URL=postgresql+asyncpg://<user>:<password>@<host>:5432/<db>
SECRET_KEY=<strong-random-key>
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
DEVICE_API_KEY=<strong-random-key>
ENCRYPTION_KEY=<32-character-fernet-key>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<strong-admin-password>
FRONTEND_URL=https://your-app.vercel.app
SERVER_HOST=0.0.0.0
SERVER_PORT=8000
ENVIRONMENT=production
```

Important:
- Do not hard-code secrets in source code.
- Do not expose backend secrets in the frontend build.
- Keep .env files out of GitHub.

---

## Neon PostgreSQL setup

### 1. Create a Neon project

1. Go to https://neon.tech
2. Create a new project
3. Pick a region close to your users
4. Create a database and note the connection string

### 2. Copy the connection string

Neon will give you a PostgreSQL URL similar to:

```text
postgresql://<user>:<password>@<host>/<database>?sslmode=require
```

For SQLAlchemy + asyncpg, convert it to:

```text
postgresql+asyncpg://<user>:<password>@<host>/<database>?sslmode=require
```

### 3. Set the database URL in Vercel

Use the full value in Vercel Environment Variables:

```env
DATABASE_URL=postgresql+asyncpg://<user>:<password>@<host>/<database>?sslmode=require
```

This is the production connection used by the app.

---

## Vercel project configuration

### Option 1: Same project root with frontend + API

Use one Vercel project with the repository root as the project root.

Set these build settings:

- Framework Preset: Other / custom
- Build Command: (leave empty unless your Vercel project config requires it)
- Output Directory: (leave empty unless required)

The repo already contains the required configuration:

- `api/index.py` for the Python serverless entry point
- `vercel.json` for API route mapping and SPA fallback
- `frontend/package.json` for the React app build

### Option 2: Root directory = frontend

If you configure the project with root directory set to `frontend`, then:

- the frontend is deployed from the frontend folder
- the API route from `api/` may not work unless Vercel is configured to include the repo-wide `api` folder

For this project, the recommended approach is the same repository root with `api/` plus `frontend/` and `vercel.json`.

---

## FastAPI + Vercel serverless setup

The application entry point is:

```python
api/index.py
```

It reuses the existing backend app by importing from the existing project:

```python
from main import app
```

This means the existing FastAPI app, routers, auth, and services are kept intact without duplication.

The Vercel Python runtime loads this file and exposes the FastAPI app.

---

## Important routing behavior

The project is designed to keep the API under `/api` while preserving existing backend routes.

Examples:

- `/api/admin/login`
- `/api/admin/employees`
- `/api/attendance`
- `/api/salaries`
- `/api/health`

The frontend axios client is already prepared to use a same-domain API path:

```ts
if (import.meta.env.VITE_API_URL) {
  return import.meta.env.VITE_API_URL as string;
}
if (!import.meta.env.PROD) {
  return '/api';
}
return '/api';
```

That means in a Vercel deployment, the preferred setting is simply:

```env
VITE_API_URL=/api
```

No secret values should be placed in `VITE_*` variables.

---

## React Router and page refresh on Vercel

The project should use SPA fallback so that routes like:

- /login
- /dashboard
- /employees
- /reports

continue working after refresh.

The Vercel route config should route non-API requests to index.html in the frontend build.

---

## Local development still works

For local development, keep SQLite in the backend `.env` file:

```env
DATABASE_URL=sqlite:///./attendance.db
ENVIRONMENT=development
FRONTEND_URL=http://localhost:3000
```

Then run:

```bash
cd backend
python3 -m pip install -r requirements.txt
python3 -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

For the frontend:

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```

The frontend will use:

```env
VITE_API_URL=http://localhost:8000
```

for local development, or `/api` for same-domain Vercel hosting.

---

## Database initialization for Neon

The existing project still includes:

- `backend/init_db_production.py`
- `backend/create_demo_admin.py`

These are still useful for Neon-based deployments, but they must be run with the production `DATABASE_URL` set first.

Example:

```bash
cd backend
export DATABASE_URL="postgresql+asyncpg://<user>:<password>@<host>/<db>?sslmode=require"
export ENVIRONMENT="production"
python3 init_db_production.py
python3 create_demo_admin.py
```

The scripts are designed to create the tables and seed demo data in PostgreSQL.

---

## Exact Vercel deployment steps

### 1. Push the repository to GitHub

```bash
git add .
git commit -m "prepare v3: vercel full-stack + neon"
git push origin main
```

### 2. Import the repo in Vercel

1. Open Vercel dashboard
2. Import the GitHub project
3. Select the repository
4. Keep repo root as project root

### 3. Configure Vercel environment variables

In the project environment variables section, add:

```env
DATABASE_URL=postgresql+asyncpg://<user>:<password>@<host>/<db>?sslmode=require
SECRET_KEY=<strong-random-key>
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
DEVICE_API_KEY=<strong-random-key>
ENCRYPTION_KEY=<32-character-fernet-key>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<strong-admin-password>
FRONTEND_URL=https://your-app.vercel.app
SERVER_HOST=0.0.0.0
SERVER_PORT=8000
ENVIRONMENT=production
VITE_API_URL=/api
```

### 4. Deploy

- Trigger a production deployment in Vercel
- Wait for the build to complete

### 5. Test the API endpoints

After deployment, verify:

```bash
curl https://your-app.vercel.app/health
curl https://your-app.vercel.app/api/health
curl -X POST https://your-app.vercel.app/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"<password>"}'
```

### 6. Test the frontend

Open:

```text
https://your-app.vercel.app/
```

Then sign in using the configured admin credentials.

---

## Health check requirement

The app includes a `/health` route that should remain available after deployment.

It should respond with a JSON payload similar to:

```json
{
  "status": "healthy",
  "message": "Fingerprint Attendance Management System is running",
  "environment": "production"
}
```

The Vercel route mapping allows `/health` and `/api/health` to reach the FastAPI app.

---

## Build validation checklist

Before deployment, verify all of the following:

- Python import works
- FastAPI app loads from `api/index.py`
- `/health` is reachable
- Existing routers still exist
- npm run build succeeds
- local SQLite dev still works
- production PostgreSQL uses asyncpg and SQLAlchemy
- no secrets are committed to GitHub

---

## Troubleshooting

### 1. Import error in Vercel

Symptoms:
- Vercel build fails at import time
- `main` module cannot be found

Fix:
- Ensure `api/index.py` adds the backend directory to `sys.path`
- Ensure `backend` contains the actual FastAPI app code

### 2. API routes return 404

Check:
- `vercel.json` matches the route prefix
- the FastAPI app is mounted correctly
- routes still exist in the existing backend app

### 3. CORS issues

Set the correct `FRONTEND_URL` environment variable in Vercel:

```env
FRONTEND_URL=https://your-app.vercel.app
```

### 4. PostgreSQL connection issues

Use the Neon connection string and ensure it includes:

```text
?sslmode=require
```

### 5. frontend cannot reach the backend

Set:

```env
VITE_API_URL=/api
```

This is the correct same-domain production value.

---

## Recommended final setup

For this project, the recommended final configuration is:

- One Vercel project
- Frontend served on `/`
- API served on `/api`
- Neon PostgreSQL for production
- SQLite for local development only
- Existing FastAPI app imported through `api/index.py`

This keeps the application stable and requires the least change to the codebase.

---

## Final note

Do not deploy until:
- the project has been pushed to GitHub
- Vercel environment variables are configured
- Neon database is live
- the health check returns OK
- the login route works with the admin credentials

This project is already structured so that the backend code can be reused without rewriting the application or removing any features.

- [Vercel Documentation](https://vercel.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
