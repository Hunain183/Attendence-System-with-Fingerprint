# Attendance System Launcher for Windows (PowerShell)
# Run in PowerShell with: powershell -ExecutionPolicy Bypass -File RUN_Windows.ps1

param(
    [switch]$BuildExe = $false
)

# Colors for output
$colors = @{
    Success = "Green"
    Error = "Red"
    Warning = "Yellow"
    Info = "Cyan"
}

function Write-Title {
    param([string]$Text)
    Write-Host ""
    Write-Host "=" * 60 -ForegroundColor Cyan
    Write-Host $Text -ForegroundColor Cyan
    Write-Host "=" * 60 -ForegroundColor Cyan
    Write-Host ""
}

function Write-Step {
    param([string]$Text)
    Write-Host "➤ $Text" -ForegroundColor Yellow
}

function Write-Success {
    param([string]$Text)
    Write-Host "✓ $Text" -ForegroundColor Green
}

function Write-Error {
    param([string]$Text)
    Write-Host "✗ $Text" -ForegroundColor Red
}

Write-Title "Attendance System - Launcher"

# Check if we're in the right directory
if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Error "Backend or Frontend directory not found"
    Write-Host "Please run this script from the project root directory"
    Read-Host "Press Enter to exit"
    exit 1
}

# Check prerequisites
Write-Step "Checking prerequisites..."

# Check Python
$pythonCheck = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "Python is not installed or not in PATH"
    Write-Host "Install from: https://www.python.org/downloads/"
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Success "Python found: $pythonCheck"

# Check Node.js
$nodeCheck = node --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "Node.js is not installed or not in PATH"
    Write-Host "Install from: https://nodejs.org/"
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Success "Node.js found: $nodeCheck"

# Install backend dependencies
Write-Step "Installing backend dependencies..."
Set-Location backend
pip install -q -r requirements.txt | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Warning "Some dependencies may not have installed"
}
Set-Location ..
Write-Success "Backend dependencies installed"

# Install frontend dependencies if needed
Write-Step "Checking frontend dependencies..."
Set-Location frontend
if (-not (Test-Path "node_modules")) {
    Write-Step "Installing frontend packages (this may take a while)..."
    npm install | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install frontend dependencies"
        Read-Host "Press Enter to exit"
        exit 1
    }
}
Write-Success "Frontend dependencies ready"
Set-Location ..

# Start backend
Write-Step "Starting Backend Server (Port 8000)..."
$backendProcess = Start-Process -FilePath python `
    -ArgumentList "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000", "--reload" `
    -WorkingDirectory "backend" `
    -PassThru `
    -NoNewWindow
Write-Success "Backend process started (PID: $($backendProcess.Id))"

# Wait for backend to start
Write-Step "Waiting for backend to start..."
Start-Sleep -Seconds 3

# Start frontend
Write-Step "Starting Frontend Server (Port 3000)..."
$env:VITE_API_URL = "/api"
$frontendProcess = Start-Process -FilePath cmd `
    -ArgumentList "/c", "npm run dev" `
    -WorkingDirectory "frontend" `
    -PassThru `
    -NoNewWindow
Write-Success "Frontend process started (PID: $($frontendProcess.Id))"

# Wait for frontend to start
Write-Step "Waiting for frontend to start..."
Start-Sleep -Seconds 5

# Open browser
Write-Step "Opening browser..."
Start-Process "http://localhost:3000"
Write-Success "Browser opened!"

Write-Title "Services are Running!"
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Green
Write-Host ""
Write-Host "Default Credentials:" -ForegroundColor Yellow
Write-Host "  Username: admin" -ForegroundColor Yellow
Write-Host "  Password: admin123" -ForegroundColor Yellow
Write-Host ""
Write-Host "To stop: Close this window and the browser will stop" -ForegroundColor Cyan
Write-Host ""

# Keep processes alive
Write-Host "Press Ctrl+C to stop all services..."
try {
    while ($true) {
        Start-Sleep -Seconds 1
        if ($backendProcess.HasExited -or $frontendProcess.HasExited) {
            Write-Error "One or more services have stopped"
            break
        }
    }
}
catch {
    Write-Host "Shutting down services..."
}
finally {
    # Cleanup
    if ($backendProcess -and -not $backendProcess.HasExited) {
        Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
        Write-Success "Backend stopped"
    }
    if ($frontendProcess -and -not $frontendProcess.HasExited) {
        Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
        Write-Success "Frontend stopped"
    }
}
