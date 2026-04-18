import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your password reset logic here
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    console.log('Password reset requested for:', email);
    // Show success message
    setMessage('Password reset link has been sent to your email');
    // For demo purposes, clear the form after 3 seconds
    setTimeout(() => {
      setEmail('');
      setMessage('');
      navigate('/login');
    }, 3000);
  };

  return (
    <div className="forgot-page">
      <div className="forgot-container">
        <div className="forgot-form">
          <h2>Forgot Password</h2>
          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <p className="forgot-text">Enter your email address and we'll send you a link to reset your password.</p>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="forgot-input"
              />
            </div>
            <button type="submit" className="forgot-button">Send Reset Link</button>
            <div className="forgot-footer">
              <p>Remember your password? <Link to="/login" className="auth-link">Back to Login</Link></p>
            </div>
          </form>
        </div>
        <div className="welcome-section">
          <div className="welcome-content">
            <h1>Welcome Back!</h1>
            <p>We'll help you get back to your account</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;