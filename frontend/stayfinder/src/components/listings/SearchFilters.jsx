import { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaFilter, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';

export default function SearchFilters({ onFilterChange,getlistings }) {
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
      // Skip if we have checkIn without checkOut or minPrice without maxPrice
      if (
        (updatedFilters.checkIn && !updatedFilters.checkOut) ||
        (updatedFilters.minPrice && !updatedFilters.maxPrice)
      ) {
        return;
      }
      onFilterChange(updatedFilters);
      setisclearfilters(false)
    }, 600),
    [onFilterChange]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFilters = {
      ...filters,
      [name]: value
    };
    setFilters(updatedFilters);
    debouncedOnChange(updatedFilters);
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedOnChange.cancel?.();
    };
  }, [debouncedOnChange]);

  return (
    <div className="mb-8 w-full">
      <form className="flex flex-col md:flex-row gap-2 md:gap-4 w-full">
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
            onClick={() => {
              setFilters({
                search: '',
                checkIn: '',
                checkOut: '',
                minPrice: '',
                maxPrice: '',
                propertyType: '',
              });

              if(isclearfilters) return
             
                getlistings()
                setisclearfilters(true)
              
            }}
            className="inline-flex mt-2 items-center bg-red-600 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Clear filters
          </button>
        </div>
      )}

    </div>
  );
}