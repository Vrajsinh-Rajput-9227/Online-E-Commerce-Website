import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './FAQ.css';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: 'How can I track my order?',
      answer: 'You can track your order by logging into your account and visiting the Order History section. You will receive tracking information via email once your order ships.'
    },
    {
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for most items. Items must be in their original condition with all tags attached. Please visit our Returns page to initiate a return.'
    },
    {
      question: 'How do I contact customer support?',
      answer: 'You can reach our customer support team 24/7 through our Contact Us page, or by emailing support@techshop.com. We typically respond within 24 hours.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and select digital wallets. All transactions are secure and encrypted.'
    },
    {
      question: 'Do you offer international shipping?',
      answer: 'Yes, we ship to most countries worldwide. Shipping costs and delivery times vary by destination. Please check the shipping information during checkout for details.'
    },
    {
      question: 'How can I change or cancel my order?',
      answer: 'You can change or cancel your order within 1 hour of placing it by contacting our support team. After this window, we cannot guarantee changes as orders are processed quickly for fast shipping.'
    },
    {
      question: 'What are your shipping options?',
      answer: 'We offer standard (3-5 business days), expedited (2-3 business days), and express (1-2 business days) shipping options. Some items may have different shipping times which will be indicated on the product page.'
    }
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="faq-container">
      <div className="faq-header">
        <h1>Frequently Asked Questions</h1>
        <p>Can't find what you're looking for? <Link to="/contact">Contact our support team</Link> for assistance.</p>
      </div>
      
      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div key={index} className={`faq-item ${activeIndex === index ? 'active' : ''}`}>
            <button 
              className="faq-question" 
              onClick={() => toggleAccordion(index)}
              aria-expanded={activeIndex === index}
              aria-controls={`faq-answer-${index}`}
              id={`faq-question-${index}`}
            >
              <span>{faq.question}</span>
              <span className="faq-icon">{activeIndex === index ? '−' : '+'}</span>
            </button>
            <div 
              id={`faq-answer-${index}`}
              role="region"
              aria-labelledby={`faq-question-${index}`}
              className="faq-answer"
              style={{
                maxHeight: activeIndex === index ? '500px' : '0',
                padding: activeIndex === index ? '1.5rem' : '0 1.5rem',
                opacity: activeIndex === index ? '1' : '0'
              }}
            >
              <p>{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="faq-contact">
        <h2>Still have questions?</h2>
        <p>Our support team is here to help you with any questions you may have.</p>
        <Link to="/contact" className="contact-button">Contact Support</Link>
      </div>
    </div>
  );
};

export default FAQ;
