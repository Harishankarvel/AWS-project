# PowerShell script to run the FastAPI backend
# Usage from project root: .\run_backend.ps1
# Or from backend directory: .\run_backend.ps1

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$backendDir = Join-Path $projectRoot "backend"

if (-not (Test-Path $backendDir)) {
    # If already running inside backend directory
    $backendDir = $projectRoot
}

Set-Location $backendDir

# Set environment variables for MySQL connection
$env:MYSQL_HOST = "127.0.0.1"
$env:MYSQL_PORT = "3306"
$env:MYSQL_USER = "root"
$env:MYSQL_PASSWORD = "hitman@2445"
$env:MYSQL_DB = "AWS"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Starting FarmFresh FastAPI Backend Server" -ForegroundColor Green
Write-Host "Directory: $backendDir" -ForegroundColor Yellow
Write-Host "Database : $env:MYSQL_DB on $env:MYSQL_HOST" -ForegroundColor Yellow
Write-Host "API URL  : http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "Docs URL : http://127.0.0.1:8000/docs" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan

# Start FastAPI server on port 8000
python -m uvicorn app:app --reload --port 8000
