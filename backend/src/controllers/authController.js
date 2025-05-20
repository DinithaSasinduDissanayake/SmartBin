// backend/src/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
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

/**
 * @desc    Password reset request - Generates a token and sends it via email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 * @param   {import('express').Request} req - Express request object with email
 * @param   {import('express').Response} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({ 
        message: 'If a user with that email exists, a password reset link has been sent to their email.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // Hash token and save to user
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Set expiry (30 minutes from now)
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    
    await user.save();
    
    // Create reset URL
    const resetUrl = `${config.frontendUrl}/reset-password/${resetToken}`;
    
    // TODO: In production, send actual email with reset link
    console.log('PASSWORD RESET LINK:', resetUrl);
    
    // For now, we'll just send the token in the response (FOR DEVELOPMENT ONLY)
    // In production, this should only return a generic success message
    return res.status(200).json({ 
      message: 'If a user with that email exists, a password reset link has been sent to their email.',
      // The following is for development only
      devNote: 'In production, the token would be sent via email',
      resetUrl,
      resetToken 
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    
    // If there's an error, clean up any tokens that might have been set
    if (req.body.email) {
      const user = await User.findOne({ email: req.body.email });
      if (user) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
      }
    }
    
    next(error);
  }
};

/**
 * @desc    Reset password using token
 * @route   POST /api/auth/reset-password
 * @access  Public
 * @param   {import('express').Request} req - Express request object with token and new password
 * @param   {import('express').Response} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    
    // Hash the token from the URL
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find user with this token and valid expiry
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    
    if (!user) {
      throw new BadRequestError('Invalid or expired password reset token');
    }
    
    // Set the new password (will be hashed by the pre-save hook)
    user.password = password;
    
    // Clear the reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();
    
    // Return the new token so user can be logged in automatically
    res.status(200).json({
      message: 'Password reset successful',
      token: generateToken(user._id)
    });
    
  } catch (error) {
    console.error('Reset password error:', error);
    next(error);
  }
};