// In Home.js
import React, { useState, useEffect } from 'react';
import Carousel from '../component/Carousel';
import FeatureCards from '../component/FeatureCards';
import ProductList from '../component/ProductList';
import CategorySection from '../component/CategorySection';
import RandomBanner from '../component/RandomBanner';
import Newsletter from '../component/Newsletter'; // Add this import
import TestimonialsSection from '../component/TestimonialsSection';
import './Home.css';
import productManager from '../utils/productManager';

function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Get products from API
    const loadProducts = async () => {
      try {
        console.log('🔄 Home: Starting product fetch...');
        const allProducts = await productManager.getAllProducts();
        console.log('✅ Home: Products fetched:', allProducts.length, 'items');
        console.log('📦 Home: Product categories:', allProducts.map(p => ({ name: p.name, category: p.category })));
        
        // Filter for debugging
        const laptops = allProducts.filter(p => p.category === 'Laptops');
        const smartphones = allProducts.filter(p => p.category === 'Smartphones');
        
        console.log('💻 Home: Laptops found:', laptops.length, laptops.map(l => l.name));
        console.log('📱 Home: Smartphones found:', smartphones.length, smartphones.map(s => s.name));
        
        setProducts(allProducts);
      } catch (error) {
        console.error('❌ Home: Error loading products:', error);
        setProducts([]);
      }
    };

    loadProducts();
  }, []);

  return (
    <div className="home">
      <Carousel />
      <FeatureCards />
      
      <div className="container">
        <CategorySection 
          title="Top Laptops" 
          products={products} 
          category="Laptops" 
        />
        
        <RandomBanner />
        
        <CategorySection 
          title="Latest Smartphones" 
          products={products} 
          category="Smartphones" 
        />
        
        <RandomBanner />
        
        <ProductList />

        <TestimonialsSection />

        {/* Add the Newsletter component here */}
        <Newsletter />
      </div>
    </div>
  );
}

export default Home;