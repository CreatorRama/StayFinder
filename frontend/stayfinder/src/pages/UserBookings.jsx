import { useEffect } from 'react';
import { useBookings } from '../hooks/useBookings';
import BookingCard from '../components/bookings/BookingCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Tabs from '../components/ui/Tabs';
import EmptyState from '../components/ui/EmptyState';

export default function UserBookings() {
  const { 
    bookings, 
    getUserBookings, 
    isLoading, 
    error,
    cancelUserBooking 
  } = useBookings();

  useEffect(() => {
    getUserBookings('guest'); // Default to showing guest bookings
  }, []);

  const handleTabChange = (type) => {
    getUserBookings(type);
  };

  const handleCancelBooking = async (bookingId, reason) => {
    await cancelUserBooking(bookingId, reason);
    // Refresh bookings after cancellation
    getUserBookings('guest');
  };

  if (isLoading && !bookings.length) {
    return <LoadingSpinner fullPage />;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Bookings</h1>
      
      <Tabs
        tabs={[
          { id: 'guest', label: 'As Guest' },
          { id: 'host', label: 'As Host' }
        ]}
        onTabChange={handleTabChange}
      />

      <div className="mt-6 space-y-4">
        {bookings.length === 0 ? (
          <EmptyState
            title="No bookings found"
            description="You haven't made any bookings yet. Start exploring properties to book your next stay!"
            actionText="Browse Listings"
            actionLink="/"
          />
        ) : (
          bookings.map((booking) => (
            <BookingCard 
              key={booking._id} 
              booking={booking} 
              onCancel={handleCancelBooking}
            />
          ))
        )}
      </div>
    </div>
  );
}