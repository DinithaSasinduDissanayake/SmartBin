// backend/src/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const dashboardController = require('../controllers/dashboardController');

/**
 * @route GET /api/dashboard/financial-manager-main
 * @desc Get main dashboard data for financial manager
 * @access Private (financial_manager, admin)
 */
router.get(
  '/financial-manager-main',
  protect,
  authorize('financial_manager', 'admin'),
  dashboardController.getFinancialManagerMainDashboardData
);

module.exports = router;