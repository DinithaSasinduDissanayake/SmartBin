// backend/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { UnauthorizedError, ForbiddenError } from '../errors';

// Configure dotenv
dotenv.config();

// Define User schema interface (simplified version for middleware)
interface IUser {
  _id: mongoose.Types.ObjectId;
  role: string;
}

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// Get the JWT secret from environment variables
const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

// Protect routes - verify token and set user on request
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, jwtSecret) as jwt.JwtPayload;

      // Get user from the token (only include necessary fields)
      // Note: In a real implementation, you'd query your User model here
      // This is a simplified version that assumes you have a User model
      const User = mongoose.model('User');
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new UnauthorizedError('User belonging to this token no longer exists'));
      }

      // Set the user in the request
      req.user = user;
      next();
    } catch (error) {
      // Handle specific JWT errors
      if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
        return next(error);
      } else {
        return next(new UnauthorizedError('Not authorized, token processing failed'));
      }
    }
  }

  if (!token) {
    return next(new UnauthorizedError('Not authorized, no token provided'));
  }
};

// Role authorization middleware
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Ensure protect middleware runs first, so req.user exists
    if (!req.user) {
      return next(new UnauthorizedError('Not authorized to access this resource'));
    }
    
    // Check if the user's role is included in the allowed roles
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError(`Role ${req.user.role} is not authorized to access this resource`));
    }
    
    next();
  };
};