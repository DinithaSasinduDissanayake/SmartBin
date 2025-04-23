const SubscriptionPlan = require('../models/SubscriptionPlan');
const NotFoundError = require('../errors/NotFoundError');
const ApiError = require('../errors/ApiError');

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
        const plans = await SubscriptionPlan.find();
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
    const { name, description, price, duration, features } = req.body;

    try {
        const plan = await SubscriptionPlan.create({
            name,
            description,
            price,
            duration,
            features
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
    const { name, description, price, duration, features } = req.body;

    try {
        const plan = await SubscriptionPlan.findById(req.params.id);
        if (!plan) {
            throw new NotFoundError('Subscription plan not found');
        }

        plan.name = name || plan.name;
        plan.description = description !== undefined ? description : plan.description;
        plan.price = price !== undefined ? price : plan.price;
        plan.duration = duration || plan.duration;
        plan.features = features !== undefined ? features : plan.features;

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

        // Optional: Check if any active subscriptions use this plan before deleting
        // const activeSubs = await UserSubscription.countDocuments({ plan: req.params.id, status: 'active' });
        // if (activeSubs > 0) {
        //     throw new BadRequestError('Cannot delete plan with active subscriptions');
        // }

        await plan.deleteOne();
        res.status(200).json({ message: 'Subscription plan deleted successfully' });
    } catch (error) {
        console.error('Error deleting subscription plan:', error);
        next(error); // Pass NotFoundError, BadRequestError, or others
    }
};