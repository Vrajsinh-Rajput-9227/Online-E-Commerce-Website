import React from 'react';
import './FeatureCards.css';

const FeatureCards = () => {
  const features = [
    {
      icon: '📧',
      color: '#e8d5f2',
      title: 'Multi-Vendor Marketplace',
      description: 'Thousands of sellers one trusted platform'
    },
    {
      icon: '🛒',
      color: '#d5e8f2',
      title: 'Secure Payments',
      description: '100% secure payments and buyer protection'
    },
    {
      icon: '🚚',
      color: '#d5f2e8',
      title: 'Fast Delivery',
      description: 'Quick delivery across the country'
    },
    {
      icon: '⏰',
      color: '#f2e8d5',
      title: 'Easy Returns',
      description: 'Hassle-free returns within 7 days'
    },
    {
      icon: '🎧',
      color: '#f2d5e8',
      title: '24/7 Support',
      description: "We're here to help you anytime"
    }
  ];

  return (
    <div className="feature-cards">
      {features.map((feature, index) => (
        <div key={index} className="feature-card">
          <div className="feature-icon" style={{ backgroundColor: feature.color }}>
            <span className="icon-emoji">{feature.icon}</span>
          </div>
          <div className="feature-text-content">
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-description">{feature.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeatureCards;
