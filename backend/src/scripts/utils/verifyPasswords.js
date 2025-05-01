const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const User = require('../models/User');

const verifyPasswords = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://sasindu10:12345@smartbincluster.ij7fd.mongodb.net/smartbin?retryWrites=true&w=majority&appName=SmartBinCluster');
    console.log('Connected to MongoDB');
    
    // Test credentials
    const testUsers = [
      { email: 'admin@smartbin.com', password: 'Admin123!' },
      { email: 'staff@smartbin.com', password: 'Staff123!' },
      { email: 'finance@smartbin.com', password: 'Finance123!' }
    ];
    
    for (const user of testUsers) {
      // Find user and explicitly select password
      const foundUser = await User.findOne({ email: user.email }).select('+password');
      
      if (!foundUser) {
        console.log(`❌ User not found: ${user.email}`);
        continue;
      }
      
      console.log(`Found user: ${foundUser.email} (${foundUser.role})`);
      console.log(`Password hash: ${foundUser.password ? foundUser.password.substring(0, 20) + '...' : 'NO PASSWORD FOUND'}`);
      
      // Direct bcryptjs comparison
      if (foundUser.password) {
        const passwordMatches = await bcryptjs.compare(user.password, foundUser.password);
        console.log(`Password direct comparison: ${passwordMatches ? '✅ MATCH' : '❌ NO MATCH'}`);
      } else {
        console.log('⚠️ No password hash found for comparison');
      }
      
      console.log('-------------------');
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
};

verifyPasswords();