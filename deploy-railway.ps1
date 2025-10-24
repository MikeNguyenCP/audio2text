# Railway Deployment Script for Audio2Text (PowerShell)
# This script automates the deployment process to Railway

param(
    [switch]$Help,
    [switch]$BuildOnly,
    [switch]$DeployOnly
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

# Check if Railway CLI is installed
function Test-RailwayCLI {
    Write-Status "Checking Railway CLI installation..."
    try {
        $null = railway --version
        Write-Success "Railway CLI is installed"
        return $true
    }
    catch {
        Write-Error "Railway CLI is not installed!"
        Write-Host "Please install it with: npm install -g @railway/cli"
        return $false
    }
}

# Check if user is logged in to Railway
function Test-RailwayAuth {
    Write-Status "Checking Railway authentication..."
    try {
        $null = railway whoami
        Write-Success "Logged in to Railway"
        return $true
    }
    catch {
        Write-Error "Not logged in to Railway!"
        Write-Host "Please login with: railway login"
        return $false
    }
}

# Run pre-deployment checks
function Invoke-PreDeploymentChecks {
    Write-Status "Running pre-deployment checks..."
    
    # Check if .env.local exists
    if (-not (Test-Path ".env.local")) {
        Write-Warning ".env.local not found. Make sure to set environment variables in Railway dashboard."
    }
    
    # Check Node.js version
    $NodeVersion = node --version
    Write-Status "Node.js version: $NodeVersion"
    
    # Check npm version
    $NpmVersion = npm --version
    Write-Status "npm version: $NpmVersion"
    
    Write-Success "Pre-deployment checks completed"
}

# Install dependencies
function Install-Dependencies {
    Write-Status "Installing dependencies..."
    npm ci
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Dependencies installed"
    } else {
        throw "Failed to install dependencies"
    }
}

# Run linting
function Invoke-Linting {
    Write-Status "Running ESLint..."
    npm run lint
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Linting passed"
    } else {
        throw "Linting failed"
    }
}

# Run type checking
function Invoke-TypeCheck {
    Write-Status "Running TypeScript type checking..."
    npm run type-check
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Type checking passed"
    } else {
        throw "Type checking failed"
    }
}

# Build the application
function Build-Application {
    Write-Status "Building application..."
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Application built successfully"
    } else {
        throw "Build failed"
    }
}

# Deploy to Railway
function Deploy-ToRailway {
    Write-Status "Deploying to Railway..."
    
    # Check if project is linked
    try {
        $null = railway status
    }
    catch {
        Write-Status "Linking to Railway project..."
        railway link
    }
    
    # Deploy
    railway up
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Deployment completed!"
    } else {
        throw "Deployment failed"
    }
}

# Show deployment URL
function Show-DeploymentURL {
    Write-Status "Getting deployment URL..."
    try {
        $DeploymentURL = railway domain
        if ($DeploymentURL) {
            Write-Success "Your app is deployed at: https://$DeploymentURL"
        } else {
            Write-Warning "Could not retrieve deployment URL. Check Railway dashboard."
        }
    }
    catch {
        Write-Warning "Could not retrieve deployment URL. Check Railway dashboard."
    }
}

# Main deployment function
function Start-Deployment {
    Write-Host ""
    Write-Status "Starting deployment process..."
    Write-Host ""
    
    if (-not (Test-RailwayCLI)) { exit 1 }
    if (-not (Test-RailwayAuth)) { exit 1 }
    Invoke-PreDeploymentChecks
    
    Write-Host ""
    Write-Status "Building application..."
    Install-Dependencies
    Invoke-Linting
    Invoke-TypeCheck
    Build-Application
    
    Write-Host ""
    Write-Status "Deploying to Railway..."
    Deploy-ToRailway
    
    Write-Host ""
    Show-DeploymentURL
    
    Write-Host ""
    Write-Success "🎉 Deployment completed successfully!"
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "1. Set environment variables in Railway dashboard if not already done"
    Write-Host "2. Test your deployed application"
    Write-Host "3. Monitor logs with: railway logs"
    Write-Host "4. Check status with: railway status"
    Write-Host ""
}

# Handle script parameters
if ($Help) {
    Write-Host "Railway Deployment Script for Audio2Text"
    Write-Host ""
    Write-Host "Usage: .\deploy-railway.ps1 [OPTIONS]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Help         Show this help message"
    Write-Host "  -BuildOnly    Only build the application (no deployment)"
    Write-Host "  -DeployOnly   Only deploy (skip build checks)"
    Write-Host ""
    Write-Host "Prerequisites:"
    Write-Host "  - Railway CLI installed and authenticated"
    Write-Host "  - Environment variables set in Railway dashboard"
    Write-Host "  - Azure OpenAI resources configured"
    Write-Host ""
    exit 0
}

if ($BuildOnly) {
    Write-Status "Build-only mode..."
    Install-Dependencies
    Invoke-Linting
    Invoke-TypeCheck
    Build-Application
    Write-Success "Build completed successfully!"
    exit 0
}

if ($DeployOnly) {
    Write-Status "Deploy-only mode..."
    if (-not (Test-RailwayCLI)) { exit 1 }
    if (-not (Test-RailwayAuth)) { exit 1 }
    Deploy-ToRailway
    Show-DeploymentURL
    Write-Success "Deployment completed!"
    exit 0
}

# Run main deployment
try {
    Start-Deployment
}
catch {
    Write-Error "Deployment failed: $($_.Exception.Message)"
    exit 1
}
