const express = require('express');
const router = express.Router();
const { 
  recordPerformanceReview, 
  getPerformanceReviews, 
  getStaffPerformance,
  getPerformanceById,
  updatePerformanceReview,
  deletePerformanceReview,
  getPerformanceSummary,
  exportPerformanceReport,
  getDetailedPerformanceReport
} = require('../controllers/performanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Base route is /api/performance
router.use(protect); // All routes require authentication

// Staff routes
router.get('/reviews/me', getPerformanceReviews);
router.get('/summary/me', getStaffPerformance);

// Admin routes
router.post('/', authorize('admin'), recordPerformanceReview);
router.get('/reviews', authorize('admin'), getPerformanceReviews);
router.get('/summary', authorize('admin'), getPerformanceSummary);
router.get('/:id', authorize('admin'), getPerformanceById);
router.put('/:id', authorize('admin'), updatePerformanceReview);
router.delete('/:id', authorize('admin'), deletePerformanceReview);

// Report routes - only for admin
router.get('/reports/export', authorize('admin'), exportPerformanceReport);
router.get('/reports/detailed', authorize('admin'), getDetailedPerformanceReport);

module.exports = router;