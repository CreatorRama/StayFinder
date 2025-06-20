// features/payments/paymentSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import api from '../../utils/api';

const initialState = {
  paymentIntent: null,
  status: 'idle',
  error: null
};

export const createPaymentIntent = createAsyncThunk(
  'payments/createPaymentIntent',
  async (bookingId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      };
      const response = await api.post(
        '/payments/create-payment-intent',
        { bookingId },
        config
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const confirmPayment = createAsyncThunk(
  'payments/confirmPayment',
  async ({ paymentIntentId, bookingId }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      };
      const response = await api.post(
        '/payments/confirm-payment',
        { paymentIntentId, bookingId },
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearPaymentIntent(state) {
      state.paymentIntent = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPaymentIntent.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.paymentIntent = action.payload;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to create payment intent';
      })
      .addCase(confirmPayment.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(confirmPayment.fulfilled, (state) => {
        state.status = 'succeeded';
        state.paymentIntent = null;
      })
      .addCase(confirmPayment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to confirm payment';
      });
  }
});

export const { clearPaymentIntent } = paymentsSlice.actions;
export default paymentsSlice.reducer;