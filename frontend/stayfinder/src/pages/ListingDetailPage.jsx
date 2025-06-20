import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useListings } from '../hooks/uselistings';
import { useAuth } from '../hooks/useAuth';
import ListingGallery from '../components/listings/ListingGallery';
import BookingForm from '../components/bookings/BookingForm';
import HostInfo from '../components/listings/HostInfo';
import AmenitiesList from '../components/listings/AmenitiesList';
import ReviewsSection from '../components/reviews/ReviewsSection';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
export default function ListingDetailPage() {
  const { id } = useParams();
  const { currentListing, getListingById, isLoading, error } = useListings();
  const { isAuthenticated ,user,errr:err} = useAuth();

  console.log(user,isAuthenticated);

  useEffect(() => {
    getListingById(id);
  }, [id]);

  if (isLoading) {
    return <LoadingSpinner fullPage />;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  }

  if (!currentListing) {
    return <div className="container mx-auto p-4">Listing not found</div>;
  }

  console.log(currentListing);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ListingGallery images={currentListing.images} />
          
          <div className="mt-8">
            <h1 className="text-3xl font-bold">{currentListing.title}</h1>
            <div className="flex items-center mt-2 text-gray-600">
              <span>{currentListing.location.city}, {currentListing.location.country}</span>
            </div>
          </div>

          <div>
            <Link to={'/map' } state={{coordinates:currentListing.location.coordinates.coordinates}}>
            <Button variant="secondary" className='text-pink-500'>
              SEE ON MAP
            </Button>
            </Link>
          </div>

          <div className="mt-6 border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">About this place</h2>
            <p className="text-gray-700">{currentListing.description}</p>
          </div>

          <div className="mt-6 border-t pt-6">
            <AmenitiesList amenities={currentListing.amenities} />
          </div>

          <div className="mt-6 border-t pt-6">
            <HostInfo host={currentListing.host} />
          </div>

          <div className="mt-6 border-t pt-6">
            <ReviewsSection listingId={currentListing._id} />
          </div>
        </div>

        <div className="lg:col-span-1">
         
          <BookingForm 
            listing={currentListing} 
            isAuthenticated={isAuthenticated}
            error={err}
          />
        </div>
      </div>
    </div>
  );
}