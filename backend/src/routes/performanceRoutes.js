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
const { body, validationResult } = require('express-validator'); // Import validator

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation for creating/updating performance reviews
const performanceValidation = [
  body('staff', 'Staff ID is required').isMongoId(),
  body('reviewDate').optional().isISO8601().toDate().withMessage('Invalid review date format'),
  body('reviewer', 'Reviewer ID is required').isMongoId(), // Assuming reviewer is a User ID
  body('rating', 'Rating must be a number between 1 and 5').isFloat({ min: 1, max: 5 }),
  body('comments').optional().trim().escape(),
  body('goals').optional().isArray().withMessage('Goals must be an array of strings'),
  body('goals.*').optional().isString().trim().escape(),
];

// All routes are protected
router.use(protect);

// Staff routes
router.get('/my-reviews', getMyPerformanceReviews);

// Admin routes
router.route('/')
  .post(
    authorize('admin'), 
    performanceValidation, // Add validation
    handleValidationErrors, // Handle errors
    createPerformanceReview
  )
  .get(authorize('admin'), getPerformanceReviews);

router.get('/summary', authorize('admin'), getPerformanceSummary);

router.route('/:id')
  .get(getPerformanceReviewById) // Access controlled in controller
  .put(
    authorize('admin'), 
    performanceValidation, // Add validation (can reuse or create specific update validation)
    handleValidationErrors, // Handle errors
    updatePerformanceReview
  )
  .delete(authorize('admin'), deletePerformanceReview);

module.exports = router;