import React, { useRef, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, FlatList, Dimensions, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { RecentlyViewedProvider, useRecentlyViewed } from './src/context/RecentlyViewedContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { CartProvider, useCart } from './src/context/CartContext';
import RealLoginScreen from './src/screens/LoginScreen';
import RealRegisterScreen from './src/screens/RegisterScreen';
import RealCartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import OrderConfirmationScreen from './src/screens/OrderConfirmationScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import ChatBotScreen from './src/screens/ChatBotScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import OrderDetailScreen from './src/screens/OrderDetailScreen';
import FloatingChatButton from './src/components/FloatingChatButton';
import GlobalFloatingChatButton from './src/components/GlobalFloatingChatButton';
import getProductImageSource from './src/utils/image';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');
const ITEM_WIDTH = width - 30;

// API BASE URL - prefer env; derive device-reachable fallback in dev
import Constants from 'expo-constants';

const resolveApiBaseUrl = () => {

  const cfg = Constants?.expoConfig?.extra?.apiUrl;
  // If env config is set and not localhost, use it
  if (cfg && !/localhost|127\.0\.0\.1/i.test(cfg)) return cfg;

  // Try to derive LAN IP from Expo hostUri (works when using 'LAN' in Expo)
  const hostUri = (Constants?.expoConfig?.hostUri || Constants?.expoGoConfig?.hostUri || '').toString();
  const host = hostUri.split(':')[0];
  const isIp = /^[0-9.]+$/.test(host);
  if (isIp) return `http://${host}:5001/api`;

  // Fallback to configured value or localhost (simulator only)
  return cfg || 'http://localhost:5001/api';
};

const API_BASE_URL = resolveApiBaseUrl();
console.log('API_BASE_URL ->', API_BASE_URL);


// Image helpers: safe product image selection with placeholder fallback
// DEPRECATED: image helpers moved to src/utils/image.js

// API FUNCTIONS - FETCH REAL DATA FROM YOUR BACKEND
const fetchCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/home/get-categorys`);
    const data = await response.json();
    return data.categorys || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

const fetchProducts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/home/get-products`);
    const data = await response.json();
    return {
      products: data.products || [],
      latest_product: data.latest_product || [],
      topRated_product: data.topRated_product || [],
      discount_product: data.discount_product || []
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      products: [],
      latest_product: [],
      topRated_product: [],
      discount_product: []
    };
  }
};



// HERO BANNERS — placeholder slides used only when no campaigns exist in DB
const PLACEHOLDER_BANNERS = [
  {
    _id: 'ph_sale',
    banner: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=2940&q=80',
    label: 'Our Latest Deals',
    action: { type: 'sale' }
  },
  {
    _id: 'ph_electronics',
    banner: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=2940&q=80',
    label: 'Our Newst Electronics',
    action: { type: 'category', category: 'Electronics' }
  },
  {
    _id: 'ph_toys',
    banner: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1600&q=80',
    label: 'Our Newst Toys',
    action: { type: 'category', category: 'Toys' }
  }
];

// Parse CTA link from dashboard campaign into a mobile action
const parseAction = (link) => {
  try {
    if (!link || typeof link !== 'string') return { type: 'sale' };
    const url = new URL(link, 'http://localhost'); // base for relative paths
    const cat = url.searchParams.get('category');
    if (cat) return { type: 'category', category: decodeURIComponent(cat) };
    return { type: 'sale' };
  } catch (e) {
    return { type: 'sale' };
  }
};


