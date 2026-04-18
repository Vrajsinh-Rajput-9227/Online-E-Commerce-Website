import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';
import { FaShoppingCart, FaTrash, FaBox, FaTruck, FaCheckCircle, FaClock, FaHeart, FaTimes } from 'react-icons/fa';
import Notification from '../component/Notification';
import profileService from '../services/profileService';
import WishlistService from '../services/wishlistService';
import CartService from '../services/cartService';
import './Account.css';

const Account = () => {
  const { user, logout } = useAuth();
  const { orders, loading: ordersLoading, getUserOrders, cancelOrder } = useOrder();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [notification, setNotification] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  // Load profile data from MongoDB
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await profileService.getProfile();
        if (response.success) {
          setFormData(response.data.profile);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setNotification({
          message: error.message || 'Failed to load profile data',
          type: 'error'
        });
      } finally {
        setProfileLoading(false);
      }
    };

    if (user) {
      loadProfile();
    }
  }, [user]);

  // Load orders from API and wishlist from database
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load real orders from API
        await getUserOrders(1, 10, '');
        
        // Load wishlist from database
        const wishlistData = await WishlistService.getWishlist();
        setWishlist(wishlistData.wishlist);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Listen for wishlist updates
    const handleWishlistUpdate = () => {
      loadData();
    };

    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    return () => window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
  }, [getUserOrders, user]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setEditMode(false);
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await profileService.updateProfile(formData);
      if (response.success) {
        setNotification({
          message: 'Profile updated successfully!',
          type: 'success'
        });
        setEditMode(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setNotification({
        message: error.message || 'Failed to update profile',
        type: 'error'
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Wishlist functions
  const removeFromWishlist = async (productId) => {
    try {
      await WishlistService.removeFromWishlist(productId);
      const updatedWishlist = wishlist.filter(item => item.id !== productId);
      setWishlist(updatedWishlist);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const addToCart = async (product) => {
    try {
      await CartService.addToCart(product.id, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  // Order status helper
  const getOrderStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <FaCheckCircle className="status-icon delivered" />;
      case 'shipped':
        return <FaTruck className="status-icon shipped" />;
      case 'processing':
        return <FaClock className="status-icon processing" />;
      case 'cancelled':
        return <FaTimes className="status-icon cancelled" />;
      default:
        return <FaBox className="status-icon pending" />;
    }
  };

  // Check if order can be cancelled
  const canCancelOrder = (status) => {
    return ['pending', 'confirmed', 'Processing'].includes(status);
  };

  // Handle order cancellation from account page
  const handleCancelOrder = async (orderId) => {
    const order = orders.find(o => o._id === orderId || o.id === orderId);
    
    if (window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      try {
        // Use the order service to cancel the order
        await cancelOrder(orderId, 'Customer requested cancellation');
        
        // Show refund notification
        setNotification({
          message: `Order cancelled successfully! Your refund of ₹${order?.total?.toLocaleString() || '0'} will be processed within 24 hours.`,
          type: 'success'
        });
      } catch (error) {
        console.error('Error cancelling order:', error);
        setNotification({
          message: error.message || 'Failed to cancel order. Please try again.',
          type: 'error'
        });
      }
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Toggle expanded state for order items
  const toggleOrderExpansion = (orderId) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  if (!user) {
    return (
      <div className="account-page">
        <div className="account-container">
          <div className="login-prompt">
            <h2>Please Login to Access Your Account</h2>
            <p>You need to be logged in to view your account information.</p>
            <Link to="/login" className="login-btn">Login</Link>
            <p>Don't have an account? <Link to="/register">Register here</Link></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="account-page">
      <div className="account-container">
        <div className="account-sidebar">
          <div className="user-info">
            <div className="user-avatar">
              <span className="avatar-text">{user.name.charAt(0).toUpperCase()}</span>
            </div>
            <h3>{user.name}</h3>
            <p>{user.email}</p>
          </div>
          
          <nav className="account-nav">
            <button
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => handleTabChange('profile')}
            >
              Profile Information
            </button>
            <button
              className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => handleTabChange('orders')}
            >
              Order History
            </button>
            <button
              className={`nav-item ${activeTab === 'wishlist' ? 'active' : ''}`}
              onClick={() => handleTabChange('wishlist')}
            >
              Wishlist
            </button>
            <button
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => handleTabChange('settings')}
            >
              Account Settings
            </button>
            <button className="nav-item logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </nav>
        </div>

        <div className="account-content">
          {activeTab === 'profile' && (
            <div className="p-profile-section">
              <div className="section-header">
                <h2>Profile Information</h2>
                <button 
                  className="e-edit-btn"
                  onClick={handleEditToggle}
                  disabled={profileLoading}
                >
                  {editMode ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
              
              {profileLoading ? (
                <div className="loading-section">
                  <div className="loading-spinner"></div>
                  <p>Loading profile information...</p>
                </div>
              ) : (
                <>
                {editMode ? (
                <form className="profile-form" onSubmit={handleSaveProfile}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Address</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>State</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Zip Code</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <button type="submit" className="save-btn">Save Changes</button>
                </form>
              ) : (
                <div className="profile-display">
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Full Name</label>
                      <p>{user.name}</p>
                    </div>
                    <div className="info-item">
                      <label>Email</label>
                      <p>{user.email}</p>
                    </div>
                    <div className="info-item">
                      <label>Phone</label>
                      <p>{formData.phone || 'Not provided'}</p>
                    </div>
                    <div className="info-item">
                      <label>Address</label>
                      <p>{formData.address || 'Not provided'}</p>
                    </div>
                    <div className="info-item">
                      <label>City</label>
                      <p>{formData.city || 'Not provided'}</p>
                    </div>
                    <div className="info-item">
                      <label>State</label>
                      <p>{formData.state || 'Not provided'}</p>
                    </div>
                    <div className="info-item">
                      <label>Zip Code</label>
                      <p>{formData.zipCode || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              )}
                </>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="orders-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Order History</h2>
                <Link 
                  to="/account/orders" 
                  style={{
                    backgroundColor: '#667eea',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  View Full Order History
                </Link>
              </div>
              {isLoading || ordersLoading ? (
                <div className="loading-section">
                  <div className="loading-spinner"></div>
                  <p>Loading your orders...</p>
                </div>
              ) : orders.length > 0 ? (
                <div className="orders-list">
                  {orders.map(order => (
                    <div key={order._id || order.id} className="o-order-item">
                      <div className="order-header">
                        <div>
                          <h3>Order #{order.orderNumber || order._id || order.id}</h3>
                          <p className="order-date">{formatDate(order.createdAt || order.date)}</p>
                          <p className="order-items-count">{order.items?.length || 0} items</p>
                        </div>
                        <div className="order-info">
                          <div className="order-status">
                            {getOrderStatusIcon(order.orderStatus || order.status)}
                            <span className={`status-text ${(order.orderStatus || order.status).toLowerCase()}`}>
                              {order.orderStatus || order.status}
                            </span>
                          </div>
                          <p className="order-total">₹{order.total?.toLocaleString()}</p>
                        </div>
                      </div>
                      {order.items && order.items.length > 0 && (
                        <div className="order-items-preview">
                          {(expandedOrders.has(order._id || order.id) ? order.items : order.items.slice(0, 3)).map((item, index) => (
                            <div key={index} className="order-item-preview">
                              <img 
                                src={item.product?.images?.[0] || item.image || `https://picsum.photos/seed/product${index}/50/50.jpg`} 
                                alt={item.name || item.product?.name}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/50x50?text=No+Image';
                                }}
                              />
                              <span>{item.name || item.product?.name}</span>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div 
                              className="more-items clickable"
                              onClick={() => toggleOrderExpansion(order._id || order.id)}
                            >
                              {expandedOrders.has(order._id || order.id) ? `Show less` : `+${order.items.length - 3} more`}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="order-actions">
                        <button 
                          className="view-order-btn"
                          onClick={() => navigate(`/order/${order._id || order.id}`)}
                        >
                          View Details
                        </button>
                        <button 
                          className="view-order-btn"
                          onClick={() => navigate(`/order-slip/${order._id || order.id}`)}
                          style={{
                            // backgroundColor: '#3b82f6',
                            marginLeft: '5px'
                          }}
                        >
                          View Slip
                        </button>
                        <button 
                          className="track-order-btn"
                          onClick={() => navigate(`/track-order?order=${order.orderNumber || order._id || order.id}`)}
                        >
                          Track Order
                        </button>
                        {canCancelOrder(order.orderStatus || order.status) && (
                          <button 
                            className="cancel-order-btn"
                            onClick={() => handleCancelOrder(order._id || order.id)}
                            style={{
                              backgroundColor: '#ef4444',
                              color: 'white',
                              border: 'none',
                              padding: '8px 16px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <FaTimes /> Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-orders">
                  <FaBox className="empty-icon" />
                  <h3>No Orders Yet</h3>
                  <p>You haven't placed any orders yet. Start shopping to see your order history here.</p>
                  <Link to="/products" className="shop-now-btn">
                    Shop Now
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="wishlist-section">
              <h2>My Wishlist</h2>
              {isLoading ? (
                <div className="loading-section">
                  <div className="loading-spinner"></div>
                  <p>Loading your wishlist...</p>
                </div>
              ) : wishlist.length > 0 ? (
                <div className="wishlist-grid">
                  {wishlist.map(item => (
                    <div key={item.id} className="w-wishlist-item">
                      <div className="w-wishlist-image">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/200x200?text=No+Image';
                          }}
                        />
                        {/* {item.discount > 0 && (
                          <span className="sale-badge">-{item.discount}%</span>
                        )} */}
                      </div>
                      <div className="wishlist-info">
                        <h3>{item.name}</h3>
                        <p className="wishlist-category">{item.category}</p>
                        <div className="wishlist-price">
                          <span className="current-price">₹{item.price?.toLocaleString()}</span>
                          {item.originalPrice > item.price && (
                            <span className="original-price">₹{item.originalPrice?.toLocaleString()}</span>
                          )}
                        </div>
                        {/* <div className="wishlist-rating">
                          <span className="stars">{'★'.repeat(Math.floor(item.rating || 0))}</span>
                          <span className="rating-text">({item.reviews || 0} reviews)</span>
                        </div> */}
                      </div>
                      <div className="wishlist-actions">
                        <button 
                          className="add-to-cart-btn"
                          onClick={() => addToCart(item)}
                        >
                          <FaShoppingCart /> Add to Cart
                        </button>
                        <button 
                          className="remove-wishlist-btn"
                          onClick={() => removeFromWishlist(item.id)}
                          aria-label="Remove from wishlist"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-wishlist">
                  <FaHeart className="empty-icon" />
                  <h3>Your Wishlist is Empty</h3>
                  <p>Start adding items you love to your wishlist!</p>
                  <Link to="/products" className="browse-products-btn">
                    Browse Products
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-section">
              <h2>Account Settings</h2>
              <div className="settings-grid">
                <div className="setting-item">
                  <h3>Change Password</h3>
                  <p>Update your account password</p>
                  <button className="setting-btn">Change Password</button>
                </div>
                <div className="setting-item">
                  <h3>Email Preferences</h3>
                  <p>Manage your email notification settings</p>
                  <button className="setting-btn">Manage Preferences</button>
                </div>
                <div className="setting-item">
                  <h3>Privacy Settings</h3>
                  <p>Control your privacy and data settings</p>
                  <button className="setting-btn">Privacy Settings</button>
                </div>
                <div className="setting-item">
                  <h3>Delete Account</h3>
                  <p>Permanently delete your account and data</p>
                  <button className="setting-btn danger">Delete Account</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Notification Component */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default Account;
