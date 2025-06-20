// hooks/useAuth.js
import { useSelector, useDispatch } from 'react-redux';
import { login, register, logout,getCurrentUser } from '../features/auth/authSlice';
import { selectCurrentUser, selectIsAuthenticated,selectAuthError,selectAuthStatus,selectAuthToken } from '../features/auth/authSlice';
export function useAuth() {
  const dispatch = useDispatch();
  
 const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
 const error = useSelector(selectAuthError);
  const status = useSelector(selectAuthStatus);
 const token = useSelector(selectAuthToken);
 
  const signIn = async (credentials) => {
    return dispatch(login(credentials));
  };

  const signUp = async (userData) => {
    return dispatch(register(userData));
  };

  const signOut = () => {
    dispatch(logout());
  };

  return {
    user,
    token:localStorage.getItem('token') ||null,
    isLoading: status === 'loading',
    error,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!token
  };
}