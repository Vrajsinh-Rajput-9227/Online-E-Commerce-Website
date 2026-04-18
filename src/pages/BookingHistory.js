// src/pages/BookingHistory.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useOrder } from '../context/OrderContext';
import './BookingHistory.css';

function BookingHistory() {
  const { orders, loading, getUserOrders } = useOrder();

  useEffect(() => {
    // Load real orders from database
    const loadOrders = async () => {
      try {
        await getUserOrders(1, 50, ''); // Get up to 50 orders
      } catch (error) {
        console.error('Error loading orders from database:', error);
      }
    };

    loadOrders();
  }, [getUserOrders]);

  if (loading) {
    return <div className="loading">Loading your bookings...</div>;
  }

  return (
    <div className="booking-history">
      <h1>My Bookings</h1>
      {orders.length === 0 ? (
        <div className="no-bookings">
          <p>You don't have any bookings yet.</p>
          <Link to="/products" className="browse-products-btn">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="bookings-list">
          {orders.map((order, index) => (
            <div key={order._id || order.id || index} className="booking-card">
              <div className="booking-header">
                <h3>Order #{order.orderNumber || order._id || order.id}</h3>
                <span className={`status ${(order.orderStatus || order.status).toLowerCase()}`}>
                  {order.orderStatus || order.status}
                </span>
              </div>
              <div className="booking-details">
                <div className="booking-date">
                  <strong>Date:</strong> {new Date(order.createdAt || order.date).toLocaleDateString()}
                </div>
                <div className="booking-total">
                  <strong>Total:</strong> ₹{order.total?.toLocaleString()}
                </div>
              </div>
              <div className="booking-items">
                {order.items?.map((item, itemIndex) => (
                  <div key={itemIndex} className="booking-item">
                    <img 
                      src={item.product?.images?.[0] || item.image} 
                      alt={item.name || item.product?.name} 
                      className="item-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                      }}
                    />
                    <div className="item-details">
                      <h4>{item.name || item.product?.name}</h4>
                      <p>Quantity: {item.quantity}</p>
                      <p>Price: ₹{(item.price || item.product?.price)?.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BookingHistory;