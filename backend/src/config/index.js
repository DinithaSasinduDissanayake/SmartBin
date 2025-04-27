// backend/src/config/index.js
require('dotenv').config(); // Load .env file contents into process.env

// Define application configuration
const config = {
  // Environment
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Server configuration
  port: parseInt(process.env.PORT, 10) || 5000,
  
  // Database configuration
  mongodbUri: process.env.MONGODB_URI,
  
  // JWT configuration
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || '30d', // Default expiration: 30 days
  
  // File upload configuration
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024, // 5MB default
  allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'pdf,jpg,jpeg,png,doc,docx').split(','),
  
  // User Roles
  roles: ['admin', 'staff', 'customer'], // Updated roles
  defaultRole: 'customer', // Updated default role
  
  // Rate Limiting configuration
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100, // Max 100 requests per window
  
  // Email configuration (for future use)
  emailService: process.env.EMAIL_SERVICE,
  emailUser: process.env.EMAIL_USER,
  emailPassword: process.env.EMAIL_PASSWORD,
  emailFrom: process.env.EMAIL_FROM,
  
  // Payment gateway configuration (Stripe)
  stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  
  // Geolocation API configuration (for future use)
  geoApiKey: process.env.GEO_API_KEY,
};

// List of essential environment variables that must be defined
const essentialVariables = [
  { name: 'MONGODB_URI', value: config.mongodbUri },
  { name: 'JWT_SECRET', value: config.jwtSecret }
];

// Validate essential configuration
let missingVars = essentialVariables.filter(v => !v.value);
if (missingVars.length > 0) {
  const missingList = missingVars.map(v => v.name).join(', ');
  console.error(`
===============================================
🚨 FATAL ERROR: Missing essential environment variables: ${missingList}
===============================================
Please make sure these variables are defined in your .env file.
Refer to .env.example for the required variables and their formats.
  `);
  process.exit(1);
}

// Output confirmation of configuration loaded
if (config.nodeEnv !== 'test') {
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Server running on port: ${config.port}`);
}

module.exports = config;
