import { useState, useEffect } from 'react';
import { useHostListings } from '../../hooks/useHostListings';
import ListingCard from './ListingCard';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';

const ListingList = ({ onEdit, listings, refresh }) => {
  const { loading, error, removeListing } = useHostListings();
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredListings, setfilteredListings] = useState([])
  useEffect(() => {
    const filter = listings.filter(listing =>
      statusFilter === 'all' || listing.status === statusFilter
    );
    setfilteredListings(filter)
    if (!filteredListings) {
      setTimeout(async () => {
        const newfilter = await refresh()
        setfilteredListings(newfilter)
      }, 800)
    }
  },[])
  

  async function deletelisting(id) {
    const response = await removeListing(id).unwrap()
    console.log(response);
      setTimeout(async () => {
        const newfilter = await refresh()
        setfilteredListings(newfilter)
      }, 800)
  }

  if (loading) return <Spinner />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <div>
      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {filteredListings.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">You don't have any listings yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(filteredListings) && filteredListings.length > 0 && filteredListings.map(listing => (
            <ListingCard
              key={listing._id}
              listing={listing}
              onEdit={onEdit}
              onDelete={deletelisting}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ListingList;