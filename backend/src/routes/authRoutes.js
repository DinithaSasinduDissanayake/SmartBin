const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { body } = require('express-validator'); // Import only body
const { handleValidationErrors } = require('../middleware/validationErrorHandler'); // Import the new handler

// Validation middleware for registration
const registerValidation = [
  body('name', 'Name is required').notEmpty().trim().escape(), // Added trim() and escape()
  body('email', 'Please include a valid email').isEmail().normalizeEmail(),
  body('password', 'Password must be at least 8 characters long').isLength({ min: 8 }),
  // Add validation for other fields if needed (e.g., role, phone)
  body('role').optional().isIn(['customer', 'staff', 'admin', 'financial_manager']).withMessage('Invalid role specified'), // Assuming 'customer' is the new standard role
  body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number format'),
];

// Validation middleware for login
const loginValidation = [
  body('email', 'Please include a valid email').isEmail().normalizeEmail(),
  body('password', 'Password is required').exists(),
];

router.post('/register', registerValidation, handleValidationErrors, registerUser); // Use imported handler
router.post('/login', loginValidation, handleValidationErrors, loginUser); // Use imported handler
router.get('/me', protect, getMe);

module.exports = router;