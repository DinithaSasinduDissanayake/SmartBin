// backend/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getUsers, 
  getUserById, 
  updateUserProfile, 
  deleteUser,
  getUserProfile,
  deleteUserProfile
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// User profile routes - all users can access their own profile
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile)
  .delete(protect, deleteUserProfile);

// Admin routes - only accessible by admins
router.route('/')
  .get(protect, authorize('admin'), getUsers);

router.route('/:id')
  .get(protect, authorize('admin'), getUserById)
  .delete(protect, authorize('admin'), deleteUser);

module.exports = router;