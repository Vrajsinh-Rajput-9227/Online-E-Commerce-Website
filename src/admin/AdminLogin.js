import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CiUser, CiLock } from 'react-icons/ci';
import { useAdminAuth } from '../context/AdminAuthContext';
import apiService from '../services/api';
import productManager from '../utils/productManager';
import './AdminLogin.css';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { adminLogin } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('Attempting admin login with:', { email, password });

    try {
      // Use admin-specific authentication
      const result = await adminLogin({ email, password });
      
      console.log('Admin login response:', result);
      
      if (result.success) {
        console.log('Admin login successful');
        
        // Force backup authentication to prevent token loss
        productManager.forceBackupAuth();
        
        navigate('/admin');
      } else {
        console.error('Login failed with response:', result);
        setError(result.message || 'Invalid admin credentials');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setError(`Login failed: ${err.message || 'Network error. Please check if the server is running.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="login-header">
          <h1>Admin Login</h1>
          <p>Sign in to access the admin panel</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              {/* <CiUser className="input-icon" /> */}
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@techshop.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              {/* <CiLock className="input-icon" /> */}
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Admin credentials: admin@techshop.com / admin123
          </p>
          <Link to="/" className="back-to-store">
            ← Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
