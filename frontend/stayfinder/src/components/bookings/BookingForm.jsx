import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAuth } from '../../hooks/useAuth';
import { useBookings } from '../../hooks/useBookings';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function BookingForm({ listing, isAuthenticated, error }) {
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    setError,
    clearErrors,
    watch,
    getValues
  } = useForm();
  
  const { makeBooking } = useBookings();
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [serverError, setServerError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Watch guest fields to calculate total
  const adults = watch('adults', 1);
  const children = watch('children', 0);
  const infants = watch('infants', 0);
  const totalGuests = parseInt(adults || 0) + parseInt(children || 0) + parseInt(infants || 0);

  useEffect(() => {
    if (error) {
      setServerError(error);
    }
  }, [error]);

  const handleDateChange = (update) => {
    setDateRange(update);
    if (update[0] && update[1]) {
      clearErrors('dateRange');
    }
  };

  const handleLoginToBook = (e) => {
    e.preventDefault();
    navigate('/login', {
      state: {
        from: `${location.pathname}`
      }
    });
  };

  const validateTotalGuests = (value) => {
    const total = parseInt(value) + 
                 parseInt(getValues('children') || 0) + 
                 parseInt(getValues('infants') || 0);
    return total <= listing.capacity.guests || 
      `Property can accommodate maximum ${listing.capacity.guests} guests`;
  };

  const onSubmit = async(data) => {
    setServerError(null);
    
    // Validate dates
    if (!startDate || !endDate) {
      setError('dateRange', {
        type: 'manual',
        message: 'Please select both check-in and check-out dates'
      });
      return;
    }

    // Validate guests client-side first
    if (totalGuests > listing.capacity.guests) {
      setError('adults', {
        type: 'manual',
        message: `Maximum ${listing.capacity.guests} guests allowed`
      });
      return;
    }

    const bookingData = {
      listing: listing._id,
      checkIn: format(startDate, 'yyyy-MM-dd'),
      checkOut: format(endDate, 'yyyy-MM-dd'),  
      guests: {
        adults: parseInt(data.adults),
        children: parseInt(data.children || 0),
        infants: parseInt(data.infants || 0),
      },
    };

    try {
      const response = await makeBooking(bookingData).unwrap();
      navigate('/my-bookings');
    } catch (error) {
      setServerError(error.message || 'Booking failed. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
      <div className="text-2xl font-semibold mb-4">
        ${listing.pricing.basePrice} <span className="text-base font-normal">night</span>
      </div>
      
      <form onSubmit={isAuthenticated ? handleSubmit(onSubmit) : handleLoginToBook}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Dates</label>
          <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={handleDateChange}
            minDate={new Date()}
            inline
          />
          {errors.dateRange && (
            <p className="text-red-500 text-sm mt-2">{errors.dateRange.message}</p>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Guests</label>
          <div className="text-sm mb-2 text-gray-600">
            Total guests: {totalGuests} / {listing.capacity.guests}
            {totalGuests > listing.capacity.guests && (
              <span className="text-red-500 ml-2">(Exceeds maximum)</span>
            )}
          </div>
          <div className="space-y-2">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Adults</label>
              <input
                type="number"
                min="1"
                defaultValue="1"
                {...register('adults', { 
                  required: 'At least 1 adult required',
                  min: {
                    value: 1,
                    message: 'Minimum 1 adult'
                  },
                  validate: {
                    totalGuests: validateTotalGuests
                  }
                })}
                className="w-full p-2 border rounded"
              />
              {errors.adults && <p className="text-red-500 text-sm">{errors.adults.message}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Children</label>
              <input
                type="number"
                min="0"
                defaultValue="0"
                {...register('children', {
                  validate: {
                    totalGuests: () => validateTotalGuests(getValues('adults'))
                  }
                })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Infants</label>
              <input
                type="number"
                min="0"
                defaultValue="0"
                {...register('infants', {
                  validate: {
                    totalGuests: () => validateTotalGuests(getValues('adults'))
                  }
                })}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>
        
        <button
          type="submit"
          className={`w-full py-2 px-4 rounded-md transition ${
            totalGuests > listing.capacity.guests 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-slate-700 text-rose-600 hover:bg-primary-dark'
          }`}
          disabled={totalGuests > listing.capacity.guests}
        >
          {user ? 'Book Now' : 'Login to Book'}
        </button>

        {serverError && (
          <p className="text-red-500 text-sm mt-2 text-center">{serverError}</p>
        )}
      </form>
    </div>
  );
}