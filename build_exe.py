#!/usr/bin/env python3
"""
Build script to convert launcher.py to Windows executable using PyInstaller
Run this script on Windows to create the .exe file
"""

import subprocess
import sys
import os
from pathlib import Path

def install_pyinstaller():
    """Install PyInstaller if not already installed"""
    try:
        import PyInstaller
        print("✅ PyInstaller already installed")
    except ImportError:
        print("📦 Installing PyInstaller...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pyinstaller"])

def build_exe():
    """Build the executable"""
    print("\n" + "=" * 60)
    print("🔨 Building Attendance System Launcher.exe")
    print("=" * 60 + "\n")

    launcher_path = Path(__file__).parent / "launcher.py"

    if not launcher_path.exists():
        print(f"❌ launcher.py not found at {launcher_path}")
        return False

    # PyInstaller command
    cmd = [
        sys.executable,
        "-m",
        "PyInstaller",
        "--onefile",
        "--windowed",
        "--name", "Attendance-System",
        "--icon", "icon.ico" if Path("icon.ico").exists() else None,
        "--add-data", "backend:backend",
        "--add-data", "frontend:frontend",
        str(launcher_path),
    ]

    # Remove None values from command
    cmd = [c for c in cmd if c is not None]

    try:
        result = subprocess.run(cmd, cwd=Path(__file__).parent)
        if result.returncode == 0:
            print("\n" + "=" * 60)
            print("✅ Build Successful!")
            print("=" * 60)
            dist_path = Path(__file__).parent / "dist" / "Attendance-System.exe"
            print(f"\n📦 Executable created at: {dist_path}")
            print("\n✨ You can now share and run this .exe file on any Windows machine!")
            print("   (No Python installation required on target machine)")
            return True
        else:
            print(f"\n❌ Build failed with return code {result.returncode}")
            return False
    except Exception as e:
        print(f"❌ Build error: {e}")
        return False

if __name__ == "__main__":
    # Install PyInstaller
    install_pyinstaller()

    # Build exe
    if build_exe():
        sys.exit(0)
    else:
        sys.exit(1)
