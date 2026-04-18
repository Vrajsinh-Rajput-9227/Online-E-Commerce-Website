import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaStar, FaRegStar, FaStarHalfAlt, FaShoppingCart, FaHeart, FaArrowLeft, FaInfoCircle, FaBoxOpen, FaUser } from 'react-icons/fa';
import RelatedProducts from '../component/RelatedProducts';
import productManager from '../utils/productManager';
import WishlistService from '../services/wishlistService';
import CartService from '../services/cartService';
import { formatPrice } from '../utils/priceFormatter';
import './ProductDetail.css';

// Color mapping function
const getColorHex = (colorName) => {
  const colorMap = {
    'black': '#000000',
    'white': '#ffffff',
    'off white': '#f8f8f8',
    'red': '#ff0000',
    'blue': '#0000ff',
    'green': '#008000',
    'yellow': '#ffff00',
    'orange': '#ffa500',
    'purple': '#800080',
    'pink': '#ffc0cb',
    'brown': '#964b00',
    'gray': '#808080',
    'grey': '#808080',
    'silver': '#c0c0c0',
    'gold': '#ffd700',
    'navy': '#000080',
    'teal': '#008080',
    'maroon': '#800000',
    'lime': '#00ff00',
    'aqua': '#00ffff',
    'fuchsia': '#ff00ff',
    'olive': '#808000',
    'mystic': '#1a1a1a',
    'mystic black': '#1a1a1a',
    'phantom black': '#0f0f0f',
    'bold black': '#000000',
    'awesome iceblue': '#87ceeb',
    'cool blue': '#4682b4',
    'onyx black': '#0d0d0d',
    'black infinity': '#000000',
    'mica silver': '#c0c0c0',
    'graphite black': '#2f2f2f',
    'carbon black': '#1c1c1c'
  };
  
  const lowerColorName = colorName.toLowerCase();
  return colorMap[lowerColorName] || '#cccccc'; // Default gray if color not found
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [activeTab, setActiveTab] = useState('specifications');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [visibleReviews, setVisibleReviews] = useState(2);
  const [showAllImages, setShowAllImages] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: '',
    name: ''
  });
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    // Get product from API
    const loadProduct = async () => {
      try {
        const foundProduct = await productManager.getProductById(id);
        
        if (foundProduct) {
          setProduct(foundProduct);
          setLoading(false);
          
          // Load reviews separately
          const reviewsData = await productManager.getReviewsByProduct(id);
          if (reviewsData.reviews && Array.isArray(reviewsData.reviews)) {
            const formattedReviews = reviewsData.reviews.map(review => ({
              id: review._id || Math.random().toString(36).substr(2, 9),
              user: review.user?.name || 'Anonymous',
              rating: review.rating,
              date: review.createdAt || new Date().toISOString().split('T')[0],
              comment: review.comment,
              verified: review.isVerifiedPurchase || true
            }));
            setReviews(formattedReviews);
          }
          
          // Set default color - handle both array and single color
          if (foundProduct.color) {
            const colors = Array.isArray(foundProduct.color) ? foundProduct.color : [foundProduct.color];
            if (colors.length > 0) {
              setSelectedColor(colors[0]);
            }
          }
          
          // Check if product is in wishlist
          try {
            const wishlistStatus = await WishlistService.isInWishlist(product.id);
            setIsInWishlist(wishlistStatus);
          } catch (error) {
            console.error('Error checking wishlist:', error);
          }
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading product:', error);
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, product?.id]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= 10) {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => {
    if (quantity < 10) setQuantity(quantity + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleAddToCart = async () => {
    try {
      await CartService.addToCart(product.id, quantity);
      
      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleBuyNow = async () => {
    try {
      // First add to cart
      handleAddToCart();
      
      // Then navigate to payment page
      navigate('/payment');
    } catch (error) {
      console.error('Error in Buy Now:', error);
      // Show error message to user
      alert('Failed to proceed to payment. Please try again.');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="star filled" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="star" />);
      } else {
        stars.push(<FaRegStar key={i} className="star" />);
      }
    }
    return stars;
  };

  const handleWriteReview = () => {
    setShowReviewForm(true);
  };

  const handleLoadMore = () => {
    setVisibleReviews(prev => Math.min(prev + 2, reviews.length));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to submit a review');
      return;
    }

    // Client-side validation
    if (newReview.rating === 0) {
      alert('Please select a rating');
      return;
    }

    if (!newReview.comment || newReview.comment.trim().length < 3) {
      alert('Review comment must be at least 3 characters long');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/reviews/product/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: Number(newReview.rating),
          comment: newReview.comment.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        // Refresh reviews from separate endpoint
        const reviewsData = await productManager.getReviewsByProduct(id);
        if (reviewsData.reviews && Array.isArray(reviewsData.reviews)) {
          const formattedReviews = reviewsData.reviews.map(review => ({
            id: review._id || Math.random().toString(36).substr(2, 9),
            user: review.user?.name || 'Anonymous',
            rating: review.rating,
            date: review.createdAt || new Date().toISOString().split('T')[0],
            comment: review.comment,
            verified: review.isVerifiedPurchase || true
          }));
          setReviews(formattedReviews);
        }
        
        // Refresh product data to get updated rating
        const updatedProduct = await productManager.getProductById(id);
        if (updatedProduct) {
          setProduct(updatedProduct);
        }
        
        setNewReview({ rating: 0, comment: '', name: '' });
        setShowReviewForm(false);
        setVisibleReviews(1);
      } else {
        alert(data.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  const handleRatingChange = (rating) => {
    setNewReview({ ...newReview, rating });
  };

  const toggleWishlist = async () => {
    if (!product) return;
    
    try {
      const newStatus = await WishlistService.toggleWishlist(product.id);
      setIsInWishlist(newStatus);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading product details...</div>;
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <div>Product not found</div>
        <button onClick={() => navigate('/')} className="back-button">
          <FaArrowLeft /> Back to Home
        </button>
      </div>
    );
  }

  const allImages = product.additionalImages && product.additionalImages.length > 0 
    ? [product.image, ...product.additionalImages.filter(img => img !== product.image)]
    : [product.image];
  const toggleShowAllImages = () => {
    setShowAllImages(!showAllImages);
  };
  const displayedImages = showAllImages ? allImages : allImages.slice(0, 4);

  // Sample specifications data
  const specifications = {
    'Product Information': [
      { name: 'Brand', value: product.brand || 'Generic' },
      { name: 'Model', value: product.model || 'N/A' },
      { name: 'Color', value: selectedColor || product.color || 'As shown in picture' },
      { name: 'Material', value: product.material || 'High-quality materials' },
      { name: 'Dimensions', value: product.dimensions || 'N/A' },
      { name: 'Weight', value: product.weight || 'N/A' },
    ],
    'Additional Details': [
      { name: 'Warranty', value: product.warranty || '1 Year Manufacturer Warranty' },
      { name: 'SKU', value: product.sku || 'N/A' },
      { name: 'Release Date', value: product.releaseDate || 'N/A' },
      { name: 'Manufacturer', value: product.manufacturer || 'Generic' },
      { name: 'Country of Origin', value: product.origin || 'Varies' },
      { name: 'ASIN', value: product.asin || 'N/A' },
    ]
  };

  return (
    <>
    {showSuccess && (
  <div className="success-popup-container">
    <div className="success-popup-content">
      <div className="success-icon">✓</div>
      <div className="success-text-wrapper">
        <p className="success-title">Added to Cart!</p>
        <p className="success-subtitle">{product.name} is now in your basket.</p>
      </div>
    </div>
  </div>
    )}

    <div className="product-detail-container">
      <div className="breadcrumb">
        <Link to="/">Home</Link> / <span>{product.name}</span>
      </div>

      <div className="product-detail">
        <div className="product-gallery">
          <div className="thumbnail-container">
            {displayedImages.map((img, index) => (
              <div
                key={index}
                className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                onClick={() => setSelectedImage(index)}
              >
                <img src={img} alt={`${product.name} ${index + 1}`} />
              </div>
            ))}
            {allImages.length > 4 && (
              <button 
                className="view-more-btn"
                onClick={toggleShowAllImages}
                aria-label={showAllImages ? 'Show less images' : `Show ${allImages.length - 4} more images`}
              >
                {showAllImages ? '▲ Show Less' : `+${allImages.length - 4} More`}
              </button>
            )}
          </div>
          <div className="main-image">
            <img src={allImages[selectedImage]} alt={product.name} />
          </div>
        </div>

        <div className="product-info">
          <h1 className="product-title">{product.name}</h1>
          
          <div className="product-rating">
            <div className="stars">
              {renderStars(product.rating?.average || product.rating || 0)}
              <span className="rating-text">{(product.rating?.average || product.rating || 0).toFixed(1)}</span>
            </div>
            <span className="reviews">({reviews.length} reviews)</span>
            <span className={`stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          <div className="price-container">
            <span className="current-price">{formatPrice(product.price)}</span>
            {product.originalPrice > product.price && (
              <span className="original-price">{formatPrice(product.originalPrice)}</span>
            )}
            {/* {product.discount > 0 && (
              <span className="discount-badge">-{product.discount}%</span>
            )} */}
          </div>

          {/* Color Selection */}
          {product.color && (
            <div className="color-selector">
              <label>Color:</label>
              <div className="color-options">
                {Array.isArray(product.color) ? (
                  product.color.map((color, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                      onClick={() => setSelectedColor(color)}
                      title={color}
                      aria-label={`Select ${color} color`}
                    >
                      <span 
                        className="color-swatch" 
                        style={{ 
                          backgroundColor: getColorHex(color),
                          border: getColorHex(color) === '#ffffff' || getColorHex(color) === '#f0f0f0' ? '1px solid #ddd' : 'none'
                        }}
                      />
                      <span className="color-name">{color}</span>
                    </button>
                  ))
                ) : (
                  <button
                    type="button"
                    className="color-option selected"
                    disabled
                  >
                    <span 
                      className="color-swatch" 
                      style={{ 
                        backgroundColor: getColorHex(product.color),
                        border: getColorHex(product.color) === '#ffffff' || getColorHex(product.color) === '#f0f0f0' ? '1px solid #ddd' : 'none'
                      }}
                    />
                    <span className="color-name">{product.color}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="quantity-selector">
            <label>Quantity:</label>
            <div className="quantity-controls">
              <button type="button" onClick={decrementQuantity} aria-label="Decrease quantity">-</button>
              <input
                type="number"
                min="1"
                max="10"
                value={quantity}
                onChange={handleQuantityChange}
                aria-label="Quantity"
              />
              <button type="button" onClick={incrementQuantity} aria-label="Increase quantity">+</button>
            </div>
          </div>

          <div className="action-buttons">
            <button 
              type="button" 
              className="add-to-cart" 
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              <FaShoppingCart className="icon" /> {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button 
              type="button" 
              className="buy-now" 
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
            >
              {product.stock <= 0 ? 'Out of Stock' : 'Buy Now'}
            </button>
            <button 
              type="button" 
              className={`wishlist ${isInWishlist ? 'in-wishlist' : ''}`}
              onClick={toggleWishlist}
              aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <FaHeart className="icon" /> {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
            </button>
          </div>

          <div className="product-meta">
            <div className="meta-item">
              <span className="meta-label">Brand:</span>
              <span className="meta-value">{product.brand || 'Generic'}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Model:</span>
              <span className="meta-value">{product.model || 'N/A'}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Warranty:</span>
              <span className="meta-value">{product.warranty || '1 Year'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications Section */}
      <div className="specifications-section">
        <h2 className="section-title">Product Details</h2>
        
        <div className="specs-tabs">
          <button 
            type="button"
            className={`tab-button ${activeTab === 'specifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('specifications')}
          >
            <FaInfoCircle className="tab-icon" /> Specifications
          </button>
          <button 
            type="button"
            className={`tab-button ${activeTab === 'additional' ? 'active' : ''}`}
            onClick={() => setActiveTab('additional')}
          >
            <FaBoxOpen className="tab-icon" /> Additional Information
          </button>
        </div>

        <div className="specs-content">
          <table className="specs-table">
            <tbody>
              {activeTab === 'specifications' ? (
                specifications['Product Information'].map((spec, index) => (
                  <tr key={index} className="spec-row">
                    <td className="spec-name">{spec.name}</td>
                    <td className="spec-value">{spec.value}</td>
                  </tr>
                ))
              ) : (
                specifications['Additional Details'].map((spec, index) => (
                  <tr key={index} className="spec-row">
                    <td className="spec-name">{spec.name}</td>
                    <td className="spec-value">{spec.value}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Description */}
      <div className="description-section">
        <h2 className="section-title">Product Description</h2>
        <p className="product-description">
          {product.description || 'No description available for this product.'}
        </p>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <h2 className="section-title">Customer Reviews</h2>
        
        <div className="reviews-summary">
          <div className="average-rating">
            <span className="rating-big">{(product.rating?.average || product.rating || 0).toFixed(1)}</span>
            <div className="stars">
              {renderStars(product.rating?.average || product.rating || 0)}
              <span className="reviews-count">({reviews.length} reviews)</span>
            </div>
          </div>
          
          <button 
            type="button"
            className="write-review-btn"
            onClick={handleWriteReview}
          >
            Write a Review
          </button>
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <div className="review-form-container">
            <h3>Write a Review</h3>
            <form onSubmit={handleReviewSubmit} className="review-form">
              <div className="form-group">
                <label>Rating: {newReview.rating > 0 ? `${newReview.rating} star${newReview.rating > 1 ? 's' : ''}` : 'Please select a rating'}</label>
                <div className="rating-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${star <= newReview.rating ? 'filled' : ''}`}
                      onClick={() => handleRatingChange(star)}
                      style={{ cursor: 'pointer' }}
                    >
                      {star <= newReview.rating ? <FaStar /> : <FaRegStar />}
                    </span>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="review-comment">Your Review:</label>
                <textarea
                  id="review-comment"
                  value={newReview.comment}
                  onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                  placeholder="Share your experience with this product (minimum 3 characters)"
                  rows="4"
                  required
                  minLength="3"
                ></textarea>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowReviewForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-review-btn">
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="reviews-list">
          {reviews.length > 0 ? (
            reviews.slice(0, visibleReviews).map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <div className="product-user-avatar">
                    <FaUser />
                  </div>
                  <div className="user-info">
                    <div className="user-name-container">
                      <span className="user-name">{review.user}</span>
                      {review.verified && <span className="verified-badge">Verified Purchase</span>}
                    </div>
                    <div className="review-rating">
                      {[...Array(5)].map((_, i) => (
                        i < review.rating ? 
                          <FaStar key={i} className="star filled" /> : 
                          <FaRegStar key={i} className="star" />
                      ))}
                      <span className="review-date">{new Date(review.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <p className="review-comment">{review.comment}</p>
              </div>
            ))
          ) : (
            <div className="no-reviews">
              <p>No reviews yet. Be the first to review this product!</p>
            </div>
          )}
        </div>
        
        {visibleReviews < reviews.length && (
          <button 
            type="button"
            className="load-more-reviews"
            onClick={handleLoadMore}
          >
            Load More Reviews
          </button>
        )}
      </div>
      
      <RelatedProducts currentProduct={product} />
      
      {/* Success Message */}
      {showSuccess && (
        <div className="success-message">
          <div className="success-content">
            <span>✓</span>
            <p>Product added to cart successfully!</p>
          </div>
        </div>
      )}
    </div>
  </>
  );
};

export default ProductDetail;