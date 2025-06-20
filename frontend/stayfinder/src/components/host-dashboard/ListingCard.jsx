import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaEye, FaBed, FaBath, FaUserFriends } from 'react-icons/fa';

const ListingCard = ({ listing, onEdit, onDelete }) => {
  const statusColors = {
    draft: 'bg-yellow-100 text-yellow-800',
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    suspended: 'bg-red-100 text-red-800'
  };

  // Safe function to get image URL with fallback
  const getImageUrl = () => {
  if (listing?.images && listing.images.length > 0) {
    const firstImage = listing.images[0];
    if (typeof firstImage === 'string') {
      return firstImage;
    } else if (firstImage && firstImage.url) {
      return firstImage.url;
    }
  }
  // Base64 encoded 1x1 gray pixel
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlN2ViIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
};
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="relative">
        <img 
          src={getImageUrl()}
          alt={listing?.title || 'Listing'}
          className="w-full h-48 object-cover"
          onError={(e) => {
            // Fallback if image fails to load
            e.target.src = '/images/placeholder-listing.jpg';
          }}
        />
        <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${statusColors[listing?.status] || statusColors.inactive}`}>
          {listing?.status || 'draft'}
        </span>
      </div>
             
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1">{listing?.title || 'Untitled Listing'}</h3>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{listing?.description || 'No description available'}</p>
                 
        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
          <div className="flex items-center">
            <FaBed className="mr-1" />
            <span>{listing?.capacity?.bedrooms || 0}</span>
          </div>
          <div className="flex items-center">
            <FaBath className="mr-1" />
            <span>{listing?.capacity?.bathrooms || 0}</span>
          </div>
          <div className="flex items-center">
            <FaUserFriends className="mr-1" />
            <span>{listing?.capacity?.guests || 0}</span>
          </div>
        </div>
                 
        <div className="flex justify-between items-center">
          <div>
            <span className="font-bold">${listing?.pricing?.basePrice || 0}</span>
            <span className="text-gray-500 text-sm"> / night</span>
          </div>
                     
          <div className="flex space-x-2">
            <Link 
              to={`/listings/${listing?._id}`}
              className="p-2 text-gray-500 hover:text-primary-500"
              title="View"
            >
              <FaEye />
            </Link>
            <button 
              onClick={() => onEdit(listing)}
              className="p-2 text-gray-500 hover:text-primary-500"
              title="Edit"
            >
              <FaEdit />
            </button>
            <button 
              onClick={() => onDelete(listing?._id)}
              className="p-2 text-gray-500 hover:text-red-500"
              title="Delete"
            >
              <FaTrash />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;