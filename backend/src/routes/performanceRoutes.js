const express = require('express');
const router = express.Router();
const { 
  createPerformanceReview, 
  getPerformanceReviews, 
  getMyPerformanceReviews,
  getPerformanceReviewById,
  updatePerformanceReview,
  deletePerformanceReview,
  getPerformanceSummary,
  exportPerformanceReport,
  getDetailedPerformanceReport
} = require('../controllers/performanceController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validationErrorHandler');

// Validation for creating/updating performance reviews
const performanceReviewValidation = [
  body('staffId').isMongoId().withMessage('Invalid staff ID format'),
  body('reviewPeriod').isString().trim().notEmpty().withMessage('Review period is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('reviewComments').isString().trim().notEmpty().withMessage('Review comments are required'),
  body('strengths').optional().isArray().withMessage('Strengths must be an array'),
  body('weaknesses').optional().isArray().withMessage('Weaknesses must be an array'),
  body('goals').optional().isArray().withMessage('Goals must be an array'),
  body('recommendedTraining').optional().isArray(),
];

// Validation for performance ID parameter
const performanceIdValidation = [
  param('id').isMongoId().withMessage('Invalid performance review ID format')
];

// Validation for report exports
const reportValidation = [
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  query('format').optional().isIn(['pdf', 'csv', 'excel']).withMessage('Invalid export format')
];

// Base route is /api/performance
router.use(protect); // All routes require authentication

// Staff routes
router.get('/reviews/me', getMyPerformanceReviews);
router.get('/summary/me', getMyPerformanceReviews);

// Admin routes
router.post(
  '/', 
  authorize('admin'), 
  performanceReviewValidation,
  handleValidationErrors,
  createPerformanceReview
);

router.get('/reviews', authorize('admin'), getPerformanceReviews);
router.get('/summary', authorize('admin'), getPerformanceSummary);

router.get(
  '/:id', 
  authorize('admin'), 
  performanceIdValidation,
  handleValidationErrors,
  getPerformanceReviewById
);

router.put(
  '/:id', 
  authorize('admin'), 
  performanceIdValidation,
  performanceReviewValidation,
  handleValidationErrors,
  updatePerformanceReview
);

router.delete(
  '/:id', 
  authorize('admin'), 
  performanceIdValidation,
  handleValidationErrors,
  deletePerformanceReview
);

// Report routes - only for admin
router.get(
  '/reports/export', 
  authorize('admin'), 
  reportValidation,
  handleValidationErrors,
  exportPerformanceReport
);

router.get(
  '/reports/detailed', 
  authorize('admin'),
  reportValidation,
  handleValidationErrors,
  getDetailedPerformanceReport
);

module.exports = router;