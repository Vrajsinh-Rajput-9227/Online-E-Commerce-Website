import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
// import ProductList from './component/ProductList';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Footer from './component/Footer';
import Header from './component/Header';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OrderProvider } from './context/OrderContext';
import './App.css';
import About from './pages/About';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Payment from './pages/Payment';
import OrderConfirmation from './pages/OrderConfirmation';
import CategoryPage from './pages/CategoryPage';
import FAQ from './pages/FAQ';
import Shipping from './pages/Shipping';
import Returns from './pages/Returns';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import SearchResults from './pages/SearchResults';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ChatWidget from './component/ChatWidget';
import TrackOrder from './pages/TrackOrder';
import Account from './pages/Account';
import Information from './pages/Information';
import OrderDetail from './pages/OrderDetail';
import OrderSlip from './pages/OrderSlip';
// import BookingHistory from './pages/BookingHistory';
import UserOrderHistory from './pages/UserOrderHistory';
// Admin imports
import { AdminLayout, AdminDashboard, AdminLogin, AdminProducts, AdminOrders, AdminPayments, AdminCustomers, AdminInventory, AdminMessages, AdminNotifications, AdminSettings, AdminAnalytics, AdminCategories, AdminProfile } from './admin';
import { AdminAuthProvider } from './context/AdminAuthContext';

// Layout wrapper for authenticated pages
const AuthenticatedLayout = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #f3f3f3', 
          borderTop: '4px solid #3498db', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }}></div>
        <p>Loading...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <>
      <Header />
      <main>
        {children}
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
};

// Layout wrapper for public pages
const PublicLayout = ({ children }) => {
  return (
    <>
      <Header />
      <main>
        {children}
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <OrderProvider>
        <Router>
          <div className="App">
          <Routes>
            {/* Admin Routes */}
            <Route path="/admin/login" element={
              <AdminAuthProvider>
                <AdminLogin />
              </AdminAuthProvider>
            } />
            <Route path="/admin/*" element={
              <AdminAuthProvider>
                <AdminRoutes />
              </AdminAuthProvider>
            } />
            
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/products" element={<PublicLayout><Products /></PublicLayout>} />
            <Route path="/product/:id" element={<PublicLayout><ProductDetail /></PublicLayout>} />
            <Route path="/search" element={<PublicLayout><SearchResults /></PublicLayout>} />
            <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
            <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
            <Route path="/forgot-password" element={<PublicLayout><ForgotPassword /></PublicLayout>} />
            <Route path="/track-order" element={<PublicLayout><TrackOrder /></PublicLayout>} />
            
            {/* Authenticated Routes */}
            <Route path="/cart" element={<AuthenticatedLayout><Cart /></AuthenticatedLayout>} />
            <Route path="/wishlist" element={<AuthenticatedLayout><Wishlist /></AuthenticatedLayout>} />
            <Route path="/payment" element={<AuthenticatedLayout><Payment /></AuthenticatedLayout>} />
            <Route path="/order-confirmation" element={<AuthenticatedLayout><OrderConfirmation /></AuthenticatedLayout>} />
            <Route path="/category/:category" element={<PublicLayout><CategoryPage /></PublicLayout>} />
            <Route path="/faq" element={<PublicLayout><FAQ /></PublicLayout>} />
            <Route path="/shipping" element={<AuthenticatedLayout><Shipping /></AuthenticatedLayout>} />
            <Route path="/returns" element={<PublicLayout><Returns /></PublicLayout>} />
            <Route path="/privacy" element={<PublicLayout><Privacy /></PublicLayout>} />
            <Route path="/terms" element={<PublicLayout><Terms /></PublicLayout>} />
            <Route path="/order/:orderId" element={<AuthenticatedLayout><OrderDetail /></AuthenticatedLayout>} />
            <Route path="/order-slip/:orderId" element={<AuthenticatedLayout><OrderSlip /></AuthenticatedLayout>} />
            <Route path="/account" element={<AuthenticatedLayout><Account /></AuthenticatedLayout>} />
            <Route path="/account/information" element={<AuthenticatedLayout><Information /></AuthenticatedLayout>} />
            <Route path="/account/orders" element={<AuthenticatedLayout><UserOrderHistory /></AuthenticatedLayout>} />
            {/* <Route path="/bookings" element={<AuthenticatedLayout><BookingHistory /></AuthenticatedLayout>} /> */}
          </Routes>
        </div>
      </Router>
      </OrderProvider>
    </AuthProvider>
  );
}

// Separate component for admin routes to avoid layout conflicts
const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      } />
      <Route path="/products" element={
        <AdminLayout>
          <AdminProducts />
        </AdminLayout>
      } />
      <Route path="/categories" element={
        <AdminLayout>
          <AdminCategories />
        </AdminLayout>
      } />
      <Route path="/orders" element={
        <AdminLayout>
          <AdminOrders />
        </AdminLayout>
      } />
      <Route path="/users" element={
        <AdminLayout>
          <AdminCustomers />
        </AdminLayout>
      } />
      <Route path="/customers" element={
        <AdminLayout>
          <AdminCustomers />
        </AdminLayout>
      } />
      <Route path="/inventory" element={
        <AdminLayout>
          <AdminInventory />
        </AdminLayout>
      } />
      <Route path="/analytics" element={
        <AdminLayout>
          <AdminAnalytics />
        </AdminLayout>
      } />
      <Route path="/payments" element={
        <AdminLayout>
          <AdminPayments />
        </AdminLayout>
      } />
      <Route path="/settings" element={
        <AdminLayout>
          <AdminSettings />
        </AdminLayout>
      } />
      <Route path="/profile" element={
        <AdminLayout>
          <AdminProfile />
        </AdminLayout>
      } />
      <Route path="/messages" element={
        <AdminLayout>
          <AdminMessages />
        </AdminLayout>
      } />
      <Route path="/notifications" element={
        <AdminLayout>
          <AdminNotifications />
        </AdminLayout>
      } />
    </Routes>
  );
};

export default App;