export const listingFormValidation = {
  title: {
    required: 'Title is required',
    maxLength: {
      value: 100,
      message: 'Title cannot exceed 100 characters'
    }
  },
  description: {
    required: 'Description is required',
    maxLength: {
      value: 2000,
      message: 'Description cannot exceed 2000 characters'
    }
  },
  propertyType: {
    required: 'Property type is required',
    validate: (value) => 
      ['apartment', 'house', 'villa', 'condo', 'townhouse', 'cabin', 'loft', 'other'].includes(value) || 
      'Invalid property type'
  },
  roomType: {
    required: 'Room type is required',
    validate: (value) => 
      ['entire-place', 'private-room', 'shared-room'].includes(value) || 
      'Invalid room type'
  },
  'location.address': {
    required: 'Address is required'
  },
  'location.city': {
    required: 'City is required'
  },
  'location.country': {
    required: 'Country is required'
  },
  'pricing.basePrice': {
    required: 'Base price is required',
    min: {
      value: 1,
      message: 'Price must be at least $1'
    }
  },
  'capacity.guests': {
    required: 'Guest capacity is required',
    min: {
      value: 1,
      message: 'Must accommodate at least 1 guest'
    }
  },
  'capacity.bedrooms': {
    required: 'Bedroom count is required',
    min: {
      value: 0,
      message: 'Bedrooms must be a non-negative integer'
    }
  },
  'capacity.beds': {
    required: 'Bed count is required',
    min: {
      value: 1,
      message: 'Must have at least 1 bed'
    }
  },
  'capacity.bathrooms': {
    required: 'Bathroom count is required',
    min: {
      value: 0.5,
      message: 'Must have at least 0.5 bathrooms'
    }
  },
  images: {
    validate: (files) => {
      if (!files || files.length === 0) return true;
      if (files.length > 10) return 'Maximum 10 images allowed';
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          return 'Only image files are allowed';
        }
        if (file.size > 5 * 1024 * 1024) {
          return 'Image size should be less than 5MB';
        }
      }
      return true;
    }
  }
};