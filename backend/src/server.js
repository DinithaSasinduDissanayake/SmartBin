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
const ApiError = require('./errors/ApiError'); // Import base custom error
const multer = require('multer'); // Import multer

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
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
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
const MONGODB_URI = process.env.MONGODB_URI;
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('ERROR:', err.message);
  // console.error(err.stack); // Uncomment for detailed stack trace during development

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ message: 'Validation Error', errors: messages });
  }
  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      const value = err.keyValue[field];
      return res.status(400).json({ message: `Duplicate field value entered for ${field}: ${value}. Please use another value.` });
  }
  // Handle Mongoose cast errors (e.g., invalid ObjectId)
  if (err.name === 'CastError') {
      return res.status(400).json({ message: `Invalid ${err.path}: ${err.value}` });
  }

  // Handle Multer errors (e.g., file size limit)
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: `File upload error: ${err.message}` });
  }
  // Handle custom file type errors from multer filter
  if (err.message.startsWith('Invalid file type')) {
    return res.status(400).json({ message: err.message });
  }

  // Default to 500 for other unhandled errors
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));