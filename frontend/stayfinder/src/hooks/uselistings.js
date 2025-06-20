// hooks/useListings.js
import { useSelector, useDispatch } from 'react-redux';
import { fetchListings, fetchListingById } from '../features/listings/listingslice';

export function useListings() {
  const dispatch = useDispatch();
  const {
    listings=[],
    currentListing,
    hostListings,
    status,
    error,
    pagination,
    filters
  } = useSelector((state) => state.listings);

  const getListings = (filters = {}) => {
    dispatch(fetchListings(filters));
  };

  const getListingById = (id) => {
    dispatch(fetchListingById(id));
  };

  const addListing = (listingData) => {
    return dispatch(createListing(listingData));
  };

  return {
    listings,
    currentListing,
    hostListings,
    isLoading: status === 'loading',
    error,
    pagination,
    filters,
    getListings,
    getListingById,
    addListing
  };
}