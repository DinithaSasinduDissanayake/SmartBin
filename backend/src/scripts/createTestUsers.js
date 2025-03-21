//
// Required libraries
const bcryptjs = require('bcryptjs');  // CHANGE: Use bcryptjs instead of bcrypt
const mongoose = require('mongoose');   
const User = require('../models/User');  
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Main function to create test users
const createTestUsers = async () => {
  try {
    // Connect to MongoDB using .env file
    console.log('Connecting to MongoDB...');
    
    // Get connection string from environment variable or use a placeholder for documentation
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sasindu10:12345@smartbincluster.ij7fd.mongodb.net/smartbin?retryWrites=true&w=majority&appName=SmartBinCluster';
    
    // Hide actual connection details when logging
    console.log('Using MongoDB connection from environment');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Define test users with different roles
    const testUsers = [
      {
        name: 'Admin User',
        email: 'admin@smartbin.com',
        password: 'Admin123!',
        role: 'admin'
      },
      {
        name: 'Staff Member',
        email: 'staff@smartbin.com',
        password: 'Staff123!',
        role: 'staff'
      },
      {
        name: 'Financial Manager',
        email: 'finance@smartbin.com',
        password: 'Finance123!',
        role: 'financial_manager'
      }
    ];

    // Process each test user
    for (const user of testUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: user.email });
      
      if (existingUser) {
        console.log(`User ${user.email} already exists. Updating role to ${user.role}`);
        existingUser.role = user.role;
        await existingUser.save();
        continue;
      }
      
      // Hash password for new user (USING BCRYPTJS!)
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(user.password, salt);
      
      // Create new user
      await User.create({
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role
      });
      
      console.log(`Created ${user.role} user: ${user.email}`);
    }

    console.log('Test users created successfully!');
  } catch (error) {
    console.error('Error creating test users:', error.message);
  } finally {
    // Always close the connection when done
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('Database connection closed');
    }
  }
};

// Run the function
createTestUsers();