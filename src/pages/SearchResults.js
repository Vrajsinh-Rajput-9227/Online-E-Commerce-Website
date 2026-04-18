import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaHeart } from 'react-icons/fa';
import productManager from '../utils/productManager';
import WishlistService from '../services/wishlistService';
import CartService from '../services/cartService';
import { formatPrice } from '../utils/priceFormatter';
import './SearchResults.css';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setSearchResults([]);
        setLoading(false);
        return;
      }

      try {
        // Get all products from API
        const allProducts = await productManager.getAllProducts();
        
        const filtered = allProducts.filter(product => 
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          (product.category && product.category.toLowerCase().includes(query.toLowerCase())) ||
          (product.brand && product.brand.toLowerCase().includes(query.toLowerCase())) ||
          (product.description && product.description.toLowerCase().includes(query.toLowerCase()))
        );

        setSearchResults(filtered);
      } catch (error) {
        console.error('Error searching products:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query]);

  const handleAddToCart = async (product) => {
    try {
      await CartService.addToCart(product.id, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleAddToWishlist = async (product) => {
    try {
      await WishlistService.addToWishlist(product.id);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<span key={i} className="star filled">★</span>);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<span key={i} className="star half">★</span>);
      } else {
        stars.push(<span key={i} className="star">★</span>);
      }
    }
    return stars;
  };

  if (loading) {
    return <div className="search-loading">Searching...</div>;
  }

  return (
    <div className="search-results-container">
      <div className="search-header">
        <h1>Search Results</h1>
        <div className="search-info">
          {query && (
            <>
              <span className="search-query">
                <FaSearch /> "{query}"
              </span>
              <span className="results-count">
                {searchResults.length} {searchResults.length === 1 ? 'product' : 'products'} found
              </span>
            </>
          )}
        </div>
      </div>

      {!query ? (
        <div className="no-search">
          <p>Please enter a search term to find products.</p>
          <Link to="/" className="back-to-home">Back to Home</Link>
        </div>
      ) : searchResults.length === 0 ? (
        <div className="no-results">
          <h3>No products found</h3>
          <p>We couldn't find any products matching "{query}".</p>
          <div className="suggestions">
            <h4>Suggestions:</h4>
            <ul>
              <li>Check your spelling</li>
              <li>Try more general keywords</li>
              <li>Try different keywords</li>
            </ul>
          </div>
          <Link to="/" className="back-to-home">Back to Home</Link>
        </div>
      ) : (
        <div className="results-grid">
          {searchResults.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <Link to={`/product/${product.id}`}>
                  <img 
                    src={product.image} 
                    alt={product.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                    }}
                  />
                </Link>
                {product.discount > 0 && (
                  <span className="discount-badge">-{product.discount}%</span>
                )}
              </div>
              
              <div className="product-info">
                <Link to={`/product/${product.id}`} className="product-name">
                  {product.name}
                </Link>
                
                <div className="product-category">{product.category}</div>
                
                <div className="product-rating">
                  <div className="stars">
                    {renderStars(product.rating)}
                    <span className="rating-text">{product.rating.toFixed(1)}</span>
                  </div>
                  <span className="reviews">({product.reviews} reviews)</span>
                </div>
                
                <div className="product-price">
                  {product.discount > 0 ? (
                    <>
                      <span className="current-price">{formatPrice(product.price)}</span>
                      <span className="original-price">{formatPrice(product.originalPrice)}</span>
                    </>
                  ) : (
                    <span className="current-price">{formatPrice(product.price)}</span>
                  )}
                </div>
                
                <div className="product-actions">
                  <button 
                    className="add-to-cart-btn"
                    onClick={() => handleAddToCart(product)}
                    aria-label="Add to cart"
                  >
                    <FaShoppingCart /> Add to Cart
                  </button>
                  <button 
                    className="wishlist-btn"
                    onClick={() => handleAddToWishlist(product)}
                    aria-label="Add to wishlist"
                  >
                    <FaHeart />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