// Simple Login Screen
function LoginScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>🛒 E-Shop</Text>
        <Text style={styles.subtitle}>Welcome Back!</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#059473" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#059473" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#9ca3af"
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerLink}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.registerText}>Don't have an account? Register</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// EXACT HOME SCREEN LIKE YOUR WEBSITE - WITH REAL API DATA
function HomeScreen({ navigation }) {
  const bannerRef = useRef(null);
  const [currentBannerIndex, setCurrentBannerIndex] = React.useState(0);
  const [showCategoryDropdown, setShowCategoryDropdown] = React.useState(false);
  const [categories, setCategories] = React.useState([]);
  const [selectedCategory, setSelectedCategory] = React.useState('All Category');
  const [searchValue, setSearchValue] = React.useState('');
  // const { recentlyViewed, addToRecentlyViewed } = useRecentlyViewed();
  const recentlyViewed = [];
  const addToRecentlyViewed = () => {};

  // Cart and Auth context
  const { user } = useAuth();
  const { addToCart: addToCartContext } = useCart();
  const [loadingProductId, setLoadingProductId] = React.useState(null);


  // Mobile hero banners - loaded from backend, with placeholders when empty
  const [banners, setBanners] = React.useState(PLACEHOLDER_BANNERS);

  // API-driven product selections
  const [topRatedProducts, setTopRatedProducts] = React.useState([]);
  const [discountProducts, setDiscountProducts] = React.useState([]);
  const [productsCount, setProductsCount] = React.useState(0);
  const flattenRows = (rows) => Array.isArray(rows) ? rows.flat().filter(Boolean) : [];

  // Featured products rotation state (dynamic mix)
  const [featuredPool, setFeaturedPool] = React.useState([]);
  const [featuredProducts, setFeaturedProducts] = React.useState([]);

  // Helpers
  const dedupeById = (arr) => {
    const seen = new Set();
    return arr.filter((p) => {
      const id = p?._id;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  };
  const pickRandom = (arr, count = 4) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, count);
  };

  // Rotate Featured Products every 2 minutes
  React.useEffect(() => {
    if (!featuredPool.length) return;
    const update = () => setFeaturedProducts(pickRandom(featuredPool, 4));
    update();
    const id = setInterval(update, 120000); // 2 minutes
    return () => clearInterval(id);
  }, [featuredPool]);

  // Ensure category order is identical (alphabetical)
  const sortedCategories = React.useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories]
  );

  // Load live categories and product summaries from backend
  React.useEffect(() => {
    let mounted = true;
    // Categories
    fetchCategories()
      .then(list => { if (mounted) setCategories(list || []); })
      .catch(() => { if (mounted) setCategories([]); });
    // Products summary for home sections
    fetchProducts()
      .then(d => {
        if (!mounted) return;
        const top = flattenRows(d.topRated_product || []);
        const disc = flattenRows(d.discount_product || []);
        const latest = flattenRows(d.latest_product || []);
        setTopRatedProducts(top.slice(0, 4));
        setDiscountProducts(disc.slice(0, 4));
        const pool = dedupeById([...latest, ...top, ...disc]).slice(0, 40);
        setFeaturedPool(pool);
      })
      .catch(() => {
        setTopRatedProducts([]);
        setDiscountProducts([]);
        setFeaturedPool([]);
      });
    // Total products count for "View All" button
    fetch(`${API_BASE_URL}/home/query-products?lowPrice=0&&highPrice=100000&&pageNumber=1`)
      .then(r => r.json())
      .then(d => { if (mounted) setProductsCount(d.totalProduct || 0); })
      .catch(() => { if (mounted) setProductsCount(0); });
    return () => { mounted = false; };
  }, []);

  // Load campaigns for mobile hero banners from backend
  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const r = await fetch(`${API_BASE_URL}/campaigns/public`);
        const d = await r.json();
        const mapped = (d.campaigns || []).map(c => ({
          _id: c._id,
          banner: c.image,
          label: c.title,
          action: parseAction(c.ctaLink)
        }));
        if (mounted) setBanners(mapped.length ? mapped : PLACEHOLDER_BANNERS);
      } catch (_) {
        if (mounted) setBanners(PLACEHOLDER_BANNERS);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // Handle category selection
  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
    setShowCategoryDropdown(false);
    // Navigate to Products screen with category filter
    if (categoryName !== 'All Category') {
      navigation.navigate({ name: 'Products', params: { category: categoryName, fromCategory: true }, merge: true });
    } else {
      // Show all products when "All Category" is selected
      navigation.navigate({ name: 'Products', merge: true });
    }
  };

  // Improved auto-scroll: pauses during user interaction and resumes smoothly
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const autoTimerRef = useRef(null);
  const resumeTimerRef = useRef(null);

  useEffect(() => {
    if (isUserInteracting) return;
    if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    autoTimerRef.current = setInterval(() => {
      if (!bannerRef.current) return;
      const nextIndex = (currentBannerIndex + 1) % banners.length;
      bannerRef.current.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentBannerIndex(nextIndex);
    }, 3500);
    return () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    };
  }, [currentBannerIndex, isUserInteracting]);

  const renderBanner = ({ item, index }) => (
    <TouchableOpacity
      style={[styles.bannerContainer, { width: width - 30 }]}
      onPress={() => {


          if (item.action?.type === 'category' && item.action.category) {
            navigation.navigate({ name: 'Products', params: { category: item.action.category, fromCategory: true }, merge: true });
          } else if (item.action?.type === 'sale') {
            navigation.navigate({ name: 'Products', merge: true });
          }
        }}
    >
      <Image
        source={{ uri: item.banner }}
        style={styles.bannerImage}
        onError={() => {
          console.log('Banner image failed to load:', item.banner);
        }}
      />
      {/* Dynamic overlay text per banner and better touch handling */}
      <View style={styles.bannerOverlay}
        onStartShouldSetResponder={() => { setIsUserInteracting(true); return false; }}
        onResponderRelease={() => {
          clearTimeout(resumeTimerRef.current);
          resumeTimerRef.current = setTimeout(() => setIsUserInteracting(false), 2000);
        }}
      >
        <Text style={styles.bannerShopText} numberOfLines={1}>
          {item.label || (item.action?.type === 'category' && item.action.category
            ? `Our Newst ${item.action.category}`
            : 'Our Latest Deals')}
        </Text>
      </View>

      {/* Navigation Arrows */}
      {index === currentBannerIndex && (
        <>
          <TouchableOpacity
            style={[styles.bannerArrow, styles.bannerArrowLeft]}
            onPress={() => {
              setIsUserInteracting(true);
              const prevIndex = currentBannerIndex === 0 ? banners.length - 1 : currentBannerIndex - 1;
              bannerRef.current?.scrollToIndex({ index: prevIndex, animated: true });
              setCurrentBannerIndex(prevIndex);
              clearTimeout(resumeTimerRef.current);
              resumeTimerRef.current = setTimeout(() => setIsUserInteracting(false), 2000);
            }}
          >
            <Ionicons name="chevron-back" size={20} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.bannerArrow, styles.bannerArrowRight]}
            onPress={() => {
              setIsUserInteracting(true);
              const nextIndex = (currentBannerIndex + 1) % banners.length;
              bannerRef.current?.scrollToIndex({ index: nextIndex, animated: true });
              setCurrentBannerIndex(nextIndex);
              clearTimeout(resumeTimerRef.current);
              resumeTimerRef.current = setTimeout(() => setIsUserInteracting(false), 2000);
            }}
          >
            <Ionicons name="chevron-forward" size={20} color="#ffffff" />
          </TouchableOpacity>
        </>
      )}
    </TouchableOpacity>
  );

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => navigation.navigate('Products', { category: item.name, fromCategory: true })}
    >
      <Image source={{ uri: item.image }} style={styles.categoryImage} />
      <View style={styles.categoryOverlay}>
        <Text style={styles.categoryName}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  const handleAddToCart = async (product) => {
    console.log('🛒 Add to Cart clicked (Home Screen)!');
    console.log('User:', user);
    console.log('Product:', product.name);

    if (!user) {
      console.log('❌ User not logged in');
      Alert.alert('התחברות נדרשת', 'אנא התחבר כדי להוסיף מוצרים לעגלה', [
        { text: 'ביטול', style: 'cancel' },
        { text: 'התחבר', onPress: () => navigation.navigate('Login') }
      ]);
      return;
    }

    try {
      console.log('✅ User is logged in, adding to cart...');
      setLoadingProductId(product._id);
      const result = await addToCartContext(product, 1);

      console.log('Cart result:', result);

      if (result && result.success) {
        console.log('✅ Product added successfully!');
        Alert.alert('הצלחה!', 'המוצר נוסף לעגלה בהצלחה', [
          { text: 'המשך קניות', style: 'cancel' },
          { text: 'עבור לעגלה', onPress: () => navigation.navigate('Cart') }
        ]);
      } else {
        console.log('❌ Failed to add product:', result?.message);
        Alert.alert('שגיאה', result?.message || 'לא ניתן להוסיף את המוצר לעגלה');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('שגיאה', 'לא ניתן להוסיף את המוצר לעגלה');
    } finally {
      setLoadingProductId(null);
    }
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => {
        addToRecentlyViewed(item);
        navigation.navigate('ProductDetail', { product: item });
      }}
    >
      <Image source={getProductImageSource(item)} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productBrand}>{item.brand}</Text>
        <View style={styles.priceContainer}>
          {item.discount > 0 && (
            <Text style={styles.originalPrice}>${item.price}</Text>
          )}
          <Text style={styles.productPrice}>
            ${item.discount > 0 ? (item.price * (1 - item.discount / 100)).toFixed(2) : item.price}
          </Text>
        </View>
        <View style={styles.ratingContainer}>
          {[...Array(5)].map((_, i) => (
            <Ionicons
              key={i}
              name={i < Math.floor(item.rating) ? "star" : "star-outline"}
              size={12}
              color="#fbbf24"
            />
          ))}
          <Text style={styles.ratingText}>({item.rating})</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleAddToCart(item)}
          disabled={loadingProductId === item._id}
        >
          {loadingProductId === item._id ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Ionicons name="cart" size={16} color="#ffffff" />
              <Text style={styles.addButtonText}>Add to Cart</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Logo, Search, and Cart */}
      <View style={styles.headerContainer}>
        {/* EASY SHOP Logo Header */}
        <View style={styles.mainHeader}>
          <View style={styles.logoContainer}>
            <Image
              source={require('./src/Images/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="heart-outline" size={24} color="#059473" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('Cart')}
            >
              <Ionicons name="bag-outline" size={24} color="#059473" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar - Clean Design */}
        <View style={styles.searchSection}>
          <View style={styles.searchRow}>
            <TouchableOpacity
              style={styles.categoryDropdown}
              onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              <Ionicons name="grid-outline" size={16} color="#ffffff" />
              <Text style={styles.categoryText}>{selectedCategory}</Text>
              <Ionicons
                name={showCategoryDropdown ? "chevron-up" : "chevron-down"}
                size={16}
                color="#ffffff"
              />
            </TouchableOpacity>

            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="What do you need"
                placeholderTextColor="#9ca3af"
                value={searchValue}
                onChangeText={setSearchValue}
                onSubmitEditing={() =>
                  navigation.navigate('Products', { category: selectedCategory === 'All Category' ? '' : selectedCategory, searchQuery: searchValue })
                }
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={() =>
                  navigation.navigate('Products', { category: selectedCategory === 'All Category' ? '' : selectedCategory, searchQuery: searchValue })
                }
              >
                <Text style={styles.searchButtonText}>SEARCH</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </View>


      {/* Hero Banner Carousel - EXACT LIKE WEBSITE */}
      <View style={styles.heroSection}>
        <FlatList
          ref={bannerRef}
          data={banners}
          renderItem={renderBanner}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          snapToInterval={ITEM_WIDTH}
          getItemLayout={(_, i) => ({ length: ITEM_WIDTH, offset: ITEM_WIDTH * i, index: i })}
          onScrollBeginDrag={() => setIsUserInteracting(true)}
          onScrollEndDrag={() => {
            clearTimeout(resumeTimerRef.current);
            resumeTimerRef.current = setTimeout(() => setIsUserInteracting(false), 2000);
          }}
          decelerationRate="fast"
          contentContainerStyle={styles.bannerCarousel}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / ITEM_WIDTH);
            setCurrentBannerIndex(index);
          }}
        />

        {/* Dots Indicator - EXACT LIKE WEBSITE */}
        <View style={styles.dotsContainer}>
          {banners.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dot,
                index === currentBannerIndex ? styles.activeDot : styles.inactiveDot
              ]}
              onPress={() => {
                bannerRef.current?.scrollToIndex({ index, animated: true });
                setCurrentBannerIndex(index);
              }}
            />
          ))}
        </View>
      </View>

      {/* Categories - EXACT LIKE WEBSITE */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shop by Category</Text>
        <FlatList
          data={sortedCategories}
          renderItem={renderCategory}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />

        {/* View All Products Button */}
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => navigation.navigate('Products')}
        >
          <Text style={styles.viewAllButtonText}>View All Products ({productsCount})</Text>
        </TouchableOpacity>
      </View>

      {/* Featured Products - Dynamic Mix that rotates every 2 minutes */}
      {featuredProducts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Feature Products</Text>
          <FlatList
            data={featuredProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item._id}
            numColumns={2}
            contentContainerStyle={styles.productsList}
          />
        </View>
      )}


      {/* Recently Viewed Products - PERSONALIZED FOR USER */}
      {recentlyViewed.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recently Viewed</Text>
          <FlatList
            data={recentlyViewed.slice(0, 4)}
            renderItem={renderProduct}
            keyExtractor={(item) => item._id}
            numColumns={2}
            contentContainerStyle={styles.productsList}
          />
        </View>
      )}

      {/* Top Rated Products - EXACT LIKE WEBSITE */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Rated Products</Text>
        <FlatList
          data={topRatedProducts.slice(0, 4)}
          renderItem={renderProduct}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.productsList}
        />
      </View>

      {/* Discount Products - EXACT LIKE WEBSITE */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Discount Products</Text>
        <FlatList
          data={discountProducts.slice(0, 4)}
          renderItem={renderProduct}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.productsList}
        />
      </View>

      {/* Category Dropdown List - Positioned at the end to appear on top */}
      {showCategoryDropdown && (
        <View style={styles.categoryDropdownList}>
          <TouchableOpacity
            style={styles.categoryDropdownItem}
            onPress={() => handleCategorySelect('All Category')}
          >
            <Text style={styles.categoryDropdownText}>All Category</Text>
          </TouchableOpacity>
          {categories.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={styles.categoryDropdownItem}
              onPress={() => handleCategorySelect(category.name)}
            >
              <Text style={styles.categoryDropdownText}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}



    </ScrollView>
  );
}

