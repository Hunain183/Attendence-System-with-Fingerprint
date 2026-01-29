@echo off
REM Fix Pydantic Installation on Windows
REM This uses Pydantic v1 which is pure Python (no Rust required)

cls
echo.
echo ============================================================
echo    Fixing Pydantic Installation (Pure Python - No Rust)
echo ============================================================
echo.
echo This script installs Pydantic v1 which doesn't require Rust.
echo.

echo Step 1: Upgrading pip...
python -m pip install --upgrade pip
echo.

echo Step 2: Uninstalling old pydantic packages...
pip uninstall -y pydantic pydantic-core pydantic-settings 2>nul
echo.

echo Step 3: Installing Pydantic v1 (pure Python, no Rust needed)...
pip install pydantic==1.10.13 --force-reinstall
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
