const UserSubscription = require('../models/UserSubscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const User = require('../models/User');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');
const BadRequestError = require('../errors/BadRequestError');
const ApiError = require('../errors/ApiError');
const mongoose = require('mongoose');

/**
 * Helper function to add months to a date
 * @param {Date} date - The start date
 * @param {Number} months - Number of months to add
 * @returns {Date} - New date with months added
 */
const addMonths = (date, months) => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    // Handle edge cases like Feb 29th
    if (result.getDate() < date.getDate()) {
        result.setDate(0); // Go to the last day of the previous month
    }
    return result;
};

/**
 * @desc    Create a new subscription for a user
 * @route   POST /api/user-subscriptions
 * @access  Private/financial_manager/admin
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.createUserSubscription = async (req, res, next) => {
  const { userId, planId, startDate: customStartDate } = req.body;

  // Basic validation
  if (!userId || !planId) {
    return next(new BadRequestError('User ID and Plan ID are required'));
  }
  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(planId)) {
    return next(new BadRequestError('Invalid User ID or Plan ID format'));
  }

  try {
    // Check if user and plan exist
    const user = await User.findById(userId);
    const plan = await SubscriptionPlan.findById(planId);

    if (!user) {
      throw new NotFoundError('User not found');
    }
    if (!plan) {
      throw new NotFoundError('Subscription plan not found');
    }

    // Determine start date
    const startDate = customStartDate ? new Date(customStartDate) : new Date();
    if (isNaN(startDate.getTime())) {
      return next(new BadRequestError('Invalid start date provided'));
    }

    // Calculate end date and next billing date based on plan duration
    let durationMonths = 1; // Default to Monthly
    switch (plan.duration) {
      case 'Quarterly':
        durationMonths = 3;
        break;
      case 'Semi-Annual':
        durationMonths = 6;
        break;
      case 'Annual':
        durationMonths = 12;
        break;
    }

    const endDate = addMonths(startDate, durationMonths);
    const nextBillingDate = new Date(endDate); // First billing is at the end of the first period

    // Create the subscription
    const newSubscription = new UserSubscription({
      user: userId,
      subscriptionPlan: planId,
      startDate,
      endDate,
      status: 'active', // Default to active
      autoRenew: true, // Default to auto-renew true, can be changed later
      lastBillingDate: startDate, // Initial billing date is the start date
      nextBillingDate,
    });

    await newSubscription.save();

    // Optionally, increment subscriber count on the plan
    await SubscriptionPlan.findByIdAndUpdate(planId, { $inc: { subscriberCount: 1 } });

    res.status(201).json(newSubscription);
  } catch (error) {
    console.error('Error creating user subscription:', error);
    next(error);
  }
};

/**
 * @desc    Get all subscriptions for a specific user
 * @route   GET /api/user-subscriptions/user/:userId
 * @access  Private/financial_manager/admin/owner
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.getUserSubscriptions = async (req, res, next) => {
  const requestedUserId = req.params.userId;
  const loggedInUserId = req.user.id;
  const loggedInUserRole = req.user.role;

  // Validate userId format
  if (!mongoose.Types.ObjectId.isValid(requestedUserId)) {
    return next(new BadRequestError('Invalid User ID format'));
  }

  // Check permissions: Allow if admin, financial manager, or the user is requesting their own subscriptions
  if (loggedInUserRole !== 'admin' && loggedInUserRole !== 'financial_manager' && loggedInUserId !== requestedUserId) {
    return next(new ForbiddenError('Not authorized to access these subscriptions'));
  }

  try {
    const subscriptions = await UserSubscription.find({ user: requestedUserId })
      .populate('subscriptionPlan', 'name price duration') // Populate plan details
      .populate('user', 'username email'); // Populate basic user details

    res.status(200).json(subscriptions);
  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    next(error);
  }
};

/**
 * @desc    Get a single subscription by ID
 * @route   GET /api/user-subscriptions/:id
 * @access  Private/financial_manager/admin/owner
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.getUserSubscriptionById = async (req, res, next) => {
  const subscriptionId = req.params.id;
  const loggedInUserId = req.user.id;
  const loggedInUserRole = req.user.role;

  // Validate subscriptionId format
  if (!mongoose.Types.ObjectId.isValid(subscriptionId)) {
    return next(new BadRequestError('Invalid Subscription ID format'));
  }

  try {
    const subscription = await UserSubscription.findById(subscriptionId)
      .populate('subscriptionPlan', 'name price duration description')
      .populate('user', 'username email');

    if (!subscription) {
      throw new NotFoundError('Subscription not found');
    }

    // Check permissions: Allow if admin, financial manager, or the owner of the subscription
    if (loggedInUserRole !== 'admin' && loggedInUserRole !== 'financial_manager' && subscription.user._id.toString() !== loggedInUserId) {
      return next(new ForbiddenError('Not authorized to access this subscription'));
    }

    res.status(200).json(subscription);
  } catch (error) {
    console.error('Error fetching subscription by ID:', error);
    next(error);
  }
};

/**
 * @desc    Update a subscription (e.g., status, autoRenew)
 * @route   PUT /api/user-subscriptions/:id
 * @access  Private/financial_manager/admin
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.updateUserSubscription = async (req, res, next) => {
  const subscriptionId = req.params.id;
  const { status, autoRenew } = req.body;

  // Validate subscriptionId format
  if (!mongoose.Types.ObjectId.isValid(subscriptionId)) {
    return next(new BadRequestError('Invalid Subscription ID format'));
  }

  // Validate incoming data (basic example)
  const allowedStatuses = ['active', 'expired', 'cancelled', 'pending'];
  if (status && !allowedStatuses.includes(status)) {
    return next(new BadRequestError('Invalid status value'));
  }
  if (autoRenew !== undefined && typeof autoRenew !== 'boolean') {
    return next(new BadRequestError('Invalid autoRenew value, must be true or false'));
  }

  try {
    const subscription = await UserSubscription.findById(subscriptionId);

    if (!subscription) {
      throw new NotFoundError('Subscription not found');
    }

    // Store previous status to detect changes
    const previousStatus = subscription.status;
    
    // Update fields if they are provided in the request body
    if (status !== undefined) {
      subscription.status = status;
    }
    if (autoRenew !== undefined) {
      subscription.autoRenew = autoRenew;
    }

    // If we're changing from non-active to active, adjust the endDate and nextBillingDate
    if (previousStatus !== 'active' && subscription.status === 'active') {
      // Get the plan details to calculate new dates
      const plan = await SubscriptionPlan.findById(subscription.subscriptionPlan);
      if (!plan) {
        throw new NotFoundError('Subscription plan not found');
      }

      // Calculate duration based on plan
      let durationMonths = 1; // Default to Monthly
      switch (plan.duration) {
        case 'Quarterly':
          durationMonths = 3;
          break;
        case 'Semi-Annual':
          durationMonths = 6;
          break;
        case 'Annual':
          durationMonths = 12;
          break;
      }

      const now = new Date();
      subscription.endDate = addMonths(now, durationMonths);
      subscription.nextBillingDate = new Date(subscription.endDate);
      subscription.lastBillingDate = now;

      // Increment the subscriber count on the plan
      await SubscriptionPlan.findByIdAndUpdate(subscription.subscriptionPlan, { $inc: { subscriberCount: 1 } });
    }
    
    // If we're changing from active to non-active, decrement the subscriber count
    if (previousStatus === 'active' && subscription.status !== 'active') {
      await SubscriptionPlan.findByIdAndUpdate(subscription.subscriptionPlan, { $inc: { subscriberCount: -1 } });
    }

    // Save changes
    const updatedSubscription = await subscription.save();

    res.status(200).json(updatedSubscription);
  } catch (error) {
    console.error('Error updating subscription:', error);
    next(error);
  }
};

/**
 * @desc    Cancel (mark as cancelled) a subscription
 * @route   DELETE /api/user-subscriptions/:id
 * @access  Private/financial_manager/admin
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.cancelUserSubscription = async (req, res, next) => {
  const subscriptionId = req.params.id;

  // Validate subscriptionId format
  if (!mongoose.Types.ObjectId.isValid(subscriptionId)) {
    return next(new BadRequestError('Invalid Subscription ID format'));
  }

  try {
    const subscription = await UserSubscription.findById(subscriptionId);

    if (!subscription) {
      throw new NotFoundError('Subscription not found');
    }

    // Prevent cancelling already cancelled subscriptions (optional)
    if (subscription.status === 'cancelled') {
      return next(new BadRequestError('Subscription is already cancelled'));
    }

    const previousStatus = subscription.status;
    subscription.status = 'cancelled';
    subscription.autoRenew = false; // Ensure auto-renew is off

    await subscription.save();

    // Decrement subscriber count only if it was previously active
    if (previousStatus === 'active') {
      await SubscriptionPlan.findByIdAndUpdate(subscription.subscriptionPlan, { $inc: { subscriberCount: -1 } });
    }

    res.status(200).json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    next(error);
  }
};

/**
 * @desc    Get all active subscriptions (for admin/financial manager overview)
 * @route   GET /api/user-subscriptions
 * @access  Private/financial_manager/admin
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.getAllActiveSubscriptions = async (req, res, next) => {
  try {
    const activeSubscriptions = await UserSubscription.find({ status: 'active' })
      .populate('user', 'username email')
      .populate('subscriptionPlan', 'name price')
      .sort({ nextBillingDate: 1 }); // Sort by next billing date

    res.status(200).json(activeSubscriptions);
  } catch (error) {
    console.error('Error fetching all active subscriptions:', error);
    next(new ApiError(500, 'Failed to retrieve active subscriptions'));
  }
};
