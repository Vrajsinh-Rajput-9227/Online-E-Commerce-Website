import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaShoppingBag, FaMapMarkerAlt, FaCreditCard, FaTruck, FaHome, FaShoppingCart } from 'react-icons/fa';
import { useOrder } from '../context/OrderContext';
import { formatPrice } from '../utils/priceFormatter';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getOrderById } = useOrder();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      const orderFromState = location.state?.order;
      
      if (orderFromState) {
        // If we have order data from state, use it directly
        if (orderFromState._id) {
          // It's a full order object from API
          setOrder(orderFromState);
        } else if (orderFromState.data?.order) {
          // It's wrapped in a data object
          setOrder(orderFromState.data.order);
        } else {
          // Fallback for local order objects
          setOrder(orderFromState);
        }
        setLoading(false);
      } else {
        // Try to get order from URL params or recent order
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [location.state, getOrderById]);

  const handleContinueShopping = () => {
    navigate('/products');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-not-found">
        <h2>Order Not Found</h2>
        <p>We couldn't find your order details. Please check your order history or contact support.</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Back to Home
        </button>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate functions for order summary
  const calculateShipping = () => {
    return 0; // Free shipping
  };

  const calculateTax = () => {
    return 0; // Free taxes
  };

  const calculateSubtotal = () => {
    if (!order.items) return 0;
    return order.items.reduce((total, item) => 
      total + (item.price * (item.quantity || 1)), 0);
  };

  const calculateTotalWithTax = () => {
    const subtotal = calculateSubtotal();
    const shipping = calculateShipping();
    const tax = calculateTax();
    return subtotal + shipping + tax;
  };

  return (
    <div className="order-confirmation">
      <div className="confirmation-header">
        <div className="success-message">
          <FaCheckCircle className="success-icon" />
          <h1>Thank you for your order!</h1>
        </div>
        <p className="order-number">Order #{order.orderNumber || order.id}</p>
        <p className="confirmation-message">
          We've received your order and it's being processed. You'll receive a confirmation email shortly.
        </p>
      </div>

      <div className="order-details">
        <div className="order-summary">
          <h2><FaShoppingBag /> Order Summary</h2>
          <div className="order-items">
            {order.items?.map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-image">
                  <img 
                    src={item.product?.images?.[0] || item.image} 
                    alt={item.name || item.product?.name} 
                    className="product-thumbnail"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                </div>
                <div className="item-details">
                  <h4>{item.name || item.product?.name}</h4>
                  <p className="item-price">{formatPrice((item.price || item.product?.price) * (item.quantity || 1))}</p>
                  {item.color && (
                    <p className="item-color">Color: <span className="color-name">{item.color}</span></p>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="order-totals">
            <div className="total-row">
              <span>{order.items?.reduce((acc, item) => acc + (item.quantity || 1), 0) || 0} item{(order.items?.reduce((acc, item) => acc + (item.quantity || 1), 0) || 0) !== 1 ? 's' : ''}</span>
              <span>{formatPrice(order.subtotal || calculateSubtotal())}</span>
            </div>
            <div className="total-row">
              <span>Shipping</span>
              <span>{order.shippingCost || order.shipping ? formatPrice(order.shippingCost || order.shipping) : 'Free'}</span>
            </div>
            <div className="total-row tax-row">
              <span>Taxes</span>
              <span>{order.tax ? formatPrice(order.tax) : 'Free'}</span>
            </div>
            <div className="total-row grand-total">
              <span>Grand Total</span>
              <span>{formatPrice(order.total || calculateTotalWithTax())}</span>
            </div>
          </div>
        </div>

        <div className="order-info">
          <div className="info-card">
            <h3><FaMapMarkerAlt /> Shipping Address</h3>
            {typeof order.shippingAddress === 'object' ? (
              <p>
                {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
            ) : (
              <p>{order.shippingAddress}</p>
            )}
          </div>
          
          <div className="info-card">
            <h3><FaCreditCard /> Payment Method</h3>
            <p>
              {order.paymentMethod === 'credit_card' ? 'Credit Card' : 
               order.paymentMethod === 'debit_card' ? 'Debit Card' :
               order.paymentMethod === 'paypal' ? 'PayPal' : 
               order.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' :
               order.paymentMethod === 'credit-card' ? 'Credit Card' : 
               order.paymentMethod === 'paypal' ? 'PayPal' : 
               'Cash on Delivery'}
            </p>
            <p className="payment-status">
              Status: <span className={`status ${order.paymentStatus || 'pending'}`}>
                {order.paymentStatus === 'completed' ? 'Completed' :
                 order.paymentStatus === 'processing' ? 'Processing' :
                 order.paymentStatus === 'failed' ? 'Failed' :
                 order.paymentStatus === 'refunded' ? 'Refunded' : 'Pending'}
              </span>
            </p>
          </div>
          
          <div className="info-card">
            <h3><FaTruck /> Order Status</h3>
            <div className="status-timeline">
              <div className={`status-step ${['pending', 'confirmed', 'processing', 'shipped', 'delivered'].includes(order.orderStatus) ? 'active' : ''}`}>
                <div className="status-dot"></div>
                <div className="status-text">
                  <p>Order Placed</p>
                  <small>{formatDate(order.createdAt || order.date)}</small>
                </div>
              </div>
              <div className={`status-step ${['confirmed', 'processing', 'shipped', 'delivered'].includes(order.orderStatus) ? 'active' : ''}`}>
                <div className="status-dot"></div>
                <div className="status-text">
                  <p>Confirmed</p>
                  <small>{order.orderStatus === 'confirmed' ? 'Current Status' : 'Completed'}</small>
                </div>
              </div>
              <div className={`status-step ${['processing', 'shipped', 'delivered'].includes(order.orderStatus) ? 'active' : ''}`}>
                <div className="status-dot"></div>
                <div className="status-text">
                  <p>Processing</p>
                  <small>{order.orderStatus === 'processing' ? 'Current Status' : order.orderStatus === 'shipped' || order.orderStatus === 'delivered' ? 'Completed' : 'Pending'}</small>
                </div>
              </div>
              <div className={`status-step ${['shipped', 'delivered'].includes(order.orderStatus) ? 'active' : ''}`}>
                <div className="status-dot"></div>
                <div className="status-text">
                  <p>Shipped</p>
                  <small>{order.orderStatus === 'shipped' ? 'Current Status' : order.orderStatus === 'delivered' ? 'Completed' : 'Not yet shipped'}</small>
                </div>
              </div>
              <div className={`status-step ${order.orderStatus === 'delivered' ? 'active' : ''}`}>
                <div className="status-dot"></div>
                <div className="status-text">
                  <p>Delivered</p>
                  <small>{order.orderStatus === 'delivered' ? formatDate(order.actualDelivery || new Date().toISOString()) : 'Estimated: ' + formatDate(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString())}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="confirmation-actions">
        <button onClick={handleContinueShopping} className="btn-primary">
          <FaShoppingCart /> Continue Shopping
        </button>
        <button onClick={() => navigate('/')} className="btn-secondary">
          <FaHome /> Back to Home
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
