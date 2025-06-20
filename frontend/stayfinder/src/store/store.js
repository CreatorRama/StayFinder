// store/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import listingsReducer from '../features/listings/listingslice';
import bookingsReducer from '../features/bookings/bookingSlice';
import usersReducer from '../features/users/userSlice';
import reviewsReducer from '../features/reviews/reviewSlice';
import paymentsReducer from '../features/payments/paymentSlice';
import HostReducer from '../features/HostListings/HostSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        listings: listingsReducer,
        bookings: bookingsReducer,
        users: usersReducer,
        reviews: reviewsReducer,
        payments: paymentsReducer,
        Host:HostReducer
    },
     middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      immutableCheck: false, 
      serializableCheck: false, 
    }),
  devTools: process.env.NODE_ENV !== 'production'
});