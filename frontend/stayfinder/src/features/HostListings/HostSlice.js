import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { act } from 'react';

// Async thunks
export const fetchHostListings = createAsyncThunk(
  'listings/fetchHostListings',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await api.get('/listings/host/my-listings', {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch listings');
    }
  }
);

export const createListing = createAsyncThunk(
  'listings/createListing',
  async (formData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await api.post('/listings', formData, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create listing');
    }
  }
);

export const updateListing = createAsyncThunk(
  'listings/updateListing',
  async ({ id, formData }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await api.put(`/listings/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update listing');
    }
  }
);

export const deleteListing = createAsyncThunk(
  'listings/deleteListing',
  async (id, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      await api.delete(`/listings/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete listing');
    }
  }
);

const initialState = {
  listings: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  currentListing: null,
  stats: null,
};

const listingsSlice = createSlice({
  name: 'Host',
  initialState,
  reducers: {
    setCurrentListing: (state, action) => {
      state.currentListing = action.payload;
    },
    clearListingsError: (state) => {
      state.error = null;
    },
    resetListingsState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch Host Listings
      .addCase(fetchHostListings.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchHostListings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        console.log(action.payload);
        state.listings = action.payload;
        state.error = null;
      })
      .addCase(fetchHostListings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Create Listing
      .addCase(createListing.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createListing.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.listings.push(action.payload);
        state.error = null;
      })
      .addCase(createListing.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Update Listing
      .addCase(updateListing.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateListing.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.listings.findIndex(
          listing => listing._id === action.payload._id
        );
        if (index !== -1) {
          state.listings[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateListing.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Delete Listing
      .addCase(deleteListing.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteListing.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.listings = state.listings.filter(
          listing => listing._id !== action.payload
        );
        state.error = null;
      })
      .addCase(deleteListing.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { setCurrentListing, clearListingsError, resetListingsState } = listingsSlice.actions;

// Selectors
// Selectors
export const selectListings = (state) => state.Host.listings;
export const selectListingsStatus = (state) => state.Host.status;
export const selectListingsError = (state) => state.Host.error;
export const selectCurrentListing = (state) => state.Host.currentListing;

export default listingsSlice.reducer;