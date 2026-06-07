import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, X } from 'lucide-react';
import { API } from '../context/AppContext';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  active: 'bg-green-50 text-green-700 border-green-200',
  completed: 'bg-gray-50 text-gray-700 border-gray-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

const PAYMENT_STYLES = {
  unpaid: 'text-red-600',
  paid: 'text-green-600',
  refunded: 'text-gray-500',
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await API.get('/bookings/my-bookings');
      setBookings(data.bookings);
    } catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  };

  const cancelBooking = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await API.put(`/bookings/${id}/cancel`);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
      {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">My Bookings</h1>
      <p className="text-gray-500 text-sm mb-8">{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</p>

      {bookings.length === 0 ? (
        <div className="text-center py-24">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-400 mb-2">No bookings yet</p>
          <p className="text-gray-400 text-sm mb-6">Find a car and make your first booking</p>
          <Link to="/cars" className="btn-primary">Browse Cars</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => {
            const car = booking.car;
            const img = car?.images?.[0] || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&q=80';

            return (
              <div key={booking._id} className="card p-5">
                <div className="flex gap-4">
                  <img src={img} alt={car ? `${car.brand} ${car.model}` : 'Car'} className="w-24 h-20 sm:w-32 sm:h-24 object-cover rounded-xl shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900">{car ? `${car.brand} ${car.model}` : 'Car'}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                          <MapPin className="w-3 h-3" />{car?.location}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${STATUS_STYLES[booking.status]}`}>
                          {booking.status}
                        </span>
                        {['pending', 'confirmed'].includes(booking.status) && (
                          <button onClick={() => cancelBooking(booking._id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors" title="Cancel booking">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-gray-600 mt-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{new Date(booking.pickupDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{booking.totalDays} day{booking.totalDays !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="font-semibold text-gray-900">
                        Total: ${booking.totalAmount}
                        <span className={`ml-1.5 text-xs font-medium capitalize ${PAYMENT_STYLES[booking.paymentStatus]}`}>
                          ({booking.paymentStatus})
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3 text-xs text-gray-500 mt-2">
                      <span>📍 From: {booking.pickupLocation}</span>
                      <span>→ To: {booking.dropoffLocation}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
