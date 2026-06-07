import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X } from 'lucide-react';
import { API } from '../../context/AppContext';
import toast from 'react-hot-toast';

const CATEGORIES = ['sedan', 'suv', 'sports', 'luxury', 'truck', 'van', 'electric'];
const FUEL_TYPES = ['petrol', 'diesel', 'electric', 'hybrid'];
const TRANSMISSIONS = ['automatic', 'manual'];
const COMMON_FEATURES = ['Air Conditioning', 'Bluetooth', 'GPS Navigation', 'Backup Camera', 'Sunroof', 'Heated Seats', 'Apple CarPlay', 'Android Auto', 'Leather Seats', 'Cruise Control'];

export default function AddCar() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [category, setCategory] = useState('sedan');
  const [pricePerDay, setPricePerDay] = useState('');
  const [seats, setSeats] = useState('');
  const [fuelType, setFuelType] = useState('petrol');
  const [transmission, setTransmission] = useState('automatic');
  const [mileage, setMileage] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  const handleImgChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const removeImage = (i) => {
    setImages(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const toggleFeature = (f) => {
    setSelectedFeatures(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!brand || !model || !pricePerDay || !seats || !location) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('brand', brand);
      formData.append('model', model);
      formData.append('year', year);
      formData.append('category', category);
      formData.append('pricePerDay', pricePerDay);
      formData.append('seats', seats);
      formData.append('fuelType', fuelType);
      formData.append('transmission', transmission);
      formData.append('mileage', mileage);
      formData.append('description', description);
      formData.append('location', location);
      formData.append('features', JSON.stringify(selectedFeatures));
      images.forEach(img => formData.append('images', img));

      await API.post('/cars', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Car listed successfully!');
      navigate('/owner/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add car');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">List a New Car</h1>
        <p className="text-gray-500 text-sm mt-1">Fill in your car details to start earning</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Photos</h2>
          <div className="flex flex-wrap gap-3 mb-3">
            {previews.map((src, i) => (
              <div key={i} className="relative w-24 h-20 rounded-xl overflow-hidden">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {previews.length < 5 && (
              <label className="w-24 h-20 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
                <Upload className="w-5 h-5 text-gray-400 mb-1" />
                <span className="text-xs text-gray-400">Add</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImgChange} />
              </label>
            )}
          </div>
          <p className="text-xs text-gray-400">Upload up to 5 photos. First photo is the cover.</p>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Brand *</label>
              <input className="input-field" value={brand} onChange={e => setBrand(e.target.value)} placeholder="e.g. Toyota" required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Model *</label>
              <input className="input-field" value={model} onChange={e => setModel(e.target.value)} placeholder="e.g. Camry" required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Year *</label>
              <input type="number" className="input-field" value={year} onChange={e => setYear(e.target.value)} min="1990" max={new Date().getFullYear() + 1} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Category *</label>
              <select className="input-field" value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Price Per Day ($) *</label>
              <input type="number" className="input-field" value={pricePerDay} onChange={e => setPricePerDay(e.target.value)} placeholder="50" min="1" required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Number of Seats *</label>
              <input type="number" className="input-field" value={seats} onChange={e => setSeats(e.target.value)} placeholder="5" min="1" max="20" required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Fuel Type *</label>
              <select className="input-field" value={fuelType} onChange={e => setFuelType(e.target.value)}>
                {FUEL_TYPES.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Transmission *</label>
              <select className="input-field" value={transmission} onChange={e => setTransmission(e.target.value)}>
                {TRANSMISSIONS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Mileage (km)</label>
              <input type="number" className="input-field" value={mileage} onChange={e => setMileage(e.target.value)} placeholder="0" min="0" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Location *</label>
              <input className="input-field" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Port of Spain" required />
            </div>
          </div>
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
            <textarea className="input-field resize-none" rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your car..." />
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Features</h2>
          <div className="flex flex-wrap gap-2">
            {COMMON_FEATURES.map(f => (
              <button key={f} type="button" onClick={() => toggleFeature(f)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${selectedFeatures.includes(f) ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'}`}>
                {selectedFeatures.includes(f) ? '✓ ' : ''}{f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/owner/dashboard')} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-50">
            {loading ? 'Publishing...' : 'Publish Listing'}
          </button>
        </div>
      </form>
    </div>
  );
}