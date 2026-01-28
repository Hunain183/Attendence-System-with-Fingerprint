@echo off
REM Attendance System Launcher for Windows
REM This script starts the backend and frontend servers and opens the browser

setlocal enabledelayedexpansion

cls
echo.
echo ============================================================
echo    Attendance System - Starting Services
echo ============================================================
echo.

REM Get the directory where this batch file is located
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

REM Check if backend and frontend directories exist
if not exist "backend" (
    echo ERROR: Backend directory not found
    echo Please run this from the project root directory
    pause
    exit /b 1
)

if not exist "frontend" (
    echo ERROR: Frontend directory not found
    echo Please run this from the project root directory
    pause
    exit /b 1
)

echo Checking for Python and Node.js...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org
    echo.
    echo After installing, make sure to:
    echo   1. Check "Add Python to PATH" during installation
    echo   2. Restart this Command Prompt window
    echo.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    echo.
    echo After installing, make sure to:
    echo   1. Check "Add to PATH" during installation
    echo   2. Restart this Command Prompt window
    echo.
    pause
    exit /b 1
)

echo ✓ Python and Node.js are installed!
echo.
echo ============================================================
echo.

REM Install backend dependencies
echo Installing Backend Dependencies...
echo    (Downloading packages - you'll see progress bars below)
echo.
cd "%SCRIPT_DIR%backend"
if exist "requirements.txt" (
    pip install --progress-bar on -r requirements.txt
    if errorlevel 1 (
        echo.
        echo WARNING: Some backend dependencies may not have installed properly
        echo Continuing anyway...
    ) else (
        echo.
        echo ✓ Backend dependencies installed successfully
    )
) else (
    echo WARNING: requirements.txt not found
)

REM Install frontend dependencies if needed
echo.
echo Installing Frontend Dependencies...
cd "%SCRIPT_DIR%frontend"
if not exist "node_modules" (
    echo    (Downloading packages - npm will show progress below)
    echo.
    call npm install --progress=true
    if errorlevel 1 (
        echo.
        echo WARNING: Some frontend dependencies may not have installed properly
        echo Continuing anyway...
    ) else (
        echo.
        echo ✓ Frontend dependencies installed successfully
    )
) else (
    echo ✓ Frontend dependencies already installed (skipping)
)

echo.
echo ============================================================
echo.

echo Starting Backend Server (Port 8000)...
cd "%SCRIPT_DIR%backend"
start "Attendance-Backend" /MIN python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload

REM Wait for backend to start
timeout /t 3 /nobreak >nul

echo Starting Frontend Server (Port 3000)...
cd "%SCRIPT_DIR%frontend"
start "Attendance-Frontend" /MIN cmd /c "set VITE_API_URL=/api && npm run dev"

REM Wait for frontend to start
timeout /t 5 /nobreak >nul

echo Opening browser...
start "" "http://localhost:3000"

echo.
echo ============================================================
echo    Services are running!
echo ============================================================
echo.
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:8000
echo.
echo    Default credentials:
echo       Username: admin
echo       Password: admin123
echo.
echo    Close the backend and frontend console windows to stop.
echo.

pause
