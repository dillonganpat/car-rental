import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Shield, Clock, ThumbsUp, ChevronRight, MapPin, Calendar } from 'lucide-react';
import { API } from '../context/AppContext';
import CarCard from '../components/CarCard';

const categories = [
  { label: 'All', value: '' },
  { label: 'Sedan', value: 'sedan' },
  { label: 'SUV', value: 'suv' },
  { label: 'Sports', value: 'sports' },
  { label: 'Luxury', value: 'luxury' },
  { label: 'Electric', value: 'electric' },
  { label: 'Van', value: 'van' },
];

const features = [
  { icon: Shield, title: 'Fully Insured', desc: 'Every rental comes with comprehensive insurance coverage.' },
  { icon: Clock, title: '24/7 Support', desc: 'Round-the-clock customer support whenever you need help.' },
  { icon: ThumbsUp, title: 'Best Prices', desc: 'Transparent pricing with no hidden fees. Ever.' },
];

export default function Home() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCars();
  }, [activeCategory]);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const params = activeCategory ? { category: activeCategory } : {};
      const { data } = await API.get('/cars', { params });
      setCars(data.cars.slice(0, 6));
    } catch {
      setCars([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/cars?location=${search}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-700 rounded-full filter blur-3xl translate-y-1/2 -translate-x-1/3" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-primary-600/20 border border-primary-500/30 rounded-full px-4 py-1.5 text-sm text-primary-300 mb-6">
              <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
              500+ Cars Available Now
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Find Your Perfect<br />
              <span className="text-primary-400">Drive Today</span>
            </h1>
            <p className="text-lg text-gray-300 mb-10 leading-relaxed">
              Browse hundreds of cars from verified owners. Book instantly, drive confidently.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex gap-3 max-w-xl">
              <div className="flex-1 relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by location..."
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white/15"
                />
              </div>
              <button type="submit" className="btn-primary px-6 py-3.5 flex items-center gap-2">
                <Search className="w-4 h-4" /> Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="w-11 h-11 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Car listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Available Cars</h2>
            <p className="text-gray-500 text-sm mt-1">Choose from our wide selection</p>
          </div>
          <button onClick={() => navigate('/cars')} className="flex items-center gap-1 text-sm text-primary-600 font-semibold hover:underline">
            View all <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap mb-8">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat.value ? 'bg-primary-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-600'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-48 bg-gray-100" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-8 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : cars.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map(car => <CarCard key={car._id} car={car} />)}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium">No cars found in this category</p>
          </div>
        )}
      </section>

      {/* CTA Banner */}
      <section className="bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Have a Car to Rent Out?</h2>
          <p className="text-primary-100 mb-8 max-w-xl mx-auto">Join our platform as an owner and start earning from your vehicle today.</p>
          <button onClick={() => navigate('/register')} className="bg-white text-primary-700 hover:bg-primary-50 font-bold py-3 px-8 rounded-xl transition-colors shadow-sm">
            Become an Owner
          </button>
        </div>
      </section>
    </div>
  );
}
