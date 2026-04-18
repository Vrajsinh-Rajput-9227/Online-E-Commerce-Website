// Current Carousel.js content
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './Carousel.css';

const Carousel = () => {
  const navigate = useNavigate();
  
  const handleShopNow = () => {
    navigate('/products');
  };
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: true
    // nextArrow: <SampleNextArrow />,
    // prevArrow: <SamplePrevArrow />
  };

  function SampleNextArrow(props) {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{ ...style, display: "block", right: "30px", zIndex: 1 }}
        onClick={onClick}
      />
    );
  }

  function SamplePrevArrow(props) {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{ ...style, display: "block", left: "30px", zIndex: 1 }}
        onClick={onClick}
      />
    );
  }

  return (
    <div className="carousel-container">
      <Slider {...settings}>
        {/* First Slide */}
        <div className="carousel-slide">
          <div className="slide-content">
            <div className="text-content">
              <p className="discount">40% off in all products</p>
              <h2 className="title">Incredible Prices on All Your Favorite Items</h2>
              <button className="shop-now-btn" onClick={handleShopNow}>SHOP NOW</button>
            </div>
            <div className="image-content">
              <img src={(require('../assets/e_products/2.2.png'))} alt='' width={500} height={400}/>
              {/* <img src={(require('../assets/banner_1.png'))} alt='' width={500} height={400}/> */}
            </div>
          </div>
        </div>

        {/* Add more slides as needed */}
        <div className="carousel-slide">
          <div className="slide-content">
            <div className="text-content">
              <p className="discount">30% off in all products</p>
              <h2 className="title">Summer Collection</h2>
              <button className="shop-now-btn" onClick={handleShopNow}>SHOP NOW</button>
            </div>
            <div className="image-content">
              <img src={(require('../assets/e_products/1.2.png'))} alt='' width={500} height={400}/>
            </div>
          </div>
        </div>
      </Slider>
    </div>
  );
};

export default Carousel;
