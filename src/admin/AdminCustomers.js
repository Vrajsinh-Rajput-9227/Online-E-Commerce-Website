import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaSearch, FaFilter, FaEye, FaEdit, FaTrash, FaPlus, FaArrowUp, FaArrowDown, FaCheckCircle, FaTimesCircle, FaClock, FaTimes } from 'react-icons/fa';
import './AdminCustomers.css';

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNext: false,
    hasPrev: false
  });
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'active',
    registrationDate: new Date().toISOString()
  });

  // API base URL
  const API_BASE = 'http://localhost:5000/api';

  // Fetch customers from backend
  const fetchCustomers = async (page = 1, filters = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50', // Get more customers for better filtering
        ...filters
      });

      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE}/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        const customersWithStats = await Promise.all(
          data.data.users.map(async (customer) => {
            try {
              const orderStats = await fetchCustomerOrderStats(customer._id);
              return {
                ...customer,
                id: customer._id,
                totalOrders: orderStats.totalOrders,
                totalSpent: orderStats.totalSpent,
                lastOrderDate: orderStats.lastOrderDate,
                address: customer.addresses && customer.addresses.length > 0 
                  ? `${customer.addresses[0].street}, ${customer.addresses[0].city}, ${customer.addresses[0].state} ${customer.addresses[0].postalCode}`
                  : 'No address provided',
                status: customer.isActive ? 'active' : 'inactive',
                registrationDate: customer.createdAt
              };
            } catch (error) {
              console.error('Error fetching order stats for customer:', customer._id, error);
              return {
                ...customer,
                id: customer._id,
                totalOrders: 0,
                totalSpent: 0,
                lastOrderDate: null,
                address: customer.addresses && customer.addresses.length > 0 
                  ? `${customer.addresses[0].street}, ${customer.addresses[0].city}, ${customer.addresses[0].state} ${customer.addresses[0].postalCode}`
                  : 'No address provided',
                status: customer.isActive ? 'active' : 'inactive',
                registrationDate: customer.createdAt
              };
            }
          })
        );

        setCustomers(customersWithStats);
        setFilteredCustomers(customersWithStats);
        setPagination(data.data.pagination);
      } else {
        throw new Error(data.message || 'Failed to fetch customers');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setNotification({
        message: 'Failed to load customers: ' + error.message,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch customer order statistics
  const fetchCustomerOrderStats = async (userId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE}/admin/users/${userId}/order-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.success ? data.data : { totalOrders: 0, totalSpent: 0, lastOrderDate: null };
      }
    } catch (error) {
      console.error('Error fetching order stats:', error);
    }
    return { totalOrders: 0, totalSpent: 0, lastOrderDate: null };
  };

  // Load customers on component mount and when filters change
  useEffect(() => {
    const filters = {};
    if (searchTerm) filters.search = searchTerm;
    if (statusFilter !== 'all') filters.isActive = statusFilter === 'active';
    if (roleFilter !== 'all') filters.role = roleFilter;
    
    fetchCustomers(1, filters);
  }, [searchTerm, statusFilter, roleFilter]);

  // Apply filters and search (client-side filtering for already fetched data)
  useEffect(() => {
    let filtered = [...customers];

    // Apply additional client-side search if needed
    if (searchTerm && customers.length > 0) {
      filtered = filtered.filter(customer =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm) ||
        customer.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'createdAt' || sortBy === 'lastOrderDate' || sortBy === 'registrationDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredCustomers(filtered);
  }, [customers, searchTerm, sortBy, sortOrder]);

  // Get status icon
  const getStatusIcon = (isActive) => {
    if (isActive) {
      return <FaCheckCircle className="status-icon active" />;
    } else {
      return <FaTimesCircle className="status-icon inactive" />;
    }
  };

  // Get status color
  const getStatusColor = (isActive) => {
    if (isActive) {
      return '#10b981';
    } else {
      return '#ef4444';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle sort
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // View customer details
  const viewCustomerDetails = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetails(true);
  };

  // Edit customer
  const editCustomer = (customer) => {
    setEditingCustomer({ ...customer });
    setShowEditModal(true);
  };

  // Update customer status
  const updateCustomerStatus = async (customerId, isActive) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE}/admin/users/${customerId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Update local state
        const updatedCustomers = customers.map(customer => {
          if (customer.id === customerId) {
            return {
              ...customer,
              isActive,
              status: isActive ? 'active' : 'inactive'
            };
          }
          return customer;
        });
        
        setCustomers(updatedCustomers);
        setFilteredCustomers(updatedCustomers);
        
        setNotification({
          message: `Customer ${isActive ? 'activated' : 'deactivated'} successfully`,
          type: 'success'
        });
      } else {
        throw new Error(data.message || 'Failed to update customer status');
      }
    } catch (error) {
      console.error('Error updating customer status:', error);
      setNotification({
        message: 'Failed to update customer status: ' + error.message,
        type: 'error'
      });
    }
  };

  // Delete customer (deactivate instead of delete)
  const deleteCustomer = (customerId) => {
    if (!window.confirm('Are you sure you want to deactivate this customer? This will prevent them from logging in.')) return;

    updateCustomerStatus(customerId, false);
  };

  // Add new customer (create user account)
  const addCustomer = async () => {
    if (!newCustomer.name || !newCustomer.email || !newCustomer.phone) {
      setNotification({
        message: 'Please fill in all required fields',
        type: 'error'
      });
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE}/admin/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newCustomer.name,
          email: newCustomer.email,
          phone: newCustomer.phone,
          password: 'tempPassword123', // You might want to generate a random password
          role: 'user'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create customer');
      }

      const data = await response.json();
      
      if (data.success) {
        // Refresh customers list
        fetchCustomers();
        
        setShowAddModal(false);
        setNewCustomer({
          name: '',
          email: '',
          phone: '',
          address: '',
          status: 'active',
          registrationDate: new Date().toISOString()
        });
        
        setNotification({
          message: `Customer ${newCustomer.name} created successfully`,
          type: 'success'
        });
      } else {
        throw new Error(data.message || 'Failed to create customer');
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      setNotification({
        message: 'Failed to add customer: ' + error.message,
        type: 'error'
      });
    }
  };

  // Get customer statistics
  const getCustomerStats = () => {
    const total = customers.length;
    const active = customers.filter(c => c.isActive).length;
    const inactive = customers.filter(c => !c.isActive).length;
    const pending = 0; // No pending status in backend
    const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
    const customersWithOrders = customers.filter(c => c.totalOrders > 0);
    const avgOrderValue = customersWithOrders.length > 0 
      ? totalRevenue / customersWithOrders.reduce((sum, c) => sum + c.totalOrders, 0) 
      : 0;

    return { total, active, inactive, pending, totalRevenue, avgOrderValue };
  };

  const stats = getCustomerStats();

  if (loading) {
    return (
      <div className="admin-customers">
        <div className="loading-section">
          <div className="loading-spinner"></div>
          <p>Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-customers">
      <div className="customers-header">
        <h1>Customer Management</h1>
        <p>Manage and view all customer accounts</p>
        <button className="add-customer-btn" onClick={() => setShowAddModal(true)}>
          <FaPlus /> Add New Customer
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FaUser />
          </div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Customers</p>
          </div>
        </div>
        <div className="stat-card active">
          <div className="stat-icon">
            <FaCheckCircle />
          </div>
          <div className="stat-content">
            <h3>{stats.active}</h3>
            <p>Active</p>
          </div>
        </div>
        <div className="stat-card inactive">
          <div className="stat-icon">
            <FaTimesCircle />
          </div>
          <div className="stat-content">
            <h3>{stats.inactive}</h3>
            <p>Inactive</p>
          </div>
        </div>
        <div className="stat-card pending">
          <div className="stat-icon">
            <FaClock />
          </div>
          <div className="stat-content">
            <h3>{stats.pending}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="stat-card revenue">
          <div className="stat-icon">
            <FaUser />
          </div>
          <div className="stat-content">
            <h3>₹{stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
        <div className="stat-card avg-order">
          <div className="stat-icon">
            <FaCalendarAlt />
          </div>
          <div className="stat-content">
            <h3>₹{stats.avgOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <p>Avg Order Value</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="customers-controls">
        <div className="search-section">
          <div className="search-input">
            <FaSearch />
            <input
              type="text"
              placeholder="Search by name, email, phone, address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="filters-section">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Roles</option>
            <option value="user">Users</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="customers-table-container">
        <table className="customers-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} className="sortable">
                Name {sortBy === 'name' && (sortOrder === 'asc' ? <FaArrowUp style={{ marginLeft: '8px' }} /> : <FaArrowDown style={{ marginLeft: '8px' }} />)}
              </th>
              <th onClick={() => handleSort('email')} className="sortable">
                Email {sortBy === 'email' && (sortOrder === 'asc' ? <FaArrowUp style={{ marginLeft: '8px' }} /> : <FaArrowDown style={{ marginLeft: '8px' }} />)}
              </th>
              <th>Phone</th>
              <th>Role</th>
              <th>Address</th>
              <th onClick={() => handleSort('totalOrders')} className="sortable">
                Orders {sortBy === 'totalOrders' && (sortOrder === 'asc' ? <FaArrowUp style={{ marginLeft: '8px' }} /> : <FaArrowDown style={{ marginLeft: '8px' }} />)}
              </th>
              <th onClick={() => handleSort('totalSpent')} className="sortable">
                Total Spent {sortBy === 'totalSpent' && (sortOrder === 'asc' ? <FaArrowUp style={{ marginLeft: '8px' }} /> : <FaArrowDown style={{ marginLeft: '8px' }} />)}
              </th>
              <th onClick={() => handleSort('createdAt')} className="sortable">
                Registration {sortBy === 'createdAt' && (sortOrder === 'asc' ? <FaArrowUp style={{ marginLeft: '8px' }} /> : <FaArrowDown style={{ marginLeft: '8px' }} />)}
              </th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <tr key={customer.id} className="customer-row" onClick={() => viewCustomerDetails(customer)} style={{ cursor: 'pointer' }}>
                  <td className="customer-name">{customer.name}</td>
                  <td className="customer-email">{customer.email}</td>
                  <td className="customer-phone">{customer.phone}</td>
                  <td className="customer-role">
                    <span className={`role-badge ${customer.role}`}>
                      {customer.role}
                    </span>
                  </td>
                  <td className="customer-address">{customer.address}</td>
                  <td className="customer-orders">{customer.totalOrders || 0}</td>
                  <td className="customer-spent">₹{(customer.totalSpent || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="customer-registration">{formatDate(customer.createdAt)}</td>
                  <td className="customer-status">
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(customer.isActive) }}
                    >
                      {getStatusIcon(customer.isActive)}
                      {customer.isActive ? 'active' : 'inactive'}
                    </span>
                  </td>
                  <td className="customer-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="action-btn view"
                      onClick={() => viewCustomerDetails(customer)}
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button
                      className="action-btn edit"
                      onClick={() => editCustomer(customer)}
                      title="Edit Customer"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className={`action-btn ${customer.isActive ? 'deactivate' : 'activate'}`}
                      onClick={() => updateCustomerStatus(customer.id, !customer.isActive)}
                      title={customer.isActive ? 'Deactivate Customer' : 'Activate Customer'}
                    >
                      {customer.isActive ? <FaTimes /> : <FaCheckCircle />}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="no-customers">
                  <div className="empty-state">
                    <FaUser className="empty-icon" />
                    <h3>No customers found</h3>
                    <p>No customers match your current filters.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Customer Details Modal */}
      {showCustomerDetails && selectedCustomer && (
        <div className="modal-overlay">
          <div className="modal-content customer-details-modal">
            <div className="modal-header">
              <h2>Customer Details</h2>
              <button
                className="close-btn"
                onClick={() => setShowCustomerDetails(false)}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="customer-details-grid">
                <div className="detail-section">
                  <h3><FaUser /> Personal Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Name:</span>
                      <span className="value">{selectedCustomer.name}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Email:</span>
                      <span className="value">{selectedCustomer.email}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Phone:</span>
                      <span className="value">{selectedCustomer.phone}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Role:</span>
                      <span className="value">{selectedCustomer.role}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Status:</span>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(selectedCustomer.isActive) }}
                      >
                        {getStatusIcon(selectedCustomer.isActive)}
                        {selectedCustomer.isActive ? 'active' : 'inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3><FaMapMarkerAlt /> Address</h3>
                  <p>{selectedCustomer.address}</p>
                </div>

                <div className="detail-section">
                  <h3><FaCalendarAlt /> Account Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Registration Date:</span>
                      <span className="value">{formatDate(selectedCustomer.createdAt)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Total Orders:</span>
                      <span className="value">{selectedCustomer.totalOrders || 0}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Total Spent:</span>
                      <span className="value">₹{(selectedCustomer.totalSpent || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Last Order:</span>
                      <span className="value">{selectedCustomer.lastOrderDate ? formatDate(selectedCustomer.lastOrderDate) : 'No orders yet'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && editingCustomer && (
        <div className="modal-overlay">
          <div className="modal-content edit-customer-modal">
            <div className="modal-header">
              <h3>Edit Customer</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingCustomer(null);
                }}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Name:</label>
                  <input
                    type="text"
                    value={editingCustomer.name}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={editingCustomer.email}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Phone:</label>
                  <input
                    type="tel"
                    value={editingCustomer.phone}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Address:</label>
                  <input
                    type="text"
                    value={editingCustomer.address}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Status:</label>
                  <select
                    value={editingCustomer.status}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingCustomer(null);
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => updateCustomerStatus(editingCustomer.id, !editingCustomer.isActive)}
              >
                {editingCustomer.isActive ? 'Deactivate Customer' : 'Activate Customer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content add-customer-modal">
            <div className="modal-header">
              <h3>Add New Customer</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setShowAddModal(false);
                  setNewCustomer({
                    name: '',
                    email: '',
                    phone: '',
                    address: '',
                    status: 'active',
                    registrationDate: new Date().toISOString()
                  });
                }}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Address:</label>
                  <input
                    type="text"
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Status:</label>
                  <select
                    value={newCustomer.status}
                    onChange={(e) => setNewCustomer({ ...newCustomer, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowAddModal(false);
                  setNewCustomer({
                    name: '',
                    email: '',
                    phone: '',
                    address: '',
                    status: 'active',
                    registrationDate: new Date().toISOString()
                  });
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={addCustomer}
              >
                Add Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
          <button
            className="notification-close"
            onClick={() => setNotification(null)}
          >
            <FaTimes />
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminCustomers;
