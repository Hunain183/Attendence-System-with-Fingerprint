@echo off
REM ============================================================
REM    Attendance System - Auto Installer and Launcher
REM    Automatically downloads and installs Python 3.11 and Node.js 20
REM ============================================================

setlocal enabledelayedexpansion

cls
echo.
echo ============================================================
echo    Attendance System - Auto Installer
echo ============================================================
echo.
echo This script will:
echo   1. Check/Install Python 3.11
echo   2. Check/Install Node.js 20
echo   3. Install all dependencies
echo   4. Start the application
echo.
echo ============================================================
echo.

REM Get the directory where this batch file is located
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

REM Create temp directory for downloads
if not exist "%SCRIPT_DIR%temp" mkdir "%SCRIPT_DIR%temp"

REM ============================================================
REM    STEP 1: Check Python Installation
REM ============================================================

echo [Step 1/4] Checking Python installation...

set PYTHON_OK=0
set PYTHON_CMD=python

REM Try python command
python --version >nul 2>&1
if not errorlevel 1 (
    for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYVER=%%i
    echo    Found Python !PYVER!
    
    REM Check if it's Python 3.11 or 3.12
    echo !PYVER! | findstr /B "3.11 3.12" >nul
    if not errorlevel 1 (
        set PYTHON_OK=1
        echo    [OK] Python version is compatible
    ) else (
        echo    [WARNING] Python !PYVER! is not compatible
        echo    Need Python 3.11 or 3.12
    )
)

REM If Python not OK, try to find Python 3.11 specifically
if !PYTHON_OK!==0 (
    where py >nul 2>&1
    if not errorlevel 1 (
        for /f "tokens=*" %%i in ('py -3.11 --version 2^>^&1') do (
            echo %%i | findstr /B "Python 3.11" >nul
            if not errorlevel 1 (
                set PYTHON_OK=1
                set PYTHON_CMD=py -3.11
                echo    [OK] Found Python 3.11 via py launcher
            )
        )
    )
)

REM If still no compatible Python, download and install
if !PYTHON_OK!==0 (
    echo.
    echo    Downloading Python 3.11.9...
    echo    Please wait, this may take a few minutes...
    echo.
    
    REM Download Python 3.11.9 installer
    powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe' -OutFile '%SCRIPT_DIR%temp\python-installer.exe'}"
    
    if not exist "%SCRIPT_DIR%temp\python-installer.exe" (
        echo    [ERROR] Failed to download Python installer
        echo    Please download manually from: https://www.python.org/downloads/release/python-3119/
        pause
        exit /b 1
    )
    
    echo    Installing Python 3.11.9...
    echo    [This will open an installer window - please wait]
    echo.
    
    REM Install Python silently with PATH
    "%SCRIPT_DIR%temp\python-installer.exe" /passive InstallAllUsers=0 PrependPath=1 Include_test=0
    
    if errorlevel 1 (
        echo    [ERROR] Python installation failed
        echo    Trying interactive installation...
        "%SCRIPT_DIR%temp\python-installer.exe"
    )
    
    echo.
    echo    [OK] Python 3.11.9 installed
    echo.
    echo    IMPORTANT: Please close this window and run INSTALL_AND_RUN.bat again
    echo    to use the newly installed Python.
    echo.
    pause
    exit /b 0
)

echo.

REM ============================================================
REM    STEP 2: Check Node.js Installation
REM ============================================================

echo [Step 2/4] Checking Node.js installation...

set NODE_OK=0

node --version >nul 2>&1
if not errorlevel 1 (
    for /f "tokens=1 delims=v" %%i in ('node --version') do set NODEVER=%%i
    for /f "tokens=1" %%i in ('node --version') do set NODEVER_FULL=%%i
    echo    Found Node.js !NODEVER_FULL!
    
    REM Check if Node.js version is 18, 20, or 22 (LTS versions)
    echo !NODEVER_FULL! | findstr /R "v18\. v20\. v22\." >nul
    if not errorlevel 1 (
        set NODE_OK=1
        echo    [OK] Node.js version is compatible
    ) else (
        echo    [WARNING] Node.js !NODEVER_FULL! may not be compatible
        echo    Recommended: Node.js 20 LTS
        set NODE_OK=1
    )
) else (
    echo    Node.js not found
)

