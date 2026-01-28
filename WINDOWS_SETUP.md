# Windows Launcher - Complete Setup Instructions

## 📦 What's Included

I've created multiple ways to run your Attendance System on Windows. Choose the one that fits your needs:

### Files Created:

1. **`RUN_Windows.bat`** ⭐ **START HERE**
   - Simple double-click batch file
   - Automatically installs dependencies
   - Starts both servers and opens browser
   - **Best for:** Most Windows users

2. **`RUN_Windows.ps1`**
   - PowerShell script version
   - Same functionality as .bat
   - **Best for:** PowerShell users or modern Windows

3. **`launcher.py`**
   - Python script version
   - Can be run from Command Prompt
   - **Best for:** Python developers

4. **`build_exe.py` & `build_exe.bat`**
   - Creates standalone .exe executable
   - No Python/Node.js needed on target machine
   - **Best for:** Sharing with others who don't have dev tools

5. **Documentation:**
   - `QUICK_START_WINDOWS.md` - Quick reference guide
   - `WINDOWS_LAUNCHER_README.md` - Detailed documentation

---

## 🚀 Quick Start (3 Steps)

### Step 1: Install Prerequisites
- **Python 3.8+**: https://www.python.org/downloads/
  - ✅ Check "Add Python to PATH" during installation
  - Restart Command Prompt after installation
  
- **Node.js 16+**: https://nodejs.org/
  - ✅ Check "Add to PATH" during installation
  - Restart Command Prompt after installation

### Step 2: Run the Launcher
**Option A (Easiest):**
- Just **double-click** `RUN_Windows.bat` in the project folder
- Everything starts automatically!

**Option B (PowerShell):**
- Right-click `RUN_Windows.ps1` → "Run with PowerShell"

**Option C (Command Prompt):**
- Open Command Prompt in project folder
- Type: `python launcher.py`
- Press Enter

### Step 3: Use the Application
- Browser opens automatically to http://localhost:3000
- Login with:
  - Username: `admin`
  - Password: `admin123`

---

## 🔨 Creating a Standalone .exe (Optional)

If you want to create a single .exe file that works on any Windows machine without Python/Node.js:

1. Open **Command Prompt** in the project folder
2. Run: `python build_exe.py`
3. Wait 2-5 minutes for build to complete
4. Find your .exe at: `dist\Attendance-System.exe`
5. Share this .exe file - it works standalone on any Windows!

**Alternative:** Double-click `build_exe.bat` to build the .exe

---

## ✅ What You Should See

After starting, three windows should appear:

1. **Command Prompt #1**: Backend Server
   - Shows: "Uvicorn running on http://127.0.0.1:8000"
   
2. **Command Prompt #2**: Frontend Server
   - Shows: "Local: http://localhost:3000"
   
3. **Browser Window**: Attendance System Login Page
   - Ready to login!

---

## 🎯 How It Works

The launcher script automatically:

```
1. Checks if Python and Node.js are installed
2. Installs Python dependencies (pip install requirements.txt)
3. Installs Node.js dependencies (npm install)
4. Starts Backend Server on port 8000
5. Waits for backend to be ready
6. Starts Frontend Server on port 3000
7. Waits for frontend to be ready
8. Opens browser to http://localhost:3000
9. Shows login screen
10. Keeps both servers running until you close the windows
```

---

## 🆘 Troubleshooting

### Issue: "Python is not installed"
**Solution:** 
- Install Python from https://www.python.org
- During installation, check the box "Add Python to PATH"
- Restart your terminal/Command Prompt

### Issue: "Node.js is not installed"
**Solution:**
- Install Node.js from https://nodejs.org
- During installation, check "Add to PATH"
- Restart your terminal/Command Prompt

### Issue: Batch file won't run
**Solution:**
- Try running as Administrator (right-click → "Run as administrator")
- Or use PowerShell script instead: `RUN_Windows.ps1`

### Issue: "Port 8000 in use"
**Solution:**
- Another app is using port 8000
- Either close that app, or edit `launcher.py`:
  - Change `"8000"` to another port like `"8001"`

### Issue: "Port 3000 in use"
**Solution:**
- Another app is using port 3000
- Edit `launcher.py`:
  - Change `"3000"` to another port like `"3001"`

### Issue: Browser doesn't open
**Solution:**
- Manually go to http://localhost:3000 in your browser
- If that doesn't work, check that both servers are running

### Issue: "Access denied" when running .bat
**Solution:**
- Right-click `RUN_Windows.bat` → "Run as administrator"

---

## 📋 Default Credentials

```
Username: admin
Password: admin123
```

This is the primary admin account. After login, you can:
- Register new users
- Approve pending users
- Manage employees
- View attendance reports
- Mark and update attendance
- Promote/demote users to secondary admin

---

## 🔧 Configuration

### Environment Variables
The launcher automatically sets:
- `VITE_API_URL=/api` (frontend proxy)
- Backend listens on `127.0.0.1:8000`
- Frontend listens on `127.0.0.1:3000`

### Changing Ports
Edit `launcher.py` around lines 76-78 and 102-103 to use different ports.

### First Run
First startup may take longer (1-2 minutes) because it installs dependencies.

---

## 🛑 Stopping the Service

The simplest way: **Close the Command Prompt windows**

Both servers will stop automatically.

Alternatively:
- Press `Ctrl+C` in the main launcher window to gracefully shutdown

---

## 💾 File Structure Explanation

```
Your Project Folder/
├── RUN_Windows.bat              ← DOUBLE-CLICK THIS (easiest start!)
├── RUN_Windows.ps1              ← PowerShell alternative
├── launcher.py                  ← Python script
├── build_exe.py                 ← Create standalone .exe
├── build_exe.bat                ← .exe builder (batch version)
├── QUICK_START_WINDOWS.md       ← Quick reference
├── WINDOWS_LAUNCHER_README.md   ← Full documentation
├── THIS_FILE.md                 ← Complete setup guide
│
├── backend/                     ← Backend API (FastAPI)
│   ├── main.py
│   ├── requirements.txt
│   └── ... (other backend files)
│
├── frontend/                    ← Frontend Web App (React)
│   ├── package.json
│   ├── src/
│   └── ... (other frontend files)
│
└── dist/                        ← Created after building .exe
    └── Attendance-System.exe    ← Your standalone executable
```

---

## 🌐 Accessing the Application

After starting, the application is available at:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (Swagger UI)

---

## 🚀 Deployment to Production

For production deployment (not using these dev scripts):
- See the main project README
- Consider using Docker or a deployment service
- Use environment variables for configuration
- Set up HTTPS/SSL certificates

---

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Look at Command Prompt error messages
3. Open Command Prompt and run: `python launcher.py`
4. Check browser console (F12) for JavaScript errors

---

## ✨ Features Available

Once logged in, you can:

- ✅ Register new employees
- ✅ Mark time in/out for attendance
- ✅ View attendance reports
- ✅ Manage user accounts (admin only)
- ✅ Promote users to secondary admin
- ✅ Update completed attendance records
- ✅ Export attendance data

---

**You're all set! Double-click `RUN_Windows.bat` and start using your Attendance System! 🎉**

For more details, see `QUICK_START_WINDOWS.md` or `WINDOWS_LAUNCHER_README.md`.
