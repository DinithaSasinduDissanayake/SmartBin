const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const subscriptionPlanController = require('../controllers/SubscriptionPlanController');
const { body, validationResult } = require('express-validator'); // Import validator

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation for creating/updating subscription plans
const planValidation = [
  body('name', 'Plan name is required').notEmpty().trim().escape(),
  body('description').optional().trim().escape(),
  body('price', 'Price must be a valid number').isFloat({ gt: 0 }),
  body('duration', 'Duration is required (e.g., 1 month, 3 months)').notEmpty().trim().escape(),
  body('features').optional().isArray().withMessage('Features must be an array of strings'),
  body('features.*').optional().isString().trim().escape(), // Validate each item in the array
];

// GET all subscription plans (public)
router.get('/', subscriptionPlanController.getSubscriptionPlans);

// POST create a new subscription plan (Financial Manager or Admin only)
router.post(
    '/',
    authMiddleware.protect,
    roleMiddleware(['financial_manager', 'admin']),
    planValidation, // Add validation
    handleValidationErrors, // Handle errors
    subscriptionPlanController.createSubscriptionPlan
);

// GET a specific subscription plan by ID (public)
router.get('/:id', subscriptionPlanController.getSubscriptionPlanById);

// PUT update a subscription plan (Financial Manager or Admin only)
router.put(
    '/:id',
    authMiddleware.protect,
    roleMiddleware(['financial_manager', 'admin']),
    planValidation, // Add validation
    handleValidationErrors, // Handle errors
    subscriptionPlanController.updateSubscriptionPlan
);

// DELETE a subscription plan (Financial Manager or Admin only)
router.delete(
    '/:id',
    authMiddleware.protect,
    roleMiddleware(['financial_manager', 'admin']),
    subscriptionPlanController.deleteSubscriptionPlan
);

module.exports = router;