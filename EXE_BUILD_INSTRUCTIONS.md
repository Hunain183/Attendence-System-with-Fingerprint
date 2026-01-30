# EXE Build Instructions

## Issue Fixed
The .exe was opening on port 8000 but not serving the frontend correctly. This has been fixed.

## What Was Changed

### 1. **backend/main.py** - Fixed Static File Serving
- Reorganized route handlers to properly serve frontend
- Root route (`/`) now serves `index.html` when static files exist
- Catch-all route (`/{full_path:path}`) handles SPA routing
- All API routes remain functional under `/admin/`, `/device/`, etc.

### 2. **BUILD_EXE.bat** - Improved Error Handling
- Added try-except error handling to launcher
- Keeps console window open to show errors
- Includes database file in the build
- Added `--console` flag for debugging
- Shows detailed error messages and traceback

## How to Build the EXE

1. **Make sure you have the latest code:**
   ```bash
   git pull
   ```

2. **Run the build script:**
   ```
   BUILD_EXE.bat
   ```

3. **The script will:**
   - Install PyInstaller
   - Migrate database to latest schema
   - Build frontend (React/Vite)
   - Copy frontend to backend/static
   - Create launcher with error handling
   - Build single .exe file with PyInstaller
   - Clean up temporary files

4. **Result:**
   - `AttendanceSystem.exe` will be created in the root folder
   - Double-click to run
   - Browser opens automatically at http://localhost:8000
   - Login with: `admin` / `admin123`

## What's Included in the EXE

✅ Python backend (FastAPI)  
✅ Frontend (React built files)  
✅ Database (attendance.db)  
✅ All Python dependencies  
✅ Static assets (CSS, JS)  
✅ All backend modules (auth, models, routers, etc.)  

## Port Information

- **Development Mode:**
  - Frontend: http://localhost:3000 (Vite dev server)
  - Backend: http://localhost:8000 (FastAPI)

- **EXE/Production Mode:**
  - Single server: http://localhost:8000 (FastAPI serves both API and frontend)

## Troubleshooting

### EXE crashes immediately
- The console window now stays open with error details
- Check the error message displayed
- Common issues:
  - Port 8000 already in use
  - Missing database file
  - Antivirus blocking

### Frontend not loading
- Make sure frontend was built successfully during BUILD_EXE.bat
- Check that `backend/static` folder contains the built files
- Verify `index.html` exists in `backend/static/`

### Database errors
- The migration runs automatically during build
- If issues persist, delete `attendance.db` and rebuild

## Important Notes

⚠️ **Console Window**: The .exe runs with a console window visible. This is intentional for debugging. If you want a windowless version, remove `--console` from BUILD_EXE.bat line 155 and rebuild.

⚠️ **Antivirus**: Some antivirus software may flag PyInstaller executables. Add an exception if needed.

⚠️ **Distribution**: The .exe is standalone and can be distributed to other Windows PCs without Python/Node.js installed.

## Development vs Production

| Feature | Development | Production (EXE) |
|---------|-------------|------------------|
| Frontend Port | 3000 | 8000 |
| Backend Port | 8000 | 8000 |
| API Prefix | `/api` | None |
| Static Files | Vite dev server | FastAPI serves |
| Hot Reload | ✅ Yes | ❌ No |
| Database | Same file | Bundled in exe |
