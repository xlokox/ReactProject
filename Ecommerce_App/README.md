# E-commerce Mobile App

React Native mobile application that perfectly matches your website design and functionality using Expo.

## 🎯 **Perfect Website Match**

This mobile app is designed to be an **exact replica** of your website:
- ✅ **Same color scheme** (#059473 green theme)
- ✅ **Same login design** (two-column layout with image)
- ✅ **Same product layout** and styling
- ✅ **Same header structure** with search and cart
- ✅ **Same Redux state management**
- ✅ **Same API endpoints** and data flow
- ✅ **Same user experience** and navigation

## 🚀 **Features**

### **Customer Features (Matching Website):**
- 🔐 **Login/Register** - Exact website design
- 🏠 **Home Page** - Banner, categories, featured products
- 🛍️ **Product Browsing** - Search, filter, categories
- 🛒 **Shopping Cart** - Add/remove items, quantity management
- 📦 **Order Management** - Place orders, view history
- 👤 **User Dashboard** - Profile management
- 💳 **Checkout Process** - Shipping and payment
- ❤️ **Wishlist** - Save favorite products

### **Technical Features:**
- ✅ **Redux Toolkit** - Same state management as website
- ✅ **React Navigation** - Smooth navigation
- ✅ **Toast Notifications** - User feedback
- ✅ **Persistent Storage** - Login state and cart data
- ✅ **API Integration** - Connects to your backend
- ✅ **Responsive Design** - Works on all screen sizes

## 📋 **Prerequisites**

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app on your mobile device
- **Your backend server running on port 5001**

## 🛠️ **Quick Setup (Automatic)**

### **Option 1: Automatic Setup (Recommended)**
```bash
cd Ecommerce_App
node setup.js
npm install
npm start
```

### **Option 2: Manual Setup**

### 1. **Navigate to the app directory:**
```bash
cd Ecommerce_App
```

### 2. **Install dependencies:**
```bash
npm install
```

### 3. **Update API Configuration:**
Edit `src/api/api.js` and `src/services/socketService.js`:
```javascript
const BASE_URL = 'http://YOUR_IP_ADDRESS:5001/api';
```

**Get your IP address:**
- **Windows:** `ipconfig`
- **Mac/Linux:** `ifconfig`
- Look for your local network IP (usually 192.168.x.x)

### 4. **Start your backend server:**
```bash
# In your main Ecommerce directory
cd ../backend
npm start
```

### 5. **Verify backend connection:**
Test in browser: `http://YOUR_IP_ADDRESS:5001/api/test`

## 📱 **Running the App**

### 1. **Start Expo development server:**
```bash
npm start
```

### 2. **Scan QR code:**
- **iOS**: Use Camera app
- **Android**: Use Expo Go app

### 3. **The app will load on your device!**

## 🏗️ **Project Structure**

```
Ecommerce_App/
├── src/
│   ├── api/              # API configuration
│   ├── components/       # Reusable components
│   │   ├── Header.js     # Main header (matches website)
│   │   ├── Banner.js     # Home banner
│   │   ├── Categories.js # Category display
│   │   ├── FeatureProducts.js
│   │   ├── Products.js   # Product listings
│   │   └── Footer.js     # Footer component
│   ├── navigation/       # Navigation setup
│   ├── screens/          # All app screens
│   │   ├── LoginScreen.js    # Login (matches website)
│   │   ├── HomeScreen.js     # Home page
│   │   ├── ProductsScreen.js # Product browsing
│   │   ├── CartScreen.js     # Shopping cart
│   │   ├── OrdersScreen.js   # Order history
│   │   └── DashboardScreen.js # User dashboard
│   └── store/            # Redux store
│       ├── index.js      # Store configuration
│       └── reducers/     # All reducers
│           ├── authReducer.js
│           ├── homeReducer.js
│           ├── cardReducer.js
│           └── orderReducer.js
├── App.js               # Main app component
├── app.json            # Expo configuration
└── package.json        # Dependencies
```

## 🎨 **Design Matching**

### **Colors (Same as Website):**
- Primary: `#059473` (Green)
- Secondary: `#64748b` (Slate)
- Background: `#e2e8f0` (Light slate)
- Text: `#1f2937` (Dark gray)
- Error: `#ef4444` (Red)

### **Components:**
- **Header**: Same search bar, cart icon, user menu
- **Login**: Two-column layout with image (exact match)
- **Products**: Same card design and layout
- **Cart**: Same functionality and design
- **Footer**: Same links and styling

## 🔧 **API Integration**

The app uses the **exact same API endpoints** as your website:

### **Authentication:**
- `POST /customer/customer-login`
- `POST /customer/customer-register`

### **Products:**
- `GET /home/get-products`
- `GET /home/get-categorys`
- `GET /home/product-details/:slug`

### **Cart:**
- `POST /home/product/add-to-card`
- `GET /home/product/get-card-product/:userId`
- `DELETE /home/product/delete-card-product/:cardId`

### **Orders:**
- `POST /order/place-order`
- `GET /order/get-orders/:customerId/:status`

## 🧪 **Testing**

### **Demo Credentials:**
Use the same credentials as your website:
- Email: `customer@example.com`
- Password: `password123`

### **Test Flow:**
1. ✅ Login with demo credentials
2. ✅ Browse products on home page
3. ✅ Search for products
4. ✅ Add items to cart
5. ✅ View cart and update quantities
6. ✅ Place an order
7. ✅ View order history

## 🔍 **Troubleshooting**

### **Common Issues:**

1. **"Network Error"**
   - ✅ Check if backend server is running
   - ✅ Update BASE_URL with correct IP address
   - ✅ Ensure phone and computer are on same WiFi

2. **"Metro bundler issues"**
   - ✅ Clear cache: `expo start -c`
   - ✅ Delete node_modules: `rm -rf node_modules && npm install`

3. **"App won't load"**
   - ✅ Check Expo Go app is updated
   - ✅ Try restarting Expo server
   - ✅ Check for JavaScript errors in console

## 🚀 **Development**

### **Making Changes:**
1. Edit screens in `src/screens/`
2. Update components in `src/components/`
3. Modify Redux logic in `src/store/reducers/`
4. Changes will hot-reload automatically

### **Adding New Features:**
1. Follow the same patterns as website
2. Use Redux for state management
3. Match the website's design system
4. Test on both iOS and Android

## 📦 **Building for Production**

```bash
# Build for Android
expo build:android

# Build for iOS
expo build:ios
```

## 🎉 **Success!**

Your mobile app now perfectly matches your website! Users will have the same experience across web and mobile platforms.

**Key Benefits:**
- ✅ **Consistent branding** across platforms
- ✅ **Same user experience** on web and mobile
- ✅ **Shared backend** and data
- ✅ **Easy maintenance** with similar codebase structure
