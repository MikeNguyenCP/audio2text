#!/bin/bash

# Railway Deployment Script for Audio2Text
# This script automates the deployment process to Railway

set -e  # Exit on any error

echo "🚀 Audio2Text Railway Deployment Script"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Railway CLI is installed
check_railway_cli() {
    print_status "Checking Railway CLI installation..."
    if ! command -v railway &> /dev/null; then
        print_error "Railway CLI is not installed!"
        echo "Please install it with: npm install -g @railway/cli"
        exit 1
    fi
    print_success "Railway CLI is installed"
}

# Check if user is logged in to Railway
check_railway_auth() {
    print_status "Checking Railway authentication..."
    if ! railway whoami &> /dev/null; then
        print_error "Not logged in to Railway!"
        echo "Please login with: railway login"
        exit 1
    fi
    print_success "Logged in to Railway"
}

# Run pre-deployment checks
pre_deployment_checks() {
    print_status "Running pre-deployment checks..."
    
    # Check if .env.local exists
    if [ ! -f ".env.local" ]; then
        print_warning ".env.local not found. Make sure to set environment variables in Railway dashboard."
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node --version)
    print_status "Node.js version: $NODE_VERSION"
    
    # Check npm version
    NPM_VERSION=$(npm --version)
    print_status "npm version: $NPM_VERSION"
    
    print_success "Pre-deployment checks completed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm ci
    print_success "Dependencies installed"
}

# Run linting
run_linting() {
    print_status "Running ESLint..."
    npm run lint
    print_success "Linting passed"
}

# Run type checking
run_type_check() {
    print_status "Running TypeScript type checking..."
    npm run type-check
    print_success "Type checking passed"
}

# Build the application
build_application() {
    print_status "Building application..."
    npm run build
    print_success "Application built successfully"
}

# Deploy to Railway
deploy_to_railway() {
    print_status "Deploying to Railway..."
    
    # Check if project is linked
    if ! railway status &> /dev/null; then
        print_status "Linking to Railway project..."
        railway link
    fi
    
    # Deploy
    railway up
    print_success "Deployment completed!"
}

# Show deployment URL
show_deployment_url() {
    print_status "Getting deployment URL..."
    DEPLOYMENT_URL=$(railway domain)
    if [ ! -z "$DEPLOYMENT_URL" ]; then
        print_success "Your app is deployed at: https://$DEPLOYMENT_URL"
    else
        print_warning "Could not retrieve deployment URL. Check Railway dashboard."
    fi
}

# Main deployment function
main() {
    echo ""
    print_status "Starting deployment process..."
    echo ""
    
    check_railway_cli
    check_railway_auth
    pre_deployment_checks
    
    echo ""
    print_status "Building application..."
    install_dependencies
    run_linting
    run_type_check
    build_application
    
    echo ""
    print_status "Deploying to Railway..."
    deploy_to_railway
    
    echo ""
    show_deployment_url
    
    echo ""
    print_success "🎉 Deployment completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Set environment variables in Railway dashboard if not already done"
    echo "2. Test your deployed application"
    echo "3. Monitor logs with: railway logs"
    echo "4. Check status with: railway status"
    echo ""
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Railway Deployment Script for Audio2Text"
        echo ""
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --build-only   Only build the application (no deployment)"
        echo "  --deploy-only  Only deploy (skip build checks)"
        echo ""
        echo "Prerequisites:"
        echo "  - Railway CLI installed and authenticated"
        echo "  - Environment variables set in Railway dashboard"
        echo "  - Azure OpenAI resources configured"
        echo ""
        exit 0
        ;;
    --build-only)
        print_status "Build-only mode..."
        install_dependencies
        run_linting
        run_type_check
        build_application
        print_success "Build completed successfully!"
        exit 0
        ;;
    --deploy-only)
        print_status "Deploy-only mode..."
        check_railway_cli
        check_railway_auth
        deploy_to_railway
        show_deployment_url
        print_success "Deployment completed!"
        exit 0
        ;;
    "")
        main
        ;;
    *)
        print_error "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac
