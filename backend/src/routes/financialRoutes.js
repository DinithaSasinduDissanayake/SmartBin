const express = require('express');
const financialController = require('../controllers/financialController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// GET /api/financials/dashboard - Protected for Financial Manager and Admin
router.get(
    '/dashboard',
    authMiddleware.protect, // Use the protect method, not the entire middleware object
    roleMiddleware(['financial_manager', 'admin']), // Ensure user has the correct role
    financialController.getDashboardData
);

// Add other financial routes here (e.g., expenses, invoices)


module.exports = router;
