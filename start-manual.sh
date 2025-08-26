#!/bin/bash

# Manual EasyShop Project Startup Guide
echo "🚀 EasyShop E-commerce Project Startup"
echo "======================================"
echo ""

# Open VS Code
echo "📝 Opening VS Code..."
code .

echo ""
echo "🔧 MANUAL STARTUP INSTRUCTIONS:"
echo ""
echo "Open 4 separate terminal windows/tabs and run these commands:"
echo ""

echo "1️⃣  BACKEND SERVER (Terminal 1):"
echo "   cd Ecommerce/backend"
echo "   npm start"
echo ""

echo "2️⃣  FRONTEND WEBSITE (Terminal 2):"
echo "   cd Ecommerce/frontend" 
echo "   npm start"
echo ""

echo "3️⃣  ADMIN DASHBOARD (Terminal 3):"
echo "   cd Ecommerce/dashboard"
echo "   npm start"
echo ""

echo "4️⃣  MOBILE APP (Terminal 4):"
echo "   cd Ecommerce_App"
echo "   npx expo start --tunnel"
echo ""

echo "🌐 After starting, access:"
echo "   • Backend API:      http://localhost:5001"
echo "   • Frontend Website: http://localhost:3000"
echo "   • Admin Dashboard:  http://localhost:3004"
echo "   • Mobile App:       Scan QR code from Expo terminal"
echo ""

echo "🔑 Admin Login:"
echo "   • Email:    admin@gmail.com"
echo "   • Password: 123456"
echo ""

echo "💡 TIP: Copy and paste the commands above into separate terminals"
echo ""

# Create individual startup scripts for each service
echo "📄 Creating individual startup scripts..."

# Backend script
cat > start-backend.sh << 'EOF'
#!/bin/bash
echo "🔧 Starting Backend Server..."
cd Ecommerce/backend
npm start
EOF
chmod +x start-backend.sh

# Frontend script  
cat > start-frontend.sh << 'EOF'
#!/bin/bash
echo "🌐 Starting Frontend Website..."
cd Ecommerce/frontend
npm start
EOF
chmod +x start-frontend.sh

# Dashboard script
cat > start-dashboard.sh << 'EOF'
#!/bin/bash
echo "📊 Starting Admin Dashboard..."
cd Ecommerce/dashboard
npm start
EOF
chmod +x start-dashboard.sh

# Mobile app script
cat > start-mobile.sh << 'EOF'
#!/bin/bash
echo "📱 Starting Mobile App (Expo)..."
cd Ecommerce_App
npx expo start --tunnel
EOF
chmod +x start-mobile.sh

echo "✅ Created individual startup scripts:"
echo "   • ./start-backend.sh"
echo "   • ./start-frontend.sh" 
echo "   • ./start-dashboard.sh"
echo "   • ./start-mobile.sh"
echo ""
echo "You can now run each script in a separate terminal window!"
