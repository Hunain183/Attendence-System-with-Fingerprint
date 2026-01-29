# Windows Launcher - Final Setup

## 🚀 Quick Start

### Just Double-Click: `RUN_SIMPLE.bat`

That's it! The launcher will:
1. Check Python and Node.js
2. Install dependencies
3. Start backend server (port 8000)
4. Start frontend server (port 3000)
5. Open browser automatically
6. Show login screen

### Login Credentials
```
Username: admin
Password: admin123
```

---

## 📂 Essential Files

| File | Purpose |
|------|---------|
| **RUN_SIMPLE.bat** | ⭐ Main launcher - use this! |
| **launcher.py** | Alternative: `python launcher.py` |
| **SETUP_DEPENDENCIES.bat** | Install dependencies only |
| **setup_dependencies.py** | Python dependency installer |
| **build_exe.bat** | Create standalone .exe file |
| **build_exe.py** | Python .exe builder |

---

## 🔧 If Something Goes Wrong

### Check the Console Windows
When you run `RUN_SIMPLE.bat`, two console windows open:
- **Backend** window - Shows backend status
- **Frontend** window - Shows frontend status

Error messages appear in these windows.

### Common Issues

**Error: "Python not found"**
- Install Python from https://www.python.org
- Check "Add Python to PATH" during installation
- Restart Command Prompt

**Error: "Node.js not found"**
- Install Node.js from https://nodejs.org
- Check "Add to PATH" during installation
- Restart Command Prompt

**Error: "Port 8000 already in use"**
- Close other applications using port 8000
- Or run something else on a different port

**Backend won't start**
- Check the Backend console window for error messages
- Run `python launcher.py` to see detailed errors

**Frontend won't start**
- Check the Frontend console window for error messages
- Make sure Node.js and npm are installed

---

## 📦 Creating a Standalone .exe File

To create an executable that works on any Windows machine without Python/Node.js:

**Option 1 (Easiest):**
```
Double-click: build_exe.bat
```

**Option 2 (Command Prompt):**
```
python build_exe.py
```

Wait 2-5 minutes. Your .exe will be at: `dist\Attendance-System.exe`

---

## 🎯 Summary

1. **Double-click `RUN_SIMPLE.bat`**
2. **Wait for browser to open**
3. **Login with admin/admin123**
4. **Done!** ✨

That's all you need to know!

---

## 📚 For More Info

- Read the documentation files (START_HERE.txt, etc.)
- Check error messages in the console windows
- For full troubleshooting, see TROUBLESHOOTING.md
