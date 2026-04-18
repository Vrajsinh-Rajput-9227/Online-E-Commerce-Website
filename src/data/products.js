// Import product images
import Product1 from '../assets/e_products/samsung_book4.webp';
import Product2 from '../assets/e_products/samsung_s25_ultra_5g.webp';
import Product3 from '../assets/e_products/p_3.jpeg';
import Product4 from '../assets/e_products/boAt Stone Bluetooth Speaker.jpg';
import Product5 from '../assets/e_products/smartwatch.webp';
import Product6 from '../assets/e_products/canon camera.webp';
import Product7 from '../assets/e_products/boat 425 bluetooth.webp';
import Product8 from '../assets/e_products/product8.jpg';
import Product9 from '../assets/e_products/product9.jpg';
import Product10 from '../assets/e_products/product10.jpg';
import Product11 from '../assets/e_products/product11.jpg';
import Product12 from '../assets/e_products/product12.jpg';
import Product13 from '../assets/e_products/product13.jpg';
import Product14 from '../assets/e_products/product14.jpg';
import Product15 from '../assets/e_products/product15.jpg';

// Import additional product images
import Product1_1 from '../assets/e_products/product1_1.jpg';
import Product1_2 from '../assets/e_products/product1_2.jpg';
import Product1_3 from '../assets/e_products/product1_3.jpg';
import Product1_4 from '../assets/e_products/product1_4.jpg';

import Product2_1 from '../assets/e_products/samsung_s25_ultra_5g_img2.jpg';
import Product2_2 from '../assets/e_products/samsung_s25_ultra_5g_img3.jpg';
import Product2_3 from '../assets/e_products/samsung_s25_ultra_5g_img4.jpg';
import Product2_4 from '../assets/e_products/samsung_s25_ultra_5g_img5.jpg';

const products = [
  {
    id: 1,
    name: 'Samsung Galaxy Book 4 Ultra',
    price: 215000,
    originalPrice: 279000,
    discount: 23,
    rating: 4.5,
    reviews: 128,
    image: Product1,
    additionalImages: [Product1_1, Product1_2, Product1_3, Product1_4],
    category: 'Laptops',
    brand: 'Samsung',
    // color: 'Mystic Black',
    model: 'Galaxy Book 4 Ultra',
    material: 'Aluminum',
    dimensions: '35.5 x 25.1 x 1.7 cm',
    weight: '1.8 kg',
    warranty: '2 Years',
    sku: 'SAM-BOOK4-ULTRA',
    releaseDate: '2023-11-15',
    manufacturer: 'Samsung Electronics',
    origin: 'South Korea',
    asin: 'B0C1234567',
    isTrending: true
  },
  {
    id: 2,
    name: 'Samsung Galaxy S25 Ultra 5G',
    price: 165000,
    originalPrice: 215000,
    discount: 23,
    rating: 4.8,
    reviews: 256,
    image: Product2,
    additionalImages: [Product2_1, Product2_2, Product2_3, Product2_4],
    category: 'Smartphones',
    brand: 'Samsung',
    // color: 'Phantom Black',
    model: 'Galaxy S25 Ultra',
    material: 'Gorilla Glass & Aluminum',
    dimensions: '16.3 x 7.8 x 0.8 cm',
    weight: '228 g',
    warranty: '1 Year',
    sku: 'SAM-S25-ULTRA',
    releaseDate: '2024-01-20',
    manufacturer: 'Samsung Electronics',
    origin: 'South Korea',
    asin: 'B0D1234567',
    isTrending: true
  },
  // Add more products as needed
];

// Function to get trending products (top rated with most reviews)
export const getTrendingProducts = (count = 4) => {
  return [...products]
    .sort((a, b) => {
      // Sort by rating first, then by number of reviews
      const ratingDiff = b.rating - a.rating;
      if (ratingDiff !== 0) return ratingDiff;
      return b.reviews - a.reviews;
    })
    .slice(0, count);
};

export default products;
