import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

// Place order
export const place_order = createAsyncThunk(
  'order/place_order',
  async (info, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post('/order/place-order', info);
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get orders
export const get_orders = createAsyncThunk(
  'order/get_orders',
  async ({ customerId, status }, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/order/get-orders/${customerId}/${status}`);
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get order details
export const get_order_details = createAsyncThunk(
  'order/get_order_details',
  async (orderId, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/order/get-order-details/${orderId}`);
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    myOrders: [],
    order: {},
    errorMessage: '',
    successMessage: '',
    loader: false
  },
  reducers: {
    messageClear: (state) => {
      state.errorMessage = '';
      state.successMessage = '';
    }
  },
  extraReducers: (builder) => {
    builder
      // Place order
      .addCase(place_order.pending, (state) => {
        state.loader = true;
      })
      .addCase(place_order.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.error;
      })
      .addCase(place_order.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
      })
      // Get orders
      .addCase(get_orders.fulfilled, (state, { payload }) => {
        state.myOrders = payload.orders;
      })
      // Get order details
      .addCase(get_order_details.fulfilled, (state, { payload }) => {
        state.order = payload.order;
      });
  }
});

export const { messageClear } = orderSlice.actions;
export default orderSlice.reducer;
