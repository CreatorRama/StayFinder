import { FaStar, FaMedal, FaRegClock } from 'react-icons/fa';
import { MdEmail, MdPhone } from 'react-icons/md';

export default function HostInfo({ host }) {

  console.log(host.avatar);
  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Hosted by {host.firstName}</h2>
      
      <div className="flex items-start gap-4">
        <img 
          src={host.avatar || 'https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-174669.jpg?semt=ais_hybrid&w=740'} 
          alt={host.firstName}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="flex-1">
          {host.hostProfile?.superhost && (
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <FaMedal className="text-yellow-500 mr-1" />
              <span>Superhost</span>
            </div>
          )}
          
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <FaStar className="text-yellow-400 mr-1" />
            <span>{host.hostProfile?.rating || 'No reviews yet'}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <FaRegClock className="mr-1" />
            <span>Joined in {new Date(host.hostProfile?.joinedDate).getFullYear() || 'N/A'}</span>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center text-sm">
              <MdEmail className="mr-2 text-gray-500" />
              <span>Response rate: {host.hostProfile?.responseRate || 'N/A'}%</span>
            </div>
            <div className="flex items-center text-sm">
              <MdPhone className="mr-2 text-gray-500" />
              <span>Response time: {host.hostProfile?.responseTime || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <p className="text-gray-700">{host.hostProfile?.bio || 'No bio provided'}</p>
      </div>
    </div>
  );
}