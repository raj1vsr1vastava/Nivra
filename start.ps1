# PowerShell script to start both frontend and backend services

Write-Host "Starting Nivra Society Management System..." -ForegroundColor Blue

# Directory paths
$API_DIR = Join-Path -Path (Get-Location) -ChildPath "api"
$UI_DIR = Join-Path -Path (Get-Location) -ChildPath "ui"

# Check if directories exist
if (-not (Test-Path -Path $API_DIR)) {
    Write-Host "API directory not found at $API_DIR"
    exit 1
}

if (-not (Test-Path -Path $UI_DIR)) {
    Write-Host "UI directory not found at $UI_DIR"
    exit 1
}

# Create and activate Python virtual environment
Write-Host "Setting up Python virtual environment..." -ForegroundColor Green
Set-Location -Path $API_DIR
if (-not (Test-Path -Path "venv")) {
    python -m venv venv
}
& .\venv\Scripts\Activate.ps1

# Install requirements
# Write-Host "Installing Python dependencies..." -ForegroundColor Green
# pip install -r requirements.txt
# pip install setuptools wheel pip --upgrade
# pip install psycopg2 psycopg2-binary email-validator --force-reinstall
# pip install "pydantic[email]"

# Setup PostgreSQL database
Write-Host "Setting up PostgreSQL database..." -ForegroundColor Green
# Check for the PostgreSQL installation
$pgPath = "C:\Program Files\PostgreSQL\14\bin\psql.exe"
if (Test-Path -Path $pgPath) {
    # Run the database setup script if PostgreSQL is installed
    if (Test-Path -Path ".\setup_db.ps1") {
        & .\setup_db.ps1
    }
} else {
    Write-Host "PostgreSQL is not installed or not found at expected location: $pgPath" -ForegroundColor Red
    Write-Host "You can install it from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    Write-Host "Make sure to set the password to 'postgres' during installation to match your .env file." -ForegroundColor Yellow
    exit 1
}

# Start the backend
Write-Host "Starting Backend API server..." -ForegroundColor Green
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:API_DIR
    
    # Ensure we're using the virtual environment Python and it has the correct paths
    $venvPython = Join-Path -Path $using:API_DIR -ChildPath "venv\Scripts\python.exe"
    
    # Check if psycopg2 is installed properly in the venv
    Write-Host "Verifying psycopg2 installation..."
    & $venvPython -c "import sys; print(sys.path)"
    & $venvPython -c "try: import psycopg2; print('psycopg2 is installed properly ' + psycopg2.__version__); except ImportError as e: print(f'Error importing psycopg2: {e}')"
    
    # Set PYTHONPATH to include the virtual environment's site-packages
    $env:PYTHONPATH = Join-Path -Path $using:API_DIR -ChildPath "venv\Lib\site-packages"
    
    # Start the FastAPI server
    & $venvPython -m uvicorn main:app --reload
}

# Give the backend a moment to start
Start-Sleep -Seconds 2

# Start the frontend
Write-Host "Setting up Frontend dependencies..." -ForegroundColor Green
Set-Location -Path $UI_DIR
# Check if node_modules exists, if not install dependencies
if (-not (Test-Path -Path "$UI_DIR\node_modules")) {
    Write-Host "Installing npm dependencies..." -ForegroundColor Green
    npm install
}

Write-Host "Starting Frontend UI server..." -ForegroundColor Green
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:UI_DIR
    npm start
}

# Function to handle script termination
$cleanupAction = {
    Write-Host "`nShutting down servers..." -ForegroundColor Blue
    Stop-Job -Job $backendJob -ErrorAction SilentlyContinue
    Stop-Job -Job $frontendJob -ErrorAction SilentlyContinue
    Remove-Job -Job $backendJob -ErrorAction SilentlyContinue
    Remove-Job -Job $frontendJob -ErrorAction SilentlyContinue
    Write-Host "Servers stopped successfully." -ForegroundColor Green
    exit 0
}

# Register the cleanup function for script termination signals
try {
    # Keep the script running until manually terminated
    Write-Host "`nServers are running. Press Ctrl+C to stop both servers." -ForegroundColor Blue
    Write-Host "Backend: http://localhost:8000" -ForegroundColor Green
    Write-Host "Frontend: http://localhost:3000" -ForegroundColor Green
    
    # Wait for jobs to complete (or Ctrl+C)
    Wait-Job -Job $backendJob, $frontendJob
}
finally {
    # Run cleanup when script is terminated
    & $cleanupAction
}
