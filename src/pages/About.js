import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaShoppingBag, FaHeadset, FaShieldAlt, FaTruck } from 'react-icons/fa';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <Container>
          <div className="hero-content">
            <h1>About Our Store</h1>
            <p>Discover our story, our values, and our commitment to quality</p>
          </div>
        </Container>
      </section>

      {/* Our Story */}
      <section className="section-padding">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-4 mb-lg-0">
              <div className="about-image">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                  alt="Our Team"
                  className="img-fluid rounded"
                />
              </div>
            </Col>
            <Col lg={6}>
              <div className="about-content">
                <h2>Our Story</h2>
                <p>
                  Founded in 2023, our e-commerce store was born out of a passion for bringing high-quality products to customers worldwide. 
                  What started as a small idea has grown into a trusted destination for shoppers who value quality, sustainability, and 
                  exceptional customer service.
                </p>
                <p>
                  We carefully curate our product selection to ensure that every item meets our high standards of quality and design. 
                  Our team works directly with manufacturers to bring you the best products at competitive prices.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Our Values */}
      <section className="values-section section-padding">
        <Container>
          <div className="section-header text-center mb-5">
            <h2>Our Values</h2>
            <p className="lead">What makes us different</p>
          </div>
          <Row>
            <Col md={6} lg={3} className="mb-4">
              <Card className="value-card h-100">
                <Card.Body className="text-center">
                  <div className="value-icon mb-3">
                    <FaShoppingBag size={40} />
                  </div>
                  <h4>Quality Products</h4>
                  <p>We source only the finest products that meet our high standards of quality and durability.</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3} className="mb-4">
              <Card className="value-card h-100">
                <Card.Body className="text-center">
                  <div className="value-icon mb-3">
                    <FaHeadset size={40} />
                  </div>
                  <h4>24/7 Support</h4>
                  <p>Our dedicated support team is always here to help you with any questions or concerns.</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3} className="mb-4">
              <Card className="value-card h-100">
                <Card.Body className="text-center">
                  <div className="value-icon mb-3">
                    <FaShieldAlt size={40} />
                  </div>
                  <h4>Secure Shopping</h4>
                  <p>Your security is our priority. We use the latest encryption technology to protect your information.</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3} className="mb-4">
              <Card className="value-card h-100">
                <Card.Body className="text-center">
                  <div className="value-icon mb-3">
                    <FaTruck size={40} />
                  </div>
                  <h4>Fast Shipping</h4>
                  <p>We offer fast and reliable shipping to get your products to you as quickly as possible.</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Team Section */}
      {/* <section className="section-padding bg-light">
        <Container>
          <div className="section-header text-center mb-5">
            <h2>Meet Our Team</h2>
            <p className="lead">The people behind the scenes</p>
          </div>
          <Row>
            {[
              { name: 'John Doe', role: 'CEO & Founder', image: 'https://randomuser.me/api/portraits/men/32.jpg' },
              { name: 'Jane Smith', role: 'Head of Design', image: 'https://randomuser.me/api/portraits/women/44.jpg' },
              { name: 'Mike Johnson', role: 'Marketing Director', image: 'https://randomuser.me/api/portraits/men/46.jpg' },
              { name: 'Sarah Williams', role: 'Customer Support', image: 'https://randomuser.me/api/portraits/women/68.jpg' },
            ].map((member, index) => (
              <Col md={6} lg={3} className="mb-4" key={index}>
                <Card className="team-card h-100">
                  <div className="team-image">
                    <img src={member.image} alt={member.name} className="img-fluid" />
                  </div>
                  <Card.Body className="text-center">
                    <h5>{member.name}</h5>
                    <p className="text-muted">{member.role}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section> */}

      {/* CTA Section */}
      <section className="cta-section">
        <Container>
          <div className="cta-content text-center">
            <h2>Ready to shop with us?</h2>
            <p>Join thousands of satisfied customers who trust us for their shopping needs.</p>
            <a href="/products" className="btn btn-primary btn-lg mt-3">
              Shop Now
            </a>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default About;
