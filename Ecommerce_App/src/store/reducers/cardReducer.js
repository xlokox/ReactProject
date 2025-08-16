import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

// Add to cart
export const add_to_card = createAsyncThunk(
  'card/add_to_card',
  async (info, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post('/home/product/add-to-card', info);
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get cart products
export const get_card_products = createAsyncThunk(
  'card/get_card_products',
  async (userId, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/home/product/get-card-product/${userId}`);
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Delete cart item
export const delete_card_product = createAsyncThunk(
  'card/delete_card_product',
  async (card_id, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.delete(`/home/product/delete-card-product/${card_id}`);
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Update quantity
export const quantity_inc = createAsyncThunk(
  'card/quantity_inc',
  async (card_id, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.put(`/home/product/quantity-inc/${card_id}`);
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const quantity_dec = createAsyncThunk(
  'card/quantity_dec',
  async (card_id, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.put(`/home/product/quantity-dec/${card_id}`);
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Add to wishlist
export const add_to_wishlist = createAsyncThunk(
  'card/add_to_wishlist',
  async (info, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.post('/home/product/add-to-wishlist', info);
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get wishlist products
export const get_wishlist_products = createAsyncThunk(
  'card/get_wishlist_products',
  async (userId, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/home/product/get-wishlist-products/${userId}`);
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Remove from wishlist
export const remove_wishlist = createAsyncThunk(
  'card/remove_wishlist',
  async (wishlistId, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.delete(`/home/product/remove-wishlist-product/${wishlistId}`);
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const cardSlice = createSlice({
  name: 'card',
  initialState: {
    card_products: [],
    card_product_count: 0,
    wishlist_count: 0,
    wishlist: [],
    price: 0,
    errorMessage: '',
    successMessage: '',
    shipping_fee: 0,
    outofstock_products: [],
    buy_product_item: 0
  },
  reducers: {
    messageClear: (state) => {
      state.errorMessage = '';
      state.successMessage = '';
    },
    reset_count: (state) => {
      state.card_product_count = 0;
      state.wishlist_count = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      // Add to cart
      .addCase(add_to_card.rejected, (state, { payload }) => {
        state.errorMessage = payload.error;
      })
      .addCase(add_to_card.fulfilled, (state, { payload }) => {
        state.successMessage = payload.message;
        state.card_product_count = state.card_product_count + 1;
      })
      // Get cart products
      .addCase(get_card_products.fulfilled, (state, { payload }) => {
        state.card_products = payload.card_products;
        state.price = payload.price;
        state.card_product_count = payload.card_product_count;
        state.shipping_fee = payload.shipping_fee;
        state.outofstock_products = payload.outofstock_products;
        state.buy_product_item = payload.buy_product_item;
      })
      // Delete cart item
      .addCase(delete_card_product.fulfilled, (state, { payload }) => {
        state.successMessage = payload.message;
      })
      // Quantity increment
      .addCase(quantity_inc.fulfilled, (state, { payload }) => {
        state.successMessage = payload.message;
      })
      // Quantity decrement
      .addCase(quantity_dec.fulfilled, (state, { payload }) => {
        state.successMessage = payload.message;
      })
      // Add to wishlist
      .addCase(add_to_wishlist.rejected, (state, { payload }) => {
        state.errorMessage = payload.error;
      })
      .addCase(add_to_wishlist.fulfilled, (state, { payload }) => {
        state.successMessage = payload.message;
        state.wishlist_count = state.wishlist_count > 0 ? state.wishlist_count + 1 : 1;
      })
      // Get wishlist products
      .addCase(get_wishlist_products.fulfilled, (state, { payload }) => {
        state.wishlist = payload.wishlists;
        state.wishlist_count = payload.wishlistCount;
      })
      // Remove from wishlist
      .addCase(remove_wishlist.fulfilled, (state, { payload }) => {
        state.successMessage = payload.message;
        state.wishlist = state.wishlist.filter(p => p._id !== payload.wishlistId);
        state.wishlist_count = state.wishlist_count - 1;
      });
  }
});

export const { messageClear, reset_count } = cardSlice.actions;
export default cardSlice.reducer;
