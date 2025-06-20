import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { selectAuthStatus, selectIsAuthenticated } from '../features/auth/authSlice';
import { getCurrentUser } from '../features/auth/authSlice';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const ProtectedRoute = ({ children, redirectPath = '/login' }) => {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const status = useSelector(selectAuthStatus);
    const location = useLocation();
    const dispatch = useDispatch();

     if (!localStorage.getItem('token') &&!isAuthenticated && status === 'idle') {
        return <Navigate to={redirectPath} state={{ from: location.pathname }} replace />;
    }

    useEffect(() => {
          if(localStorage.getItem('token')){
              dispatch(getCurrentUser());
          }
    }, [ isAuthenticated]);

    if (status === 'loading') {
        return <LoadingSpinner fullPage />
    }


    return children ? children : <Outlet />;
};

export default ProtectedRoute;