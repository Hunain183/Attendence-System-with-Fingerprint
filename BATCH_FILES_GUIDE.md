# Batch Files Guide

## Overview
Your Attendance System comes with batch files to make deployment and running easy on Windows systems.

---

## Batch Files

### 1. **INSTALL_AND_RUN.bat** - First Time Setup
**Purpose:** One-click setup and start the application for the first time.

**What it does:**
- ✅ Checks for Python 3.11/3.12 (auto-downloads if missing)
- ✅ Checks for Node.js 20 (auto-downloads if missing)
- ✅ Installs all Python dependencies
- ✅ Installs all npm packages
- ✅ Runs database migration
- ✅ Starts Backend server (Port 8000)
- ✅ Starts Frontend server (Port 3000)
- ✅ Opens browser automatically

**How to use:**
```
Double-click: INSTALL_AND_RUN.bat
```

---

### 2. **START.bat** - Quick Start
**Purpose:** Start the application quickly (after first run).

**What it does:**
- ✅ Starts Backend server (Port 8000)
- ✅ Starts Frontend server (Port 3000)
- ✅ Opens browser automatically

**How to use:**
```
Double-click: START.bat
```

---

### 3. **STOP_App.bat** - Stop Servers
**Purpose:** Stop all running servers.

**What it does:**
- ✅ Kills backend server (Port 8000)
- ✅ Kills frontend server (Port 3000)
- ✅ Cleans up any stray processes

**How to use:**
```
Double-click: STOP_App.bat
```

---

### 4. **BUILD_EXE.bat** - Create Standalone Executable
**Purpose:** Compile application into a single .exe file.

**What it does:**
- ✅ Migrates database to latest schema
- ✅ Builds frontend production version
- ✅ Copies frontend to backend static folder
- ✅ Compiles everything with PyInstaller
- ✅ Generates `AttendanceSystem.exe`

**How to use:**
```
Double-click: BUILD_EXE.bat
```

**Time:** ~5-10 minutes

**Result:** 
- Creates `AttendanceSystem.exe` (~150-200 MB)
- Can be distributed to other Windows PCs
- No Python/Node.js installation required on target machines

---

## Default Login Credentials

```
Username: admin
Password: admin123
```

---

## Recommended Workflow

### For Development:
1. Run `INSTALL_AND_RUN.bat` (first time only)
2. Use `START.bat` for quick starts
3. Use `STOP_App.bat` to stop servers

### For Distribution:
1. Run `BUILD_EXE.bat`
2. Share `AttendanceSystem.exe`
3. Users double-click to run - no setup needed!

---

## Troubleshooting

### Port already in use
- Run `STOP_App.bat` first
- Or manually close terminal windows

### Build fails
- Make sure `INSTALL_AND_RUN.bat` was run successfully first
- Check internet connection
- Run as Administrator if needed

### Frontend not loading
- Wait a few more seconds for servers to start
- Try refreshing the browser
- Check if both terminal windows are running

---

## System Requirements

- Windows 10 or later
- ~1 GB disk space for development
- ~300 MB for standalone .exe
- Ports 8000 and 3000 available

