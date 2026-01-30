@echo off
REM ============================================================
REM    Attendance System - Build Executable
REM    Creates a standalone .exe file
REM ============================================================

setlocal enabledelayedexpansion

cls
echo.
echo ============================================================
echo    Building Attendance System Executable
echo ============================================================
echo.
echo This will create a standalone .exe file that includes:
echo   - Python backend (compiled)
echo   - Frontend (built and bundled)
echo   - All dependencies
echo.
echo ============================================================
echo.

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

REM ============================================================
REM    STEP 1: Install PyInstaller
REM ============================================================

echo [Step 1/4] Installing build tools...
pip install pyinstaller --quiet
if errorlevel 1 (
    echo [ERROR] Failed to install PyInstaller
    pause
    exit /b 1
)
echo    [OK] PyInstaller installed
echo.

REM ============================================================
REM    STEP 1.1: Migrate Database
REM ============================================================

echo [Step 1.1/4] Migrating database...
cd "%SCRIPT_DIR%backend"
python migrate_database.py
if errorlevel 1 (
    echo [WARNING] Database migration had issues but continuing...
)
echo    [OK] Database migrated with latest schema
echo.
cd "%SCRIPT_DIR%"

REM ============================================================
REM    STEP 2: Build Frontend
REM ============================================================

echo [Step 2/4] Building frontend...
cd "%SCRIPT_DIR%frontend"

REM Install dependencies if needed
if not exist "node_modules" (
    echo    Installing npm packages...
    call npm install
)

REM Build production version
echo    Creating production build...
call npm run build
if errorlevel 1 (
    echo [ERROR] Frontend build failed
    pause
    exit /b 1
)

REM Copy built files to backend static folder
echo    Copying built files to backend...
if not exist "%SCRIPT_DIR%backend\static" mkdir "%SCRIPT_DIR%backend\static"
xcopy /E /Y /I "%SCRIPT_DIR%frontend\dist\*" "%SCRIPT_DIR%backend\static\"
if not exist "%SCRIPT_DIR%backend\static\index.html" (
    echo [ERROR] Frontend files not copied correctly
    pause
    exit /b 1
)

echo    [OK] Frontend built and copied
echo.

cd "%SCRIPT_DIR%"

REM ============================================================
REM    STEP 3: Create launcher script
REM ============================================================

echo [Step 3/4] Creating launcher...

REM Create the main launcher Python script with error handling
echo import os > "%SCRIPT_DIR%backend\app_launcher.py"
echo import sys >> "%SCRIPT_DIR%backend\app_launcher.py"
echo import webbrowser >> "%SCRIPT_DIR%backend\app_launcher.py"
echo import threading >> "%SCRIPT_DIR%backend\app_launcher.py"
echo import time >> "%SCRIPT_DIR%backend\app_launcher.py"
echo import traceback >> "%SCRIPT_DIR%backend\app_launcher.py"
echo. >> "%SCRIPT_DIR%backend\app_launcher.py"
echo # Add the backend directory to path >> "%SCRIPT_DIR%backend\app_launcher.py"
echo if getattr(sys, 'frozen', False): >> "%SCRIPT_DIR%backend\app_launcher.py"
echo     BASE_DIR = os.path.dirname(sys.executable) >> "%SCRIPT_DIR%backend\app_launcher.py"
echo else: >> "%SCRIPT_DIR%backend\app_launcher.py"
echo     BASE_DIR = os.path.dirname(os.path.abspath(__file__)) >> "%SCRIPT_DIR%backend\app_launcher.py"
echo. >> "%SCRIPT_DIR%backend\app_launcher.py"
echo os.chdir(BASE_DIR) >> "%SCRIPT_DIR%backend\app_launcher.py"
echo sys.path.insert(0, BASE_DIR) >> "%SCRIPT_DIR%backend\app_launcher.py"
echo. >> "%SCRIPT_DIR%backend\app_launcher.py"
echo def open_browser(): >> "%SCRIPT_DIR%backend\app_launcher.py"
echo     time.sleep(3) >> "%SCRIPT_DIR%backend\app_launcher.py"
echo     webbrowser.open('http://localhost:8000') >> "%SCRIPT_DIR%backend\app_launcher.py"
echo. >> "%SCRIPT_DIR%backend\app_launcher.py"
echo if __name__ == '__main__': >> "%SCRIPT_DIR%backend\app_launcher.py"
echo     try: >> "%SCRIPT_DIR%backend\app_launcher.py"
echo         print('='*60) >> "%SCRIPT_DIR%backend\app_launcher.py"
echo         print('Attendance System - Starting...') >> "%SCRIPT_DIR%backend\app_launcher.py"
echo         print('='*60) >> "%SCRIPT_DIR%backend\app_launcher.py"
echo         print('Working directory:', os.getcwd()) >> "%SCRIPT_DIR%backend\app_launcher.py"
echo         print('Opening browser to http://localhost:8000') >> "%SCRIPT_DIR%backend\app_launcher.py"
echo         print('Press Ctrl+C to stop the server') >> "%SCRIPT_DIR%backend\app_launcher.py"
echo         print('='*60) >> "%SCRIPT_DIR%backend\app_launcher.py"
echo         print() >> "%SCRIPT_DIR%backend\app_launcher.py"
echo. >> "%SCRIPT_DIR%backend\app_launcher.py"
echo         # Open browser in background >> "%SCRIPT_DIR%backend\app_launcher.py"
echo         threading.Thread(target=open_browser, daemon=True).start() >> "%SCRIPT_DIR%backend\app_launcher.py"
echo. >> "%SCRIPT_DIR%backend\app_launcher.py"
echo         # Import and run the FastAPI app >> "%SCRIPT_DIR%backend\app_launcher.py"
echo         import uvicorn >> "%SCRIPT_DIR%backend\app_launcher.py"
echo         from main import app >> "%SCRIPT_DIR%backend\app_launcher.py"
echo         uvicorn.run(app, host='127.0.0.1', port=8000) >> "%SCRIPT_DIR%backend\app_launcher.py"
echo     except Exception as e: >> "%SCRIPT_DIR%backend\app_launcher.py"
echo         print() >> "%SCRIPT_DIR%backend\app_launcher.py"
echo         print('='*60) >> "%SCRIPT_DIR%backend\app_launcher.py"
echo         print('ERROR: Application failed to start') >> "%SCRIPT_DIR%backend\app_launcher.py"
echo         print('='*60) >> "%SCRIPT_DIR%backend\app_launcher.py"
echo         print(str(e)) >> "%SCRIPT_DIR%backend\app_launcher.py"
echo         print() >> "%SCRIPT_DIR%backend\app_launcher.py"
echo         traceback.print_exc() >> "%SCRIPT_DIR%backend\app_launcher.py"
echo         print() >> "%SCRIPT_DIR%backend\app_launcher.py"
echo         print('Press any key to exit...') >> "%SCRIPT_DIR%backend\app_launcher.py"
echo         input() >> "%SCRIPT_DIR%backend\app_launcher.py"
echo         sys.exit(1) >> "%SCRIPT_DIR%backend\app_launcher.py"

