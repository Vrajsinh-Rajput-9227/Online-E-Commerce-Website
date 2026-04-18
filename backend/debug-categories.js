const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/techshop')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const productsCollection = db.collection('products');
    
    // Get all products with their categories
    const products = await productsCollection.find({}).toArray();
    
    console.log('All products and their categories:');
    products.forEach((product, index) => {
      console.log(`${index + 1}. "${product.name}"`);
      console.log(`   Category: "${product.category}"`);
      console.log(`   Active: ${product.isActive}`);
      console.log('');
    });
    
    // Count by exact category name
    const categories = {};
    products.forEach(product => {
      const category = product.category;
      categories[category] = (categories[category] || 0) + 1;
    });
    
    console.log('Products by exact category name:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`"${category}": ${count} products`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
