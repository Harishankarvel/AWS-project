# PowerShell script to run the FastAPI backend with MySQL credentials
# Usage: .\run_backend.ps1

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $scriptDir

# Set environment variables for MySQL connection
$env:MYSQL_HOST = "127.0.0.1"
$env:MYSQL_PORT = "3306"
$env:MYSQL_USER = "root"
$env:MYSQL_PASSWORD = "hitman@2445"
$env:MYSQL_DB = "AWS"

# Install required Python packages (idempotent)
python -m pip install -r requirements.txt pymysql

# Start the FastAPI server on port 8000 with auto-reload
python -m uvicorn app:app --reload --port 8000
