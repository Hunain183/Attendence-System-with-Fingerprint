"""
Attendance System Launcher
This script is used by PyInstaller to create a standalone executable.
"""
import os
import sys
import webbrowser
import threading
import time
import traceback

# Add the backend directory to path
if getattr(sys, 'frozen', False):
    BASE_DIR = os.path.dirname(sys.executable)
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

os.chdir(BASE_DIR)
sys.path.insert(0, BASE_DIR)


def open_browser():
    """Open browser after a short delay to let the server start."""
    time.sleep(3)
    webbrowser.open('http://localhost:8000')


if __name__ == '__main__':
    try:
        print('=' * 60)
        print('  Attendance System - Starting...')
        print('=' * 60)
        print(f'  Working directory: {os.getcwd()}')
        print('  Opening browser to http://localhost:8000')
        print('  Press Ctrl+C to stop the server')
        print('=' * 60)
        print()

        # Open browser in background
        threading.Thread(target=open_browser, daemon=True).start()

        # Import and run the FastAPI app
        import uvicorn
        from main import app
        uvicorn.run(app, host='127.0.0.1', port=8000)
        
    except Exception as e:
        print()
        print('=' * 60)
        print('  ERROR: Application failed to start')
        print('=' * 60)
        print(str(e))
        print()
        traceback.print_exc()
        print()
        print('Press Enter to exit...')
        input()
        sys.exit(1)
