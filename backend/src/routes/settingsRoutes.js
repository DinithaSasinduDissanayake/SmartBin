const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/authMiddleware');
const { handleValidationErrors } = require('../middleware/validationErrorHandler');
const settingsController = require('../controllers/settingsController');

const router = express.Router();

// All settings routes require admin access
router.use(protect, authorize('admin'));

// Validation rules for updating settings
const updateSettingsValidation = [
    body('appName').optional().isString().trim().notEmpty().withMessage('App name cannot be empty'),
    body('defaultTimezone').optional().isString().trim().notEmpty().withMessage('Timezone cannot be empty'),
    body('defaultCurrency').optional().isString().isLength({ min: 3, max: 3 }).toUpperCase().withMessage('Currency must be a 3-letter code'),
    body('defaultNewUserRole').optional().isIn(['customer', 'staff']).withMessage('Invalid default role'),
    body('passwordMinLength').optional().isInt({ min: 6 }).withMessage('Minimum password length must be at least 6'),
    body('sessionTimeoutMinutes').optional().isInt({ min: 5 }).withMessage('Session timeout must be at least 5 minutes'),
    body('maintenanceMode').optional().isBoolean().withMessage('Maintenance mode must be true or false'),
];

router.route('/')
    .get(settingsController.getSettings)
    .put(updateSettingsValidation, handleValidationErrors, settingsController.updateSettings);

module.exports = router;