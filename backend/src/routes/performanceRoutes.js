const express = require('express');
const router = express.Router();
const { 
  createPerformanceReview, 
  getPerformanceReviews, 
  getPerformanceReviewById, 
  updatePerformanceReview, 
  deletePerformanceReview,
  getMyPerformanceReviews,
  getPerformanceSummary
} = require('../controllers/performanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Staff routes
router.get('/my-reviews', getMyPerformanceReviews);

// Admin routes
router.route('/')
  .post(authorize('admin'), createPerformanceReview)
  .get(authorize('admin'), getPerformanceReviews);

router.get('/summary', authorize('admin'), getPerformanceSummary);

router.route('/:id')
  .get(getPerformanceReviewById) // Access controlled in controller
  .put(authorize('admin'), updatePerformanceReview)
  .delete(authorize('admin'), deletePerformanceReview);

module.exports = router;