const SubscriptionPlan = require('../models/SubscriptionPlan');
const UserSubscription = require('../models/UserSubscription');
const NotFoundError = require('../errors/NotFoundError');
const ApiError = require('../errors/ApiError');
const BadRequestError = require('../errors/BadRequestError');
const cacheService = require('../services/cacheService');

// Cache keys prefix for better organization
const CACHE_KEYS = {
  ALL_PLANS: 'subscription_plans:all',
  PLAN_BY_ID: 'subscription_plan:id:',
  PLANS_BY_STATUS: 'subscription_plans:status:'
};

// Cache TTL (Time To Live) in seconds
const CACHE_TTL = {
  PLANS: 3600,         // 1 hour for plan lists
  PLAN_DETAILS: 7200   // 2 hours for individual plan details
};

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
        // Determine cache key based on query parameters
        const filter = {};
        let cacheKey = CACHE_KEYS.ALL_PLANS;
        
        if (req.query.status) {
            filter.status = req.query.status;
            cacheKey = `${CACHE_KEYS.PLANS_BY_STATUS}${req.query.status}`;
        }
        
        // Try fetching from cache first
        const cachedPlans = await cacheService.getCache(cacheKey);
        
        if (cachedPlans) {
            console.log(`Serving subscription plans from cache: ${cacheKey}`);
            return res.status(200).json(cachedPlans);
        }
        
        // If not in cache, fetch from database
        console.log(`Cache miss for ${cacheKey}, fetching from database`);
        const plans = await SubscriptionPlan.find(filter);
        
        // Store in cache before responding
        await cacheService.setCache(cacheKey, plans, CACHE_TTL.PLANS);
        
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
        
        // Invalidate cache for all plans and status-specific caches
        await Promise.all([
            cacheService.deleteCache(CACHE_KEYS.ALL_PLANS),
            cacheService.deleteCacheByPattern(`${CACHE_KEYS.PLANS_BY_STATUS}*`)
        ]);
        
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
    const planId = req.params.id;
    const cacheKey = `${CACHE_KEYS.PLAN_BY_ID}${planId}`;
    
    try {
        // Try fetching from cache first
        const cachedPlan = await cacheService.getCache(cacheKey);
        
        if (cachedPlan) {
            console.log(`Serving subscription plan from cache: ${cacheKey}`);
            return res.status(200).json(cachedPlan);
        }
        
        // If not in cache, fetch from database
        console.log(`Cache miss for ${cacheKey}, fetching from database`);
        const plan = await SubscriptionPlan.findById(planId);
        
        if (!plan) {
            throw new NotFoundError('Subscription plan not found');
        }
        
        // Store in cache before responding
        await cacheService.setCache(cacheKey, plan, CACHE_TTL.PLAN_DETAILS);
        
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
    const planId = req.params.id;

    try {
        const plan = await SubscriptionPlan.findById(planId);
        if (!plan) {
            throw new NotFoundError('Subscription plan not found');
        }

        // If we're changing from active to inactive, verify no active subscriptions exist
        if (plan.status === 'active' && status === 'inactive') {
            const activeSubscriptions = await UserSubscription.countDocuments({
                subscriptionPlan: planId,
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
        
        // Invalidate all related caches
        await Promise.all([
            cacheService.deleteCache(`${CACHE_KEYS.PLAN_BY_ID}${planId}`),
            cacheService.deleteCache(CACHE_KEYS.ALL_PLANS),
            cacheService.deleteCacheByPattern(`${CACHE_KEYS.PLANS_BY_STATUS}*`)
        ]);
        
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
    const planId = req.params.id;
    
    try {
        const plan = await SubscriptionPlan.findById(planId);
        if (!plan) {
            throw new NotFoundError('Subscription plan not found');
        }

        // Check if any active subscriptions use this plan before deleting
        const activeSubs = await UserSubscription.countDocuments({ 
            subscriptionPlan: planId, 
            status: 'active' 
        });
        
        if (activeSubs > 0) {
            throw new BadRequestError('Cannot delete plan with active subscriptions. Please cancel or migrate the subscriptions first.');
        }

        await plan.deleteOne();
        
        // Invalidate all related caches
        await Promise.all([
            cacheService.deleteCache(`${CACHE_KEYS.PLAN_BY_ID}${planId}`),
            cacheService.deleteCache(CACHE_KEYS.ALL_PLANS),
            cacheService.deleteCacheByPattern(`${CACHE_KEYS.PLANS_BY_STATUS}*`)
        ]);
        
        res.status(200).json({ message: 'Subscription plan deleted successfully' });
    } catch (error) {
        console.error('Error deleting subscription plan:', error);
        next(error); // Pass NotFoundError, BadRequestError, or others
    }
};