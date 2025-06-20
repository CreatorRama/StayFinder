export default function AmenitiesList({ amenities }) {
  const amenityIcons = {
    'wifi': 'Wi-Fi',
    'kitchen': 'Kitchen',
    'washer': 'Washer',
    'dryer': 'Dryer',
    'air-conditioning': 'Air conditioning',
    'heating': 'Heating',
    'tv': 'TV',
    'hot-tub': 'Hot tub',
    'pool': 'Pool',
    'gym': 'Gym',
    'parking': 'Parking',
    'elevator': 'Elevator',
    'wheelchair-accessible': 'Wheelchair accessible',
    'pet-friendly': 'Pet friendly',
    'smoking-allowed': 'Smoking allowed',
    'events-allowed': 'Events allowed',
    'fireplace': 'Fireplace',
    'breakfast': 'Breakfast',
    'laptop-friendly': 'Laptop friendly workspace',
    'family-friendly': 'Family friendly',
    'suitable-for-infants': 'Suitable for infants'
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Amenities</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {amenities?.length > 0 ? (
          amenities.map((amenity) => (
            <div key={amenity} className="flex items-center">
              <span className="w-5 h-5 bg-primary rounded-full mr-2 flex items-center justify-center text-white text-xs">
                ✓
              </span>
              <span>{amenityIcons[amenity] || amenity}</span>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No amenities listed</p>
        )}
      </div>
    </div>
  );
}