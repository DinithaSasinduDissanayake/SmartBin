const UserSubscription = require('../models/UserSubscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const User = require('../models/User');
const mongoose = require('mongoose');

// Helper function to add months to a date
const addMonths = (date, months) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  // Handle edge cases like Feb 29th
  if (result.getDate() < date.getDate()) {
    result.setDate(0); // Go to the last day of the previous month
  }
  return result;
};

// @desc    Create a new subscription for a user
// @route   POST /api/user-subscriptions
// @access  Private/financial_manager/admin
exports.createUserSubscription = async (req, res) => {
  const { userId, planId, startDate: customStartDate } = req.body;

  // Basic validation
  if (!userId || !planId) {
    return res.status(400).json({ message: 'User ID and Plan ID are required' });
  }
  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(planId)) {
    return res.status(400).json({ message: 'Invalid User ID or Plan ID format' });
  }

  try {
    // Check if user and plan exist
    const user = await User.findById(userId);
    const plan = await SubscriptionPlan.findById(planId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!plan) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }

    // Check if user already has an active subscription (optional, depends on business logic)
    // const existingActiveSubscription = await UserSubscription.findOne({ user: userId, status: 'active' });
    // if (existingActiveSubscription) {
    //   return res.status(400).json({ message: 'User already has an active subscription' });
    // }

    // Determine start date
    const startDate = customStartDate ? new Date(customStartDate) : new Date();
    if (isNaN(startDate.getTime())) {
        return res.status(400).json({ message: 'Invalid start date provided' });
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
      // Default case 'Monthly' already set
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
    // Handle potential duplicate key errors if unique indexes are added later
    if (error.code === 11000) {
        return res.status(400).json({ message: 'Duplicate subscription detected.' });
    }
    res.status(500).json({ message: 'Server error while creating subscription' });
  }
};

// @desc    Get all subscriptions for a specific user
// @route   GET /api/user-subscriptions/user/:userId
// @access  Private/financial_manager/admin/owner
exports.getUserSubscriptions = async (req, res) => {
  const requestedUserId = req.params.userId;
  const loggedInUserId = req.user.id;
  const loggedInUserRole = req.user.role;

  // Validate userId format
  if (!mongoose.Types.ObjectId.isValid(requestedUserId)) {
    return res.status(400).json({ message: 'Invalid User ID format' });
  }

  // Check permissions: Allow if admin, financial manager, or the user is requesting their own subscriptions
  if (loggedInUserRole !== 'admin' && loggedInUserRole !== 'financial_manager' && loggedInUserId !== requestedUserId) {
    return res.status(403).json({ message: 'Not authorized to access these subscriptions' });
  }

  try {
    const subscriptions = await UserSubscription.find({ user: requestedUserId })
                                              .populate('subscriptionPlan', 'name price duration') // Populate plan details
                                              .populate('user', 'username email'); // Populate basic user details

    if (!subscriptions || subscriptions.length === 0) {
      // It's not an error if a user has no subscriptions, return empty array
      return res.status(200).json([]); 
    }

    res.status(200).json(subscriptions);

  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    res.status(500).json({ message: 'Server error while fetching subscriptions' });
  }
};

// @desc    Get a single subscription by ID
// @route   GET /api/user-subscriptions/:id
// @access  Private/financial_manager/admin/owner
exports.getUserSubscriptionById = async (req, res) => {
  const subscriptionId = req.params.id;
  const loggedInUserId = req.user.id;
  const loggedInUserRole = req.user.role;

  // Validate subscriptionId format
  if (!mongoose.Types.ObjectId.isValid(subscriptionId)) {
    return res.status(400).json({ message: 'Invalid Subscription ID format' });
  }

  try {
    const subscription = await UserSubscription.findById(subscriptionId)
                                              .populate('subscriptionPlan', 'name price duration description')
                                              .populate('user', 'username email');

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Check permissions: Allow if admin, financial manager, or the owner of the subscription
    if (loggedInUserRole !== 'admin' && loggedInUserRole !== 'financial_manager' && subscription.user._id.toString() !== loggedInUserId) {
      return res.status(403).json({ message: 'Not authorized to access this subscription' });
    }

    res.status(200).json(subscription);

  } catch (error) {
    console.error('Error fetching subscription by ID:', error);
    res.status(500).json({ message: 'Server error while fetching subscription' });
  }
};

// @desc    Update a subscription (e.g., status, autoRenew)
// @route   PUT /api/user-subscriptions/:id
// @access  Private/financial_manager/admin
exports.updateUserSubscription = async (req, res) => {
  const subscriptionId = req.params.id;
  const { status, autoRenew } = req.body;

  // Validate subscriptionId format
  if (!mongoose.Types.ObjectId.isValid(subscriptionId)) {
    return res.status(400).json({ message: 'Invalid Subscription ID format' });
  }

  // Validate incoming data (basic example)
  const allowedStatuses = ['active', 'expired', 'cancelled', 'pending'];
  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }
  if (autoRenew !== undefined && typeof autoRenew !== 'boolean') {
    return res.status(400).json({ message: 'Invalid autoRenew value, must be true or false' });
  }

  try {
    const subscription = await UserSubscription.findById(subscriptionId);

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Update fields if they are provided in the request body
    if (status !== undefined) {
      subscription.status = status;
    }
    if (autoRenew !== undefined) {
      subscription.autoRenew = autoRenew;
    }
    // Add logic here if other fields like endDate need adjustment based on status change

    const updatedSubscription = await subscription.save();

    res.status(200).json(updatedSubscription);

  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ message: 'Server error while updating subscription' });
  }
};

// @desc    Cancel (mark as cancelled) a subscription
// @route   DELETE /api/user-subscriptions/:id
// @access  Private/financial_manager/admin
exports.cancelUserSubscription = async (req, res) => {
  const subscriptionId = req.params.id;

  // Validate subscriptionId format
  if (!mongoose.Types.ObjectId.isValid(subscriptionId)) {
    return res.status(400).json({ message: 'Invalid Subscription ID format' });
  }

  try {
    const subscription = await UserSubscription.findById(subscriptionId);

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Prevent cancelling already cancelled subscriptions (optional)
    if (subscription.status === 'cancelled') {
        return res.status(400).json({ message: 'Subscription is already cancelled' });
    }

    const previousStatus = subscription.status;
    subscription.status = 'cancelled';
    subscription.autoRenew = false; // Ensure auto-renew is off
    // Optionally set endDate to now if cancelling prematurely
    // subscription.endDate = new Date(); 

    await subscription.save();

    // Decrement subscriber count only if it was previously active
    if (previousStatus === 'active') {
        await SubscriptionPlan.findByIdAndUpdate(subscription.subscriptionPlan, { $inc: { subscriberCount: -1 } });
    }

    res.status(200).json({ message: 'Subscription cancelled successfully' });

  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ message: 'Server error while cancelling subscription' });
  }
};

// @desc    Get all active subscriptions (for admin/financial manager overview)
// @route   GET /api/user-subscriptions
// @access  Private/financial_manager/admin
exports.getAllActiveSubscriptions = async (req, res) => {
  try {
    const activeSubscriptions = await UserSubscription.find({ status: 'active' })
                                                    .populate('user', 'username email')
                                                    .populate('subscriptionPlan', 'name price')
                                                    .sort({ nextBillingDate: 1 }); // Sort by next billing date

    res.status(200).json(activeSubscriptions);

  } catch (error) {
    console.error('Error fetching all active subscriptions:', error);
    res.status(500).json({ message: 'Server error while fetching active subscriptions' });
  }
};
