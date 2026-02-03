"""
Attendance System Launcher
This script is used by PyInstaller to create a standalone executable.
"""
import os
import sys
import webbrowser
import threading
import time
import logging

# Add the backend directory to path
if getattr(sys, 'frozen', False):
    BASE_DIR = os.path.dirname(sys.executable)
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

os.chdir(BASE_DIR)
sys.path.insert(0, BASE_DIR)

# Setup simple file logging for windowed mode
log_file = os.path.join(BASE_DIR, 'attendance_system.log')
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file, mode='w'),
    ]
)
logger = logging.getLogger(__name__)


def open_browser():
    """Open browser after a short delay to let the server start."""
    time.sleep(3)
    webbrowser.open('http://localhost:8000')


if __name__ == '__main__':
    try:
        logger.info('=' * 60)
        logger.info('Attendance System - Starting...')
        logger.info('=' * 60)
        logger.info(f'Working directory: {os.getcwd()}')
        logger.info('Opening browser to http://localhost:8000')
        logger.info('=' * 60)

        # Open browser in background
        threading.Thread(target=open_browser, daemon=True).start()

        # Import and run the FastAPI app
        import uvicorn
        from main import app
        
        # Configure uvicorn to work without console
        config = uvicorn.Config(
            app,
            host='127.0.0.1',
            port=8000,
            log_config=None,  # Disable uvicorn's default logging
            access_log=False  # Disable access logging
        )
        server = uvicorn.Server(config)
        server.run()
        
    except Exception as e:
        logger.error('Application failed to start')
        logger.error(str(e))
        logger.exception('Full traceback:')
        # Don't call input() in windowed mode - just exit
        sys.exit(1)
