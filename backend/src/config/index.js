// backend/src/config/index.js
require('dotenv').config(); // Load .env file contents into process.env

// Define application configuration
const config = {
  // Server configuration
  port: process.env.PORT || 5000,

  // Database configuration
  mongodbUri: process.env.MONGODB_URI,

  // JWT configuration
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || '30d', // Default expiration: 30 days

  // User Roles
  roles: ['Resident/Garbage_Buyer', 'staff', 'admin', 'financial_manager'],
  defaultRole: 'Resident/Garbage_Buyer',

  // Rate Limiting configuration
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100, // Max 100 requests per window

  // Add other configurations as needed
  // e.g., email service credentials, external API keys, etc.
};

// Validate essential configuration
if (!config.mongodbUri) {
  console.error('FATAL ERROR: MONGODB_URI is not defined in environment variables.');
  process.exit(1); // Exit if essential config is missing
}
if (!config.jwtSecret) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
  process.exit(1); // Exit if essential config is missing
}


module.exports = config;
