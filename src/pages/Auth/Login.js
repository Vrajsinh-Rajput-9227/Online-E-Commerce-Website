import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const Login = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from location state
  const from = location.state?.from || '/';
  const message = location.state?.message;

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
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      const result = await login(formData);

      if (result.success) {
        // Login successful
        navigate(from, { replace: true });
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-form">
          <h2>Login to Your Account</h2>
          {message && <div className="info-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Email"
                className="login-input"
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
                className="login-input"
                disabled={isLoading}
              />
            </div>
            <button 
              type="submit" 
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
            <div className="login-footer">
              <p>Don't have an account? <Link to="/register" className="auth-link">Register here</Link></p>
              <p><Link to="/forgot-password" className="auth-link">Forgot Password?</Link></p>
            </div>
          </form>
        </div>
        <div className="welcome-section">
          <div className="welcome-content">
            <h1>Welcome Back!</h1>
            <p>To keep connected with us please login with your personal info</p>
            <div className="welcome-features">
              <div className="feature-item">
                <div className="feature-icon"></div>
                <span>Secure Shopping Experience</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon"></div>
                <span>Track Your Orders</span>
              </div>
              <div className="feature-item">
                {/* <div className="feature-icon"></div> */}
                {/* <span>Exclusive Deals & Offers</span> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;