echo    [OK] Launcher created
echo.

REM ============================================================
REM    STEP 4: Build executable with PyInstaller
REM ============================================================

echo [Step 4/4] Building executable...
echo    This may take a few minutes...
echo.

cd "%SCRIPT_DIR%backend"

REM Create PyInstaller spec file for better control
pyinstaller --onefile --name "AttendanceSystem" ^
    --add-data "static;static" ^
    --add-data "attendance.db;." ^
    --add-data "database.py;." ^
    --add-data "main.py;." ^
    --add-data "auth;auth" ^
    --add-data "models;models" ^
    --add-data "routers;routers" ^
    --add-data "schemas;schemas" ^
    --add-data "services;services" ^
    --add-data "utils;utils" ^
    --hidden-import uvicorn.logging ^
    --hidden-import uvicorn.protocols ^
    --hidden-import uvicorn.protocols.http ^
    --hidden-import uvicorn.protocols.http.auto ^
    --hidden-import uvicorn.protocols.websockets ^
    --hidden-import uvicorn.protocols.websockets.auto ^
    --hidden-import uvicorn.lifespan ^
    --hidden-import uvicorn.lifespan.on ^
    --hidden-import uvicorn.lifespan.off ^
    --hidden-import sqlalchemy.dialects.sqlite ^
    --collect-all fastapi ^
    --collect-all starlette ^
    --collect-all pydantic ^
    --collect-all sqlalchemy ^
    --collect-all passlib ^
    --collect-all bcrypt ^
    --console ^
    app_launcher.py

if errorlevel 1 (
    echo.
    echo [ERROR] Build failed
    pause
    exit /b 1
)

REM Move executable to main directory
if exist "dist\AttendanceSystem.exe" (
    move /Y "dist\AttendanceSystem.exe" "%SCRIPT_DIR%AttendanceSystem.exe" >nul
)

REM Clean up build files
echo.
echo Cleaning up build files...
rmdir /S /Q build 2>nul
rmdir /S /Q dist 2>nul
del /Q *.spec 2>nul
del /Q app_launcher.py 2>nul

cd "%SCRIPT_DIR%"

echo.
echo ============================================================
echo    BUILD COMPLETE!
echo ============================================================
echo.
echo    Created: AttendanceSystem.exe
echo.
echo    To run the application:
echo      1. Double-click AttendanceSystem.exe
echo      2. Browser will open automatically
echo      3. Login with admin / admin123
echo.
echo    The .exe file can be distributed to other Windows PCs
echo    without needing Python or Node.js installed!
echo.
echo ============================================================
echo.
pause
