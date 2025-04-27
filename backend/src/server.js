// In src/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression'); // Import compression
const rateLimit = require('express-rate-limit'); // Import rate-limit
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const config = require('./config'); // Import the centralized config
const ApiError = require('./errors/ApiError'); // Import base custom error
const { UnauthorizedError, ForbiddenError, BadRequestError, NotFoundError } = require('./errors'); // Import specific errors
const multer = require('multer'); // Import multer
const { JsonWebTokenError, TokenExpiredError } = require('jsonwebtoken'); // Import JWT errors

const app = express();

// Middleware

// Security Headers
app.use(helmet());

// Enable CORS
app.use(cors());

// Response Compression
app.use(compression()); // Add compression middleware

// Rate Limiting (apply before routes)
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs, // Use config value
  max: config.rateLimitMax,         // Use config value
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(limiter); // Apply the rate limiting middleware to all requests

// Body Parsing
app.use(express.json());

// Logging
app.use(morgan('dev'));

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const subscriptionPlanRoutes = require('./routes/subscriptionPlanRoutes');
const documentRoutes = require('./routes/documentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const performanceRoutes = require('./routes/performanceRoutes');
const financialRoutes = require('./routes/financialRoutes'); // Import financial routes
const userSubscriptionRoutes = require('./routes/userSubscriptionRoutes'); // Import user subscription routes

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subscription-plans', subscriptionPlanRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/financials', financialRoutes); // Use financial routes
app.use('/api/user-subscriptions', userSubscriptionRoutes); // Mount user subscription routes

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'SmartBin API is running' });
});

// Ensure you have this directory for uploads
const uploadDir = path.join(__dirname, '../uploads/documents');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Make the uploads directory accessible
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Connect to MongoDB
mongoose
  .connect(config.mongodbUri) // Use config value
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit if DB connection fails
  });

// Global Error Handler
app.use((err, req, res, next) => {
  // Log the error with more context
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ERROR: ${err.message}`);
  if (!(err instanceof ApiError)) { // Log stack for unexpected errors
     console.error(err.stack);
  }

  // Handle custom ApiErrors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      const badRequestError = new BadRequestError('Validation Error', messages);
      return res.status(badRequestError.statusCode).json({ message: badRequestError.message, errors: badRequestError.errors });
  }
  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      const value = err.keyValue[field];
      const badRequestError = new BadRequestError(`Duplicate field value entered for ${field}: ${value}. Please use another value.`);
      return res.status(badRequestError.statusCode).json({ message: badRequestError.message });
  }
  // Handle Mongoose cast errors (e.g., invalid ObjectId)
  if (err.name === 'CastError') {
      const badRequestError = new BadRequestError(`Invalid ${err.path}: ${err.value}`);
      return res.status(badRequestError.statusCode).json({ message: badRequestError.message });
  }

  // Handle Multer errors (e.g., file size limit)
  if (err instanceof multer.MulterError) {
    const badRequestError = new BadRequestError(`File upload error: ${err.message}`);
    return res.status(badRequestError.statusCode).json({ message: badRequestError.message });
  }
  // Handle custom file type errors from multer filter
  if (err.message && err.message.startsWith('Invalid file type')) { // Check if err.message exists
    const badRequestError = new BadRequestError(err.message);
    return res.status(badRequestError.statusCode).json({ message: badRequestError.message });
  }

  // Handle JWT errors
  if (err instanceof JsonWebTokenError || err instanceof TokenExpiredError) {
    const unauthorizedError = new UnauthorizedError('Not authorized, token failed or expired');
    return res.status(unauthorizedError.statusCode).json({ message: unauthorizedError.message });
  }


  // Default 500 handler for other unhandled errors
  // Check if response headers have already been sent
  if (!res.headersSent) {
     res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Start server
app.listen(config.port, () => console.log(`Server running on port ${config.port}`)); // Use config value