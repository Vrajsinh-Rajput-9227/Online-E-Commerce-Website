import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaCreditCard, FaPaypal, FaMoneyBillWave } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';
import CartService from '../services/cartService';
import { formatPrice } from '../utils/priceFormatter';
import './Payment.css';

const Payment = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    paymentMethod: 'credit-card',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const { createOrder } = useOrder();

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/payment', message: 'Please login to proceed with payment' } });
    }
  }, [isAuthenticated, navigate]);

  // Load cart items from sessionStorage (set by Cart page)
  useEffect(() => {
    if (!isAuthenticated) return; // Don't load cart if not authenticated
    
    const checkoutCart = sessionStorage.getItem('checkoutCart');
    if (checkoutCart) {
      try {
        setCartItems(JSON.parse(checkoutCart) || []);
      } catch (e) {
        console.error('Error parsing cart data:', e);
        // Fallback to localStorage if sessionStorage fails
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          setCartItems(JSON.parse(savedCart) || []);
        }
      }
    } else {
      // Fallback to localStorage if no checkout cart
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart) || []);
      }
    }
    setLoading(false);
  }, [isAuthenticated]);

  // Pre-fill form with user data when available
  useEffect(() => {
    if (user && isAuthenticated) {
      setFormData(prev => ({
        ...prev,
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email || ''
      }));
    }
  }, [user, isAuthenticated]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    // Format card number (add spaces every 4 digits)
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    }
    
    // Format expiry date (add slash after 2 digits)
    if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length >= 2) {
        const month = formattedValue.slice(0, 2);
        const year = formattedValue.slice(2, 4);
        
        // Validate month (01-12)
        if (parseInt(month) > 12) {
          formattedValue = '12' + '/' + year; // Cap at 12
        } else if (parseInt(month) === 0) {
          formattedValue = '01' + '/' + year; // Default to 01 if 00
        } else if (month.length === 1) {
          formattedValue = month; // Don't add slash yet for single digit
        } else {
          formattedValue = month + '/' + year;
        }
      }
    }
    
    // Only allow digits for CVV
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '');
    }
    
    // Only allow digits for ZIP code
    if (name === 'zipCode') {
      formattedValue = value.replace(/\D/g, '');
    }
    
    // Only allow digits for phone number
    if (name === 'phone') {
      formattedValue = value.replace(/\D/g, '');
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => 
      total + (item.price * (item.quantity || 1)), 0);
  };

  const calculateShipping = () => {
    return 0; // Free shipping
  };

  const calculateTotalWithShipping = () => {
    const subtotal = calculateTotal();
    const shipping = calculateShipping();
    return subtotal + shipping;
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate shipping information
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    } else if (!/^\d{6}$/.test(formData.zipCode.replace(/\s/g, ''))) {
      newErrors.zipCode = 'Please enter a valid 6-digit ZIP code';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    // Validate payment method specific fields
    if (formData.paymentMethod === 'credit-card') {
      if (!formData.cardNumber.trim()) {
        newErrors.cardNumber = 'Card number is required';
      } else {
        const cleanedCardNumber = formData.cardNumber.replace(/\s/g, '');
        if (!/^\d{16}$/.test(cleanedCardNumber)) {
          newErrors.cardNumber = 'Please enter a valid 16-digit card number';
        } else if (!luhnCheck(cleanedCardNumber)) {
          newErrors.cardNumber = 'Please enter a valid card number';
        }
      }
      
      if (!formData.cardName.trim()) {
        newErrors.cardName = 'Name on card is required';
      } else if (!/^[a-zA-Z\s]+$/.test(formData.cardName)) {
        newErrors.cardName = 'Name should contain only letters and spaces';
      }
      
      if (!formData.expiryDate.trim()) {
        newErrors.expiryDate = 'Expiry date is required';
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate)) {
        newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY format)';
      } else {
        // Additional validation for month range
        const [month, year] = formData.expiryDate.split('/');
        const monthNum = parseInt(month);
        
        if (monthNum < 1 || monthNum > 12) {
          newErrors.expiryDate = 'Month must be between 01 and 12';
        } else if (!isExpiryDateValid(formData.expiryDate)) {
          newErrors.expiryDate = 'Card has expired or invalid date';
        }
      }
      
      if (!formData.cvv.trim()) {
        newErrors.cvv = 'CVV is required';
      } else if (!/^\d{3,4}$/.test(formData.cvv)) {
        newErrors.cvv = 'Please enter a valid CVV (3 or 4 digits)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const luhnCheck = (cardNumber) => {
    let sum = 0;
    let isEven = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  };

  const isExpiryDateValid = (expiryDate) => {
    const [month, year] = expiryDate.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    const expYear = parseInt(year);
    const expMonth = parseInt(month);
    
    if (expYear < currentYear) {
      return false;
    }
    
    if (expYear === currentYear && expMonth < currentMonth) {
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = document.querySelector('.error');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Prepare order data for API
      const orderData = {
        items: cartItems.map(item => ({
          product: item.id,
          quantity: item.quantity || 1
        })),
        shippingAddress: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.zipCode,
          country: 'India'
        },
        paymentMethod: formData.paymentMethod === 'cod' ? 'cash_on_delivery' : 
                      formData.paymentMethod === 'paypal' ? 'paypal' : 
                      formData.paymentMethod === 'credit-card' ? 'credit_card' : 'credit_card',
        notes: `Phone: ${formData.phone}`
      };

      // Create order via API
      const createdOrder = await createOrder(orderData);
      
      // Clear cart and sessionStorage
      await CartService.clearCart();
      sessionStorage.removeItem('checkoutCart');
      
      // Redirect to order confirmation page with order details
      navigate('/order-confirmation', { state: { order: createdOrder } });
    } catch (error) {
      console.error('Order creation error:', error);
      setErrors({ submit: error.message || 'Failed to place order. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading || !isAuthenticated) {
    return <div className="loading">Loading...</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="empty-cart">
        <h2>Your cart is empty</h2>
        <p>There are no items in your cart to checkout.</p>
        <button onClick={() => navigate('/products')} className="browse-products-btn">
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <h1>Checkout</h1>
      <div className="checkout-grid">
        <div className="shipping-payment">
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="form-section">
              <h2>Shipping Information</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={errors.firstName ? 'error' : ''}
                    required
                  />
                  {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={errors.lastName ? 'error' : ''}
                    required
                  />
                  {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                </div>
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'error' : ''}
                  required
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className={errors.phone ? 'error' : ''}
                  maxLength="10"
                  required
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>
              <div className="form-group">
                <label>Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={errors.address ? 'error' : ''}
                  required
                />
                {errors.address && <span className="error-message">{errors.address}</span>}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={errors.city ? 'error' : ''}
                    required
                  />
                  {errors.city && <span className="error-message">{errors.city}</span>}
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={errors.state ? 'error' : ''}
                    required
                  />
                  {errors.state && <span className="error-message">{errors.state}</span>}
                </div>
                <div className="form-group">
                  <label>ZIP Code *</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className={errors.zipCode ? 'error' : ''}
                    required
                  />
                  {errors.zipCode && <span className="error-message">{errors.zipCode}</span>}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>Payment Method</h2>
              <div className="payment-methods">
                <label className={`payment-method ${formData.paymentMethod === 'credit-card' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credit-card"
                    checked={formData.paymentMethod === 'credit-card'}
                    onChange={handleChange}
                  />
                  <span className="payment-icon"><FaCreditCard /></span>
                  <span>Credit Card</span>
                </label>
                <label className={`payment-method ${formData.paymentMethod === 'paypal' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={formData.paymentMethod === 'paypal'}
                    onChange={handleChange}
                  />
                  <span className="payment-icon"><FaPaypal /></span>
                  <span>PayPal</span>
                </label>
                <label className={`payment-method ${formData.paymentMethod === 'cod' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleChange}
                  />
                  <span className="payment-icon"><FaMoneyBillWave /></span>
                  <span>Cash on Delivery</span>
                </label>
              </div>

              {formData.paymentMethod === 'credit-card' && (
                <div className="credit-card-form">
                  <div className="form-group">
                    <label>Card Number *</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      placeholder="1234 5678 9012 3456"
                      className={errors.cardNumber ? 'error' : ''}
                      maxLength="19"
                      required
                    />
                    {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
                  </div>
                  <div className="form-group">
                    <label>Name on Card *</label>
                    <input
                      type="text"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className={errors.cardName ? 'error' : ''}
                      required
                    />
                    {errors.cardName && <span className="error-message">{errors.cardName}</span>}
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Expiry Date *</label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleChange}
                        placeholder="MM/YY"
                        className={errors.expiryDate ? 'error' : ''}
                        maxLength="5"
                        required
                      />
                      {errors.expiryDate && <span className="error-message">{errors.expiryDate}</span>}
                    </div>
                    <div className="form-group">
                      <label>CVV *</label>
                      <input
                        type="text"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleChange}
                        placeholder="123"
                        className={errors.cvv ? 'error' : ''}
                        maxLength="4"
                        required
                      />
                      {errors.cvv && <span className="error-message">{errors.cvv}</span>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="button" className="back-to-cart" onClick={() => navigate('/cart')}>
                Back to Cart
              </button>
              <button type="submit" className="place-order-btn" disabled={isProcessing}>
                <FaLock /> {isProcessing ? 'Processing...' : 'Place Order'}
              </button>
            </div>
            {errors.submit && (
              <div className="error-message submit-error">
                {errors.submit}
              </div>
            )}
          </form>
        </div>

        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="order-items">
            {cartItems.map((item) => (
              <div key={item.id} className="order-item">
                <div className="item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p className="item-price">{formatPrice(item.price)}</p>
                  <p className="item-quantity">Quantity: {item.quantity || 1}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="summary-section">
            <div className="summary-row">
              <span>{cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0)} item{cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0) !== 1 ? 's' : ''}</span>
              <span>{formatPrice(calculateTotal())}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="summary-row grand-total">
              <span>Grand Total</span>
              <span>{formatPrice(calculateTotalWithShipping())}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