// Products Screen - EXACT LIKE WEBSITE
function ProductsScreen({ navigation, route }) {
  const { category } = route.params || {};
  const searchQuery = route.params?.searchQuery || '';
  const { addToRecentlyViewed } = useRecentlyViewed();

  // Cart and Auth context
  const { user } = useAuth();
  const { addToCart: addToCartContext } = useCart();
  const [loadingProductId, setLoadingProductId] = React.useState(null);

  // API-driven Products Screen with pagination (loads all)
  const [products, setProducts] = React.useState([]);
  const [pageNumber, setPageNumber] = React.useState(1);
  const [totalProduct, setTotalProduct] = React.useState(0);
  const [parPage, setParPage] = React.useState(12);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);

  const fetchPage = React.useCallback(async (page, reset=false) => {
    try {
      if (reset) setLoading(true); else setLoadingMore(true);
      // Add random=true when no category/search is selected (Shop All view)
      const isRandom = (!category && !searchQuery);
      const randomParam = isRandom ? '&&random=true' : '';
      // Add timestamp to prevent caching when random=true
      const timestampParam = isRandom ? `&&_t=${Date.now()}` : '';
      const qs = `category=${encodeURIComponent(category || '')}&&searchValue=${encodeURIComponent(searchQuery || '')}&&lowPrice=0&&highPrice=100000&&pageNumber=${page}&&parPage=${parPage}${randomParam}${timestampParam}`;
      const r = await fetch(`${API_BASE_URL}/home/query-products?${qs}`);
      const d = await r.json();
      const live = Array.isArray(d.products) ? d.products : [];
      setTotalProduct(d.totalProduct || 0);
      setParPage(d.parPage || parPage);
      setProducts(prev => reset ? live : [...prev, ...live]);
      setPageNumber(page);
    } catch (e) {
      if (reset) setProducts([]);
    } finally {
      if (reset) setLoading(false); else setLoadingMore(false);
    }
  }, [category, parPage, searchQuery]);

  React.useEffect(() => {
    // reset on category change
    setProducts([]);
    setPageNumber(1);
    fetchPage(1, true);
  }, [category, fetchPage]);

  const handleAddToCart = async (product) => {
    console.log('🛒 Add to Cart clicked (Products Screen)!');
    console.log('User:', user);
    console.log('Product:', product.name);

    if (!user) {
      console.log('❌ User not logged in');
      Alert.alert('התחברות נדרשת', 'אנא התחבר כדי להוסיף מוצרים לעגלה', [
        { text: 'ביטול', style: 'cancel' },
        { text: 'התחבר', onPress: () => navigation.navigate('Login') }
      ]);
      return;
    }

    try {
      console.log('✅ User is logged in, adding to cart...');
      setLoadingProductId(product._id);
      const result = await addToCartContext(product, 1);

      console.log('Cart result:', result);

      if (result && result.success) {
        console.log('✅ Product added successfully!');
        Alert.alert('הצלחה!', 'המוצר נוסף לעגלה בהצלחה', [
          { text: 'המשך קניות', style: 'cancel' },
          { text: 'עבור לעגלה', onPress: () => navigation.navigate('Cart') }
        ]);
      } else {
        console.log('❌ Failed to add product:', result?.message);
        Alert.alert('שגיאה', result?.message || 'לא ניתן להוסיף את המוצר לעגלה');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('שגיאה', 'לא ניתן להוסיף את המוצר לעגלה');
    } finally {
      setLoadingProductId(null);
    }
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => {
        addToRecentlyViewed(item);
        navigation.navigate('ProductDetail', { product: item });
      }}
    >
      <Image source={getProductImageSource(item)} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productBrand}>{item.brand}</Text>
        <View style={styles.priceContainer}>
          {item.discount > 0 && (
            <Text style={styles.originalPrice}>${item.price}</Text>
          )}
          <Text style={styles.productPrice}>
            ${item.discount > 0 ? (item.price * (1 - item.discount / 100)).toFixed(2) : item.price}
          </Text>
        </View>
        <View style={styles.ratingContainer}>
          {[...Array(5)].map((_, i) => (
            <Ionicons
              key={i}
              name={i < Math.floor(item.rating) ? "star" : "star-outline"}
              size={12}
              color="#fbbf24"
            />
          ))}
          <Text style={styles.ratingText}>({item.rating})</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleAddToCart(item)}
          disabled={loadingProductId === item._id}
        >
          {loadingProductId === item._id ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Ionicons name="cart" size={16} color="#ffffff" />
              <Text style={styles.addButtonText}>Add to Cart</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {category && route.params?.fromCategory ? category : 'All Products'}
        </Text>
        <TouchableOpacity>
          <Ionicons name="search-outline" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.productsList}
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (products.length < totalProduct && !loadingMore) {
            fetchPage(pageNumber + 1);
          }
        }}
        ListFooterComponent={loadingMore ? (
          <View style={{ paddingVertical: 16 }}>
            <ActivityIndicator size="small" color="#2196F3" />
          </View>
        ) : null}
      />
    </View>
  );
}

