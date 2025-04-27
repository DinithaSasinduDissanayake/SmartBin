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
const config = require('./config');
const ApiError = require('./errors/ApiError');
const { UnauthorizedError, ForbiddenError, BadRequestError, NotFoundError } = require('./errors');
const multer = require('multer');
const { JsonWebTokenError, TokenExpiredError } = require('jsonwebtoken');

// Global handlers for uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(error.name, error.message, error.stack);
  process.exit(1); // Mandatory shutdown for uncaught exceptions
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(reason);
  // Graceful shutdown
  if (server) {
    server.close(() => {
      console.log('Server closed due to unhandled promise rejection');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

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
const financialRoutes = require('./routes/financialRoutes');
const userSubscriptionRoutes = require('./routes/userSubscriptionRoutes');
const mfaRoutes = require('./routes/mfaRoutes'); // Import MFA routes

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subscription-plans', subscriptionPlanRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/financials', financialRoutes);
app.use('/api/user-subscriptions', userSubscriptionRoutes);
app.use('/api/mfa', mfaRoutes); // Mount MFA routes

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

// --- Database Connection ---
const connectDB = async () => {
  try {
    // Use config value
    await mongoose.connect(config.mongodbUri);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit if DB connection fails
  }
};

// --- Server Start/Stop ---
let server; // Define server variable outside

const startServer = () => {
  if (!server) { // Prevent multiple starts
     // Use config value
     server = app.listen(config.port, () => console.log(`Server running on port ${config.port}`));
  }
  return server;
};

const closeServer = (callback) => {
  if (server) {
    console.log('Closing HTTP server...');
    server.close(() => {
        console.log('HTTP server closed.');
        if (callback) callback();
    });
  } else if (callback) {
    callback(); // If server never started, just callback
  }
};


// --- Global Error Handler --- (Keep this after routes and before starting server)
app.use((err, req, res, next) => {
  // Log the error with enhanced context
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ${req.method} ${req.originalUrl} - ERROR: ${err.name || 'Unknown'} - ${err.message}`);
  if (err.code) {
    console.error(`Error code: ${err.code}`);
  }
  
  if (!(err instanceof ApiError)) {
     console.error(err.stack); // Always log stack trace server-side for non-API errors
  }

  // Standard response structure
  let responseError = {
    message: 'An error occurred',
    timestamp: timestamp
  };

  // Handle custom ApiErrors with instanceof check
  if (err instanceof ApiError) {
    responseError.message = err.message;
    
    // Add specific error details for certain error types
    if (err instanceof BadRequestError && err.errors) {
      responseError.errors = err.errors;
    }
    
    return res.status(err.statusCode).json(responseError);
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    responseError = {
      message: 'Validation Error',
      errors: messages,
      timestamp: timestamp
    };
    return res.status(400).json(responseError);
  }
  
  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    responseError.message = `Duplicate value for ${field}: "${value}". Please use another value.`;
    return res.status(400).json(responseError);
  }
  
  // Handle Mongoose cast errors (e.g., invalid ObjectId)
  if (err.name === 'CastError') {
    responseError.message = `Invalid ${err.path}: "${err.value}"`;
    return res.status(400).json(responseError);
  }

  // Handle Multer errors (e.g., file size limit)
  if (err instanceof multer.MulterError) {
    responseError.message = `File upload error: ${err.message}`;
    return res.status(400).json(responseError);
  }
  
  // Handle custom file type errors from multer filter
  if (err.message && err.message.startsWith('Invalid file type')) {
    responseError.message = err.message;
    return res.status(400).json(responseError);
  }

  // Handle JWT errors with explicit checks
  if (err instanceof JsonWebTokenError) {
    responseError.message = 'Invalid authentication token';
    return res.status(401).json(responseError);
  }

  if (err instanceof TokenExpiredError) {
    responseError.message = 'Authentication token has expired';
    return res.status(401).json(responseError);
  }

  // Default 500 handler for other unhandled errors
  if (!res.headersSent) {
    // Set production-safe default message
    responseError.message = 'Internal Server Error';
    
    // Only add technical details in development
    if (config.nodeEnv !== 'production') {
      responseError.details = err.message;
      // Don't expose stack traces to the client even in development
    }
    
    res.status(500).json(responseError);
  }
});


// --- Main Execution Block ---
// Connect to DB and start server only if this file is run directly
if (require.main === module) {
  connectDB().then(() => {
    startServer();
  });

  // Graceful shutdown handler
  const gracefulShutdown = (signal) => {
    console.log(`${signal} signal received: closing gracefully.`);
    closeServer(() => {
      mongoose.connection.close(false, () => {
         console.log('MongoDb connection closed.');
         process.exit(0);
      });
    });
  };

  // Listen for termination signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT')); // Handle Ctrl+C

}

// Export app and control functions for testing
// Note: We export mongoose itself, not connectDB, as tests handle their own connection
module.exports = { app, startServer, closeServer, mongooseInstance: mongoose };