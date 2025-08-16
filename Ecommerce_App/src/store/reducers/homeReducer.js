import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

// Get categories
export const get_categorys = createAsyncThunk(
  'home/get_categorys',
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get('/home/get-categorys');
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get products
export const get_products = createAsyncThunk(
  'home/get_products',
  async (_, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get('/home/get-products');
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Price range products
export const price_range_product = createAsyncThunk(
  'home/price_range_product',
  async (info, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/home/price-range-product?lowPrice=${info.low}&&highPrice=${info.high}`);
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Query products
export const query_products = createAsyncThunk(
  'home/query_products',
  async (query, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/home/query-products?category=${query.category}&&rating=${query.rating}&&lowPrice=${query.low}&&highPrice=${query.high}&&sortPrice=${query.sortPrice}&&pageNumber=${query.pageNumber}&&searchValue=${query.searchValue || ''}`);
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Product details
export const product_details = createAsyncThunk(
  'home/product_details',
  async (slug, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await api.get(`/home/product-details/${slug}`);
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const homeSlice = createSlice({
  name: 'home',
  initialState: {
    categorys: [],
    products: [],
    totalProduct: 0,
    parPage: 12,
    latest_product: [],
    topRated_product: [],
    discount_product: [],
    priceRange: {
      low: 0,
      high: 1000
    },
    product: {},
    relatedProducts: [],
    moreProducts: [],
    successMessage: '',
    errorMessage: '',
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
      // Get categories
      .addCase(get_categorys.fulfilled, (state, { payload }) => {
        state.categorys = payload.categorys;
      })
      // Get products
      .addCase(get_products.fulfilled, (state, { payload }) => {
        state.products = payload.products;
        state.latest_product = payload.latest_product;
        state.topRated_product = payload.topRated_product;
        state.discount_product = payload.discount_product;
      })
      // Price range products
      .addCase(price_range_product.fulfilled, (state, { payload }) => {
        state.priceRange = payload.priceRange;
      })
      // Query products
      .addCase(query_products.fulfilled, (state, { payload }) => {
        state.products = payload.products;
        state.totalProduct = payload.totalProduct;
        state.parPage = payload.parPage;
      })
      // Product details
      .addCase(product_details.pending, (state) => {
        state.loader = true;
      })
      .addCase(product_details.fulfilled, (state, { payload }) => {
        state.product = payload.product;
        state.relatedProducts = payload.relatedProducts;
        state.moreProducts = payload.moreProducts;
        state.loader = false;
      })
      .addCase(product_details.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.error;
      });
  }
});

export const { messageClear } = homeSlice.actions;
export default homeSlice.reducer;
