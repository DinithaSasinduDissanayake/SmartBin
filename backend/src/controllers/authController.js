// backend/src/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const BadRequestError = require('../errors/BadRequestError');
const UnauthorizedError = require('../errors/UnauthorizedError');
const ApiError = require('../errors/ApiError');
const NotFoundError = require('../errors/NotFoundError');
const config = require('../config'); // Import the centralized config

/**
 * Generates a JSON Web Token (JWT) for a given user ID.
 * Uses the secret and expiration defined in the application config.
 *
 * @param {string} id - The MongoDB ObjectId of the user.
 * @returns {string} The generated JWT token.
 */
const generateToken = (id) => {
  // Use config values and ensure they are strings
  return jwt.sign({ id }, String(config.jwtSecret), {
    expiresIn: String(config.jwtExpire)
  });
};

/**
 * @desc    Register a new user. Handles validation errors and checks for existing users.
 *          Hashes the password before saving.
 * @route   POST /api/auth/register
 * @access  Public
 * @param   {import('express').Request} req - Express request object, expects user details in body.
 * @param   {import('express').Response} res - Express response object.
 * @param   {function} next - Express next middleware function
 */
exports.registerUser = async (req, res, next) => {
  // Validation is handled by express-validator middleware
  const { name, email, password, role, phone, address } = req.body; // Include new fields

  try {
    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      throw new BadRequestError('User already exists with this email');
    }

    // Create user with all provided fields
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'customer', // Use validated role or default to 'customer'
      phone, // Add phone if provided
      address, // Add address if provided
      // Initialize preferences if role is customer
      ...((!role || role === 'customer') && {
        preferences: {
          pickupNotes: ''
        }
      }),
      // Initialize staff fields if role is staff
      ...(role === 'staff' && {
        skills: [],
        availability: ''
      })
    });

    // User creation includes pre-save hook for password hashing

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      token: generateToken(user._id)
    });

  } catch (error) {
    console.error('Registration error:', error);
    // Simply pass the error to the global handler
    next(error); 
  }
};

/**
 * @desc    Authenticate a user and return a JWT token. Handles MFA checks.
 * @route   POST /api/auth/login
 * @access  Public
 * @param   {import('express').Request} req - Express request object, expects email and password in body.
 * @param   {import('express').Response} res - Express response object.
 * @param   {function} next - Express next middleware function
 */
exports.loginUser = async (req, res, next) => {
  // Validation is handled by express-validator middleware
  const { email, password } = req.body;
  console.log(`[Login Attempt] Email: ${email}, Password Received: ${password ? 'Yes' : 'No'}`); // Log received data

  try {
    // Find user by email (case-insensitive) and select password and MFA fields
    const user = await User.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') } 
    }).select('+password +mfaSecret');
    
    if (!user) {
      console.log(`[Login Attempt] User not found for email: ${email}`); // Log user not found
      throw new UnauthorizedError('Invalid credentials'); // Use specific error
    }
    console.log(`[Login Attempt] User found: ${user.email}, ID: ${user._id}`); // Log user found
    
    // Check if password matches using the model method
    const isMatch = await user.matchPassword(password);
    console.log(`[Login Attempt] Password match result for ${user.email}: ${isMatch}`); // Log password match result
    
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials'); // Use specific error
    }

    // Check if MFA is enabled for this user
    if (user.mfaEnabled) {
      // Return only partial authentication - client will need to complete MFA step
      return res.json({
        mfaRequired: true,
        userId: user._id,
        // Do not provide token yet - will be given after MFA verification
      });
    }
    
    // If no MFA or MFA verification passed, generate token and send response
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      mfaEnabled: user.mfaEnabled,
      token: generateToken(user._id)
    });

  } catch (error) {
    console.error('Login error:', error);
    // Simply pass the error to the global handler
    next(error); 
  }
};

/**
 * @desc    Get the profile details of the currently authenticated user.
 * @route   GET /api/auth/me
 * @access  Private
 * @param   {import('express').Request} req - Express request object (user attached by protect middleware).
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.getMe = async (req, res, next) => {
  try {
    // Get full user details from database to include all new fields
    const user = await User.findById(req.user.id);

    if (!user) {
        throw new NotFoundError('User data not found after authentication');
    }
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      preferences: user.preferences,
      // Include staff-specific fields if applicable
      ...(user.role === 'staff' && { 
        skills: user.skills, 
        availability: user.availability 
      }),
      mfaEnabled: user.mfaEnabled
    });
  } catch (error) {
    console.error('GetMe error:', error);
    next(error); // Pass NotFoundError or others
  }
};