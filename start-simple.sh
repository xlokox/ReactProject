#!/bin/bash

# Simple EasyShop Project Startup Script
echo "🚀 Starting EasyShop E-commerce Project..."

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Open VS Code
echo "📝 Opening VS Code..."
code "$PROJECT_ROOT"

# Function to open new terminal and run command
run_in_new_terminal() {
    local title=$1
    local command=$2
    local dir=$3
    
    echo "🔧 Starting $title..."
    
    # For macOS Terminal
    if [[ "$OSTYPE" == "darwin"* ]]; then
        osascript -e "
        tell application \"Terminal\"
            do script \"cd '$dir' && echo '🚀 Starting $title...' && $command\"
            set custom title of front window to \"$title\"
        end tell"
    # For Linux with gnome-terminal
    elif command -v gnome-terminal >/dev/null 2>&1; then
        gnome-terminal --title="$title" --working-directory="$dir" -- bash -c "echo '🚀 Starting $title...' && $command; exec bash"
    # For other systems, try xterm
    elif command -v xterm >/dev/null 2>&1; then
        xterm -title "$title" -e "cd '$dir' && echo '🚀 Starting $title...' && $command; bash" &
    else
        echo "⚠️  Could not detect terminal. Please manually run:"
        echo "   cd $dir && $command"
    fi
    
    sleep 2
}

# Start services in separate terminals
echo ""
echo "🔧 Starting Backend Server..."
run_in_new_terminal "Backend Server" "npm start" "$PROJECT_ROOT/Ecommerce/backend"

echo "🌐 Starting Frontend Website..."
run_in_new_terminal "Frontend Website" "npm start" "$PROJECT_ROOT/Ecommerce/frontend"

echo "📊 Starting Admin Dashboard..."
run_in_new_terminal "Admin Dashboard" "npm start" "$PROJECT_ROOT/Ecommerce/dashboard"

echo "📱 Starting Mobile App (Expo)..."
run_in_new_terminal "Mobile App - Expo" "npx expo start --tunnel" "$PROJECT_ROOT/Ecommerce_App"

echo ""
echo "✅ All services are starting in separate terminal windows!"
echo ""
echo "🌐 Service URLs (will be available in ~30 seconds):"
echo "   • Backend API:      http://localhost:5001"
echo "   • Frontend Website: http://localhost:3000"
echo "   • Admin Dashboard:  http://localhost:3004"
echo "   • Mobile App:       Scan QR code in Expo terminal"
echo ""
echo "🔑 Admin Login Credentials:"
echo "   • Email:    admin@gmail.com"
echo "   • Password: 123456"
echo ""
echo "📝 VS Code is now open with your project!"
echo ""
echo "To stop all services, close the terminal windows or run: ./stop-project.sh"
