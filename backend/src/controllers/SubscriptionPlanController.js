const SubscriptionPlan = require('../models/SubscriptionPlan');
const UserSubscription = require('../models/UserSubscription');
const NotFoundError = require('../errors/NotFoundError');
const ApiError = require('../errors/ApiError');
const BadRequestError = require('../errors/BadRequestError');

/**
 * @desc    Get all subscription plans
 * @route   GET /api/subscription-plans
 * @access  Public
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.getSubscriptionPlans = async (req, res, next) => {
    try {
        // Allow filtering by status if provided
        const filter = {};
        if (req.query.status) {
            filter.status = req.query.status;
        }
        
        const plans = await SubscriptionPlan.find(filter);
        res.status(200).json(plans);
    } catch (error) {
        console.error('Error fetching subscription plans:', error);
        next(new ApiError(500, 'Failed to retrieve subscription plans'));
    }
};

/**
 * @desc    Create a new subscription plan
 * @route   POST /api/subscription-plans
 * @access  Private (financial_manager, admin)
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.createSubscriptionPlan = async (req, res, next) => {
    // Validation handled by express-validator
    const { name, description, price, duration, features, status } = req.body;

    try {
        const plan = await SubscriptionPlan.create({
            name,
            description,
            price,
            duration,
            features,
            status: status || 'active' // Default to active if not provided
        });
        res.status(201).json(plan);
    } catch (error) {
        console.error('Error creating subscription plan:', error);
        // Mongoose validation/duplicate errors handled globally
        if (!(error instanceof ApiError)) {
            next(new ApiError(500, 'Failed to create subscription plan'));
        } else {
            next(error);
        }
    }
};

/**
 * @desc    Get a specific subscription plan by ID
 * @route   GET /api/subscription-plans/:id
 * @access  Public
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.getSubscriptionPlanById = async (req, res, next) => {
    try {
        const plan = await SubscriptionPlan.findById(req.params.id);
        if (!plan) {
            throw new NotFoundError('Subscription plan not found');
        }
        res.status(200).json(plan);
    } catch (error) {
        console.error('Error fetching subscription plan by ID:', error);
        next(error); // Pass NotFoundError or others
    }
};

/**
 * @desc    Update a subscription plan
 * @route   PUT /api/subscription-plans/:id
 * @access  Private (financial_manager, admin)
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.updateSubscriptionPlan = async (req, res, next) => {
    // Validation handled by express-validator
    const { name, description, price, duration, features, status } = req.body;

    try {
        const plan = await SubscriptionPlan.findById(req.params.id);
        if (!plan) {
            throw new NotFoundError('Subscription plan not found');
        }

        // If we're changing from active to inactive, verify no active subscriptions exist
        if (plan.status === 'active' && status === 'inactive') {
            const activeSubscriptions = await UserSubscription.countDocuments({
                subscriptionPlan: req.params.id,
                status: 'active'
            });
            
            if (activeSubscriptions > 0) {
                throw new BadRequestError('Cannot deactivate plan with active subscriptions. Please cancel or migrate the subscriptions first.');
            }
        }

        plan.name = name || plan.name;
        plan.description = description !== undefined ? description : plan.description;
        plan.price = price !== undefined ? price : plan.price;
        plan.duration = duration || plan.duration;
        plan.features = features !== undefined ? features : plan.features;
        plan.status = status || plan.status;

        const updatedPlan = await plan.save(); // Trigger validation
        res.status(200).json(updatedPlan);
    } catch (error) {
        console.error('Error updating subscription plan:', error);
        // Mongoose validation/duplicate errors handled globally
        next(error); // Pass NotFoundError or others
    }
};

/**
 * @desc    Delete a subscription plan
 * @route   DELETE /api/subscription-plans/:id
 * @access  Private (financial_manager, admin)
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.deleteSubscriptionPlan = async (req, res, next) => {
    try {
        const plan = await SubscriptionPlan.findById(req.params.id);
        if (!plan) {
            throw new NotFoundError('Subscription plan not found');
        }

        // Check if any active subscriptions use this plan before deleting
        const activeSubs = await UserSubscription.countDocuments({ 
            subscriptionPlan: req.params.id, 
            status: 'active' 
        });
        
        if (activeSubs > 0) {
            throw new BadRequestError('Cannot delete plan with active subscriptions. Please cancel or migrate the subscriptions first.');
        }

        await plan.deleteOne();
        res.status(200).json({ message: 'Subscription plan deleted successfully' });
    } catch (error) {
        console.error('Error deleting subscription plan:', error);
        next(error); // Pass NotFoundError, BadRequestError, or others
    }
};