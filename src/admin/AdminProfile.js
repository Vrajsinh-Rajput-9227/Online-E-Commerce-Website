import React, { useState, useEffect, useRef } from 'react';
import { FiUser, FiMail, FiPhone, FiCalendar, FiMapPin, FiEdit2, FiCamera, FiSave, FiLock, FiShield, FiClock, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';
import { useAdminAuth } from '../context/AdminAuthContext';
import axios from 'axios';
import './AdminProfile.css';

const AdminProfile = () => {
  const { admin, adminToken, updateAdminProfile } = useAdminAuth();
  const fileInputRef = useRef(null);
  
  // Create admin API instance with proper baseURL and auth
  const adminAPI = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  });
  
  // Add admin token to requests
  adminAPI.interceptors.request.use(
    (config) => {
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    profileImage: null
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    // Load admin profile data from database
    const loadProfileData = async () => {
      try {
        const response = await adminAPI.get('/admin/profile');
        
        if (response.data.success) {
          const adminData = response.data.data.admin;
          setProfileData({
            firstName: adminData.firstName || 'Admin',
            lastName: adminData.lastName || 'User',
            email: adminData.email || 'admin@techshop.com',
            profileImage: adminData.profileImage || null
          });
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
        // Fallback to auth context data
        setProfileData(prev => ({
          ...prev,
          firstName: admin?.name?.split(' ')[0] || 'Admin',
          lastName: admin?.name?.split(' ')[1] || 'User',
          email: admin?.email || 'admin@techshop.com'
        }));
      }
    };

    loadProfileData();
  }, [admin, adminToken]);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size should be less than 5MB' });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setProfileData(prev => ({
          ...prev,
          profileImage: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await adminAPI.put('/admin/profile', {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        profileImage: profileData.profileImage
      });
      
      if (response.data.success) {
        // Update admin data in context
        updateAdminProfile({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          profileImage: profileData.profileImage
        });
        
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile. Please try again.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long' });
      setLoading(false);
      return;
    }

    try {
      const response = await adminAPI.put('/admin/profile/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setIsChangingPassword(false);
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.message || 'Failed to change password. Please verify current password.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = async () => {
    setIsEditing(false);
    // Reload original data from database
    try {
      const response = await adminAPI.get('/admin/profile');
      
      if (response.data.success) {
        const adminData = response.data.data.admin;
        setProfileData({
          firstName: adminData.firstName || 'Admin',
          lastName: adminData.lastName || 'User',
          email: adminData.email || 'admin@techshop.com',
          profileImage: adminData.profileImage || null
        });
      }
    } catch (error) {
      console.error('Error reloading profile data:', error);
    }
  };

  const displayImage = previewImage || profileData.profileImage || `https://ui-avatars.com/api/?name=${profileData.firstName}+${profileData.lastName}&background=0d47a1&color=fff&size=150`;

  return (
    <div className="admin-profile">
      <div className="profile-header">
        <h1>Admin Profile</h1>
        <p>Manage your personal information and account settings</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.type === 'success' ? <FiCheck /> : <FiAlertCircle />}
          {message.text}
        </div>
      )}

      <div className="profile-container">
        {/* Profile Picture Section */}
        <div className="profile-picture-section">
          <div className="profile-picture-container">
            <img 
              src={displayImage} 
              alt="Profile" 
              className="profile-picture"
            />
            {isEditing && (
              <button 
                className="camera-button"
                onClick={() => fileInputRef.current.click()}
              >
                <FiCamera size={20} />
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </div>
          <h2>{profileData.firstName} {profileData.lastName}</h2>
          <p className="profile-email">{profileData.email}</p>
        </div>

        {/* Profile Information Section */}
        <div className="profile-info-section">
          <div className="section-header">
            <h3>Personal Information</h3>
            {!isEditing ? (
              <button 
                className="edit-button"
                onClick={() => setIsEditing(true)}
              >
                <FiEdit2 size={16} />
                Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button 
                  className="save-button"
                  onClick={handleSaveProfile}
                  disabled={loading}
                >
                  <FiSave size={16} />
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button 
                  className="cancel-button"
                  onClick={handleCancelEdit}
                >
                  <FiX size={16} />
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="info-grid">
            <div className="info-group">
              <label><FiUser size={16} /> First Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                />
              ) : (
                <span>{profileData.firstName}</span>
              )}
            </div>

            <div className="info-group">
              <label><FiUser size={16} /> Last Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                />
              ) : (
                <span>{profileData.lastName}</span>
              )}
            </div>

            <div className="info-group">
              <label><FiMail size={16} /> Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              ) : (
                <span>{profileData.email}</span>
              )}
            </div>
          </div>
        </div>

        {/* Security Settings Section */}
        <div className="security-settings-section">
          <div className="section-header">
            <h3><FiShield size={20} /> Security Settings</h3>
          </div>
          
          <div className="security-info">
            <div className="security-item">
              <FiShield size={16} />
              <span>Account Status: Active</span>
            </div>
            <div className="security-item">
              <FiLock size={16} />
              <span>Two-Factor Authentication: Not Enabled</span>
            </div>
            <div className="security-item">
              <FiClock size={16} />
              <span>Last Password Change: Never</span>
            </div>
            <div className="security-item">
              <FiUser size={16} />
              <span>Account Created: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Password Change Section */}
        <div className="password-section">
          <div className="section-header">
            <h3><FiLock size={20} /> Security Settings</h3>
            {!isChangingPassword ? (
              <button 
                className="edit-button"
                onClick={() => setIsChangingPassword(true)}
              >
                <FiLock size={16} />
                Change Password
              </button>
            ) : (
              <div className="edit-actions">
                <button 
                  className="save-button"
                  onClick={handleChangePassword}
                  disabled={loading}
                >
                  <FiSave size={16} />
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
                <button 
                  className="cancel-button"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                >
                  <FiX size={16} />
                  Cancel
                </button>
              </div>
            )}
          </div>

          {isChangingPassword && (
            <div className="password-form">
              <div className="info-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  placeholder="Enter current password"
                />
              </div>
              <div className="info-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  placeholder="Enter new password (min. 8 characters)"
                />
              </div>
              <div className="info-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          )}

          {!isChangingPassword && (
            <div className="security-info">
              <div className="security-item">
                <FiShield size={16} />
                <span>Last password change: Never</span>
              </div>
              <div className="security-item">
                <FiClock size={16} />
                <span>Two-factor authentication: Not enabled</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
