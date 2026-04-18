const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

async function verifyAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all admin users
    const admins = await Admin.find({});
    console.log(`Found ${admins.length} admin(s) in the collection:`);
    
    admins.forEach((admin, index) => {
      console.log(`\nAdmin ${index + 1}:`);
      console.log(`  ID: ${admin._id}`);
      console.log(`  Email: ${admin.email}`);
      console.log(`  Created: ${admin.createdAt}`);
    });

  } catch (error) {
    console.error('Error verifying admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

verifyAdmin();
