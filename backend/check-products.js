const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/techshop')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    if (collections.find(c => c.name === 'products')) {
      const products = await db.collection('products').find({}).limit(10).toArray();
      console.log('\nSample products:');
      products.forEach(p => {
        console.log(`- ${p.name} (Category: ${p.category}, Active: ${p.isActive})`);
      });
      
      // Count products by category
      const categories = await db.collection('products').aggregate([
        { $match: { isActive: { $ne: false } } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]).toArray();
      console.log('\nProducts by category (active only):');
      categories.forEach(cat => {
        console.log(`- ${cat._id}: ${cat.count} products`);
      });
    } else {
      console.log('No products collection found');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
