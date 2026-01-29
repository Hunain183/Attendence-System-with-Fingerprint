@echo off
REM Check Python Version - Python 3.14 is NOT compatible!

cls
echo.
echo ============================================================
echo    PYTHON VERSION CHECK
echo ============================================================
echo.

python --version

echo.
echo ============================================================
echo    IMPORTANT: Python 3.14 is NOT compatible!
echo ============================================================
echo.
echo This application requires Python 3.11 or Python 3.12
echo.
echo Python 3.14 is too new and packages have not been updated
echo to support it yet.
echo.
echo ============================================================
echo    HOW TO FIX:
echo ============================================================
echo.
echo 1. Download Python 3.11 from:
echo    https://www.python.org/downloads/release/python-3119/
echo.
echo 2. Click "Windows installer (64-bit)" at the bottom
echo.
echo 3. Run the installer:
echo    - CHECK "Add Python to PATH"
echo    - Click "Install Now"
echo.
echo 4. Open a NEW Command Prompt and run:
echo    python --version
echo.
echo    It should show: Python 3.11.x
echo.
echo 5. Then run RUN_SIMPLE.bat again
echo.
echo ============================================================
echo.
pause
