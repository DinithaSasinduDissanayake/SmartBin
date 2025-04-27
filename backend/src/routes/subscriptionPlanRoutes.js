const express = require('express');
const router = express.Router();
// Use authorize directly from authMiddleware
const { protect, authorize } = require('../middleware/authMiddleware'); 
const subscriptionPlanController = require('../controllers/SubscriptionPlanController');
const { body } = require('express-validator'); // Import only body
// Import shared validation error handler
const { handleValidationErrors } = require('../middleware/validationErrorHandler'); 

// Validation for creating/updating subscription plans
const planValidation = [
  body('name', 'Plan name is required').notEmpty().trim().escape(),
  body('description').optional().trim().escape(),
  // Ensure price validation matches the refined model (Number, min: 0)
  body('price', 'Price must be a non-negative number').isFloat({ min: 0 }), 
  body('duration', 'Duration is required (e.g., 1 month, 3 months)').notEmpty().trim().escape(),
  body('features').optional().isArray().withMessage('Features must be an array of strings'),
  body('features.*').optional().isString().trim().escape(), // Validate each item in the array
];

// GET all subscription plans (public)
router.get('/', subscriptionPlanController.getSubscriptionPlans);

// POST create a new subscription plan (Financial Manager or Admin only)
router.post(
    '/',
    protect, // Use protect directly
    authorize('financial_manager', 'admin'), // Use authorize from authMiddleware
    planValidation, 
    handleValidationErrors, // Use shared handler
    subscriptionPlanController.createSubscriptionPlan
);

// GET a specific subscription plan by ID (public)
router.get('/:id', subscriptionPlanController.getSubscriptionPlanById);

// PUT update a subscription plan (Financial Manager or Admin only)
router.put(
    '/:id',
    protect,
    authorize('financial_manager', 'admin'),
    planValidation, 
    handleValidationErrors, // Use shared handler
    subscriptionPlanController.updateSubscriptionPlan
);

// DELETE a subscription plan (Financial Manager or Admin only)
router.delete(
    '/:id',
    protect,
    authorize('financial_manager', 'admin'),
    subscriptionPlanController.deleteSubscriptionPlan
);

module.exports = router;