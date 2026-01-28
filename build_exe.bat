@echo off
REM Build script for creating Windows executable
REM Run this batch file on Windows to create the .exe

cls
echo.
echo ============================================================
echo Building Attendance System Launcher.exe
echo ============================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org
    pause
    exit /b 1
)

echo Installing PyInstaller...
pip install pyinstaller >nul 2>&1
if errorlevel 1 (
    echo ERROR: Failed to install PyInstaller
    pause
    exit /b 1
)

echo.
echo Creating executable...
pyinstaller --onefile --windowed ^
    --name "Attendance-System" ^
    --add-data "backend;backend" ^
    --add-data "frontend;frontend" ^
    launcher.py

echo.
if exist "dist\Attendance-System.exe" (
    echo ============================================================
    echo SUCCESS!
    echo ============================================================
    echo.
    echo Executable created: dist\Attendance-System.exe
    echo.
    echo You can now run this .exe file on any Windows machine!
    echo (No Python installation required on target machine)
    echo.
    pause
) else (
    echo ERROR: Failed to create executable
    pause
    exit /b 1
)
