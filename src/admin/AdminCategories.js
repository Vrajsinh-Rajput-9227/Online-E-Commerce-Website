import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiSave, FiX, FiPackage, FiGrid, FiList, FiRefreshCw } from 'react-icons/fi';
import './AdminCategories.css';
import categoryService from '../services/categoryService';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalCategories: 0,
    activeCategories: 0,
    featuredCategories: 0,
    totalProducts: 0
  });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    status: 'active',
    featured: false
  });

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getCategories();
      setCategories(response.data);
      setFilteredCategories(response.data);
      setError('');
    } catch (err) {
      setError(err.message);
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics from API
  const fetchStats = async () => {
    try {
      const response = await categoryService.getCategoryStats();
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchStats();
  }, []);

  // Filter categories based on search term
  useEffect(() => {
    const filtered = categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [searchTerm, categories]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      let response;
      
      if (editingCategory) {
        // Update existing category
        response = await categoryService.updateCategory(editingCategory._id, formData);
      } else {
        // Add new category
        response = await categoryService.createCategory(formData);
      }
      
      await fetchCategories();
      await fetchStats();
      resetForm();
      setError('');
    } catch (err) {
      setError(err.message);
      console.error('Error saving category:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      image: category.image,
      status: category.status,
      featured: category.featured
    });
    setShowAddForm(true);
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        setLoading(true);
        await categoryService.deleteCategory(categoryId);
        await fetchCategories();
        await fetchStats();
        setError('');
      } catch (err) {
        setError(err.message);
        console.error('Error deleting category:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleStatus = async (categoryId) => {
    try {
      setLoading(true);
      await categoryService.toggleStatus(categoryId);
      await fetchCategories();
      await fetchStats();
      setError('');
    } catch (err) {
      setError(err.message);
      console.error('Error toggling status:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (categoryId) => {
    try {
      setLoading(true);
      await categoryService.toggleFeatured(categoryId);
      await fetchCategories();
      await fetchStats();
      setError('');
    } catch (err) {
      setError(err.message);
      console.error('Error toggling featured:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
      status: 'active',
      featured: false
    });
    setEditingCategory(null);
    setShowAddForm(false);
    setError('');
  };

  const activeCategories = stats.activeCategories;
  const featuredCategories = stats.featuredCategories;

  return (
    <div className="admin-categories">
      <div className="categories-header">
        <h1>Category Management</h1>
        <div className="header-actions">
          <button
            className="refresh-btn"
            onClick={fetchCategories}
            disabled={loading}
            title="Refresh categories"
          >
            <FiRefreshCw className={loading ? 'spinning' : ''} />
          </button>
          <button
            className="add-category-btn"
            onClick={() => setShowAddForm(true)}
          >
            <FiPlus /> Add Category
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FiPackage />
          </div>
          <div className="stat-content">
            <h3>{stats.totalCategories}</h3>
            <p>Total Categories</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active">
            <FiGrid />
          </div>
          <div className="stat-content">
            <h3>{activeCategories}</h3>
            <p>Active Categories</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon featured">
            <FiList />
          </div>
          <div className="stat-content">
            <h3>{featuredCategories}</h3>
            <p>Featured Categories</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FiPackage />
          </div>
          <div className="stat-content">
            <h3>{stats.totalProducts}</h3>
            <p>Total Products</p>
          </div>
        </div>
      </div>

      {/* Search and View Controls */}
      <div className="categories-controls">
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="view-controls">
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <FiGrid />
          </button>
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <FiList />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={() => setError('')} className="close-error">
            <FiX />
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <FiRefreshCw className="spinning" />
            <p>Loading categories...</p>
          </div>
        </div>
      )}

      {/* Categories Display */}
      {!loading && filteredCategories.length === 0 ? (
        <div className="empty-state">
          <FiPackage className="empty-icon" />
          <h3>No categories found</h3>
          <p>{searchTerm ? 'Try a different search term' : 'Start by adding your first category'}</p>
          {!searchTerm && (
            <button
              className="add-category-btn"
              onClick={() => setShowAddForm(true)}
            >
              <FiPlus /> Add First Category
            </button>
          )}
        </div>
      ) : (
        <div className={`categories-container ${viewMode}`}>
          {filteredCategories.map(category => (
            <div key={category._id} className={`category-card ${category.status}`}>
            <div className="category-image">
              <img src={category.image} alt={category.name} />
              <div className="category-status">
                <span className={`status-badge ${category.status}`}>
                  {category.status}
                </span>
                {category.featured && (
                  <span className="featured-badge">Featured</span>
                )}
              </div>
            </div>
            <div className="category-info">
              <h3>{category.name}</h3>
              <p>{category.description}</p>
              <div className="category-stats">
                <span>{category.productCount} Products</span>
                <span>Updated: {category.updatedAt}</span>
              </div>
            </div>
            <div className="category-actions">
              <button
                className="action-btn edit"
                onClick={() => handleEdit(category)}
                title="Edit"
              >
                <FiEdit2 />
              </button>
              <button
                className="action-btn delete"
                onClick={() => handleDelete(category._id)}
                title="Delete"
                disabled={loading}
              >
                <FiTrash2 />
              </button>
              <button
                className={`action-btn toggle ${category.status === 'active' ? 'active' : 'inactive'}`}
                onClick={() => toggleStatus(category._id)}
                title={category.status === 'active' ? 'Deactivate' : 'Activate'}
                disabled={loading}
              >
                {category.status === 'active' ? 'Active' : 'Inactive'}
              </button>
              <button
                className={`action-btn featured ${category.featured ? 'featured' : ''}`}
                onClick={() => toggleFeatured(category._id)}
                title={category.featured ? 'Remove from Featured' : 'Add to Featured'}
                disabled={loading}
              >
                {category.featured ? 'Featured' : 'Not Featured'}
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Add/Edit Category Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
              <button className="close-btn" onClick={resetForm}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="category-form">
              <div className="form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  required
                />
              </div>
              <div className="form-group">
                <label>Category Image URL</label>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                  />
                  Featured Category
                </label>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={loading}>
                  <FiSave /> {editingCategory ? 'Update' : 'Save'} Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
