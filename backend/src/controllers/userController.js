// backend/src/controllers/userController.js
const User = require('../models/User');
const Document = require('../models/Document');
const fs = require('fs');
const path = require('path');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');
const ApiError = require('../errors/ApiError');
const BadRequestError = require('../errors/BadRequestError'); // Added for adminCreateUser

/**
 * @desc    Get all users (with pagination)
 * @route   GET /api/users
 * @access  Private/Admin
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.getUsers = async (req, res, next) => {
  try {
    // Basic Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10; // Default limit to 10
    const skip = (page - 1) * limit;

    // TODO: Add filtering (e.g., by role) and search (e.g., by name/email) later
    const query = {}; 

    const users = await User.find(query)
      .select('-password') // Exclude password
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Sort by creation date

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      users,
      currentPage: page,
      totalPages,
      totalUsers,
    });
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
    
    // Include new fields in response
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      preferences: user.preferences,
      // Include skills and availability only for staff
      ...(user.role === 'staff' && { 
        skills: user.skills, 
        availability: user.availability 
      }),
      mfaEnabled: user.mfaEnabled,
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
    user.phone = req.body.phone || user.phone;
    
    // Update address if provided
    if (req.body.address) {
      user.address = {
        street: req.body.address.street || user.address?.street,
        city: req.body.address.city || user.address?.city,
        postalCode: req.body.address.postalCode || user.address?.postalCode,
        country: req.body.address.country || user.address?.country || 'Sri Lanka',
        // Keep location as is or update if provided
        location: req.body.address.location || user.address?.location
      };
    }
    
    // Update preferences if customer
    if (user.role === 'customer' && req.body.preferences) {
      user.preferences = {
        pickupNotes: req.body.preferences.pickupNotes || user.preferences?.pickupNotes
      };
    }
    
    // Update staff-specific fields if staff
    if (user.role === 'staff') {
      if (req.body.skills) {
        user.skills = req.body.skills;
      }
      if (req.body.availability) {
        user.availability = req.body.availability;
      }
    }
    
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
      phone: updatedUser.phone,
      address: updatedUser.address,
      role: updatedUser.role,
      preferences: updatedUser.preferences,
      ...(updatedUser.role === 'staff' && { 
        skills: updatedUser.skills, 
        availability: updatedUser.availability 
      }),
      mfaEnabled: updatedUser.mfaEnabled,
      createdAt: updatedUser.createdAt
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    // Mongoose validation errors will be caught by global handler
    next(error); // Pass NotFoundError or other errors
  }
};

/**
 * @desc    Admin update user
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.adminUpdateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      throw new NotFoundError(`User not found with id ${req.params.id}`);
    }
    
    // Update all fields that can be modified by admin
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.role = req.body.role || user.role;
    
    // Update address if provided
    if (req.body.address) {
      user.address = {
        street: req.body.address.street || user.address?.street,
        city: req.body.address.city || user.address?.city,
        postalCode: req.body.address.postalCode || user.address?.postalCode,
        country: req.body.address.country || user.address?.country || 'Sri Lanka',
        location: req.body.address.location || user.address?.location
      };
    }
    
    // Update preferences
    if (req.body.preferences) {
      user.preferences = {
        pickupNotes: req.body.preferences.pickupNotes || user.preferences?.pickupNotes
      };
    }
    
    // Update staff-specific fields
    if (req.body.skills) {
      user.skills = req.body.skills;
    }
    
    if (req.body.availability) {
      user.availability = req.body.availability;
    }
    
    // Admin can reset password if needed
    if (req.body.password) {
      // Ensure password meets minimum length if provided
      if (req.body.password.length < 8) {
        return next(new BadRequestError('Password must be at least 8 characters long'));
      }
      user.password = req.body.password; // Will be hashed by pre-save hook
    }
    
    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      role: updatedUser.role,
      preferences: updatedUser.preferences,
      skills: updatedUser.skills,
      availability: updatedUser.availability,
      mfaEnabled: updatedUser.mfaEnabled,
      createdAt: updatedUser.createdAt
    });
  } catch (error) {
    console.error(`Error updating user ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * @desc    Admin create a new user
 * @route   POST /api/users
 * @access  Private/Admin
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.adminCreateUser = async (req, res, next) => {
  // Validation handled by express-validator
  const { name, email, password, role, phone, address, skills, availability, baseSalary, hourlyRate } = req.body;

  try {
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new BadRequestError('User already exists with this email');
    }

    // Prepare user data
    const userData = {
      name,
      email,
      password, // Will be hashed by pre-save hook
      role: role || 'customer', // Default to customer if not provided
      phone,
      address,
    };

    // Add role-specific fields
    if (userData.role === 'staff') {
      userData.skills = skills || [];
      userData.availability = availability || '';
      userData.baseSalary = baseSalary;
      userData.hourlyRate = hourlyRate;
    } else if (userData.role === 'customer' && req.body.preferences) {
       userData.preferences = {
         pickupNotes: req.body.preferences.pickupNotes || ''
       };
    }
    // Add other role-specific initializations if needed

    // Create user
    const user = await User.create(userData);

    // Don't send password back
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);

  } catch (error) {
    console.error('Admin Create User error:', error);
    next(error); // Pass BadRequestError or others
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