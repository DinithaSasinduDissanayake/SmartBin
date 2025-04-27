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

// Routes for MFA setup and management
router.post('/generate', protect, generateMfaSecret);
router.post('/enable', protect, enableMfa);
router.post('/disable', protect, disableMfa);

// Routes for MFA verification during login (public, used in authentication)
router.post('/verify', verifyMfaToken);
router.post('/recover', verifyRecoveryCode);

module.exports = router;