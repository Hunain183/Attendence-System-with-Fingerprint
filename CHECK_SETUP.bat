@echo off
REM Check Setup - Verify everything is configured correctly

cls
echo.
echo ============================================================
echo    Attendance System - Setup Verification
echo ============================================================
echo.

echo Checking Python...
python --version
if errorlevel 1 (
    echo ERROR: Python not found!
    pause
    exit /b 1
)

echo.
echo Checking pip...
pip --version
if errorlevel 1 (
    echo ERROR: pip not found!
    pause
    exit /b 1
)

echo.
echo Checking Node.js...
node --version
if errorlevel 1 (
    echo ERROR: Node.js not found!
    pause
    exit /b 1
)

echo.
echo Checking npm...
npm --version
if errorlevel 1 (
    echo ERROR: npm not found!
    pause
    exit /b 1
)

echo.
echo ============================================================
echo    Checking Backend Setup
echo ============================================================
echo.

cd backend

echo Checking requirements.txt...
if not exist "requirements.txt" (
    echo ERROR: requirements.txt not found!
    pause
    exit /b 1
)

echo Checking backend dependencies...
pip show fastapi >nul 2>&1
if errorlevel 1 (
    echo WARNING: FastAPI not installed
    echo Run SETUP_DEPENDENCIES.bat first
) else (
    echo ✓ FastAPI installed
)

echo.
echo Checking database...
if exist "attendance.db" (
    echo ✓ Database exists
) else (
    echo WARNING: Database not initialized (will be created on first run)
)

echo.
echo Checking .env file...
if exist ".env" (
    echo ✓ .env file exists
    type .env
) else (
    echo WARNING: .env file not found (using defaults)
    echo Creating default .env file...
    (
        echo SECRET_KEY=your-secret-key-change-this-in-production-min-32-chars
        echo ALGORITHM=HS256
        echo ACCESS_TOKEN_EXPIRE_MINUTES=30
        echo ADMIN_USERNAME=admin
        echo ADMIN_PASSWORD=admin123
    ) > .env
    echo ✓ Created default .env file
)

cd ..

echo.
echo ============================================================
echo    Checking Frontend Setup
echo ============================================================
echo.

cd frontend

echo Checking package.json...
if not exist "package.json" (
    echo ERROR: package.json not found!
    pause
    exit /b 1
)

echo Checking node_modules...
if exist "node_modules" (
    echo ✓ node_modules exists
) else (
    echo WARNING: node_modules not found
    echo Run SETUP_DEPENDENCIES.bat first
)

echo.
echo Checking .env.local...
if exist ".env.local" (
    echo ✓ .env.local exists
    type .env.local
) else (
    echo WARNING: .env.local not found (using defaults)
    echo Creating default .env.local file...
    echo VITE_API_URL=/api > .env.local
    echo ✓ Created default .env.local file
)

cd ..

echo.
echo ============================================================
echo    Test Backend Startup
echo ============================================================
echo.

echo Starting backend for 5 seconds to test...
cd backend
start /B python -m uvicorn main:app --host 127.0.0.1 --port 8000 >backend_test.log 2>&1

timeout /t 5 /nobreak >nul

echo Checking if backend started...
netstat -an | find "8000" | find "LISTENING" >nul
if errorlevel 1 (
    echo ERROR: Backend failed to start!
    echo Check backend_test.log for errors
    type backend_test.log
) else (
    echo ✓ Backend started successfully
)

REM Kill the test backend
taskkill /F /IM python.exe >nul 2>&1

cd ..

echo.
echo ============================================================
echo    Setup Verification Complete!
echo ============================================================
echo.
echo Next steps:
echo   1. If everything shows ✓, run RUN_Windows.bat
echo   2. If you see warnings, run SETUP_DEPENDENCIES.bat first
echo   3. Default login: admin / admin123
echo.
pause
