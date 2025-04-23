// backend/src/controllers/userController.js
const User = require('../models/User');
const Document = require('../models/Document');
const fs = require('fs');
const path = require('path');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');
const ApiError = require('../errors/ApiError');

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    next(new ApiError(500, 'Failed to fetch users')); // Pass error to global handler
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private/Admin
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      // Use custom error
      throw new NotFoundError(`User not found with id ${req.params.id}`);
    }
    res.json(user);
  } catch (error) {
    console.error(`Error fetching user ${req.params.id}:`, error);
    next(error); // Pass error (could be NotFoundError or other) to global handler
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/users/profile
 * @access  Private
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.getUserProfile = async (req, res, next) => {
  try {
    // req.user is attached by the protect middleware
    const user = await User.findById(req.user.id);
    
    if (!user) {
      // Should not happen if protect middleware works, but good practice
      throw new NotFoundError('User not found'); 
    }
    
    // Get user documents if any
    const documents = await Document.find({ user: req.user.id });
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      documents: documents
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    next(error); // Pass potential NotFoundError or other errors
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password'); // Select password if updating
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    // Update basic info (validation handled by express-validator)
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    // Consider adding phone number update if applicable
    
    // Update password if provided and different
    if (req.body.password) {
      // Optionally add a check: await user.matchPassword(req.body.oldPassword)
      user.password = req.body.password; // Pre-save hook will hash
    }
    
    const updatedUser = await user.save(); // Mongoose validation runs here
    
    // Don't send password back, even hashed
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    // Mongoose validation errors will be caught by global handler
    next(error); // Pass NotFoundError or other errors
  }
};

/**
 * @desc    Delete user account (self)
 * @route   DELETE /api/users/profile
 * @access  Private
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.deleteUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    // Prevent staff/admin deletion via this route for safety?
    if (['staff', 'admin', 'financial_manager'].includes(user.role)) {
      throw new ForbiddenError('Admin/Staff/Manager accounts cannot be self-deleted via this endpoint. Contact another administrator.');
    }
    
    // TODO: Add more cleanup logic if needed (e.g., cancel subscriptions, reassign tasks)
    
    // Delete user documents first
    await Document.deleteMany({ user: req.user.id });
    
    // Now delete the user
    await user.deleteOne(); // Use deleteOne() on the document
    
    res.json({ message: 'User account deleted successfully' });
  } catch (error) {
    console.error('Error deleting user profile:', error);
    next(error); // Pass NotFoundError, ForbiddenError, or others
  }
};

/**
 * @desc    Delete user by ID (Admin only)
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
       throw new NotFoundError(`User not found with id ${req.params.id}`);
    }

    // Optional: Prevent deleting the last admin? Add more checks as needed.

    // TODO: Add more cleanup logic if needed (e.g., delete related data)
    await Document.deleteMany({ user: user._id });
    // Add deletion for Attendance, Performance, Subscriptions etc. if required

    await user.deleteOne(); // Use deleteOne() on the document
    res.json({ message: 'User removed successfully' });

  } catch (error) {
    console.error(`Error deleting user ${req.params.id}:`, error);
    next(error); // Pass NotFoundError or others
  }
};