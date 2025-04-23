const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator'); // Import validator

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

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Use 400 for validation errors
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post('/register', registerValidation, handleValidationErrors, registerUser);
router.post('/login', loginValidation, handleValidationErrors, loginUser);
router.get('/me', protect, getMe);

module.exports = router;