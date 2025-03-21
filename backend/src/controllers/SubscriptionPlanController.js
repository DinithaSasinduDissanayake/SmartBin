const SubscriptionPlan = require('../models/SubscriptionPlan');

// @desc    Get all subscription plans
// @route   GET /api/subscription-plans
// @access  Private/financial_manager
exports.getSubscriptionPlans = async (req, res) => {
  try {
    const subscriptionPlans = await SubscriptionPlan.find().sort({ createdAt: -1 });
    res.json(subscriptionPlans);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get subscription plan by ID
// @route   GET /api/subscription-plans/:id
// @access  Private/financial_manager
exports.getSubscriptionPlanById = async (req, res) => {
  try {
    const subscriptionPlan = await SubscriptionPlan.findById(req.params.id);
    
    if (!subscriptionPlan) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }
    
    res.json(subscriptionPlan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new subscription plan
// @route   POST /api/subscription-plans
// @access  Private/financial_manager
exports.createSubscriptionPlan = async (req, res) => {
  try {
    const { name, price, subscriberCount, description, duration } = req.body;
    
    // Check if plan with the same name already exists
    const existingPlan = await SubscriptionPlan.findOne({ name });
    if (existingPlan) {
      return res.status(400).json({ message: 'A plan with this name already exists' });
    }
    
    const subscriptionPlan = await SubscriptionPlan.create({
      name,
      price,
      subscriberCount,
      description,
      duration
    });
    
    res.status(201).json(subscriptionPlan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Update subscription plan
// @route   PUT /api/subscription-plans/:id
// @access  Private/financial_manager
exports.updateSubscriptionPlan = async (req, res) => {
  try {
    const { name, price, subscriberCount, description, duration } = req.body;
    
    // Check if plan exists
    let subscriptionPlan = await SubscriptionPlan.findById(req.params.id);
    
    if (!subscriptionPlan) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }
    
    // Check if we're trying to update to a name that already exists (except for this plan)
    if (name !== subscriptionPlan.name) {
      const existingPlan = await SubscriptionPlan.findOne({ name });
      if (existingPlan) {
        return res.status(400).json({ message: 'A plan with this name already exists' });
      }
    }
    
    // Update the plan
    subscriptionPlan = await SubscriptionPlan.findByIdAndUpdate(
      req.params.id,
      { name, price, subscriberCount, description, duration },
      { new: true, runValidators: true }
    );
    
    res.json(subscriptionPlan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete subscription plan
// @route   DELETE /api/subscription-plans/:id
// @access  Private/financial_manager
exports.deleteSubscriptionPlan = async (req, res) => {
  try {
    const subscriptionPlan = await SubscriptionPlan.findById(req.params.id);
    
    if (!subscriptionPlan) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }
    
    await subscriptionPlan.deleteOne();
    
    res.json({ message: 'Subscription plan removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};