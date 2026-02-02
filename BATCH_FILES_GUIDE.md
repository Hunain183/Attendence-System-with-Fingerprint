# Batch Files Guide

## Overview
Your Attendance System comes with three batch files to make deployment and running easy on Windows systems.

---

## 1. **INSTALL_AND_RUN.bat** - Auto Setup & Launch
**Purpose:** One-click setup and start the application

### What it does:
- ✅ Checks for Python 3.11/3.12 (auto-downloads if missing)
- ✅ Checks for Node.js 20 (auto-downloads if missing)
- ✅ Installs all Python dependencies
- ✅ Installs all npm packages
- ✅ Runs database migration
- ✅ Starts Backend server (Port 8000)
- ✅ Starts Frontend server (Port 3000)
- ✅ Opens browser automatically

### How to use:
```
Double-click: INSTALL_AND_RUN.bat
```

**Default Login:**
- Username: `admin`
- Password: `admin123`

---

## 2. **BUILD_EXE.bat** - Create Standalone Executable
**Purpose:** Compile application into a single .exe file (no Python/Node.js required to run)

### What it does:
- ✅ Migrates database to latest schema
- ✅ Builds frontend production version
- ✅ Copies frontend to backend static folder
- ✅ Creates launcher script
- ✅ Compiles everything with PyInstaller
- ✅ Generates `AttendanceSystem.exe` in root directory

### How to use:
```
Double-click: BUILD_EXE.bat
```

**Time:** ~5-10 minutes (first run slower due to compilation)

**Result:** 
- Creates `AttendanceSystem.exe` (~150-200 MB)
- Can be distributed to other Windows PCs
- No Python/Node.js installation required on target machines

### Running the .exe:
```
Double-click: AttendanceSystem.exe
```

---

## 3. **STOP_App.bat** - Stop Running Servers
**Purpose:** Safely shut down backend and frontend servers

### What it does:
- ✅ Kills backend server (Port 8000)
- ✅ Kills frontend server (Port 3000)
- ✅ Cleans up any stray processes

### How to use:
```
Double-click: STOP_App.bat
```

---

## Recommended Workflow

### For Development:
```
1. Run: INSTALL_AND_RUN.bat
2. Make code changes
3. Reload browser to see changes (frontend auto-refreshes, backend auto-reloads)
4. Run: STOP_App.bat (when done)
```

### For Distribution:
```
1. Run: BUILD_EXE.bat
2. Wait for completion
3. Share the generated AttendanceSystem.exe
4. Users can run it directly - no setup needed!
```

---

## Troubleshooting

### BUILD_EXE.bat fails
- Ensure INSTALL_AND_RUN.bat has been run first
- Check internet connection (PyInstaller may need downloads)
- Run as Administrator

### Port already in use
- Run `STOP_App.bat` to kill existing processes
- Try using `netstat -ano | findstr :8000` to find what's using the port

### npm install fails
- Delete `frontend\node_modules` folder
- Run `INSTALL_AND_RUN.bat` again

### Python not found
- The script auto-downloads Python 3.11.9
- If manual install needed: https://www.python.org/downloads/

---

## System Requirements

### For Running EXE:
- Windows 10+ 
- No Python or Node.js needed
- ~300 MB disk space
- Port 8000 and 3000 available

### For Development (INSTALL_AND_RUN.bat):
- Windows 10+
- Internet connection (for initial downloads)
- ~1 GB disk space
- Port 8000 and 3000 available
- Admin rights (optional, for auto-install)

---

## Files Generated

### After INSTALL_AND_RUN.bat:
- `backend/attendance.db` - SQLite database
- `backend/static/` - Built frontend files
- `backend/__pycache__/` - Python cache

### After BUILD_EXE.bat:
- `AttendanceSystem.exe` - Standalone executable (~150-200 MB)
- `build/` folder - Temporary build files (auto-cleaned)

---

## Features Included

✅ Employee Management (with DOB, References, Shift)  
✅ Attendance Tracking  
✅ Manual Attendance Marking (Admin)  
✅ Salary Management & Calculation  
✅ Salary Reports (with filters and CSV export)  
✅ User Management  
✅ JWT Authentication  
✅ Role-based Access Control  
✅ Shift-based Overtime Calculation  

---

## Support

All servers run in separate windows, making debugging easier. Keep windows open while using the application.

Happy deploying! 🚀
