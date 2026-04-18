import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiSave, FiX, FiPackage, FiAlertTriangle, FiCheckCircle, FiTrendingUp, FiTrendingDown, FiRefreshCw } from 'react-icons/fi';
import './AdminInventory.css';

const AdminInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalItems: 0,
    totalInventoryValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0
  });
  const [formData, setFormData] = useState({
    productId: '',
    productName: '',
    category: '',
    brand: '',
    sku: '',
    quantity: '',
    minStockLevel: '',
    maxStockLevel: '',
    unitPrice: '',
    totalValue: '',
    location: '',
    supplier: '',
    lastRestocked: '',
    nextRestockDate: '',
    status: 'in-stock',
    notes: ''
  });

  const categories = ['Laptops', 'Smartphones', 'Cameras', 'Audio', 'Wearables', 'Tablets', 'Gaming', 'Accessories'];
  const stockStatuses = ['in-stock', 'low-stock', 'out-of-stock', 'discontinued'];

  useEffect(() => {
    loadInventory();
    loadStats();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/admin/inventory', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setInventory(data.data.inventory);
        setError(null);
      } else {
        setError(data.message || 'Failed to load inventory');
      }
    } catch (error) {
      console.error('Load inventory error:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/inventory/stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Load stats error:', error);
    }
  };

  useEffect(() => {
    let filtered = [...inventory];
    
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    if (stockFilter !== 'all') {
      filtered = filtered.filter(item => item.status === stockFilter);
    }
    
    setFilteredInventory(filtered);
  }, [inventory, searchTerm, selectedCategory, stockFilter]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    let newValue = type === 'number' ? parseFloat(value) || '' : value;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: newValue };
      
      // Calculate total value when quantity or unit price changes
      if (name === 'quantity' || name === 'unitPrice') {
        const quantity = updated.quantity || 0;
        const unitPrice = updated.unitPrice || 0;
        updated.totalValue = quantity * unitPrice;
      }
      
      // Auto-update status based on quantity and min stock level
      if (name === 'quantity' || name === 'minStockLevel') {
        const quantity = updated.quantity || 0;
        const minStockLevel = updated.minStockLevel || 0;
        
        if (quantity === 0) {
          updated.status = 'out-of-stock';
        } else if (quantity <= minStockLevel) {
          updated.status = 'low-stock';
        } else {
          updated.status = 'in-stock';
        }
      }
      
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingItem 
        ? `http://localhost:5000/api/admin/inventory/${editingItem._id}`
        : 'http://localhost:5000/api/admin/inventory';
      
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        await loadInventory();
        await loadStats();
        resetForm();
      } else {
        setError(data.message || 'Failed to save inventory item');
      }
    } catch (error) {
      console.error('Save inventory error:', error);
      setError('Network error. Please check your connection.');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setShowAddForm(true);
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/inventory/${itemId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          await loadInventory();
          await loadStats();
        } else {
          setError(data.message || 'Failed to delete inventory item');
        }
      } catch (error) {
        console.error('Delete inventory error:', error);
        setError('Network error. Please check your connection.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      productId: '',
      productName: '',
      category: '',
      brand: '',
      sku: '',
      quantity: '',
      minStockLevel: '',
      maxStockLevel: '',
      unitPrice: '',
      totalValue: '',
      location: '',
      supplier: '',
      lastRestocked: '',
      nextRestockDate: '',
      status: 'in-stock',
      notes: ''
    });
    setEditingItem(null);
    setShowAddForm(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'in-stock':
        return <FiCheckCircle className="status-icon in-stock" />;
      case 'low-stock':
        return <FiAlertTriangle className="status-icon low-stock" />;
      case 'out-of-stock':
        return <FiX className="status-icon out-of-stock" />;
      case 'discontinued':
        return <FiTrash2 className="status-icon discontinued" />;
      default:
        return null;
    }
  };

  const getStockTrend = (item) => {
    const quantity = item.quantity || 0;
    const minStockLevel = item.minStockLevel || 0;
    const maxStockLevel = item.maxStockLevel || minStockLevel * 2;
    
    if (quantity === 0) return <FiTrendingDown className="trend-icon down" />;
    if (quantity <= minStockLevel) return <FiTrendingDown className="trend-icon warning" />;
    if (quantity >= maxStockLevel) return <FiTrendingUp className="trend-icon up" />;
    return null;
  };

  const totalInventoryValue = stats.totalInventoryValue;
  const lowStockItems = stats.lowStockItems;
  const outOfStockItems = stats.outOfStockItems;

  return (
    <div className="admin-inventory">
      <div className="inventory-header">
        <h1>Inventory Management</h1>
        <div className="header-actions">
          <button 
            className="refresh-btn"
            onClick={() => {
              loadInventory();
              loadStats();
            }}
            disabled={loading}
          >
            <FiRefreshCw className={loading ? 'spinning' : ''} /> Refresh
          </button>
          <button 
            className="add-inventory-btn"
            onClick={() => setShowAddForm(true)}
          >
            <FiPlus /> Add Inventory Item
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <FiAlertTriangle />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="close-error">
            <FiX />
          </button>
        </div>
      )}

      <div className="inventory-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <FiPackage />
          </div>
          <div className="stat-content">
            <h3>{stats.totalItems}</h3>
            <p>Total Items</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <h3>₹{totalInventoryValue.toLocaleString()}</h3>
            <p>Total Value</p>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">
            <FiAlertTriangle />
          </div>
          <div className="stat-content">
            <h3>{lowStockItems}</h3>
            <p>Low Stock Items</p>
          </div>
        </div>
        <div className="stat-card danger">
          <div className="stat-icon">
            <FiX />
          </div>
          <div className="stat-content">
            <h3>{outOfStockItems}</h3>
            <p>Out of Stock</p>
          </div>
        </div>
      </div>

      <div className="inventory-filters">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
          >
            <option value="all">All Stock Status</option>
            {stockStatuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showAddForm && (
        <div className="inventory-form-overlay">
          <div className="inventory-form">
            <div className="form-header">
              <h2>{editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}</h2>
              <button className="close-btn" onClick={resetForm}>
                <FiX />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="inventory-form-content">
              <div className="form-grid">
                <div className="form-group">
                  <label>Product ID *</label>
                  <input
                    type="text"
                    name="productId"
                    value={formData.productId}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Brand *</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>SKU *</label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Min Stock Level *</label>
                  <input
                    type="number"
                    name="minStockLevel"
                    value={formData.minStockLevel}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Max Stock Level</label>
                  <input
                    type="number"
                    name="maxStockLevel"
                    value={formData.maxStockLevel}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
                
                <div className="form-group">
                  <label>Unit Price (₹) *</label>
                  <input
                    type="number"
                    name="unitPrice"
                    value={formData.unitPrice}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Total Value (₹)</label>
                  <input
                    type="text"
                    name="totalValue"
                    value={formData.totalValue?.toLocaleString() || ''}
                    readOnly
                    className="readonly"
                  />
                </div>
                
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Warehouse A - Shelf 1"
                  />
                </div>
                
                <div className="form-group">
                  <label>Supplier</label>
                  <input
                    type="text"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Last Restocked</label>
                  <input
                    type="date"
                    name="lastRestocked"
                    value={formData.lastRestocked}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Next Restock Date</label>
                  <input
                    type="date"
                    name="nextRestockDate"
                    value={formData.nextRestockDate}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    {stockStatuses.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group full-width">
                  <label>Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Additional notes about this inventory item"
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  <FiSave /> {editingItem ? 'Update' : 'Save'} Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="inventory-table-container">
        {loading ? (
          <div className="loading-container">
            <FiRefreshCw className="spinning" />
            <p>Loading inventory...</p>
          </div>
        ) : (
          <>
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>SKU</th>
                  <th>Quantity</th>
                  <th>Stock Levels</th>
                  <th>Unit Price</th>
                  <th>Total Value</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map(item => (
                  <tr key={item._id} className={`inventory-row ${item.status}`}>
                    <td>
                      <div className="status-cell">
                        {getStatusIcon(item.status)}
                        <span className="status-text">
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('-', ' ')}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="product-cell">
                        <div className="name">{item.productName}</div>
                        <div className="brand">{item.brand}</div>
                      </div>
                    </td>
                    <td>{item.category}</td>
                    <td>{item.sku}</td>
                    <td>
                      <div className="quantity-cell">
                        <span className="quantity">{item.quantity}</span>
                        {getStockTrend(item)}
                      </div>
                    </td>
                    <td>
                      <div className="stock-levels">
                        <div>Min: {item.minStockLevel}</div>
                        <div>Max: {item.maxStockLevel || 'N/A'}</div>
                      </div>
                    </td>
                    <td>₹{item.unitPrice?.toLocaleString()}</td>
                    <td>₹{item.totalValue?.toLocaleString()}</td>
                    <td>{item.location || 'N/A'}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-btn"
                          onClick={() => handleEdit(item)}
                          title="Edit"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(item._id)}
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredInventory.length === 0 && !loading && (
              <div className="no-inventory">
                <FiPackage />
                <h3>No inventory items found</h3>
                <p>Try adjusting your search or filters</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminInventory;
