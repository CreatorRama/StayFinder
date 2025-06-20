import { useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaExpand } from 'react-icons/fa';
import Modal from '../ui/Modal';

export default function ImageGallery({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">No images available</span>
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden bg-gray-100">
        <img
          src={images[currentIndex].url}
          alt={`Listing image ${currentIndex + 1}`}
          className="w-full h-full object-cover cursor-pointer"
          onClick={openModal}
        />
        
        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 shadow-md hover:bg-opacity-100 transition"
              aria-label="Previous image"
            >
              <FaChevronLeft className="text-gray-800" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 shadow-md hover:bg-opacity-100 transition"
              aria-label="Next image"
            >
              <FaChevronRight className="text-gray-800" />
            </button>
          </>
        )}

        {/* Image counter and expand button */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-between items-center px-4">
          {images.length > 1 && (
            <div className="flex space-x-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    currentIndex === index ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              openModal();
            }}
            className="bg-white bg-opacity-80 rounded-full p-2 shadow-md hover:bg-opacity-100 transition"
            aria-label="Expand image"
          >
            <FaExpand className="text-gray-800" />
          </button>
        </div>
      </div>

      {/* Modal for expanded view */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <div className="relative w-full max-w-4xl max-h-[90vh]">
          <img
            src={images[currentIndex].url}
            alt={`Listing image ${currentIndex + 1}`}
            className="w-full h-full max-h-[80vh] object-contain"
          />
          
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-3 shadow-md hover:bg-opacity-100 transition"
              >
                <FaChevronLeft className="text-gray-800 text-lg" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-3 shadow-md hover:bg-opacity-100 transition"
              >
                <FaChevronRight className="text-gray-800 text-lg" />
              </button>
              
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(index);
                    }}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      currentIndex === index ? 'bg-white' : 'bg-white bg-opacity-50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}