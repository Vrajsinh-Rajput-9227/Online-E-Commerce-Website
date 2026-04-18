// src/component/Newsletter.js
import React, { useState } from 'react';
import './Newsletter.css';

function Newsletter() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would send this to your backend
    console.log('Subscribed with email:', email);
    setIsSubscribed(true);
    setEmail('');
  };

  return (
    <section className="newsletter-section">
      <div className="newsletter-container">
        <h2>Newsletter</h2>
        <p>Sign up to receive updates on new arrivals and special offers</p>
        {isSubscribed ? (
          <div className="success-message">
            Thank you for subscribing!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="newsletter-form">
            <div className="form-group">
              <input
                type="email"
                // placeholder="Email *"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="subscribe-btn">
                Subscribe
              </button>
            </div>
            <div className="form-checkbox">
              <input type="checkbox" id="newsletter-consent" required />
              <label htmlFor="newsletter-consent">
                Yes, subscribe me to your newsletter. *
              </label>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

export default Newsletter;