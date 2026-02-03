# Windows Deployment Guide - Attendance System

## Complete Setup and Executable Build Instructions

---

## 📦 Batch Files Overview

### 1. **INSTALL_AND_RUN.bat** (Quick Start)
**Purpose:** Auto-installs everything and runs the application

**What it does:**
- ✅ Auto-downloads Python 3.11 if not installed
- ✅ Auto-downloads Node.js 20 LTS if not installed
- ✅ Installs all Python dependencies
- ✅ Installs all Node.js dependencies
- ✅ Migrates database to latest schema
- ✅ Starts both backend and frontend servers
- ✅ Opens browser automatically to http://localhost:3001

**Usage:**
```cmd
Double-click INSTALL_AND_RUN.bat
```

**First Time Run:** Takes 5-10 minutes (downloads Python & Node.js)
**Subsequent Runs:** Takes 30-60 seconds

---

### 2. **START.bat** (Quick Launch)
**Purpose:** Fast startup (assumes dependencies already installed)

**What it does:**
- ✅ Starts backend server (port 8000)
- ✅ Starts frontend server (port 3001)
- ✅ Opens browser automatically

**Usage:**
```cmd
Double-click START.bat
```

**Requirements:** Must run INSTALL_AND_RUN.bat at least once first
**Startup Time:** 5-10 seconds

---

### 3. **STOP_App.bat** (Shutdown)
**Purpose:** Cleanly stops all running servers

**What it does:**
- ✅ Kills all Python processes (backend)
- ✅ Kills all Node.js processes (frontend)
- ✅ Frees ports 8000 and 3000/3001

**Usage:**
```cmd
Double-click STOP_App.bat
```

**When to use:**
- Before running BUILD_EXE.bat
- When changing code
- Before system shutdown

---

### 4. **BUILD_EXE.bat** ⭐ (Create Standalone Executable)
**Purpose:** Builds a single-file Windows executable

**What it does:**
- ✅ Installs PyInstaller
- ✅ Migrates database to latest schema
- ✅ Builds frontend React app (production)
- ✅ Copies frontend to backend/static folder
- ✅ Compiles Python backend to .exe
- ✅ Bundles everything into one executable

**Output Location:**
```
backend/dist/AttendanceSystem.exe
```

**Usage:**
```cmd
1. Double-click BUILD_EXE.bat
2. Wait 5-10 minutes for compilation
3. Find AttendanceSystem.exe in backend/dist/
```

**File Size:** ~100-150 MB (includes Python runtime + all dependencies)

---

## 🚀 Quick Start Guide

### For Development (First Time):
```cmd
1. Run INSTALL_AND_RUN.bat
2. Wait for installation (5-10 minutes)
3. Browser opens automatically
4. Login with admin/admin123
```

### For Development (Daily Use):
```cmd
1. Run START.bat
2. Browser opens automatically
3. Start coding!
```

### To Create Executable:
```cmd
1. Run STOP_App.bat (stop running servers)
2. Run BUILD_EXE.bat (wait 5-10 minutes)
3. Find AttendanceSystem.exe in backend/dist/
4. Copy .exe to deployment location
5. Double-click .exe to run!
```

---

## 📋 BUILD_EXE.bat - Detailed Steps

The BUILD_EXE.bat performs these operations:

### Step 1/5: Check Python & Install PyInstaller
- Verifies Python 3.11 or 3.12 is installed
- Installs PyInstaller for creating executable
- **Time:** 10-30 seconds

### Step 2/5: Migrate Database
- Runs migrate_database.py
- Adds new employee fields (HOD, Sub Dept, Salary, etc.)
- Creates salaries table if missing
- **Time:** 1-2 seconds

### Step 3/5: Build Frontend
- Checks if node_modules exists
- Runs `npm install` if needed
- Compiles TypeScript React app to production build
- Creates minified, optimized files
- **Time:** 1-3 minutes (or 5-10 if installing packages)

### Step 4/5: Copy Frontend to Backend
- Deletes old backend/static folder
- Copies frontend/dist/ to backend/static/
- Verifies index.html exists
- **Time:** 1-2 seconds

### Step 5/5: Build Executable with PyInstaller
- Compiles main.py to standalone .exe
- Includes all Python dependencies
- Bundles static files (frontend)
- Creates single-file executable
- **Time:** 3-5 minutes

**Total Build Time:** 5-10 minutes

---

## 📁 Output Structure

After BUILD_EXE.bat completes:

```
backend/
├── dist/
│   └── AttendanceSystem.exe  ⭐ YOUR EXECUTABLE
├── build/               (temporary, can delete)
└── AttendanceSystem.spec (PyInstaller config)

frontend/
└── dist/                (production build, can delete)
```

---

## 🎯 Running the Executable

### On Same Computer:
```cmd
1. Navigate to backend/dist/
2. Double-click AttendanceSystem.exe
3. Browser opens to http://localhost:8000
4. Login with admin/admin123
```

