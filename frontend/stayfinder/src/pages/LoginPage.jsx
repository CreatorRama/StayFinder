import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FormInput } from '../components/ui/FormInput';
import { clearAuthError } from '../features/auth/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../features/auth/authSlice';
import SolarSystemBackground from '../components/ui/SolarSystemBackground';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signIn, isLoading, error } = useAuth();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();

    useEffect(() => {
        dispatch(clearAuthError());
    }, [dispatch]);

    // Fixed error handling with proper cleanup
    useEffect(() => {
        if (error) {
            console.log('Error occurred:', error);

            const timer = setTimeout(() => {
                dispatch(clearAuthError());
            }, 2000);

            // Cleanup function to clear timer if component unmounts or error changes
            return () => {
                clearTimeout(timer);
            };
        }
    }, [error, dispatch]); // Add error and dispatch as dependencies

    useEffect(() => {
        if (isAuthenticated) {
            const from = location.state?.from || '/host/dashboard';
            console.log(from);
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, location.state]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await signIn({ email, password });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Solar System Background - now properly centered */}
            <div className="fixed inset-0 flex items-center justify-center">
                <SolarSystemBackground />
            </div>

            {/* Login Form */}
            <div className="max-w-md w-full space-y-8 z-10 relative"> {/* Added relative */}
                <div className="bg-gray-900 bg-opacity-80 backdrop-blur-sm p-8 rounded-lg shadow-xl">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                            Sign in to your account
                        </h2>
                    </div>
                    {/* Absolute positioned error message */}
                    {error && (
                        <div className="absolute top-4 left-0 right-0 text-center">
                            <div className="text-red-500 text-sm inline-block bg-gray-900 bg-opacity-90 px-2 py-1 rounded">
                                {error}
                            </div>
                        </div>
                    )}
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="rounded-md space-y-4">
                            <FormInput
                                label="Email address"
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-gray-800 bg-opacity-70 text-white placeholder-gray-400 border border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Enter your email"
                            />
                            <FormInput
                                label="Password"
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-gray-800 bg-opacity-70 text-white placeholder-gray-400 border border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Enter your password"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <Link to="/forgot-password" className="font-medium text-blue-400 hover:text-blue-300">
                                    Forgot your password?
                                </Link>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing in...
                                    </>
                                ) : 'Sign in'}
                            </button>
                        </div>
                    </form>

                    <div className="text-center text-sm mt-4">
                        <span className="text-gray-300">Don't have an account? </span>
                        <Link to="/register" className="font-medium text-blue-400 hover:text-blue-300">
                            Sign up
                        </Link>
                    </div>
                </div>
            </div>

            <style jsx="true" global="true">{`
                body {
                    margin: 0;
                    padding: 0;
                    background-color: #000;
                }
                input::placeholder {
                    color: #9CA3AF !important;
                    opacity: 0.8 !important;
                }
                input {
                    color: white !important;
                }
                label {
                    color: white !important;
                }
            `}</style>
        </div>
    );
}