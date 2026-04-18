const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create admin user
    const admin = new Admin({
      email: 'admin@techshop.com',
      password: 'admin123'
    });

    await admin.save();
    console.log('Admin user created successfully:');
    console.log(`Email: ${admin.email}`);
    console.log(`Password: admin123`);

  } catch (error) {
    if (error.code === 11000) {
      console.log('Admin user already exists with this email');
    } else {
      console.error('Error creating admin:', error);
    }
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createAdmin();