// Product Detail Screen - ENHANCED WITH "PEOPLE ALSO LIKE"
function ProductDetailScreen({ navigation, route }) {
  const { product } = route.params;
  // const { addToRecentlyViewed } = useRecentlyViewed();
  const addToRecentlyViewed = () => {};
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const suggestionRef = useRef(null);
  const { user } = useAuth();
  const { addToCart: addToCartContext } = useCart();
  const [loadingCart, setLoadingCart] = useState(false);

  // Add to recently viewed when component mounts
  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?._id]);

  const handleAddToCart = async () => {
    console.log('🛒 Add to Cart clicked (Product Detail)!');
    console.log('User:', user);
    console.log('Product:', product.name);

    if (!user) {
      console.log('❌ User not logged in');
      Alert.alert('התחברות נדרשת', 'אנא התחבר כדי להוסיף מוצרים לעגלה', [
        { text: 'ביטול', style: 'cancel' },
        { text: 'התחבר', onPress: () => navigation.navigate('Login') }
      ]);
      return;
    }

    try {
      console.log('✅ User is logged in, adding to cart...');
      setLoadingCart(true);
      const result = await addToCartContext(product, 1);

      console.log('Cart result:', result);

      if (result && result.success) {
        console.log('✅ Product added successfully!');
        Alert.alert('הצלחה!', 'המוצר נוסף לעגלה בהצלחה', [
          { text: 'המשך קניות', style: 'cancel' },
          { text: 'עבור לעגלה', onPress: () => navigation.navigate('Cart') }
        ]);
      } else {
        console.log('❌ Failed to add product');
        Alert.alert('שגיאה', result?.message || 'לא ניתן להוסיף את המוצר לעגלה');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('שגיאה', 'לא ניתן להוסיף את המוצר לעגלה');
    } finally {
      setLoadingCart(false);
    }
  };

  // Generate "People also like" products - mix from different categories
  useEffect(() => {
    const generateSuggestedProducts = () => {
      // Mix of products from different categories
      const mixedProducts = [
        // Electronics
        {
          _id: 'suggest_1',
          name: 'Wireless Headphones',
          brand: 'TechSound',
          price: 89.99,
          discount: 15,
          rating: 4.5,
          stock: 25,
          category: 'Electronics',
          images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'],
          description: 'Premium wireless headphones with noise cancellation'
        },
        // Toys
        {
          _id: 'suggest_2',
          name: 'Educational Building Blocks',
          brand: 'KidsPlay',
          price: 34.99,
          discount: 20,
          rating: 4.8,
          stock: 40,
          category: 'Toys',
          images: ['https://images.unsplash.com/photo-1558877385-8c1b8b6e5e8e?auto=format&fit=crop&w=800&q=80'],
          description: 'Creative building blocks for developing minds'
        },
        // Home & Kitchen
        {
          _id: 'suggest_3',
          name: 'Smart Coffee Maker',
          brand: 'BrewMaster',
          price: 129.99,
          discount: 10,
          rating: 4.3,
          stock: 15,
          category: 'Home & Kitchen',
          images: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80'],
          description: 'WiFi-enabled coffee maker with app control'
        },
        // Books
        {
          _id: 'suggest_4',
          name: 'The Art of Programming',
          brand: 'TechBooks',
          price: 49.99,
          discount: 25,
          rating: 4.7,
          stock: 30,
          category: 'Books',
          images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'],
          description: 'Comprehensive guide to modern programming'
        },
        // Clothing
        {
          _id: 'suggest_5',
          name: 'Premium Cotton T-Shirt',
          brand: 'ComfortWear',
          price: 24.99,
          discount: 30,
          rating: 4.4,
          stock: 50,
          category: 'Clothing',
          images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80'],
          description: 'Soft, breathable cotton t-shirt in multiple colors'
        },
        // Sports
        {
          _id: 'suggest_6',
          name: 'Yoga Mat Pro',
          brand: 'FitLife',
          price: 39.99,
          discount: 15,
          rating: 4.6,
          stock: 35,
          category: 'Sports',
          images: ['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80'],
          description: 'Non-slip yoga mat for all fitness levels'
        }
      ];

      // Shuffle and select 4-5 products
      const shuffled = mixedProducts.sort(() => 0.5 - Math.random());
      setSuggestedProducts(shuffled.slice(0, 5));
    };

    generateSuggestedProducts();
  }, [product]);

  // Auto-scroll carousel every 4 seconds
  useEffect(() => {
    if (suggestedProducts.length === 0) return;

    const interval = setInterval(() => {
      const nextIndex = (currentSuggestionIndex + 1) % suggestedProducts.length;
      suggestionRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true
      });
      setCurrentSuggestionIndex(nextIndex);
    }, 4000);

    return () => clearInterval(interval);
  }, [currentSuggestionIndex, suggestedProducts.length]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Product Details</Text>
        <TouchableOpacity>
          <Ionicons name="share-outline" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.productDetailContainer}>
        <Image source={{ uri: product.images[0] }} style={styles.productDetailImage} />

        <View style={styles.productDetailInfo}>
          <Text style={styles.productDetailName}>{product.name}</Text>
          <Text style={styles.productDetailBrand}>{product.brand}</Text>

          <View style={styles.priceContainer}>
            {product.discount > 0 && (
              <Text style={styles.originalPrice}>${product.price}</Text>
            )}
            <Text style={styles.productDetailPrice}>
              ${product.discount > 0 ? (product.price * (1 - product.discount / 100)).toFixed(2) : product.price}
            </Text>
            {product.discount > 0 && (
              <Text style={styles.discountBadge}>{product.discount}% OFF</Text>
            )}
          </View>

          <View style={styles.ratingContainer}>
            {[...Array(5)].map((_, i) => (
              <Ionicons
                key={i}
                name={i < Math.floor(product.rating) ? "star" : "star-outline"}
                size={16}
                color="#fbbf24"
              />
            ))}
            <Text style={styles.ratingText}>({product.rating}) • {product.stock} in stock</Text>
          </View>

          <Text style={styles.productDescription}>{product.description}</Text>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={handleAddToCart}
              disabled={loadingCart}
            >
              {loadingCart ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="cart" size={20} color="#ffffff" />
                  <Text style={styles.addToCartText}>Add to Cart</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.buyNowButton}>
              <Text style={styles.buyNowText}>Buy Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* People Also Like Section */}
      {__DEV__ && suggestedProducts.length > 0 && (
        <View style={styles.suggestionsSection}>
          <Text style={styles.suggestionsTitle}>People also like</Text>
          <FlatList
            ref={suggestionRef}
            data={suggestedProducts}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionCard}
                onPress={() => navigation.push('ProductDetail', { product: item })}
              >
                <Image source={getProductImageSource(item)} style={styles.suggestionImage} />
                <View style={styles.suggestionInfo}>
                  <Text style={styles.suggestionName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.suggestionBrand}>{item.brand}</Text>
                  <View style={styles.suggestionPriceContainer}>
                    {item.discount > 0 && (
                      <Text style={styles.suggestionOriginalPrice}>${item.price}</Text>
                    )}
                    <Text style={styles.suggestionPrice}>
                      ${item.discount > 0 ? (item.price * (1 - item.discount / 100)).toFixed(2) : item.price}
                    </Text>
                  </View>
                  <View style={styles.suggestionRating}>
                    <Ionicons name="star" size={12} color="#fbbf24" />
                    <Text style={styles.suggestionRatingText}>{item.rating}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={width * 0.45}
            decelerationRate="fast"
            contentContainerStyle={styles.suggestionsCarousel}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / (width * 0.45));
              setCurrentSuggestionIndex(index);
            }}
          />

          {/* Dots Indicator */}
          <View style={styles.suggestionsIndicator}>
            {suggestedProducts.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.suggestionDot,
                  index === currentSuggestionIndex && styles.suggestionDotActive
                ]}
              />
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

// Cart Screen - Using the real CartScreen component from src/screens/CartScreen.js
// (Removed placeholder - now using RealCartScreen imported above)

