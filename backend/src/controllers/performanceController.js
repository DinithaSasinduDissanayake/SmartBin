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

/**
 * @desc    Export performance report as PDF
 * @route   GET /api/performance/reports/export
 * @access  Private/Admin
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.exportPerformanceReport = async (req, res, next) => {
  try {
    const { period = 'year', startDate: startDateParam, endDate: endDateParam } = req.query;
    const PDFDocument = require('pdfkit');
    
    // Determine date range
    let startDate, endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    if (startDateParam && endDateParam) {
      startDate = new Date(startDateParam);
      endDate = new Date(endDateParam);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Use the period parameter if specific dates not provided
      switch (period) {
        case 'quarter':
          startDate = new Date(endDate);
          startDate.setMonth(endDate.getMonth() - 3);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'month':
          startDate = new Date(endDate);
          startDate.setMonth(endDate.getMonth() - 1);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'year':
        default:
          startDate = new Date(endDate.getFullYear(), 0, 1);
          startDate.setHours(0, 0, 0, 0);
          break;
      }
    }
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestError('Invalid date format');
    }
    
    // Fetch overall performance statistics
    const overallStats = await Performance.aggregate([
      { $match: { reviewDate: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          minRating: { $min: '$rating' },
          maxRating: { $max: '$rating' }
        }
      }
    ]);
    
    // Fetch staff performance summaries
    const staffPerformance = await Performance.aggregate([
      { $match: { reviewDate: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: '$staff',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
          minRating: { $min: '$rating' },
          maxRating: { $max: '$rating' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'staffDetails'
        }
      },
      { $unwind: '$staffDetails' },
      {
        $project: {
          staffId: '$_id',
          staffName: '$staffDetails.name',
          staffEmail: '$staffDetails.email',
          averageRating: { $round: ['$averageRating', 2] },
          reviewCount: 1,
          minRating: 1,
          maxRating: 1
        }
      },
      { $sort: { averageRating: -1 } }
    ]);
    
    // Fetch rating distribution
    const ratingDistribution = await Performance.aggregate([
      { $match: { reviewDate: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: { $floor: '$rating' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          rating: '$_id',
          count: 1,
          _id: 0
        }
      },
      { $sort: { rating: 1 } }
    ]);
    
    // Get recent reviews
    const recentReviews = await Performance.find({ reviewDate: { $gte: startDate, $lte: endDate } })
      .populate('staff', 'name email')
      .populate('reviewer', 'name email')
      .sort({ reviewDate: -1 })
      .limit(10)
      .select('staff reviewer reviewDate rating comments');
    
    // Create a PDF document
    const doc = new PDFDocument({
      margin: 50,
      size: 'A4'
    });
    
    // Set response headers for PDF download
    const periodText = period === 'year' ? 'Annual' : 
                      period === 'quarter' ? 'Quarterly' : 
                      period === 'month' ? 'Monthly' : 'Custom';
                      
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=performance-report-${periodText.toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`);
    
    // Pipe the PDF to the response
    doc.pipe(res);
    
    // Format dates for display
    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };
    
    // PDF Generation - Header
    doc.font('Helvetica-Bold').fontSize(18).text('SmartBin Staff Performance Report', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(12).text(`Report Period: ${formatDate(startDate)} to ${formatDate(endDate)}`, { align: 'center' });
    doc.moveDown();
    doc.text(`Generated on: ${formatDate(new Date())}`, { align: 'center' });
    doc.moveDown();
    doc.text(`Generated by: ${req.user.name}`, { align: 'center' });
    doc.moveDown(2);
    
    // Executive Summary Section
    doc.font('Helvetica-Bold').fontSize(14).text('Executive Summary', { underline: true });
    doc.moveDown(0.5);
    
    if (overallStats.length > 0) {
      doc.font('Helvetica').fontSize(11);
      doc.text(`This performance report covers ${overallStats[0].totalReviews} reviews conducted between ${formatDate(startDate)} and ${formatDate(endDate)}.`);
      doc.moveDown(0.5);
      doc.text(`The overall average performance rating for all staff is ${overallStats[0].averageRating.toFixed(2)} out of 5.0.`);
      doc.moveDown(0.5);
      
      // Calculate high performers vs low performers
      const highPerformers = staffPerformance.filter(staff => staff.averageRating >= 4.0).length;
      const lowPerformers = staffPerformance.filter(staff => staff.averageRating < 3.0).length;
      
      doc.text(`Number of high performers (rating ≥ 4.0): ${highPerformers}`);
      doc.text(`Number of low performers (rating < 3.0): ${lowPerformers}`);
    } else {
      doc.font('Helvetica').fontSize(11);
      doc.text('No performance data available for the selected period.');
    }
    
    doc.moveDown(2);
    
    // Staff Performance Summary
    if (staffPerformance.length > 0) {
      doc.font('Helvetica-Bold').fontSize(14).text('Staff Performance Rankings', { underline: true });
      doc.moveDown(0.5);
      
      // Table header
      const tableTop = doc.y;
      doc.font('Helvetica-Bold').fontSize(10);
      
      // Define column widths
      const colWidths = {
        name: 150,
        avgRating: 70,
        reviews: 70,
        minRating: 70,
        maxRating: 70
      };
      
      // Header row
      doc.text('Staff Name', 50, tableTop);
      doc.text('Avg Rating', 50 + colWidths.name, tableTop);
      doc.text('Reviews', 50 + colWidths.name + colWidths.avgRating, tableTop);
      doc.text('Min Rating', 50 + colWidths.name + colWidths.avgRating + colWidths.reviews, tableTop);
      doc.text('Max Rating', 50 + colWidths.name + colWidths.avgRating + colWidths.reviews + colWidths.minRating, tableTop);
      
      // Draw line under header
      doc.moveTo(50, tableTop + 15)
         .lineTo(50 + colWidths.name + colWidths.avgRating + colWidths.reviews + colWidths.minRating + colWidths.maxRating, tableTop + 15)
         .stroke();
      
      // Data rows
      let rowY = tableTop + 25;
      doc.font('Helvetica').fontSize(10);
      
      // Function to add a page if we're running out of space
      const checkAndAddPage = (y) => {
        if (y > 700) {
          doc.addPage();
          
          // Add header to new page
          doc.font('Helvetica-Bold').fontSize(14).text('Staff Performance Rankings (Continued)', { underline: true });
          doc.moveDown(0.5);
          
          // Draw header row on new page
          const newTableTop = doc.y;
          doc.font('Helvetica-Bold').fontSize(10);
          
          doc.text('Staff Name', 50, newTableTop);
          doc.text('Avg Rating', 50 + colWidths.name, newTableTop);
          doc.text('Reviews', 50 + colWidths.name + colWidths.avgRating, newTableTop);
          doc.text('Min Rating', 50 + colWidths.name + colWidths.avgRating + colWidths.reviews, newTableTop);
          doc.text('Max Rating', 50 + colWidths.name + colWidths.avgRating + colWidths.reviews + colWidths.minRating, newTableTop);
          
          // Draw line under header
          doc.moveTo(50, newTableTop + 15)
             .lineTo(50 + colWidths.name + colWidths.avgRating + colWidths.reviews + colWidths.minRating + colWidths.maxRating, newTableTop + 15)
             .stroke();
          
          doc.font('Helvetica').fontSize(10);
          return newTableTop + 25;
        }
        return y;
      };
      
      // Draw each staff row
      staffPerformance.forEach((staff, i) => {
        rowY = checkAndAddPage(rowY);
        
        doc.text(staff.staffName, 50, rowY);
        doc.text(staff.averageRating.toFixed(2), 50 + colWidths.name, rowY);
        doc.text(staff.reviewCount.toString(), 50 + colWidths.name + colWidths.avgRating, rowY);
        doc.text(staff.minRating.toFixed(1), 50 + colWidths.name + colWidths.avgRating + colWidths.reviews, rowY);
        doc.text(staff.maxRating.toFixed(1), 50 + colWidths.name + colWidths.avgRating + colWidths.reviews + colWidths.minRating, rowY);
        
        rowY += 20;
      });
      
      // Draw bottom border
      doc.moveTo(50, rowY - 10)
         .lineTo(50 + colWidths.name + colWidths.avgRating + colWidths.reviews + colWidths.minRating + colWidths.maxRating, rowY - 10)
         .stroke();
      
      doc.moveDown(2);
    }
    
    // Rating Distribution
    if (ratingDistribution.length > 0) {
      // Check if we need a new page
      if (doc.y > 600) {
        doc.addPage();
      }
      
      doc.font('Helvetica-Bold').fontSize(14).text('Rating Distribution', { underline: true });
      doc.moveDown(0.5);
      
      // Prepare textual representation of distribution
      doc.font('Helvetica').fontSize(11);
      
      const totalReviews = ratingDistribution.reduce((sum, item) => sum + item.count, 0);
      
      ratingDistribution.forEach(item => {
        const percentage = (item.count / totalReviews * 100).toFixed(1);
        const barLength = Math.round(percentage / 2);
        doc.text(`${item.rating} star: ${item.count} reviews (${percentage}%) ${'█'.repeat(barLength)}`);
      });
      
      doc.moveDown(2);
    }
    
    // Recent Reviews Section
    if (recentReviews.length > 0) {
      // Check if we need a new page
      if (doc.y > 500) {
        doc.addPage();
      }
      
      doc.font('Helvetica-Bold').fontSize(14).text('Recent Performance Reviews', { underline: true });
      doc.moveDown(0.5);
      
      recentReviews.forEach((review, index) => {
        // Check if we need a new page for this review
        if (doc.y > 700) {
          doc.addPage();
        }
        
        doc.font('Helvetica-Bold').fontSize(11);
        doc.text(`${index + 1}. ${review.staff.name} - Rated ${review.rating}/5`);
        
        doc.font('Helvetica').fontSize(10);
        doc.text(`Reviewed by: ${review.reviewer.name}`, { indent: 20 });
        doc.text(`Date: ${formatDate(review.reviewDate)}`, { indent: 20 });
        
        if (review.comments) {
          doc.font('Helvetica-Oblique').fontSize(10);
          doc.text(`"${review.comments}"`, { indent: 20 });
        }
        
        doc.moveDown(1);
      });
    }
    
    // PDF notes
    // Check if we need a new page
    if (doc.y > 680) {
      doc.addPage();
    }
    
    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(12).text('Notes:', 50, doc.y);
    doc.moveDown(0.5);
    
    doc.font('Helvetica').fontSize(10);
    doc.text('- This report provides a summary of staff performance for the specified period.');
    doc.text('- Ratings are on a scale of 1.0 to 5.0, where 5.0 is the highest possible rating.');
    doc.text('- Performance reviews are conducted by managers and peer reviewers.');
    doc.text(`- Report generated by ${req.user.name} on ${new Date().toLocaleDateString()}.`);
    
    // Footer with page numbers
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).text(
        `Page ${i + 1} of ${pageCount}`,
        50,
        doc.page.height - 50,
        { align: 'center' }
      );
    }
    
    // Finalize the PDF
    doc.end();
    
  } catch (error) {
    console.error('Error generating performance report:', error);
    next(error);
  }
};

/**
 * @desc    Get detailed performance metrics
 * @route   GET /api/performance/reports/detailed
 * @access  Private/Admin
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.getDetailedPerformanceReport = async (req, res, next) => {
  try {
    const { startDate, endDate, staffId } = req.query;
    
    if (!startDate || !endDate) {
      throw new BadRequestError('Start and end dates are required');
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestError('Invalid date format');
    }
    
    // Build query based on parameters
    const query = { reviewDate: { $gte: start, $lte: end } };
    
    // If staffId is provided, filter by that staff member
    if (staffId) {
      if (!mongoose.Types.ObjectId.isValid(staffId)) {
        throw new BadRequestError('Invalid staffId format');
      }
      query.staff = mongoose.Types.ObjectId(staffId);
    }
    
    // Get all performance reviews in the period
    const performanceReviews = await Performance.find(query)
      .populate('staff', 'name email')
      .populate('reviewer', 'name email')
      .sort({ reviewDate: -1 });
    
    // Group reviews by staff member
    const reviewsByStaff = {};
    performanceReviews.forEach(review => {
      const staffId = review.staff._id.toString();
      if (!reviewsByStaff[staffId]) {
        reviewsByStaff[staffId] = {
          staffInfo: {
            id: review.staff._id,
            name: review.staff.name,
            email: review.staff.email
          },
          reviews: [],
          summary: {
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
          }
        };
      }
      
      // Add review to staff's reviews
      reviewsByStaff[staffId].reviews.push({
        id: review._id,
        reviewDate: review.reviewDate,
        reviewer: {
          id: review.reviewer._id,
          name: review.reviewer.name,
          email: review.reviewer.email
        },
        rating: review.rating,
        comments: review.comments,
        goals: review.goals
      });
      
      // Update summary
      reviewsByStaff[staffId].summary.totalReviews++;
      
      // Update rating distribution
      const ratingKey = Math.floor(review.rating);
      reviewsByStaff[staffId].summary.ratingDistribution[ratingKey] = 
        (reviewsByStaff[staffId].summary.ratingDistribution[ratingKey] || 0) + 1;
    });
    
    // Calculate average ratings
    Object.values(reviewsByStaff).forEach(staff => {
      const totalRating = staff.reviews.reduce((sum, review) => sum + review.rating, 0);
      staff.summary.averageRating = parseFloat((totalRating / staff.summary.totalReviews).toFixed(2));
      
      // Sort reviews by date, newest first
      staff.reviews.sort((a, b) => new Date(b.reviewDate) - new Date(a.reviewDate));
    });
    
    // Convert to array and sort by average rating (descending)
    const reportData = Object.values(reviewsByStaff).sort((a, b) => b.summary.averageRating - a.summary.averageRating);
    
    // Return the report data
    res.json({
      periodInfo: {
        startDate: start,
        endDate: end,
        totalReviews: performanceReviews.length
      },
      staffReports: reportData
    });
    
  } catch (error) {
    console.error('Error generating detailed performance report:', error);
    next(error);
  }
};