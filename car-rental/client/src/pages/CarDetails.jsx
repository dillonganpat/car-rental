import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Users, Fuel, Settings, Calendar, CheckCircle, ArrowLeft, Star } from 'lucide-react';
import { API, useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

export default function CarDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useApp();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState({ pickupLocation: '', dropoffLocation: '', pickupDate: '', returnDate: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => { fetchCar(); }, [id]);

  const fetchCar = async () => {
    try {
      const { data } = await API.get(`/cars/${id}`);
      setCar(data.car);
    } catch { toast.error('Car not found'); navigate('/cars'); }
    finally { setLoading(false); }
  };

  const totalDays = () => {
    if (!booking.pickupDate || !booking.returnDate) return 0;
    const diff = new Date(booking.returnDate) - new Date(booking.pickupDate);
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to book'); navigate('/login'); return; }
    if (totalDays() < 1) { toast.error('Select valid dates'); return; }

    setSubmitting(true);
    try {
      const { data } = await API.post('/bookings', { carId: id, ...booking });
      toast.success('Booking created! Check My Bookings.');
      navigate('/my-bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-80 bg-gray-100 rounded-2xl mb-6" />
      <div className="grid grid-cols-3 gap-4"><div className="h-20 bg-gray-100 rounded-xl" /><div className="h-20 bg-gray-100 rounded-xl" /><div className="h-20 bg-gray-100 rounded-xl" /></div>
    </div>
  );
  if (!car) return null;

  const imgs = car.images?.length ? car.images : ['https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Car info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <div className="card overflow-hidden">
            <img src={imgs[activeImg]} alt={`${car.brand} ${car.model}`} className="w-full h-72 sm:h-96 object-cover" />
            {imgs.length > 1 && (
              <div className="flex gap-2 p-3">
                {imgs.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === activeImg ? 'border-primary-500' : 'border-transparent'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Car details */}
          <div className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{car.brand} {car.model}</h1>
                <p className="text-gray-500">{car.year} · <span className="capitalize">{car.category}</span></p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary-600">${car.pricePerDay}<span className="text-sm text-gray-400 font-normal">/day</span></p>
                {car.rating > 0 && (
                  <div className="flex items-center gap-1 justify-end text-sm text-gray-600">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {car.rating.toFixed(1)} ({car.totalRatings} reviews)
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
              <MapPin className="w-4 h-4" /> {car.location}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { icon: Users, label: 'Seats', value: `${car.seats} seats` },
                { icon: Fuel, label: 'Fuel', value: car.fuelType },
                { icon: Settings, label: 'Transmission', value: car.transmission },
                { icon: Calendar, label: 'Mileage', value: `${car.mileage?.toLocaleString()} km` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                  <Icon className="w-5 h-5 text-primary-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{value}</p>
                </div>
              ))}
            </div>

            {car.description && (
              <div className="mb-5">
                <h3 className="font-semibold text-gray-900 mb-2">About this car</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{car.description}</p>
              </div>
            )}

            {car.features?.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {car.features.map((f, i) => (
                    <span key={i} className="flex items-center gap-1.5 bg-primary-50 text-primary-700 text-xs font-medium px-3 py-1.5 rounded-full">
                      <CheckCircle className="w-3 h-3" /> {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Owner info */}
          {car.owner && (
            <div className="card p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {car.owner.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{car.owner.name}</p>
                <p className="text-sm text-gray-500">{car.owner.email}</p>
                {car.owner.phone && <p className="text-sm text-gray-500">{car.owner.phone}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Right: Booking form */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-20">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Book This Car</h2>
            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Pickup Location</label>
                <input className="input-field text-sm" value={booking.pickupLocation} onChange={e => setBooking(p => ({ ...p, pickupLocation: e.target.value }))} placeholder="Enter pickup location" required />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Drop-off Location</label>
                <input className="input-field text-sm" value={booking.dropoffLocation} onChange={e => setBooking(p => ({ ...p, dropoffLocation: e.target.value }))} placeholder="Enter drop-off location" required />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Pickup Date</label>
                <input type="date" className="input-field text-sm" min={new Date().toISOString().split('T')[0]} value={booking.pickupDate} onChange={e => setBooking(p => ({ ...p, pickupDate: e.target.value }))} required />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Return Date</label>
                <input type="date" className="input-field text-sm" min={booking.pickupDate || new Date().toISOString().split('T')[0]} value={booking.returnDate} onChange={e => setBooking(p => ({ ...p, returnDate: e.target.value }))} required />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Notes (optional)</label>
                <textarea className="input-field text-sm resize-none" rows={2} value={booking.notes} onChange={e => setBooking(p => ({ ...p, notes: e.target.value }))} placeholder="Any special requests?" />
              </div>

              {totalDays() > 0 && (
                <div className="bg-primary-50 rounded-xl p-4 space-y-1.5">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>${car.pricePerDay}/day × {totalDays()} days</span>
                    <span>${car.pricePerDay * totalDays()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 border-t border-primary-100 pt-1.5">
                    <span>Total</span>
                    <span className="text-primary-600">${car.pricePerDay * totalDays()}</span>
                  </div>
                </div>
              )}

              <button type="submit" disabled={submitting || !car.isAvailable} className="btn-primary w-full text-center disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? 'Booking...' : !car.isAvailable ? 'Not Available' : 'Book Now'}
              </button>

              {!user && <p className="text-xs text-center text-gray-400">You need to <button type="button" onClick={() => navigate('/login')} className="text-primary-600 font-medium">login</button> to book</p>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
