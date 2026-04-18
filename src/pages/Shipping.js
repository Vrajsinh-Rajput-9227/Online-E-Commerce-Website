import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './Shipping.css';

const Shipping = () => {
  return (
    <div className="shipping-page">
      <section className="shipping-header">
        <Container>
          <h1>Shipping Policy</h1>
          <p>Information about our shipping methods and delivery times</p>
        </Container>
      </section>

      <Container className="shipping-content">
        <Row className="justify-content-center">
          <Col lg={10}>
            <div className="policy-section">
              <h2>Shipping Information</h2>
              <p>We offer shipping to all major cities and towns across India. Our standard delivery time is 3-7 business days, depending on your location.</p>
              
              <h3>Delivery Timeframes</h3>
              <ul>
                <li><strong>Metro Cities:</strong> 2-4 business days</li>
                <li><strong>Other Cities:</strong> 3-7 business days</li>
                <li><strong>Remote Areas:</strong> 7-10 business days</li>
              </ul>

              <h3>Shipping Rates</h3>
              <p>Shipping charges are calculated based on your location and the weight of your order. You can view the exact shipping cost during checkout.</p>
              
              <h3>Order Processing</h3>
              <p>Orders are typically processed within 24-48 hours of placement. You will receive a confirmation email with tracking information once your order has shipped.</p>
              
              <h3>Contact Us</h3>
              <p>If you have any questions about our shipping policy, please contact our customer support team at <a href="mailto:support@example.com">support@example.com</a> or call us at +91-9876543210.</p>
              
              <div className="last-updated">
                <p>Last Updated: December 26, 2024</p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Shipping;
