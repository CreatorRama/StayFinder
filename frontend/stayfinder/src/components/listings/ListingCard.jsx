import { Link } from 'react-router-dom';
import { FaStar, FaHeart } from 'react-icons/fa';

export default function ListingCard({ listing }) {
  return (
    <Link to={`/listings/${listing._id}`} className="block group">
      <div className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
        <div className="relative pb-3/4">
          <img
            src={listing.images[0]?.url || 'https://via.placeholder.com/300'}
            crossOrigin="anonymous"
            alt={listing.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
          />
          <button 
            className="absolute top-2 right-2 text-white hover:text-red-500 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              // Handle favorite
            }}
          >
            <FaHeart className="text-xl" />
          </button>
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg truncate">{listing.title}</h3>
            <div className="flex items-center">
              <FaStar className="text-yellow-400 mr-1" />
              <span>{listing.metrics?.rating?.toFixed(1) || 'New'}</span>
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            {listing.location.city}, {listing.location.country}
          </p>
          <p className="mt-2 font-semibold">
            ${listing.pricing.basePrice} <span className="font-normal text-gray-500">night</span>
          </p>
          <p className="mt-2 font-semibold">
            {listing.capacity.guests} <span className="font-normal text-gray-500">Capacity</span>
          </p>
        </div>
      </div>
    </Link>
  );
}