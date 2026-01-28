# ⚡ Windows Launcher - Cheat Sheet

## 🎯 The 30-Second Start

```
1. Install Python:    https://www.python.org/downloads/
   ✓ Check "Add to PATH"

2. Install Node.js:   https://nodejs.org/
   ✓ Check "Add to PATH"

3. Double-click:      RUN_Windows.bat

4. Login:
   Username: admin
   Password: admin123
```

That's it! 🎉

---

## 📁 File Quick Reference

| Need | Use This |
|------|----------|
| Start immediately | `RUN_Windows.bat` |
| Use PowerShell | `RUN_Windows.ps1` |
| Use Command Prompt | `python launcher.py` |
| Create .exe | `build_exe.bat` or `python build_exe.py` |
| Quick guide | `START_HERE.txt` |
| Setup instructions | `QUICK_START_WINDOWS.md` |
| Full documentation | `WINDOWS_SETUP.md` |

---

## 🚀 Three Ways to Launch

### Method 1: Batch File (⭐ Easiest)
```
Double-click: RUN_Windows.bat
```

### Method 2: PowerShell
```
Right-click: RUN_Windows.ps1
Select: Run with PowerShell
```

### Method 3: Command Prompt
```
Open Command Prompt
Type: python launcher.py
Press: Enter
```

---

## 🎯 What Happens Automatically

✅ Python and Node.js are checked  
✅ Dependencies install (first run: 1-2 min)  
✅ Backend starts (port 8000)  
✅ Frontend starts (port 3000)  
✅ Browser opens automatically  
✅ Login screen appears  

---

## 📦 Creating .exe (Optional)

### For a standalone executable:

```
Double-click: build_exe.bat
OR
Command Prompt: python build_exe.py
```

Wait 2-5 minutes → `dist\Attendance-System.exe` ready!

---

## 🆘 Quick Fixes

| Problem | Fix |
|---------|-----|
| Python not found | Install from python.org |
| Node.js not found | Install from nodejs.org |
| .bat won't run | Right-click → Run as admin |
| Port in use | Close other apps or edit launcher.py |
| Browser doesn't open | Go to http://localhost:3000 manually |

---

## 🌐 URLs

- Web App: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 🔐 Credentials

```
Username: admin
Password: admin123
```

---

## 🛑 Stopping

Close Command Prompt windows OR press Ctrl+C

---

## 📚 Documentation Order

1. START_HERE.txt → QUICK_START_WINDOWS.md → WINDOWS_SETUP.md

---

**That's everything you need! 🎉**
