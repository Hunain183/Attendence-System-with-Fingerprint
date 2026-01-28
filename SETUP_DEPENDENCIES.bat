@echo off
REM Setup Dependencies for Attendance System
REM This script checks and installs all required Python and Node.js dependencies

cls
echo.
echo ============================================================
echo    Attendance System - Setup Dependencies
echo ============================================================
echo.

REM Check if Python is installed
echo Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ERROR: Python is not installed or not in PATH
    echo.
    echo Please install Python from: https://www.python.org/downloads/
    echo.
    echo During installation, make sure to:
    echo   1. Check "Add Python to PATH"
    echo   2. Click "Install Now" or "Customize Installation"
    echo.
    echo After installing Python:
    echo   1. Close this window
    echo   2. Close and reopen Command Prompt
    echo   3. Run this script again
    echo.
    pause
    exit /b 1
)
echo OK - Python found

REM Check if Node.js is installed
echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ERROR: Node.js is not installed or not in PATH
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo.
    echo During installation, make sure to:
    echo   1. Choose "LTS" (Long Term Support) version
    echo   2. Check "Add to PATH" when prompted
    echo.
    echo After installing Node.js:
    echo   1. Close this window
    echo   2. Close and reopen Command Prompt
    echo   3. Run this script again
    echo.
    pause
    exit /b 1
)
echo OK - Node.js found

echo.
echo ============================================================
echo    Installing Dependencies
echo ============================================================
echo.

REM Install backend dependencies
echo Installing Backend Dependencies...
if exist "backend\requirements.txt" (
    cd backend
    echo   Running: pip install -r requirements.txt
    pip install -q -r requirements.txt
    if errorlevel 1 (
        echo   WARNING: Some dependencies may not have installed properly
    ) else (
        echo   SUCCESS: Backend dependencies installed
    )
    cd ..
) else (
    echo   WARNING: backend\requirements.txt not found
)

echo.

REM Install frontend dependencies
echo Installing Frontend Dependencies...
if not exist "frontend\node_modules" (
    cd frontend
    echo   Running: npm install (this may take 1-2 minutes, please wait...)
    call npm install
    if errorlevel 1 (
        echo   WARNING: Some dependencies may not have installed properly
    ) else (
        echo   SUCCESS: Frontend dependencies installed
    )
    cd ..
) else (
    echo   SUCCESS: Frontend dependencies already installed
)

echo.
echo ============================================================
echo    Setup Complete!
echo ============================================================
echo.
echo You can now run the application using:
echo   1. Double-click RUN_Windows.bat
echo   2. Or type: python launcher.py
echo.
echo Your browser will open automatically!
echo.
pause
