import { Link } from 'react-router-dom';
import { FaEdit, FaChartLine, FaCalendarAlt, FaHome } from 'react-icons/fa';

export default function HostListingCard({ listing }) {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative pb-2/3">
        <img
          src={listing.images[0]?.url || 'https://via.placeholder.com/300'}
          alt={listing.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-sm font-medium">
          {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">{listing.title}</h3>
          <span className="font-semibold">${listing.pricing.basePrice}/night</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <FaHome className="mr-1" />
          <span>{listing.propertyType.replace('-', ' ')}</span>
        </div>
        
        <div className="flex justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <FaChartLine className="mr-1" />
            <span>{listing.metrics?.views || 0} views</span>
          </div>
          <div className="flex items-center">
            <FaCalendarAlt className="mr-1" />
            <span>{listing.metrics?.bookings || 0} bookings</span>
          </div>
        </div>
        
        <div className="flex justify-between border-t pt-3">
          <Link
            to={`/host/listings/${listing._id}/edit`}
            className="flex items-center text-sm text-primary hover:text-primary-dark"
          >
            <FaEdit className="mr-1" />
            Edit
          </Link>
          <Link
            to={`/listings/${listing._id}`}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            View Listing
          </Link>
        </div>
      </div>
    </div>
  );
}