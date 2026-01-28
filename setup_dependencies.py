#!/usr/bin/env python3
"""
Attendance System - Dependency Checker & Installer
This script checks and installs all required dependencies automatically
"""

import subprocess
import sys
import os
from pathlib import Path

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_header(text):
    print(f"\n{Colors.BLUE}{'=' * 70}")
    print(f"  {text}")
    print(f"{'=' * 70}{Colors.END}\n")

def print_success(text):
    print(f"{Colors.GREEN}✓ {text}{Colors.END}")

def print_error(text):
    print(f"{Colors.RED}✗ {text}{Colors.END}")

def print_warning(text):
    print(f"{Colors.YELLOW}⚠ {text}{Colors.END}")

def print_info(text):
    print(f"{Colors.BLUE}ℹ {text}{Colors.END}")

def run_command(cmd, cwd=None, silent=False):
    """Run a command and return success status"""
    try:
        if silent:
            subprocess.run(cmd, cwd=cwd, capture_output=True, check=True)
        else:
            subprocess.run(cmd, cwd=cwd, check=True)
        return True
    except:
        return False

def check_python():
    """Check Python installation"""
    print_info("Checking Python...")
    try:
        result = subprocess.run([sys.executable, "--version"], capture_output=True, text=True)
        version = result.stdout.strip()
        print_success(f"Python {version}")
        return True
    except:
        print_error("Python not found!")
        print_warning("Install Python from: https://www.python.org/downloads/")
        print_warning("During installation, check 'Add Python to PATH'")
        return False

def check_pip():
    """Check pip installation"""
    print_info("Checking pip...")
    try:
        result = subprocess.run([sys.executable, "-m", "pip", "--version"], capture_output=True, text=True)
        version = result.stdout.strip().split()[1]
        print_success(f"pip {version}")
        return True
    except:
        print_error("pip not found!")
        return False

def check_nodejs():
    """Check Node.js installation"""
    print_info("Checking Node.js...")
    try:
        result = subprocess.run(["node", "--version"], capture_output=True, text=True)
        version = result.stdout.strip()
        print_success(f"Node.js {version}")
        return True
    except:
        print_error("Node.js not found!")
        print_warning("Install Node.js from: https://nodejs.org/")
        print_warning("During installation, check 'Add to PATH'")
        return False

def check_npm():
    """Check npm installation"""
    print_info("Checking npm...")
    try:
        result = subprocess.run(["npm", "--version"], capture_output=True, text=True)
        version = result.stdout.strip()
        print_success(f"npm {version}")
        return True
    except:
        print_error("npm not found!")
        return False

def install_backend_deps(backend_dir):
    """Install Python backend dependencies"""
    req_file = backend_dir / "requirements.txt"
    if not req_file.exists():
        print_warning("requirements.txt not found in backend/")
        return False
    
    print_info("Installing Python dependencies...")
    if run_command(
        [sys.executable, "-m", "pip", "install", "-q", "-r", str(req_file)],
        cwd=backend_dir,
        silent=True
    ):
        print_success("Backend dependencies installed")
        return True
    else:
        print_warning("Some dependencies may not have installed properly")
        return False

def install_frontend_deps(frontend_dir):
    """Install Node.js frontend dependencies"""
    node_modules = frontend_dir / "node_modules"
    
    if node_modules.exists():
        print_success("Frontend dependencies already installed")
        return True
    
    print_info("Installing Node.js dependencies (this may take 1-2 minutes)...")
    if run_command(["npm", "install"], cwd=frontend_dir, silent=True):
        print_success("Frontend dependencies installed")
        return True
    else:
        print_warning("Some dependencies may not have installed properly")
        return False

def main():
    print_header("🎯 Attendance System - Dependency Checker")
    
    # Get project directory
    script_dir = Path(__file__).parent
    backend_dir = script_dir / "backend"
    frontend_dir = script_dir / "frontend"
    
    # Check project structure
    if not backend_dir.exists() or not frontend_dir.exists():
        print_error("Backend or frontend directory not found!")
        print_info("Make sure you run this from the project root directory")
        return False
    
    # Check system tools
    print_header("Checking System Tools")
    
    tools_ok = True
    tools_ok = check_python() and tools_ok
    tools_ok = check_pip() and tools_ok
    tools_ok = check_nodejs() and tools_ok
    tools_ok = check_npm() and tools_ok
    
    if not tools_ok:
        print_header("⚠️  Missing Required Tools")
        print_error("Please install the missing tools and try again:")
        print("  • Python 3.8+: https://www.python.org/downloads/")
        print("  • Node.js 16+: https://nodejs.org/")
        print("\nAfter installation, restart your terminal and run this script again.")
        return False
    
    # Install dependencies
    print_header("Installing Project Dependencies")
    
    install_backend_deps(backend_dir)
    install_frontend_deps(frontend_dir)
    
    print_header("✅ Setup Complete!")
    print("You can now run the application using:")
    print("  • Windows: Double-click RUN_Windows.bat")
    print("  • Windows: python launcher.py")
    print("  • PowerShell: RUN_Windows.ps1")
    print("\nYour browser will open automatically to http://localhost:3000")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