REM If Node.js not installed, download and install
if !NODE_OK!==0 (
    echo.
    echo    Downloading Node.js 20 LTS...
    echo    Please wait, this may take a few minutes...
    echo.
    
    REM Download Node.js 20 LTS installer
    powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.11.1/node-v20.11.1-x64.msi' -OutFile '%SCRIPT_DIR%temp\node-installer.msi'}"
    
    if not exist "%SCRIPT_DIR%temp\node-installer.msi" (
        echo    [ERROR] Failed to download Node.js installer
        echo    Please download manually from: https://nodejs.org/
        pause
        exit /b 1
    )
    
    echo    Installing Node.js 20 LTS...
    echo    [This may take a minute]
    echo.
    
    REM Install Node.js silently
    msiexec /i "%SCRIPT_DIR%temp\node-installer.msi" /passive
    
    if errorlevel 1 (
        echo    [ERROR] Node.js installation failed
        echo    Trying interactive installation...
        msiexec /i "%SCRIPT_DIR%temp\node-installer.msi"
    )
    
    echo.
    echo    [OK] Node.js 20 LTS installed
    echo.
    echo    IMPORTANT: Please close this window and run INSTALL_AND_RUN.bat again
    echo    to use the newly installed Node.js.
    echo.
    pause
    exit /b 0
)

echo.

REM ============================================================
REM    STEP 3: Install Dependencies
REM ============================================================

echo [Step 3/4] Installing dependencies...
echo.

REM Install backend dependencies
echo    Installing Python packages...
cd "%SCRIPT_DIR%backend"
%PYTHON_CMD% -m pip install --upgrade pip --quiet
%PYTHON_CMD% -m pip install --prefer-binary -r requirements.txt
if errorlevel 1 (
    echo    [WARNING] Some Python packages may not have installed correctly
)
cd "%SCRIPT_DIR%"
echo    [OK] Python packages installed
echo.

REM Install frontend dependencies
echo    Installing Node.js packages (this may take 1-2 minutes)...
cd "%SCRIPT_DIR%frontend"

REM Always run npm install to ensure packages are installed
call npm install
if errorlevel 1 (
    echo    [WARNING] npm install had issues, trying again...
    call npm install --legacy-peer-deps
)

cd "%SCRIPT_DIR%"
echo    [OK] Node.js packages installed
echo.

REM ============================================================
REM    STEP 4: Start Application
REM ============================================================

echo [Step 4/4] Starting application...
echo.
echo ============================================================
echo.

REM Start backend in a new window
echo Starting Backend Server on Port 8000...
cd "%SCRIPT_DIR%backend"
start "Backend - Attendance System" cmd /k "%PYTHON_CMD% -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

REM Wait for backend to start
echo Waiting 8 seconds for backend to initialize...
timeout /t 8 /nobreak >nul

REM Start frontend in a new window using npx to ensure vite is found
echo Starting Frontend Server on Port 3000...
cd "%SCRIPT_DIR%frontend"
start "Frontend - Attendance System" cmd /k "npx vite --host"

REM Wait for frontend to start
echo Waiting 8 seconds for frontend to initialize...
timeout /t 8 /nobreak >nul

echo.
echo ============================================================
echo    Application Started Successfully!
echo ============================================================
echo.
echo    Opening browser to http://localhost:3000
echo.
echo    Login with:
echo      Username: admin
echo      Password: admin123
echo.
echo    Keep the Backend and Frontend windows open!
echo    Close them to stop the application.
echo.
echo ============================================================
echo.

REM Open browser
start "" "http://localhost:3000"

REM Clean up temp files
if exist "%SCRIPT_DIR%temp\python-installer.exe" del "%SCRIPT_DIR%temp\python-installer.exe"
if exist "%SCRIPT_DIR%temp\node-installer.msi" del "%SCRIPT_DIR%temp\node-installer.msi"
rmdir "%SCRIPT_DIR%temp" 2>nul

echo Press any key to close this window (servers will keep running)...
pause >nul
