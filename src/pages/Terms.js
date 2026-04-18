import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './Terms.css';

const Terms = () => {
  return (
    <div className="terms-page">
      <section className="terms-header">
        <Container>
          <h1>Terms and Conditions</h1>
          <p>Last Updated: December 26, 2024</p>
        </Container>
      </section>

      <Container className="terms-content">
        <Row className="justify-content-center">
          <Col lg={10}>
            <div className="terms-section">
              <div className="last-updated">
                <p><strong>Effective Date:</strong> December 26, 2024</p>
              </div>
              
              <p>Welcome to our website. By accessing and using this website, you accept and agree to be bound by the terms and conditions stated here. Please read them carefully before using our services.</p>
              
              <h2>1. Intellectual Property Rights</h2>
              <p>All content on this website, including text, graphics, logos, and images, is our property and is protected by copyright and other intellectual property laws.</p>
              
              <h2>2. User Responsibilities</h2>
              <p>As a user of the website, you agree not to:</p>
              <ul>
                <li>Use the website in any way that causes damage to the website or impairs its availability</li>
                <li>Engage in any data mining, data harvesting, or similar activities</li>
                <li>Use the website for any unlawful or fraudulent purpose</li>
                <li>Attempt to gain unauthorized access to any part of the website</li>
              </ul>
              
              <h2>3. Product Information</h2>
              <p>We make every effort to display as accurately as possible the colors, features, specifications, and details of the products available on the website. However, we do not guarantee that the product descriptions or other content is accurate, complete, or error-free.</p>
              
              <h2>4. Pricing and Payment</h2>
              <p>All prices are listed in Indian Rupees (₹) and are subject to change without notice. We reserve the right to modify or discontinue any product at any time.</p>
              
              <h2>5. Order Acceptance and Cancellation</h2>
              <p>We reserve the right to refuse or cancel any order for any reason at any time. We may require additional verification or information before accepting any order.</p>
              
              <h2>6. Shipping and Delivery</h2>
              <p>Please refer to our <a href="/shipping">Shipping Policy</a> for detailed information about our shipping and delivery practices.</p>
              
              <h2>7. Returns and Refunds</h2>
              <p>Our return and refund policy is outlined in our <a href="/returns">Return Policy</a>. Please review this policy before making a purchase.</p>
              
              <h2>8. Limitation of Liability</h2>
              <p>To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your access to or use of the website or any products purchased through the website.</p>
              
              <h2>9. Governing Law</h2>
              <p>These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising under or in connection with these terms shall be subject to the exclusive jurisdiction of the courts located in [Your City, India].</p>
              
              <h2>10. Changes to Terms</h2>
              <p>We reserve the right to modify these terms at any time. Any changes will be effective immediately upon posting on the website. Your continued use of the website after any changes constitutes your acceptance of the new terms.</p>
              
              <h2>11. Contact Information</h2>
              <p>If you have any questions about these Terms and Conditions, please contact us at:</p>
              <address>
                Tech Store<br />
                123 Business Street<br />
                City, State 12345<br />
                India<br />
                Email: support@example.com<br />
                Phone: +91-9876543210
              </address>
              
              <div className="last-updated">
                <p><strong>Last Updated:</strong> December 26, 2024</p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Terms;
