@echo off
REM ============================================================
REM    Quick Start - Attendance System
REM    Starts the application without checking dependencies
REM    Use this after INSTALL_AND_RUN.bat has been run once
REM ============================================================

setlocal enabledelayedexpansion

cls
echo.
echo ============================================================
echo    Attendance System - Quick Start
echo ============================================================
echo.

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

REM Start backend
echo Starting Backend Server on Port 8000...
cd "%SCRIPT_DIR%backend"
start "Backend - Attendance System" cmd /k "python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

REM Wait for backend
timeout /t 5 /nobreak >nul

REM Start frontend
echo Starting Frontend Server on Port 3000...
cd "%SCRIPT_DIR%frontend"
start "Frontend - Attendance System" cmd /k "npx vite --host"

REM Wait for frontend
timeout /t 5 /nobreak >nul

echo.
echo ============================================================
echo    Application Started!
echo ============================================================
echo.
echo    Opening browser to http://localhost:3000
echo.
echo    Login with:
echo      Username: admin
echo      Password: admin123
echo.
echo ============================================================
echo.

REM Open browser
start "" "http://localhost:3000"

echo Press any key to close this window...
pause >nul
