const Performance = require('../models/Performance');
const User = require('../models/User');

// @desc    Create new performance review
// @route   POST /api/performance
// @access  Private/Admin
exports.createPerformanceReview = async (req, res) => {
  try {
    const { 
      staffId, 
      startDate, 
      endDate, 
      metrics, 
      feedback, 
      goals 
    } = req.body;
    
    // Check if staff exists
    const staff = await User.findById(staffId);
    
    if (!staff || staff.role !== 'staff') {
      return res.status(400).json({ message: 'Invalid staff member' });
    }
    
    // Create new performance review
    const review = new Performance({
      staff: staffId,
      reviewPeriod: {
        startDate,
        endDate
      },
      metrics,
      feedback,
      goals,
      reviewer: req.user.id
    });
    
    await review.save();
    
    res.status(201).json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all performance reviews
// @route   GET /api/performance
// @access  Private/Admin
exports.getPerformanceReviews = async (req, res) => {
  try {
    const { staffId } = req.query;
    
    let query = {};
    
    if (staffId) {
      query.staff = staffId;
    }
    
    const reviews = await Performance.find(query)
      .populate('staff', 'name email')
      .populate('reviewer', 'name')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get performance review by ID
// @route   GET /api/performance/:id
// @access  Private
exports.getPerformanceReviewById = async (req, res) => {
  try {
    const review = await Performance.findById(req.params.id)
      .populate('staff', 'name email')
      .populate('reviewer', 'name');
    
    if (!review) {
      return res.status(404).json({ message: 'Performance review not found' });
    }
    
    // Allow access if user is the reviewer, the staff being reviewed, or admin
    if (
      req.user.role !== 'admin' && 
      review.reviewer.toString() !== req.user.id && 
      review.staff._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Not authorized to access this review' });
    }
    
    res.json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update performance review
// @route   PUT /api/performance/:id
// @access  Private/Admin
exports.updatePerformanceReview = async (req, res) => {
  try {
    const { 
      metrics, 
      feedback, 
      goals 
    } = req.body;
    
    const review = await Performance.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Performance review not found' });
    }
    
    // Update fields
    if (metrics) review.metrics = metrics;
    if (feedback !== undefined) review.feedback = feedback;
    if (goals) review.goals = goals;
    
    await review.save();
    
    res.json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete performance review
// @route   DELETE /api/performance/:id
// @access  Private/Admin
exports.deletePerformanceReview = async (req, res) => {
  try {
    const review = await Performance.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Performance review not found' });
    }
    
    await review.deleteOne();
    
    res.json({ message: 'Performance review removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get staff member's performance reviews
// @route   GET /api/performance/my-reviews
// @access  Private/Staff
exports.getMyPerformanceReviews = async (req, res) => {
  try {
    const reviews = await Performance.find({ staff: req.user.id })
      .populate('reviewer', 'name')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get performance summary by staff
// @route   GET /api/performance/summary
// @access  Private/Admin
exports.getPerformanceSummary = async (req, res) => {
  try {
    // Get all staff members
    const staffMembers = await User.find({ role: 'staff' }, '_id name email');
    
    // Get average performance for each staff
    const summaries = [];
    
    for (const staff of staffMembers) {
      const reviews = await Performance.find({ staff: staff._id });
      
      if (reviews.length === 0) {
        summaries.push({
          staff: {
            _id: staff._id,
            name: staff.name,
            email: staff.email
          },
          averageRating: 0,
          reviewCount: 0
        });
        continue;
      }
      
      // Calculate average rating
      const totalRating = reviews.reduce((acc, review) => acc + review.overallRating, 0);
      const averageRating = parseFloat((totalRating / reviews.length).toFixed(1));
      
      summaries.push({
        staff: {
          _id: staff._id,
          name: staff.name,
          email: staff.email
        },
        averageRating,
        reviewCount: reviews.length
      });
    }
    
    res.json(summaries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};