// Profile Screen - ENHANCED WITH REAL USER DATA
function ProfileScreen({ navigation }) {
  const { user, logout, loading: authLoading } = useAuth();
  const [loading, setLoading] = React.useState(false);

  console.log('ProfileScreen - User:', user);

  // Redirect to Login if no user
  React.useEffect(() => {
    if (!authLoading && !user) {
      console.log('⚠️ No user found, redirecting to Login...');
      navigation.replace('Login');
    }
  }, [user, authLoading, navigation]);

  const handleLogout = async () => {
    try {
      console.log('Logging out...');
      await logout();
      navigation.replace('Login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#059473" />
      </View>
    );
  }

  // If no user, show nothing (will redirect)
  if (!user) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Account</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={() => navigation.navigate('EditProfile')}
        >
          {user?.image ? (
            <Image source={{ uri: user.image }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="#059473" />
            </View>
          )}
          <View style={styles.editBadge}>
            <Ionicons name="camera" size={12} color="#ffffff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Ionicons name="person-outline" size={24} color="#059473" />
          <Text style={styles.menuText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="location-outline" size={24} color="#059473" />
          <Text style={styles.menuText}>My Addresses</Text>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="card-outline" size={24} color="#059473" />
          <Text style={styles.menuText}>Payment Methods</Text>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('OrderHistory')}
        >
          <Ionicons name="receipt-outline" size={24} color="#059473" />
          <Text style={styles.menuText}>Order History</Text>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="settings-outline" size={24} color="#059473" />
          <Text style={styles.menuText}>Settings</Text>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="help-circle-outline" size={24} color="#059473" />
          <Text style={styles.menuText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Bottom Tab Navigator - EXACT LIKE WEBSITE
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Products') {
            // Use Ionicons that exist across versions
            iconName = focused ? 'pricetags' : 'pricetags-outline';
          } else if (route.name === 'Blog') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'bag' : 'bag-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#059473',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Products" component={ProductsScreen} />
      <Tab.Screen name="Blog" component={BlogTabScreen} />
      <Tab.Screen name="Cart" component={RealCartScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Wrapper component for MainTabs with floating chat button
function MainTabsWithChat() {
  return (
    <View style={{ flex: 1 }}>
      <MainTabs />
      <GlobalFloatingChatButton />
    </View>
  );
}

// BLOG DATA - EXACT SAME AS FRONTEND
const BLOG_POSTS = [
  {
    id: "future-of-ecommerce",
    title: "The Future of E-commerce: Trends to Watch",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=1000&auto=format&fit=crop",
    date: "May 15, 2024",
    author: "Admin",
    comments: 12,
    category: "Technology",
    tags: ['E-commerce', 'Technology', 'Retail', 'Shopping'],
    excerpt: "Discover the latest trends shaping the future of online shopping and e-commerce platforms.",
    content: `The e-commerce landscape is evolving at an unprecedented pace, transforming how businesses operate and consumers shop. As we move forward, several key trends are shaping the future of online retail.

1. Artificial Intelligence and Personalization
AI is revolutionizing e-commerce by enabling hyper-personalized shopping experiences. From product recommendations to customized search results, AI algorithms analyze user behavior to predict preferences and needs.

Smart chatbots and virtual assistants are becoming increasingly sophisticated, providing 24/7 customer service and guiding shoppers through their purchasing journey.

2. Augmented Reality Shopping
AR technology is bridging the gap between online and in-store shopping experiences. Customers can now visualize products in their own space before making a purchase decision.

Furniture retailers, cosmetic brands, and fashion companies are leading the way in AR implementation, allowing customers to "try before they buy" virtually.

3. Voice Commerce
With the growing popularity of smart speakers and voice assistants, voice commerce is gaining momentum. Consumers are increasingly comfortable making purchases through voice commands.

Businesses are optimizing their platforms for voice search and creating voice-friendly shopping experiences to stay ahead of this trend.

4. Sustainable E-commerce
Environmental consciousness is influencing consumer behavior, with more shoppers seeking eco-friendly products and sustainable practices.

E-commerce businesses are responding by adopting green packaging, carbon-neutral shipping options, and transparent supply chains.

5. Social Commerce Integration
The line between social media and e-commerce continues to blur. Platforms like Instagram, Facebook, and TikTok are enhancing their shopping features, allowing users to discover and purchase products without leaving the app.

Live shopping events and influencer collaborations are becoming powerful sales channels for online retailers.

Conclusion
As technology advances and consumer expectations evolve, e-commerce will continue to transform. Businesses that stay ahead of these trends and adapt their strategies accordingly will thrive in the competitive online marketplace.

The future of e-commerce is not just about selling products online—it's about creating immersive, personalized, and convenient shopping experiences that meet the changing needs of digital consumers.`
  },
  {
    id: "electronics-for-home",
    title: "How to Choose the Perfect Electronics for Your Home",
    image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=1000&auto=format&fit=crop",
    date: "May 10, 2024",
    author: "Admin",
    comments: 8,
    category: "Technology",
    tags: ['Electronics', 'Smart Home', 'Technology', 'Gadgets'],
    excerpt: "A comprehensive guide to selecting the best electronic devices for your home needs.",
    content: `Choosing the right electronics for your home can be overwhelming with so many options available. This comprehensive guide will help you make informed decisions when selecting electronic devices that best suit your needs and lifestyle.

Understanding Your Needs
Before making any purchase, assess your specific requirements. Consider factors like room size, usage patterns, and budget constraints. This initial evaluation will guide your decision-making process.

Smart Home Integration
Modern electronics should work seamlessly together. Look for devices that support common smart home platforms like Google Home, Amazon Alexa, or Apple HomeKit.

Energy Efficiency
Choose energy-efficient appliances to reduce your environmental impact and save on electricity bills. Look for ENERGY STAR certified products.

Future-Proofing
Invest in electronics with upgradeable features and long-term support to ensure they remain useful for years to come.`
  },
  {
    id: "must-have-gadgets",
    title: "Top 10 Must-Have Gadgets for 2024",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop",
    date: "May 5, 2024",
    author: "Admin",
    comments: 15,
    category: "Technology",
    tags: ['Gadgets', 'Technology', 'Innovation'],
    excerpt: "Explore the most innovative and essential gadgets that are making waves this year.",
    content: `In the rapidly evolving world of technology, staying up-to-date with the latest gadgets can be challenging. Here's our curated list of the top 10 must-have gadgets that are making waves in 2024.

1. Smart AR Glasses
Augmented reality glasses have finally reached a point where they're both functional and stylish. These lightweight glasses overlay digital information onto the real world, making them perfect for navigation, gaming, and productivity.

2. Foldable Smartphones
Foldable smartphones have matured significantly, with more durable screens and innovative form factors. These devices transform from a standard smartphone into a tablet-sized screen.

3. AI-Powered Home Assistants
The latest generation of home assistants goes beyond simple voice commands. These devices now use advanced AI to learn your preferences and anticipate your needs.

4. Portable Power Stations
As our reliance on electronic devices grows, so does our need for reliable power sources. Modern portable power stations offer massive capacity in compact packages.

5. Smart Fitness Mirrors
Transform your home workout experience with smart fitness mirrors. These interactive displays provide personalized training sessions and real-time form corrections.

6. Noise-Cancelling Earbuds
The latest noise-cancelling earbuds offer incredible sound quality and active noise cancellation in an ultra-compact form.

7. Smart Home Security Systems
Modern home security systems combine high-resolution cameras, smart sensors, and AI-powered analytics to provide comprehensive protection.

8. E-Ink Tablets
E-ink tablets combine the paper-like reading experience of e-readers with the functionality of a tablet.

9. Robot Vacuum and Mop Combos
Take home automation to the next level with advanced robot vacuums that can both vacuum and mop your floors.

10. Portable Monitors
Enhance your productivity on the go with ultra-thin portable monitors that connect to your devices for instant dual-screen setup.

These innovative gadgets represent the cutting edge of consumer technology in 2024, offering glimpses into how our digital and physical worlds are becoming increasingly integrated.`
  },
  {
    id: "sustainable-shopping",
    title: "Sustainable Shopping: Eco-Friendly Products Guide",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1000&auto=format&fit=crop",
    date: "April 28, 2024",
    author: "Admin",
    comments: 6,
    category: "Lifestyle",
    tags: ['Eco-Friendly', 'Sustainability', 'Shopping'],
    excerpt: "Learn how to make environmentally conscious choices when shopping online.",
    content: `Making sustainable choices while shopping online has become increasingly important as consumers become more environmentally conscious. This guide will help you navigate the world of eco-friendly products and sustainable shopping practices.

Understanding Sustainable Products
Sustainable products are designed, manufactured, and distributed in ways that minimize environmental impact. They often use renewable materials, have minimal packaging, and are built to last.

Key Features to Look For:
- Recyclable or biodegradable materials
- Minimal packaging
- Energy-efficient operation
- Durability and longevity
- Ethical manufacturing practices

Tips for Sustainable Shopping:
1. Research brands and their sustainability practices
2. Choose quality over quantity
3. Look for certifications like Fair Trade, ENERGY STAR, or organic labels
4. Consider the product's entire lifecycle
5. Support local and small businesses when possible

Making a Difference
Every purchase decision is an opportunity to support sustainable practices and encourage businesses to adopt more environmentally friendly approaches.`
  },
  {
    id: "smart-home-technology",
    title: "The Rise of Smart Home Technology",
    image: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?q=80&w=1000&auto=format&fit=crop",
    date: "April 20, 2024",
    author: "Admin",
    comments: 10,
    category: "Technology",
    tags: ['Smart Home', 'IoT', 'Technology', 'Automation'],
    excerpt: "How smart home devices are transforming the way we live and interact with our living spaces.",
    content: `Smart home technology has evolved from a futuristic concept to an accessible reality that's transforming how we interact with our living spaces. This comprehensive look at smart home technology explores current trends and future possibilities.

The Smart Home Ecosystem
Modern smart homes integrate various devices and systems to create a seamless, automated living experience. From lighting and climate control to security and entertainment, smart technology is making homes more efficient, secure, and comfortable.

Key Components:
- Smart lighting systems
- Intelligent thermostats
- Security cameras and sensors
- Voice assistants
- Smart appliances
- Automated window treatments

Benefits of Smart Home Technology:
1. Energy efficiency and cost savings
2. Enhanced security and peace of mind
3. Convenience and automation
4. Remote monitoring and control
5. Increased property value

Getting Started
Begin with a few key devices and gradually expand your smart home ecosystem. Focus on areas that will provide the most immediate benefits for your lifestyle.

The Future of Smart Homes
As technology continues to advance, we can expect even more sophisticated automation, better integration between devices, and new applications we haven't yet imagined.`
  },
  {
    id: "budget-shopping-tips",
    title: "Budget-Friendly Shopping Tips for Tech Enthusiasts",
    image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?q=80&w=1000&auto=format&fit=crop",
    date: "April 15, 2024",
    author: "Admin",
    comments: 4,
    category: "Technology",
    tags: ['Budget', 'Shopping', 'Technology', 'Deals'],
    excerpt: "Strategies to get the best deals on technology products without breaking the bank.",
    content: `Technology doesn't have to break the bank. With the right strategies and timing, you can get high-quality tech products at affordable prices. Here are proven methods to save money on your next tech purchase.

Timing Your Purchases
- Shop during major sales events (Black Friday, Cyber Monday, Prime Day)
- Look for end-of-season clearances
- Buy previous generation models when new ones are released
- Monitor price history using tracking tools

Research and Compare
- Read reviews from multiple sources
- Compare prices across different retailers
- Check for student, military, or professional discounts
- Consider refurbished or open-box items

Smart Shopping Strategies:
1. Set price alerts for desired items
2. Use cashback and rewards programs
3. Bundle purchases for better deals
4. Consider alternative brands with similar features
5. Buy only what you actually need

Where to Find Deals:
- Manufacturer websites and outlets
- Online marketplaces with seller competition
- Warehouse clubs and bulk retailers
- Local electronics stores with price matching

Making Smart Decisions
Remember that the cheapest option isn't always the best value. Consider factors like warranty, customer support, and long-term reliability when making your decision.

Building Your Tech Collection
Start with essential items and gradually add to your collection. This approach allows you to spread costs over time while ensuring you get the most important items first.`
  }
];

const BLOG_CATEGORIES = [
  { name: "Technology", count: 15 },
  { name: "Fashion", count: 8 },
  { name: "Food", count: 12 },
  { name: "Travel", count: 10 },
  { name: "Lifestyle", count: 14 }
];

// Blog Tab Screen - Simple version for tab navigation
function BlogTabScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Blog</Text>
        <TouchableOpacity onPress={() => navigation.getParent()?.navigate('Blog')}>
          <Ionicons name="arrow-forward" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.blogTabContainer}>
        <Text style={styles.blogTabTitle}>Latest Articles</Text>
        <Text style={styles.blogTabSubtitle}>Discover insights, trends, and tips</Text>

        {BLOG_POSTS.slice(0, 3).map(post => (
          <TouchableOpacity
            key={post.id}
            style={styles.blogTabCard}
            onPress={() => navigation.getParent()?.navigate('Blog')}
          >
            <Image source={{ uri: post.image }} style={styles.blogTabImage} />
            <View style={styles.blogTabContent}>
              <Text style={styles.blogTabCardTitle} numberOfLines={2}>{post.title}</Text>
              <Text style={styles.blogTabCardDate}>{post.date}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.viewAllBlogButton}
          onPress={() => navigation.getParent()?.navigate('Blog')}
        >
          <Text style={styles.viewAllBlogText}>View All Articles</Text>
          <Ionicons name="arrow-forward" size={16} color="#ffffff" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// Blog Screen - EXACT LIKE FRONTEND
function BlogScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState(BLOG_POSTS);

  const handleSearch = () => {
    if (searchQuery.trim() === '') {
      setFilteredPosts(BLOG_POSTS);
    } else {
      const filtered = BLOG_POSTS.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPosts(filtered);
    }
  };

  const renderBlogPost = ({ item }) => (
    <TouchableOpacity
      style={styles.blogCard}
      onPress={() => navigation.navigate('BlogDetail', { post: item })}
    >
      <View style={styles.blogImageContainer}>
        <Image source={{ uri: item.image }} style={styles.blogImage} />
      </View>
      <View style={styles.blogContent}>
        <View style={styles.blogMeta}>
          <View style={styles.blogMetaItem}>
            <Ionicons name="calendar-outline" size={12} color="#6b7280" />
            <Text style={styles.blogMetaText}>{item.date}</Text>
          </View>
          <View style={styles.blogMetaItem}>
            <Ionicons name="person-outline" size={12} color="#6b7280" />
            <Text style={styles.blogMetaText}>{item.author}</Text>
          </View>
          <View style={styles.blogMetaItem}>
            <Ionicons name="chatbubble-outline" size={12} color="#6b7280" />
            <Text style={styles.blogMetaText}>{item.comments}</Text>
          </View>
        </View>
        <Text style={styles.blogTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.blogExcerpt} numberOfLines={3}>{item.excerpt}</Text>
        <TouchableOpacity
          style={styles.readMoreButton}
          onPress={() => navigation.navigate('BlogDetail', { post: item })}
        >
          <Text style={styles.readMoreText}>Read More</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }) => (
    <TouchableOpacity style={styles.categoryItem}>
      <View style={styles.categoryContent}>
        <Text style={styles.categoryFilterName}>{item.name}</Text>
        <Text style={styles.categoryCount}>({item.count})</Text>
      </View>
    </TouchableOpacity>
  );

  const renderRecentPost = ({ item }) => (
    <TouchableOpacity
      style={styles.recentPostItem}
      onPress={() => navigation.navigate('BlogDetail', { post: item })}
    >
      <Image source={{ uri: item.image }} style={styles.recentPostImage} />
      <View style={styles.recentPostContent}>
        <Text style={styles.recentPostTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.recentPostDate}>{item.date}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header - EXACT LIKE WEBSITE */}
      <View style={styles.blogHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.blogHeaderTitle}>Our Blog</Text>
        <TouchableOpacity>
          <Ionicons name="search-outline" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner Section */}
        <View style={styles.blogBanner}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1000&auto=format&fit=crop' }}
            style={styles.blogBannerImage}
          />
          <View style={styles.blogBannerOverlay}>
            <Text style={styles.blogBannerTitle}>Our Blog</Text>
            <View style={styles.blogBreadcrumb}>
              <Text style={styles.breadcrumbText}>Home</Text>
              <Ionicons name="chevron-forward" size={16} color="#ffffff" />
              <Text style={styles.breadcrumbText}>Blog</Text>
            </View>
          </View>
        </View>

        <View style={styles.blogMainContent}>
          {/* Search Section */}
          <View style={styles.searchSection}>
            <Text style={styles.sectionTitle}>Search</Text>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search..."
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
              />
              <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                <Text style={styles.searchButtonText}>Search</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Blog Posts Grid */}
          <View style={styles.blogPostsSection}>
            <FlatList
              data={filteredPosts}
              renderItem={renderBlogPost}
              keyExtractor={(item) => item.id}
              numColumns={1}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.blogPostsList}
            />
          </View>

          {/* Categories Section */}
          <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <FlatList
              data={BLOG_CATEGORIES}
              renderItem={renderCategory}
              keyExtractor={(item) => item.name}
              showsVerticalScrollIndicator={false}
            />
          </View>

          {/* Recent Posts Section */}
          <View style={styles.recentPostsSection}>
            <Text style={styles.sectionTitle}>Recent Posts</Text>
            <FlatList
              data={BLOG_POSTS.slice(0, 3)}
              renderItem={renderRecentPost}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Blog Detail Screen - EXACT LIKE FRONTEND
function BlogDetailScreen({ navigation, route }) {
  const { post } = route.params;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Blog Details</Text>
        <TouchableOpacity>
          <Ionicons name="share-outline" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.blogDetailContainer} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <Image source={{ uri: post.image }} style={styles.blogDetailImage} />

        {/* Content */}
        <View style={styles.blogDetailContent}>
          <Text style={styles.blogDetailTitle}>{post.title}</Text>

          {/* Meta Information */}
          <View style={styles.blogDetailMeta}>
            <View style={styles.blogDetailMetaItem}>
              <Ionicons name="calendar-outline" size={16} color="#6b7280" />
              <Text style={styles.blogDetailMetaText}>{post.date}</Text>
            </View>
            <View style={styles.blogDetailMetaItem}>
              <Ionicons name="person-outline" size={16} color="#6b7280" />
              <Text style={styles.blogDetailMetaText}>{post.author}</Text>
            </View>
            <View style={styles.blogDetailMetaItem}>
              <Ionicons name="chatbubble-outline" size={16} color="#6b7280" />
              <Text style={styles.blogDetailMetaText}>{post.comments} Comments</Text>
            </View>
          </View>

          {/* Tags */}
          <View style={styles.tagsContainer}>
            {post.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          {/* Article Content */}
          <Text style={styles.blogDetailText}>{post.content}</Text>

          {/* Author Bio */}
          <View style={styles.authorBio}>
            <View style={styles.authorHeader}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1000&auto=format&fit=crop' }}
                style={styles.authorImage}
              />
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>{post.author}</Text>
                <Text style={styles.authorTitle}>Content Creator & E-commerce Specialist</Text>
              </View>
            </View>
            <Text style={styles.authorDescription}>
              Our team of experts brings you the latest insights and trends in e-commerce, technology, and digital marketing.
              With years of experience in the industry, we provide valuable information to help businesses and consumers navigate the digital landscape.
            </Text>
          </View>

          {/* Related Posts */}
          <View style={styles.relatedPosts}>
            <Text style={styles.relatedPostsTitle}>Related Articles</Text>
            <View style={styles.relatedPostsGrid}>
              {BLOG_POSTS
                .filter(relatedPost => relatedPost.id !== post.id)
                .slice(0, 2)
                .map(relatedPost => (
                  <TouchableOpacity
                    key={relatedPost.id}
                    style={styles.relatedPostCard}
                    onPress={() => navigation.push('BlogDetail', { post: relatedPost })}
                  >
                    <Image source={{ uri: relatedPost.image }} style={styles.relatedPostImage} />
                    <View style={styles.relatedPostContent}>
                      <Text style={styles.relatedPostTitle} numberOfLines={2}>{relatedPost.title}</Text>
                      <Text style={styles.relatedPostDate}>{relatedPost.date}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
            </View>
          </View>

          {/* Back to Blog Button */}
          <TouchableOpacity
            style={styles.backToBlogButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backToBlogText}>Back to Blog</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// About Us Screen - EXACT LIKE FRONTEND
function AboutScreen({ navigation }) {
  // Team members data - EXACT SAME AS FRONTEND
  const teamMembers = [
    {
      id: 1,
      name: "John Doe",
      position: "CEO & Founder",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: 2,
      name: "Jane Smith",
      position: "Marketing Director",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: 3,
      name: "Michael Brown",
      position: "Product Manager",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: 4,
      name: "Sarah Johnson",
      position: "Customer Support Lead",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1000&auto=format&fit=crop"
    }
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>About Us</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner Section */}
        <View style={styles.aboutBanner}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1000&auto=format&fit=crop' }}
            style={styles.aboutBannerImage}
          />
          <View style={styles.aboutBannerOverlay}>
            <Text style={styles.aboutBannerTitle}>About Us</Text>
            <View style={styles.aboutBreadcrumb}>
              <Text style={styles.breadcrumbText}>Home</Text>
              <Ionicons name="chevron-forward" size={16} color="#ffffff" />
              <Text style={styles.breadcrumbText}>About Us</Text>
            </View>
          </View>
        </View>

        <View style={styles.aboutContent}>
          {/* Our Story Section */}
          <View style={styles.storySection}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1000&auto=format&fit=crop' }}
              style={styles.storyImage}
            />
            <View style={styles.storyContent}>
              <Text style={styles.sectionTitle}>Our Story</Text>
              <Text style={styles.storyText}>
                Founded in 2020, Easy Shop has quickly established itself as a leading e-commerce platform,
                offering a wide range of high-quality products at competitive prices. Our journey began with
                a simple mission: to make online shopping easy, enjoyable, and accessible to everyone.
              </Text>
              <Text style={styles.storyText}>
                What started as a small venture has now grown into a trusted marketplace with thousands of
                satisfied customers. We take pride in our curated selection of products, exceptional customer
                service, and commitment to innovation.
              </Text>

              {/* Features List */}
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#059473" />
                  <Text style={styles.featureText}>Wide range of carefully selected products</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#059473" />
                  <Text style={styles.featureText}>Fast and reliable shipping worldwide</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#059473" />
                  <Text style={styles.featureText}>Dedicated customer support team</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#059473" />
                  <Text style={styles.featureText}>Secure payment methods</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Why Choose Us Section */}
          <View style={styles.whyChooseSection}>
            <Text style={styles.sectionTitle}>Why Choose Us</Text>
            <Text style={styles.sectionSubtitle}>
              At Easy Shop, we strive to provide the best shopping experience possible.
              Here's what sets us apart from other online retailers.
            </Text>

            <View style={styles.featuresGrid}>
              <View style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Ionicons name="people" size={24} color="#059473" />
                </View>
                <Text style={styles.featureCardTitle}>Customer First</Text>
                <Text style={styles.featureCardText}>
                  Our customers are at the heart of everything we do. We continuously improve our services based on your feedback.
                </Text>
              </View>

              <View style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Ionicons name="bag" size={24} color="#059473" />
                </View>
                <Text style={styles.featureCardTitle}>Quality Products</Text>
                <Text style={styles.featureCardText}>
                  We carefully select each product in our inventory to ensure it meets our high standards of quality.
                </Text>
              </View>

              <View style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Ionicons name="car" size={24} color="#059473" />
                </View>
                <Text style={styles.featureCardTitle}>Fast Delivery</Text>
                <Text style={styles.featureCardText}>
                  We partner with reliable shipping providers to ensure your orders are delivered promptly and safely.
                </Text>
              </View>

              <View style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Ionicons name="headset" size={24} color="#059473" />
                </View>
                <Text style={styles.featureCardTitle}>24/7 Support</Text>
                <Text style={styles.featureCardText}>
                  Our dedicated support team is always ready to assist you with any questions or concerns.
                </Text>
              </View>
            </View>
          </View>

          {/* Our Team Section */}
          <View style={styles.teamSection}>
            <Text style={styles.sectionTitle}>Meet Our Team</Text>
            <Text style={styles.sectionSubtitle}>
              The passionate individuals behind Easy Shop who work tirelessly to bring you the best shopping experience.
            </Text>

            <View style={styles.teamGrid}>
              {teamMembers.map(member => (
                <View key={member.id} style={styles.teamCard}>
                  <Image source={{ uri: member.image }} style={styles.teamImage} />
                  <View style={styles.teamInfo}>
                    <Text style={styles.teamName}>{member.name}</Text>
                    <Text style={styles.teamPosition}>{member.position}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Simple Register Screen
function RegisterScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>🛒 E-Shop</Text>
        <Text style={styles.subtitle}>Create Account</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#059473" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#059473" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#059473" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#9ca3af"
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.loginButtonText}>Register</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerLink}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.registerText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <RecentlyViewedProvider>
          <NavigationContainer>
            <StatusBar style="light" />
            <Stack.Navigator
              initialRouteName="Login"
              screenOptions={{
                headerStyle: {
                  backgroundColor: '#059473',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            >
          <Stack.Screen
            name="Login"
            component={RealLoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RealRegisterScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Main"
            component={MainTabsWithChat}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ProductDetail"
            component={ProductDetailScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Blog"
            component={BlogScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="BlogDetail"
            component={BlogDetailScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="About"
            component={AboutScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="EditProfile"
            component={EditProfileScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Checkout"
            component={CheckoutScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="OrderConfirmation"
            component={OrderConfirmationScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ChatBot"
            component={ChatBotScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="OrderHistory"
            component={OrdersScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="OrderDetail"
            component={OrderDetailScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
        </RecentlyViewedProvider>
      </CartProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  // Header Styles - RESPONSIVE AND COMPACT
  headerContainer: {
    backgroundColor: '#ffffff',
    paddingTop: 25, // Much less space above logo
  },

  // Top Bar Styles
  topBar: {
    backgroundColor: '#1f2937',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    color: '#ffffff',
    fontSize: 11,
    marginLeft: 4,
  },
  topRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  socialIcon: {
    padding: 4,
  },
  userButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  userText: {
    color: '#ffffff',
    fontSize: 11,
    marginLeft: 4,
  },

  // Main Header with EASYSHOP Logo - EVENLY ALIGNED
  mainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 2, // Minimal vertical spacing
    backgroundColor: '#ffffff',
    minHeight: 44, // Smaller consistent height
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flex: 1, // Take available space for better alignment
  },
  logoImage: {
    width: 110, // Slightly smaller for better proportion
    height: 36,
    maxWidth: 110,
    maxHeight: 36,
  },

  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // Even tighter spacing between icons
  },
  iconButton: {
    padding: 3, // Reduced padding for tighter spacing
    borderRadius: 5,
    backgroundColor: '#f9fafb',
    minWidth: 32, // Consistent button size
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Navigation Menu
  navMenu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  navItem: {
    paddingHorizontal: 8,
  },
  navText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    letterSpacing: 0.5,
  },

  // Search Section - Clean Design with Better Spacing
  searchSection: {
    paddingHorizontal: 20, // Match main header padding
    paddingVertical: 4, // Minimal spacing
    backgroundColor: '#ffffff',
    position: 'relative',
    zIndex: 1000,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059473',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 6,
    gap: 4,
    height: 44, // Fixed height to match search input
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
    marginHorizontal: 6,
  },
  // Category Dropdown List Styles
  categoryDropdownList: {
    position: 'absolute',
    top: 160, // Fixed position below header and search
    left: 15,
    right: 15,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 9999,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryDropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  categoryDropdownText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    height: 44, // Fixed height to match category dropdown
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1f2937',
  },
  searchButton: {
    backgroundColor: '#059473',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  supportInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  supportText: {
    alignItems: 'flex-start',
  },
  supportNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  supportLabel: {
    fontSize: 10,
    color: '#6b7280',
  },

  // Other header styles
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#059473',
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#059473',
    marginBottom: 8,
  },

  // Hero Banner Styles - MOBILE OPTIMIZED
  heroSection: {
    marginVertical: 15,
    position: 'relative',
    zIndex: 1,
  },
  bannerCarousel: {
    paddingHorizontal: 15,
  },
  bannerContainer: {
    marginHorizontal: 5,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  bannerImage: {
    width: '100%',
    height: 260, // Even taller hero carousel images
    resizeMode: 'cover',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bannerShopText: {
    fontSize: 24, // Smaller for mobile
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 5,
    letterSpacing: 4,
  },
  bannerArrow: {
    position: 'absolute',
    top: '50%',
    width: 35, // Smaller arrows for mobile
    height: 35,
    borderRadius: 17.5,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -17.5,
  },
  bannerArrowLeft: {
    left: 10,
  },
  bannerArrowRight: {
    right: 10,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  dot: {
    width: 8, // Smaller dots for mobile
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    backgroundColor: '#059473',
  },
  inactiveDot: {
    backgroundColor: '#d1d5db',
  },

  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#059473',
    fontWeight: '500',
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
    marginVertical: 20,
  },

  // Section Styles - EXACT LIKE WEBSITE
  section: {
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },

  // Category Styles - EXACT LIKE WEBSITE
  categoriesList: {
    paddingVertical: 10,
  },
  viewAllButton: {
    backgroundColor: '#059473',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  viewAllButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  categoryCard: {
    width: 120,
    height: 120,
    marginRight: 15,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryFullOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  categoryOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  categoryName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    paddingHorizontal: 10,
    elevation: 5,
  },

  // Product Styles - EXACT LIKE WEBSITE
  productsList: {
    paddingVertical: 10,
  },
  productCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    margin: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    resizeMode: 'cover',
    marginBottom: 10,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  originalPrice: {
    fontSize: 12,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
    marginRight: 6,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059473',
  },
  discountBadge: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 11,
    color: '#6b7280',
    marginLeft: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059473',
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },

  // Product Detail Styles - EXACT LIKE WEBSITE
  productDetailContainer: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productDetailImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  productDetailInfo: {
    padding: 20,
  },
  productDetailName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  productDetailBrand: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 12,
  },
  productDetailPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#059473',
  },
  productDescription: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
    marginVertical: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059473',
    paddingVertical: 14,
    borderRadius: 8,
  },
  addToCartText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  buyNowButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f2937',
    paddingVertical: 14,
    borderRadius: 8,
  },
  buyNowText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // People Also Like Styles
  suggestionsSection: {
    backgroundColor: '#ffffff',
    marginTop: 20,
    paddingVertical: 20,
  },
  suggestionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  suggestionsCarousel: {
    paddingHorizontal: 10,
  },
  suggestionCard: {
    width: width * 0.4,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  suggestionImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  suggestionInfo: {
    padding: 12,
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    lineHeight: 18,
  },
  suggestionBrand: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
  },
  suggestionPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  suggestionOriginalPrice: {
    fontSize: 12,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
    marginRight: 6,
  },
  suggestionPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#059473',
  },
  suggestionRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionRatingText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  suggestionsIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  suggestionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
    marginHorizontal: 4,
  },
  suggestionDotActive: {
    backgroundColor: '#059473',
    width: 20,
  },

  // Login/Register Styles - EXACT LIKE WEBSITE
  form: {
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1f2937',
  },
  loginButton: {
    backgroundColor: '#059473',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#059473',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: {
    color: '#059473',
    fontSize: 16,
    fontWeight: '500',
  },

  // Cart Styles - EXACT LIKE WEBSITE
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyCartText: {
    fontSize: 18,
    color: '#6b7280',
    marginVertical: 20,
  },
  shopNowButton: {
    backgroundColor: '#059473',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopNowText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Profile Styles - EXACT LIKE WEBSITE
  profileSection: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#059473',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  menuSection: {
    backgroundColor: '#ffffff',
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 15,
  },

  // BLOG STYLES - EXACT LIKE FRONTEND
  blogHeader: {
    backgroundColor: '#059473',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  blogHeaderTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  blogBanner: {
    height: 220,
    position: 'relative',
  },
  blogBannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  blogBannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(36, 34, 34, 0.54)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blogBannerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  blogBreadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breadcrumbText: {
    color: '#ffffff',
    fontSize: 16,
  },
  blogMainContent: {
    padding: 20,
  },
  searchSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#d1d5db',
    height: 45,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  searchButton: {
    backgroundColor: '#059473',
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  blogPostsSection: {
    marginBottom: 20,
  },
  blogPostsList: {
    paddingBottom: 20,
  },
  blogCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  blogImageContainer: {
    height: 240,
    overflow: 'hidden',
  },
  blogImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  blogContent: {
    padding: 20,
  },
  blogMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 12,
  },
  blogMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  blogMetaText: {
    fontSize: 12,
    color: '#6b7280',
  },
  blogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    lineHeight: 24,
  },
  blogExcerpt: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 15,
  },
  readMoreButton: {
    backgroundColor: '#059473',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  categoryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryFilterName: {
    fontSize: 14,
    color: '#6b7280',
  },
  categoryCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  recentPostsSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recentPostItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 15,
  },
  recentPostImage: {
    width: 70,
    height: 70,
    borderRadius: 6,
    resizeMode: 'cover',
  },
  recentPostContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  recentPostTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    lineHeight: 18,
    marginBottom: 4,
  },
  recentPostDate: {
    fontSize: 12,
    color: '#6b7280',
  },

  // BLOG DETAIL STYLES
  blogDetailContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  blogDetailImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  blogDetailContent: {
    padding: 20,
  },
  blogDetailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
    lineHeight: 32,
  },
  blogDetailMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 15,
  },
  blogDetailMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  blogDetailMetaText: {
    fontSize: 14,
    color: '#6b7280',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 12,
    color: '#374151',
  },
  blogDetailText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 30,
  },
  authorBio: {
    backgroundColor: '#f9fafb',
    padding: 20,
    borderRadius: 8,
    marginBottom: 30,
  },
  authorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 15,
  },
  authorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    resizeMode: 'cover',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  authorTitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  authorDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  relatedPosts: {
    marginBottom: 30,
  },
  relatedPostsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  relatedPostsGrid: {
    flexDirection: 'row',
    gap: 15,
  },
  relatedPostCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  relatedPostImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  relatedPostContent: {
    padding: 15,
  },
  relatedPostTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    lineHeight: 18,
  },
  relatedPostDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  backToBlogButton: {
    backgroundColor: '#059473',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
    alignSelf: 'center',
  },
  backToBlogText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  // BLOG TAB STYLES
  blogTabContainer: {
    flex: 1,
    padding: 20,
  },
  blogTabTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  blogTabSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 30,
  },
  blogTabCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  blogTabImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  blogTabContent: {
    padding: 15,
  },
  blogTabCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    lineHeight: 22,
  },
  blogTabCardDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  viewAllBlogButton: {
    backgroundColor: '#059473',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    gap: 8,
  },
  viewAllBlogText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  // ABOUT US STYLES - EXACT LIKE FRONTEND
  aboutBanner: {
    height: 220,
    position: 'relative',
  },
  aboutBannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  aboutBannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(36, 34, 34, 0.54)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aboutBannerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  aboutBreadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aboutContent: {
    padding: 20,
  },
  storySection: {
    marginBottom: 40,
  },
  storyImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 20,
    resizeMode: 'cover',
  },
  storyContent: {
    paddingHorizontal: 0,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 15,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  storyText: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    marginBottom: 15,
  },
  featuresList: {
    marginTop: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  featureText: {
    fontSize: 16,
    color: '#6b7280',
    flex: 1,
  },
  whyChooseSection: {
    marginBottom: 40,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  featureCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 15,
  },
  featureIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#dbf3ed',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
    textAlign: 'center',
  },
  featureCardText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  teamSection: {
    marginBottom: 20,
  },
  teamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  teamCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    overflow: 'hidden',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 15,
  },
  teamImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  teamInfo: {
    padding: 15,
    alignItems: 'center',
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  teamPosition: {
    fontSize: 14,
    color: '#059473',
  },
});
