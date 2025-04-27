const express = require('express');
const {
    submitComplaint,
    getMyComplaints,
    getAllComplaints,
    getComplaintById,
    updateComplaintStatus,
    assignComplaint,
    addResolutionNotes
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validationErrorHandler');

const router = express.Router();

// All complaint routes require login
router.use(protect);

// Submit a complaint (Customer, Staff)
router.post('/', [
    body('subject').notEmpty().withMessage('Subject is required').trim().escape(),
    body('description').notEmpty().withMessage('Description is required').trim().escape(),
    body('relatedRequestId').optional().isMongoId().withMessage('Invalid related Request ID format')
], handleValidationErrors, submitComplaint);

// Get user's own complaints
router.get('/my-complaints', getMyComplaints);

// Get specific complaint (Owner or Admin)
router.get('/:id', getComplaintById);

// --- Admin Only Routes ---
router.get('/', authorize('admin'), getAllComplaints); // Get all complaints
router.patch('/:id/status', authorize('admin'), [
    body('status').isIn(['Open', 'In Progress', 'Resolved', 'Closed']).withMessage('Invalid status value')
], handleValidationErrors, updateComplaintStatus);
router.patch('/:id/assign', authorize('admin'), [
    body('adminId').isMongoId().withMessage('Valid Admin ID is required')
], handleValidationErrors, assignComplaint);
router.patch('/:id/resolve', authorize('admin'), [
    body('resolutionNotes').notEmpty().withMessage('Resolution notes are required').trim().escape()
], handleValidationErrors, addResolutionNotes);

module.exports = router;