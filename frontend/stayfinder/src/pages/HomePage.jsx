import { useEffect, useState } from 'react';
import { FiLogOut } from "react-icons/fi";
import { useListings } from '../hooks/uselistings';
import ListingCard from '../components/listings/ListingCard';
import SearchFilters from '../components/listings/SearchFilters';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../features/auth/authSlice';
import { useDispatch } from 'react-redux';
import { useAuth } from '../hooks/useAuth';

export default function HomePage() {
  const navigate = useNavigate();
  const {
    listings = [],
    getListings,
    isLoading,
    error,
    pagination
  } = useListings();
  const dispatch = useDispatch();
  const { token, user, signOut } = useAuth();
  
  // Track if initial load is complete to prevent unnecessary re-renders
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load listings first
        await getListings();
        
        // If user is authenticated, get user data
        if (token) {
          const res = await dispatch(getCurrentUser()).unwrap();
          console.log('User data:', res);
        }
        
        setInitialLoadComplete(true);
      } catch (error) {
        console.error('Error fetching data:', error);
        setInitialLoadComplete(true);
      }
    };

    if (!initialLoadComplete) {
      fetchData();
    }
  }, [token, dispatch, getListings, initialLoadComplete]);

  function handlelogout() {
    navigate('/', { replace: true });
    setTimeout(() => {
      signOut();
    }, 900);
  }

  const handleFilterChange = (filters) => {
    console.log('Applying filters from HomePage:', filters);
    
    // Create a clean filters object, removing empty strings
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([key, value]) => value !== '' && value !== null && value !== undefined)
    );
    
    getListings(cleanFilters);
  };

  const handleLoadMore = () => {
    if (pagination?.hasNextPage && !isLoading) {
      getListings({ page: pagination.currentPage + 1 });
    }
  };

  // Show loading spinner only for initial load
  if (isLoading && listings.length === 0 && !initialLoadComplete) {
    return <LoadingSpinner fullPage />;
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-red-500 text-center">
          <p>Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className='w-full flex justify-end gap-2'>
        {/* Only show Host Dashboard link if user is a host */}
        {user?.role === 'host' && (
          <Link
            to="/host/dashboard"
            className="px-3 py-1 mb-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Host Dashboard
          </Link>
        )}

        <Link
          to="/my-bookings"
          className="px-3 py-1 mb-2 text-sm bg-red-400 text-white rounded hover:bg-red-500 transition-colors"
        >
          My Bookings
        </Link>

        <button
          onClick={handlelogout}
          className="
            flex items-center justify-center gap-2
            px-5 py-2.5
            rounded-lg
            bg-gradient-to-r from-pink-500 to-orange-400
            text-white font-medium
            shadow-md
            transition-all duration-300
            hover:from-pink-600 hover:to-orange-500
            hover:shadow-lg
            hover:-translate-y-0.5
            active:translate-y-0
            focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-opacity-50
          "
          aria-label="Logout"
        >
          <span className="logout-button__text">Logout</span>
          <FiLogOut className="logout-button__icon" />
        </button>
      </div>

      <SearchFilters 
        onFilterChange={handleFilterChange} 
        getlistings={getListings} 
      />

      {listings.length === 0 && !isLoading ? (
        <EmptyState
          title="No listings found"
          description="Try adjusting your search filters or check back later."
          actionText="you can clear filters"
          actionLink="/"
        />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>

          {pagination?.hasNextPage && (
            <div className="mt-8 text-center">
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
          
          {/* Show loading indicator for additional pages */}
          {isLoading && listings.length > 0 && (
            <div className="mt-4 text-center">
              <LoadingSpinner />
            </div>
          )}
        </>
      )}
    </div>
  );
}
