// features/reviews/reviewSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const initialState = {
  reviews: [],
  currentReview: null,
  status: 'idle',
  error: null,
  pagination: {}
};

export const createReview = createAsyncThunk(
  'reviews/createReview',
  async (reviewData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      };
      const response = await api.post('/reviews', reviewData, config);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchListingReviews = createAsyncThunk(
  'reviews/fetchListingReviews',
  async (listingId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reviews/listing/${listingId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearCurrentReview(state) {
      state.currentReview = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createReview.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.reviews.unshift(action.payload);
      })
      .addCase(createReview.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to create review';
      })
      .addCase(fetchListingReviews.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchListingReviews.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.reviews = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchListingReviews.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to fetch reviews';
      });
  }
});

export const { clearCurrentReview } = reviewsSlice.actions;
export default reviewsSlice.reducer;