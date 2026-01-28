#!/usr/bin/env python3
"""
Attendance System Launcher
Starts both backend and frontend servers and opens browser automatically
"""

import os
import sys
import time
import webbrowser
import subprocess
import signal
from pathlib import Path
import socket

def is_port_open(host='localhost', port=8000, timeout=1):
    """Check if a port is open"""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(timeout)
    try:
        result = sock.connect_ex((host, port))
        return result == 0
    except:
        return False
    finally:
        sock.close()

def wait_for_port(port, timeout=30, host='localhost'):
    """Wait for a port to be open"""
    start_time = time.time()
    while time.time() - start_time < timeout:
        if is_port_open(host, port):
            return True
        time.sleep(0.5)
    return False

def check_and_install_dependencies():
    """Check for required tools and install them if needed"""
    print("\n" + "=" * 60)
    print("📦 Checking Dependencies")
    print("=" * 60)
    
    # Check Python
    print("\n✓ Python:", end=" ")
    try:
        import subprocess
        result = subprocess.run([sys.executable, "--version"], capture_output=True, text=True)
        print(result.stdout.strip())
    except:
        print("❌ Not found")
    
    # Check pip
    print("✓ pip:", end=" ")
    try:
        result = subprocess.run([sys.executable, "-m", "pip", "--version"], capture_output=True, text=True)
        print(result.stdout.strip().split()[0:2])
    except:
        print("❌ Not found")
    
    # Check Node.js
    print("✓ Node.js:", end=" ")
    try:
        result = subprocess.run(["node", "--version"], capture_output=True, text=True)
        print(result.stdout.strip())
    except Exception as e:
        print("❌ Not found - trying to install...")
        print(f"   Error: {e}")
        print("\n   ⚠️  Node.js is required but not installed")
        print("   Please install from: https://nodejs.org/")
        input("\n   Press Enter after installing Node.js...")
    
    # Check npm
    print("✓ npm:", end=" ")
    try:
        result = subprocess.run(["npm", "--version"], capture_output=True, text=True)
        print(result.stdout.strip())
    except:
        print("❌ Not found")

def main():
    # Get the directory where this script/exe is located
    if getattr(sys, 'frozen', False):
        # If running as exe
        base_dir = Path(sys.executable).parent
    else:
        # If running as script
        base_dir = Path(__file__).parent

    # Expected directory structure
    backend_dir = base_dir / 'backend'
    frontend_dir = base_dir / 'frontend'

    print("=" * 60)
    print("🎯 Attendance System - Starting Services")
    print("=" * 60)
    
    # Check dependencies
    check_and_install_dependencies()

    # Check if directories exist
    if not backend_dir.exists():
        print(f"❌ Backend directory not found: {backend_dir}")
        print("Make sure you run this from the project root directory")
        input("Press Enter to exit...")
        return

    if not frontend_dir.exists():
        print(f"❌ Frontend directory not found: {frontend_dir}")
        print("Make sure you run this from the project root directory")
        input("Press Enter to exit...")
        return

    # Install backend dependencies
    print("\n📦 Installing Backend Dependencies...")
    backend_req = backend_dir / 'requirements.txt'
    if backend_req.exists():
        try:
            subprocess.run(
                [sys.executable, "-m", "pip", "install", "-q", "-r", str(backend_req)],
                cwd=backend_dir,
                check=False
            )
            print("✅ Backend dependencies installed")
        except Exception as e:
            print(f"⚠️  Backend dependency installation warning: {e}")

    # Install frontend dependencies
    print("\n📦 Installing Frontend Dependencies...")
    node_modules = frontend_dir / 'node_modules'
    if not node_modules.exists():
        try:
            print("   Running: npm install (this may take 1-2 minutes)...")
            subprocess.run(
                ["npm", "install"],
                cwd=frontend_dir,
                check=False,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            print("✅ Frontend dependencies installed")
        except Exception as e:
            print(f"⚠️  Frontend dependency installation warning: {e}")
            print("   Trying to continue anyway...")
    else:
        print("✅ Frontend dependencies already installed")

    processes = []

    try:
        # Start backend
        print("\n📡 Starting Backend Server (Port 8000)...")
        backend_cmd = [
            sys.executable,
            "-m",
            "uvicorn",
            "main:app",
            "--host",
            "127.0.0.1",
            "--port",
            "8000",
        ]
        backend_process = subprocess.Popen(
            backend_cmd,
            cwd=backend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if sys.platform == 'win32' else 0
        )
        processes.append(("Backend", backend_process))

        # Wait for backend to be ready
        print("⏳ Waiting for backend to start...")
        if wait_for_port(8000):
            print("✅ Backend is running on http://localhost:8000")
        else:
            print("⚠️  Backend may not have started properly, but continuing...")

        # Start frontend
        print("\n🎨 Starting Frontend Server (Port 3000)...")
        time.sleep(1)  # Give backend time to fully start

        # Set environment variables for frontend
        env = os.environ.copy()
        env['VITE_API_URL'] = '/api'

        frontend_cmd = [
            "npm",
            "run",
            "dev",
        ]
        frontend_process = subprocess.Popen(
            frontend_cmd,
            cwd=frontend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            env=env,
            creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if sys.platform == 'win32' else 0
        )
        processes.append(("Frontend", frontend_process))

        # Wait for frontend to be ready
        print("⏳ Waiting for frontend to start...")
        if wait_for_port(3000):
            print("✅ Frontend is running on http://localhost:3000")
        else:
            print("⚠️  Frontend may not have started properly, but continuing...")

        # Open browser
        print("\n🌐 Opening browser...")
        time.sleep(2)  # Give frontend time to fully start
        webbrowser.open('http://localhost:3000')
        print("✅ Browser opened!")

        print("\n" + "=" * 60)
        print("🚀 Services are running!")
        print("=" * 60)
        print("\n📍 Frontend: http://localhost:3000")
        print("📍 Backend: http://localhost:8000")
        print("\n💡 Default credentials:")
        print("   Username: admin")
        print("   Password: admin123")
        print("\n⚠️  Keep this window open while using the application")
        print("   Press Ctrl+C to stop all services\n")

        # Wait for interruption
        while True:
            time.sleep(1)

    except KeyboardInterrupt:
        print("\n\n⏹️  Shutting down services...")
    except Exception as e:
        print(f"\n❌ Error: {e}")
    finally:
        # Cleanup
        for name, process in reversed(processes):
            try:
                if sys.platform == 'win32':
                    # On Windows, use taskkill to terminate process tree
                    os.kill(process.pid, signal.SIGTERM)
                    process.terminate()
                else:
                    process.terminate()
                    process.wait(timeout=5)
            except:
                pass

        print("✅ All services stopped")
        sys.exit(0)

if __name__ == '__main__':
    main()
