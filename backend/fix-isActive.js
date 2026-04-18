const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/techshop')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const productsCollection = db.collection('products');
    
    // Update all products to set isActive: true if it's undefined or null
    const result = await productsCollection.updateMany(
      { 
        $or: [
          { isActive: { $exists: false } },
          { isActive: null },
          { isActive: undefined }
        ]
      },
      { $set: { isActive: true } }
    );
    
    console.log(`Updated ${result.modifiedCount} products to set isActive: true`);
    
    // Verify the update
    const products = await productsCollection.find({}).toArray();
    console.log('\nAll products after update:');
    products.forEach((product, index) => {
      console.log(`${index + 1}. "${product.name}" - Category: "${product.category}" - Active: ${product.isActive}`);
    });
    
    // Count by category for active products only
    const activeProducts = products.filter(p => p.isActive === true);
    const categories = {};
    activeProducts.forEach(product => {
      const category = product.category;
      categories[category] = (categories[category] || 0) + 1;
    });
    
    console.log('\nActive products by category:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`"${category}": ${count} products`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
