import { useSelector, useDispatch } from 'react-redux';
import {
  createBooking,
  fetchUserBookings,
  fetchUserBookingsbyId,
  cancelBooking
} from '../features/bookings/bookingSlice';

export function useBookings() {
  const dispatch = useDispatch();
  const {
    bookings,
    currentBooking,
    status,
    error,
    pagination
  } = useSelector((state) => state.bookings);

  const makeBooking = (bookingData) => {
    return dispatch(createBooking(bookingData));
  };

  const getUserBookings = () => {
    return dispatch(fetchUserBookings());
  };
  const getUserBookingsbyId = (id) => {
    return dispatch(fetchUserBookingsbyId(id));
  };

  const cancelUserBooking = (bookingId, reason) => {
    return dispatch(cancelBooking({ bookingId, reason }));
  };

  return {
    bookings,
    currentBooking,
    isLoading: status === 'loading',
    error,
    pagination,
    makeBooking,
    getUserBookings,
    getUserBookingsbyId,
    cancelUserBooking
  };
}