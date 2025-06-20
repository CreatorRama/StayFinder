// Utility functions for handling auth tokens
import axios from "axios";
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

export const removeAuthToken = () => {
  localStorage.removeItem('token');
  delete axios.defaults.headers.common['Authorization'];
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Initialize auth state if token exists
export const initializeAuth = (store) => {
  const token = getAuthToken();
  if (token) {
    setAuthToken(token);
    store.dispatch(getCurrentUser());
  }
};