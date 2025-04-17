const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const userSubscriptionController = require('../controllers/UserSubscriptionController');

// Middleware for protecting routes
const { protect } = authMiddleware;

// Middleware for checking roles
const requireAdminOrFinancialManager = roleMiddleware(['admin', 'financial_manager']);

// Route to get all active subscriptions (Admin/Financial Manager only)
router.get(
    '/', 
    protect, 
    requireAdminOrFinancialManager, 
    userSubscriptionController.getAllActiveSubscriptions
);

// Route to create a new subscription (Admin/Financial Manager only)
router.post(
    '/', 
    protect, 
    requireAdminOrFinancialManager, 
    userSubscriptionController.createUserSubscription
);

// Route to get subscriptions for a specific user (Admin/Financial Manager or the user themselves)
// TODO: Add logic in controller to check if req.user.id matches :userId for ownership check
router.get(
    '/user/:userId', 
    protect, 
    // roleMiddleware(['admin', 'financial_manager', 'Resident/Garbage_Buyer', 'staff']), // Allow users to see their own - needs controller logic
    userSubscriptionController.getUserSubscriptions
);

// Route to get a single subscription by ID (Admin/Financial Manager or the user themselves)
// TODO: Add logic in controller to check ownership
router.get(
    '/:id', 
    protect, 
    // roleMiddleware(['admin', 'financial_manager', 'Resident/Garbage_Buyer', 'staff']), // Allow users to see their own - needs controller logic
    userSubscriptionController.getUserSubscriptionById
);

// Route to update a subscription (Admin/Financial Manager only)
router.put(
    '/:id', 
    protect, 
    requireAdminOrFinancialManager, 
    userSubscriptionController.updateUserSubscription
);

// Route to cancel a subscription (Admin/Financial Manager only)
router.delete(
    '/:id', 
    protect, 
    requireAdminOrFinancialManager, 
    userSubscriptionController.cancelUserSubscription
);

module.exports = router;
