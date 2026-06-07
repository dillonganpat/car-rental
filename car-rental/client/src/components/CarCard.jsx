import { Link } from 'react-router-dom';
import { MapPin, Users, Fuel, Settings, Star } from 'lucide-react';

export default function CarCard({ car }) {
  const img = car.images?.[0] || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80';

  return (
    <Link to={`/cars/${car._id}`} className="card group hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <div className="relative overflow-hidden h-48">
        <img src={img} alt={`${car.brand} ${car.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-full capitalize">{car.category}</span>
        </div>
        {!car.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white text-sm font-bold px-4 py-1.5 rounded-full">Unavailable</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-gray-900">{car.brand} {car.model}</h3>
            <p className="text-sm text-gray-500">{car.year}</p>
          </div>
          {car.rating > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-medium">{car.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <MapPin className="w-3 h-3" />
          <span>{car.location}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Users className="w-3.5 h-3.5 text-gray-400" />{car.seats} seats
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Fuel className="w-3.5 h-3.5 text-gray-400" /><span className="capitalize">{car.fuelType}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Settings className="w-3.5 h-3.5 text-gray-400" /><span className="capitalize">{car.transmission.slice(0, 4)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-primary-600">${car.pricePerDay}</span>
            <span className="text-sm text-gray-400">/day</span>
          </div>
          <span className="text-xs font-medium text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full group-hover:bg-primary-100 transition-colors">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
}
