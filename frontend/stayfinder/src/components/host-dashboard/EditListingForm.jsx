import { useEffect, useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useHostListings } from '../../hooks/useHostListings';
import { listingFormValidation } from '../../utils/listingFormValidation';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import CheckboxGroup from '../../components/ui/CheckboxGroup';
import Textarea from '../../components/ui/TextArea';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';

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

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' }
];

const EditListingForm = ({ listing, onCancel,onSuccess  }) => {
  const { editListing, loading, error, clearError } = useHostListings();
  const fileInputRef = useRef(null);
  const [formInitialized, setFormInitialized] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
    setValue,
    watch,
    getValues,
    trigger
  } = useForm({
    mode: 'onChange' // This helps with real-time validation
  });

  console.log(listing);

  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [deletedImageIds, setDeletedImageIds] = useState([]);

  // Initialize form only once when listing is available
  useEffect(() => {
    if (listing && !formInitialized) {
      console.log('Initializing form with listing data:', listing);

      const formData = {
        title: listing.title,
        description: listing.description,
        propertyType: listing.propertyType,
        roomType: listing.roomType,
        status: listing.status,
        address: listing.location?.address || '',
        city: listing.location?.city || '',
        country: listing.location?.country || '',
        latitude: listing.location?.coordinates?.coordinates?.[1] || '',
        longitude: listing.location?.coordinates?.coordinates?.[0] || '',
        'pricing.basePrice': listing.pricing?.basePrice || '',
        'pricing.cleaningFee': listing.pricing?.cleaningFee || '',
        'capacity.guests': listing.capacity?.guests || '',
        'capacity.bedrooms': listing.capacity?.bedrooms || '',
        'capacity.beds': listing.capacity?.beds || '',
        'capacity.bathrooms': listing.capacity?.bathrooms || '',
        amenities: listing.amenities || []
      };

      console.log('Form data to set:', formData);

      reset(formData);
      setExistingImages(listing.images || []);
      setFormInitialized(true);
    }
  }, [listing, reset, formInitialized]);

  // Debug form state changes - but don't interfere with form initialization
  useEffect(() => {
    if (!formInitialized) return;

    const subscription = watch((value, { name, type }) => {
      console.log('Form field changed:', name, 'New value:', value[name], 'Type:', type);
      if (name?.includes('pricing')) {
        console.log('All pricing values:', {
          basePrice: value['pricing.basePrice'],
          cleaningFee: value['pricing.cleaningFee']
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, formInitialized]);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

 const onSubmit = useCallback(async (data) => {
  console.log('=== FORM SUBMISSION STARTED ===');
  console.log('Raw form data:', data);

  // Process pricing data
  const pricingData = {
    basePrice: Number(data.pricing?.basePrice || data['pricing.basePrice']) || 0,
    cleaningFee: Number(data.pricing?.cleaningFee || data['pricing.cleaningFee']) || 0
  };

  // Process capacity data - FIXED VERSION
  const capacityData = {
    guests: parseInt(data.capacity?.guests || data['capacity.guests']) || 0,
    bedrooms: parseInt(data.capacity?.bedrooms || data['capacity.bedrooms']) || 0,
    beds: parseInt(data.capacity?.beds || data['capacity.beds']) || 0,
    bathrooms: parseFloat(data.capacity?.bathrooms || data['capacity.bathrooms']) || 0
  };

  console.log('Processed capacity:', capacityData);

  const formData = new FormData();
  
  // Append all regular fields
  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('propertyType', data.propertyType);
  formData.append('roomType', data.roomType);
  formData.append('status', data.status);
  
  // Location
  formData.append('location', JSON.stringify({
    address: data.address,
    city: data.city,
    country: data.country,
    coordinates: {
      type: 'Point',
      coordinates: [
        parseFloat(data.longitude) || 0,
        parseFloat(data.latitude) || 0
      ]
    }
  }));
  
  // Pricing
  formData.append('pricing', JSON.stringify(pricingData));
  
  // Capacity - Use the properly processed data
  formData.append('capacity', JSON.stringify(capacityData));

  // Amenities
  formData.append('amenities', JSON.stringify(data.amenities || []));

  // Handle images
  if (selectedFiles?.length > 0) {
    selectedFiles.forEach(file => formData.append('images', file));
  }

  if (deletedImageIds.length > 0) {
    formData.append('deletedImages', JSON.stringify(deletedImageIds));
  }

  // Debug: Log FormData contents
  console.log('Final FormData contents:');
  for (let [key, value] of formData.entries()) {
    console.log(key, value instanceof File ? `File: ${value.name}` : value);
  }

  try {
    const response = await editListing(listing._id, formData);
    console.log('Update successful:', response);
    onSuccess();
  } catch (error) {
    console.error('Update failed:', error);
  }
}, [editListing, listing._id, selectedFiles, deletedImageIds, onSuccess ]);


  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) {
      setSelectedFiles([]);
      setImagePreviews([]);
      return;
    }

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

    // Create preview URLs
    const previews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
    setSelectedFiles(validFiles);

    console.log('Selected files:', validFiles);
  };

  const removeNewImage = (index) => {
    const newPreviews = [...imagePreviews];
    const newFiles = [...selectedFiles];

    // Revoke the URL to free memory
    URL.revokeObjectURL(newPreviews[index]);

    // Remove from arrays
    newPreviews.splice(index, 1);
    newFiles.splice(index, 1);

    setImagePreviews(newPreviews);
    setSelectedFiles(newFiles);

    // Update file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeExistingImage = (imageId) => {
    // Add to deleted images list
    setDeletedImageIds(prev => [...prev, imageId]);

    // Remove from existing images display
    setExistingImages(prev => prev.filter(img => img._id !== imageId));
  };

  const clearFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setSelectedFiles([]);
    setImagePreviews([]);
  };

  // Watch pricing fields to debug
  const watchedBasePrice = watch('pricing.basePrice');
  const watchedCleaningFee = watch('pricing.cleaningFee');

  console.log('Watched base price:', watchedBasePrice);
  console.log('Watched cleaning fee:', watchedCleaningFee);

  // Don't render form until it's properly initialized
  if (!formInitialized) {
    return (
      <div className="bg-white rounded-lg shadow p-6 max-w-4xl mx-auto">
        <div className="flex justify-center">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Edit Listing</h2>

      {error && <Alert type="error" message={error} className="mb-4" onClose={clearError} />}

      {/* Debug info */}
      <div className="mb-4 p-3 bg-gray-100 rounded text-sm">
        <strong>Debug Info:</strong><br />
        Current Base Price: {watchedBasePrice}<br />
        Current Cleaning Fee: {watchedCleaningFee}<br />
        Form Initialized: {formInitialized ? 'Yes' : 'No'}
      </div>

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

          <Select
            label="Status"
            name="status"
            options={statusOptions}
            register={register}
            error={errors.status}
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
            name="pricing.basePrice"
            type="number"
            min="1"
            step="0.01"
            register={register}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              if (!isNaN(value)) {
                setValue('pricing.basePrice', value);
              }
            }}
            validation={{
              required: 'Base price is required',
              min: { value: 1, message: 'Base price must be at least $1' },
              valueAsNumber: true // This ensures the value is treated as a number
            }}
            error={errors.pricing?.basePrice}
          />

          <Input
            label="Cleaning Fee ($)"
            name="pricing.cleaningFee"
            type="number"
            min="0"
            step="0.01"
            register={register}
            validation={{
              valueAsNumber: true // This ensures the value is treated as a number
            }}
            error={errors.pricing?.cleaningFee}
          />

          {/* Capacity Fields */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Capacity</h3>
          </div>

          <Input
            label="Guests"
            name="capacity.guests"
            type="number"
            min="1"
            register={register}
            validation={{
              required: 'Number of guests is required',
              min: { value: 1, message: 'Must accommodate at least 1 guest' },
              valueAsNumber: true
            }}
            error={errors.capacity?.guests}
          />

          <Input
            label="Bedrooms"
            name="capacity.bedrooms"
            type="number"
            min="0"
            register={register}
            validation={{
              required: 'Number of bedrooms is required',
              min: { value: 0, message: 'Bedrooms must be a non-negative integer' },
              valueAsNumber: true
            }}
            error={errors.capacity?.bedrooms}
          />

          <Input
            label="Beds"
            name="capacity.beds"
            type="number"
            min="1"
            register={register}
            validation={{
              required: 'Number of beds is required',
              min: { value: 1, message: 'Must have at least 1 bed' },
              valueAsNumber: true
            }}
            error={errors.capacity?.beds}
          />

          <Input
            label="Bathrooms"
            name="capacity.bathrooms"
            type="number"
            min="0.5"
            step="0.5"
            register={register}
            validation={{
              required: 'Number of bathrooms is required',
              min: { value: 0.5, message: 'Must have at least 0.5 bathrooms' },
              valueAsNumber: true
            }}
            error={errors.capacity?.bathrooms}
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
              Images
            </label>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <>
                <p className="text-sm text-gray-500 mb-2">Current Images</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {existingImages.map((image) => (
                    <div key={image._id} className="relative group">
                      <img
                        src={image.url}
                        alt={image.caption || 'Existing image'}
                        className="w-24 h-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(image._id)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                        aria-label="Remove image"
                      >
                        ×
                      </button>
                      {image.isPrimary && (
                        <span className="absolute bottom-0 left-0 bg-blue-500 text-white text-xs px-1 rounded-tr">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* New Images Preview */}
            {imagePreviews.length > 0 && (
              <>
                <p className="text-sm text-gray-500 mb-2">New Images to Upload</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={`new-${index}`} className="relative group">
                      <img
                        src={preview}
                        alt={`New image ${index + 1}`}
                        className="w-24 h-24 object-cover rounded border-2 border-green-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                        aria-label="Remove new image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Image Upload */}
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg, image/png, image/webp"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />

              {selectedFiles.length > 0 && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={clearFileInput}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Clear selected files
                  </button>
                  <span className="text-sm text-gray-500">
                    {selectedFiles.length} file(s) selected
                  </span>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-500 mt-1">
              Supported formats: JPEG, PNG, WebP. Max size: 5MB per image.
            </p>
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
            {loading ? <Spinner size="sm" /> : 'Update Listing'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditListingForm;