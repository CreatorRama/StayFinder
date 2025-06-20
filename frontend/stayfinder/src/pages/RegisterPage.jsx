import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FormInput } from '../components/ui/FormInput';
import  Button  from '../components/ui/Button';
import SolarSystemBackground from '../components/ui/SolarSystemBackground';
import { clearAuthError } from '../features/auth/authSlice';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
export default function RegisterPage() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: ''
    });
    const dispatch = useDispatch()
    const { signUp, isLoading, error } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await signUp(formData);
        if (result?.payload?.token) {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Solar System Background */}
            <div className="fixed inset-0 flex items-center justify-center">
                <SolarSystemBackground />
            </div>

            {/* Registration Form */}
            <div className="max-w-md w-full space-y-8 z-10 relative"> {/* Added relative */}
                <div className="bg-gray-900 bg-opacity-80 backdrop-blur-sm p-8 rounded-lg shadow-xl">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                            Create your account
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
                            <div className="grid grid-cols-2 gap-4">
                                <FormInput
                                    label="First name"
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    required
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="bg-gray-800 bg-opacity-70 text-white placeholder-gray-400 border border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                                />
                                <FormInput
                                    label="Last name"
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    required
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="bg-gray-800 bg-opacity-70 text-white placeholder-gray-400 border border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <FormInput
                                label="Email address"
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="bg-gray-800 bg-opacity-70 text-white placeholder-gray-400 border border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Enter your email"
                            />
                            <FormInput
                                label="Password"
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="bg-gray-800 bg-opacity-70 text-white placeholder-gray-400 border border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Enter your password"
                            />
                            <FormInput
                                label="Phone number"
                                id="phone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                className="bg-gray-800 bg-opacity-70 text-white placeholder-gray-400 border border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Enter your phone number"
                            />
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating...
                                    </span>
                                ) : 'Create account'}
                            </Button>
                        </div>
                    </form>

                    <div className="text-center text-sm mt-4">
                        <span className="text-gray-300">Already have an account? </span>
                        <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300">
                            Sign in
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