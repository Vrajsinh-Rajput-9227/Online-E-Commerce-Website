import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiSave, FiX, FiUpload, FiImage } from 'react-icons/fi';
import axios from 'axios';
import { formatPrice } from '../utils/priceFormatter';
import './AdminProducts.css';
import productManager from '../utils/productManager';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    originalPrice: '',
    discount: '',
    price: '',
    category: '',
    brand: '',
    description: '',
    color: '',
    model: '',
    material: '',
    dimensions: '',
    weight: '',
    warranty: '',
    sku: '',
    releaseDate: '',
    manufacturer: '',
    origin: '',
    asin: '',
    stock: '',
    // rating: '',
    // reviews: '',
    image: '',
    additionalImages: [],
    tags: []
  });

  const categories = ['Laptops', 'Smartphones', 'Cameras', 'Audio', 'Wearables', 'Tablets', 'Gaming', 'Accessories'];
  const allBrands = ['Samsung', 'Apple', 'HP', 'Dell', 'Canon', 'boAt', 'Sony', 'LG', 'Xiaomi', 'OnePlus', 'POCO', 'realme', 'ASUS'];
  
  // Category-wise brand mapping
  const categoryBrands = {
    'Laptops': ['Apple', 'HP', 'Dell', 'ASUS', 'LG', 'Samsung'],
    'Smartphones': ['Apple', 'Samsung', 'Xiaomi', 'OnePlus', 'POCO', 'realme', 'ASUS', 'LG'],
    'Cameras': ['Canon', 'Sony', 'Samsung', 'Nikon', 'Fujifilm'],
    'Audio': ['Sony', 'boAt', 'LG', 'Samsung', 'Apple', 'JBL'],
    'Wearables': ['Apple', 'Samsung', 'Xiaomi', 'realme', 'OnePlus', 'ASUS', 'boAt'],
    'Tablets': ['Apple', 'Samsung', 'ASUS', 'LG', 'Xiaomi', 'realme'],
    'Gaming': ['ASUS', 'Sony', 'Microsoft', 'Xiaomi', 'OnePlus', 'Samsung'],
    'Accessories': ['Apple', 'Samsung', 'Sony', 'boAt', 'LG', 'Xiaomi', 'OnePlus', 'POCO', 'realme']
  };

  // Get brands for selected category
  const getAvailableBrands = () => {
    if (!formData.category) return allBrands;
    return categoryBrands[formData.category] || allBrands;
  };

  useEffect(() => {
    // Load products from the API
    const loadProducts = async () => {
      try {
        const allProducts = await productManager.getAllProducts();
        
        // Ensure we have a valid array
        if (Array.isArray(allProducts)) {
          setProducts(allProducts);
        } else {
          console.warn('Received non-array products:', allProducts);
          setProducts([]);
        }
      } catch (error) {
        console.error('Error loading products:', error);
        setProducts([]); // Ensure products is always an array
      }
    };

    loadProducts();
    
    // Set up polling to check for new products every 10 seconds
    const interval = setInterval(loadProducts, 10000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let filtered = Array.isArray(products) ? [...products] : [];
    
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product && product.name && product.brand && product.category &&
        (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
         product.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product && product.category === selectedCategory);
    }
    
    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory]);

  // Auto-calculate price when discount or original price changes
  useEffect(() => {
    if (formData.originalPrice && formData.discount) {
      const discountAmount = (parseFloat(formData.originalPrice) * parseFloat(formData.discount)) / 100;
      const calculatedPrice = parseFloat(formData.originalPrice) - discountAmount;
      setFormData(prev => ({
        ...prev,
        price: Math.round(calculatedPrice)
      }));
    }
  }, [formData.originalPrice, formData.discount]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || '' : value
    }));
  };

  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newImages = [];
      
      // Process each file
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push(reader.result);
          
          // Update form data when all images are processed
          if (newImages.length === files.length) {
            setFormData(prev => {
              const updatedAdditionalImages = [...(prev.additionalImages || []), ...newImages];
              
              // Set the first image as the main product image if no main image exists
              const mainImage = prev.image || (newImages.length > 0 ? newImages[0] : '');
              
              return {
                ...prev,
                image: mainImage,
                additionalImages: updatedAdditionalImages
              };
            });
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => {
      const newAdditionalImages = prev.additionalImages.filter((_, i) => i !== index);
      
      // If removing the first image and it's the main image, update the main image
      let newMainImage = prev.image;
      if (prev.image === prev.additionalImages[index] && newAdditionalImages.length > 0) {
        newMainImage = newAdditionalImages[0];
      } else if (prev.image === prev.additionalImages[index] && newAdditionalImages.length === 0) {
        newMainImage = '';
      }
      
      return {
        ...prev,
        image: newMainImage,
        additionalImages: newAdditionalImages
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingProduct) {
        // Update existing product
        await productManager.updateProduct(editingProduct.id, formData);
      } else {
        // Add new product
        await productManager.addProduct(formData);
      }
      
      // Reload products to show the changes
      const allProducts = await productManager.getAllProducts();
      setProducts(allProducts);
      
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      
      // Show more specific error message
      let errorMessage = 'Error saving product. Please try again.';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        if (error.response.data && error.response.data.errors) {
          errorMessage = error.response.data.errors.map(err => err.msg).join(', ');
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'Server is not responding. Please check your connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = error.message || 'Error saving product. Please try again.';
      }
      
      alert(errorMessage);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData(product);
    setShowAddForm(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('⚠️ WARNING: This will PERMANENTLY delete the product from the database. This action cannot be undone.\n\nAre you sure you want to delete this product?')) {
      try {
        await productManager.deleteProduct(productId);
        
        // Reload products to show the changes
        const allProducts = await productManager.getAllProducts();
        setProducts(allProducts);
        
        alert('✅ Product permanently deleted from database.');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      originalPrice: '',
      discount: '',
      price: '',
      category: '',
      brand: '',
      description: '',
      color: '',
      model: '',
      material: '',
      dimensions: '',
      weight: '',
      warranty: '',
      sku: '',
      releaseDate: '',
      manufacturer: '',
      origin: '',
      asin: '',
      stock: '',
      // discount: '',
      // rating: '',
      // reviews: '',
      image: '',
      additionalImages: [],
      tags: []
    });
    setEditingProduct(null);
    setShowAddForm(false);
  };

  return (
    <div className="admin-products">
      <div className="admin-products-header">
        <h1>Product Management</h1>
        <button 
          className="add-product-btn"
          onClick={() => setShowAddForm(true)}
        >
          <FiPlus /> Add New Product
        </button>
      </div>

      <div className="products-filters">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search products..."
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
        </div>
      </div>

      {showAddForm && (
        <div className="product-form-inline">
          <div className="form-header">
            <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <button className="close-btn" onClick={resetForm}>
              <FiX />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="product-form-content">
            <div className="form-grid">
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Original Price</label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Discount (%)</label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                />
              </div>
              
              <div className="form-group">
                <label>Price *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
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
                <select
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Brand</option>
                  {getAvailableBrands().map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Model</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Color</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Material</label>
                <input
                  type="text"
                  name="material"
                  value={formData.material}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Dimensions</label>
                <input
                  type="text"
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleInputChange}
                  placeholder="e.g., 35.5 x 25.1 x 1.7 cm"
                />
              </div>
              
              <div className="form-group">
                <label>Weight</label>
                <input
                  type="text"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  placeholder="e.g., 1.8 kg"
                />
              </div>
              
              <div className="form-group">
                <label>Warranty</label>
                <input
                  type="text"
                  name="warranty"
                  value={formData.warranty}
                  onChange={handleInputChange}
                  placeholder="e.g., 2 Years"
                />
              </div>
              
              <div className="form-group">
                <label>Stock *</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>SKU</label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Manufacturer</label>
                <input
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Origin</label>
                <input
                  type="text"
                  name="origin"
                  value={formData.origin}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Release Date</label>
                <input
                  type="date"
                  name="releaseDate"
                  value={formData.releaseDate}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>ASIN</label>
                <input
                  type="text"
                  name="asin"
                  value={formData.asin}
                  onChange={handleInputChange}
                />
              </div>
              
              
              {/* <div className="form-group">
                <label>Rating (0-5)</label>
                <input
                  type="number"
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                  min="0"
                  max="5"
                  step="0.1"
                />
              </div>
              
              <div className="form-group">
                <label>Reviews Count</label>
                <input
                  type="number"
                  name="reviews"
                  value={formData.reviews}
                  onChange={handleInputChange}
                  min="0"
                />
              </div> */}
              
              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              
              <div className="form-group full-width">
                <label>Product Images</label>
                <div className="image-upload">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    id="product-images"
                  />
                  <label htmlFor="product-images" className="upload-label">
                    <FiUpload />
                    <span>Upload Multiple Images</span>
                  </label>
                  {formData.additionalImages && formData.additionalImages.length > 0 && (
                    <div className="image-previews">
                      {formData.additionalImages.map((img, index) => (
                        <div key={index} className="image-preview-item">
                          <img src={img} alt={`Product preview ${index + 1}`} />
                          <button 
                            type="button" 
                            className="remove-image-btn"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <FiX />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" className="save-btn">
                <FiSave /> {editingProduct ? 'Update' : 'Save'} Product
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={product.id}>
                <td>
                  <div className="product-image-cell">
                    {product.image ? (
                      <img src={product.image} alt={product.name} />
                    ) : (
                      <div className="no-image">
                        <FiImage />
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="product-name-cell">
                    <div className="name">{product.name}</div>
                    <div className="sku">SKU: {product.sku || 'N/A'}</div>
                  </div>
                </td>
                <td>{product.category}</td>
                <td>{product.brand}</td>
                <td>
                  <div className="price-cell">
                    <div className="current-price">{formatPrice(product.price)}</div>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="original-price">{formatPrice(product.originalPrice)}</div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="stock-cell">
                    <span className={`stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="rating-cell">
                    <span className="rating">⭐ {product.rating || 0}</span>
                    <span className="reviews">({product.reviews || 0})</span>
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(product)}
                      title="Edit"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(product.id)}
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
        
        {filteredProducts.length === 0 && (
          <div className="no-products">
            <FiFilter />
            <h3>No products found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
