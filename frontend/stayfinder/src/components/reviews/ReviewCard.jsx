import { FaStar } from 'react-icons/fa';
import { format } from 'date-fns';

export default function ReviewCard({ review }) {
  // Calculate average rating
  const ratings = review.ratings;
  const ratingValues = Object.values(ratings).filter(val => typeof val === 'number');
  const averageRating = ratingValues.reduce((sum, val) => sum + val, 0) / ratingValues.length;

  return (
    <div className="border-b pb-6 mb-6 last:border-b-0">
      <div className="flex items-start gap-4 mb-4">
        <img 
          src={review.reviewer.avatar || 'https://via.placeholder.com/50'} 
          alt={review.reviewer.firstName}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium">
                {review.reviewer.firstName} {review.reviewer.lastName}
              </h4>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <FaStar className="text-yellow-400 mr-1" />
                <span>{averageRating.toFixed(1)}</span>
                <span className="mx-2">•</span>
                <span>{format(new Date(review.createdAt), 'MMMM yyyy')}</span>
              </div>
            </div>
          </div>
          
          <p className="mt-3 text-gray-700">{review.comment}</p>
          
          {review.response && (
            <div className="mt-4 pl-4 border-l-2 border-gray-200">
              <div className="text-sm font-medium text-gray-700 mb-1">
                Host's response:
              </div>
              <p className="text-gray-600 text-sm">{review.response.comment}</p>
              <div className="text-xs text-gray-500 mt-1">
                {format(new Date(review.response.createdAt), 'MMMM yyyy')}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Detailed ratings */}
      {Object.entries(ratings).filter(([key]) => key !== 'overall').length > 0 && (
        <div className="grid grid-cols-2 gap-2 text-sm mt-4">
          {Object.entries(ratings)
            .filter(([key]) => key !== 'overall')
            .map(([category, score]) => (
              <div key={category} className="flex items-center">
                <span className="capitalize mr-2 text-gray-600">
                  {category.replace(/-/g, ' ')}:
                </span>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={`${i < score ? 'text-yellow-400' : 'text-gray-300'} text-sm`}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}