import { Link, useNavigate  } from 'react-router-dom';
import { format } from 'date-fns';
import { FaHome, FaCalendarAlt, FaUserAlt, FaMoneyBillWave } from 'react-icons/fa';


export default function BookingCard({ booking, onCancel, onPay }) {
  const statusColors = {
    confirmed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800'
  };
  const navigate = useNavigate()


 const handlepay = () => {
  navigate('/payment', { 
    state: { 
      id: booking._id,
      amount: booking.pricing.total
    } 
  });
}


  return (
    <div className="border rounded-lg overflow-hidden shadow-sm">
      <div className="p-4 border-b">
        <div className="flex justify-between items-start">
          <div>
            <span className={`text-xs px-2 py-1 rounded-full ${statusColors[booking.status]}`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
            <h3 className="mt-2 font-semibold text-lg">
              {booking.listing.title}
            </h3>
          </div>
          <div className="text-right">
            <p className="font-semibold">${booking.pricing.total}</p>
            <p className="text-sm text-gray-500">{booking.nights} nights</p>
          </div>
        </div>
      </div>

      <div className="p-4 grid grid-cols-2 gap-4">
        <div className="flex items-center">
          <FaCalendarAlt className="text-gray-400 mr-2" />
          <div>
            <p className="text-sm text-gray-500">Dates</p>
            <p className="text-sm">
              {format(new Date(booking.checkIn), 'MMM d, yyyy')} - {format(new Date(booking.checkOut), 'MMM d, yyyy')}
            </p>
          </div>
        </div>

        <div className="flex items-center">
          <FaUserAlt className="text-gray-400 mr-2" />
          <div>
            <p className="text-sm text-gray-500">Guests</p>
            <p className="text-sm">{booking.totalGuests} guest{booking.totalGuests > 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      <div className="p-4 border-t flex justify-end gap-2">
        {booking.status === 'confirmed' ? (
          <button
            onClick={() => {
              const reason = prompt('Reason for cancellation:');
              if (reason) onCancel(booking._id, reason);
            }}
            className="px-3 py-1 text-sm border border-red-500 text-red-500 rounded hover:bg-red-50"
          >
            Cancel
          </button>
        ) : booking.status === 'pending'?
        (<button
           onClick={handlepay}
          className="px-3 py-1 text-sm border border-red-500 text-red-500 rounded hover:bg-red-50"
        >
          Pay
        </button>)
        :
        <button
          onClick={handlepay}
          className="px-3 py-1 text-sm border border-red-500 text-red-500 rounded hover:bg-red-50"
        >
          book again
        </button>
        }
        <Link
          to={`/bookings/${booking._id}`}
          className="px-3 py-1 text-sm bg-red-400 text-white rounded hover:bg-primary-dark"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}