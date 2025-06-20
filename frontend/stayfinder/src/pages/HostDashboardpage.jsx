import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import HostDashboardLayout from '../components/host-dashboard/HostDashboardLayout';
import ListingList from '../components/host-dashboard/ListingList';
import CreateListingForm from '../components/host-dashboard/CreteListingForm';
import EditListingForm from '../components/host-dashboard/EditListingForm';
import HostStats from '../components/host-dashboard/HostStats';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHostListings, selectListings } from '../features/HostListings/HostSlice';

const HostDashboardPage = () => {
    const { user, isAuthenticated } = useAuth();
    const [activeTab, setActiveTab] = useState('listings');
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [listing, setListing] = useState({});
    const listings = useSelector(selectListings);
    const [refreshKey, setRefreshKey] = useState(0); // Add refresh key

    // Add this function to refresh listings
    const refreshListings = async () => {
        try {
            await dispatch(fetchHostListings()).unwrap();
        } catch (error) {
            console.error('Failed to fetch listings:', error);
        }
    };

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'host') {
            if (!isAuthenticated) {
                navigate('/login', {
                    state: {
                        from: location.pathname
                    }
                });
            }
        }
    }, [isAuthenticated, user, location.pathname, navigate]);

    useEffect(() => {
        refreshListings();
    }, [dispatch, isAuthenticated, user?.role, refreshKey]); // Add refreshKey to dependencies

    if (user?.role !== 'host') {
        return <div className="container py-12 text-center">You need to be a host to access this page</div>;
    }

    return (
        <HostDashboardLayout
            activeTab={activeTab}
            setActiveTab={setActiveTab}
        >
            <div className="container mx-auto px-4 py-8">
                {activeTab === 'stats' && <HostStats listings={listings} />}

                {activeTab === 'listings' && (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Your Listings</h2>
                            <button
                                onClick={() => setActiveTab('create')}
                                className="btn btn-primary"
                            >
                                + Add New Listing
                            </button>
                        </div>
                        {listings && listings.length > 0 ? (
                            <ListingList
                                listings={listings}
                                onEdit={(listing) => {
                                    setListing(listing);
                                    setActiveTab('edit');
                                }}
                            />
                        ) : (
                            <div className="text-center py-8">
                                <p>No listings found. Create your first listing!</p>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'create' && (
                    <CreateListingForm
                        onCancel={() => setActiveTab('listings')}
                        onSuccess={() => {
                            setActiveTab('listings');
                            setRefreshKey(prev => prev + 1); // Refresh listings after creation
                        }}
                    />
                )}

                {activeTab === 'edit' && (
                    <EditListingForm
                        listing={listing}
                        onCancel={() => setActiveTab('listings')}
                        onSuccess={() => {
                            setActiveTab('listings');
                            setRefreshKey(prev => prev + 1); // Refresh listings after update
                        }}
                    />
                )}
            </div>
        </HostDashboardLayout>
    );
};

export default HostDashboardPage;