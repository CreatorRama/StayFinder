import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Spinner from '../../components/ui/Spinner';

const HostStats = ({listings}) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  
console.log(listings);
  useEffect(() => {
    if (listings.length > 0) {
      const activeListings = listings.filter(l => l.status === 'active').length;
      const totalBookings = listings.reduce((sum, listing) => sum + (listing.metrics?.bookings || 0), 0);
      const totalRevenue = listings.reduce((sum, listing) => {
        return sum + (listing.metrics?.revenue || 0);
      }, 0);
      
      const monthlyRevenue = Array(12).fill(0).map((_, index) => {
        return {
          name: new Date(0, index).toLocaleString('default', { month: 'short' }),
          revenue: Math.floor(Math.random() * 5000) + 1000 // Mock data - replace with actual data
        };
      });
      
      setStats({
        activeListings,
        totalBookings,
        totalRevenue,
        monthlyRevenue
      });
      setLoading(false);
    }
  }, [listings]);

  if (loading) return <Spinner />;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Your Statistics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-500">Active Listings</h3>
          <p className="text-3xl font-bold">{stats.activeListings}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-500">Total Bookings</h3>
          <p className="text-3xl font-bold">{stats.totalBookings}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-500">Total Revenue</h3>
          <p className="text-3xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Monthly Revenue</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stats.monthlyRevenue}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#8884d8" name="Revenue ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default HostStats;