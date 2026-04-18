import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { formatPrice } from '../utils/priceFormatter';
import './ProductList.css';
import productManager from '../utils/productManager';

const ProductList = () => {
  const [activeTab, setActiveTab] = useState('new');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Load products from API
    const loadProducts = async () => {
      try {
        const allProducts = await productManager.getAllProducts();
        setProducts(allProducts);
      } catch (error) {
        console.error('Error loading products:', error);
        setProducts([]);
      }
    };

    loadProducts();
    
    // Set up polling to check for new products every 10 seconds
    const interval = setInterval(loadProducts, 10000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="star" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="star" />);
      } else {
        stars.push(<FaRegStar key={i} className="star" />);
      }
    }
    return stars
  };

  const filteredProducts = products.filter(product => {
    switch (activeTab) {
      case 'new': {
        // Show products created in the last 30 days as new arrivals
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const createdDate = new Date(product.createdAt || product.releaseDate);
        return createdDate > thirtyDaysAgo;
      }
      case 'bestseller': return product.rating >= 4.5;
      case 'featured': return product.rating >= 4.0;
      case 'special': return product.discount > 20;
      default: return true;
    }
  });

  return (
    <section className="product-section">
      <div className="container">
        <div className="section-header">
          <h2>Exclusive Products</h2>
          <div className="product-tabs">
            <button className={`tab-btn ${activeTab === 'new' ? 'active' : ''}`}
              onClick={() => setActiveTab('new')}>
              New Arrivals
            </button>
            <button className={`tab-btn ${activeTab === 'bestseller' ? 'active' : ''}`}
              onClick={() => setActiveTab('bestseller')}>
              Bestsellers
            </button>
            <button className={`tab-btn ${activeTab === 'featured' ? 'active' : ''}`}
              onClick={() => setActiveTab('featured')}>
              Featured
            </button>
            <button className={`tab-btn ${activeTab === 'special' ? 'active' : ''}`}
              onClick={() => setActiveTab('special')}>
              Special Offers
            </button>
          </div>
        </div>

        <div className="product-grid">
          {filteredProducts.map((product) => (
            <div className="product-card" key={product.id}>
              <div className="product-badges">
                {product.tags && product.tags.map((tag, index) => (
                  <span key={index} className={`badge ${tag.toLowerCase()}`}>
                    {tag}
                  </span>
                ))}
              </div>
              <Link
                to={`/product/${product.id}`}
                state={{ product }}
                className="product-link"
              >
                <div className="product-image">
                  <img src={product.image} alt={product.name} />
                </div>
              </Link>
              <div className="product-info">
                <h3 className="product-title">
                  <Link to={`/product/${product.id}`} state={{ product }}>
                    {product.name}
                  </Link>
                </h3>
                <div className="price">
                  <span className="current-price">{formatPrice(product.price)}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="original-price">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
                <div className="rating">
                  <div className="stars">
                    {renderStars(product.rating)}
                  </div>
                  <span className="review-count">({product.reviews || 0})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductList;
