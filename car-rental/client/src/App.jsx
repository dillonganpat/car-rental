import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import CarsList from './pages/CarsList';
import CarDetails from './pages/CarDetails';
import MyBookings from './pages/MyBookings';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/owner/Dashboard';
import AddCar from './pages/owner/AddCar';
import ManageBookings from './pages/owner/ManageBookings';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useApp();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"/></div>;
  return user ? children : <Navigate to="/login" />;
};

const OwnerRoute = ({ children }) => {
  const { user, loading } = useApp();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"/></div>;
  return user?.role === 'owner' || user?.role === 'admin' ? children : <Navigate to="/" />;
};

function AppRoutes() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cars" element={<CarsList />} />
            <Route path="/cars/:id" element={<CarDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
            <Route path="/owner/dashboard" element={<OwnerRoute><Dashboard /></OwnerRoute>} />
            <Route path="/owner/add-car" element={<OwnerRoute><AddCar /></OwnerRoute>} />
            <Route path="/owner/bookings" element={<OwnerRoute><ManageBookings /></OwnerRoute>} />
          </Routes>
        </main>
        <Footer />
      </div>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}
