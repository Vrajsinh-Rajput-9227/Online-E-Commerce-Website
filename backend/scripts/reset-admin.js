const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

async function resetAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete existing admin collection
    await Admin.deleteMany({});
    console.log('Deleted existing admin documents');

    // Create new admin user with only email and password
    const admin = new Admin({
      email: 'admin@techshop.com',
      password: 'admin123'
    });

    await admin.save();
    console.log('New admin user created successfully:');
    console.log(`Email: ${admin.email}`);
    console.log(`Password: admin123`);

  } catch (error) {
    console.error('Error resetting admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

resetAdmin();
