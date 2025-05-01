// backend/src/routes/mfaRoutes.js
const express = require('express');
const router = express.Router();
const { 
  generateMfaSecret, 
  enableMfa, 
  verifyMfaToken, 
  verifyRecoveryCode, 
  disableMfa 
} = require('../controllers/mfaController');
const { protect } = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validationErrorHandler');

// Validation for enabling MFA
const enableMfaValidation = [
  body('secret').notEmpty().withMessage('Secret is required'),
  body('token').isNumeric().isLength({ min: 6, max: 6 }).withMessage('Token must be a 6-digit number')
];

// Validation for token verification
const tokenValidation = [
  body('userId').isMongoId().withMessage('Invalid user ID format'),
  body('token').isNumeric().isLength({ min: 6, max: 6 }).withMessage('Token must be a 6-digit number')
];

// Validation for recovery code verification
const recoveryValidation = [
  body('userId').isMongoId().withMessage('Invalid user ID format'),
  body('recoveryCode').isString().trim().notEmpty().withMessage('Recovery code is required')
];

// Routes for MFA setup and management
router.post('/generate', protect, generateMfaSecret);

router.post(
  '/enable', 
  protect, 
  enableMfaValidation, 
  handleValidationErrors, 
  enableMfa
);

router.post(
  '/disable', 
  protect, 
  handleValidationErrors, 
  disableMfa
);

// Routes for MFA verification during login (public, used in authentication)
router.post(
  '/verify', 
  tokenValidation, 
  handleValidationErrors, 
  verifyMfaToken
);

router.post(
  '/recover', 
  recoveryValidation, 
  handleValidationErrors, 
  verifyRecoveryCode
);

module.exports = router;