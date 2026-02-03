@echo off
REM ============================================================
REM    Batch Files Verification
REM    Checks if all batch files exist and are ready
REM ============================================================

cls
echo.
echo ============================================================
echo    Attendance System - Batch Files Check
echo ============================================================
echo.

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

echo Checking batch files...
echo.

REM Check each batch file
set ALL_OK=1

if exist "INSTALL_AND_RUN.bat" (
    echo [OK] INSTALL_AND_RUN.bat found
) else (
    echo [MISSING] INSTALL_AND_RUN.bat
    set ALL_OK=0
)

if exist "START.bat" (
    echo [OK] START.bat found
) else (
    echo [MISSING] START.bat
    set ALL_OK=0
)

if exist "STOP_App.bat" (
    echo [OK] STOP_App.bat found
) else (
    echo [MISSING] STOP_App.bat
    set ALL_OK=0
)

if exist "BUILD_EXE.bat" (
    echo [OK] BUILD_EXE.bat found
) else (
    echo [MISSING] BUILD_EXE.bat
    set ALL_OK=0
)

echo.
echo Checking critical files...
echo.

if exist "backend\main.py" (
    echo [OK] backend\main.py found
) else (
    echo [MISSING] backend\main.py
    set ALL_OK=0
)

if exist "backend\app_launcher.py" (
    echo [OK] backend\app_launcher.py found
) else (
    echo [MISSING] backend\app_launcher.py
    set ALL_OK=0
)

if exist "backend\migrate_database.py" (
    echo [OK] backend\migrate_database.py found
) else (
    echo [MISSING] backend\migrate_database.py
    set ALL_OK=0
)

if exist "frontend\package.json" (
    echo [OK] frontend\package.json found
) else (
    echo [MISSING] frontend\package.json
    set ALL_OK=0
)

if exist "frontend\vite.config.ts" (
    echo [OK] frontend\vite.config.ts found
) else (
    echo [MISSING] frontend\vite.config.ts
    set ALL_OK=0
)

echo.
echo Checking Python...
python --version >nul 2>&1
if not errorlevel 1 (
    for /f "tokens=2" %%i in ('python --version 2^>^&1') do echo [OK] Python %%i installed
) else (
    echo [INFO] Python not installed - INSTALL_AND_RUN.bat will install it
)

echo.
echo Checking Node.js...
node --version >nul 2>&1
if not errorlevel 1 (
    for /f "tokens=1" %%i in ('node --version') do echo [OK] Node.js %%i installed
) else (
    echo [INFO] Node.js not installed - INSTALL_AND_RUN.bat will install it
)

echo.
echo Checking npm...
npm --version >nul 2>&1
if not errorlevel 1 (
    for /f "tokens=1" %%i in ('npm --version') do echo [OK] npm %%i installed
) else (
    echo [INFO] npm not installed (comes with Node.js)
)

echo.
echo ============================================================
if %ALL_OK%==1 (
    echo    ALL CRITICAL FILES PRESENT
    echo    System is ready for deployment!
    echo.
    echo    Next Steps:
    echo    1. Run INSTALL_AND_RUN.bat for first setup
    echo    2. Or run BUILD_EXE.bat to create executable
) else (
    echo    SOME FILES ARE MISSING
    echo    Please verify the repository is complete
)
echo ============================================================
echo.

pause
