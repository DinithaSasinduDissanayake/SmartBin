const express = require('express');
const financialController = require('../controllers/financialController');
// Import protect and authorize from authMiddleware
const { protect, authorize } = require('../middleware/authMiddleware'); 
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validationErrorHandler');

const router = express.Router();

// Dashboard and reporting routes
// ------------------------------

// GET /api/financials/dashboard - Protected for Financial Manager and Admin
router.get(
    '/dashboard',
    protect,
    authorize('financial_manager', 'admin'),
    financialController.getDashboardData
);

// Report routes
// ------------

// Export financial report as PDF
router.get(
    '/reports/export',
    protect,
    authorize('financial_manager', 'admin'),
    financialController.exportReport
);

// Get profit and loss report
router.get(
    '/reports/profit-loss',
    protect,
    authorize('financial_manager', 'admin'),
    financialController.getProfitLossReport
);

// Get revenue by customer report
router.get(
    '/reports/revenue-by-customer',
    protect,
    authorize('financial_manager', 'admin'),
    financialController.getRevenueByCustomerReport
);

// Get expense details report
router.get(
    '/reports/expense-details',
    protect,
    authorize('financial_manager', 'admin'),
    financialController.getExpenseDetailsReport
);

// Payment routes
// --------------

// GET all payments with filtering and pagination
router.get(
    '/payments',
    protect,
    authorize('financial_manager', 'admin'),
    financialController.getAllPayments
);

// GET single payment by ID
router.get(
    '/payments/:id',
    protect,
    authorize('financial_manager', 'admin'),
    financialController.getPaymentById
);

// Create manual payment
const createPaymentValidation = [
    body('userId').isMongoId().withMessage('Valid user ID is required'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('method').isIn(['cash', 'credit_card', 'bank_transfer', 'paypal', 'other']).withMessage('Invalid payment method'),
    body('status').optional().isIn(['pending', 'completed', 'failed']).withMessage('Invalid status'),
    body('userSubscriptionId').optional().isMongoId().withMessage('Valid subscription ID is required')
];

router.post(
    '/payments',
    protect,
    authorize('financial_manager', 'admin'),
    createPaymentValidation,
    handleValidationErrors,
    financialController.recordManualPayment
);

// Initiate payment via payment gateway (e.g. Stripe)
const initiatePaymentValidation = [
    body('userId').isMongoId().withMessage('Valid user ID is required'),
    body('planId').isMongoId().withMessage('Valid plan ID is required'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code')
];

router.post(
    '/payments/initiate',
    protect,
    initiatePaymentValidation,
    handleValidationErrors,
    financialController.initiatePayment
);

// Payment gateway webhook endpoint (public - secured by signature verification)
router.post(
    '/payments/webhook',
    express.raw({ type: 'application/json' }), // Raw body for signature verification
    financialController.handlePaymentWebhook
);

// Update payment status
router.patch(
    '/payments/:id/status',
    protect,
    authorize('financial_manager', 'admin'),
    body('status').isIn(['pending', 'completed', 'failed', 'refunded', 'requires_action']).withMessage('Invalid status'),
    handleValidationErrors,
    financialController.updatePaymentStatus
);

// Expense routes
// --------------

// GET all expenses with filtering and pagination
router.get(
    '/expenses',
    protect,
    authorize('financial_manager', 'admin'),
    financialController.getAllExpenses
);

// GET single expense by ID
router.get(
    '/expenses/:id',
    protect,
    authorize('financial_manager', 'admin'),
    financialController.getExpenseById
);

// Create expense
const createExpenseValidation = [
    body('description').notEmpty().withMessage('Description is required'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('category').notEmpty().withMessage('Category is required'),
    body('date').optional().isISO8601().withMessage('Invalid date format')
];

router.post(
    '/expenses',
    protect,
    authorize('financial_manager', 'admin'),
    createExpenseValidation,
    handleValidationErrors,
    financialController.recordExpense
);

// Update expense
router.put(
    '/expenses/:id',
    protect,
    authorize('financial_manager', 'admin'),
    createExpenseValidation,
    handleValidationErrors,
    financialController.updateExpense
);

// Delete expense
router.delete(
    '/expenses/:id',
    protect,
    authorize('financial_manager', 'admin'),
    financialController.deleteExpense
);

module.exports = router;