### On Different Computer:
```cmd
1. Copy AttendanceSystem.exe to new computer
2. Copy attendance.db (if you want existing data)
3. Double-click AttendanceSystem.exe
4. Browser opens automatically
```

**Important Notes:**
- ✅ No Python installation needed on target computer
- ✅ No Node.js installation needed
- ✅ All dependencies bundled in .exe
- ✅ Database (attendance.db) created on first run
- ✅ Default admin user created automatically

---

## 🔧 Troubleshooting BUILD_EXE.bat

### Error: "Python is not installed"
**Solution:**
```cmd
Run INSTALL_AND_RUN.bat first
```

### Error: "Frontend build failed"
**Solution:**
```cmd
cd frontend
npm install
npm run build
```

### Error: "PyInstaller failed"
**Solution:**
```cmd
cd backend
pip install pyinstaller --upgrade
python -m PyInstaller --version
```

### Error: "Cannot find static files"
**Solution:**
```cmd
Verify frontend/dist/ folder exists after npm run build
Check backend/static/ folder has index.html
```

---

## 📊 Application Features

The bundled executable includes:

### Backend Features:
- ✅ FastAPI REST API (port 8000)
- ✅ SQLite database with all migrations
- ✅ JWT authentication
- ✅ Role-based access (primary_admin, secondary_admin, user)
- ✅ Employee management with all new fields
- ✅ Attendance tracking with overtime calculation
- ✅ Salary management system
- ✅ Unified reports (Attendance, Salary, Employee)

### Frontend Features:
- ✅ React 18 with TypeScript
- ✅ Vite production build (optimized)
- ✅ Tailwind CSS styling
- ✅ Responsive design
- ✅ Print functionality for all reports
- ✅ Real-time validation
- ✅ Tabbed reports interface

### New Employee Fields:
- ✅ HOD (Head of Department)
- ✅ Sub Department
- ✅ Monthly Salary
- ✅ Rate Per Day
- ✅ Rest Day
- ✅ Quit Date
- ✅ Remarks
- ✅ Previous Employment (Employer, Address, Designation, Period)

---

## 🎨 Production Build Optimizations

The BUILD_EXE.bat creates a production-optimized build:

### Frontend Optimizations:
- ✅ Minified JavaScript/CSS
- ✅ Tree-shaking (removes unused code)
- ✅ Code splitting
- ✅ Asset optimization
- ✅ Gzip compression ready

### Backend Optimizations:
- ✅ Single-file executable
- ✅ No external dependencies
- ✅ Embedded Python runtime
- ✅ Fast startup time
- ✅ Small footprint (~100-150 MB)

---

## 📝 Default Credentials

**Admin Login:**
- Username: `admin`
- Password: `admin123`
- Role: `primary_admin`

**Change Password:**
1. Login as admin
2. Go to Users → Edit admin user
3. Update password

---

## 🔒 Security Notes

For production deployment:

1. **Change Default Password:**
   ```
   Login → Users → Edit admin → Change password
   ```

2. **Update JWT Secret:**
   ```
   Edit backend/utils/config.py
   Change SECRET_KEY to a secure random string
   ```

3. **Enable HTTPS:**
   ```
   Use a reverse proxy (nginx, IIS)
   ```

4. **Database Backups:**
   ```
   Regularly backup attendance.db file
   ```

---

## 💾 Database Management

### Backup Database:
```cmd
Copy attendance.db to safe location
```

### Restore Database:
```cmd
Stop application
Replace attendance.db with backup
Restart application
```

### Reset Database:
```cmd
Delete attendance.db
Restart application (creates new DB with admin user)
```

---

## 📞 Support Information

### File Locations:
- Executable: `backend/dist/AttendanceSystem.exe`
- Database: `backend/attendance.db`
- Logs: Terminal window output
- Config: `backend/utils/config.py`

### Common URLs:
- Application: http://localhost:8000 (when running .exe)
- API Docs: http://localhost:8000/docs
- Development Frontend: http://localhost:3000
- Development Backend: http://localhost:8000

---

## ✅ Checklist Before Building EXE

- [ ] All servers stopped (run STOP_App.bat)
- [ ] Database migrated (check backend/attendance.db)
- [ ] Frontend builds successfully (`npm run build` works)
- [ ] Backend runs without errors
- [ ] All new features tested
- [ ] Default admin credentials work
- [ ] Port 8000 is available

---

## 🎉 Success Indicators

After running BUILD_EXE.bat, you should see:

```
✓ PyInstaller ready
✓ Database migrated
✓ Frontend built
✓ Static files copied
✓ Executable created successfully

Output: backend\dist\AttendanceSystem.exe
Size: ~100-150 MB
```

**Test the .exe:**
```cmd
cd backend\dist
AttendanceSystem.exe
```

Browser should open automatically to login page!

---

**Last Updated:** February 3, 2026
**System Version:** 2.0 (with Unified Reports & New Employee Fields)
