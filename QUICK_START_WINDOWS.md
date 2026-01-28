# 🚀 Windows Quick Start Guide

## Three Ways to Run the Attendance System on Windows

### 1️⃣ **Easiest: Double-Click Batch File** (Recommended)

1. Download/extract the project folder to Windows
2. **Double-click** `RUN_Windows.bat` in the main folder
3. Everything starts automatically! Browser opens to http://localhost:3000

**Requirements:**
- Python 3.8+ (from https://www.python.org)
- Node.js 16+ (from https://nodejs.org)
- ✨ During installation, check "Add to PATH" option

---

### 2️⃣ **Modern: PowerShell Script**

1. Right-click `RUN_Windows.ps1` → "Run with PowerShell"
   - If you get an error about execution policy, open PowerShell as Admin and run:
     ```powershell
     Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
     ```
   - Then run the script again

**Same requirements as option 1**

---

### 3️⃣ **Create Standalone .exe (No Dependencies Needed)**

This creates a single executable file that works on any Windows machine without Python/Node.js:

**On your development machine:**

1. Open Command Prompt in the project folder
2. Run:
   ```cmd
   python build_exe.py
   ```
3. Wait 2-5 minutes for build to complete
4. Your .exe will be at: `dist\Attendance-System.exe`

**To use on another Windows machine:**
- Just copy `dist\Attendance-System.exe` to the other machine
- Double-click it - everything runs automatically! No installation needed.

---

## ✅ Verification Checklist

After running, you should see:

- ✅ Backend Server console window (port 8000)
- ✅ Frontend Server console window (port 3000)
- ✅ Browser automatically opens to http://localhost:3000
- ✅ Login screen visible

### Default Login Credentials
```
Username: admin
Password: admin123
```

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Python is not installed" | Install from https://www.python.org (check "Add to PATH") |
| "Node.js is not installed" | Install from https://nodejs.org (check "Add to PATH") |
| "Access denied" running .bat | Run Command Prompt as Administrator |
| "Port 8000/3000 in use" | Close other apps using those ports, or change ports in launcher.py |
| Browser doesn't open | Manually go to http://localhost:3000 |
| Services crash immediately | Check error messages in console windows |

---

## 📂 Project Structure

```
Attendance-System/
├── RUN_Windows.bat          ← Double-click to start (easiest!)
├── RUN_Windows.ps1          ← PowerShell version
├── launcher.py              ← Python version
├── build_exe.py             ← Create .exe file
├── build_exe.bat            ← Batch version to create .exe
├── backend/                 ← FastAPI server (port 8000)
│   ├── main.py
│   ├── requirements.txt
│   └── ...
└── frontend/                ← React app (port 3000)
    ├── package.json
    ├── src/
    └── ...
```

---

## 🎯 What Happens When You Start

1. **Python checks** - Validates Python and Node.js installation
2. **Dependencies install** - Gets required packages (if first run)
3. **Backend starts** - FastAPI server on port 8000
4. **Frontend starts** - React development server on port 3000
5. **Browser opens** - Automatically navigates to http://localhost:3000
6. **Login screen** - Ready to use!

---

## 🛑 Stopping the Service

**Option 1:** Close the console windows (backend + frontend)
**Option 2:** Press `Ctrl+C` in the main launcher window

Both servers will shut down cleanly.

---

## 🔧 Advanced: Customize Ports

If ports 8000 or 3000 are already in use:

**Edit `launcher.py`:**
```python
backend_cmd = [sys.executable, "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000"]  # Change 8000
```

Then update frontend `.env`:
```env
VITE_API_URL=/api
```

---

## 💡 Tips

- Keep the launcher windows open while using the application
- Default admin can approve/manage other users
- Check browser console (F12) if something seems wrong
- Both backend and frontend have hot-reload during development
- For production deployment, see the main README

---

## 📝 System Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| OS | Windows 10 | Windows 11 |
| RAM | 2GB | 4GB+ |
| Disk Space | 200MB | 500MB+ |
| Python | 3.8+ | 3.10+ |
| Node.js | 16+ | 18+ |

---

**Need help?** Check the main project README or WINDOWS_LAUNCHER_README.md for detailed information.

**Happy coding! 🎉**
