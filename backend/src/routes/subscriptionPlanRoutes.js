const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const subscriptionPlanController = require('../controllers/SubscriptionPlanController');

// GET all subscription plans (public)
router.get('/', subscriptionPlanController.getSubscriptionPlans);

// POST create a new subscription plan (Financial Manager or Admin only)
router.post(
    '/',
    authMiddleware.protect,
    roleMiddleware(['financial_manager', 'admin']),
    subscriptionPlanController.createSubscriptionPlan
);

// GET a specific subscription plan by ID (public)
router.get('/:id', subscriptionPlanController.getSubscriptionPlanById);

// PUT update a subscription plan (Financial Manager or Admin only)
router.put(
    '/:id',
    authMiddleware.protect,
    roleMiddleware(['financial_manager', 'admin']),
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