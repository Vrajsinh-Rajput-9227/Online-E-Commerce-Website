import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CiSearch, CiUser, CiLogout, CiSettings, CiMedicalClipboard } from "react-icons/ci";
import { useAdminAuth } from '../context/AdminAuthContext';
import './AdminHeader.css';

function AdminHeader() {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const { admin, adminLogout } = useAdminAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/admin/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
    }
  };

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const closeProfileDropdown = () => {
    setIsProfileDropdownOpen(false);
  };

  // Get admin name for display
  const getAdminDisplayName = () => {
    if (admin?.firstName && admin?.lastName) {
      return `${admin.firstName} ${admin.lastName}`;
    }
    return admin?.name || admin?.username || 'Admin';
  };

  // Get profile image URL
  const getProfileImage = () => {
    if (admin?.profileImage) {
      return admin.profileImage;
    }
    // Generate avatar URL with name
    const name = getAdminDisplayName();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0d47a1&color=fff&size=40`;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileDropdownOpen && !event.target.closest('.profile-dropdown') && !event.target.closest('.profile-trigger')) {
        closeProfileDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  return (
    <header className="admin-header">
      <div className="admin-header-container">
        {/* Left side - TechShop Logo */}
        <div className="admin-header-left">
          <Link to="/admin" className="admin-logo">
            <span className="admin-logo-text">Tech</span>
            <span className="admin-logo-highlight">Shop</span>
            <span className="admin-badge">Admin</span>
          </Link>
        </div>

        {/* Middle - Search Bar */}
        <div className="admin-header-center">
          <div className="admin-search-container">
            <form className="admin-search-form" onSubmit={handleSearchSubmit}>
              <div className="admin-search-input-container">
                <CiSearch size={18} className="admin-search-icon" />
                <input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search products, orders, users..."
                  className="admin-search-input"
                  aria-label="Search admin panel"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button type="submit" className="admin-search-button" aria-label="Search">
                <CiSearch size={16} />
              </button>
            </form>
          </div>
        </div>

        {/* Right side - Profile Section */}
        <div className="admin-header-right">
          <div className="profile-dropdown">
            <button
              className="profile-trigger"
              onClick={toggleProfileDropdown}
              aria-label="Profile menu"
              aria-expanded={isProfileDropdownOpen}
            >
              <img src={getProfileImage()} alt={getAdminDisplayName()} className="profile-header-avatar" />
              <span className="profile-name">{getAdminDisplayName()}</span>
              <span className="profile-arrow">▼</span>
            </button>

            {isProfileDropdownOpen && (
              <div className="profile-menu">
                <div className="profile-header">
                  <div className="profile-avatar">
                    <img src={getProfileImage()} alt={getAdminDisplayName()} />
                  </div>
                  <div className="profile-info">
                    <div className="profile-name">{getAdminDisplayName()}</div>
                    <div className="profile-email">{admin?.email || 'admin@techshop.com'}</div>
                    <div className="profile-role">Administrator</div>
                  </div>
                </div>
                
                <div className="profile-divider"></div>
                
                <button
                  className="profile-item"
                  onClick={() => {
                    navigate('/admin/profile');
                    closeProfileDropdown();
                  }}
                >
                  <CiUser size={16} />
                  <span>Profile Settings</span>
                </button>
                
                {/* <button
                  className="profile-item"
                  onClick={() => {
                    navigate('/admin/settings');
                    closeProfileDropdown();
                  }}
                >
                  <CiSettings size={16} />
                  <span>Admin Settings</span>
                </button> */}
                
                <button
                  className="profile-item"
                  onClick={() => {
                    navigate('/admin/orders');
                    closeProfileDropdown();
                  }}
                >
                  <CiMedicalClipboard size={16} />
                  <span>Order Management</span>
                </button>
                
                <div className="profile-divider"></div>
                
                <button
                  className="profile-item logout-item"
                  onClick={handleLogout}
                >
                  <CiLogout size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
