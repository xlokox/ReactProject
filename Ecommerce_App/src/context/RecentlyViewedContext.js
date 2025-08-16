import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RecentlyViewedContext = createContext();

export const useRecentlyViewed = () => {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider');
  }
  return context;
};

export const RecentlyViewedProvider = ({ children }) => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load recently viewed products from AsyncStorage on app start
  useEffect(() => {
    loadRecentlyViewed();
  }, []);

  const loadRecentlyViewed = async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem('recentlyViewed');
      if (stored) {
        const parsed = JSON.parse(stored);
        setRecentlyViewed(parsed);
      }
    } catch (error) {
      console.error('Error loading recently viewed products:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveRecentlyViewed = async (products) => {
    try {
      await AsyncStorage.setItem('recentlyViewed', JSON.stringify(products));
    } catch (error) {
      console.error('Error saving recently viewed products:', error);
    }
  };

  const addToRecentlyViewed = async (product) => {
    try {
      if (!product || !product._id) return;

      setRecentlyViewed(prevViewed => {
        // Remove the product if it already exists (to move it to front)
        const filtered = prevViewed.filter(item => item._id !== product._id);
        
        // Add the product to the beginning of the array
        const newViewed = [product, ...filtered];
        
        // Keep only the first 6 items (stack behavior)
        const limitedViewed = newViewed.slice(0, 6);
        
        // Save to AsyncStorage
        saveRecentlyViewed(limitedViewed);
        
        return limitedViewed;
      });
    } catch (error) {
      console.error('Error adding to recently viewed:', error);
    }
  };

  const clearRecentlyViewed = async () => {
    try {
      setRecentlyViewed([]);
      await AsyncStorage.removeItem('recentlyViewed');
    } catch (error) {
      console.error('Error clearing recently viewed:', error);
    }
  };

  const value = {
    recentlyViewed,
    loading,
    addToRecentlyViewed,
    clearRecentlyViewed,
    loadRecentlyViewed
  };

  return (
    <RecentlyViewedContext.Provider value={value}>
      {children}
    </RecentlyViewedContext.Provider>
  );
};

export default RecentlyViewedContext;
