import React, { useState,useRef } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaPaperPlane } from 'react-icons/fa';
import './Contact.css';
import emailjs from '@emailjs/browser';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    title: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    // Reset form
    setFormData({
      name: '',
      email: '',
      title: '',
      message: ''
    });
  };

  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('');

    // Validate form
    if (!formData.name || !formData.email || !formData.title || !formData.message) {
      setSubmitStatus('Please fill in all fields');
      setIsSubmitting(false);
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setSubmitStatus('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }

    emailjs.send('service_key', 'template_key', {
      name: formData.name,
      email: formData.email,
      title: formData.title,
      // message: formData.message
    }, 'your_public_key_here')
      .then((response) => {
        console.log('SUCCESS!', response.status, response.text);
        setSubmitStatus('Message sent successfully!');
        form.current.reset();
        setFormData({
          name: '',
          email: '',
          title: '',
          message: ''
        });
        setIsSubmitting(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSubmitStatus('');
        }, 3000);
      }, (error) => {
        console.log('FAILED...', error);
        setSubmitStatus('Failed to send message. Please try again later.');
        setIsSubmitting(false);
        
        // Clear error message after 5 seconds
        setTimeout(() => {
          setSubmitStatus('');
        }, 5000);
      });
  }

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <Container>
          <div className="hero-content">
            <h1>Contact Us</h1>
            <p>We'd love to hear from you. Get in touch with our team.</p>
          </div>
        </Container>
      </section>

      {/* Contact Info & Form */}
      <section className="section-padding">
        <Container>
          <Row>
            <Col lg={5} className="mb-5 mb-lg-0">
              <div className="contact-contact-info">
                <h2>Get In Touch</h2>
                <p className="mb-4">Have questions or need assistance? Reach out to us and our team will get back to you as soon as possible.</p>
                
                <div className="contact-method">
                  <div className="contact-icon">
                    <FaMapMarkerAlt size={20} />
                  </div>
                  <div className="contact-details">
                    <h5>Our Location</h5>
                    <p>208, Shivalik Western Complex, L.P. Savani Road, Near TGB, Adajan, Surat - 395009.</p>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="contact-icon">
                    <FaPhone size={20} />
                  </div>
                  <div className="contact-details">
                    <h5>Phone Number</h5>
                    <p>+91 98765 43210</p>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="contact-icon">
                    <FaEnvelope size={20} />
                  </div>
                  <div className="contact-details">
                    <h5>Email Address</h5>
                    <p>support@techshop.com</p>
                  </div>
                </div>
              </div>
            </Col>

            <Col lg={7}>
              <Card className="contact-form-card">
                <Card.Body>
                  <h3 className="mb-4">Send Us a Message</h3>
                  <Form ref={form} onSubmit={sendEmail}>
                    {submitStatus && (
                      <div className={`alert ${submitStatus.includes('successfully') ? 'alert-success' : 'alert-danger'} mb-3`}>
                        {submitStatus}
                      </div>
                    )}
                    <Row>
                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label>Your Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Enter your name"
                            disabled={isSubmitting}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label>Email Address</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Enter your email"
                            disabled={isSubmitting}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group className="mb-3">
                      <Form.Label>Subject</Form.Label>
                      <Form.Control
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        placeholder="Enter subject"
                        disabled={isSubmitting}
                      />
                    </Form.Group>
                    <Form.Group className="mb-4">
                      <Form.Label>Your Message</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={5}
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        placeholder="Type your message here..."
                        disabled={isSubmitting}
                      />
                    </Form.Group>
                    <Button 
                      variant="primary" 
                      type="submit" 
                      className="submit-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Sending...
                        </>
                      ) : (
                        <>
                          <FaPaperPlane className="me-2" /> Send Message
                        </>
                      )}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Map Section */}
      <section className="map-section">
        <Container fluid className="p-0">
          <div className="map-container">
            <iframe
              title="Our Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4199.48315296764!2d72.78381907566292!3d21.193851382087082!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be04d1731ab816f%3A0x7bcc23c9978414e2!2sShivalik%20Western%20Building%2C%20TGB%20Circle%2C%20304%2C%20LP%20Savani%20Rd%2C%20opposite%20McDonald&#39;s%2C%20TGB%2C%20Adajan%20Gam%2C%20Adajan%2C%20Surat%2C%20Gujarat%20395009!5e1!3m2!1sen!2sin!4v1776343960221!5m2!1sen!2sin"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Contact;
