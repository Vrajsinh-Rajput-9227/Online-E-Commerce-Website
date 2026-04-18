// src/pages/UserOrderHistory.js
import React, { useState, useEffect, useCallback, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBox, FaTruck, FaCheckCircle, FaClock, FaTimes } from 'react-icons/fa';
import { useOrder } from '../context/OrderContext';
import { formatPrice } from '../utils/priceFormatter';
import Notification from '../component/Notification';
import './UserOrderHistory.css';

function UserOrderHistory() {
  const navigate = useNavigate();
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [notification, setNotification] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  const { orders, loading, error, getUserOrders, cancelOrder } = useOrder();

  useEffect(() => {
    const loadOrders = async () => {
      try {
        await getUserOrders(1, 10, statusFilter);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadOrders();
  }, []); // Only run once on mount

  useEffect(() => {
    if (statusFilter) {
      const loadOrders = async () => {
        try {
          await getUserOrders(1, 10, statusFilter);
        } catch (error) {
          console.error('Error loading orders:', error);
        }
      };

      loadOrders();
    }
  }, [statusFilter, getUserOrders]); // Run when filter changes

  // Order status helper
  const getOrderStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <FaCheckCircle className="status-icon delivered" />;
      case 'shipped':
        return <FaTruck className="status-icon shipped" />;
      case 'processing':
        return <FaClock className="status-icon processing" />;
      case 'confirmed':
        return <FaBox className="status-icon confirmed" />;
      case 'cancelled':
        return <FaTimes className="status-icon cancelled" />;
      default:
        return <FaBox className="status-icon pending" />;
    }
  };

  // Check if order can be cancelled
  const canCancelOrder = (status) => {
    return ['pending', 'confirmed'].includes(status);
  };

  // Handle order cancellation
  const handleCancelOrder = async (orderId) => {
    const order = orders.find(o => o._id === orderId || o.id === orderId);
    
    if (window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      try {
        await cancelOrder(orderId, 'Customer requested cancellation');
        
        // Show success notification
        setNotification({
          message: `Order cancelled successfully! Your refund of ${formatPrice(order?.total || 0)} will be processed within 24 hours.`,
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
      const id = typeof orderId === 'string' ? orderId : orderId?._id || orderId?.id || '';
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Handle status filter with debounce
  const handleStatusFilter = useCallback((status) => {
    // Add small delay to prevent rapid changes
    setTimeout(() => {
      setStatusFilter(status);
    }, 100);
  }, []);

  if (loading || isInitialLoading) {
    return (
      <div className="user-order-history">
        <div className="loading-section">
          <div className="loading-spinner"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-order-history">
      <div className="page-header">
        <h1>My Order History</h1>
        <p className="page-description">View and track all your orders in one place</p>
        
        {/* Status Filter */}
        <div className="status-filters">
          <button 
            className={`filter-btn ${statusFilter === '' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('')}
          >
            All Orders
          </button>
          <button 
            className={`filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('pending')}
          >
            Pending
          </button>
          <button 
            className={`filter-btn ${statusFilter === 'confirmed' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('confirmed')}
          >
            Confirmed
          </button>
          <button 
            className={`filter-btn ${statusFilter === 'processing' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('processing')}
          >
            Processing
          </button>
          <button 
            className={`filter-btn ${statusFilter === 'shipped' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('shipped')}
          >
            Shipped
          </button>
          <button 
            className={`filter-btn ${statusFilter === 'delivered' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('delivered')}
          >
            Delivered
          </button>
          <button 
            className={`filter-btn ${statusFilter === 'cancelled' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('cancelled')}
          >
            Cancelled
          </button>
        </div>
      </div>
      
      {orders && Array.isArray(orders) && orders.length > 0 && !loading && !isInitialLoading ? (
        <div className="orders-list">
          {orders.map((order, index) => {
            if (!order) return null; // Skip null/undefined orders
            const orderId = order?._id || order?.id || `order-${index}`;
            const orderStatus = order?.orderStatus || order?.status || 'pending';
            const orderDate = order?.createdAt || order?.date || new Date();
            
            return (
            <div key={orderId} className="o-order-item">
              <div className="order-header">
                <div>
                  <h3>Order #{order.orderNumber || orderId}</h3>
                  <p className="order-date">{formatDate(orderDate)}</p>
                  <p className="order-items-count">{order.items?.length || 0} items</p>
                </div>
                <div className="order-info">
                  <div className="order-status">
                    {getOrderStatusIcon(orderStatus)}
                    <span className={`status-text ${orderStatus?.toLowerCase()}`}>
                      {orderStatus}
                    </span>
                  </div>
                  <p className="order-total">{formatPrice(order.total)}</p>
                </div>
              </div>
              {order.items && order.items.length > 0 && (
                <div className="order-items-preview">
                  {(expandedOrders.has(orderId) ? order.items : order.items.slice(0, 3)).map((item, index) => (
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
                      onClick={() => toggleOrderExpansion(orderId)}
                    >
                      {expandedOrders.has(orderId) ? `Show less` : `+${order.items.length - 3} more`}
                    </div>
                  )}
                </div>
              )}
              <div className="order-actions">
                <button 
                  className="view-order-btn"
                  onClick={() => navigate(`/order/${orderId}`)}
                >
                  View Details
                </button>
                <button 
                  className="view-order-btn"
                  onClick={() => navigate(`/order-slip/${orderId}`)}
                  style={{
                    marginLeft: '5px'
                  }}
                >
                  View Slip
                </button>
                <button 
                  className="track-order-btn"
                  onClick={() => navigate(`/track-order?order=${order.orderNumber || orderId}`)}
                >
                  Track Order
                </button>
                {canCancelOrder(orderStatus) && (
                  <button 
                    className="cancel-order-btn"
                    onClick={() => handleCancelOrder(orderId)}
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
            );
          })}
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
      
      {/* Error Message */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}
      
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
}

export default memo(UserOrderHistory);
