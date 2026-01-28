# 📋 Windows Launcher - File Guide

## 🎯 Which File Should I Use?

### **Just Want to Start Immediately?**
→ **Double-click `RUN_Windows.bat`** and you're done! ✨

---

## 📂 All Available Launcher Files

| File | Type | Purpose | How to Use | Best For |
|------|------|---------|-----------|----------|
| **RUN_Windows.bat** | Batch Script | Start both servers + browser | Double-click | ⭐ Most users |
| **RUN_Windows.ps1** | PowerShell | Start both servers + browser | Right-click → Run with PowerShell | PowerShell users |
| **launcher.py** | Python Script | Start both servers + browser | `python launcher.py` in terminal | Developers |
| **build_exe.py** | Python Script | Create standalone .exe | `python build_exe.py` | Creating executables |
| **build_exe.bat** | Batch Script | Create standalone .exe | Double-click | Creating executables |

---

## 📚 Documentation Files

| File | Purpose | Reading Time |
|------|---------|--------------|
| **START_HERE.txt** | Quick visual guide | 2 min |
| **QUICK_START_WINDOWS.md** | Quick reference with 3 ways to run | 5 min |
| **WINDOWS_SETUP.md** | Complete detailed setup guide | 10 min |
| **WINDOWS_LAUNCHER_README.md** | Technical documentation | 8 min |

---

## 🚀 Quick Navigation Guide

### **Scenario 1: "I just want to run it now"**
1. Install Python (https://www.python.org)
2. Install Node.js (https://nodejs.org)
3. Double-click `RUN_Windows.bat`
4. Done! ✅

### **Scenario 2: "I want detailed instructions"**
→ Read `QUICK_START_WINDOWS.md` (5 minutes)

### **Scenario 3: "I need complete documentation"**
→ Read `WINDOWS_SETUP.md` (comprehensive guide)

### **Scenario 4: "I want to create a standalone .exe file"**
→ Run `build_exe.bat` or `python build_exe.py`
→ Wait 2-5 minutes
→ Find your .exe at: `dist\Attendance-System.exe`

### **Scenario 5: "I use PowerShell"**
→ Right-click `RUN_Windows.ps1` → "Run with PowerShell"

### **Scenario 6: "I'm a developer/prefer command line"**
→ Open terminal
→ Run: `python launcher.py`

---

## 🔧 Prerequisites

Before using any launcher, you need:

1. **Python 3.8+**
   - Download: https://www.python.org/downloads/
   - ✅ Important: Check "Add Python to PATH" during installation
   
2. **Node.js 16+**
   - Download: https://nodejs.org/
   - ✅ Important: Check "Add to PATH" during installation

3. **Windows 10 or later**

---

## 🎯 What Each Launcher Does

### All launchers perform the same steps:

1. ✅ Check Python and Node.js installation
2. ✅ Install Python dependencies (pip install requirements.txt)
3. ✅ Install Node.js dependencies (npm install)
4. ✅ Start Backend Server (port 8000)
5. ✅ Start Frontend Server (port 3000)
6. ✅ Wait for both to be ready
7. ✅ Open browser to http://localhost:3000
8. ✅ Keep servers running until you close the windows

**Difference:** Just different ways to run the same process

---

## 🎯 Which Documentation to Read?

```
START_HERE.txt
    ↓
QUICK_START_WINDOWS.md
    ↓
WINDOWS_SETUP.md (if you need more details)
```

---

## 💾 Creating a Standalone .exe

Want to share the application with others (without requiring Python/Node.js)?

### Step 1: Build the .exe
- **Option A:** Double-click `build_exe.bat`
- **Option B:** Run `python build_exe.py` in Command Prompt

### Step 2: Wait for completion
- Build takes 2-5 minutes
- You'll see a PyInstaller window

### Step 3: Find your .exe
- Location: `dist\Attendance-System.exe`
- Size: ~300-500MB

### Step 4: Share it!
- Copy the .exe file to any Windows machine
- No Python/Node.js needed on target machine
- Just double-click to run!

---

## 🛟 Troubleshooting Quick Links

| Problem | Solution |
|---------|----------|
| Python not found | Install from https://www.python.org |
| Node.js not found | Install from https://nodejs.org |
| .bat file won't run | Right-click → "Run as administrator" |
| Port in use | Close other apps or edit `launcher.py` |
| Browser doesn't open | Manually visit http://localhost:3000 |

---

## 📱 Default Credentials

```
Username: admin
Password: admin123
```

---

## 🌐 Access Points

After starting:

- **Web Application:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs

---

## 🛑 Stopping Services

**Option 1 (Easiest):**
- Close the Command Prompt windows

**Option 2:**
- Press `Ctrl+C` in the launcher window

Both will gracefully shutdown both servers.

---

## ✨ What's New?

All these files are ready to use:

- ✅ Python launcher (`launcher.py`)
- ✅ Batch file launcher (`RUN_Windows.bat`)
- ✅ PowerShell launcher (`RUN_Windows.ps1`)
- ✅ .exe builders (`build_exe.py`, `build_exe.bat`)
- ✅ Comprehensive documentation (3 files)
- ✅ Quick start guide (`START_HERE.txt`)

You're all set! Just choose the launcher that works for you and start using your Attendance System! 🎉

---

## 🎓 Recommended Reading Order

1. **First time?** → Read `START_HERE.txt` (2 min)
2. **Want more details?** → Read `QUICK_START_WINDOWS.md` (5 min)
3. **Need everything explained?** → Read `WINDOWS_SETUP.md` (10 min)
4. **Creating .exe?** → Follow "Creating Standalone .exe" section above

---

**Ready? Just double-click `RUN_Windows.bat` and enjoy! 🚀**
