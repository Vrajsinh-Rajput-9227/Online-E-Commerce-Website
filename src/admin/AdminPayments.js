import React, { useState, useEffect } from 'react';
import { FaCreditCard, FaCheckCircle, FaTimesCircle, FaClock, FaSearch, FaFilter, FaEye, FaDownload, FaCalendarAlt, FaUser, FaEnvelope, FaPhone, FaArrowUp, FaArrowDown, FaRupeeSign, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import './AdminPayments.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [notification, setNotification] = useState(null);

  // Load payments from API
  useEffect(() => {
    const loadPayments = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('adminToken');
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/admin/payments`, {
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
          setPayments(data.data.payments);
          setFilteredPayments(data.data.payments);
        } else {
          throw new Error(data.message || 'Failed to fetch payments');
        }
      } catch (error) {
        console.error('Error loading payments:', error);
        setNotification({
          message: `Failed to load payments: ${error.message}`,
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...payments];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    // Apply method filter
    if (methodFilter !== 'all') {
      filtered = filtered.filter(payment => payment.method === methodFilter);
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(payment => {
            const paymentDate = new Date(payment.date);
            return paymentDate.toDateString() === now.toDateString();
          });
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(payment => new Date(payment.date) >= weekAgo);
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(payment => new Date(payment.date) >= monthAgo);
          break;
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'date') {
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

    setFilteredPayments(filtered);
  }, [payments, searchTerm, statusFilter, methodFilter, dateFilter, sortBy, sortOrder]);

  // Get payment status icon
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'paid':
        return <FaCheckCircle className="status-icon completed" />;
      case 'failed':
        return <FaTimesCircle className="status-icon failed" />;
      case 'pending':
        return <FaClock className="status-icon pending" />;
      default:
        return <FaExclamationTriangle className="status-icon unknown" />;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'paid':
        return '#10b981';
      case 'failed':
        return '#ef4444';
      case 'pending':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle sort
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // View payment details
  const viewPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentDetails(true);
  };

  // Process refund
  const processRefund = async () => {
    if (!selectedPayment || !refundAmount || !refundReason) return;

    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/admin/payments/${selectedPayment.orderId}/refund`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refundAmount: parseFloat(refundAmount),
          refundReason
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to process refund');
      }

      if (data.success) {
        // Update local state
        const updatedPayments = payments.map(payment => {
          if (payment.orderId === selectedPayment.orderId) {
            return {
              ...payment,
              refundStatus: 'Processed',
              refundAmount: parseFloat(refundAmount),
              refundReason: refundReason,
              refundDate: data.data.refundDate,
              status: data.data.paymentStatus === 'refunded' ? 'Refunded' : payment.status
            };
          }
          return payment;
        });

        setPayments(updatedPayments);
        setSelectedPayment({ 
          ...selectedPayment, 
          refundStatus: 'Processed', 
          refundAmount: parseFloat(refundAmount),
          status: data.data.paymentStatus === 'refunded' ? 'Refunded' : selectedPayment.status
        });
        setShowRefundModal(false);
        setRefundAmount('');
        setRefundReason('');
        
        setNotification({
          message: data.message || `Refund of ₹${parseFloat(refundAmount).toFixed(2)} processed successfully`,
          type: 'success'
        });
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      setNotification({
        message: `Failed to process refund: ${error.message}`,
        type: 'error'
      });
    }
  };

  // Get payment statistics
  const getPaymentStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        return { total: 0, completed: 0, pending: 0, failed: 0, totalRevenue: 0, totalRefunded: 0 };
      }

      const response = await fetch(`${API_BASE_URL}/admin/payments/stats`, {
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
        const statusBreakdown = data.data.statusBreakdown || {};
        return {
          total: data.data.totalTransactions || 0,
          completed: statusBreakdown.completed?.count || 0,
          pending: statusBreakdown.pending?.count || 0,
          failed: statusBreakdown.failed?.count || 0,
          totalRevenue: data.data.totalRevenue || 0,
          totalRefunded: data.data.totalRefunded || 0
        };
      }
    } catch (error) {
      console.error('Error fetching payment stats:', error);
    }

    // Fallback to local calculation if API fails
    const total = payments.length;
    const completed = payments.filter(p => p.status === 'Completed' || p.status === 'Paid').length;
    const pending = payments.filter(p => p.status === 'Pending').length;
    const failed = payments.filter(p => p.status === 'Failed').length;
    const totalRevenue = payments
      .filter(p => p.status === 'Completed' || p.status === 'Paid')
      .reduce((sum, p) => sum + p.amount, 0);
    const totalRefunded = payments
      .filter(p => p.refundStatus === 'Processed')
      .reduce((sum, p) => sum + (p.refundAmount || 0), 0);

    return { total, completed, pending, failed, totalRevenue, totalRefunded };
  };

  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, failed: 0, totalRevenue: 0, totalRefunded: 0 });

  // Load payment statistics
  useEffect(() => {
    const loadStats = async () => {
      const paymentStats = await getPaymentStats();
      setStats(paymentStats);
    };
    
    if (!loading) {
      loadStats();
    }
  }, [payments, loading]);

  if (loading) {
    return (
      <div className="admin-payments">
        <div className="loading-section">
          <div className="loading-spinner"></div>
          <p>Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-payments">
      <div className="payments-header">
        <h1>Payment Management</h1>
        <p>Manage and track all payment transactions</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FaCreditCard />
          </div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Transactions</p>
          </div>
        </div>
        <div className="stat-card completed">
          <div className="stat-icon">
            <FaCheckCircle />
          </div>
          <div className="stat-content">
            <h3>{stats.completed}</h3>
            <p>Completed</p>
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
        <div className="stat-card failed">
          <div className="stat-icon">
            <FaTimesCircle />
          </div>
          <div className="stat-content">
            <h3>{stats.failed}</h3>
            <p>Failed</p>
          </div>
        </div>
        <div className="stat-card revenue">
          <div className="stat-icon">
            <FaRupeeSign />
          </div>
          <div className="stat-content">
            <h3>₹{stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
        <div className="stat-card refunded">
          <div className="stat-icon">
            <FaArrowDown />
          </div>
          <div className="stat-content">
            <h3>₹{stats.totalRefunded.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <p>Total Refunded</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="payments-controls">
        <div className="search-section">
          <div className="search-input">
            <FaSearch />
            <input
              type="text"
              placeholder="Search by payment ID, transaction ID, customer name..."
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
            <option value="Completed">Completed</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Methods</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
            <option value="Upi">UPI</option>
            <option value="Cash On Delivery">Cash On Delivery</option>
            <option value="Net Banking">Net Banking</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="payments-table-container">
        <table className="payments-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')} className="sortable">
                Payment ID {sortBy === 'id' && (sortOrder === 'asc' ? <FaArrowUp style={{ marginLeft: '8px' }} /> : <FaArrowDown style={{ marginLeft: '8px' }} />)}
              </th>
              <th onClick={() => handleSort('date')} className="sortable">
                Date {sortBy === 'date' && (sortOrder === 'asc' ? <FaArrowUp style={{ marginLeft: '8px' }} /> : <FaArrowDown style={{ marginLeft: '8px' }} />)}
              </th>
              <th>Customer</th>
              <th onClick={() => handleSort('amount')} className="sortable">
                Amount {sortBy === 'amount' && (sortOrder === 'asc' ? <FaArrowUp style={{ marginLeft: '8px' }} /> : <FaArrowDown style={{ marginLeft: '8px' }} />)}
              </th>
              <th>Method</th>
              <th>Status</th>
              <th>Refund Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => (
                <tr key={payment.id} className="payment-row">
                  <td className="payment-id">#{payment.id}</td>
                  <td className="payment-date">{formatDate(payment.date)}</td>
                  <td className="customer-info">
                    <div className="customer-name">{payment.customerName}</div>
                    <div className="customer-email">{payment.customerEmail}</div>
                  </td>
                  <td className="payment-amount">₹{payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="p-payment-method">
                    <span className="method-badge">{payment.method}</span>
                    {payment.last4 && <span className="last4">•••• {payment.last4}</span>}
                  </td>
                  <td className="payment-status">
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(payment.status) }}
                    >
                      {getStatusIcon(payment.status)}
                      {payment.status}
                    </span>
                  </td>
                  <td className="refund-status">
                    {payment.refundStatus ? (
                      <span className="refund-badge processed">
                        ₹{payment.refundAmount.toFixed(2)}
                      </span>
                    ) : (
                      <span className="refund-badge none">No Refund</span>
                    )}
                  </td>
                  <td className="p-payment-actions">
                    <button
                      className="action-btn view"
                      onClick={() => viewPaymentDetails(payment)}
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    {(payment.status === 'Completed' || payment.status === 'Paid') && !payment.refundStatus && (
                      <button
                        className="action-btn refund"
                        onClick={() => {
                          setSelectedPayment(payment);
                          setRefundAmount(payment.amount.toString());
                          setShowRefundModal(true);
                        }}
                        title="Process Refund"
                      >
                        <FaArrowDown />
                      </button>
                    )}
                    <button
                      className="action-btn download"
                      onClick={() => window.print()}
                      title="Download Receipt"
                    >
                      <FaDownload />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-payments">
                  <div className="empty-state">
                    <FaCreditCard className="empty-icon" />
                    <h3>No payments found</h3>
                    <p>No payments match your current filters.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Payment Details Modal */}
      {showPaymentDetails && selectedPayment && (
        <div className="modal-overlay">
          <div className="modal-content payment-details-modal">
            <div className="modal-header">
              <h2>Payment Details - #{selectedPayment.id}</h2>
              <button
                className="close-btn"
                onClick={() => setShowPaymentDetails(false)}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="payment-details-grid">
                <div className="detail-section">
                  <h3><FaUser /> Customer Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Name:</span>
                      <span className="value">{selectedPayment.customerName}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Email:</span>
                      <span className="value">{selectedPayment.customerEmail}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Phone:</span>
                      <span className="value">{selectedPayment.customerPhone}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3><FaCreditCard /> Payment Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Payment ID:</span>
                      <span className="value">#{selectedPayment.id}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Transaction ID:</span>
                      <span className="value">{selectedPayment.transactionId}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Date:</span>
                      <span className="value">{formatDate(selectedPayment.date)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Amount:</span>
                      <span className="value">₹{selectedPayment.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Method:</span>
                      <span className="value">{selectedPayment.method}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Status:</span>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(selectedPayment.status) }}
                      >
                        {getStatusIcon(selectedPayment.status)}
                        {selectedPayment.status}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedPayment.refundStatus && (
                  <div className="detail-section">
                    <h3>Refund Information</h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="label">Refund Status:</span>
                        <span className="value">{selectedPayment.refundStatus}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Refund Amount:</span>
                        <span className="value">₹{selectedPayment.refundAmount.toFixed(2)}</span>
                      </div>
                      {selectedPayment.refundDate && (
                        <div className="detail-item">
                          <span className="label">Refund Date:</span>
                          <span className="value">{formatDate(selectedPayment.refundDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="detail-section">
                  <h3>Billing Address</h3>
                  <p>{selectedPayment.billingAddress}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && selectedPayment && (
        <div className="modal-overlay">
          <div className="modal-content refund-modal">
            <div className="modal-header">
              <h3>Process Refund</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setShowRefundModal(false);
                  setRefundAmount('');
                  setRefundReason('');
                }}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-body">
              <p>Payment: <strong>#{selectedPayment.id}</strong></p>
              <p>Original Amount: <strong>₹{selectedPayment.amount.toFixed(2)}</strong></p>
              
              <div className="form-group">
                <label htmlFor="refundAmount">Refund Amount (₹)</label>
                <input
                  type="number"
                  id="refundAmount"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  min="0"
                  max={selectedPayment.amount}
                  step="0.01"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="refundReason">Refund Reason</label>
                <textarea
                  id="refundReason"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  rows="4"
                  placeholder="Enter the reason for refund..."
                  required
                ></textarea>
              </div>
            </div>
            
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowRefundModal(false);
                  setRefundAmount('');
                  setRefundReason('');
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={processRefund}
                disabled={!refundAmount || !refundReason || parseFloat(refundAmount) <= 0 || parseFloat(refundAmount) > selectedPayment.amount}
              >
                Process Refund
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

export default AdminPayments;
