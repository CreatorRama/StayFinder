// features/listings/listingSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import api from '../../utils/api';

const initialState = {
  listings: [],
  currentListing: null,
  hostListings: [],
  status: 'idle',
  error: null,
  pagination: {},
  filters: {}
};

export const fetchListings = createAsyncThunk(
  'listings/fetchListings',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      console.log(params);
      
      const response = await api.get(`/listings?${params.toString()}`);
      console.log(response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchListingById = createAsyncThunk(
  'listings/fetchListingById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/listings/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);



const listingsSlice = createSlice({
  name: 'listings',
  initialState,
  reducers: {
    clearCurrentListing(state) {
      state.currentListing = null;
    },
    setFilters(state, action) {
      state.filters = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchListings.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchListings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.listings = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchListings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to fetch listings';
      })
      .addCase(fetchListingById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchListingById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentListing = action.payload;
      })
      .addCase(fetchListingById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to fetch listing';
      })
  }
});

export const { clearCurrentListing, setFilters } = listingsSlice.actions;
export default listingsSlice.reducer;