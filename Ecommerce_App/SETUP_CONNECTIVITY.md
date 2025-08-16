# 🔗 Full Backend Connectivity Setup Guide

This guide will help you establish **complete synchronization** between your React Native app and your main website backend server.

## 🎯 **What's Included**

### **✅ Full Backend Integration:**
- Same API endpoints as your website
- Real-time Socket.io connection
- Shared authentication system
- Synchronized cart and user data
- Live chat functionality
- Order management system

### **✅ Enhanced Features:**
- Connection status monitoring
- Automatic reconnection
- Mobile-optimized CORS settings
- Error handling and logging
- Network diagnostics

## 🚀 **Setup Steps**

### **1. Update IP Address**

**In your React Native app:**
Edit `src/api/api.js` and `src/services/socketService.js`:

```javascript
// Replace this IP with your computer's actual IP address
const BASE_URL = 'http://192.168.1.100:5001/api';
```

**Find your IP address:**
- **Windows:** Open CMD and run `ipconfig`
- **Mac/Linux:** Open Terminal and run `ifconfig`
- Look for your local network IP (usually starts with 192.168.x.x)

### **2. Start Your Backend Server**

```bash
cd Ecommerce/backend
npm start
```

**Verify server is running:**
- Check console for: `🚀 Server is running on port 5001`
- Test in browser: `http://localhost:5001/api/test`

### **3. Install Mobile App Dependencies**

```bash
cd Ecommerce_App
npm install
```

### **4. Start Mobile App**

```bash
npm start
```

### **5. Test Connection**

1. **Scan QR code** with Expo Go app
2. **Check connection status** in the app (green indicator = connected)
3. **Test features:**
   - Login with existing website credentials
   - Browse products
   - Add items to cart
   - Real-time chat (if available)

## 🔧 **Backend Enhancements Made**

### **CORS Configuration:**
```javascript
// Enhanced CORS for mobile support
app.use(cors({
  origin: [
    'http://localhost:3000',
    /^http:\/\/192\.168\.\d+\.\d+:19006$/, // Mobile development
    /^http:\/\/10\.\d+\.\d+\.\d+:19006$/,  // Alternative networks
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Client-Type', 'X-Platform']
}));
```

### **Socket.io Mobile Support:**
```javascript
const io = new Server(server, {
  cors: {
    origin: [/* mobile development URLs */],
    methods: ['GET', 'POST'],
    credentials: true,
    allowEIO3: true // Support older clients
  },
  transports: ['websocket', 'polling'], // Both transports for mobile
  pingTimeout: 60000,
  pingInterval: 25000
});
```

## 📱 **Mobile App Features**

### **Connection Monitoring:**
- Real-time connection status indicator
- Automatic connection testing
- Network diagnostics and help

### **API Integration:**
- Same endpoints as website
- Automatic token management
- Mobile-specific headers
- Enhanced error handling

### **Socket.io Features:**
- Real-time chat functionality
- Live user presence
- Typing indicators
- Message read receipts
- Automatic reconnection

## 🔍 **Troubleshooting**

### **Connection Issues:**

**❌ "Network Error" or Red Connection Status:**

1. **Check Backend Server:**
   ```bash
   cd Ecommerce/backend
   npm start
   ```

2. **Verify IP Address:**
   - Update IP in `src/api/api.js`
   - Update IP in `src/services/socketService.js`
   - Use your actual local network IP

3. **Network Requirements:**
   - Phone and computer on same WiFi
   - Firewall not blocking port 5001
   - No VPN interfering with connection

4. **Test Backend Directly:**
   - Browser: `http://YOUR_IP:5001/api/test`
   - Should return: `{"message": "API is working"}`

### **Authentication Issues:**

**❌ Login not working:**

1. **Check existing users in your database**
2. **Use website credentials in mobile app**
3. **Verify customer auth routes are working**

### **Socket.io Issues:**

**❌ Real-time features not working:**

1. **Check socket connection in app logs**
2. **Verify Socket.io server is running**
3. **Check CORS settings for socket**

## 📊 **API Endpoints Available**

### **Authentication:**
- `POST /api/customer/login` - Customer login
- `POST /api/customer/register` - Customer registration
- `GET /api/customer/logout` - Customer logout

### **Products:**
- `GET /api/home/get-products` - Get all products
- `GET /api/home/get-categorys` - Get categories
- `GET /api/home/product-details/:slug` - Product details
- `GET /api/home/query-products` - Search/filter products

### **Cart:**
- `POST /api/home/product/add-to-card` - Add to cart
- `GET /api/home/product/get-card-product/:userId` - Get cart
- `PUT /api/home/product/quantity-inc/:cardId` - Increase quantity
- `PUT /api/home/product/quantity-dec/:cardId` - Decrease quantity
- `DELETE /api/home/product/delete-card-product/:cardId` - Remove item

### **Orders:**
- `POST /api/order/place-order` - Place order
- `GET /api/order/get-orders/:customerId/:status` - Get orders

### **Wishlist:**
- `POST /api/home/product/add-to-wishlist` - Add to wishlist
- `GET /api/home/product/get-wishlist-products/:userId` - Get wishlist
- `DELETE /api/home/product/remove-wishlist-product/:wishlistId` - Remove from wishlist

## ✅ **Success Indicators**

### **✅ Everything Working:**
- 🟢 Green connection status in app
- 🔐 Login works with website credentials
- 🛒 Cart syncs between web and mobile
- 📱 Real-time features working
- 📦 Orders can be placed and viewed

### **✅ Data Synchronization:**
- User login state shared
- Cart items synchronized
- Order history matches website
- Product data identical
- Categories and search working

## 🎉 **You're All Set!**

Your React Native app is now **fully connected** to your main website backend with:

- ✅ **Complete API integration**
- ✅ **Real-time Socket.io connection**
- ✅ **Shared authentication system**
- ✅ **Synchronized data across platforms**
- ✅ **Mobile-optimized performance**

Users can now seamlessly switch between your website and mobile app with **identical functionality and synchronized data**!
