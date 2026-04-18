import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Register.css';

const Register = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setIsLoading(false);
      return;
    }
    
    // Validate phone number
    if (!/^[0-9]{10}$/.test(formData.phone)) {
      setError("Please enter a valid 10-digit mobile number");
      setIsLoading(false);
      return;
    }

    try {
      const { name, email, phone, password } = formData;
      const result = await register({ name, email, phone, password });

      if (result.success) {
        // Registration successful, redirect to login page
        navigate('/login', { 
          state: { 
            message: 'Registration successful! Please login with your credentials.' 
          } 
        });
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-form">
          <h2>Create Account</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Full Name"
                className="register-input"
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Email"
                className="register-input"
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="Mobile Number"
                className="register-input"
                pattern="[0-9]{10}"
                maxLength="10"
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Password"
                className="register-input"
                disabled={isLoading}
                minLength="6"
              />
              <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                Password must be at least 6 characters long
              </small>
            </div>
            <div className="form-group">
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm Password"
                className="register-input"
                disabled={isLoading}
                minLength="6"
              />
            </div>
            <button 
              type="submit" 
              className="register-button"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
            <div className="register-footer">
              <p>Already have an account? <Link to="/login" className="auth-link">Login here</Link></p>
            </div>
          </form>
        </div>
        <div className="welcome-section">
          <div className="welcome-content">
            <h1>Welcome!</h1>
            <p>Join us and discover amazing products and services</p>
            <div className="welcome-features">
              <div className="feature-item">
                <div className="feature-icon"></div>
                <span>Create Your Wishlist</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon"></div>
                <span>Fast & Secure Checkout</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon"></div>
                <span>Member Exclusive Benefits</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;