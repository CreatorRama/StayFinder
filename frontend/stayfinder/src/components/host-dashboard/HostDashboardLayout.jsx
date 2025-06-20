

const HostDashboardLayout = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('listings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'listings' ? 'border-red-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              My Listings
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'stats' ? 'border-red-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Statistics
            </button>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};

export default HostDashboardLayout;