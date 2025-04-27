const express = require('express');
const {
    generatePayrollForPeriod,
    getPayrollHistoryForStaff,
    getPayrollLogById,
    markPayrollAsPaid
} = require('../controllers/payrollController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validationErrorHandler');

const router = express.Router();

// All payroll routes require login
router.use(protect);

// Generate payroll (Admin, Financial Manager)
router.post('/generate', authorize('admin', 'financial_manager'), [
    body('periodStart').isISO8601().withMessage('Invalid periodStart date format'),
    body('periodEnd').isISO8601().withMessage('Invalid periodEnd date format')
], handleValidationErrors, generatePayrollForPeriod);

// Get payroll history for a specific staff member (Admin, FM, or the staff member themselves)
router.get('/staff/:staffId', getPayrollHistoryForStaff); // Permission check done in controller

// Get specific payroll log (Admin, FM, or the staff member themselves)
router.get('/:logId', getPayrollLogById); // Permission check done in controller

// Mark payroll as paid (Admin, Financial Manager)
router.patch('/:logId/mark-paid', authorize('admin', 'financial_manager'), [
    body('paymentDate').optional().isISO8601().withMessage('Invalid paymentDate format'),
    body('transactionRef').optional().isString().trim().escape()
], handleValidationErrors, markPayrollAsPaid);

module.exports = router;