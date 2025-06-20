import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';
import UserBookingsPage from './pages/UserBookingsPage';
import ListingDetailPage from './pages/ListingDetailPage';
import PaymentForm from './components/PaymentForm';
import Bookingidpage from './pages/Bookingidpage';
import HostDashboardPage from './pages/HostDashboardpage';
import ListingMap from './components/ListingMap';

if ('serviceWorker' in navigator) {
  console.log("ram");
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful:', registration.scope);
      })
      .catch(err => {
        console.log('ServiceWorker registration failed:', err);
      });
  });
}



function Layout() {
  return (
    <div className="min-h-screen bg-red-100">
      <div className="container mx-auto px-4 py-8 bg-white min-h-[calc(100vh-4rem)]">
        <Outlet />
      </div>
    </div>
  );
}



function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage  />} />
          <Route  element={<Layout />}>
            <Route path="/listings/:id" element={<ListingDetailPage />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/host/dashboard" element={<HostDashboardPage />} />
            <Route path="/my-bookings" element={<UserBookingsPage />} />
            <Route path="/bookings/:id" element={<Bookingidpage />} />
            <Route path="/payment" element={<PaymentForm />} />
          </Route>
           <Route path="/map" element={<ListingMap />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;