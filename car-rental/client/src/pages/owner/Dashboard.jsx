import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car, Calendar, DollarSign, TrendingUp, Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { API } from '../../context/AppContext';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [carsRes, bookingsRes] = await Promise.all([
        API.get('/cars/owner/my-cars'),
        API.get('/bookings/owner-bookings'),
      ]);
      setCars(carsRes.data.cars);
      setBookings(bookingsRes.data.bookings);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const deleteCar = async (id) => {
    if (!confirm('Delete this car?')) return;
    try {
      await API.delete(`/cars/${id}`);
      setCars(prev => prev.filter(c => c._id !== id));
      toast.success('Car deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const toggleAvailability = async (car) => {
    try {
      const { data } = await API.put(`/cars/${car._id}`, { isAvailable: !car.isAvailable });
      setCars(prev => prev.map(c => c._id === car._id ? data.car : c));
      toast.success(`Car marked as ${!car.isAvailable ? 'available' : 'unavailable'}`);
    } catch { toast.error('Failed to update'); }
  };

  const totalRevenue = bookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.totalAmount, 0);
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;

  const stats = [
    { icon: Car, label: 'Total Cars', value: cars.length, color: 'bg-blue-50 text-blue-600' },
    { icon: Calendar, label: 'Total Bookings', value: bookings.length, color: 'bg-purple-50 text-purple-600' },
    { icon: Clock2, label: 'Pending', value: pendingBookings, color: 'bg-yellow-50 text-yellow-600' },
    { icon: DollarSign, label: 'Revenue', value: `$${totalRevenue.toLocaleString()}`, color: 'bg-green-50 text-green-600' },
  ];

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Owner Dashboard</h1>
          <p className="text-gray-500 text-sm">Manage your cars and bookings</p>
        </div>
        <Link to="/owner/add-car" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Car
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { icon: Car, label: 'Total Cars', value: cars.length, color: 'bg-blue-50 text-blue-600' },
          { icon: Calendar, label: 'Total Bookings', value: bookings.length, color: 'bg-purple-50 text-purple-600' },
          { icon: TrendingUp, label: 'Pending', value: pendingBookings, color: 'bg-yellow-50 text-yellow-600' },
          { icon: DollarSign, label: 'Revenue', value: `$${totalRevenue.toLocaleString()}`, color: 'bg-green-50 text-green-600' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-xs text-gray-500 mb-0.5">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* My Cars */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">My Cars</h2>
          <Link to="/owner/add-car" className="text-sm text-primary-600 font-semibold hover:underline flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add New</Link>
        </div>

        {cars.length === 0 ? (
          <div className="card p-10 text-center">
            <Car className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 mb-4">No cars listed yet</p>
            <Link to="/owner/add-car" className="btn-primary">Add Your First Car</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cars.map(car => (
              <div key={car._id} className="card p-4">
                <img
                  src={car.images?.[0] || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&q=80'}
                  alt={`${car.brand} ${car.model}`}
                  className="w-full h-36 object-cover rounded-xl mb-3"
                />
                <h3 className="font-bold text-gray-900">{car.brand} {car.model}</h3>
                <p className="text-sm text-gray-500 mb-3">{car.year} · ${car.pricePerDay}/day</p>
                <div className="flex items-center justify-between">
                  <button onClick={() => toggleAvailability(car)} className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${car.isAvailable ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {car.isAvailable ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                    {car.isAvailable ? 'Available' : 'Unavailable'}
                  </button>
                  <button onClick={() => deleteCar(car._id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Bookings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Bookings</h2>
          <Link to="/owner/bookings" className="text-sm text-primary-600 font-semibold hover:underline">View all</Link>
        </div>

        {bookings.length === 0 ? (
          <div className="card p-8 text-center text-gray-400">No bookings yet</div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Customer', 'Car', 'Dates', 'Amount', 'Status'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bookings.slice(0, 5).map(b => (
                    <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{b.user?.name}</p>
                        <p className="text-xs text-gray-400">{b.user?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{b.car?.brand} {b.car?.model}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {new Date(b.pickupDate).toLocaleDateString()} – {new Date(b.returnDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">${b.totalAmount}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                          b.status === 'confirmed' ? 'bg-blue-50 text-blue-700' :
                          b.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                          b.status === 'completed' ? 'bg-green-50 text-green-700' :
                          'bg-red-50 text-red-700'
                        }`}>{b.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Inline Clock icon since we can't import named differently
function Clock2(props) {
  return <TrendingUp {...props} />;
}
