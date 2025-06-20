import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useListings } from '../hooks/uselistings';
import ListingForm from '../components/listings/ListingForm';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function CreateListingPage() {
  const { addListing, isLoading } = useListings();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const handleSubmit = async (formData) => {
    const result = await addListing(formData);
    if (result?.payload?._id) {
      navigate(`/host/listings/${result.payload._id}`);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create a new listing</h1>
        
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className={`flex-1 text-center ${step >= 1 ? 'text-primary font-medium' : 'text-gray-500'}`}>
              <span className="flex items-center justify-center w-8 h-8 mx-auto rounded-full border-2 border-primary text-primary">
                1
              </span>
              <span className="block mt-2">Basic Info</span>
            </div>
            <div className={`flex-1 text-center ${step >= 2 ? 'text-primary font-medium' : 'text-gray-500'}`}>
              <span className="flex items-center justify-center w-8 h-8 mx-auto rounded-full border-2 border-primary text-primary">
                2
              </span>
              <span className="block mt-2">Details</span>
            </div>
            <div className={`flex-1 text-center ${step >= 3 ? 'text-primary font-medium' : 'text-gray-500'}`}>
              <span className="flex items-center justify-center w-8 h-8 mx-auto rounded-full border-2 border-primary text-primary">
                3
              </span>
              <span className="block mt-2">Pricing</span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2"></div>
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 transition-all duration-300"
              style={{ width: `${(step - 1) * 50}%` }}
            ></div>
          </div>
        </div>

        <ListingForm 
          onSubmit={handleSubmit} 
          step={step} 
          setStep={setStep} 
        />
      </div>
    </div>
  );
}