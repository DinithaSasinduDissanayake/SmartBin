import dotenv from 'dotenv';

import express, { Request, Response, NextFunction } from 'express'; // Added types
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet'; // Added from server.js
import morgan from 'morgan'; // Added from server.js
import compression from 'compression'; // Added from server.js
import rateLimit from 'express-rate-limit'; // Added from server.js
import mongoSanitize from 'express-mongo-sanitize'; // Added from server.js
// import xss from 'xss-clean'; // xss-clean seems deprecated/problematic, consider alternatives if needed. Kept commented.
import hpp from 'hpp'; // Added from server.js
import path from 'path'; // Added from server.js
import fs from 'fs'; // Added from server.js
import net from 'net'; // Added from server.js

// --- Import Config (Adjust path if needed) ---
import config from './src/config'; // Adjusted path

// --- Import Error Handling (Using our new TypeScript middleware) ---
import { errorHandler } from './src/middleware/errorMiddleware'; 
import AppError from './src/utils/appError'; // Adjusted path

// --- Import Webhook Middleware (Adjust path if needed) ---
import { preserveRawBody } from './src/middleware/webhookMiddleware'; // Adjusted path

// --- Import Routes (New and Existing - Adjust paths) ---
// New routes from origin/dhanushka
import resourceRoutes from './routes/resourceRoutes';
import scheduleRoutes from './routes/scheduleRoutes';
import equipmentRoutes from './routes/equipmentRoutes';
import toolRoutes from './routes/toolRoutes';
import pickupRoutes from './routes/pickupRoutes'; // Added pickup routes
// Existing routes from server.js (adjust paths)
import authRoutes from './src/routes/authRoutes';
import userRoutes from './src/routes/userRoutes';
import documentRoutes from './src/routes/documentRoutes';
import attendanceRoutes from './src/routes/attendanceRoutes';
import subscriptionPlanRoutes from './src/routes/subscriptionPlanRoutes';
import userSubscriptionRoutes from './src/routes/userSubscriptionRoutes';
import complaintRoutes from './src/routes/complaintRoutes';
import performanceRoutes from './src/routes/performanceRoutes';
import payrollRoutes from './src/routes/payrollRoutes';
import financialRoutes from './src/routes/financialRoutes';
import mfaRoutes from './src/routes/mfaRoutes';
import dashboardRoutes from './src/routes/dashboardRoutes';
import budgetRoutes from './src/routes/budgetRoutes';
import adminRoutes from './src/routes/adminRoutes';
import statisticsRoutes from './src/routes/statisticsRoutes';
import settingsRoutes from './src/routes/settingsRoutes';

// --- Global Unhandled Error Handlers (from server.js) ---
process.on('uncaughtException', (error: Error) => { // Added type
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(error.name, error.message, error.stack);
  // Don't exit for EADDRINUSE errors - they will be handled by port checking
  // Need to check error type/code appropriately in TS
  if ((error as NodeJS.ErrnoException).code !== 'EADDRINUSE') {
    process.exit(1);
  }
});

