import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './Privacy.css';

const Privacy = () => {
  return (
    <div className="privacy-page">
      <section className="privacy-header">
        <Container>
          <h1>Privacy Policy</h1>
          <p>Last Updated: December 26, 2024</p>
        </Container>
      </section>

      <Container className="privacy-content">
        <Row className="justify-content-center">
          <Col lg={10}>
            <div className="policy-section">
              <div className="last-updated">
                <p><strong>Effective Date:</strong> December 26, 2024</p>
              </div>
              
              <p>Welcome to our website. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice or our practices with regard to your personal information, please contact us at privacy@example.com.</p>
              
              <h2>1. What Information Do We Collect?</h2>
              <p><strong>Personal information you disclose to us:</strong> We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, when you participate in activities on the website, or otherwise when you contact us.</p>
              
              <h2>2. How Do We Use Your Information?</h2>
              <p>We use the information we collect or receive:</p>
              <ul>
                <li>To facilitate account creation and logon process</li>
                <li>To post testimonials with your consent</li>
                <li>Request feedback about your use of our website</li>
                <li>To enable user-to-user communications</li>
                <li>To send administrative information to you</li>
                <li>To protect our services</li>
                <li>To enforce our terms, conditions, and policies</li>
                <li>For other business purposes</li>
              </ul>
              
              <h2>3. Will Your Information Be Shared With Anyone?</h2>
              <p>We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.</p>
              
              <h2>4. Do We Use Cookies and Other Tracking Technologies?</h2>
              <p>We may use cookies and similar tracking technologies to access or store information. You can set your browser to refuse all or some browser cookies, but this may limit your use of certain features or functions of our website.</p>
              
              <h2>5. How Do We Handle Your Social Logins?</h2>
              <p>If you choose to register or log in to our services using a social media account, we may have access to certain information about you.</p>
              
              <h2>6. How Long Do We Keep Your Information?</h2>
              <p>We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy notice, unless a longer retention period is required or permitted by law.</p>
              
              <h2>7. How Do We Keep Your Information Safe?</h2>
              <p>We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process.</p>
              
              <h2>8. What Are Your Privacy Rights?</h2>
              <p>You may review, change, or terminate your account at any time. Depending on your location, you may have additional rights under applicable data protection laws.</p>
              
              <h2>9. Controls for Do-Not-Track Features</h2>
              <p>We do not currently respond to DNT browser signals or any other mechanism that automatically communicates your choice not to be tracked online.</p>
              
              <h2>10. Do We Make Updates to This Notice?</h2>
              <p>We may update this privacy notice from time to time. The updated version will be indicated by an updated "Revised" date.</p>
              
              <h2>11. How Can You Contact Us About This Notice?</h2>
              <p>If you have questions or comments about this notice, you may email us at privacy@example.com or by post to:</p>
              <address>
                Tech Store<br />
                123 Business Street<br />
                City, State 12345<br />
                India
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

export default Privacy;
