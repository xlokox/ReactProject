import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      loadCart();
    } else {
      loadLocalCart();
    }
  }, [user, token]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await api.get('/home/product/get-card-product/' + user?.id);
      if (response.data.success) {
        setCartItems(response.data.cart);
        setCartCount(response.data.cart.length);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      loadLocalCart();
    } finally {
      setLoading(false);
    }
  };

  const loadLocalCart = async () => {
    try {
      const localCart = await AsyncStorage.getItem('localCart');
      if (localCart) {
        const cart = JSON.parse(localCart);
        setCartItems(cart);
        setCartCount(cart.length);
      }
    } catch (error) {
      console.error('Error loading local cart:', error);
    }
  };

  const saveLocalCart = async (cart) => {
    try {
      await AsyncStorage.setItem('localCart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving local cart:', error);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    try {
      if (user && token) {
        const response = await cartAPI.addToCart(product._id, quantity);
        if (response.data.success) {
          await loadCart();
          return { success: true, message: 'המוצר נוסף לעגלה' };
        }
      } else {
        // Handle local cart
        const existingItem = cartItems.find(item => item.product._id === product._id);
        let newCart;
        
        if (existingItem) {
          newCart = cartItems.map(item =>
            item.product._id === product._id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          newCart = [...cartItems, { product, quantity, _id: Date.now().toString() }];
        }
        
        setCartItems(newCart);
        setCartCount(newCart.length);
        await saveLocalCart(newCart);
        return { success: true, message: 'המוצר נוסף לעגלה' };
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, message: 'שגיאה בהוספה לעגלה' };
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      if (user && token) {
        const response = await cartAPI.updateQuantity(itemId, quantity);
        if (response.data.success) {
          await loadCart();
          return { success: true };
        }
      } else {
        const newCart = cartItems.map(item =>
          item._id === itemId ? { ...item, quantity } : item
        );
        setCartItems(newCart);
        await saveLocalCart(newCart);
        return { success: true };
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      return { success: false };
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      if (user && token) {
        const response = await cartAPI.removeFromCart(itemId);
        if (response.data.success) {
          await loadCart();
          return { success: true };
        }
      } else {
        const newCart = cartItems.filter(item => item._id !== itemId);
        setCartItems(newCart);
        setCartCount(newCart.length);
        await saveLocalCart(newCart);
        return { success: true };
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      return { success: false };
    }
  };

  const clearCart = async () => {
    try {
      if (user && token) {
        const response = await cartAPI.clearCart();
        if (response.data.success) {
          setCartItems([]);
          setCartCount(0);
        }
      } else {
        setCartItems([]);
        setCartCount(0);
        await AsyncStorage.removeItem('localCart');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  const value = {
    cartItems,
    cartCount,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    loadCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
