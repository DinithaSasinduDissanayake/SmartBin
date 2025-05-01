const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get(
    '/',
    protect,
    authorize('admin', 'financial_manager'), // Allow both roles for now
    statisticsController.getStatisticsData
);

module.exports = router;
