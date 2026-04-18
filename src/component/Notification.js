import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimes, FaClock } from 'react-icons/fa';
import './Notification.css';

const Notification = ({ message, type = 'success', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setIsVisible(true);

    // Auto-hide after duration
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="notification-icon success" />;
      case 'error':
        return <FaTimes className="notification-icon error" />;
      case 'info':
        return <FaClock className="notification-icon info" />;
      default:
        return <FaCheckCircle className="notification-icon success" />;
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`notification-container ${isExiting ? 'exiting' : 'entering'}`}>
      <div className={`notification ${type}`}>
        <div className="notification-content">
          {getIcon()}
          <span className="notification-message">{message}</span>
        </div>
        <button 
          className="notification-close"
          onClick={handleClose}
          aria-label="Close notification"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

export default Notification;
