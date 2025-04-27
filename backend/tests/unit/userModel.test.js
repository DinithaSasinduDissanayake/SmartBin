const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const User = require('../../src/models/User'); // Adjust path as needed

describe('User Model - Password Matching', () => {
  let testUser;
  const plainPassword = 'password123';

  beforeAll(async () => {
    // No need to connect here, setup.js handles it
    // Create a user directly for testing the method
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(plainPassword, salt);
    testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword, // Store the hashed password
      role: 'customer'
    });
    // We don't save it to the DB for this unit test, just need the instance method
  });

  it('should return true for matching passwords', async () => {
    const isMatch = await testUser.matchPassword(plainPassword);
    expect(isMatch).toBe(true);
  });

  it('should return false for non-matching passwords', async () => {
    const isMatch = await testUser.matchPassword('wrongpassword');
    expect(isMatch).toBe(false);
  });
});