// Declare server variable for unhandledRejection handler
let server: ReturnType<typeof app.listen> | undefined;

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => { // Added types
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(reason);
  if (server) {
    server.close(() => {
      console.log('Server closed due to unhandled promise rejection');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// --- Initialize Express App ---
const app = express();

// --- Global Middleware (Combined & Ordered) ---

// 1. Webhook Raw Body Preservation (Must be first)
app.use(preserveRawBody);

// 2. Security Headers
app.use(helmet());

// 3. CORS
app.use(cors());
app.options('*', cors()); // Enable CORS pre-flight

// 4. Response Compression
app.use(compression());

// 5. Rate Limiting
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// 6. Body Parsing (Must be after preserveRawBody)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 7. Data Sanitization (NoSQL Injection)
app.use(mongoSanitize());

// 8. Data Sanitization (XSS) - Kept commented, consider alternatives
// app.use(xss());

// 9. Prevent Parameter Pollution
app.use(hpp({
  // whitelist: [ 'duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price' ] // Example whitelist
}));

// 10. Logging
if (process.env.NODE_ENV === 'development') { // Only use morgan in dev
    app.use(morgan('dev'));
}

// --- API Routes Mounting (Combined) ---
// New Routes
app.use('/api', resourceRoutes);
app.use('/api', scheduleRoutes);
app.use('/api', equipmentRoutes);
app.use('/api', toolRoutes);
app.use('/', pickupRoutes); // Added pickup routes
// Existing Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/subscription-plans', subscriptionPlanRoutes);
app.use('/api/user-subscriptions', userSubscriptionRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/financials', financialRoutes);
app.use('/api/mfa', mfaRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/settings', settingsRoutes);

// --- Static File Serving (Uploads) ---
// Ensure uploads directory exists (using path relative to server.ts)
const uploadDir = path.join(__dirname, './uploads/documents'); // Adjusted path relative to backend root
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(path.join(__dirname, './uploads'))); // Adjusted path

// --- Undefined Route Handler ---
app.all('*', (req: Request, res: Response, next: NextFunction) => { // Added types
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// --- Global Error Handler (Must be last middleware) ---// Using our TypeScript error handler instead of the JS version from src/controllers/errorController.jsapp.use(errorHandler);

// --- Database Connection (Robust version from server.js) ---
const connectDB = async () => {
  try {
    if (!config.mongodbUri) { // Use imported config
      throw new Error('MONGODB_URI is not defined in config or .env file');
    }
    await mongoose.connect(config.mongodbUri); // Use imported config
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// --- Server Start/Stop Logic (Robust version from server.js) ---

// Function to check if a port is in use
const isPortAvailable = (port: number): Promise<boolean> => { // Added type
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', (err: NodeJS.ErrnoException) => { // Added type
          // Only resolve false if it's EADDRINUSE, otherwise rethrow? Or just resolve false.
          resolve(err.code === 'EADDRINUSE' ? false : true); // Resolve true for other errors? Let's resolve false for simplicity.
      })
      .once('listening', () => {
        tester.close(() => resolve(true)); // Ensure tester is closed before resolving
      })
      .listen(port, '127.0.0.1'); // Listen on localhost only for testing
  });
};

// Find an available port starting from the specified one
const findAvailablePort = async (startPort: number): Promise<number> => { // Added type
  let port = startPort;
  const maxAttempts = 10;

  for (let i = 0; i < maxAttempts; i++) {
    if (await isPortAvailable(port)) {
      return port;
    }
    console.log(`Port ${port} is busy, trying ${port + 1}`);
    port++;
  }

  throw new Error(`Could not find an available port starting from ${startPort} after ${maxAttempts} attempts`);
};

const startServer = async () => {
  if (server) {
    return server;
  }

  try {
    // Ensure the port value is treated as a string before parsing
    const portString = (config.port || '5000').toString();
    const desiredPort = parseInt(portString, 10); // Use config
    const port = await findAvailablePort(desiredPort);

    if (port !== desiredPort) {
      console.log(`Configured port ${desiredPort} was unavailable. Using port ${port} instead.`);
    }

    server = app.listen(port, () => console.log(`Server running on port ${port}`));
    return server;
  } catch (err: any) { // Added type
    console.error('Failed to start server:', err.message);
    // Don't exit here, let the main block handle it or let nodemon restart
    throw err;
  }
};

const closeServer = (callback?: () => void) => { // Added optional callback type
  if (server) {
    console.log('Closing HTTP server...');
    server.close(() => {
        console.log('HTTP server closed.');
        if (callback) callback();
    });
  } else if (callback) {
    callback();
  }
};

// --- Main Execution Block ---
// Connect to DB and start server
connectDB().then(() => {
  startServer().catch(err => {
    // Error is already logged in startServer
    // Exit only if it's not a port issue (which might be resolved on retry)
    if ((err as NodeJS.ErrnoException).code !== 'EADDRINUSE') {
      process.exit(1);
    }
  });
});

// --- Graceful Shutdown Handler ---
const gracefulShutdown = (signal: string) => { // Added type
  console.log(`${signal} signal received: closing gracefully.`);
  closeServer(() => {
    mongoose.connection.close(false).then(() => { // Mongoose returns a promise
       console.log('MongoDb connection closed.');
       process.exit(0);
    }).catch(err => {
        console.error('Error closing MongoDB connection:', err);
        process.exit(1);
    });
  });
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Export app for potential testing (optional)
// export default app; // Common practice for testing frameworks