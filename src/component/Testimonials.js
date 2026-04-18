import React, { useState } from 'react';
import './Testimonials.css';

// Using public folder paths for images
const testimonial_1 = '/images/testimonial_1.jpeg';
const testimonial_2 = '/images/testimonial_2.jpeg';
const testimonial_4 = '/images/testimonial_4.jpeg';
const testimonial_5 = '/images/testimonial_5.jpeg';
const testimonial_6 = '/images/testimonial_6.jfif';

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const testimonials = [
    {
      id: 1,
      name: "Testimonial 1",
      content: "I recently purchased a 4K Smart TV from this store, and I'm extremely impressed with its clarity, sound, and sleek design. The staff provided excellent guidance throughout my purchase process.",
      rating: 5,
      // avatar: "https://picsum.photos/seed/testimonial1/100/100.jpg"
      avatar: testimonial_1
    },
    {
      id: 2,
      name: "Testimonial 2",
      content: "The wireless headphones I ordered arrived quickly and sound absolutely amazing. Clear vocals, deep bass, and great battery life. I highly recommend this store for reliable electronic products.",
      rating: 5,
      // avatar: "https://picsum.photos/seed/testimonial2/100/100.jpg"
      avatar: testimonial_2
    },
    {
      id: 3,
      name: "Testimonial 3",
      content: "I bought a gaming laptop, and it performs beyond expectations. The graphics are outstanding, speed is lightning fast, and cooling system works flawlessly. Great product quality and reasonable pricing.",
      rating: 5,
      // avatar: "https://picsum.photos/seed/testimonial3/100/100.jpg"
      avatar: testimonial_6
    },
    {
      id: 4,
      name: "Testimonial 4",
      content: "The smartphone I purchased exceeded all my expectations. Camera quality is exceptional, battery life is impressive, and the overall performance is smooth. Excellent customer service too!",
      rating: 5,
      // avatar: "https://picsum.photos/seed/testimonial4/100/100.jpg"
      avatar: testimonial_4
    },
    {
      id: 5,
      name: "Testimonial 5",
      content: "Outstanding experience buying my tablet here. Fast delivery, authentic product, and great after-sales support. The team is knowledgeable and helped me choose the perfect device for my needs.",
      rating: 5,
      // avatar: "https://picsum.photos/seed/testimonial5/100/100.jpg"
      avatar: testimonial_5
    }
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className="star filled">
        ★
      </span>
    ));
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const getVisibleTestimonials = () => {
    const visible = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % testimonials.length;
      visible.push(testimonials[index]);
    }
    return visible;
  };

  return (
    <section className="testimonials">
      <div className="container">
        <h2 className="testimonials-title">See What Our Customers Says</h2>
        
        <div className="testimonials-carousel">
          <button className="carousel-nav prev" onClick={handlePrevious}>
            ←
          </button>
          
          <div className="testimonials-slider">
            {getVisibleTestimonials().map((testimonial, index) => (
              <div key={testimonial.id} className="testimonial-card">
                <div className="testimonial-rating">
                  {renderStars(testimonial.rating)}
                </div>
                <p className="testimonial-text">{testimonial.content}</p>
                <div className="testimonial-avatar">
                  <img src={testimonial.avatar} alt={testimonial.name} onError={(e) => { e.target.src = 'https://picsum.photos/seed/fallback/100/100.jpg'; }} />
                </div>
                <h4 className="author-name">{testimonial.name}</h4>
              </div>
            ))}
          </div>
          
          <button className="carousel-nav next" onClick={handleNext}>
            →
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
