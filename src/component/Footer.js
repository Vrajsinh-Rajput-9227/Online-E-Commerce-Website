import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import visaImage from '../assets/e_products/visa_image.png';
import mastercardImage from '../assets/e_products/mastercard.png';
import paypalImage from '../assets/e_products/paypal.jpg';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-row">
          <div className="footer-col">
            <h4>About Us</h4>
            <p>Your one-stop shop for all your electronic needs. We provide high-quality products with the best prices and customer service.</p>
            <div className="social-links">
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
            </div>
          </div>
          
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h4>Customer Service</h4>
            <ul>
              <li><Link to="/shipping">Shipping Policy</Link></li>
              <li><Link to="/returns">Return Policy</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms & Conditions</Link></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h4>Contact Us</h4>
            <ul className="footer-contact-info">
              <li>
                <FaMapMarkerAlt className="contact-icon" />
                <span>208, Shivalik Western Complex, L.P. Savani Road, Near TGB, Adajan, Surat - 395009.</span>
              </li>
              <li>
                <FaPhone className="contact-icon" />
                {/* <span>+1 (555) 123-4567</span> */}
                <span>+91 9876543210</span>
              </li>
              <li>
                <FaEnvelope className="contact-icon" />
                <span>info@techshop.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} TechShop. All rights reserved.</p>
          <div className="payment-methods">
            <span>We accept:</span>
            <img src={visaImage} alt="Visa" />
            <img src={mastercardImage} alt="Mastercard" />
            <img src={paypalImage} alt="PayPal" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;