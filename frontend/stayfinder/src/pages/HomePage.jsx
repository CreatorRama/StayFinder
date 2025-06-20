import { useEffect } from 'react';
import { FiLogOut } from "react-icons/fi";
import { useListings } from '../hooks/uselistings';
import ListingCard from '../components/listings/ListingCard';
import SearchFilters from '../components/listings/SearchFilters';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { Link, useNavigate } from 'react-router-dom'; // Fixed import (removed 'Links')
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
  const { token, user, signOut } = useAuth(); // Added user from useAuth
  useEffect(() => {
    const fetchData = async () => {
      getListings();
      if (token) {
        const res = await dispatch(getCurrentUser()).unwrap();
        console.log(res);
      }
    };

    fetchData();
  }, [token, dispatch]);

  function handlelogout() {
    navigate('/', { replace: true });
    setTimeout(() => {
      signOut();
    }, 900);
  }

  const handleFilterChange = (filters) => {
    getListings(filters);
  };

  if (isLoading && listings.length === 0) {
    return <LoadingSpinner fullPage />;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className='w-full flex justify-end gap-2'> {/* Added gap-2 for spacing */}
        {/* Only show Host Dashboard link if user is a host */}
        {user?.role === 'host' && (
          <Link
            to="/host/dashboard"
            className="px-3 py-1 mb-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Host Dashboard
          </Link>
        )}

        <Link
          to="/my-bookings"
          className="px-3 py-1 mb-2 text-sm bg-red-400 text-white rounded hover:bg-red-500"
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

      <SearchFilters onFilterChange={handleFilterChange} getlistings={getListings} />

      {listings.length === 0 ? (
        <EmptyState
          title="No listings found"
          description="Try adjusting your search filters or check back later."
          actionText="Clear filters"
          actionLink="/"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>

          {pagination?.hasNextPage && (
            <div className="mt-8 text-center">
              <button
                onClick={() => getListings({ page: pagination.currentPage + 1 })}
                disabled={isLoading}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}