import { useState, useEffect, useCallback, useRef } from 'react';
import { FaSearch, FaFilter, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';

export default function SearchFilters({ onFilterChange, getlistings }) {
  const [filters, setFilters] = useState({
    search: '',
    checkIn: '',
    checkOut: '',
    minPrice: '',
    maxPrice: '',
    propertyType: '',
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isclearfilters, setisclearfilters] = useState(false);
  
  // Use ref to store the latest filters to avoid stale closure issues
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  // Debounce function
  const debounce = (func, delay) => {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), delay);
    };
  };

  // Memoized debounced onChange handler
  const debouncedOnChange = useCallback(
    debounce((updatedFilters) => {
      // Only skip if we have incomplete date range (checkIn without checkOut)
      // But allow other filters to work independently
      const hasIncompleteDate = updatedFilters.checkIn && !updatedFilters.checkOut;
      const hasIncompletePriceRange = (updatedFilters.minPrice && !updatedFilters.maxPrice) || 
                                     (!updatedFilters.minPrice && updatedFilters.maxPrice);
      
      // If we have incomplete date range, don't apply filters yet
      if (hasIncompleteDate) {
        return;
      }
      
      // For price range, we can be more flexible - allow single price filter
      // or just validate that minPrice <= maxPrice if both are provided
      if (updatedFilters.minPrice && updatedFilters.maxPrice) {
        const min = parseFloat(updatedFilters.minPrice);
        const max = parseFloat(updatedFilters.maxPrice);
        if (min > max) {
          return; // Don't apply if min > max
        }
      }
      
      console.log('Applying filters:', updatedFilters);
      onFilterChange(updatedFilters);
      setisclearfilters(false);
    }, 600),
    [onFilterChange]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFilters = {
      ...filters,
      [name]: value
    };
    
    console.log('Filter changed:', name, value);
    setFilters(updatedFilters);
    
    // Apply debounced change
    debouncedOnChange(updatedFilters);
  };

  const handleClearFilters = () => {
    if (isclearfilters) return;
    
    const clearedFilters = {
      search: '',
      checkIn: '',
      checkOut: '',
      minPrice: '',
      maxPrice: '',
      propertyType: '',
    };
    
    setFilters(clearedFilters);
    setisclearfilters(true);
    
    // Clear filters immediately, don't wait for debounce
    getlistings();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Force immediate filter application on form submit
    const currentFilters = filtersRef.current;
    
    // Validate date range
    if (currentFilters.checkIn && !currentFilters.checkOut) {
      alert('Please select both check-in and check-out dates');
      return;
    }
    
    // Validate price range
    if (currentFilters.minPrice && currentFilters.maxPrice) {
      const min = parseFloat(currentFilters.minPrice);
      const max = parseFloat(currentFilters.maxPrice);
      if (min > max) {
        alert('Minimum price cannot be greater than maximum price');
        return;
      }
    }
    
    console.log('Form submitted with filters:', currentFilters);
    onFilterChange(currentFilters);
    setisclearfilters(false);
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debouncedOnChange.cancel) {
        debouncedOnChange.cancel();
      }
    };
  }, [debouncedOnChange]);

  return (
    <div className="mb-8 w-full">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2 md:gap-4 w-full">
        {/* Location Search */}
        <div className="w-full md:flex-1 relative">
          <input
            type="text"
            name="search"
            placeholder="Where are you going?"
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={filters.search}
            onChange={handleChange}
          />
          <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
        </div>

        {/* Filter Button */}
        <button
          type="button"
          className="flex items-center justify-center gap-2 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 whitespace-nowrap"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <FaFilter />
          <span>Toggle Filters</span>
        </button>

        {/* Search Button */}
        <button
          type="submit"
          className="w-full md:w-auto px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark whitespace-nowrap"
        >
          Search
        </button>
      </form>

      {showAdvanced && (
        <div className="mt-4 p-4 border rounded-lg bg-white shadow-sm w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date Picker */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Dates</label>
              <div className="flex flex-col md:flex-row gap-2 w-full">
                <div className="relative flex-1 min-w-[160px]">
                  <input
                    type="date"
                    name="checkIn"
                    className="w-full pl-8 pr-3 py-2 border rounded-md"
                    value={filters.checkIn}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]} // Prevent past dates
                  />
                  <FaCalendarAlt className="absolute left-2 top-3 text-gray-400" />
                </div>
                <div className="relative flex-1 min-w-[160px]">
                  <input
                    type="date"
                    name="checkOut"
                    className="w-full pl-8 pr-3 py-2 border rounded-md"
                    value={filters.checkOut}
                    onChange={handleChange}
                    min={filters.checkIn || new Date().toISOString().split('T')[0]} // Ensure check-out is after check-in
                  />
                  <FaCalendarAlt className="absolute left-2 top-3 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Price Range */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Price range</label>
              <div className="flex flex-col md:flex-row gap-2 w-full">
                <div className="flex-1 min-w-[120px]">
                  <input
                    type="number"
                    name="minPrice"
                    placeholder="Min"
                    className="w-full px-3 py-2 border rounded-md"
                    value={filters.minPrice}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div className="flex-1 min-w-[120px]">
                  <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max"
                    className="w-full px-3 py-2 border rounded-md"
                    value={filters.maxPrice}
                    onChange={handleChange}
                    min={filters.minPrice || "0"}
                  />
                </div>
              </div>
            </div>

            {/* Property Type */}
            <div className="w-full md:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Property type</label>
              <select
                name="propertyType"
                className="w-full px-3 py-2 border rounded-md"
                value={filters.propertyType}
                onChange={handleChange}
              >
                <option value="">Any type</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="cabin">Cabin</option>
              </select>
            </div>
          </div>
          
          <button
            type="button"
            onClick={handleClearFilters}
            className="inline-flex mt-2 items-center bg-red-600 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isclearfilters}
          >
            {isclearfilters ? 'Filters Cleared' : 'Clear filters'}
          </button>
        </div>
      )}
    </div>
  );
}
