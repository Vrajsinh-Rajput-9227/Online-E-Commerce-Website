import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './Returns.css';

const Returns = () => {
  return (
    <div className="returns-page">
      <section className="returns-header">
        <Container>
          <h1>Return & Refund Policy</h1>
          <p>Our hassle-free return policy ensures your satisfaction with every purchase</p>
        </Container>
      </section>

      <Container className="returns-content">
        <Row className="justify-content-center">
          <Col lg={10}>
            <div className="policy-section">
              <h2>30-Day Return Policy</h2>
              <p>We offer a 30-day return policy for most items. To be eligible for a return, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging. You'll also need the receipt or proof of purchase.</p>
              
              <h3>How to Initiate a Return</h3>
              <ol>
                <li>Log in to your account and go to 'My Orders'</li>
                <li>Select the item(s) you wish to return</li>
                <li>Choose a return reason and submit your request</li>
                <li>Print the return label and attach it to your package</li>
                <li>Drop off the package at your nearest shipping center</li>
              </ol>

              <h3>Refund Process</h3>
              <p>Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. We will also notify you of the approval or rejection of your refund.</p>
              <p>If approved, your refund will be processed, and a credit will automatically be applied to your original method of payment within 5-7 business days.</p>
              
              <h3>Non-Returnable Items</h3>
              <ul>
                <li>Gift cards</li>
                <li>Downloadable software products</li>
                <li>Some health and personal care items</li>
                <li>Items marked as final sale</li>
              </ul>

              <h3>Exchanges</h3>
              <p>We only replace items if they are defective or damaged. If you need to exchange it for the same item, contact us at <a href="mailto:returns@example.com">returns@example.com</a>.</p>
              
              <h3>Shipping Returns</h3>
              <p>You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund.</p>
              
              <h3>Contact Us</h3>
              <p>If you have any questions about our return policy, please contact us at <a href="mailto:returns@example.com">returns@example.com</a> or call our customer service at +91-9876543210.</p>
              
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

export default Returns;
