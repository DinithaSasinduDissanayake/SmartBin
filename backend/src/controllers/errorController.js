// backend/src/controllers/errorController.js
const AppError = require('../utils/appError');
const config = require('../config'); // Import config to check environment

// Handle CastError (e.g., invalid MongoDB ObjectId)
const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400); // 400 Bad Request
};

// Handle Duplicate Fields Error (e.g., unique constraint violation)
const handleDuplicateFieldsDB = err => {
  // Extract value from the error message using regex
  const value = err.errmsg.match(/(["'])(\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400); // 400 Bad Request
};

// Handle Mongoose Validation Error
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400); // 400 Bad Request
};

// Handle JWT Invalid Signature Error
const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401); // 401 Unauthorized

// Handle JWT Expired Error
const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401); // 401 Unauthorized

// Send detailed error response in development
const sendErrorDev = (err, req, res) => {
  // A) API errors
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }
  // B) RENDERED WEBSITE errors (if applicable, otherwise same as API)
  console.error('ERROR 💥', err);
  return res.status(err.statusCode).json({ // Keep JSON response for consistency
      title: 'Something went wrong!',
      msg: err.message
  });
};

// Send generic error response in production
const sendErrorProd = (err, req, res) => {
  // A) API errors
  if (req.originalUrl.startsWith('/api')) {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }
    // Programming or other unknown error: don't leak error details
    // 1) Log error
    console.error('ERROR 💥', err);
    // 2) Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }

  // B) RENDERED WEBSITE errors (if applicable)
  // Operational, trusted error: send message to client
   if (err.isOperational) {
    return res.status(err.statusCode).json({ // Keep JSON response
        title: 'Something went wrong!',
        msg: err.message
    });
  }
  // Programming or other unknown error: don't leak error details
  // 1) Log error
  console.error('ERROR 💥', err);
  // 2) Send generic message
  return res.status(err.statusCode).json({ // Keep JSON response
      title: 'Something went wrong!',
      msg: 'Please try again later.'
  });
};

// Global Error Handling Middleware
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500; // Default to 500 Internal Server Error
  err.status = err.status || 'error'; // Default status

  if (config.nodeEnv === 'development') {
    sendErrorDev(err, req, res);
  } else if (config.nodeEnv === 'production') {
    let error = { ...err }; // Create a hard copy
    error.message = err.message; // Copy message explicitly as it might not spread correctly

    // Handle specific Mongoose/JWT errors for production
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error); // MongoDB duplicate key error
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
