const statisticsService = require('../services/statisticsService');
const catchAsync = require('../utils/catchAsync'); // Helper to catch errors

exports.getStatisticsData = catchAsync(async (req, res, next) => {
    const { startDate, endDate, range } = req.query; // Get filters from query

    // Pass filters to the service layer
    const data = await statisticsService.calculateStatistics({ startDate, endDate, range });

    res.status(200).json({
        status: 'success',
        data: data,
    });
});
