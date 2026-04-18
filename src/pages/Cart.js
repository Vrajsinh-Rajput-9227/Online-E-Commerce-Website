// src/pages/Cart.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaArrowLeft, FaShoppingCart, FaLock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { formatPrice } from '../utils/priceFormatter';
import './Cart.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Cart = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      if (!isAuthenticated) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/users/cart`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          // Transform database cart items to frontend format
          const transformedItems = response.data.data.cart.map(item => ({
            id: item.product._id,
            name: item.product.name,
            price: item.product.price,
            image: item.product.images[0] || '',
            quantity: item.quantity,
            stock: item.product.stock
          }));
          setCartItems(transformedItems);
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
        setCartItems([]);
      }
      setLoading(false);
    };

    fetchCart();
  }, [isAuthenticated]);

  const updateCart = async (updatedCart) => {
    setCartItems(updatedCart);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeFromCart = async (productId) => {
    if (!isAuthenticated) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/users/cart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const updatedCart = cartItems.filter(item => item.id !== productId);
      updateCart(updatedCart);
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1 || !isAuthenticated) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/users/cart/update`, {
        productId,
        quantity: newQuantity
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const updatedCart = cartItems.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
      updateCart(updatedCart);
    } catch (error) {
      console.error('Error updating cart quantity:', error);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateShipping = () => {
    return 0; // Free shipping
  };

  const calculateTotalWithShipping = () => {
    const subtotal = calculateTotal();
    const shipping = calculateShipping();
    return subtotal + shipping;
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/payment', message: 'Please login to proceed with checkout' } });
    } else {
      // Store cart data in sessionStorage for payment page
      sessionStorage.setItem('checkoutCart', JSON.stringify(cartItems));
      navigate('/payment');
    }
  };

  if (loading) {
    return <div className="loading">Loading cart...</div>;
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1>Your Shopping Cart</h1>
        <Link to="/" className="continue-shopping">
          <FaArrowLeft /> Continue Shopping
        </Link>
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <FaShoppingCart size={64} className="empty-cart-icon" />
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <Link to="/products" className="browse-products-btn">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p className="item-price">{formatPrice(item.price)}</p>
                  <div className="quantity-controls">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      +
                    </button>
                  </div>
                </div>
                <button
                  className="remove-item"
                  onClick={() => removeFromCart(item.id)}
                  aria-label={`Remove ${item.name} from cart`}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>{cartItems.reduce((acc, item) => acc + item.quantity, 0)} item{cartItems.reduce((acc, item) => acc + item.quantity, 0) !== 1 ? 's' : ''}</span>
              <span>{formatPrice(calculateTotal())}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="summary-row total grand-total">
              <span>Grand Total</span>
              <span>{formatPrice(calculateTotalWithShipping())}</span>
            </div>
            <button onClick={handleCheckout} className="checkout-btn">
              {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default Cart;