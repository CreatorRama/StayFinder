import { useParams } from "react-router-dom";
import { useBookings } from "../hooks/useBookings";
import { useEffect } from "react";

export default function Bookingidpage() {
  const { id } = useParams();
  const { getUserBookingsbyId, currentBooking, isLoading, error } = useBookings();



  useEffect(() => {
    if (id) {
      getUserBookingsbyId(id)
        .unwrap()
        .then(data => console.log("API Response:", data))
        .catch(err => console.error("Error:", err));
    }
  }, [id]);

  if (isLoading) return <div className="text-center py-8">Loading booking details...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {currentBooking  && (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold mb-6">Booking Details</h1>
          
          {/* Booking Status */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Status</h2>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              currentBooking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
              currentBooking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
              'bg-yellow-100 text-yellow-800'
            }`}>
              {currentBooking.status.toUpperCase()}
            </div>
            {currentBooking.cancellation && (
              <div className="mt-2">
                <p>Cancelled by: {currentBooking.cancellation.cancelledBy}</p>
                <p>Reason: {currentBooking.cancellation.reason}</p>
                <p>Refund amount: ${currentBooking.cancellation.refundAmount}</p>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Dates</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-500">Check-in</p>
                <p>{new Date(currentBooking.checkIn).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Check-out</p>
                <p>{new Date(currentBooking.checkOut).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Nights</p>
                <p>{currentBooking.nights}</p>
              </div>
            </div>
          </div>

          {/* Guest Information */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Guest Information</h2>
            <div className="flex items-center space-x-4">
              <img 
                src={currentBooking.guest.avatar} 
                alt={`${currentBooking.guest.firstName} ${currentBooking.guest.lastName}`} 
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p>{currentBooking.guest.firstName} {currentBooking.guest.lastName}</p>
                <p className="text-gray-500">{currentBooking.guest.email}</p>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="font-medium">Guests</h3>
              <p>Adults: {currentBooking.guests.adults}</p>
              <p>Children: {currentBooking.guests.children}</p>
              <p>Infants: {currentBooking.guests.infants}</p>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Pricing</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Base price (${currentBooking.pricing.basePrice} x {currentBooking.nights} nights)</span>
                <span>${currentBooking.pricing.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Cleaning fee</span>
                <span>${currentBooking.pricing.cleaningFee}</span>
              </div>
              <div className="flex justify-between">
                <span>Service fee</span>
                <span>${currentBooking.pricing.serviceFee}</span>
              </div>
              <div className="border-t pt-2 mt-2 font-semibold flex justify-between">
                <span>Total</span>
                <span>${currentBooking.pricing.total}</span>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Payment</h2>
            <p>Status: <span className="capitalize">{currentBooking.paymentStatus}</span></p>
            <p>Method: {currentBooking.paymentDetails.paymentMethod}</p>
            <p>Currency: {currentBooking.paymentDetails.currency}</p>
          </div>

          {/* Listing Information */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Listing Information</h2>
            <p>Location: {currentBooking.listing.location.address}</p>
            <p>Host: {currentBooking.host.firstName} {currentBooking.host.lastName}</p>
          </div>

          {/* Dates */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Booking Timeline</h2>
            <p>Created: {new Date(currentBooking.createdAt).toLocaleString()}</p>
            <p>Last updated: {new Date(currentBooking.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}