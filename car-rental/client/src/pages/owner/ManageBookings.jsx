import { useState, useEffect } from 'react';
import { Calendar, User, Car } from 'lucide-react';
import { API } from '../../context/AppContext';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['pending', 'confirmed', 'active', 'completed', 'cancelled'];
const STATUS_STYLES = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  active: 'bg-green-50 text-green-700 border-green-200',
  completed: 'bg-gray-50 text-gray-700 border-gray-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await API.get('/bookings/owner-bookings');
      setBookings(data.bookings);
    } catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/bookings/${id}/status`, { status });
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b));
      toast.success(`Booking ${status}`);
    } catch { toast.error('Failed to update'); }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-4">
      {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />)}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manage Bookings</h1>
        <p className="text-gray-500 text-sm">{bookings.length} total bookings</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {['all', ...STATUS_OPTIONS].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${filter === s ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'}`}
          >
            {s} {s === 'all' ? `(${bookings.length})` : `(${bookings.filter(b => b.status === s).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(b => (
            <div key={b._id} className="card p-5">
              <div className="flex flex-col sm:flex-row gap-4">
                <img
                  src={b.car?.images?.[0] || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=300&q=80'}
                  alt=""
                  className="w-full sm:w-28 h-20 object-cover rounded-xl shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900">{b.car?.brand} {b.car?.model}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                        <User className="w-3.5 h-3.5" />
                        <span>{b.user?.name}</span>
                        <span className="text-gray-300">·</span>
                        <span>{b.user?.email}</span>
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize shrink-0 ${STATUS_STYLES[b.status]}`}>
                      {b.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-gray-600 mb-3">
                    <div><span className="text-gray-400 block">Pickup</span>{new Date(b.pickupDate).toLocaleDateString()}</div>
                    <div><span className="text-gray-400 block">Return</span>{new Date(b.returnDate).toLocaleDateString()}</div>
                    <div><span className="text-gray-400 block">Duration</span>{b.totalDays} day{b.totalDays !== 1 ? 's' : ''}</div>
                    <div><span className="text-gray-400 block">Amount</span><span className="font-bold text-gray-900">${b.totalAmount}</span></div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.filter(s => s !== b.status && s !== 'cancelled' || s === 'cancelled' && b.status !== 'completed').map(s => (
                      <button
                        key={s}
                        onClick={() => updateStatus(b._id, s)}
                        className="text-xs px-3 py-1 rounded-full border border-gray-200 text-gray-600 hover:border-primary-400 hover:text-primary-600 capitalize transition-colors"
                      >
                        Mark {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
