import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
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

  const loadLocalCart = useCallback(async () => {
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
  }, []);

  const loadCart = useCallback(async () => {
    if (!user?.id) {
      console.log('⚠️ Cannot load cart - no user ID');
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Loading cart for user:', user.id);
      const response = await api.get('/home/product/get-card-products/' + user.id);
      console.log('📦 Cart response:', JSON.stringify(response.data, null, 2));

      if (response.data.card_products && response.data.card_products.length > 0) {
        // Transform backend response to match our cart structure
        const transformedCart = response.data.card_products.map(item => ({
          _id: item._id,
          product: item.products && item.products[0] ? item.products[0] : {},
          quantity: item.quantity,
          userId: item.userId
        }));

        console.log('✅ Transformed cart items:', transformedCart.length);
        console.log('📋 Cart items:', JSON.stringify(transformedCart, null, 2));
        setCartItems(transformedCart);
        setCartCount(transformedCart.length);
      } else {
        console.log('⚠️ No cart products found in response');
        setCartItems([]);
        setCartCount(0);
      }
    } catch (error) {
      console.error('❌ Error loading cart:', error);
      console.error('❌ Error response:', error.response?.data);
      // Fallback to empty cart on error
      setCartItems([]);
      setCartCount(0);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user && token) {
      loadCart();
    } else {
      loadLocalCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, token]);

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
        console.log('🛒 Adding to cart (logged in):', { userId: user.id, productId: product._id, productName: product.name, quantity });
        const response = await api.post('/home/product/add-to-card', {
          userId: user.id,
          productId: product._id,
          quantity
        });

        console.log('📥 Add to cart response:', response.data);

        if (response.data.message === 'Added To Card Successfully') {
          console.log('✅ Product added successfully, reloading cart...');
          await loadCart();
          console.log('🔄 Cart reloaded after adding product');
          return { success: true, message: 'המוצר נוסף לעגלה' };
        } else {
          console.log('❌ Failed to add product:', response.data);
          return { success: false, message: response.data.error || 'Error בהוספה לעגלה' };
        }
      } else {
        console.log('🛒 Adding to cart (guest):', product.name);
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
      console.error('❌ Error adding to cart:', error);
      console.error('❌ Error response:', error.response?.data);
      return { success: false, message: error.response?.data?.error || 'Error בהוספה לעגלה' };
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      if (user && token) {
        // Use quantity-inc or quantity-dec endpoints
        const currentItem = cartItems.find(item => item._id === itemId);
        if (!currentItem) return { success: false };

        const endpoint = quantity > currentItem.quantity
          ? `/home/product/quantity-inc/${itemId}`
          : `/home/product/quantity-dec/${itemId}`;

        const response = await api.put(endpoint);

        if (response.data.message) {
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
        console.log('Removing from cart:', itemId);
        const response = await api.delete(`/home/product/delete-card-products/${itemId}`);
        console.log('Remove response:', response.data);

        if (response.data.message === 'Product Remove Successfully') {
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
      console.log('🗑️ Clearing cart...', { itemCount: cartItems.length, hasUser: !!user, hasToken: !!token });

      if (user && token) {
        // Delete all cart items one by one
        console.log('🗑️ Deleting cart items from server...');
        for (const item of cartItems) {
          try {
            console.log('🗑️ Deleting item:', item._id);
            await api.delete(`/home/product/delete-card-products/${item._id}`);
            console.log('✅ Deleted item:', item._id);
          } catch (deleteError) {
            console.error('❌ Error deleting item:', item._id, deleteError);
            // Continue deleting other items even if one fails
          }
        }
        console.log('✅ All items deleted from server');
        setCartItems([]);
        setCartCount(0);
        console.log('✅ Cart state cleared');
      } else {
        console.log('🗑️ Clearing local cart (no user/token)');
        setCartItems([]);
        setCartCount(0);
        await AsyncStorage.removeItem('localCart');
        console.log('✅ Local cart cleared');
      }

      console.log('✅ Cart cleared successfully!');
      return { success: true };
    } catch (error) {
      console.error('❌ Error clearing cart:', error);
      return { success: false, error };
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
