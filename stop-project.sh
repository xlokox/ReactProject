#!/bin/bash

# 🛑 EasyShop E-commerce Project Stop Script
# This script stops all running services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_header() {
    echo -e "${CYAN}================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}================================${NC}"
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Function to kill process on port
kill_port() {
    if port_in_use $1; then
        print_status "Stopping service on port $1..."
        lsof -ti :$1 | xargs kill -9 2>/dev/null || true
        sleep 1
    else
        print_status "No service running on port $1"
    fi
}

print_header "🛑 STOPPING EASYSHOP E-COMMERCE PROJECT"

# Stop services by PID if available
if [ -f "$PROJECT_ROOT/.service_pids" ]; then
    print_status "Stopping services using stored PIDs..."
    read -r BACKEND_PID FRONTEND_PID DASHBOARD_PID EXPO_PID < "$PROJECT_ROOT/.service_pids"
    
    [ ! -z "$BACKEND_PID" ] && kill $BACKEND_PID 2>/dev/null || true
    [ ! -z "$FRONTEND_PID" ] && kill $FRONTEND_PID 2>/dev/null || true
    [ ! -z "$DASHBOARD_PID" ] && kill $DASHBOARD_PID 2>/dev/null || true
    [ ! -z "$EXPO_PID" ] && kill $EXPO_PID 2>/dev/null || true
    
    rm -f "$PROJECT_ROOT/.service_pids"
fi

# Kill processes on specific ports
print_status "Stopping services on ports..."
kill_port 5001  # Backend
kill_port 3000  # Frontend
kill_port 3004  # Dashboard
kill_port 19006 # Expo

# Kill any remaining Node.js processes related to the project
print_status "Cleaning up remaining processes..."
pkill -f "npm start" 2>/dev/null || true
pkill -f "expo start" 2>/dev/null || true
pkill -f "react-scripts start" 2>/dev/null || true

print_status "All services stopped successfully! ✅"
echo ""
print_status "To restart the project, run: ./start-project.sh"
