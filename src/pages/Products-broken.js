import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaShoppingCart, FaSearch, FaFilter, FaStar, FaStarHalfAlt, FaRegStar, FaEye } from 'react-icons/fa';
import './Products.css';
import productManager from '../utils/productManager';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState(1000000);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Load products from API
    const loadProducts = async () => {
      console.log(' Products component: Starting to load products...');
      try {
        setLoading(true);
        setError(null);
        console.log(' Products component: Calling productManager.getAllProducts()');
        const allProducts = await productManager.getAllProducts();
        console.log(' Products component: Received products:', allProducts);
        
        // Ensure we have a valid array
        if (Array.isArray(allProducts)) {
          console.log(' Products component: Setting products state with', allProducts.length, 'items');
          setProducts(allProducts);
        } else {
          console.warn(' Products component: Received non-array products:', allProducts);
          setProducts([]);
        }
      } catch (error) {
        console.error(' Products component: Error loading products:', error);
        setError('Failed to load products. Please try again.');
        setProducts([]); // Ensure products is always an array
      } finally {
        console.log(' Products component: Loading complete, setting loading to false');
        setLoading(false);
      }
    };

    console.log(' Products component: useEffect triggered, calling loadProducts');
    loadProducts();
    
    // Set up polling to check for new products every 30 seconds
    const interval = setInterval(loadProducts, 30000);
    
    return () => {
      console.log(' Products component: Cleaning up interval');
      clearInterval(interval);
    };
  }, []);

  // Get unique categories and brands from current products
  const categories = Array.isArray(products) 
    ? [...new Set(products.map(product => product.category).filter(Boolean))]
    : [];
  const brands = Array.isArray(products)
    ? [...new Set(products.map(product => product.brand).filter(Boolean))]
    : [];

  // Debug logging
  console.log('Products.js - Debug Info:');
  console.log('  - Products array:', products);
  console.log('  - Products length:', products?.length || 0);
  console.log('  - Categories:', categories);
  console.log('  - Brands:', brands);

  // Filter and sort products
  useEffect(() => {
    let result = Array.isArray(products) ? [...products] : [];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(product =>
        product && product.name && product.brand && product.category &&
        (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
         product.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply price filter
    result = result.filter(product => product && product.price && product.price <= priceRange);

    // Apply category filter
    if (selectedCategories.length > 0) {
      result = result.filter(product => product && product.category && selectedCategories.includes(product.category));
    }

    // Apply brand filter
    if (selectedBrands.length > 0) {
      result = result.filter(product => product && product.brand && selectedBrands.includes(product.brand));
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'discount':
        result.sort((a, b) => (b.discount || 0) - (a.discount || 0));
        break;
      default:
        // Default sorting (featured)
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    setFilteredProducts(result);
  }, [products, searchTerm, priceRange, selectedCategories, selectedBrands, sortBy]);

  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleBrand = (brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPriceRange(1000000);
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSortBy('featured');
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="star filled" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="star half" />);
      } else {
        stars.push(<FaRegStar key={i} className="star" />);
      }
    }
    return stars;
  };

  const addToCart = (product) => {
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = currentCart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      currentCart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(currentCart));
    window.dispatchEvent(new Event('cartUpdated'));
    
    // Show success feedback
    const button = document.getElementById(`add-to-cart-${product.id}`);
    if (button) {
      const originalText = button.innerHTML;
      button.innerHTML = '<FaShoppingCart /> Added!';
      button.style.backgroundColor = '#52c41a';
      setTimeout(() => {
        button.innerHTML = originalText;
        button.style.backgroundColor = '';
      }, 2000);
    }
  };

  return (
    <div className="products-page">
      <div className="products-header">
        <h1>Our Products</h1>
        <div className="search-sort">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="search-icon" />
          </div>
          <div className="sort-options">
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="discount">Best Deals</option>
            </select>
          </div>
          <button
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
      </div>

      <div className="products-container">
        <div className={`filters-sidebar ${showFilters ? 'show' : ''}`}>
          <div className="filter-section">
            <h3>Price Range</h3>
            <div className="price-range">
              <input
                type="range"
                min="0"
                max="1000000"
                step="1000"
                value={priceRange}
                onChange={(e) => setPriceRange(parseInt(e.target.value))}
              />
              <div className="price-range-labels">
                <span>&#8377;0</span>
                <span>&#8377;{priceRange.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="filter-section">
            <h3>Categories</h3>
            <div className="filter-options">
              {/* Debug info */}
              <div style={{fontSize: '12px', color: 'red', marginBottom: '10px', background: 'yellow', padding: '5px'}}>
                Debug: Categories length = {categories.length}, Array = {JSON.stringify(categories)}
              </div>
              {categories.length > 0 ? (
                <div style={{background: 'lightgreen', padding: '5px', marginBottom: '10px'}}>
                  <strong>Rendering categories:</strong>
                  {categories.map((category, index) => (
                    <div key={category} style={{border: '1px solid blue', margin: '2px', padding: '2px'}}>
                      Category {index}: {category}
                      <label key={category} className="filter-option" style={{display: 'block', background: 'orange'}}>
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={() => toggleCategory(category)}
                        />
                        <span className="checkmark"></span>
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{color: 'red', fontSize: '12px', background: 'yellow'}}>
                  No categories found - check console logs
                </div>
              )}
        </div>

        <div className="products-grid">
          {loading ? (
            <div className="loading-state">
              <h3>Loading products...</h3>
            </div>
          ) : error ? (
            <div className="error-state">
              <h3>{error}</h3>
              <button onClick={() => window.location.reload()}>Retry</button>
            </div>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-badge">
                  {product.discount > 0 && (
                    <span className="discount-badge">-{product.discount}%</span>
                  )}
                  {product.stock <= 0 && (
                    <span className="out-of-stock-badge">Out of Stock</span>
                  )}
                </div>
                <div className="product-image">
                  <img src={product.image} alt={product.name} />
                </div>
                <div className="product-info">
                  <span className="product-category">{product.category}</span>
                  <h3 className="product-title">
                    <Link to={`/product/${product.id}`} state={{ product }}>
                      {product.name.length > 50
                        ? `${product.name.substring(0, 50)}...`
                        : product.name}
                    </Link>
                  </h3>
                  <div className="product-rating">
                    <div className="stars">
                      {renderStars(product.rating)}
                      <span className="rating-count">({product.reviews})</span>
                    </div>
                  </div>
                  <div className="product-price">
                    <span className="current-price">₹{product.price.toLocaleString()}</span>
                    {product.originalPrice > product.price && (
                      <span className="original-price">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <button 
                    className="add-to-cart-btn"
                    onClick={() => addToCart(product)}
                    id={`add-to-cart-${product.id}`}
                    disabled={product.stock <= 0}
                  >
                    <FaShoppingCart /> {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-products">
              <h3>No products found.</h3>
              <p>Admin needs to add products to display them here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;