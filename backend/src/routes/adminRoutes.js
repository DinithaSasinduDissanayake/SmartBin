const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes below with authentication and admin role check
router.use(authMiddleware.protect);
router.use(authMiddleware.authorize('admin'));

// Add other admin-specific routes here (e.g., user management, settings)

module.exports = router;
