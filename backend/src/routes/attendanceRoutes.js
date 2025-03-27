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

// All routes are protected
router.use(protect);

// Staff routes
router.post('/check-in', checkIn);
router.put('/check-out', checkOut);
router.get('/', getMyAttendance);

// Admin routes
router.get('/all', authorize('admin'), getAllAttendance);
router.put('/:id', authorize('admin'), updateAttendance);
router.get('/summary', authorize('admin'), getAttendanceSummary);

module.exports = router;