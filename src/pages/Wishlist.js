import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaShoppingCart, FaTrash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import WishlistService from '../services/wishlistService';
import CartService from '../services/cartService';
import { formatPrice } from '../utils/priceFormatter';
import './Wishlist.css';

const Wishlist = () => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const wishlistData = await WishlistService.getWishlist();
        setWishlist(wishlistData.wishlist);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        setWishlist([]);
      }
      setIsLoading(false);
    };

    fetchWishlist();

    // Listen for wishlist updates
    const handleWishlistUpdate = () => {
      fetchWishlist();
    };

    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    return () => window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
  }, [isAuthenticated]);

  const removeFromWishlist = async (productId) => {
    try {
      await WishlistService.removeFromWishlist(productId);
      const updatedWishlist = wishlist.filter(item => item.id !== productId);
      setWishlist(updatedWishlist);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const addToCart = async (product) => {
    try {
      await CartService.addToCart(product.id, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading wishlist...</div>;
  }

  return (
    <div className="wishlist-container">
      <h1>My Wishlist</h1>
      
      {wishlist.length === 0 ? (
        <div className="empty-wishlist">
          <FaHeart className="empty-icon" />
          <h2>Your wishlist is empty</h2>
          <p>You haven't added any products to your wishlist yet.</p>
          <Link to="/products" className="continue-shopping">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="wishlist-items">
          {wishlist.map((item) => (
            <div key={item.id} className="wishlist-item">
              <div className="item-image">
                <img src={item.image} alt={item.name} />
              </div>
              <div className="item-details">
                <h3 className="item-name">{item.name}</h3>
                <div className="item-price">
                  <span className="current-price">{formatPrice(item.price)}</span>
                  {item.originalPrice > item.price && (
                    <span className="original-price">{formatPrice(item.originalPrice)}</span>
                  )}
                </div>
                <div className="item-actions">
                  <button 
                    className="add-to-cart-btn"
                    onClick={() => addToCart(item)}
                  >
                    <FaShoppingCart /> Add to Cart
                  </button>
                  <button 
                    className="remove-btn"
                    onClick={() => removeFromWishlist(item.id)}
                    aria-label="Remove from wishlist"
                  >
                    <FaTrash />
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

export default Wishlist;
