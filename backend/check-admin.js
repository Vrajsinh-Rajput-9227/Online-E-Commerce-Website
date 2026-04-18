const mongoose = require('mongoose');
const Admin = require('./models/Admin');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/techshop')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Check if admin exists
      const admin = await Admin.findOne({ email: 'admin@techshop.com' });
      
      if (admin) {
        console.log('Admin found:', {
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          id: admin._id
        });
      } else {
        console.log('No admin found with email admin@techshop.com');
        
        // Create admin if not exists
        console.log('Creating admin user...');
        const newAdmin = new Admin({
          email: 'admin@techshop.com',
          password: 'admin123',
          firstName: 'Admin',
          lastName: 'User'
        });
        
        await newAdmin.save();
        console.log('Admin created successfully');
      }
    } catch (error) {
      console.error('Error checking admin:', error);
    } finally {
      mongoose.connection.close();
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
