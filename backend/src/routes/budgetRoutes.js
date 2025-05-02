// backend/src/routes/budgetRoutes.js
const express = require('express');
const { body } = require('express-validator');
const budgetController = require('../controllers/budgetController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { handleValidationErrors } = require('../middleware/validationErrorHandler');

const router = express.Router();

// --- Budget Routes --- //

// POST /api/budgets - Create a new budget
router.post('/',
    protect,
    authorize('admin', 'financial_manager'),
    [
        body('category')
            .notEmpty().withMessage('Category is required')
            .isIn(['fuel', 'maintenance', 'salaries', 'utilities', 'equipment', 'office', 'rent', 'marketing', 'insurance', 'taxes', 'other'])
            .withMessage('Invalid budget category'),
        body('periodType')
            .notEmpty().withMessage('Period type is required')
            .isIn(['Monthly', 'Quarterly', 'Yearly'])
            .withMessage('Invalid period type'),
        body('periodStartDate')
            .isISO8601().withMessage('Invalid start date format')
            .toDate(),
        body('periodEndDate')
            .isISO8601().withMessage('Invalid end date format')
            .toDate()
            .custom((value, { req }) => {
                if (value < req.body.periodStartDate) {
                    throw new Error('End date cannot be before start date');
                }
                return true;
            }),
        body('allocatedAmount')
            .isFloat({ min: 0 }).withMessage('Allocated amount must be a non-negative number'),
        body('notes').optional().isString().trim()
    ],
    handleValidationErrors,
    budgetController.createBudget
);

// GET /api/budgets - Get all budgets (with filtering)
router.get('/',
    protect,
    authorize('admin', 'financial_manager'),
    budgetController.getBudgets
);

// GET /api/budgets/summary - Get budget summary (allocated vs. actual)
router.get('/summary',
    protect,
    authorize('admin', 'financial_manager'),
    budgetController.getBudgetSummary
);

// GET /api/budgets/:id - Get a specific budget by ID
router.get('/:id',
    protect,
    authorize('admin', 'financial_manager'),
    budgetController.getBudgetById
);

// PUT /api/budgets/:id - Update a budget
router.put('/:id',
    protect,
    authorize('admin', 'financial_manager'),
    [
        body('category')
            .notEmpty().withMessage('Category is required')
            .isIn(['fuel', 'maintenance', 'salaries', 'utilities', 'equipment', 'office', 'rent', 'marketing', 'insurance', 'taxes', 'other'])
            .withMessage('Invalid budget category'),
        body('periodType')
            .notEmpty().withMessage('Period type is required')
            .isIn(['Monthly', 'Quarterly', 'Yearly'])
            .withMessage('Invalid period type'),
        body('periodStartDate')
            .isISO8601().withMessage('Invalid start date format')
            .toDate(),
        body('periodEndDate')
            .isISO8601().withMessage('Invalid end date format')
            .toDate()
            .custom((value, { req }) => {
                if (value < req.body.periodStartDate) {
                    throw new Error('End date cannot be before start date');
                }
                return true;
            }),
        body('allocatedAmount')
            .isFloat({ min: 0 }).withMessage('Allocated amount must be a non-negative number'),
        body('notes').optional().isString().trim()
    ],
    handleValidationErrors,
    budgetController.updateBudget
);

// DELETE /api/budgets/:id - Delete a budget
router.delete('/:id',
    protect,
    authorize('admin', 'financial_manager'),
    budgetController.deleteBudget
);

module.exports = router;
