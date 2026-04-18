const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/techshop_db')
  .then(async () => {
    console.log('Connected to MongoDB (techshop_db)');
    
    const db = mongoose.connection.db;
    const productsCollection = db.collection('products');
    
    // Add missing laptops and smartphones
    const additionalProducts = [
      // Additional Laptops
      {
        name: 'MacBook Pro 14-inch M3',
        description: 'Apple\'s powerful laptop with M3 chip and exceptional battery life',
        price: 199999,
        category: 'Laptops',
        brand: 'Apple',
        images: ['/images/laptops/macbook-pro-14.jpg'],
        specifications: {
          'Processor': 'Apple M3',
          'RAM': '18GB Unified',
          'Storage': '512GB SSD',
          'Display': '14.2" Liquid Retina XDR',
          'Graphics': 'Integrated M3 GPU',
          'Weight': '1.6 kg'
        },
        stock: 10,
        featured: true,
        tags: ['New', 'Premium'],
        isActive: true
      },
      {
        name: 'HP Spectre x360 14',
        description: 'Versatile 2-in-1 laptop with premium design and performance',
        price: 109999,
        category: 'Laptops',
        brand: 'HP',
        images: ['/images/laptops/hp-spectre-x360.jpg'],
        specifications: {
          'Processor': 'Intel Core i5-1335U',
          'RAM': '16GB LPDDR5',
          'Storage': '1TB SSD',
          'Display': '14" 2.8K OLED Touch',
          'Graphics': 'Intel Iris Xe',
          'Weight': '1.4 kg'
        },
        stock: 12,
        featured: false,
        tags: ['2-in-1', 'Touch Screen'],
        isActive: true
      },
      {
        name: 'Lenovo ThinkPad X1 Carbon',
        description: 'Business laptop with legendary durability and performance',
        price: 149999,
        category: 'Laptops',
        brand: 'Lenovo',
        images: ['/images/laptops/thinkpad-x1-carbon.jpg'],
        specifications: {
          'Processor': 'Intel Core i7-1365U',
          'RAM': '32GB LPDDR5',
          'Storage': '1TB SSD',
          'Display': '14" 2.8K IPS',
          'Graphics': 'Intel Iris Xe',
          'Weight': '1.12 kg'
        },
        stock: 8,
        featured: true,
        tags: ['Business', 'Lightweight'],
        isActive: true
      },
      
      // Additional Smartphones
      {
        name: 'iPhone 15 Pro Max',
        description: 'Apple\'s flagship smartphone with titanium design and A17 Pro chip',
        price: 149999,
        category: 'Smartphones',
        brand: 'Apple',
        images: ['/images/phones/iphone-15-pro-max.jpg'],
        specifications: {
          'Display': '6.7" Super Retina XDR',
          'Processor': 'A17 Pro',
          'RAM': '8GB',
          'Storage': '256GB',
          'Camera': '48MP Triple Camera',
          'Battery': '4422 mAh'
        },
        stock: 20,
        featured: true,
        tags: ['Flagship', 'Premium'],
        isActive: true
      },
      {
        name: 'Google Pixel 8 Pro',
        description: 'Google\'s flagship with advanced AI features and exceptional camera',
        price: 89999,
        category: 'Smartphones',
        brand: 'Google',
        images: ['/images/phones/pixel-8-pro.jpg'],
        specifications: {
          'Display': '6.7" LTPO OLED',
          'Processor': 'Tensor G3',
          'RAM': '12GB',
          'Storage': '256GB',
          'Camera': '50MP Triple Camera',
          'Battery': '5050 mAh'
        },
        stock: 15,
        featured: true,
        tags: ['AI Features', 'Camera'],
        isActive: true
      },
      {
        name: 'OnePlus 12',
        description: 'Flagship killer with fast charging and premium performance',
        price: 64999,
        category: 'Smartphones',
        brand: 'OnePlus',
        images: ['/images/phones/oneplus-12.jpg'],
        specifications: {
          'Display': '6.82" AMOLED',
          'Processor': 'Snapdragon 8 Gen 3',
          'RAM': '16GB',
          'Storage': '256GB',
          'Camera': '50MP Triple Camera',
          'Battery': '5400 mAh'
        },
        stock: 18,
        featured: false,
        tags: ['Fast Charging', 'Gaming'],
        isActive: true
      }
    ];
    
    const result = await productsCollection.insertMany(additionalProducts);
    console.log(`Successfully added ${result.insertedCount} additional products`);
    
    // Show final state
    const finalProducts = await productsCollection.find({}).toArray();
    console.log(`\nFinal product count: ${finalProducts.length}`);
    
    const categories = {};
    finalProducts.forEach(product => {
      if (product.isActive !== false) {
        const category = product.category;
        categories[category] = (categories[category] || 0) + 1;
      }
    });
    
    console.log('Active products by category:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`"${category}": ${count} products`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
