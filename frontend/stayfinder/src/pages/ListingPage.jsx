// pages/ListingPage.js
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchListingById } from '../features/listings/listingslice';
import BookingForm from '../components/bookings/BookingForm';
import ImageGallery from '../components/listings/ImageGallery';

export default function ListingPage() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { currentListing, status } = useSelector((state) => state.listings);

    useEffect(() => {
        dispatch(fetchListingById(id));
    }, [dispatch, id]);

    if (status === 'loading') return <div>Loading...</div>;
    if (!currentListing) return <div>Listing not found</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4">{currentListing.title}</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <ImageGallery images={currentListing.images} />
                    <div className="mt-6">
                        <h2 className="text-xl font-semibold mb-2">Description</h2>
                        <p>{currentListing.description}</p>
                    </div>
                    <div className="mt-6">
                        <h2 className="text-xl font-semibold mb-2">Amenities</h2>
                        <div className="grid grid-cols-2 gap-2">
                            {currentListing.amenities.map((amenity) => (
                                <div key={amenity} className="flex items-center">
                                    <span>{amenity}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div>

                    <BookingForm listing={currentListing} />
                </div>
            </div>
        </div>
    );
}