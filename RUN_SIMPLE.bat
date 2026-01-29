@echo off
REM Attendance System - Simple Launcher
REM This version is more reliable on Windows

setlocal enabledelayedexpansion

cls
echo.
echo ============================================================
echo    Attendance System - Starting Application
echo ============================================================
echo.

REM Get the directory where this batch file is located
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

REM Verify directories exist
if not exist "backend" (
    echo ERROR: Backend directory not found
    pause
    exit /b 1
)

if not exist "frontend" (
    echo ERROR: Frontend directory not found
    pause
    exit /b 1
)

echo Step 1: Checking Python and Node.js...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found!
    echo Install from: https://www.python.org/downloads/
    pause
    exit /b 1
)

node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found!
    echo Install from: https://nodejs.org/
    pause
    exit /b 1
)

echo OK - Python and Node.js found
echo.

echo Step 2: Installing Backend Dependencies...
echo    (Using pre-built packages - no compilation needed)
cd "%SCRIPT_DIR%backend"
if exist "requirements.txt" (
    pip install --prefer-binary -r requirements.txt --quiet
    if errorlevel 1 (
        echo    Trying alternative installation method...
        pip install --only-binary :all: -r requirements.txt --quiet
    )
)
cd "%SCRIPT_DIR%"
echo OK - Backend dependencies ready
echo.

echo Step 3: Installing Frontend Dependencies...
cd "%SCRIPT_DIR%frontend"
if not exist "node_modules" (
    call npm install --silent
)
cd "%SCRIPT_DIR%"
echo OK - Frontend dependencies ready
echo.

echo ============================================================
echo.

REM Start backend in a new window that stays open
echo Starting Backend Server on Port 8000...
cd "%SCRIPT_DIR%backend"
start "Backend" cmd /k python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload

REM Give backend time to start
echo Waiting 8 seconds for backend to initialize...
timeout /t 8 /nobreak >nul

REM Start frontend in a new window that stays open
echo Starting Frontend Server on Port 3000...
cd "%SCRIPT_DIR%frontend"
start "Frontend" cmd /k "set VITE_API_URL=/api && npm run dev"

echo.
echo Waiting 8 seconds for frontend to initialize...
timeout /t 8 /nobreak >nul

echo.
echo ============================================================
echo Opening browser to http://localhost:3000...
echo ============================================================
echo.

start "" "http://localhost:3000"

echo.
echo Your Attendance System is starting!
echo.
echo LOGIN CREDENTIALS:
echo   Username: admin
echo   Password: admin123
echo.
echo The backend and frontend windows are open separately.
echo If something goes wrong, check those windows for error messages.
echo.
pause
