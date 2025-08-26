#!/bin/bash

# 🚀 EasyShop E-commerce Project Startup Script
# This script opens VS Code and starts all necessary services

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Project paths
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/Ecommerce/backend"
FRONTEND_DIR="$PROJECT_ROOT/Ecommerce/frontend"
DASHBOARD_DIR="$PROJECT_ROOT/Ecommerce/dashboard"
MOBILE_APP_DIR="$PROJECT_ROOT/Ecommerce_App"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${CYAN}================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}================================${NC}"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Function to kill process on port
kill_port() {
    if port_in_use $1; then
        print_warning "Port $1 is in use. Killing existing process..."
        lsof -ti :$1 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    print_status "Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            print_status "$service_name is ready! ✅"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$service_name failed to start within expected time"
    return 1
}

# Main startup function
main() {
    print_header "🚀 STARTING EASYSHOP E-COMMERCE PROJECT"
    
    # Check if we're in the right directory
    if [ ! -d "$BACKEND_DIR" ] || [ ! -d "$FRONTEND_DIR" ] || [ ! -d "$DASHBOARD_DIR" ] || [ ! -d "$MOBILE_APP_DIR" ]; then
        print_error "Project directories not found. Make sure you're running this script from the ReactProject root directory."
        exit 1
    fi
    
    # Check required commands
    print_status "Checking required dependencies..."
    
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    if ! command_exists code; then
        print_warning "VS Code command 'code' not found. VS Code will not be opened automatically."
    fi
    
    # Open VS Code (but don't wait for it)
    if command_exists code; then
        print_status "Opening VS Code..."
        code "$PROJECT_ROOT" >/dev/null 2>&1 &
        sleep 2
    fi
    
    # Clean up any existing processes on our ports
    print_status "Cleaning up existing processes..."
    kill_port 5001  # Backend
    kill_port 3000  # Frontend
    kill_port 3004  # Dashboard
    kill_port 19006 # Expo
    
    # Start Backend Server
    print_header "🔧 STARTING BACKEND SERVER (Port 5001)"
    if [ ! -d "$BACKEND_DIR/node_modules" ]; then
        print_status "Installing backend dependencies..."
        cd "$BACKEND_DIR" && npm install
    fi
    
    cd "$BACKEND_DIR"
    print_status "Starting backend server..."
    npm start > /dev/null 2>&1 &
    BACKEND_PID=$!
    
    # Wait for backend to be ready
    wait_for_service "http://localhost:5001/api/health" "Backend Server"
    
    # Start Frontend
    print_header "🌐 STARTING FRONTEND (Port 3000)"
    if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
        print_status "Installing frontend dependencies..."
        cd "$FRONTEND_DIR" && npm install
    fi
    
    cd "$FRONTEND_DIR"
    print_status "Starting frontend..."
    BROWSER=none npm start > /dev/null 2>&1 &
    FRONTEND_PID=$!
    
    # Start Dashboard
    print_header "📊 STARTING DASHBOARD (Port 3004)"
    if [ ! -d "$DASHBOARD_DIR/node_modules" ]; then
        print_status "Installing dashboard dependencies..."
        cd "$DASHBOARD_DIR" && npm install
    fi
    
    cd "$DASHBOARD_DIR"
    print_status "Starting dashboard..."
    BROWSER=none npm start > /dev/null 2>&1 &
    DASHBOARD_PID=$!
    
    # Start Mobile App (Expo)
    print_header "📱 STARTING MOBILE APP (Expo)"
    if [ ! -d "$MOBILE_APP_DIR/node_modules" ]; then
        print_status "Installing mobile app dependencies..."
        cd "$MOBILE_APP_DIR" && npm install
    fi
    
    if ! command_exists expo; then
        print_status "Installing Expo CLI globally..."
        npm install -g @expo/cli
    fi
    
    cd "$MOBILE_APP_DIR"
    print_status "Starting Expo development server..."
    npx expo start --tunnel > /dev/null 2>&1 &
    EXPO_PID=$!
    
    # Wait a bit for services to start
    sleep 10
    
    # Display service status
    print_header "🎉 PROJECT STARTUP COMPLETE"
    echo ""
    print_status "Services Status:"
    echo -e "${GREEN}✅ Backend Server:${NC}    http://localhost:5001"
    echo -e "${GREEN}✅ Frontend Website:${NC}  http://localhost:3000"
    echo -e "${GREEN}✅ Admin Dashboard:${NC}   http://localhost:3004"
    echo -e "${GREEN}✅ Mobile App (Expo):${NC} Scan QR code with Expo Go app"
    echo ""
    
    print_status "Default Login Credentials:"
    echo -e "${CYAN}Admin Login:${NC}"
    echo -e "  Email: admin@gmail.com"
    echo -e "  Password: 123456"
    echo ""
    
    print_status "Useful URLs:"
    echo -e "${BLUE}• Backend Health:${NC} http://localhost:5001/api/health"
    echo -e "${BLUE}• Backend Test:${NC}   http://localhost:5001/api/test"
    echo -e "${BLUE}• Admin Dashboard:${NC} http://localhost:3004/login"
    echo ""
    
    # Store PIDs for cleanup
    echo "$BACKEND_PID $FRONTEND_PID $DASHBOARD_PID $EXPO_PID" > "$PROJECT_ROOT/.service_pids"
    
    print_status "All services are running! Press Ctrl+C to stop all services."
    
    # Wait for user interrupt
    trap cleanup INT
    wait
}

# Cleanup function
cleanup() {
    print_header "🛑 STOPPING ALL SERVICES"
    
    if [ -f "$PROJECT_ROOT/.service_pids" ]; then
        read -r BACKEND_PID FRONTEND_PID DASHBOARD_PID EXPO_PID < "$PROJECT_ROOT/.service_pids"
        
        print_status "Stopping Backend Server (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null || true
        
        print_status "Stopping Frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null || true
        
        print_status "Stopping Dashboard (PID: $DASHBOARD_PID)..."
        kill $DASHBOARD_PID 2>/dev/null || true
        
        print_status "Stopping Expo (PID: $EXPO_PID)..."
        kill $EXPO_PID 2>/dev/null || true
        
        rm -f "$PROJECT_ROOT/.service_pids"
    fi
    
    # Kill any remaining processes on our ports
    kill_port 5001
    kill_port 3000
    kill_port 3004
    kill_port 19006
    
    print_status "All services stopped. Goodbye! 👋"
    exit 0
}

# Run main function
main "$@"
