import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { setAuthToken, removeAuthToken } from '../../utils/auth';
import api from '../../utils/api';
import { act } from 'react';

// Async thunk for user registration
export const register = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/register', userData);
            const { token, user } = response.data;
           
           

            // Store the token in localStorage
            setAuthToken(token);

            return { user, token };
        } catch (error) {
            // Return error message from API or default error
            return rejectWithValue(
               error.response?.data?.errors?.[0].msg || 'registration failed'
            );
        }
    }
);

// Async thunk for user login
export const login = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/login', credentials);
            const { token, user } = response.data;

            console.log(response);

            // Store the token in localStorage
            // setAuthToken(token);

            return { user, token };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Login failed'
            );
        }
    }
);

// Async thunk for getting current user
export const getCurrentUser = createAsyncThunk(
    'auth/getCurrentUser',
    async (_, { rejectWithValue, getState }) => {
        try {
            const { auth } = getState();
            const config = {
                headers: {
                    Authorization: `Bearer ${auth?.token?auth?.token:localStorage.getItem('token')}`,
                },
            };

            const response = await api.get('/auth/me', config);
            return response.data.user;
        } catch (error) {
            // Remove invalid token from storage
            removeAuthToken();
            return rejectWithValue(
                error.response?.data?.errors?.[0].msg  || 'Failed to get user'
            );
        }
    }
);

const initialState = {
    user: null,
    token: localStorage.getItem("token") || null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Reducer for logout
        logout(state) {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            removeAuthToken();
        },
        // Reducer to clear errors
        clearAuthError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Register cases
            .addCase(register.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(register.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(register.rejected, (state, action) => {
                state.status = 'failed';
                console.log(action.payload);
                state.error = action.payload
            })

            // Login cases
            .addCase(login.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(login.fulfilled, (state, action) => {
                console.log("ram");
                if (action.payload?.token) {
                    console.log("seeta ram");
                    console.log(action.payload.user);
                    state.status = 'succeeded';
                    state.user = action.payload.user;  
                    state.token = action.payload.token;
                    state.isAuthenticated = true;
                    state.error = null;
                    setAuthToken(action.payload.token);
                } else {
                    state.status = 'failed';
                    state.error = 'Invalid response from server';
                }
            })
            .addCase(login.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Get current user cases
            .addCase(getCurrentUser.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(getCurrentUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.user = action.payload;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(getCurrentUser.rejected, (state, action) => {
                state.status = 'failed';
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.error = action.payload;
            });
    },
});

export const { logout, clearAuthError } = authSlice.actions;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectAuthToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;