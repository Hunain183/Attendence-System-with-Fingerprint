@echo off
REM ============================================================
REM    Stop Attendance System
REM    Closes all running servers
REM ============================================================

echo Stopping Attendance System...
echo.

REM Kill Python/Uvicorn processes on port 8000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    echo Stopping backend server (PID: %%a)...
    taskkill /f /pid %%a 2>nul
)

REM Kill Node/Vite processes on port 3000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    echo Stopping frontend server (PID: %%a)...
    taskkill /f /pid %%a 2>nul
)

REM Also kill any stray node processes running vite
taskkill /f /im node.exe /fi "WINDOWTITLE eq Frontend*" 2>nul

echo.
echo Attendance System stopped.
echo.
pause
