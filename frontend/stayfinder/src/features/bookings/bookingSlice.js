// features/bookings/bookingSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { act } from 'react';


const initialState = {
  bookings: [],
  currentBooking: null,
  status: 'idle',
  error: null,
  pagination: {}
};

export const createBooking = createAsyncThunk(
  'bookings/createBooking',
  async (bookingData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      };
      const response = await api.post('/bookings', bookingData, config);
      console.log(response.data.data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchUserBookings = createAsyncThunk(
  'bookings/fetchUserBookings',
  async (type = 'guest', { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      };
      const response = await api.get(`/bookings/my-bookings`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const fetchUserBookingsbyId = createAsyncThunk(
  'bookings/fetchUserBookingsbyId',
  async (id, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      };
      const response = await api.get(`/bookings/${id}`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'bookings/cancelBooking',
  async ({ bookingId, reason }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      };
      const response = await api.patch(
        `/bookings/${bookingId}/cancel`,
        { reason },
        config
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearCurrentBooking(state) {
      state.currentBooking = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentBooking = action.payload;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to create booking';
      })
      .addCase(fetchUserBookings.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserBookings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.bookings = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUserBookings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to fetch bookings';
      })
      .addCase(fetchUserBookingsbyId.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserBookingsbyId.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentBooking = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUserBookingsbyId.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to fetch bookings for this ID';
      })
      .addCase(cancelBooking.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.bookings.findIndex(b => b._id === action.payload._id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to cancel booking';
      });
  }
});

export const { clearCurrentBooking } = bookingsSlice.actions;
export default bookingsSlice.reducer;