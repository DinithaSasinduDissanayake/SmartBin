// backend/middleware/validationErrorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

// Custom error class for validation errors
class BadRequestError extends Error {
  statusCode: number;
  errors?: string[];
  
  constructor(message = 'Validation failed', errors?: string[]) {
    super(message);
    this.statusCode = 400;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Middleware to handle validation errors
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Extract specific error messages
    const errorMessages = errors.array().map(err => err.msg as string);
    // Throw a BadRequestError with the validation messages
    throw new BadRequestError('Validation failed', errorMessages);
  }
  next();
};