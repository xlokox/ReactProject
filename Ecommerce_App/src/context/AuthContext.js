import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('customerToken');
      const storedUser = await AsyncStorage.getItem('customerInfo');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      console.log('🔐 Login attempt with email:', email);
      const { data } = await api.post('/customer/login', { email, password });

      console.log('✅ Login response received:', data);

      if (data?.token) {
        await AsyncStorage.setItem('customerToken', data.token);
        console.log('✅ Token saved to AsyncStorage');
      }
      if (data?.userInfo) {
        await AsyncStorage.setItem('customerInfo', JSON.stringify(data.userInfo));
        console.log('✅ User info saved to AsyncStorage');
      }
      setToken(data?.token || null);
      setUser(data?.userInfo || null);
      console.log('✅ Login successful!');
      return { success: true };
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error message:', error.message);
      return {
        success: false,
        message: error.response?.data?.error || error.response?.data?.message || 'שגיאה בהתחברות'
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      console.log('📝 Registering user:', userData.email);
      console.log('📝 User data:', { name: userData.name, email: userData.email });

      const { data } = await api.post('/customer/register', userData);

      console.log('✅ Registration response received:', data);

      // If registration successful and returns token, log the user in automatically
      if (data?.token && data?.userInfo) {
        await AsyncStorage.setItem('customerToken', data.token);
        await AsyncStorage.setItem('customerInfo', JSON.stringify(data.userInfo));
        setToken(data.token);
        setUser(data.userInfo);
        console.log('✅ User registered and logged in automatically');
      }

      return { success: !!data, message: data?.message || 'הרשמה בוצעה בהצלחה' };
    } catch (error) {
      console.error('❌ Register error:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error message:', error.message);
      console.error('Error status:', error.response?.status);
      return {
        success: false,
        message: error.response?.data?.error || error.response?.data?.message || 'שגיאה בהרשמה'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('customerToken');
      await AsyncStorage.removeItem('customerInfo');
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
