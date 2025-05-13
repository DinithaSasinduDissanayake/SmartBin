// backend/src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { UnauthorizedError, ForbiddenError } = require('../errors'); // Import custom errors
const config = require('../config'); // Import the centralized config

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, config.jwtSecret); // Use config.jwtSecret

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        // If user associated with token doesn't exist anymore
        return next(new UnauthorizedError('User belonging to this token does no longer exist'));
      }

      next();
    } catch (error) {
      // Catch JWT errors specifically, let global handler manage response
      // Use the specific error types for better handling in the global handler
      if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
          return next(error); // Pass JWT specific errors to the global handler
      } else {
          // Pass other unexpected errors
          return next(new UnauthorizedError('Not authorized, token processing failed'));
      }
    }
  }

  if (!token) {
    // Let global handler manage response
    return next(new UnauthorizedError('Not authorized, no token'));
  }
};

// Role authorization
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Ensure protect middleware runs first, so req.user exists
    if (!req.user) {
        // This should ideally not happen if protect runs first, but as a safeguard
        return next(new UnauthorizedError('Not authorized to access this resource'));
    }
    // Check if the user's role is included in the allowed roles
    if (!roles.includes(req.user.role)) {
      // Let global handler manage response
      return next(new ForbiddenError(`Role ${req.user.role} is not authorized to access this resource`));
    }
    next();
  };
};