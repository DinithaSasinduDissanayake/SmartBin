// backend/src/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const BadRequestError = require('../errors/BadRequestError');
const UnauthorizedError = require('../errors/UnauthorizedError');
const ApiError = require('../errors/ApiError');
const NotFoundError = require('../errors/NotFoundError');
const config = require('../config'); // Import the centralized config

// Generate JWT token
const generateToken = (id) => {
  // Use config values and ensure they are strings
  return jwt.sign({ id }, String(config.jwtSecret), {
    expiresIn: String(config.jwtExpire)
  });
};

/**
 * @desc    Register user
 * @route   POST /api/auth/register
 * @access  Public
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.registerUser = async (req, res, next) => {
  // Validation is handled by express-validator middleware
  const { name, email, password, role, phone } = req.body; // Include optional fields

  try {
    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      throw new BadRequestError('User already exists with this email');
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'customer', // Use validated role or default to 'customer'
      phone // Add phone if provided
    });

    // User creation includes pre-save hook for password hashing

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });

  } catch (error) {
    console.error('Registration error:', error);
    // Simply pass the error to the global handler
    next(error); 
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.loginUser = async (req, res, next) => {
  // Validation is handled by express-validator middleware
  const { email, password } = req.body;

  try {
    // Find user by email (case-insensitive) and select password
    const user = await User.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') } 
    }).select('+password');
    
    if (!user) {
      throw new UnauthorizedError('Invalid credentials'); // Use specific error
    }
    
    // Check if password matches using the model method
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials'); // Use specific error
    }
    
    // Generate token and send response
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });

  } catch (error) {
    console.error('Login error:', error);
    // Simply pass the error to the global handler
    next(error); 
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 * @param   {object} req - Express request object (user attached by protect middleware)
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.getMe = async (req, res, next) => {
  try {
    // req.user is attached by the protect middleware, findById is redundant unless populating
    // const user = await User.findById(req.user.id);
    const user = req.user; // User object from protect middleware

    if (!user) {
        // This case should ideally be prevented by the protect middleware
        throw new NotFoundError('User data not found after authentication');
    }
    
    res.json({
      _id: user.id, // Use id from req.user
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error('GetMe error:', error);
    next(error); // Pass NotFoundError or others
  }
};