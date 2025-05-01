// backend/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getUsers, 
  getUserById, 
  updateUserProfile, 
  deleteUser,
  getUserProfile,
  deleteUserProfile,
  adminCreateUser, // Import adminCreateUser
  adminUpdateUser  // Import adminUpdateUser
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { body } = require('express-validator'); // Import only body
const { handleValidationErrors } = require('../middleware/validationErrorHandler'); // Import shared handler

// Validation for updating user profile (self)
const updateProfileValidation = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty').trim().escape(),
  body('email').optional().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number format'),
  // Add validation for other updatable profile fields
];

// Validation for admin creating a user
const adminCreateUserValidation = [
  body('name', 'Name is required').notEmpty().trim().escape(),
  body('email', 'Please include a valid email').isEmail().normalizeEmail(),
  body('password', 'Password must be at least 8 characters long').isLength({ min: 8 }),
  body('role').optional().isIn(['customer', 'staff', 'admin', 'financial_manager']).withMessage('Invalid role specified'),
  body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number format'),
  // Add validation for address fields if needed
];

// Validation for admin updating a user
const adminUpdateUserValidation = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty').trim().escape(),
  body('email').optional().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('role').optional().isIn(['customer', 'staff', 'admin', 'financial_manager']).withMessage('Invalid role specified'),
  body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number format'),
  body('password').optional().isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'), // Validate if password is provided
  // Add validation for other fields like address, skills, availability
];

// User profile routes - all users can access their own profile
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateProfileValidation, handleValidationErrors, updateUserProfile) // Use shared handler
  .delete(protect, deleteUserProfile);

// --- Admin User Management Routes ---
router.route('/')
  .get(protect, authorize('admin'), getUsers)
  .post(protect, authorize('admin'), adminCreateUserValidation, handleValidationErrors, adminCreateUser); // Add POST route for admin create

router.route('/:id')
  .get(protect, authorize('admin'), getUserById)
  .put(protect, authorize('admin'), adminUpdateUserValidation, handleValidationErrors, adminUpdateUser) // Add PUT route for admin update
  .delete(protect, authorize('admin'), deleteUser);

module.exports = router;