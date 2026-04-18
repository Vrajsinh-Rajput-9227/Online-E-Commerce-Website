import React from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
import CartService from '../services/cartService';
import { formatPrice } from '../utils/priceFormatter';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const addToCart = async (product) => {
    try {
      await CartService.addToCart(product.id, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
    
    // Show success feedback
    const button = document.getElementById(`product-card-add-to-cart-${product.id}`);
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
    <div className="product-card">
      <div className="product-image">
        <Link to={`/product/${product.id}`} state={{ product }}>
          <img 
            src={product.image || (product.images && product.images[0])} 
            alt={product.name} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
            }}
          />
        </Link>
      </div>
      <div className="product-details">
        <h3 className="product-title">
          <Link to={`/product/${product.id}`} state={{ product }}>{product.name}</Link>
        </h3>
        <div className="product-price">
          {formatPrice(product.price) || 'N/A'}
          {product.originalPrice && (
            <span className="original-price">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
        <div className="product-rating">
          {[...Array(5)].map((_, i) => {
            const rating = product.rating || 0;
            const isFilled = i < Math.floor(rating);
            const isHalf = !isFilled && i === Math.floor(rating) && rating % 1 !== 0;
            
            return (
              <span 
                key={i} 
                className={`star ${isFilled ? 'filled' : ''} ${isHalf ? 'half' : ''}`}
              >
                ★
              </span>
            );
          })}
          <span className="rating-count">({product.reviews || 0})</span>
        </div>
        <button 
          className="add-to-cart-btn"
          onClick={() => addToCart(product)}
          id={`product-card-add-to-cart-${product.id}`}
        >
          <FaShoppingCart /> Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
