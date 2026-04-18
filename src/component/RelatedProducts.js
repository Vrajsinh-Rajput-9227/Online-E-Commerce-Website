import React, { useState, useEffect } from 'react';
import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import productManager from '../utils/productManager';
import { formatPrice } from '../utils/priceFormatter';
import './RelatedProducts.css';

const RelatedProducts = ({ currentProduct }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const loadRelatedProducts = async () => {
      try {
        const allProducts = await productManager.getAllProducts();
        const related = allProducts.filter(
          product => product.category === currentProduct?.category && product.id !== currentProduct?.id
        ).slice(0, 4); // Show max 4 related products
        setRelatedProducts(related);
      } catch (error) {
        console.error('Error loading related products:', error);
        setRelatedProducts([]);
      }
    };

    if (currentProduct) {
      loadRelatedProducts();
    }
  }, [currentProduct]);

  // If no related products found, don't render the component
  if (relatedProducts.length === 0) return null;

  const handleProductClick = () => {
    // Scroll to top when a product is clicked
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Navigation is handled by the Link component
  };

  return (
    <div className="related-products-section">
      <h2 className="section-title">You May Also Like</h2>
      <div className="related-products-grid">
        {relatedProducts.map((product) => (
          <Link 
            key={product.id}
            to={`/product/${product.id}`}
            state={{ product }}
            className="related-product-card"
            onClick={handleProductClick}
          >
            <div className="related-product-image">
              <img 
                src={product.image} 
                alt={product.name} 
                className="product-image"
                loading="lazy"
              />
              {product.originalPrice > product.price && (
                <div className="related-product-discount">
                  {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                </div>
              )}
            </div>
            <div className="related-product-info">
              <h3 className="related-product-title">{product.name}</h3>
              <div className="related-product-rating">
                {[1, 2, 3, 4, 5].map((star) => {
                  // Calculate if we should show a full, half, or empty star
                  if (star <= Math.floor(product.rating)) {
                    // Full star
                    return <FaStar key={star} className="star filled" />;
                  } else if (star === Math.ceil(product.rating) && product.rating % 1 >= 0.3) {
                    // Half star (show half star if remainder is 0.3 or more)
                    return <FaStarHalfAlt key={star} className="star half" />;
                  } else {
                    // Empty star
                    return <FaRegStar key={star} className="star" />;
                  }
                })}
                <span className="rating-count">
                  ({product.rating % 1 === 0 ? product.rating.toFixed(0) : product.rating.toFixed(1)})
                </span>
              </div>
              <div className="related-product-prices">
                <span className="current-price">{formatPrice(product.price)}</span>
                {product.originalPrice > product.price && (
                  <span className="original-price">{formatPrice(product.originalPrice)}</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
