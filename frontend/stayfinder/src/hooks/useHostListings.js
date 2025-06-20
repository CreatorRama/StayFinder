import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchHostListings, 
  createListing, 
  updateListing, 
  deleteListing,
  setCurrentListing,
  clearListingsError
} from '../features/HostListings/HostSlice';
import { selectListings, selectListingsStatus, selectListingsError } from '../features/HostListings/HostSlice';

export const useHostListings = () => {
  const dispatch = useDispatch();
  
  const listings = useSelector(selectListings);
  const status = useSelector(selectListingsStatus);
  const error = useSelector(selectListingsError);
  
  const getHostListings = () => {
    dispatch(fetchHostListings());
  };
  
  const addListing = (formData) => {
    return dispatch(createListing(formData));
  };
  
  const editListing = (id, formData) => {
    return dispatch(updateListing({ id, formData }));
  };
  
  const removeListing = (id) => {
    return dispatch(deleteListing(id));
  };
  
  const selectListing = (listing) => {
    dispatch(setCurrentListing(listing));
  };
  
  const clearError = () => {
    dispatch(clearListingsError());
  };
  
  return {
    listings,
    loading: status === 'loading',
    error,
    getHostListings,
    addListing,
    editListing,
    removeListing,
    selectListing,
    clearError,
  };
};