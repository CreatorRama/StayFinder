import { useEffect, useState } from 'react';
import ReviewCard from './ReviewCard';
import { useReviews } from '../../hooks/useReviews';
import LoadingSpinner from '../ui/LoadingSpinner';
import EmptyState from '../ui/EmptyState';

export default function ReviewsSection({ listingId }) {
  const { 
    reviews, 
    currentReview,
    fetchListingReviews, 
    isLoading, 
    error 
  } = useReviews();
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    const loadReviews = async () => {
      setLocalLoading(true);
      try {
        await fetchListingReviews(listingId);
      } finally {
        setLocalLoading(false);
      }
    };
    loadReviews();
  }, [listingId]);


  if (isLoading || localLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-6">
        Reviews {reviews.length > 0 && `(${reviews.length})`}
      </h2>
      
      {reviews.length === 0 ? (
        <EmptyState
          title="No reviews yet"
          description="Be the first to leave a review!"
        />
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <ReviewCard key={review._id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}