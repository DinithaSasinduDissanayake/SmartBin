/**
 * This script manually verifies the error handler functionality
 * Run it with: node tests/manualErrorVerify.js
 */
const express = require('express');
const { BadRequestError, UnauthorizedError, NotFoundError, ForbiddenError } = require('../src/errors');
const mongoose = require('mongoose');
const { JsonWebTokenError, TokenExpiredError } = require('jsonwebtoken');
require('dotenv').config();

// Create a simple express application for testing
const app = express();

// Import the error handler middleware from server.js
// This is a simplified version of the error handler for testing
app.use(express.json());

// Add test routes
app.get('/', (req, res) => {
  res.json({ message: 'Error Handler Test Server' });
});

app.get('/test/bad-request', (req, res, next) => {
  next(new BadRequestError('Invalid input data'));
});

app.get('/test/validation-error', (req, res, next) => {
  const error = new BadRequestError('Validation Error');
  error.errors = ['Name is required', 'Email is invalid'];
  next(error);
});

app.get('/test/unauthorized', (req, res, next) => {
  next(new UnauthorizedError('Authentication required'));
});

app.get('/test/not-found', (req, res, next) => {
  next(new NotFoundError('Resource not found'));
});

app.get('/test/forbidden', (req, res, next) => {
  next(new ForbiddenError('Permission denied'));
});

app.get('/test/mongoose-cast', (req, res, next) => {
  const error = new mongoose.Error.CastError('ObjectId', 'invalid-id', '_id');
  next(error);
});

app.get('/test/jwt-invalid', (req, res, next) => {
  next(new JsonWebTokenError('invalid token'));
});

app.get('/test/jwt-expired', (req, res, next) => {
  next(new TokenExpiredError('jwt expired', new Date()));
});

app.get('/test/unhandled', (req, res, next) => {
  next(new Error('Something went wrong'));
});

// Add the error handler middleware
app.use((err, req, res, next) => {
  // Log the error with enhanced context
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ${req.method} ${req.originalUrl} - ERROR: ${err.name || 'Unknown'} - ${err.message}`);
  
  // Standard response structure
  let responseError = {
    message: 'An error occurred',
    timestamp: timestamp
  };

  // Handle custom ApiErrors
  if (err.constructor.name === 'BadRequestError' || 
      err.constructor.name === 'UnauthorizedError' || 
      err.constructor.name === 'NotFoundError' || 
      err.constructor.name === 'ForbiddenError') {
    responseError.message = err.message;
    
    if (err.errors) {
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

  // Handle JWT errors
  if (err instanceof JsonWebTokenError) {
    responseError.message = 'Invalid authentication token';
    return res.status(401).json(responseError);
  }

  if (err instanceof TokenExpiredError) {
    responseError.message = 'Authentication token has expired';
    return res.status(401).json(responseError);
  }

  // Default 500 handler
  responseError.message = 'Internal Server Error';
  res.status(500).json(responseError);
});

// Start the server
const PORT = 3099; // Use a different port for testing
app.listen(PORT, () => {
  console.log(`Error handler test server running on port ${PORT}`);
  console.log(`Test URLs:`);
  console.log(`- http://localhost:${PORT}/test/bad-request`);
  console.log(`- http://localhost:${PORT}/test/validation-error`);
  console.log(`- http://localhost:${PORT}/test/unauthorized`);
  console.log(`- http://localhost:${PORT}/test/not-found`);
  console.log(`- http://localhost:${PORT}/test/forbidden`);
  console.log(`- http://localhost:${PORT}/test/mongoose-cast`);
  console.log(`- http://localhost:${PORT}/test/jwt-invalid`);
  console.log(`- http://localhost:${PORT}/test/jwt-expired`);
  console.log(`- http://localhost:${PORT}/test/unhandled`);
});