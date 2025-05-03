const express = require('express');
const recyclingController = require('../controllers/recyclingController');
// const authMiddleware = require('../middleware/authMiddleware'); // Assuming you have auth middleware

const router = express.Router();

// Apply authentication middleware if needed for these routes
// router.use(authMiddleware.protect); // Example: Protect all routes below

router
  .route('/')
  .post(recyclingController.createRecyclingRequest) // POST /api/recycling-requests
  .get(recyclingController.getAllRecyclingRequests); // GET /api/recycling-requests

// Add routes for getting single request, updating, deleting etc.
// router.route('/:id')
//   .get(recyclingController.getRecyclingRequest)
//   .patch(recyclingController.updateRecyclingRequest)
//   .delete(recyclingController.deleteRecyclingRequest);

// Example Admin routes (could be in a separate adminRecyclingRoutes.js)
// router.route('/admin')
//   .get(authMiddleware.restrictTo('admin'), recyclingController.getAllAdminRecyclingRequests);
// router.route('/admin/:id')
//   .get(authMiddleware.restrictTo('admin'), recyclingController.getAdminRecyclingRequest)
//   .patch(authMiddleware.restrictTo('admin'), recyclingController.updateAdminRecyclingRequestStatus);


module.exports = router;
