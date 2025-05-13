const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware'); 
const userSubscriptionController = require('../controllers/UserSubscriptionController');
const { body } = require('express-validator'); // Import only body
// Import shared validation error handler
const { handleValidationErrors } = require('../middleware/validationErrorHandler'); 

// Validation for creating a user subscription
const createUserSubscriptionValidation = [
  body('user', 'User ID is required').isMongoId(),
  body('plan', 'Subscription Plan ID is required').isMongoId(),
  body('startDate').optional().isISO8601().toDate().withMessage('Invalid start date format'),
  // Add validation for payment details if applicable
];

// Validation for updating a user subscription
const updateUserSubscriptionValidation = [
  body('plan').optional().isMongoId().withMessage('Invalid Subscription Plan ID'),
  body('startDate').optional().isISO8601().toDate().withMessage('Invalid start date format'),
  body('endDate').optional().isISO8601().toDate().withMessage('Invalid end date format'),
  body('status').optional().isIn(['active', 'cancelled', 'expired']).withMessage('Invalid status'),
];

// Route to get all active subscriptions (Admin/Financial Manager only)
router.get(
    '/', 
    protect, 
    authorize('admin', 'financial_manager'), // Use authorize directly
    userSubscriptionController.getAllActiveSubscriptions
);

// Route to create a new subscription (Admin/Financial Manager only)
router.post(
    '/', 
    protect, 
    authorize('admin', 'financial_manager'), // Use authorize directly
    createUserSubscriptionValidation, 
    handleValidationErrors, // Use shared handler
    userSubscriptionController.createUserSubscription
);

// Route to get subscriptions for a specific user (Admin/Financial Manager or the user themselves)
// Controller needs logic to check if req.user.id matches :userId or if user is admin/fm
router.get(
    '/user/:userId', 
    protect, 
    userSubscriptionController.getUserSubscriptions
);

// Route to get a single subscription by ID (Admin/Financial Manager or the user themselves)
// Controller needs logic to check ownership or role
router.get(
    '/:id', 
    protect, 
    userSubscriptionController.getUserSubscriptionById
);

// Route to update a subscription (Admin/Financial Manager only)
router.put(
    '/:id', 
    protect, 
    authorize('admin', 'financial_manager'), // Use authorize directly
    updateUserSubscriptionValidation, 
    handleValidationErrors, // Use shared handler
    userSubscriptionController.updateUserSubscription
);

// Route to cancel a subscription (Admin/Financial Manager only)
router.delete(
    '/:id', 
    protect, 
    authorize('admin', 'financial_manager'), // Use authorize directly
    userSubscriptionController.cancelUserSubscription
);

module.exports = router;
