const express = require('express');
const financialController = require('../controllers/financialController');
// Import protect and authorize from authMiddleware
const { protect, authorize } = require('../middleware/authMiddleware'); 
// Remove roleMiddleware import

const router = express.Router();

// GET /api/financials/dashboard - Protected for Financial Manager and Admin
router.get(
    '/dashboard',
    protect, // Use protect directly
    authorize('financial_manager', 'admin'), // Use authorize directly
    financialController.getDashboardData
);

// Add other financial routes here (e.g., expenses, invoices)


module.exports = router;
