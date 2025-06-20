import { useEffect, useState, useMemo } from 'react';
import { useBookings } from '../hooks/useBookings';
import BookingCard from '../components/bookings/BookingCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Tabs from '../components/ui/Tabs';
import { useAuth } from '../hooks/useAuth';
import { createPaymentIntent } from '../features/payments/paymentSlice';
import { useLocation, useNavigate } from 'react-router-dom';


export default function UserBookingsPage() {
  const {
    bookings,
    getUserBookings,
    isLoading,
    error,
    cancelUserBooking
  } = useBookings();

  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');




  useEffect(() => {
    if (!user || !isAuthenticated) {
      navigate('/login', {
        state: {
          from: location.pathname
        },
        replace:true
      })

    }
   if(user && isAuthenticated){
     getUserBookings();
   }
  }, [isAuthenticated, user]);

  // Categorize bookings based on dates and status
  const categorizedBookings = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for accurate date comparison

    const upcoming = [];
    const past = [];
    const cancelled = [];
    const pending = [];
    bookings.forEach(booking => {
      if (booking.status === 'cancelled') {
        // Cancelled bookings go to cancelled tab regardless of dates
        cancelled.push(booking);
      }

      else if (booking.status === 'pending') {
        pending.push(booking)
      }


      else {
        const checkInDate = new Date(booking.checkIn);
        const checkOutDate = new Date(booking.checkOut);

        // Reset time for accurate date comparison
        checkInDate.setHours(0, 0, 0, 0);
        checkOutDate.setHours(0, 0, 0, 0);

        if (checkInDate >= today) {
          // Booking is upcoming if check-in date is today or after today
          upcoming.push(booking);
        } else if (checkOutDate < today) {
          // Booking is past if check-out date is before today
          past.push(booking);
        } else {
          // Booking is currently active (checked in but not checked out yet)
          upcoming.push(booking);
        }
      }
    });

    return { upcoming, past, cancelled, pending };
  }, [bookings]);



  // Get bookings for the current active tab
  const currentBookings = categorizedBookings[activeTab] || [];

  const handleCancelBooking = async (bookingId, reason) => {
    const res = cancelUserBooking(bookingId, reason);
    const data = res.unwrap();
    console.log(data);

    alert("Booking Cancelled successfully and status updated");
    getUserBookings();
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
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
          {
            id: 'upcoming',
            label: `Upcoming (${categorizedBookings.upcoming.length})`
          },
          {
            id: 'past',
            label: `Past (${categorizedBookings.past.length})`
          },
          {
            id: 'cancelled',
            label: `Cancelled (${categorizedBookings.cancelled.length})`
          },
          {
            id: 'pending',
            label: `pending (${categorizedBookings.pending.length})`
          },
        ]}
        onTabChange={handleTabChange}
        activeTab={activeTab}
      />

      <div className="space-y-4 mt-6">
        {currentBookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No {activeTab} bookings found
            </p>
          </div>
        ) : (
          currentBookings.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              onCancel={handleCancelBooking}
              onPay={createPaymentIntent}
            />
          ))
        )}
      </div>
    </div>
  );
}