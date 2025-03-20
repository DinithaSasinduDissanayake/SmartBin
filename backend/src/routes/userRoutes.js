// backend/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getUsers, 
  getUserById, 
  updateUserProfile, 
  deleteUser 
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// User profile routes
router.route('/profile')
  .put(protect, updateUserProfile);

// Admin routes
router.route('/')
  .get(protect, authorize('admin'), getUsers);

router.route('/:id')
  .get(protect, authorize('admin'), getUserById)
  .delete(protect, authorize('admin'), deleteUser);

module.exports = router;