const Performance = require('../models/Performance');
const User = require('../models/User');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');
const BadRequestError = require('../errors/BadRequestError');
const ApiError = require('../errors/ApiError');
const mongoose = require('mongoose');

/**
 * @desc    Create a new performance review
 * @route   POST /api/performance
 * @access  Private/Admin
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.createPerformanceReview = async (req, res, next) => {
  // Validation handled by express-validator
  const { staff, reviewDate, reviewer, rating, comments, goals } = req.body;

  try {
    // Validate staff exists
    const staffUser = await User.findById(staff);
    if (!staffUser || !['staff', 'admin'].includes(staffUser.role)) { // Ensure it's a staff member or admin being reviewed
      throw new NotFoundError(`Staff user not found with ID: ${staff}`);
    }

    // Validate reviewer exists (assuming reviewer is also a user, likely admin/manager)
    const reviewerUser = await User.findById(reviewer);
    if (!reviewerUser) {
      throw new NotFoundError(`Reviewer user not found with ID: ${reviewer}`);
    }
    // Optional: Check if reviewer has permission to review
    if (!['admin', 'financial_manager'].includes(reviewerUser.role)) {
        // Or check if reviewer is the direct manager of the staff member
        // throw new ForbiddenError('Reviewer does not have permission to create reviews');
    }

    const performance = await Performance.create({
      staff,
      reviewDate: reviewDate ? new Date(reviewDate) : new Date(),
      reviewer,
      rating,
      comments,
      goals
    });

    res.status(201).json(performance);
  } catch (error) {
    console.error('Error creating performance review:', error);
    // Mongoose validation errors handled globally
    next(error); // Pass NotFoundError or others
  }
};

/**
 * @desc    Get all performance reviews (for admin)
 * @route   GET /api/performance
 * @access  Private/Admin
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.getPerformanceReviews = async (req, res, next) => {
  try {
    const { staffId, reviewerId, page = 1, limit = 10, sortBy = 'reviewDate', order = 'desc' } = req.query;
    const query = {};

    if (staffId) {
        if (!mongoose.Types.ObjectId.isValid(staffId)) throw new BadRequestError('Invalid staffId format');
        query.staff = staffId;
    }
    if (reviewerId) {
        if (!mongoose.Types.ObjectId.isValid(reviewerId)) throw new BadRequestError('Invalid reviewerId format');
        query.reviewer = reviewerId;
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: sortOptions,
        populate: [
            { path: 'staff', select: 'name email' },
            { path: 'reviewer', select: 'name email' }
        ]
    };

    // Use paginate if available, otherwise use find, skip, limit
    const reviews = await Performance.paginate ? await Performance.paginate(query, options) : await Performance.find(query)
        .populate('staff', 'name email')
        .populate('reviewer', 'name email')
        .sort(sortOptions)
        .skip((options.page - 1) * options.limit)
        .limit(options.limit);

    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching performance reviews:', error);
    next(error); // Pass potential BadRequestError or others
  }
};

/**
 * @desc    Get performance reviews for the logged-in staff member
 * @route   GET /api/performance/my-reviews
 * @access  Private/Staff/Admin
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.getMyPerformanceReviews = async (req, res, next) => {
    try {
        const reviews = await Performance.find({ staff: req.user.id })
            .populate('reviewer', 'name email') // Populate reviewer details
            .sort({ reviewDate: -1 });

        res.status(200).json(reviews);
    } catch (error) {
        console.error('Error fetching own performance reviews:', error);
        next(new ApiError(500, 'Failed to retrieve performance reviews'));
    }
};

/**
 * @desc    Get a single performance review by ID
 * @route   GET /api/performance/:id
 * @access  Private (Owner, Reviewer, or Admin)
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.getPerformanceReviewById = async (req, res, next) => {
  try {
    const review = await Performance.findById(req.params.id)
      .populate('staff', 'name email')
      .populate('reviewer', 'name email');

    if (!review) {
      throw new NotFoundError('Performance review not found');
    }

    // Check permissions: User must be the staff member, the reviewer, or an admin
    const isOwner = review.staff._id.toString() === req.user.id;
    const isReviewer = review.reviewer._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isReviewer && !isAdmin) {
      throw new ForbiddenError('Not authorized to access this performance review');
    }

    res.status(200).json(review);
  } catch (error) {
    console.error('Error fetching performance review by ID:', error);
    next(error); // Pass NotFoundError, ForbiddenError, or others
  }
};

/**
 * @desc    Update a performance review
 * @route   PUT /api/performance/:id
 * @access  Private/Admin
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.updatePerformanceReview = async (req, res, next) => {
  // Validation handled by express-validator
  const { staff, reviewDate, reviewer, rating, comments, goals } = req.body;

  try {
    const review = await Performance.findById(req.params.id);

    if (!review) {
      throw new NotFoundError('Performance review not found');
    }

    // Validate staff exists if changed
    if (staff && staff !== review.staff.toString()) {
        const staffUser = await User.findById(staff);
        if (!staffUser || !['staff', 'admin'].includes(staffUser.role)) {
            throw new NotFoundError(`Staff user not found with ID: ${staff}`);
        }
        review.staff = staff;
    }

    // Validate reviewer exists if changed
    if (reviewer && reviewer !== review.reviewer.toString()) {
        const reviewerUser = await User.findById(reviewer);
        if (!reviewerUser) {
            throw new NotFoundError(`Reviewer user not found with ID: ${reviewer}`);
        }
        // Optional: Check reviewer permissions
        review.reviewer = reviewer;
    }

    // Update fields
    review.reviewDate = reviewDate ? new Date(reviewDate) : review.reviewDate;
    review.rating = rating !== undefined ? rating : review.rating;
    review.comments = comments !== undefined ? comments : review.comments;
    review.goals = goals !== undefined ? goals : review.goals;

    const updatedReview = await review.save(); // Trigger validation

    res.status(200).json(updatedReview);
  } catch (error) {
    console.error('Error updating performance review:', error);
    // Mongoose validation errors handled globally
    next(error); // Pass NotFoundError or others
  }
};

/**
 * @desc    Delete a performance review
 * @route   DELETE /api/performance/:id
 * @access  Private/Admin
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.deletePerformanceReview = async (req, res, next) => {
  try {
    const review = await Performance.findById(req.params.id);

    if (!review) {
      throw new NotFoundError('Performance review not found');
    }

    await review.deleteOne();

    res.status(200).json({ message: 'Performance review deleted successfully' });
  } catch (error) {
    console.error('Error deleting performance review:', error);
    next(error); // Pass NotFoundError or others
  }
};

/**
 * @desc    Get performance summary (e.g., average ratings)
 * @route   GET /api/performance/summary
 * @access  Private/Admin
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.getPerformanceSummary = async (req, res, next) => {
    try {
        const { period = 'year' } = req.query; // e.g., 'year', 'quarter'
        let startDate;
        const endDate = new Date();
        endDate.setHours(23, 59, 59, 999);

        switch (period) {
            // Add cases for 'quarter', 'month' if needed
            case 'year':
            default:
                startDate = new Date(endDate.getFullYear(), 0, 1);
                startDate.setHours(0, 0, 0, 0);
                break;
        }

        const summary = await Performance.aggregate([
            { $match: { reviewDate: { $gte: startDate, $lte: endDate } } },
            {
                $group: {
                    _id: '$staff', // Group by staff member
                    averageRating: { $avg: '$rating' },
                    reviewCount: { $sum: 1 }
                }
            },
            {
                $lookup: { // Join with users to get staff names
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'staffDetails'
                }
            },
            { $unwind: '$staffDetails' },
            {
                $project: {
                    _id: 0,
                    staffId: '$_id',
                    staffName: '$staffDetails.name',
                    staffEmail: '$staffDetails.email',
                    averageRating: { $round: ['$averageRating', 2] }, // Round average rating
                    reviewCount: 1
                }
            },
            { $sort: { averageRating: -1 } } // Sort by average rating descending
        ]);

        const overallAverage = await Performance.aggregate([
            { $match: { reviewDate: { $gte: startDate, $lte: endDate } } },
            {
                $group: {
                    _id: null,
                    overallAvg: { $avg: '$rating' },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            period: { start: startDate.toISOString(), end: endDate.toISOString(), label: period },
            overall: overallAverage.length > 0 ? {
                averageRating: Math.round(overallAverage[0].overallAvg * 100) / 100,
                totalReviews: overallAverage[0].totalReviews
            } : { averageRating: 0, totalReviews: 0 },
            byStaff: summary
        });

    } catch (error) {
        console.error('Error fetching performance summary:', error);
        next(new ApiError(500, 'Failed to generate performance summary'));
    }
};