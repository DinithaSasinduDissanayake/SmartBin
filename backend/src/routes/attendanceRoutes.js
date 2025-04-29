const express = require('express');
const router = express.Router();
const { 
  checkIn, 
  checkOut, 
  getMyAttendance, 
  getAllAttendance, 
  updateAttendance,
  getAttendanceSummary,
  exportAttendanceReport,
  getDetailedAttendanceReport
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { body } = require('express-validator'); // Import body
const { handleValidationErrors } = require('../middleware/validationErrorHandler'); // Import shared handler

// Validation for updating attendance
const updateAttendanceValidation = [
  body('checkInTime').optional().isISO8601().toDate().withMessage('Invalid check-in time format'),
  body('checkOutTime').optional().isISO8601().toDate().withMessage('Invalid check-out time format'),
  body('status').optional().isIn(['Present', 'Absent', 'Late', 'On Leave']).withMessage('Invalid status'),
  body('notes').optional().trim().escape(),
];

// All routes are protected
router.use(protect);

// Staff routes
router.post('/check-in', checkIn);
router.put('/check-out', checkOut);
router.get('/', getMyAttendance);

// Admin routes
router.get('/all', authorize('admin'), getAllAttendance);
router.put('/:id', 
  authorize('admin'), 
  updateAttendanceValidation, 
  handleValidationErrors, // Use shared handler
  updateAttendance
);
router.get('/summary', authorize('admin'), getAttendanceSummary);

// Report routes - only for admin
router.get('/reports/export', authorize('admin'), exportAttendanceReport);
router.get('/reports/detailed', authorize('admin'), getDetailedAttendanceReport);

module.exports = router;