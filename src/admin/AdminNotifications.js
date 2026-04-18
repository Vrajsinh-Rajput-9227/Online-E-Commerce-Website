import React, { useState, useEffect } from 'react';
import { CiBellOn, CiUser, CiClock1, CiSearch, CiTrash, CiCircleCheck, CiSquareRemove, CiSettings, CiShoppingCart, CiBoxes, CiChat1, CiDollar } from "react-icons/ci";
import './AdminNotifications.css';

function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    orderAlerts: true,
    customerMessages: true,
    lowStockAlerts: true,
    systemUpdates: false
  });

  useEffect(() => {
    // Mock notifications data - replace with actual API call
    const mockNotifications = [
      {
        id: 1,
        type: 'order',
        title: 'New Order Received',
        message: 'Order #12345 has been placed by John Doe for $299.99',
        timestamp: '2024-01-10T10:30:00',
        read: false,
        priority: 'high',
        icon: CiShoppingCart,
        actionUrl: '/admin/orders/12345'
      },
      {
        id: 2,
        type: 'inventory',
        title: 'Low Stock Alert',
        message: 'Product "Wireless Headphones" is running low on stock (5 units remaining)',
        timestamp: '2024-01-10T09:15:00',
        read: false,
        priority: 'high',
        icon: CiBoxes,
        actionUrl: '/admin/inventory'
      },
      {
        id: 3,
        type: 'message',
        title: 'New Customer Message',
        message: 'Sarah Smith sent a message regarding product inquiry',
        timestamp: '2024-01-10T08:45:00',
        read: true,
        priority: 'medium',
        icon: CiChat1,
        actionUrl: '/admin/messages'
      },
      {
        id: 4,
        type: 'payment',
        title: 'Payment Received',
        message: 'Payment of $149.99 received for order #12344',
        timestamp: '2024-01-09T16:20:00',
        read: true,
        priority: 'low',
        icon: CiDollar,
        actionUrl: '/admin/orders/12344'
      },
      {
        id: 5,
        type: 'system',
        title: 'System Update',
        message: 'System maintenance scheduled for tonight at 2:00 AM',
        timestamp: '2024-01-09T14:30:00',
        read: true,
        priority: 'low',
        icon: CiSettings,
        actionUrl: null
      }
    ];
    setNotifications(mockNotifications);
  }, []);

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'unread' && !notification.read) ||
                         (filter === 'read' && notification.read) ||
                         (filter === 'high' && notification.priority === 'high') ||
                         (filter === notification.type);
    
    return matchesSearch && matchesFilter;
  });

  const handleSelectNotification = (notification) => {
    setSelectedNotification(notification);
    setNotifications(prev => prev.map(notif => 
      notif.id === notification.id ? { ...notif, read: true } : notif
    ));
  };

  const handleMarkAsRead = (notificationId) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
  };

  const handleMarkAsUnread = (notificationId) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === notificationId ? { ...notif, read: false } : notif
    ));
  };

  const handleDelete = (notificationId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    if (selectedNotification?.id === notificationId) {
      setSelectedNotification(null);
    }
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const handleDeleteAllRead = () => {
    setNotifications(prev => prev.filter(notif => !notif.read));
    setSelectedNotification(null);
  };

  const handleSettingsSave = () => {
    // Mock settings save - replace with actual API call
    alert('Notification settings saved successfully!');
    setShowSettings(false);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      order: '#3498db',
      inventory: '#e74c3c',
      message: '#f39c12',
      payment: '#27ae60',
      system: '#9b59b6'
    };
    return colors[type] || '#95a5a6';
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="admin-notifications">
      <div className="notifications-header">
        <div className="header-left">
          <h1>Notifications</h1>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </div>
        <div className="header-actions">
          <button 
            className="settings-btn"
            onClick={() => setShowSettings(true)}
          >
            <CiSettings size={18} />
            Settings
          </button>
          <button 
            className="mark-all-read-btn"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            <CiCircleCheck size={18} />
            Mark All Read
          </button>
          <button 
            className="delete-read-btn"
            onClick={handleDeleteAllRead}
            disabled={notifications.filter(n => n.read).length === 0}
          >
            <CiTrash size={18} />
            Delete Read
          </button>
        </div>
      </div>

      <div className="notifications-container">
        {/* Notifications List */}
        <div className="notifications-list">
          <div className="notifications-controls">
            <div className="search-container">
              <CiSearch size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-buttons">
              <button 
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All ({notifications.length})
              </button>
              <button 
                className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
                onClick={() => setFilter('unread')}
              >
                Unread ({unreadCount})
              </button>
              <button 
                className={`filter-btn ${filter === 'high' ? 'active' : ''}`}
                onClick={() => setFilter('high')}
              >
                High Priority
              </button>
              <button 
                className={`filter-btn ${filter === 'order' ? 'active' : ''}`}
                onClick={() => setFilter('order')}
              >
                Orders
              </button>
              <button 
                className={`filter-btn ${filter === 'inventory' ? 'active' : ''}`}
                onClick={() => setFilter('inventory')}
              >
                Inventory
              </button>
            </div>
          </div>

          <div className="notifications-list-content">
            {filteredNotifications.length === 0 ? (
              <div className="no-notifications">
                <CiBellOn size={48} />
                <p>No notifications found</p>
              </div>
            ) : (
              filteredNotifications.map(notification => {
                const Icon = notification.icon;
                return (
                  <div
                    key={notification.id}
                    className={`notification-item ${selectedNotification?.id === notification.id ? 'selected' : ''} ${!notification.read ? 'unread' : ''}`}
                    onClick={() => handleSelectNotification(notification)}
                  >
                    <div className="notification-icon" style={{ color: getTypeColor(notification.type) }}>
                      <Icon size={20} />
                    </div>
                    <div className="notification-content">
                      <div className="notification-header">
                        <div className="notification-title">{notification.title}</div>
                        <div className="notification-meta">
                          {notification.priority === 'high' && <span className="priority-badge high">High</span>}
                          <span className="notification-time">{formatDate(notification.timestamp)}</span>
                        </div>
                      </div>
                      <div className="notification-message">{notification.message}</div>
                    </div>
                    <div className="notification-actions">
                      {!notification.read ? (
                        <button 
                          className="action-btn mark-read"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                          title="Mark as read"
                        >
                          <CiCircleCheck size={16} />
                        </button>
                      ) : (
                        <button 
                          className="action-btn mark-unread"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsUnread(notification.id);
                          }}
                          title="Mark as unread"
                        >
                          <CiSquareRemove size={16} />
                        </button>
                      )}
                      <button 
                        className="action-btn delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification.id);
                        }}
                        title="Delete"
                      >
                        <CiTrash size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Notification Detail */}
        <div className="notification-detail">
          {selectedNotification ? (
            <div className="notification-content-detail">
              <div className="notification-detail-header">
                <div className="notification-detail-icon" style={{ color: getTypeColor(selectedNotification.type) }}>
                  {React.createElement(selectedNotification.icon, { size: 24 })}
                </div>
                <div className="notification-detail-info">
                  <h3>{selectedNotification.title}</h3>
                  <div className="notification-detail-meta">
                    <span className="type-badge" style={{ backgroundColor: getTypeColor(selectedNotification.type) }}>
                      {selectedNotification.type.charAt(0).toUpperCase() + selectedNotification.type.slice(1)}
                    </span>
                    <span className="time-info">
                      <CiClock1 size={16} />
                      {new Date(selectedNotification.timestamp).toLocaleString()}
                    </span>
                    {selectedNotification.priority === 'high' && (
                      <span className="priority-badge high">High Priority</span>
                    )}
                  </div>
                </div>
                <button 
                  className="delete-btn"
                  onClick={() => handleDelete(selectedNotification.id)}
                >
                  <CiTrash size={18} />
                </button>
              </div>
              
              <div className="notification-body">
                <p>{selectedNotification.message}</p>
              </div>

              {selectedNotification.actionUrl && (
                <div className="notification-action">
                  <a href={selectedNotification.actionUrl} className="action-link">
                    View Details →
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="no-notification-selected">
              <CiBellOn size={64} />
              <p>Select a notification to view</p>
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="settings-modal">
          <div className="settings-content">
            <div className="settings-header">
              <h3>Notification Settings</h3>
              <button 
                className="close-btn"
                onClick={() => setShowSettings(false)}
              >
                ×
              </button>
            </div>
            
            <div className="settings-form">
              <div className="setting-group">
                <h4>Notification Preferences</h4>
                <label className="setting-item">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                  />
                  <span>Email Notifications</span>
                </label>
                <label className="setting-item">
                  <input
                    type="checkbox"
                    checked={settings.pushNotifications}
                    onChange={(e) => setSettings({...settings, pushNotifications: e.target.checked})}
                  />
                  <span>Push Notifications</span>
                </label>
              </div>

              <div className="setting-group">
                <h4>Alert Types</h4>
                <label className="setting-item">
                  <input
                    type="checkbox"
                    checked={settings.orderAlerts}
                    onChange={(e) => setSettings({...settings, orderAlerts: e.target.checked})}
                  />
                  <span>Order Alerts</span>
                </label>
                <label className="setting-item">
                  <input
                    type="checkbox"
                    checked={settings.customerMessages}
                    onChange={(e) => setSettings({...settings, customerMessages: e.target.checked})}
                  />
                  <span>Customer Messages</span>
                </label>
                <label className="setting-item">
                  <input
                    type="checkbox"
                    checked={settings.lowStockAlerts}
                    onChange={(e) => setSettings({...settings, lowStockAlerts: e.target.checked})}
                  />
                  <span>Low Stock Alerts</span>
                </label>
                <label className="setting-item">
                  <input
                    type="checkbox"
                    checked={settings.systemUpdates}
                    onChange={(e) => setSettings({...settings, systemUpdates: e.target.checked})}
                  />
                  <span>System Updates</span>
                </label>
              </div>

              <div className="settings-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowSettings(false)}
                >
                  Cancel
                </button>
                <button 
                  className="save-btn"
                  onClick={handleSettingsSave}
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminNotifications;
