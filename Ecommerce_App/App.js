import React, { useRef, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RecentlyViewedProvider, useRecentlyViewed } from './src/context/RecentlyViewedContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

// API BASE URL - CONNECT TO YOUR BACKEND
const API_BASE_URL = 'http://172.20.10.6:5001/api';

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

// EXACT CATEGORIES FROM YOUR BACKEND - MATCHING FRONTEND
const CATEGORIES = [
  { _id: '1', name: 'Electronics', slug: 'electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3' },
  { _id: '2', name: 'Clothing', slug: 'clothing', image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3' },
  { _id: '3', name: 'Home & Kitchen', slug: 'home-kitchen', image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3' },
  { _id: '4', name: 'Books', slug: 'books', image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3' },
  { _id: '5', name: 'Toys', slug: 'toys', image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?q=80&w=2928&auto=format&fit=crop&ixlib=rb-4.0.3' }
];

// COMPREHENSIVE PRODUCTS - EXACT MATCH WITH BACKEND (40 PRODUCTS)
const PRODUCTS = [
  // ELECTRONICS CATEGORY (8 products)
  {
    _id: '1', name: 'iPhone 15 Pro', slug: 'iphone-15-pro', category: 'Electronics', brand: 'Apple', price: 999, stock: 50, discount: 5,
    description: 'Latest iPhone with titanium design and A17 Pro chip', shopName: 'Tech Store', rating: 4.8,
    images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=2942&auto=format&fit=crop&ixlib=rb-4.0.3']
  },
  {
    _id: '2', name: 'Samsung Galaxy S24', slug: 'samsung-galaxy-s24', category: 'Electronics', brand: 'Samsung', price: 899, stock: 45, discount: 8,
    description: 'Flagship Android phone with AI features', shopName: 'Tech Store', rating: 4.7,
    images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3']
  },
  {
    _id: '3', name: 'MacBook Pro M3', slug: 'macbook-pro-m3', category: 'Electronics', brand: 'Apple', price: 1999, stock: 25, discount: 10,
    description: 'Professional laptop with M3 chip for creators', shopName: 'Tech Store', rating: 4.9,
    images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=2942&auto=format&fit=crop&ixlib=rb-4.0.3']
  },
  {
    _id: '4', name: 'Dell XPS 13', slug: 'dell-xps-13', category: 'Electronics', brand: 'Dell', price: 1299, stock: 30, discount: 15,
    description: 'Ultrabook with Intel Core i7 and premium design', shopName: 'Tech Store', rating: 4.6,
    images: ['https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=2920&auto=format&fit=crop&ixlib=rb-4.0.3']
  },
  {
    _id: '5', name: 'Sony WH-1000XM5', slug: 'sony-wh-1000xm5', category: 'Electronics', brand: 'Sony', price: 399, stock: 60, discount: 12,
    description: 'Premium noise-canceling wireless headphones', shopName: 'Audio Pro', rating: 4.8,
    images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=2865&auto=format&fit=crop&ixlib=rb-4.0.3']
  },
  {
    _id: '6', name: 'Apple Watch Series 9', slug: 'apple-watch-series-9', category: 'Electronics', brand: 'Apple', price: 429, stock: 40, discount: 7,
    description: 'Advanced smartwatch with health monitoring', shopName: 'Tech Store', rating: 4.7,
    images: ['https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=2872&auto=format&fit=crop&ixlib=rb-4.0.3']
  },
  {
    _id: '7', name: 'iPad Air', slug: 'ipad-air', category: 'Electronics', brand: 'Apple', price: 599, stock: 35, discount: 6,
    description: 'Powerful tablet for work and creativity', shopName: 'Tech Store', rating: 4.6,
    images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3']
  },
  {
    _id: '8', name: 'Gaming Console', slug: 'gaming-console', category: 'Electronics', brand: 'Sony', price: 499, stock: 20, discount: 0,
    description: 'Next-gen gaming console with 4K graphics', shopName: 'Gaming Zone', rating: 4.9,
    images: ['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3']
  },

  // CLOTHING CATEGORY (8 products)
  {
    _id: '9', name: 'Premium Cotton T-Shirt', slug: 'premium-cotton-tshirt', category: 'Clothing', brand: 'Nike', price: 29.99, stock: 100, discount: 5,
    description: 'Comfortable cotton t-shirt for everyday wear', shopName: 'Fashion Hub', rating: 4.2,
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2880&auto=format&fit=crop&ixlib=rb-4.0.3']
  },
  {
    _id: '10', name: 'Elegant Summer Dress', slug: 'elegant-summer-dress', category: 'Clothing', brand: 'Zara', price: 79.99, stock: 80, discount: 15,
    description: 'Beautiful summer dress for special occasions', shopName: 'Fashion Hub', rating: 4.5,
    images: ['https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3']
  },
  {
    _id: '11', name: 'Running Sneakers', slug: 'running-sneakers', category: 'Clothing', brand: 'Adidas', price: 129.99, stock: 70, discount: 20,
    description: 'High-performance running shoes with boost technology', shopName: 'Sports World', rating: 4.6,
    images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2912&auto=format&fit=crop&ixlib=rb-4.0.3']
  },
  {
    _id: '12', name: 'Denim Jeans', slug: 'denim-jeans', category: 'Clothing', brand: 'Levis', price: 89.99, stock: 90, discount: 10,
    description: 'Classic denim jeans with perfect fit', shopName: 'Fashion Hub', rating: 4.4,
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=2926&auto=format&fit=crop&ixlib=rb-4.0.3']
  },
  {
    _id: '13', name: 'Winter Jacket', slug: 'winter-jacket', category: 'Clothing', brand: 'North Face', price: 199.99, stock: 40, discount: 25,
    description: 'Warm winter jacket for cold weather', shopName: 'Outdoor Gear', rating: 4.7,
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3']
  },
  {
    _id: '14', name: 'Business Shirt', slug: 'business-shirt', category: 'Clothing', brand: 'Hugo Boss', price: 119.99, stock: 60, discount: 8,
    description: 'Professional business shirt for office wear', shopName: 'Business Attire', rating: 4.3,
    images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3']
  },
  {
    _id: '15', name: 'Sports Hoodie', slug: 'sports-hoodie', category: 'Clothing', brand: 'Under Armour', price: 69.99, stock: 85, discount: 12,
    description: 'Comfortable hoodie for sports and casual wear', shopName: 'Sports World', rating: 4.5,
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3']
  },
  {
    _id: '16', name: 'Formal Shoes', slug: 'formal-shoes', category: 'Clothing', brand: 'Clarks', price: 149.99, stock: 50, discount: 18,
    description: 'Elegant formal shoes for business occasions', shopName: 'Shoe Store', rating: 4.6,
    images: ['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3']
  },

  // HOME & KITCHEN CATEGORY (8 products)
  {
    _id: '17', name: 'Smart Coffee Maker', slug: 'smart-coffee-maker', category: 'Home & Kitchen', brand: 'Breville', price: 299.99, stock: 35, discount: 18,
    description: 'WiFi-enabled coffee maker with app control', shopName: 'Home Essentials', rating: 4.7,
    images: ['https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3']
  },
  {
    _id: '18', name: 'Air Fryer', slug: 'air-fryer', category: 'Home & Kitchen', brand: 'Ninja', price: 149.99, stock: 45, discount: 22,
    description: 'Healthy cooking with hot air circulation', shopName: 'Kitchen Pro', rating: 4.6,
    images: ['https://images.unsplash.com/photo-1585515656643-1e4d1d6d8c8b?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3']
  },
  {
    _id: '19', name: 'Blender', slug: 'blender', category: 'Home & Kitchen', brand: 'Vitamix', price: 399.99, stock: 25, discount: 15,
    description: 'Professional-grade blender for smoothies and more', shopName: 'Kitchen Pro', rating: 4.8,
    images: ['https://images.unsplash.com/photo-1570197788417-0e82375c9371?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3']
  },
  {
    _id: '20', name: 'Non-Stick Pan Set', slug: 'non-stick-pan-set', category: 'Home & Kitchen', brand: 'Tefal', price: 89.99, stock: 60, discount: 12,
    description: 'Complete set of non-stick cooking pans', shopName: 'Kitchen Essentials', rating: 4.4,
    images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3']
  },
  {
    _id: '21', name: 'Microwave Oven', slug: 'microwave-oven', category: 'Home & Kitchen', brand: 'Panasonic', price: 199.99, stock: 30, discount: 10,
    description: 'Compact microwave with multiple cooking modes', shopName: 'Home Appliances', rating: 4.3,
    images: ['https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3']
  },
  {
    _id: '22', name: 'Knife Set', slug: 'knife-set', category: 'Home & Kitchen', brand: 'Wusthof', price: 249.99, stock: 40, discount: 20,
    description: 'Professional chef knife set with wooden block', shopName: 'Kitchen Pro', rating: 4.9,
    images: ['https://images.unsplash.com/photo-1593618998160-e34014e67546?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3']
  },
  {
    _id: '23', name: 'Rice Cooker', slug: 'rice-cooker', category: 'Home & Kitchen', brand: 'Zojirushi', price: 179.99, stock: 35, discount: 8,
    description: 'Smart rice cooker with fuzzy logic technology', shopName: 'Kitchen Essentials', rating: 4.7,
    images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3']
  },
  {
    _id: '24', name: 'Stand Mixer', slug: 'stand-mixer', category: 'Home & Kitchen', brand: 'KitchenAid', price: 349.99, stock: 20, discount: 25,
    description: 'Professional stand mixer for baking enthusiasts', shopName: 'Baking Supplies', rating: 4.8,
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3']
  },

  // BOOKS CATEGORY (8 products)
  {
    _id: '25', name: 'The Great Novel', slug: 'the-great-novel', category: 'Books', brand: 'Penguin', price: 24.99, stock: 200, discount: 0,
    description: 'Bestselling fiction novel that captivates readers', shopName: 'Book World', rating: 4.9,
    images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3']
  },
  {
    _id: '26', name: 'Business Strategy Guide', slug: 'business-strategy-guide', category: 'Books', brand: 'Harvard Business', price: 34.99, stock: 150, discount: 5,
    description: 'Comprehensive guide to modern business strategies', shopName: 'Book World', rating: 4.6,
    images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=2798&auto=format&fit=crop&ixlib=rb-4.0.3']
  },
  {
    _id: '27', name: 'Cooking Masterclass', slug: 'cooking-masterclass', category: 'Books', brand: 'Gordon Ramsay', price: 29.99, stock: 100, discount: 10,
    description: 'Learn professional cooking techniques from the master', shopName: 'Culinary Books', rating: 4.7,
    images: ['https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3']
  },
  {
    _id: '28', name: 'Science Fiction Epic', slug: 'science-fiction-epic', category: 'Books', brand: 'Orbit Books', price: 19.99, stock: 180, discount: 8,
    description: 'Epic space adventure that spans galaxies', shopName: 'Sci-Fi Corner', rating: 4.5,
    images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3']
  },
  {
    _id: '29', name: 'Self-Help Guide', slug: 'self-help-guide', category: 'Books', brand: 'Random House', price: 22.99, stock: 120, discount: 12,
    description: 'Transform your life with proven strategies', shopName: 'Personal Development', rating: 4.4,
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3']
  },
  {
    _id: '30', name: 'History Chronicles', slug: 'history-chronicles', category: 'Books', brand: 'Oxford Press', price: 39.99, stock: 80, discount: 15,
    description: 'Comprehensive history of ancient civilizations', shopName: 'Academic Books', rating: 4.8,
    images: ['https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3']
  },
  {
    _id: '31', name: 'Programming Fundamentals', slug: 'programming-fundamentals', category: 'Books', brand: 'Tech Publications', price: 49.99, stock: 90, discount: 20,
    description: 'Learn programming from basics to advanced concepts', shopName: 'Tech Books', rating: 4.6,
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3']
  },
  {
    _id: '32', name: 'Art & Design Inspiration', slug: 'art-design-inspiration', category: 'Books', brand: 'Creative Press', price: 32.99, stock: 70, discount: 6,
    description: 'Beautiful collection of modern art and design', shopName: 'Art Books', rating: 4.7,
    images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3']
  },

  // TOYS CATEGORY (8 products)
  {
    _id: '33', name: 'Remote Control Drone', slug: 'remote-control-drone', category: 'Toys', brand: 'DJI', price: 199.99, stock: 45, discount: 15,
    description: 'High-tech drone for outdoor adventures', shopName: 'Toy Land', rating: 4.6,
    images: ['https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3']
  },
  {
    _id: '34', name: 'LEGO Architecture Set', slug: 'lego-architecture-set', category: 'Toys', brand: 'LEGO', price: 89.99, stock: 60, discount: 10,
    description: 'Build famous landmarks with detailed LEGO sets', shopName: 'Building Blocks', rating: 4.8,
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3']
  },
  {
    _id: '35', name: 'Board Game Collection', slug: 'board-game-collection', category: 'Toys', brand: 'Hasbro', price: 49.99, stock: 85, discount: 12,
    description: 'Classic board games for family entertainment', shopName: 'Game Central', rating: 4.5,
    images: ['https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?q=80&w=2831&auto=format&fit=crop&ixlib=rb-4.0.3']
  },
  {
    _id: '36', name: 'Action Figure Set', slug: 'action-figure-set', category: 'Toys', brand: 'Marvel', price: 34.99, stock: 100, discount: 8,
    description: 'Collectible superhero action figures', shopName: 'Hero Toys', rating: 4.4,
    images: ['https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3']
  },
  {
    _id: '37', name: 'Educational Puzzle', slug: 'educational-puzzle', category: 'Toys', brand: 'Ravensburger', price: 24.99, stock: 120, discount: 5,
    description: 'Educational jigsaw puzzle for learning and fun', shopName: 'Learning Toys', rating: 4.6,
    images: ['https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3']
  },
  {
    _id: '38', name: 'RC Racing Car', slug: 'rc-racing-car', category: 'Toys', brand: 'Hot Wheels', price: 79.99, stock: 55, discount: 18,
    description: 'High-speed remote control racing car', shopName: 'Speed Toys', rating: 4.7,
    images: ['https://images.unsplash.com/photo-1594787318286-3d835c1d207f?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3']
  },
  {
    _id: '39', name: 'Dollhouse Playset', slug: 'dollhouse-playset', category: 'Toys', brand: 'Barbie', price: 129.99, stock: 40, discount: 22,
    description: 'Complete dollhouse with furniture and accessories', shopName: 'Doll World', rating: 4.5,
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3']
  },
  {
    _id: '40', name: 'Science Experiment Kit', slug: 'science-experiment-kit', category: 'Toys', brand: 'National Geographic', price: 59.99, stock: 70, discount: 14,
    description: 'Hands-on science experiments for curious minds', shopName: 'STEM Toys', rating: 4.8,
    images: ['https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3']
  }
];

// EXACT BANNERS FROM YOUR WEBSITE - SAME AS FRONTEND
const BANNERS = [
  {
    _id: '1',
    banner: 'http://localhost:3000/images/banner/1.jpg',
    link: '/product/details/smartphone',
    title: 'Shop Banner 1'
  },
  {
    _id: '2',
    banner: 'http://localhost:3000/images/banner/2.jpg',
    link: '/product/details/laptop',
    title: 'Shop Banner 2'
  },
  {
    _id: '3',
    banner: 'http://localhost:3000/images/banner/3.jpg',
    link: '/product/details/t-shirt',
    title: 'Shop Banner 3'
  },
  {
    _id: '4',
    banner: 'http://localhost:3000/images/banner/4.jpg',
    link: '/product/details/coffee-maker',
    title: 'Shop Banner 4'
  },
  {
    _id: '5',
    banner: 'http://localhost:3000/images/banner/5.jpg',
    link: '/product/details/novel',
    title: 'Shop Banner 5'
  },
  {
    _id: '6',
    banner: 'http://localhost:3000/images/banner/6.jpg',
    link: '/product/details/toy-car',
    title: 'Shop Banner 6'
  }
];

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
  const { recentlyViewed, addToRecentlyViewed } = useRecentlyViewed();

  // USE HARDCODED DATA FOR NOW - WORKING PERFECTLY
  const categoriesData = CATEGORIES;
  const products = PRODUCTS;
  const topRatedProducts = PRODUCTS.filter(p => p.rating >= 4.5); // Top rated
  const discountProducts = PRODUCTS.filter(p => p.discount > 0); // Products with discount

  // Load categories on component mount
  React.useEffect(() => {
    setCategories(categoriesData);
  }, []);

  // Handle category selection
  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
    setShowCategoryDropdown(false);
    // Navigate to Products screen with category filter
    if (categoryName !== 'All Category') {
      navigation.navigate('Products', {
        category: categoryName,
        fromCategory: true
      });
    } else {
      // Show all products when "All Category" is selected
      navigation.navigate('Products');
    }
  };

  // Auto-scroll banner carousel every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (bannerRef.current) {
        const nextIndex = (currentBannerIndex + 1) % BANNERS.length;
        bannerRef.current.scrollToIndex({
          index: nextIndex,
          animated: true
        });
        setCurrentBannerIndex(nextIndex);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [currentBannerIndex]);

  const renderBanner = ({ item, index }) => (
    <TouchableOpacity
      style={[styles.bannerContainer, { width: width - 30 }]}
      onPress={() => console.log('Banner clicked:', item.title)}
    >
      <Image
        source={{ uri: item.banner }}
        style={styles.bannerImage}
        onError={() => {
          console.log('Banner image failed to load:', item.banner);
        }}
      />
      {/* Banner Overlay with "SHOP" text like website */}
      <View style={styles.bannerOverlay}>
        <Text style={styles.bannerShopText}>SHOP</Text>
      </View>

      {/* Navigation Arrows */}
      {index === currentBannerIndex && (
        <>
          <TouchableOpacity
            style={[styles.bannerArrow, styles.bannerArrowLeft]}
            onPress={() => {
              const prevIndex = currentBannerIndex === 0 ? BANNERS.length - 1 : currentBannerIndex - 1;
              bannerRef.current?.scrollToIndex({ index: prevIndex, animated: true });
              setCurrentBannerIndex(prevIndex);
            }}
          >
            <Ionicons name="chevron-back" size={20} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.bannerArrow, styles.bannerArrowRight]}
            onPress={() => {
              const nextIndex = (currentBannerIndex + 1) % BANNERS.length;
              bannerRef.current?.scrollToIndex({ index: nextIndex, animated: true });
              setCurrentBannerIndex(nextIndex);
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

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => {
        addToRecentlyViewed(item);
        navigation.navigate('ProductDetail', { product: item });
      }}
    >
      <Image source={{ uri: item.images[0] }} style={styles.productImage} />
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
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="cart" size={16} color="#ffffff" />
          <Text style={styles.addButtonText}>Add to Cart</Text>
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
            <View style={styles.logoIcon}>
              <Text style={styles.logoF}>F</Text>
            </View>
            <Text style={styles.logoText}>EASY SHOP</Text>
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
              />
              <TouchableOpacity style={styles.searchButton}>
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
          data={BANNERS}
          renderItem={renderBanner}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          snapToInterval={width - 30}
          decelerationRate="fast"
          contentContainerStyle={styles.bannerCarousel}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / (width - 30));
            setCurrentBannerIndex(index);
          }}
        />

        {/* Dots Indicator - EXACT LIKE WEBSITE */}
        <View style={styles.dotsContainer}>
          {BANNERS.map((_, index) => (
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
          data={categories}
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
          <Text style={styles.viewAllButtonText}>View All Products ({PRODUCTS.length})</Text>
        </TouchableOpacity>
      </View>

      {/* Featured Products - EXACT LIKE WEBSITE */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured Products</Text>
        <FlatList
          data={products.slice(0, 6)}
          renderItem={renderProduct}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.productsList}
        />
      </View>

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
  const { addToRecentlyViewed } = useRecentlyViewed();

  // If accessed from bottom tab, always show all products
  // If accessed from category selection, show filtered products
  const filteredProducts = category && route.params?.fromCategory
    ? PRODUCTS.filter(p => p.category === category)
    : PRODUCTS;

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => {
        addToRecentlyViewed(item);
        navigation.navigate('ProductDetail', { product: item });
      }}
    >
      <Image source={{ uri: item.images[0] }} style={styles.productImage} />
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
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="cart" size={16} color="#ffffff" />
          <Text style={styles.addButtonText}>Add to Cart</Text>
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
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.productsList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// Product Detail Screen - EXACT LIKE WEBSITE
function ProductDetailScreen({ navigation, route }) {
  const { product } = route.params;
  const { addToRecentlyViewed } = useRecentlyViewed();

  // Add to recently viewed when component mounts
  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product);
    }
  }, [product, addToRecentlyViewed]);

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
            <TouchableOpacity style={styles.addToCartButton}>
              <Ionicons name="cart" size={20} color="#ffffff" />
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.buyNowButton}>
              <Text style={styles.buyNowText}>Buy Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// Cart Screen - EXACT LIKE WEBSITE
function CartScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Shopping Cart</Text>
        <TouchableOpacity>
          <Ionicons name="trash-outline" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.emptyCart}>
        <Ionicons name="bag-outline" size={80} color="#9ca3af" />
        <Text style={styles.emptyCartText}>Your cart is empty</Text>
        <TouchableOpacity
          style={styles.shopNowButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.shopNowText}>Shop Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Profile Screen - EXACT LIKE WEBSITE
function ProfileScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Account</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Ionicons name="log-out-outline" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="#059473" />
        </View>
        <Text style={styles.userName}>Guest User</Text>
        <Text style={styles.userEmail}>guest@example.com</Text>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="person-outline" size={24} color="#059473" />
          <Text style={styles.menuText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="location-outline" size={24} color="#059473" />
          <Text style={styles.menuText}>Addresses</Text>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="card-outline" size={24} color="#059473" />
          <Text style={styles.menuText}>Payment Methods</Text>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="receipt-outline" size={24} color="#059473" />
          <Text style={styles.menuText}>Order History</Text>
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
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Blog') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'About') {
            iconName = focused ? 'information-circle' : 'information-circle-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'cart' : 'cart-outline';
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
      <Tab.Screen name="About" component={AboutScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
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
    <RecentlyViewedProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          initialRouteName="Main"
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
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Main"
            component={MainTabs}
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
        </Stack.Navigator>
      </NavigationContainer>
    </RecentlyViewedProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  // Header Styles - EXACT LIKE EASYSHOP WEBSITE
  headerContainer: {
    backgroundColor: '#ffffff',
    paddingTop: 40,
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

  // Main Header with EASYSHOP Logo
  mainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#1e3a8a',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoF: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    letterSpacing: 1,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 15,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
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

  // Search Section - Clean Design
  searchSection: {
    paddingHorizontal: 15,
    paddingVertical: 12,
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
    height: 180, // Much smaller for mobile
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
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
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
