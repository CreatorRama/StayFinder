import { useSelector, useDispatch } from 'react-redux';
import { 
  createReview, 
  fetchListingReviews,
  clearCurrentReview
} from '../features/reviews/reviewSlice';

export function useReviews() {
  const dispatch = useDispatch();
  const {
    reviews = [],
    currentReview,
    status,
    error,
    pagination
  } = useSelector((state) => state.reviews);

  const addReview = (reviewData) => {
    return dispatch(createReview(reviewData));
  };

  const getListingReviews = (listingId) => {
    return dispatch(fetchListingReviews(listingId));
  };

  const resetCurrentReview = () => {
    dispatch(clearCurrentReview());
  };

  return {
    reviews,
    currentReview,
    addReview,
    fetchListingReviews: getListingReviews,
    clearCurrentReview: resetCurrentReview,
    isLoading: status === 'loading',
    error,
    pagination
  };
}