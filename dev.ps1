<#
dev.ps1 - helper to prepare and run the dev server for GoNSales

Behavior:
- Checks for npm. If missing and winget is available, attempts to install Node.js LTS with winget.
- Runs `npm install` to install dev dependencies.
- Runs `npm run dev` to start the static server.

Run this from PowerShell in the project root. You may need to run PowerShell as Administrator for the winget install step.
#>

param()

function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Err($msg) { Write-Host "[ERROR] $msg" -ForegroundColor Red }

Write-Info "Starting dev helper..."

Set-Location -Path (Split-Path -Path $MyInvocation.MyCommand.Definition -Parent)

if (Get-Command npm -ErrorAction SilentlyContinue) {
    Write-Info "npm detected"
} else {
    Write-Info "npm not found. Attempting to install Node.js LTS via winget..."
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        try {
            Write-Info "Installing Node.js LTS (this may require elevation)..."
            winget install --id OpenJS.NodeJS.LTS -e --silent
            Write-Info "winget install finished. You may need to restart PowerShell if npm is still unavailable."
        } catch {
            Write-Err "winget install failed: $_. Exception.Message"
            Write-Err "Please install Node.js manually from https://nodejs.org and re-run this script."
            exit 1
        }
    } else {
        Write-Err "winget not found. Please install Node.js from https://nodejs.org and re-run this script."
        exit 1
    }

    # re-check npm
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        Write-Err "npm still not found. Please restart PowerShell or add npm to PATH, then re-run this script."
        exit 1
    }
}

Write-Info "Installing npm dependencies (http-server)..."
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Err "npm install failed. Fix npm/npm permissions and re-run this script."
    exit 1
}

Write-Info "Starting dev server (npm run dev)..."
npm run dev
