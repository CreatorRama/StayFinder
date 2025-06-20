// utils/date.js
import { format, parseISO, differenceInDays, addDays } from 'date-fns';

export const formatDate = (dateString, formatStr = 'MMM dd, yyyy') => {
  return format(parseISO(dateString), formatStr);
};

export const calculateNights = (checkIn, checkOut) => {
  return differenceInDays(new Date(checkOut), new Date(checkIn));
};

export const getDisabledDates = (bookings) => {
  const disabledDates = [];
  bookings.forEach(booking => {
    let currentDate = new Date(booking.checkIn);
    const endDate = new Date(booking.checkOut);
    
    while (currentDate <= endDate) {
      disabledDates.push(new Date(currentDate));
      currentDate = addDays(currentDate, 1);
    }
  });
  return disabledDates;
};