const express = require('express');
const router = express.Router();
const { 
  checkIn, 
  checkOut, 
  getMyAttendance, 
  getAllAttendance, 
  updateAttendance,
  getAttendanceSummary
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator'); // Import validator

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

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
  updateAttendanceValidation, // Add validation
  handleValidationErrors, // Handle errors
  updateAttendance
);
router.get('/summary', authorize('admin'), getAttendanceSummary);

module.exports = router;