const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@techshop.com' });
    if (existingAdmin) {
      console.log('Admin user already exists with this email');
      console.log('Email: admin@techshop.com');
      console.log('Password: admin123');
      console.log('Role:', existingAdmin.role);
      return;
    }

    // Create admin user
    const admin = new User({
      name: 'Admin User',
      email: 'admin@techshop.com',
      password: 'admin123',
      phone: '1234567890',
      role: 'admin'
    });

    await admin.save();
    console.log('Admin user created successfully:');
    console.log(`Email: ${admin.email}`);
    console.log(`Password: admin123`);
    console.log(`Role: ${admin.role}`);

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createAdminUser();
