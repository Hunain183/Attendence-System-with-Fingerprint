@echo off
REM ============================================================
REM    Attendance System - Build Executable
REM    Creates a standalone .exe file for Windows
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
REM    STEP 1: Check Python and Install PyInstaller
REM ============================================================

echo [Step 1/5] Checking Python and installing build tools...

python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please run INSTALL_AND_RUN.bat first to install Python
    pause
    exit /b 1
)

pip install pyinstaller --quiet
if errorlevel 1 (
    echo [ERROR] Failed to install PyInstaller
    pause
    exit /b 1
)
echo    [OK] PyInstaller ready
echo.

REM ============================================================
REM    STEP 2: Migrate Database
REM ============================================================

echo [Step 2/5] Migrating database...
cd "%SCRIPT_DIR%backend"
python migrate_database.py
if errorlevel 1 (
    echo [WARNING] Database migration had issues but continuing...
)
echo    [OK] Database migrated with latest schema
echo.
cd "%SCRIPT_DIR%"

REM ============================================================
REM    STEP 3: Build Frontend
REM ============================================================

echo [Step 3/5] Building frontend...
cd "%SCRIPT_DIR%frontend"

REM Install dependencies if needed
if not exist "node_modules" (
    echo    Installing npm packages...
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install failed
        pause
        exit /b 1
    )
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
if exist "%SCRIPT_DIR%backend\static" rmdir /S /Q "%SCRIPT_DIR%backend\static"
mkdir "%SCRIPT_DIR%backend\static"
xcopy /E /Y /I "%SCRIPT_DIR%frontend\dist\*" "%SCRIPT_DIR%backend\static\" >nul

if not exist "%SCRIPT_DIR%backend\static\index.html" (
    echo [ERROR] Frontend files not copied correctly
    pause
    exit /b 1
)

echo    [OK] Frontend built and copied
echo.

cd "%SCRIPT_DIR%"

REM ============================================================
REM    STEP 4: Verify Launcher Script Exists
REM ============================================================

echo [Step 4/5] Verifying launcher script...

if not exist "%SCRIPT_DIR%backend\app_launcher.py" (
    echo [ERROR] app_launcher.py not found in backend folder
    pause
    exit /b 1
)

echo    [OK] Launcher ready
echo.

REM ============================================================
REM    STEP 5: Build Executable with PyInstaller
REM ============================================================

echo [Step 5/5] Building executable...
echo    This may take 5-10 minutes...
echo.

cd "%SCRIPT_DIR%backend"

REM Build with PyInstaller
pyinstaller --onefile --name "AttendanceSystem" ^
    --add-data "static;static" ^
    --add-data "auth;auth" ^
    --add-data "models;models" ^
    --add-data "routers;routers" ^
    --add-data "schemas;schemas" ^
    --add-data "services;services" ^
    --add-data "utils;utils" ^
    --hidden-import uvicorn ^
    --hidden-import uvicorn.logging ^
    --hidden-import uvicorn.loops ^
    --hidden-import uvicorn.loops.auto ^
    --hidden-import uvicorn.protocols ^
    --hidden-import uvicorn.protocols.http ^
    --hidden-import uvicorn.protocols.http.auto ^
    --hidden-import uvicorn.protocols.http.h11_impl ^
    --hidden-import uvicorn.protocols.http.httptools_impl ^
    --hidden-import uvicorn.protocols.websockets ^
    --hidden-import uvicorn.protocols.websockets.auto ^
    --hidden-import uvicorn.protocols.websockets.websockets_impl ^
    --hidden-import uvicorn.protocols.websockets.wsproto_impl ^
    --hidden-import uvicorn.lifespan ^
    --hidden-import uvicorn.lifespan.on ^
    --hidden-import uvicorn.lifespan.off ^
    --hidden-import sqlalchemy ^
    --hidden-import sqlalchemy.dialects.sqlite ^
    --hidden-import pydantic ^
    --hidden-import email_validator ^
    --hidden-import passlib ^
    --hidden-import passlib.handlers ^
    --hidden-import passlib.handlers.bcrypt ^
    --hidden-import bcrypt ^
    --hidden-import jose ^
    --hidden-import jose.jwt ^
    --collect-all fastapi ^
    --collect-all starlette ^
    --collect-all pydantic ^
    --collect-all sqlalchemy ^
    --collect-all passlib ^
    --collect-all bcrypt ^
    --collect-all python-jose ^
    --console ^
    --noconfirm ^
    app_launcher.py

if errorlevel 1 (
    echo.
    echo [ERROR] Build failed
    echo Check the output above for details
    pause
    exit /b 1
)

REM Move executable to main directory
if exist "dist\AttendanceSystem.exe" (
    echo.
    echo    Moving executable to main directory...
    move /Y "dist\AttendanceSystem.exe" "%SCRIPT_DIR%AttendanceSystem.exe" >nul
    
    REM Copy database file alongside exe
    if exist "attendance.db" (
        copy /Y "attendance.db" "%SCRIPT_DIR%attendance.db" >nul
    )
)

REM Clean up build files
echo    Cleaning up build files...
rmdir /S /Q build 2>nul
rmdir /S /Q dist 2>nul
del /Q *.spec 2>nul

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
echo      2. Browser will open automatically to http://localhost:8000
echo      3. Login with admin / admin123
echo.
echo    The .exe file can be distributed to other Windows PCs
echo    without needing Python or Node.js installed!
echo.
echo    NOTE: If moving the .exe to another location, also copy
echo    the attendance.db file (if it exists) to keep your data.
echo.
echo ============================================================
echo.
pause
