import { useForm } from 'react-hook-form';
import { useHostListings } from '../../hooks/useHostListings';
import { listingFormValidation } from '../../utils/listingFormValidation';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import CheckboxGroup from '../../components/ui/CheckboxGroup';
import Textarea from '../ui/TextArea';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import { useState, useEffect } from 'react';

const propertyTypes = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'villa', label: 'Villa' },
  { value: 'condo', label: 'Condo' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'cabin', label: 'Cabin' },
  { value: 'loft', label: 'Loft' },
  { value: 'other', label: 'Other' }
];

const roomTypes = [
  { value: 'entire-place', label: 'Entire place' },
  { value: 'private-room', label: 'Private room' },
  { value: 'shared-room', label: 'Shared room' }
];

const amenities = [
  { value: 'wifi', label: 'WiFi' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'washer', label: 'Washer' },
  { value: 'dryer', label: 'Dryer' },
  { value: 'air-conditioning', label: 'Air Conditioning' },
  { value: 'heating', label: 'Heating' },
  { value: 'tv', label: 'TV' },
  { value: 'hot-tub', label: 'Hot Tub' },
  { value: 'pool', label: 'Pool' },
  { value: 'gym', label: 'Gym' },
  { value: 'parking', label: 'Parking' }
];

const CreateListingForm = ({ onCancel }) => {
  const { addListing, loading, error, clearError } = useHostListings();
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    control,
    setValue,
    watch
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      propertyType: '',
      roomType: '',
      amenities: [],
      address: '',
      city: '',
      country: '',
      latitude: '',
      longitude: '',
      basePrice: '',
      cleaningFee: '',
      guests: '',
      bedrooms: '',
      beds: '',
      bathrooms: ''
    }
  });
  
  const [imagePreviews, setImagePreviews] = useState([]);
  const images = watch('images');

  // Clean up object URLs when component unmounts or images change
  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  const onSubmit = async (data) => {
    if (!data.images || data.images.length === 0) {
      alert('At least one image is required');
      return;
    }

    // Create FormData and append all fields individually to match backend validation
    const formData = new FormData();

    // Basic fields
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('propertyType', data.propertyType);
    formData.append('roomType', data.roomType);
    
    // Amenities (append each one individually)
    if (data.amenities && data.amenities.length > 0) {
      data.amenities.forEach(amenity => {
        formData.append('amenities', amenity);
      });
    }
    
    // Location fields (individual fields to match backend validation structure)
    formData.append('location[address]', data.address);
    formData.append('location[city]', data.city);
    formData.append('location[country]', data.country);
    formData.append('location[coordinates][lat]', parseFloat(data.latitude) || 0);
    formData.append('location[coordinates][lng]', parseFloat(data.longitude) || 0);
    
    // Pricing fields
    formData.append('pricing[basePrice]', parseFloat(data.basePrice) || 0);
    formData.append('pricing[cleaningFee]', parseFloat(data.cleaningFee) || 0);
    
    // Capacity fields
    formData.append('capacity[guests]', parseInt(data.guests) || 0);
    formData.append('capacity[bedrooms]', parseInt(data.bedrooms) || 0);
    formData.append('capacity[beds]', parseInt(data.beds) || 0);
    formData.append('capacity[bathrooms]', parseFloat(data.bathrooms) || 0);

    // Images
    Array.from(data.images).forEach(file => {
      formData.append('images', file);
    });

    try {
      console.log('Submitting form data...');
      // Debug: Log FormData contents
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      console.log(formData);
      const response = await addListing(formData).unwrap();
      console.log('Listing created:', response);
      onCancel();
    } catch (err) {
      console.error('Submission error:', err);
      setImagePreviews([]);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
  
    if (files.length === 0) return;
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        alert(`${file.name} is not a supported image type (JPEG, PNG, or WebP)`);
        return false;
      }
      
      if (file.size > maxSize) {
        alert(`${file.name} is too large (max 5MB)`);
        return false;
      }
      
      return true;
    });
    
    const previews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
    
    // Update form state with validated files
    setValue('images', validFiles);
  };

  const removeImage = (index) => {
    const newPreviews = [...imagePreviews];
    const newFiles = [...(images || [])];
    
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    newFiles.splice(index, 1);
    
    setImagePreviews(newPreviews);
    setValue('images', newFiles);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Create New Listing</h2>
      
      {error && <Alert type="error" message={error} className="mb-4" onClose={clearError} />}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Input
              label="Title"
              name="title"
              register={register}
              validation={listingFormValidation.title}
              error={errors.title}
            />
          </div>
          
          <div className="md:col-span-2">
            <Textarea
              label="Description"
              name="description"
              register={register}
              validation={listingFormValidation.description}
              error={errors.description}
              rows={4}
            />
          </div>
          
          <Select
            label="Property Type"
            name="propertyType"
            options={propertyTypes}
            register={register}
            validation={listingFormValidation.propertyType}
            error={errors.propertyType}
          />
          
          <Select
            label="Room Type"
            name="roomType"
            options={roomTypes}
            register={register}
            validation={listingFormValidation.roomType}
            error={errors.roomType}
          />

          {/* Location Fields */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Location</h3>
          </div>
          
          <Input
            label="Address"
            name="address"
            register={register}
            validation={{ required: 'Address is required' }}
            error={errors.address}
          />
          
          <Input
            label="City"
            name="city"
            register={register}
            validation={{ required: 'City is required' }}
            error={errors.city}
          />
          
          <Input
            label="Country"
            name="country"
            register={register}
            validation={{ required: 'Country is required' }}
            error={errors.country}
          />
          
          <div></div> {/* Empty div for grid spacing */}
          
          <Input
            label="Latitude"
            name="latitude"
            type="number"
            step="any"
            register={register}
            validation={{ 
              required: 'Latitude is required',
              min: { value: -90, message: 'Invalid latitude' },
              max: { value: 90, message: 'Invalid latitude' }
            }}
            error={errors.latitude}
          />
          
          <Input
            label="Longitude"
            name="longitude"
            type="number"
            step="any"
            register={register}
            validation={{ 
              required: 'Longitude is required',
              min: { value: -180, message: 'Invalid longitude' },
              max: { value: 180, message: 'Invalid longitude' }
            }}
            error={errors.longitude}
          />

          {/* Pricing Fields */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Pricing</h3>
          </div>
          
          <Input
            label="Base Price ($)"
            name="basePrice"
            type="number"
            min="1"
            step="0.01"
            register={register}
            validation={{ 
              required: 'Base price is required',
              min: { value: 1, message: 'Base price must be at least $1' }
            }}
            error={errors.basePrice}
          />
          
          <Input
            label="Cleaning Fee ($)"
            name="cleaningFee"
            type="number"
            min="0"
            step="0.01"
            register={register}
            error={errors.cleaningFee}
          />

          {/* Capacity Fields */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Capacity</h3>
          </div>
          
          <Input
            label="Guests"
            name="guests"
            type="number"
            min="1"
            register={register}
            validation={{ 
              required: 'Number of guests is required',
              min: { value: 1, message: 'Must accommodate at least 1 guest' }
            }}
            error={errors.guests}
          />
          
          <Input
            label="Bedrooms"
            name="bedrooms"
            type="number"
            min="0"
            register={register}
            validation={{ 
              required: 'Number of bedrooms is required',
              min: { value: 0, message: 'Bedrooms must be a non-negative integer' }
            }}
            error={errors.bedrooms}
          />
          
          <Input
            label="Beds"
            name="beds"
            type="number"
            min="1"
            register={register}
            validation={{ 
              required: 'Number of beds is required',
              min: { value: 1, message: 'Must have at least 1 bed' }
            }}
            error={errors.beds}
          />
          
          <Input
            label="Bathrooms"
            name="bathrooms"
            type="number"
            min="0.5"
            step="0.5"
            register={register}
            validation={{ 
              required: 'Number of bathrooms is required',
              min: { value: 0.5, message: 'Must have at least 0.5 bathrooms' }
            }}
            error={errors.bathrooms}
          />
          
          <div className="md:col-span-2">
            <CheckboxGroup
              label="Amenities"
              name="amenities"
              options={amenities}
              register={register}
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Images (At least one required)
            </label>
            <input
              type="file"
              multiple
              accept="image/jpeg, image/png, image/webp"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
            {errors.images && (
              <p className="mt-1 text-sm text-red-600">{errors.images.message}</p>
            )}
            
            <div className="mt-3 flex flex-wrap gap-2">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={preview} 
                    alt={`Preview ${index}`}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="secondary"
            disabled={loading}
          >
            {loading ? <Spinner size="sm" /> : 'Create Listing'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateListingForm;