# 🚀 EasyShop E-commerce Project Startup Guide

This guide explains how to use the automated startup scripts for the EasyShop e-commerce project.

## 📁 Project Structure

```
ReactProject/
├── start-project.sh          # 🚀 Main startup script
├── stop-project.sh           # 🛑 Stop all services script
├── Ecommerce/
│   ├── backend/              # Node.js/Express API (Port 5001)
│   ├── frontend/             # React Website (Port 3000)
│   └── dashboard/            # Admin Dashboard (Port 3004)
└── Ecommerce_App/            # React Native Mobile App (Expo)
```

## 🎯 Quick Start

### Start All Services
```bash
./start-project.sh
```

### Stop All Services
```bash
./stop-project.sh
```

## 🔧 What the Startup Script Does

1. **Opens VS Code** with the project workspace
2. **Checks Dependencies** - Ensures Node.js, npm, and required tools are installed
3. **Cleans Up Ports** - Kills any existing processes on required ports
4. **Installs Dependencies** - Runs `npm install` if node_modules are missing
5. **Starts Services in Order:**
   - 🔧 **Backend Server** (Port 5001) - API and database
   - 🌐 **Frontend Website** (Port 3000) - Customer-facing website
   - 📊 **Admin Dashboard** (Port 3004) - Admin/seller management
   - 📱 **Mobile App** (Expo) - React Native app with QR code

## 🌐 Service URLs

After startup, you can access:

| Service | URL | Description |
|---------|-----|-------------|
| **Backend API** | http://localhost:5001 | REST API endpoints |
| **Frontend Website** | http://localhost:3000 | Customer shopping site |
| **Admin Dashboard** | http://localhost:3004 | Admin/seller management |
| **Mobile App** | Expo QR Code | Scan with Expo Go app |

## 🔑 Default Login Credentials

### Admin Dashboard Login
- **Email:** `admin@gmail.com`
- **Password:** `123456`

### Customer Registration
- Create new accounts through the frontend website
- Or use the mobile app registration

## 🛠️ Useful Endpoints

| Endpoint | Purpose |
|----------|---------|
| http://localhost:5001/api/health | Backend health check |
| http://localhost:5001/api/test | API connectivity test |
| http://localhost:3004/login | Admin dashboard login |

## 📱 Mobile App Setup

1. Install **Expo Go** app on your phone:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. After running `./start-project.sh`, scan the QR code displayed in terminal

3. The mobile app will load with full e-commerce functionality

## 🔧 Troubleshooting

### Port Already in Use
The script automatically kills existing processes on required ports. If issues persist:
```bash
./stop-project.sh
./start-project.sh
```

### Missing Dependencies
If you get dependency errors:
```bash
# Backend
cd Ecommerce/backend && npm install

# Frontend  
cd Ecommerce/frontend && npm install

# Dashboard
cd Ecommerce/dashboard && npm install

# Mobile App
cd Ecommerce_App && npm install
```

### MongoDB Connection Issues
Ensure MongoDB is running:
```bash
# macOS with Homebrew
brew services start mongodb-community

# Or check your MongoDB installation
```

### VS Code Not Opening
If VS Code doesn't open automatically:
- Install VS Code command line tools
- Or manually open: `code .` from the ReactProject directory

## 🛑 Stopping Services

### Graceful Shutdown
```bash
./stop-project.sh
```

### Force Stop (if needed)
```bash
# Kill specific ports
lsof -ti :5001 | xargs kill -9  # Backend
lsof -ti :3000 | xargs kill -9  # Frontend
lsof -ti :3004 | xargs kill -9  # Dashboard
lsof -ti :19006 | xargs kill -9 # Expo
```

## 📊 System Requirements

- **Node.js** 16+ 
- **npm** 8+
- **MongoDB** (local or remote)
- **VS Code** (optional, for automatic opening)
- **Expo CLI** (installed automatically)

## 🎉 Features Included

- ✅ **Full E-commerce Website** - Product browsing, cart, checkout
- ✅ **Admin Dashboard** - Product management, orders, analytics
- ✅ **Mobile App** - Native shopping experience
- ✅ **Real-time Chat** - Customer support system
- ✅ **Payment Integration** - Stripe payment processing
- ✅ **User Authentication** - JWT-based auth system
- ✅ **Role-based Access** - Admin, seller, customer roles

## 🚀 Development Workflow

1. **Start Development:**
   ```bash
   ./start-project.sh
   ```

2. **Make Changes** - Edit code in VS Code

3. **Hot Reload** - All services support hot reloading

4. **Test Changes** - Use the provided URLs to test

5. **Stop When Done:**
   ```bash
   ./stop-project.sh
   ```

---

**Happy Coding! 🎉**

For issues or questions, check the console output for detailed error messages.
