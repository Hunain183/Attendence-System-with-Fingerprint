# Quick Troubleshooting Guide

## Problem: Backend Not Running (ECONNREFUSED 127.0.0.1:8000)

If you see "Error: connect ECONNREFUSED" in the browser console, the backend server isn't running.

### Solution: Test Backend Directly

**Step 1:** Double-click `TEST_BACKEND.bat`

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

If you see this → Backend is working! ✓

If you see an error → The error message will tell you what's wrong.

### Step 2: Test Frontend Separately

**Double-click `TEST_FRONTEND.bat`

You should see:
```
VITE v5.4.21 ready in XXX ms
Local: http://localhost:3000/
```

If you see this → Frontend is working! ✓

### Step 3: Test Both Together

Once both work separately:

**Double-click `RUN_SIMPLE.bat`**

This will:
1. Start Backend in Window 1
2. Start Frontend in Window 2
3. Open browser to http://localhost:3000

---

## Common Issues & Solutions

### Issue 1: "Python is not installed"
**Solution:**
- Install Python from https://www.python.org/downloads/
- CHECK "Add Python to PATH" during installation
- Restart Command Prompt completely

### Issue 2: "Node.js is not installed"
**Solution:**
- Install Node.js from https://nodejs.org/
- CHECK "Add to PATH" during installation
- Restart Command Prompt completely

### Issue 3: Backend crashes with error about Rust
**Solution:**
- Some Python packages need Microsoft C++ Build Tools
- Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/
- Install it and restart
- Then try again

### Issue 4: "Port 8000 already in use"
**Solution:**
- Find what's using port 8000:
  ```
  netstat -ano | findstr :8000
  ```
- Stop that application
- Then run again

### Issue 5: "Port 3000 already in use"
**Solution:**
- Same as above but use `:3000`

### Issue 6: npm ERR! code EACCES (permission denied)
**Solution:**
- Right-click Command Prompt → Run as Administrator
- Then run the batch file again

### Issue 7: Login fails with "Invalid username or password"
**Solution:**
- Make sure backend is running (check TEST_BACKEND.bat)
- Default credentials:
  - Username: `admin`
  - Password: `admin123`
- These are case-sensitive

---

## Best Way to Start

### For Beginners:
1. Run `TEST_BACKEND.bat` - Make sure it starts
2. Close that window
3. Run `TEST_FRONTEND.bat` - Make sure it starts
4. Close that window
5. Run `RUN_SIMPLE.bat` - Now both should work together

### For Experienced Users:
- Just run `RUN_SIMPLE.bat`

---

## What Each File Does

| File | Purpose |
|------|---------|
| `RUN_SIMPLE.bat` | Best option - starts both servers |
| `TEST_BACKEND.bat` | Test if backend starts alone |
| `TEST_FRONTEND.bat` | Test if frontend starts alone |
| `CHECK_SETUP.bat` | Verify everything is installed |
| `SETUP_DEPENDENCIES.bat` | Install/update dependencies |

---

## Terminal Windows Explanation

When you run `RUN_SIMPLE.bat`, you'll see:

### Window 1: "Backend"
- Shows backend startup messages
- Should show "Uvicorn running on http://127.0.0.1:8000"
- Keep this open

### Window 2: "Frontend"
- Shows frontend startup messages
- Should show "VITE vX.X.X ready in XXX ms"
- Keep this open

### Browser Window
- Opens to http://localhost:3000
- Shows login screen

---

## If Backend Crashes Immediately

1. Open `backend\.env` file
2. Check that the file has these values:
```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
DATABASE_URL=sqlite:///./attendance.db
```

3. If the .env file is missing, create it with the above values
4. Try `TEST_BACKEND.bat` again

---

## Default Login Credentials

```
Username: admin
Password: admin123
```

These are hardcoded in the `.env` file.

---

## Need More Help?

1. Check the error message in the terminal window
2. Try the solutions above based on the error
3. Make sure Python and Node.js are properly installed
4. Run `CHECK_SETUP.bat` to verify everything

---

## Quick Commands (for Command Prompt)

Check if Python is installed:
```
python --version
```

Check if Node.js is installed:
```
node --version
```

Check if port 8000 is available:
```
netstat -ano | findstr :8000
```

Check if port 3000 is available:
```
netstat -ano | findstr :3000
```

---

**Try `RUN_SIMPLE.bat` first - it's the most reliable!** 🚀
