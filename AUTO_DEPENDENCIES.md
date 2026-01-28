# Automatic Dependency Installation Guide

## 🚀 What's New

The Windows launchers now **automatically download and install all dependencies** without requiring manual setup!

---

## 📋 Three Ways to Install Dependencies

### Option 1: Automatic (Easiest) 🌟
Just double-click `RUN_Windows.bat` - it will:
- ✅ Check Python and Node.js installation
- ✅ Automatically install pip packages
- ✅ Automatically install npm packages
- ✅ Start both servers
- ✅ Open browser

### Option 2: Setup Script
Double-click `SETUP_DEPENDENCIES.bat` to:
- ✅ Install all dependencies
- ✅ Verify everything works
- ✅ Then you can run `RUN_Windows.bat`

### Option 3: Manual Python Setup
Run in Command Prompt:
```cmd
python setup_dependencies.py
```

---

## 🎯 Complete Flow

### First Time Setup (What Happens Automatically):

```
1. User double-clicks RUN_Windows.bat
   ↓
2. Script checks for Python installation
   ↓
3. Script checks for Node.js installation
   ↓
4. Script runs: pip install -r backend/requirements.txt
   (Installs Flask, FastAPI, SQLAlchemy, etc.)
   ↓
5. Script runs: npm install (in frontend directory)
   (Installs React, Vite, Axios, etc.)
   ↓
6. Both servers start
   ↓
7. Browser opens to http://localhost:3000
   ↓
8. Login screen ready to use!
```

### Subsequent Times:

```
1. User double-clicks RUN_Windows.bat
   ↓
2. Python/Node.js version check (instant)
   ↓
3. Dependencies check (skips if already installed)
   ↓
4. Both servers start
   ↓
5. Done!
```

---

## ⚡ Before First Run

**You still need to install Python and Node.js** (just once):

### Python Installation:
1. Go to: https://www.python.org/downloads/
2. Download Python 3.8 or later
3. **IMPORTANT**: During installation, check "Add Python to PATH"
4. Click "Install Now"

### Node.js Installation:
1. Go to: https://nodejs.org/
2. Download LTS (Long Term Support) version
3. **IMPORTANT**: During installation, check "Add to PATH"
4. Complete the installation

### After Installation:
- Close Command Prompt completely
- Reopen Command Prompt
- Now Python and Node.js will be available globally

---

## 📦 What Gets Installed

### Backend Dependencies (Python)
Installed from: `backend/requirements.txt`
- FastAPI (web framework)
- Uvicorn (ASGI server)
- SQLAlchemy (database ORM)
- python-jose (JWT tokens)
- bcrypt (password hashing)
- And more...

### Frontend Dependencies (Node.js)
Installed from: `frontend/package.json`
- React (UI framework)
- Vite (build tool)
- TypeScript (type safety)
- Axios (HTTP client)
- Tailwind CSS (styling)
- And more...

---

## 🔧 Manual Installation (If Needed)

If automatic installation fails, you can install manually:

### Backend:
```cmd
cd backend
pip install -r requirements.txt
```

### Frontend:
```cmd
cd frontend
npm install
```

---

## ✅ Verification

To check if everything is installed correctly:

### Check Python dependencies:
```cmd
cd backend
pip list
```
(Should show all packages from requirements.txt)

### Check Node.js dependencies:
```cmd
cd frontend
npm list
```
(Should show installed packages)

---

## 🆘 Troubleshooting

### "Python is not installed"
- Install from https://www.python.org/downloads/
- During installation, check "Add Python to PATH"
- Restart Command Prompt completely

### "Node.js is not installed"
- Install from https://nodejs.org/
- During installation, check "Add to PATH"
- Restart Command Prompt completely

### "pip: command not found"
- Usually means Python wasn't added to PATH
- Reinstall Python with "Add Python to PATH" checked
- Restart Command Prompt

### "npm: command not found"
- Usually means Node.js wasn't added to PATH
- Reinstall Node.js with "Add to PATH" checked
- Restart Command Prompt

### "npm ERR! code EACCES"
- Permission issue
- Run Command Prompt as Administrator
- Try again

### Dependencies install but app doesn't start
- Run `SETUP_DEPENDENCIES.bat` first
- Check error messages in Command Prompt window
- See WINDOWS_SETUP.md for more help

---

## 📊 Files for Dependency Management

| File | Purpose | Use When |
|------|---------|----------|
| `RUN_Windows.bat` | Start app (auto-installs deps) | Running application |
| `SETUP_DEPENDENCIES.bat` | Install deps only | Need to install first |
| `setup_dependencies.py` | Detailed setup script | Troubleshooting |
| `backend/requirements.txt` | Python dependencies list | Reference |
| `frontend/package.json` | Node.js dependencies list | Reference |

---

## 🎯 Quick Start with Auto Dependencies

### Step 1: Install Python & Node.js (One-time only)
- Python: https://www.python.org/downloads/
- Node.js: https://nodejs.org/

### Step 2: Double-click RUN_Windows.bat
- Dependencies install automatically
- Servers start automatically
- Browser opens automatically

### Step 3: Done! 🎉
- Login with admin/admin123
- Start using the system

---

## 💾 Where Dependencies Go

### Python packages:
```
C:\Users\YourUsername\AppData\Local\Programs\Python\Python310\Lib\site-packages\
```

### Node.js packages:
```
YourProjectFolder\frontend\node_modules\
```

---

## 🔄 Updating Dependencies

To update all dependencies to latest versions:

### Python:
```cmd
cd backend
pip install --upgrade -r requirements.txt
```

### Node.js:
```cmd
cd frontend
npm update
```

---

## 🚀 You're All Set!

1. Install Python & Node.js
2. Double-click `RUN_Windows.bat`
3. Everything else is automatic!

**Your Attendance System is ready to use!** 🎉

For questions, see the other documentation files (QUICK_START_WINDOWS.md, WINDOWS_SETUP.md, etc.)
