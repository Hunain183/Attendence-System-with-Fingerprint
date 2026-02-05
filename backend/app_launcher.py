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
import socket

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


def is_port_in_use(port):
    """Check if a port is already in use."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.settimeout(1)
            s.connect(('127.0.0.1', port))
            return True
        except (socket.timeout, ConnectionRefusedError, OSError):
            return False


def check_backend_health():
    """Check if the backend is responding on port 8000."""
    try:
        import urllib.request
        with urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=2) as response:
            return response.status == 200
    except:
        return False


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
        
        # Check if backend is already running
        if is_port_in_use(8000):
            logger.info('Backend is already running on port 8000')
            if check_backend_health():
                logger.info('Backend health check passed - opening browser')
                webbrowser.open('http://localhost:8000')
                logger.info('Browser opened. Exiting launcher.')
                sys.exit(0)
            else:
                logger.warning('Port 8000 is in use but backend not responding')
                logger.warning('Please close the existing process and try again')
                sys.exit(1)
        
        logger.info('Starting backend server on port 8000...')
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
