const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: '../../.env' });

const recreateUsers = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://sasindu10:12345@smartbincluster.ij7fd.mongodb.net/smartbin?retryWrites=true&w=majority&appName=SmartBinCluster');
      console.log('Connected to MongoDB');
    
    // Test users with plain-text passwords.
    const testUsers = [
      { name: 'Admin User', email: 'admin@smartbin.com', password: 'Admin123!', role: 'admin' },
      { name: 'Staff Member', email: 'staff@smartbin.com', password: 'Staff123!', role: 'staff' },
      { name: 'Financial Manager', email: 'finance@smartbin.com', password: 'Finance123!', role: 'financial_manager' }
    ];
    
    // Delete any existing test users
    for (const user of testUsers) {
      await User.deleteOne({ email: user.email });
      console.log(`Deleted user if exists: ${user.email}`);
    }
    
    // Create new users (the pre-save hook will hash the passwords)
    for (const user of testUsers) {
      const newUser = await User.create(user);
      console.log(`Recreated user: ${newUser.email}`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

recreateUsers();