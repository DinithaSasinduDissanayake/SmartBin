// In src/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression'); // Import compression
const rateLimit = require('express-rate-limit'); // Import rate-limit
const mongoSanitize = require('express-mongo-sanitize'); // Import mongo-sanitize
const xss = require('xss-clean'); // Import xss-clean
const hpp = require('hpp'); // Import hpp
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const config = require('./config');
const ApiError = require('./errors/ApiError');
const { UnauthorizedError, ForbiddenError, BadRequestError, NotFoundError } = require('./errors');
const multer = require('multer');
const { JsonWebTokenError, TokenExpiredError } = require('jsonwebtoken');
const { preserveRawBody } = require('./middleware/webhookMiddleware'); // Import webhook middleware
const net = require('net'); // Import net module for port checking
const adminRoutes = require('./routes/adminRoutes'); // Import admin routes
const globalErrorHandler = require('./controllers/errorController'); // Assuming error handler path
const AppError = require('./utils/appError'); // Assuming AppError path

// Global handlers for uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(error.name, error.message, error.stack);
  // Don't exit for EADDRINUSE errors - they will be handled by port checking
  if (error.code !== 'EADDRINUSE') {
    process.exit(1); // Mandatory shutdown for other uncaught exceptions
  }
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

// --- Global Middleware ---

// Webhook middleware - must be before body parsing middleware
app.use(preserveRawBody);

// Security Headers
app.use(helmet());

// Enable CORS
app.use(cors());
app.options('*', cors()); // Enable CORS pre-flight

// Response Compression
app.use(compression()); // Add compression middleware

// Rate Limiting (apply before routes)
const limiter = rateLimit({
  max: 1000, // Limit each IP to 1000 requests per windowMs
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body Parsing - must be after preserveRawBody to not interfere with webhook processing
app.use(express.json({ limit: '10kb' })); // Body parser, reading data from body into req.body
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // Parse URL-encoded bodies

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution - specify allowed parameters for HPP whitelist if needed
app.use(hpp({
  // whitelist: [ 'duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price' ]
}));

// Logging
app.use(morgan('dev'));

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const documentRoutes = require('./routes/documentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const subscriptionPlanRoutes = require('./routes/subscriptionPlanRoutes');
const userSubscriptionRoutes = require('./routes/userSubscriptionRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const performanceRoutes = require('./routes/performanceRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const financialRoutes = require('./routes/financialRoutes'); // Import financial routes
const mfaRoutes = require('./routes/mfaRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes'); // Import dashboard routes
const budgetRoutes = require('./routes/budgetRoutes'); // Import budget routes
const statisticsRoutes = require('./routes/statisticsRoutes'); // Import statistics routes
const settingsRoutes = require('./routes/settingsRoutes'); // Import settings routes
const recyclingRoutes = require('./routes/recyclingRoutes'); // Import recycling routes

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/subscription-plans', subscriptionPlanRoutes);
app.use('/api/user-subscriptions', userSubscriptionRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/financials', financialRoutes); // Mount financial routes
app.use('/api/mfa', mfaRoutes);
app.use('/api/dashboard', dashboardRoutes); // Mount dashboard routes
app.use('/api/budgets', budgetRoutes); // Mount budget routes
app.use('/api/admin', adminRoutes); // Mount admin routes
app.use('/api/statistics', statisticsRoutes); // Mount statistics routes
app.use('/api/settings', settingsRoutes); // Mount settings routes
app.use('/api/recycling-requests', recyclingRoutes); // Mount recycling routes

// Handle undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

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

// Function to check if a port is in use
const isPortAvailable = (port) => {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', () => resolve(false))
      .once('listening', () => {
        tester.close();
        resolve(true);
      })
      .listen(port);
  });
};

// Find an available port starting from the specified one
const findAvailablePort = async (startPort) => {
  let port = startPort;
  const maxAttempts = 10; // Try up to 10 ports
  
  for (let i = 0; i < maxAttempts; i++) {
    if (await isPortAvailable(port)) {
      return port;
    }
    port++;
  }
  
  throw new Error(`Could not find an available port after ${maxAttempts} attempts`);
};

const startServer = async () => {
  if (server) {
    // If server already exists, don't try to start again
    return server;
  }
  
  try {
    // Find an available port, starting from the configured one
    const port = await findAvailablePort(config.port);
    
    // Log if we're using a different port than configured
    if (port !== config.port) {
      console.log(`Port ${config.port} is in use, using port ${port} instead`);
    }
    
    // Start the server on the available port
    server = app.listen(port, () => console.log(`Server running on port ${port}`));
    return server;
  } catch (err) {
    console.error('Failed to start server:', err.message);
    throw err;
  }
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
app.use(globalErrorHandler);

// --- Main Execution Block ---
// Connect to DB and start server only if this file is run directly
if (require.main === module) {
  connectDB().then(() => {
    startServer().catch(err => {
      console.error('Failed to start server:', err.message);
      // Don't exit for port issues - let nodemon handle restart
      if (err.code !== 'EADDRINUSE') {
        process.exit(1);
      }
    });
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