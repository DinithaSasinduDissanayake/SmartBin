const express = require('express');
const router = express.Router();
const { 
  getSubscriptionPlans, 
  getSubscriptionPlanById, 
  createSubscriptionPlan, 
  updateSubscriptionPlan, 
  deleteSubscriptionPlan 
} = require('../controllers/SubscriptionPlanController');
const { protect } = require('../middleware/authMiddleware');
const { isFinancialManager } = require('../middleware/roleMiddleware');

// Apply middleware to all routes
router.use(protect);
router.use(isFinancialManager);

// Routes
router.route('/')
  .get(getSubscriptionPlans)
  .post(createSubscriptionPlan);

router.route('/:id')
  .get(getSubscriptionPlanById)
  .put(updateSubscriptionPlan)
  .delete(deleteSubscriptionPlan);

module.exports = router;