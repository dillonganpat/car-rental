import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { API } from '../context/AppContext';
import CarCard from '../components/CarCard';

const CATEGORIES = ['sedan', 'suv', 'sports', 'luxury', 'truck', 'van', 'electric'];
const FUEL_TYPES = ['petrol', 'diesel', 'electric', 'hybrid'];
const TRANSMISSIONS = ['automatic', 'manual'];

export default function CarsList() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    minPrice: '',
    maxPrice: '',
    seats: '',
    fuelType: '',
    transmission: '',
  });

  useEffect(() => { fetchCars(); }, [filters]);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const { data } = await API.get('/cars', { params });
      setCars(data.cars);
    } catch { setCars([]); }
    finally { setLoading(false); }
  };

  const updateFilter = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));

  const clearFilters = () => setFilters({ category: '', location: '', minPrice: '', maxPrice: '', seats: '', fuelType: '', transmission: '' });

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Browse Cars</h1>
          <p className="text-gray-500 text-sm">{loading ? '...' : `${cars.length} cars found`}</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 btn-secondary text-sm"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && <span className="w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">{activeFilterCount}</span>}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Filters</h3>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1">
                <X className="w-3.5 h-3.5" /> Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Location</label>
              <input className="input-field text-sm py-2" value={filters.location} onChange={e => updateFilter('location', e.target.value)} placeholder="Any location" />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Category</label>
              <select className="input-field text-sm py-2" value={filters.category} onChange={e => updateFilter('category', e.target.value)}>
                <option value="">All categories</option>
                {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Fuel Type</label>
              <select className="input-field text-sm py-2" value={filters.fuelType} onChange={e => updateFilter('fuelType', e.target.value)}>
                <option value="">All fuel types</option>
                {FUEL_TYPES.map(f => <option key={f} value={f} className="capitalize">{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Transmission</label>
              <select className="input-field text-sm py-2" value={filters.transmission} onChange={e => updateFilter('transmission', e.target.value)}>
                <option value="">All transmissions</option>
                {TRANSMISSIONS.map(t => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Min Seats</label>
              <input className="input-field text-sm py-2" type="number" min="1" max="15" value={filters.seats} onChange={e => updateFilter('seats', e.target.value)} placeholder="Any" />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Min Price / day</label>
              <input className="input-field text-sm py-2" type="number" min="0" value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)} placeholder="$0" />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Max Price / day</label>
              <input className="input-field text-sm py-2" type="number" min="0" value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)} placeholder="Any" />
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
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
        <div className="text-center py-24">
          <p className="text-xl font-semibold text-gray-400 mb-2">No cars found</p>
          <p className="text-gray-400 text-sm">Try adjusting your filters</p>
          <button onClick={clearFilters} className="mt-4 btn-primary">Clear Filters</button>
        </div>
      )}
    </div>
  );
}
