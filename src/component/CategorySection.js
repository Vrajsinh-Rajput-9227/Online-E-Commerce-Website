import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaShoppingCart } from 'react-icons/fa';
import './CategorySection.css';

const CategorySection = ({ title, products, category }) => {
  // Filter products by category
  const filteredProducts = products.filter(product => product.category === category);
  
  console.log(`🏷️ CategorySection [${title}]:`);
  console.log(`  - Total products received: ${products.length}`);
  console.log(`  - Looking for category: "${category}"`);
  console.log(`  - Filtered products: ${filteredProducts.length}`);
  console.log(`  - Filtered product names:`, filteredProducts.map(p => p.name));
  
  // If no products in this category, don't render the section
  if (filteredProducts.length === 0) {
    console.log(`❌ CategorySection [${title}]: Not rendering - no products found`);
    return null;
  }

  const addToCart = (product) => {
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = currentCart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      currentCart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(currentCart));
    window.dispatchEvent(new Event('cartUpdated'));
    
    // Show success feedback
    const button = document.getElementById(`category-add-to-cart-${product.id}`);
    if (button) {
      const originalText = button.innerHTML;
      button.innerHTML = '<FaShoppingCart /> Added!';
      button.style.backgroundColor = '#52c41a';
      setTimeout(() => {
        button.innerHTML = originalText;
        button.style.backgroundColor = '';
      }, 2000);
    }
  };

  return (
    <section className="category-section">
      <div className="container">
        <div className="section-header">
          <h2>{title}</h2>
          <Link to={`/products?category=${category.toLowerCase()}`} className="view-all">
            View All <FaArrowRight />
          </Link>
        </div>
        <div className="product-grid">
          {filteredProducts.slice(0, 4).map((product) => (
            <div className="product-card" key={product.id}>
              <div className="product-badges">
                {product.tags.map((tag, index) => (
                  <span key={index} className={`badge ${tag.toLowerCase()}`}>
                    {tag}
                  </span>
                ))}
              </div>
              <Link 
                to={`/product/${product.id}`} 
                state={{ product }}
                className="product-link"
              >
                <div className="product-image">
                  <img src={product.image} alt={product.name} />
                </div>
              </Link>
              <div className="product-info">
                <h3 className="product-title">
                  <Link to={`/product/${product.id}`} state={{ product }}>
                    {product.name}
                  </Link>
                </h3>
                <div className="price">
                  <span className="current-price">₹{product.price.toFixed(2)}</span>
                  {product.originalPrice > product.price && (
                    <span className="original-price">
                      ₹{product.originalPrice.toFixed(2)}
                    </span>
                  )}
                  {/* {product.discount > 0 && (
                    <span className="discount">{product.discount}% Off</span>
                  )} */}
                </div>
                <button 
                  className="add-to-cart-btn"
                  onClick={() => addToCart(product)}
                  id={`category-add-to-cart-${product.id}`}
                >
                  <FaShoppingCart /> Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
