# Windows Launcher Setup Guide

This guide explains how to create and run the Attendance System on Windows with automatic browser launch.

## Option 1: Quick Start (Recommended for Windows)

### Prerequisites
- Windows 10 or later
- Python 3.8+ installed ([Download Python](https://www.python.org/downloads/))
- Node.js 16+ installed ([Download Node.js](https://nodejs.org/))

### Steps

1. **Download or extract the project** to a folder on your Windows machine

2. **Run the launcher script**:
   - Double-click `RUN_Windows.bat` in the project root folder
   - The script will automatically:
     - Install Python and Node.js dependencies
     - Start the backend server (port 8000)
     - Start the frontend server (port 3000)
     - Open your browser to `http://localhost:3000`

3. **Login with default credentials**:
   - Username: `admin`
   - Password: `admin123`

## Option 2: Create a Standalone .exe File

If you want to create a standalone executable that doesn't require Python/Node.js on the target machine, follow these steps:

### Prerequisites
- Windows 10 or later
- Python 3.8+ installed
- Node.js 16+ installed

### Build Steps

1. **Open Command Prompt** in the project root folder

2. **Run the build script**:
   ```cmd
   python build_exe.py
   ```

3. **Wait for the build to complete** (this may take 2-5 minutes)

4. **Find your .exe file**:
   - The executable will be created at: `dist\Attendance-System.exe`

5. **Run the .exe**:
   - Double-click `Attendance-System.exe`
   - The system will automatically start and open in your browser

## Alternative: Using Python Launcher Directly

If you prefer to use Python directly:

```cmd
python launcher.py
```

This does the same thing as `RUN_Windows.bat` but directly from Command Prompt.

## Troubleshooting

### "Python is not installed"
- Install Python from https://www.python.org/downloads/
- Make sure to check "Add Python to PATH" during installation
- Restart your Command Prompt after installation

### "Node.js is not installed"
- Install Node.js from https://nodejs.org/
- Restart your Command Prompt after installation

### Port 8000 or 3000 already in use
- Close other applications using these ports
- Or modify the launcher.py to use different ports

### Browser doesn't open automatically
- Manually navigate to `http://localhost:3000`
- Your default browser should open

### Services don't start
- Check that you're running from the correct directory (project root)
- Open Command Prompt and run: `python launcher.py`
- Look for error messages

## System Requirements

- **Windows 10 or later**
- **Python 3.8+** (only needed if not using .exe)
- **Node.js 16+** (only needed if not using .exe)
- **2GB RAM minimum**
- **200MB free disk space**

## Default Credentials

- **Username**: admin
- **Password**: admin123

## After Starting

1. Go to http://localhost:3000 in your browser
2. Login with the admin credentials above
3. To add more users:
   - Register new users
   - Approve them as primary admin
   - Promote to secondary admin if needed

## Stopping the Service

- **If using RUN_Windows.bat**: Close the backend and frontend console windows
- **If using .exe**: Close the console window
- **If using launcher.py**: Press Ctrl+C in the Command Prompt window

## File Descriptions

- `launcher.py` - Python script that starts both servers
- `RUN_Windows.bat` - Batch file for quick Windows launch
- `build_exe.py` - Python build script to create .exe
- `build_exe.bat` - Batch file to create .exe

Choose the method that works best for your needs!
