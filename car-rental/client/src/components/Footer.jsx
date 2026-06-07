import { Link } from 'react-router-dom';
import { Car, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-white mb-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              DriveEasy
            </Link>
            <p className="text-sm leading-relaxed">Your trusted car rental platform. Find the perfect car for any journey.</p>
            <div className="flex gap-3 mt-4">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4 text-gray-300" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[['/', 'Home'], ['/cars', 'Browse Cars'], ['/my-bookings', 'My Bookings'], ['/register', 'Sign Up']].map(([path, label]) => (
                <li key={path}><Link to={path} className="hover:text-primary-400 transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Car Categories</h4>
            <ul className="space-y-2 text-sm">
              {['Sedan', 'SUV', 'Sports', 'Luxury', 'Electric', 'Van'].map(cat => (
                <li key={cat}><Link to={`/cars?category=${cat.toLowerCase()}`} className="hover:text-primary-400 transition-colors">{cat}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary-500 shrink-0" /> Port of Spain, Trinidad</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary-500 shrink-0" /> +1 (868) 555-0100</li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary-500 shrink-0" /> hello@driveeasy.com</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>© {new Date().getFullYear()} DriveEasy. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
