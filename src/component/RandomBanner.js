import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/RandomBanner.css';

// Import local banner images
import Banner1 from '../assets/e_products/product1_1.jpg';
import Banner2 from '../assets/e_products/product3_1.jpg';
import Banner3 from '../assets/e_products/product5_1.jpg';
import Banner4 from '../assets/e_products/product7_1.jpg';

// Sample banner data - you can replace these with your actual banner images and links
const banners = [
  {
    id: 1,
    title: 'Premium Laptops',
    subtitle: 'Experience ultimate performance with our latest models',
    image: Banner1,
    link: '/category/laptops',
    buttonText: 'Shop Now',
    bgColor: '#2c3e50',
    textColor: '#ffffff'
  },
  {
    id: 2,
    title: 'Smart Home Devices',
    subtitle: 'Upgrade your living space with smart technology',
    image: Banner2,
    link: '/category/smart-home',
    buttonText: 'Discover',
    bgColor: '#16a085',
    textColor: '#ffffff'
  },
  {
    id: 3,
    title: 'Smart Watches',
    subtitle: 'Stay connected with our latest wearable tech',
    image: Banner3,
    link: '/category/wearables',
    buttonText: 'View Collection',
    bgColor: '#8e44ad',
    textColor: '#ffffff'
  },
  {
    id: 4,
    title: 'Audio & Speakers',
    subtitle: 'Immersive sound experience for music lovers',
    image: Banner4,
    link: '/category/audio',
    buttonText: 'Listen Now',
    bgColor: '#c0392b',
    textColor: '#ffffff'
  }
];

const RandomBanner = () => {
  // Select a random banner from the array
  const randomBanner = banners[Math.floor(Math.random() * banners.length)];

  return (
    <div className="random-banner" style={{ 
      backgroundColor: randomBanner.bgColor,
      color: randomBanner.textColor 
    }}>
      <div className="banner-content">
        <div className="banner-text">
          <h2>{randomBanner.title}</h2>
          <p>{randomBanner.subtitle}</p>
          <Link to={randomBanner.link} className="banner-button" style={{ 
            backgroundColor: randomBanner.textColor,
            color: randomBanner.bgColor
          }}>
            {randomBanner.buttonText}
          </Link>
        </div>
        <div className="banner-image">
          <img 
            src={randomBanner.image} 
            alt={randomBanner.title} 
            style={{
              maxHeight: '250px',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default RandomBanner;
