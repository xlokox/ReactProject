import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Customer login — aligned to /customer/login and standardized token storage
export const customer_login = createAsyncThunk(
  'auth/customer_login',
  async (info, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post('/customer/login', info);
      // Persist standardized keys for cross-platform parity
      if (data?.token) {
        await AsyncStorage.setItem('customerToken', data.token);
      }
      if (data?.userInfo) {
        await AsyncStorage.setItem('customerInfo', JSON.stringify(data.userInfo));
      }
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error?.response?.data || { error: 'Login failed' });
    }
  }
);

// Customer register — aligned to /customer/register
export const customer_register = createAsyncThunk(
  'auth/customer_register',
  async (info, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post('/customer/register', info);
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error?.response?.data || { error: 'Registration failed' });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    loader: false,
    userInfo: null,
    errorMessage: '',
    successMessage: '',
    token: null,
  },
  reducers: {
    messageClear: (state) => {
      state.errorMessage = '';
      state.successMessage = '';
    },
    user_reset: (state) => {
      state.userInfo = null;
      state.token = null;
    },
    logout_success: (state) => {
      state.userInfo = null;
      state.token = null;
      state.successMessage = 'Logged out';
    }
  },
  extraReducers: (builder) => {
    builder
      // Customer login
      .addCase(customer_login.pending, (state) => {
        state.loader = true;
      })
      .addCase(customer_login.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.error;
      })
      .addCase(customer_login.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.token = payload.token;
        state.userInfo = payload.userInfo;
      })
      // Customer register
      .addCase(customer_register.pending, (state) => {
        state.loader = true;
      })
      .addCase(customer_register.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.error;
      })
      .addCase(customer_register.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
      });
  },
});

export const { messageClear, user_reset } = authSlice.actions;
export default authSlice.reducer;
