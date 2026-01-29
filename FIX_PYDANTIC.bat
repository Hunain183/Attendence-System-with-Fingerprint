@echo off
REM Fix Pydantic Installation on Windows
REM Run this if you get errors about Rust or pydantic-core

cls
echo.
echo ============================================================
echo    Fixing Pydantic Installation (No Rust Required)
echo ============================================================
echo.

echo Step 1: Upgrading pip...
python -m pip install --upgrade pip
echo.

echo Step 2: Installing pydantic-core from pre-built wheel...
pip install pydantic-core==2.14.6 --prefer-binary --force-reinstall
echo.

echo Step 3: Installing pydantic...
pip install pydantic==2.5.3 --prefer-binary --force-reinstall
echo.

echo Step 4: Installing remaining dependencies...
cd backend
pip install --prefer-binary -r requirements.txt
cd ..
echo.

echo ============================================================
echo    Fix Complete!
echo ============================================================
echo.
echo Now try running RUN_SIMPLE.bat again.
echo.
pause
