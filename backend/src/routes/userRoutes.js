// backend/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getUsers, 
  getUserById, 
  updateUserProfile, 
  deleteUser,
  getUserProfile,
  deleteUserProfile
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator'; // Import validator

// Middleware to handle validation errors (can be moved to a shared utility)
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation for updating user profile
const updateProfileValidation = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty').trim().escape(),
  body('email').optional().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number format'),
  // Add validation for any other updatable profile fields
];

// User profile routes - all users can access their own profile
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateProfileValidation, handleValidationErrors, updateUserProfile) // Add validation here
  .delete(protect, deleteUserProfile);

// Admin routes - only accessible by admins
router.route('/')
  .get(protect, authorize('admin'), getUsers);

router.route('/:id')
  .get(protect, authorize('admin'), getUserById)
  .delete(protect, authorize('admin'), deleteUser);

module.exports = router;