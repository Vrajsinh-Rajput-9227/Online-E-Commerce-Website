import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import productManager from '../utils/productManager';
import ProductCard from '../component/ProductCard';
import './CategoryPage.css';

// Map categories to their respective placeholder banner images from Picsum Photos
const categoryBanners = {
  'laptops': 'https://picsum.photos/1600/400?random=1&grayscale&blur=1',
  'smartphones': 'https://picsum.photos/1600/400?random=2&grayscale&blur=1',
  'cameras': 'https://picsum.photos/1600/400?random=3&grayscale&blur=1',
  'audio': 'https://picsum.photos/1600/400?random=4&grayscale&blur=1',
  'wearables': 'https://picsum.photos/1600/400?random=5&grayscale&blur=1',
};

// Default banner image
const defaultBanner = 'https://picsum.photos/1600/400?random=0&grayscale&blur=1';


const CategoryPage = () => {
  const { category } = useParams();
  const [categoryProducts, setCategoryProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Get all products from API
    const loadCategoryProducts = async () => {
      try {
        const allProducts = await productManager.getAllProducts();
        
        // Filter products based on category from URL
        const filteredProducts = allProducts.filter(
          product => product.category.toLowerCase() === category.toLowerCase()
        );
        
        if (filteredProducts.length === 0) {
          // If no products found, redirect to home
          navigate('/');
          return;
        }
        
        setCategoryProducts(filteredProducts);
      } catch (error) {
        console.error('Error loading category products:', error);
        navigate('/');
      }
    };

    loadCategoryProducts();
  }, [category, navigate]);

  // Format category name for display (capitalize first letter and remove dashes)
  const formatCategoryName = (name) => {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };


  // Get the appropriate banner image for the category
  const bannerImage = categoryBanners[category.toLowerCase()] || defaultBanner;

  return (
    <div className="category-page">
      {/* Category Banner */}
      <div className="category-banner">
        <div className="banner-overlay">
          <h1 className="category-title">{formatCategoryName(category)}</h1>
          <p className="product-count">{categoryProducts.length} products available</p>
        </div>
      </div>
      
      <div className="container">
        {categoryProducts.length > 0 ? (
          <div className="products-grid">
            {categoryProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="no-products">
            <p>No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
