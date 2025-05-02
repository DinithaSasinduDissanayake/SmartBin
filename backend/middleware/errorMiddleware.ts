// backend/middleware/errorMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import mongoose from 'mongoose';

// Define the error response interface
interface ErrorResponse {
  message: string;
  timestamp: string;
  errors?: any;
}

// Global error handling middleware
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Log the error with enhanced context
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ${req.method} ${req.originalUrl} - ERROR: ${err.name || 'Unknown'} - ${err.message}`);
  
  // Standard response structure
  let responseError: ErrorResponse = {
    message: 'An error occurred',
    timestamp: timestamp
  };

  // Handle our custom errors
  if (err.statusCode) {
    responseError.message = err.message;
    
    if (err.errors) {
      responseError.errors = err.errors;
    }
    
    return res.status(err.statusCode).json(responseError);
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val: any) => val.message);
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

  // Default server error response
  responseError.message = 'Internal Server Error';
  return res.status(500).json(responseError);
};