import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CiUser, CiSearch, CiMenuFries, CiShoppingCart, CiCircleRemove, CiHeart, CiLocationOn, CiPhone, CiMail, CiMedicalClipboard, CiLogout } from "react-icons/ci";
import productManager from '../utils/productManager';
import { useAuth } from '../context/AuthContext';
import CartService from '../services/cartService';
import WishlistService from '../services/wishlistService';

import './Header.css';

function Header() {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [location, setLocation] = useState('');
  const [pincode, setPincode] = useState('');
  const [savedLocation, setSavedLocation] = useState('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  // Get trendy products from search products
  const [trendyProducts, setTrendyProducts] = useState([]);

  useEffect(() => {
    // Fetch trendy products from API when component mounts
    const loadTrendyProducts = async () => {
      try {
        const allProducts = await productManager.getAllProducts();
        const trendy = [...allProducts]
          .sort((a, b) => {
            // Sort by rating first, then by number of reviews
            const ratingDiff = b.rating - a.rating;
            if (ratingDiff !== 0) return ratingDiff;
            return b.reviews - a.reviews;
          })
          .slice(0, 4);
        setTrendyProducts(trendy);
      } catch (error) {
        console.error('Error loading trendy products:', error);
        setTrendyProducts([]);
      }
    };

    loadTrendyProducts();
  }, []);

  // Load cart and wishlist counts on component mount
  useEffect(() => {
    const updateCounts = async () => {
      // Update cart count using cart service
      try {
        const cartData = await CartService.getCart();
        setCartCount(cartData.totalItems);
      } catch (error) {
        console.error('Error fetching cart count:', error);
        // Fallback to localStorage for guest users
        const count = CartService.getCartCount();
        setCartCount(count);
      }

      // Update wishlist count using wishlist service
      try {
        const wishlistData = await WishlistService.getWishlist();
        setWishlistCount(wishlistData.wishlist.length);
      } catch (error) {
        console.error('Error fetching wishlist count:', error);
        // Fallback to localStorage for guest users
        const count = WishlistService.getWishlistCount();
        setWishlistCount(count);
      }

      // Load saved location
      const savedLoc = localStorage.getItem('userLocation');
      if (savedLoc) {
        try {
          const locationData = JSON.parse(savedLoc);
          setSavedLocation(locationData.location || '');
        } catch (e) {
          console.error('Error parsing location data:', e);
        }
      }
    };

    // Initial load
    updateCounts();

    // Listen for updates
    window.addEventListener('cartUpdated', updateCounts);
    window.addEventListener('wishlistUpdated', updateCounts);
    
    return () => {
      window.removeEventListener('cartUpdated', updateCounts);
      window.removeEventListener('wishlistUpdated', updateCounts);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserDropdownOpen && !event.target.closest('.user-dropdown') && !event.target.closest('.top-account-dropdown')) {
        closeUserDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserDropdownOpen]);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    logout();
    // Clear saved location when user logs out
    localStorage.removeItem('userLocation');
    setSavedLocation('');
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    }
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
  };

  const navigateToCart = (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: '/cart', message: 'Please login to view your cart' } });
    } else {
      navigate('/cart');
    }
    setIsMenuOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      closeSearch();
      setSearchTerm('');
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Simple search logic - using product manager
  const handleSearch = async (searchValue) => {
    if (searchValue.trim() === '') {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const allProducts = await productManager.getAllProducts();
      const filtered = allProducts.filter(product => 
        product.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        (product.category && product.category.toLowerCase().includes(searchValue.toLowerCase())) ||
        (product.brand && product.brand.toLowerCase().includes(searchValue.toLowerCase())) ||
        (product.description && product.description.toLowerCase().includes(searchValue.toLowerCase()))
      );
      setSearchSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchSuggestions([]);
    }
  };

  useEffect(() => {
    handleSearch(searchTerm);
  }, [searchTerm]);

  const handleSuggestionClick = (product) => {
    navigate(`/product/${product.id}`);
    setSearchTerm('');
    setSearchSuggestions([]);
    setShowSuggestions(false);
    closeSearch();
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
    closeSearch();
  };

  const toggleLocation = () => {
    setIsLocationOpen(!isLocationOpen);
  };

  const closeLocation = () => {
    setIsLocationOpen(false);
    setLocation('');
    setPincode('');
  };

  const handleLocationSubmit = (e) => {
    e.preventDefault();
    if (location.trim() || pincode.trim()) {
      const locationData = {
        location: location.trim(),
        pincode: pincode.trim(),
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('userLocation', JSON.stringify(locationData));
      setSavedLocation(location.trim() || `Pincode: ${pincode.trim()}`);
      closeLocation();
    }
  };

  const handleLocationChange = (value) => {
    setLocation(value);
  };

  const handlePincodeChange = (value) => {
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setPincode(numericValue);
  };

  const toggleUserDropdown = () => {
    const willOpen = !isUserDropdownOpen;
    setIsUserDropdownOpen(willOpen);
    
    // Check dropdown positioning after it becomes visible
    if (willOpen) {
      setTimeout(() => {
        const dropdown = document.querySelector('.top-account-menu');
        if (dropdown) {
          const rect = dropdown.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          
          if (rect.bottom > viewportHeight - 20) { // 20px padding from bottom
            dropdown.classList.add('flip-up');
          } else {
            dropdown.classList.remove('flip-up');
          }
        }
      }, 0);
    }
  };

  const closeUserDropdown = () => {
    setIsUserDropdownOpen(false);
  };

  const toggleCategoryDropdown = () => {
    setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
  };

  const closeCategoryDropdown = () => {
    setIsCategoryDropdownOpen(false);
  };

  const handleCategoryClick = (category) => {
    navigate(`/category/${category}`);
    closeCategoryDropdown();
  };

  return (
    <>
      {/* Top Header Bar */}
      <div className="top-header">
        <div className="top-header-container">
          <div className="top-header-left">
            <div className="contact-info">
              <span className="contact-item">
                <CiPhone size={16} />
                <span>+91 98765 43210</span>
              </span>
              <span className="contact-item">
                <CiMail size={16} />
                <span>support@techshop.com</span>
              </span>
            </div>
          </div>
          <div className="top-header-right">
            <div className="top-nav-links">
              <Link 
                to="#" 
                className="top-nav-link"
                onClick={toggleLocation}
                aria-label="Select location"
                title={savedLocation || "Select location"}
              >
                <CiLocationOn size={16} />
                <span>{savedLocation || "Location"}</span>
              </Link>
              <Link to="/track-order" className="top-nav-link">Track Order</Link>
              {user ? (
                <div className="top-account-dropdown">
                  <div 
                    className="top-account-trigger"
                    onClick={toggleUserDropdown}
                    aria-label="Account menu"
                    aria-expanded={isUserDropdownOpen}
                    role="button"
                    tabIndex="0"
                  >
                    <CiUser size={16} />
                    <span>{user.name || user.email || 'My Account'}</span>
                  </div>
                  
                  {isUserDropdownOpen && (
                    <div className="top-account-menu">
                      <button 
                        className="top-account-item"
                        onClick={() => {
                          navigate('/account');
                          closeUserDropdown();
                        }}
                      >
                        <CiUser size={16} />
                        <span>My Account</span>
                      </button>
                      {/* <button 
                        className="top-account-item"
                        onClick={() => {
                          navigate('/account/information');
                          closeUserDropdown();
                        }}
                      >
                        <CiCircleInfo size={16} />
                        <span>Information</span>
                      </button> */}
                      <button 
                        className="top-account-item"
                        onClick={() => {
                          navigate('/account/orders');
                          closeUserDropdown();
                        }}
                      >
                        <CiMedicalClipboard size={16} />
                        <span>Order History</span>
                      </button>
                      {/* <button 
                        className="top-account-item"
                        onClick={() => {
                          navigate('/account/order-slip');
                          closeUserDropdown();
                        }}
                      >
                        <CiFileOn size={16} />
                        <span>Order Slip</span>
                      </button> */}
                      <div className="top-account-divider"></div>
                      <button 
                        className="top-account-item logout-item"
                        onClick={handleLogout}
                      >
                        <CiLogout size={16} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link 
                  to="/login" 
                  className="top-nav-link"
                  onClick={handleLoginClick}
                >
                  <CiUser size={16} />
                  <span>My Account</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <header className="header">
        <div className="header-container">
          <Link to="/" className="header-logo">
            <span className="logo-text">Tech</span>
            <span className="logo-highlight">Shop</span>
          </Link>

          <div className="header-center">
            <div className="search-container">
              <form className="search-form" onSubmit={handleSearchSubmit}>
                <div className="search-input-container">
                  <input 
                    ref={searchInputRef}
                    type="search" 
                    placeholder="Search Product Here..." 
                    className="s-search-input" 
                    aria-label="Search products"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => {
                      toggleSearch();
                      if (searchTerm.trim() && searchSuggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    onBlur={() => {
                      // Small delay to allow click on suggestions
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                  />
                  {showSuggestions && searchSuggestions.length > 0 && (
                    <div className="search-suggestions">
                      {searchSuggestions.map((product) => (
                        <div 
                          key={product.id} 
                          className="suggestion-item"
                          onMouseDown={() => handleSuggestionClick(product)}
                        >
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="suggestion-image"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/50x50?text=No+Image';
                            }}
                          />
                          <div className="suggestion-details">
                            <div className="suggestion-name">{product.name}</div>
                            <div className="suggestion-category">{product.category}</div>
                            <div className="suggestion-description">{product.description}</div>
                            <div className="suggestion-price">
                              {product.discount > 0 ? (
                                <>
                                  <span className="sale-price">₹{product.price?.toLocaleString() || ''}</span>
                                  <span className="original-price">₹{product.originalPrice?.toLocaleString() || ''}</span>
                                </>
                              ) : (
                                <span>₹{product.price?.toLocaleString() || ''}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button type="submit" className="search-button" aria-label="Search">
                  <CiSearch size={20} color="white" />
                </button>
              </form>
            </div>
          </div>

          <div className="header-right">
            <div className="action-buttons">
              <Link 
                to="/wishlist" 
                className="wishlist-button"
                aria-label={`Wishlist (${wishlistCount} items)`}
              >
                <CiHeart size={22} />
                <span className="button-text">Wishlist</span>
                {wishlistCount > 0 && <span className="wishlist-count">{wishlistCount}</span>}
              </Link>
              
              <Link 
                to="/cart" 
                className="cart-button"
                onClick={(e) => {
                  e.preventDefault();
                  navigateToCart(e);
                }}
                aria-label={`Cart (${cartCount} items)`}
              >
                <CiShoppingCart size={22} />
                <span className="button-text">Cart</span>
                {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
              </Link>
            </div>
          </div>

          <button 
            className="nav-toggle" 
            onClick={toggleMenu} 
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation"
          >
            <CiMenuFries size={24} />
          </button>
        </div>
        {isMenuOpen && <div className="menu-overlay" onClick={toggleMenu}></div>}
      </header>

      {/* Middle Header - Categories */}
      <div className="middle-header">
        <div className="middle-header-container">
          <div className="category-dropdown">
            <button 
              className="category-button"
              onClick={toggleCategoryDropdown}
              onMouseEnter={() => setIsCategoryDropdownOpen(true)}
              onMouseLeave={() => setIsCategoryDropdownOpen(false)}
            >
              <CiMenuFries size={18} />
              <span>Browse Categories</span>
            </button>
            <div className={`category-menu ${isCategoryDropdownOpen ? 'show' : ''}`}>
              <button 
                className="category-item"
                onClick={() => handleCategoryClick('laptops')}
              >
                <span>Laptops</span>
              </button>
              <button 
                className="category-item"
                onClick={() => handleCategoryClick('smartphones')}
              >
                <span>Smartphones</span>
              </button>
              <button 
                className="category-item"
                onClick={() => handleCategoryClick('wearables')}
              >
                <span>Wearables</span>
              </button>
              <button 
                className="category-item"
                onClick={() => handleCategoryClick('cameras')}
              >
                <span>Cameras</span>
              </button>
              <button 
                className="category-item"
                onClick={() => handleCategoryClick('audio')}
              >
                <span>Audio</span>
              </button>
            </div>
          </div>
          
          <nav className="main-nav-links">
            {/* <Link to="/" className="main-nav-link">Home</Link> */}
            <Link to="/products" className="main-nav-link">Products</Link>
          </nav>
          
          <nav className="category-nav">
            <button 
              className="category-link"
              onClick={() => handleCategoryClick('laptops')}
            >
              Laptops
            </button>
            <button 
              className="category-link"
              onClick={() => handleCategoryClick('smartphones')}
            >
              Smartphones
            </button>
            <button 
              className="category-link"
              onClick={() => handleCategoryClick('wearables')}
            >
              Wearables
            </button>
            <button 
              className="category-link"
              onClick={() => handleCategoryClick('cameras')}
            >
              Cameras
            </button>
            <button 
              className="category-link"
              onClick={() => handleCategoryClick('audio')}
            >
              Audio
            </button>
            <Link to="/about" className="category-link">About</Link>
            <Link to="/contact" className="category-link">Contact</Link>
          </nav>
        </div>
      </div>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="search-overlay">
          <div className="search-overlay-content">
            <div className="search-overlay-header">
              <form className="search-overlay-form" onSubmit={handleSearchSubmit}>
                <div className="search-overlay-input-container">
                  <CiSearch size={24} className="search-icon" />
                  <input
                    ref={searchInputRef}
                    type="search"
                    placeholder="Search products..."
                    className="search-overlay-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                  />
                </div>
                <button type="button" className="close-search" onClick={closeSearch}>
                  Close
            </button>
              </form>
            </div>
            
            <div className="trending-products">
              {/* Show search suggestions when there's a search term */}
              {searchTerm.trim() && showSuggestions && searchSuggestions.length > 0 ? (
                <>
                  <h3 className="trending-title">Search Suggestions</h3>
                  <div className="trending-grid">
                    {searchSuggestions.map((product) => (
                      <div 
                        key={product.id} 
                        className="trending-product"
                        onClick={() => handleSuggestionClick(product)}
                      >
                        {product.discount > 0 && <span className="sale-badge">SALE</span>}
                        <div className="product-image">
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/200x200?text=No+Image';
                            }}
                          />
                        </div>
                        <div className="product-info">
                          <h4 className="product-name">{product.name}</h4>
                          <div className="product-price">
                            {product.discount > 0 ? (
                              <>
                                <span className="original-price">₹{product.originalPrice?.toLocaleString() || ''}</span>
                                <span className="sale-price">₹{product.price?.toLocaleString() || ''}</span>
                              </>
                            ) : (
                              <span>₹{product.price?.toLocaleString() || ''}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <h3 className="trending-title">Trendy Products</h3>
                  <div className="trending-grid">
                    {trendyProducts.map((product) => (
                      <div 
                        key={product.id} 
                        className="trending-product"
                        onClick={() => handleProductClick(product.id)}
                      >
                        {product.discount > 0 && <span className="sale-badge">SALE</span>}
                        <div className="product-image">
                          <img src={product.image} alt={product.name} onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/200x200?text=No+Image';
                          }} />
                        </div>
                        <div className="product-info">
                          <h4 className="product-name">{product.name}</h4>
                          <div className="product-price">
                            {product.discount > 0 ? (
                              <>
                                <span className="original-price">₹{product.originalPrice?.toLocaleString() || ''}</span>
                                <span className="sale-price">₹{product.price?.toLocaleString() || ''}</span>
                              </>
                            ) : (
                              <span>₹{product.price?.toLocaleString() || ''}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="search-overlay-backdrop" onClick={closeSearch}></div>
        </div>
      )}

      {/* Location Overlay */}
      {isLocationOpen && (
        <div className="location-overlay">
          <div className="location-overlay-content">
            <div className="location-overlay-header">
              <h2 className="location-title">Select Your Location</h2>
              <button type="button" className="close-location" onClick={closeLocation}>
                <CiCircleRemove size={24} />
              </button>
            </div>
            
            <div className="location-form-container">
              <form className="location-form" onSubmit={handleLocationSubmit}>
                <div className="location-input-group">
                  <label htmlFor="location-input" className="location-label">
                    Enter Your Location
                  </label>
                  <input
                    id="location-input"
                    type="text"
                    placeholder="e.g., Mumbai, Delhi, Bangalore..."
                    className="location-input"
                    value={location}
                    onChange={(e) => handleLocationChange(e.target.value)}
                  />
                </div>
                
                <div className="location-divider">
                  <span>OR</span>
                </div>
                
                <div className="location-input-group">
                  <label htmlFor="pincode-input" className="location-label">
                    Enter Pincode
                  </label>
                  <input
                    id="pincode-input"
                    type="text"
                    placeholder="6-digit pincode"
                    className="location-input"
                    value={pincode}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    maxLength={6}
                  />
                </div>
                
                <div className="location-actions">
                  <button type="button" className="location-cancel-btn" onClick={closeLocation}>
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="location-submit-btn"
                    disabled={!location.trim() && !pincode.trim()}
                  >
                    Save Location
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div className="location-overlay-backdrop" onClick={closeLocation}></div>
        </div>
      )}
    </>
  );
}

export default Header;