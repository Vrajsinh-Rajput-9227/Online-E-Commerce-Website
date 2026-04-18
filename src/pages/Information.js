import React from 'react';
import { Container, Row, Col, Card, Accordion } from 'react-bootstrap';
import { FaInfoCircle, FaShippingFast, FaExchangeAlt, FaLock, FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaTruck, FaShieldAlt, FaUndo, FaCreditCard, FaHeadset } from 'react-icons/fa';
import './Information.css';

const Information = () => {
  return (
    <div className="information-page">
      {/* Hero Section */}
      <section className="info-hero">
        <Container>
          <div className="hero-content">
            <h1>Information Center</h1>
            <p>Everything you need to know about shopping with us</p>
          </div>
        </Container>
      </section>

      {/* Quick Info Cards */}
      <section className="quick-info-section section-padding">
        <Container>
          <Row>
            <Col md={6} lg={3} className="mb-4">
              <Card className="info-card h-100">
                <Card.Body className="text-center">
                  <div className="info-icon mb-3">
                    <FaShippingFast size={40} />
                  </div>
                  <h4>Free Shipping</h4>
                  <p>On orders over $50</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3} className="mb-4">
              <Card className="info-card h-100">
                <Card.Body className="text-center">
                  <div className="info-icon mb-3">
                    <FaUndo size={40} />
                  </div>
                  <h4>Easy Returns</h4>
                  <p>30-day return policy</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3} className="mb-4">
              <Card className="info-card h-100">
                <Card.Body className="text-center">
                  <div className="info-icon mb-3">
                    <FaShieldAlt size={40} />
                  </div>
                  <h4>Secure Payment</h4>
                  <p>100% secure transactions</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3} className="mb-4">
              <Card className="info-card h-100">
                <Card.Body className="text-center">
                  <div className="info-icon mb-3">
                    <FaHeadset size={40} />
                  </div>
                  <h4>24/7 Support</h4>
                  <p>Always here to help</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Detailed Information Sections */}
      <section className="detailed-info-section section-padding bg-light">
        <Container>
          <Row>
            <Col lg={8} className="mx-auto">
              <Accordion defaultActiveKey="0">
                {/* Shipping Information */}
                <Accordion.Item eventKey="0">
                  <Accordion.Header>
                    <FaTruck className="me-2" /> Shipping Information
                  </Accordion.Header>
                  <Accordion.Body>
                    <h5>Shipping Options</h5>
                    <ul>
                      <li><strong>Standard Shipping:</strong> 5-7 business days - $4.99</li>
                      <li><strong>Express Shipping:</strong> 2-3 business days - $9.99</li>
                      <li><strong>Overnight Shipping:</strong> 1 business day - $19.99</li>
                      <li><strong>Free Shipping:</strong> On orders over $50 (Standard only)</li>
                    </ul>
                    
                    <h5>Shipping Process</h5>
                    <p>Orders are typically processed within 1-2 business days. You'll receive a confirmation email with tracking information once your order ships.</p>
                    
                    <h5>International Shipping</h5>
                    <p>We currently ship to select international destinations. International shipping rates and delivery times vary by location.</p>
                  </Accordion.Body>
                </Accordion.Item>

                {/* Return Policy */}
                <Accordion.Item eventKey="1">
                  <Accordion.Header>
                    <FaExchangeAlt className="me-2" /> Return Policy
                  </Accordion.Header>
                  <Accordion.Body>
                    <h5>30-Day Return Policy</h5>
                    <p>We want you to be completely satisfied with your purchase. If you're not happy, you can return items within 30 days of delivery.</p>
                    
                    <h5>Return Conditions</h5>
                    <ul>
                      <li>Items must be unused and in original condition</li>
                      <li>Original tags and packaging must be intact</li>
                      <li>Proof of purchase required</li>
                      <li>Shipping costs for returns are non-refundable</li>
                    </ul>
                    
                    <h5>How to Return</h5>
                    <ol>
                      <li>Contact our customer service team</li>
                      <li>Receive a return authorization number</li>
                      <li>Package the item securely</li>
                      <li>Ship to the provided address</li>
                      <li>Receive refund within 5-7 business days</li>
                    </ol>
                  </Accordion.Body>
                </Accordion.Item>

                {/* Payment Methods */}
                <Accordion.Item eventKey="2">
                  <Accordion.Header>
                    <FaCreditCard className="me-2" /> Payment Methods
                  </Accordion.Header>
                  <Accordion.Body>
                    <h5>Accepted Payment Methods</h5>
                    <ul>
                      <li><strong>Credit Cards:</strong> Visa, Mastercard, American Express, Discover</li>
                      <li><strong>Debit Cards:</strong> All major debit cards</li>
                      <li><strong>Digital Wallets:</strong> PayPal, Apple Pay, Google Pay</li>
                      <li><strong>Buy Now, Pay Later:</strong> Afterpay, Klarna</li>
                    </ul>
                    
                    <h5>Security</h5>
                    <p>All payment transactions are encrypted using SSL technology. We never store your credit card information on our servers.</p>
                    
                    <h5>Payment Processing</h5>
                    <p>Payments are processed at the time of order. Your account will be charged immediately after order confirmation.</p>
                  </Accordion.Body>
                </Accordion.Item>

                {/* Order Tracking */}
                <Accordion.Item eventKey="3">
                  <Accordion.Header>
                    <FaMapMarkerAlt className="me-2" /> Order Tracking
                  </Accordion.Header>
                  <Accordion.Body>
                    <h5>Track Your Order</h5>
                    <p>Once your order ships, you'll receive an email with tracking information. You can also track your order by:</p>
                    <ul>
                      <li>Logging into your account</li>
                      <li>Using the "Track Order" page with your order number</li>
                      <li>Contacting customer service</li>
                    </ul>
                    
                    <h5>Tracking Updates</h5>
                    <p>Tracking information is updated in real-time. Please allow 24 hours for tracking to become active after shipment.</p>
                  </Accordion.Body>
                </Accordion.Item>

                {/* Customer Service */}
                <Accordion.Item eventKey="4">
                  <Accordion.Header>
                    <FaPhone className="me-2" /> Customer Service
                  </Accordion.Header>
                  <Accordion.Body>
                    <h5>Contact Information</h5>
                    <div className="contact-info">
                      <p><FaPhone /> Phone: 1-800-123-4567</p>
                      <p><FaEnvelope /> Email: support@store.com</p>
                      <p><FaClock /> Hours: Monday-Friday 9AM-6PM EST</p>
                    </div>
                    
                    <h5>Response Times</h5>
                    <ul>
                      <li><strong>Phone:</strong> Immediate during business hours</li>
                      <li><strong>Email:</strong> Within 24 hours</li>
                      <li><strong>Live Chat:</strong> Available on website</li>
                    </ul>
                    
                    <h5>Common Issues</h5>
                    <p>Our customer service team can help with order issues, returns, product questions, and account management.</p>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </Col>
          </Row>
        </Container>
      </section>

      {/* FAQ Section */}
      <section className="faq-section section-padding">
        <Container>
          <div className="section-header text-center mb-5">
            <h2>Frequently Asked Questions</h2>
            <p className="lead">Quick answers to common questions</p>
          </div>
          <Row>
            <Col md={6} className="mb-4">
              <Card className="faq-card">
                <Card.Body>
                  <h5>How do I track my order?</h5>
                  <p>You can track your order using the tracking number sent to your email or by logging into your account.</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} className="mb-4">
              <Card className="faq-card">
                <Card.Body>
                  <h5>What is your return policy?</h5>
                  <p>We offer a 30-day return policy for unused items in original condition.</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} className="mb-4">
              <Card className="faq-card">
                <Card.Body>
                  <h5>Do you offer international shipping?</h5>
                  <p>Yes, we ship to select international destinations. Rates and times vary by location.</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} className="mb-4">
              <Card className="faq-card">
                <Card.Body>
                  <h5>How secure is my payment information?</h5>
                  <p>All payments are encrypted with SSL technology. We never store your card details.</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Information;
