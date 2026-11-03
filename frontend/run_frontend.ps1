# PowerShell script to run the React Vite frontend
# Usage: .\run_frontend.ps1

# Ensure we are in the script's directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $scriptDir

# Install Node dependencies (idempotent)
if (Test-Path "node_modules") {
  Write-Host "Node modules already installed. Skipping npm install."
} else {
  npm install
}

# Start the Vite development server (default port 5173)
npm run dev
