import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL from Expo config (app.config.js -> extra.apiUrl)
import Constants from 'expo-constants';
const BASE_URL = Constants?.expoConfig?.extra?.apiUrl || 'http://localhost:5001/api';

// Create axios instance with enhanced configuration
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token and handle mobile-specific headers
api.interceptors.request.use(
  async (config) => {
    try {
      // Add customer token if available
      const customerToken = await AsyncStorage.getItem('customerToken');
      if (customerToken) {
        config.headers.Authorization = `Bearer ${customerToken}`;
      }

      // Add mobile client identifier
      config.headers['X-Client-Type'] = 'mobile';
      config.headers['X-Platform'] = 'react-native';

      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);

    } catch (error) {
      console.error('Error in request interceptor:', error);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token management
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  async (error) => {
    console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status}`);

    if (error.response?.status === 401) {
      // Token expired or invalid - clear stored auth data
      await AsyncStorage.multiRemove(['customerToken', 'customerInfo']);
      console.log('🔄 Cleared expired authentication data');
    }

    // Network error handling for mobile
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      console.error('🌐 Network Error: Check if backend server is running and accessible');
      error.message = 'Unable to connect to server. Please check your internet connection.';
    }

    return Promise.reject(error);
  }
);

// Test connection function
export const testConnection = async () => {
  try {
    const response = await api.get('/test');
    console.log('✅ Backend connection successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    return { success: false, error: error.message };
  }
};

export default api;
