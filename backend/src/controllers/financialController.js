const Expense = require('../models/Expense');
const Payment = require('../models/Payment');
const UserSubscription = require('../models/UserSubscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const User = require('../models/User');
const mongoose = require('mongoose');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const ApiError = require('../errors/ApiError');
const paymentService = require('../services/paymentService');
const cacheService = require('../services/cacheService');

// Cache keys for financial dashboard data
const CACHE_KEYS = {
    DASHBOARD: 'financial_dashboard:range:',
};

// Cache TTL for financial data (in seconds)
const CACHE_TTL = {
    DASHBOARD: 1800, // 30 minutes for dashboard data
};

/**
 * @desc    Get aggregated financial data for the dashboard
 * @route   GET /api/financials/dashboard
 * @access  Private (financial_manager, admin)
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.getDashboardData = async (req, res, next) => {
    try {
        const { range = 'month' } = req.query; // Default to 'month'
        
        // Define cache key based on date range
        const cacheKey = `${CACHE_KEYS.DASHBOARD}${range}`;
        
        // Try to get data from cache first
        const cachedData = await cacheService.getCache(cacheKey);
        
        if (cachedData) {
            console.log(`Serving financial dashboard data from cache for range: ${range}`);
            return res.status(200).json(cachedData);
        }
        
        console.log(`Cache miss for financial dashboard data (${range}), fetching from database`);
        
        let startDate, endDate = new Date();
        let groupBy, labelFormatter;
        // Determine date range and grouping
        switch (range) {
            case 'last3months':
                startDate = new Date();
                startDate.setMonth(startDate.getMonth() - 3);
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
                groupBy = { year: { $year: "$paymentDate" }, month: { $month: "$paymentDate" } };
                labelFormatter = (g) => {
                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  return `${monthNames[g.month - 1]}-${g.year}`;
                };
                break;
            case 'year':
                startDate = new Date(endDate.getFullYear(), 0, 1);
                startDate.setHours(0, 0, 0, 0);
                groupBy = { year: { $year: "$paymentDate" }, month: { $month: "$paymentDate" } };
                labelFormatter = (g) => {
                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  return `${monthNames[g.month - 1]}-${g.year}`;
                };
                break;
            case 'month':
            default:
                startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
                startDate.setHours(0, 0, 0, 0);
                groupBy = { day: { $dayOfMonth: "$paymentDate" } };
                labelFormatter = (g) => g.day.toString();
                break;
        }
        endDate.setHours(23, 59, 59, 999);

        // --- Aggregations ---

        // 1. Total Revenue (from Payments)
        const revenueData = await Payment.aggregate([
            { $match: { paymentDate: { $gte: startDate, $lte: endDate }, status: 'completed' } },
            { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
        ]);
        const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

        // 2. Total Expenses
        const expenseData = await Expense.aggregate([
            { $match: { date: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: null, totalExpenses: { $sum: '$amount' } } }
        ]);
        const totalExpenses = expenseData.length > 0 ? expenseData[0].totalExpenses : 0;

        // 3. Net Profit
        const netProfit = totalRevenue - totalExpenses;

        // 4. New Subscriptions Count
        const newSubscriptions = await UserSubscription.countDocuments({
            startDate: { $gte: startDate, $lte: endDate }
        });

        // 5. Active Subscriptions Count
        const activeSubscriptions = await UserSubscription.countDocuments({
            status: 'active',
            endDate: { $gte: new Date() } // Active if end date is in the future
        });

        // Revenue trend
        const revenueTrendRaw = await Payment.aggregate([
            { $match: { paymentDate: { $gte: startDate, $lte: endDate }, status: 'completed' } },
            { $group: { _id: groupBy, total: { $sum: '$amount' } } },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);
        // Expense trend
        let expenseGroupBy;
        switch (range) {
            case 'last3months':
            case 'year':
                expenseGroupBy = { year: { $year: "$date" }, month: { $month: "$date" } };
                break;
            case 'month':
            default:
                expenseGroupBy = { day: { $dayOfMonth: "$date" } };
                break;
        }
        const expenseTrendRaw = await Expense.aggregate([
            { $match: { date: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: expenseGroupBy, total: { $sum: '$amount' } } },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);
        // Format trend data for frontend
        const revenueTrend = revenueTrendRaw.map(g => ({ month: labelFormatter(g._id), total: g.total }));
        const expenseTrend = expenseTrendRaw.map(g => ({ month: labelFormatter(g._id), total: g.total }));

        // 6. Revenue Breakdown by Plan
        const revenueByPlan = await Payment.aggregate([
            { $match: { paymentDate: { $gte: startDate, $lte: endDate }, status: 'completed', subscriptionPlan: { $exists: true } } }, // Ensure subscriptionPlan field exists
            { $lookup: { // Join with SubscriptionPlan
                from: 'subscriptionplans',
                localField: 'subscriptionPlan', // Use the direct field from Payment model
                foreignField: '_id',
                as: 'planDetails'
            }},
            { $unwind: '$planDetails' },
            { $group: {
                _id: '$planDetails.name',
                totalAmount: { $sum: '$amount' },
                count: { $sum: 1 }
            }},
            { $project: {
                _id: 0,
                planName: '$_id', // Keep planName for consistency if frontend expects it
                revenue: '$totalAmount', // Rename totalAmount to revenue
                count: 1
            }},
            { $sort: { revenue: -1 } } // Sort by revenue
        ]);

        // 7. Expenses Breakdown by Category
        const expensesByCategory = await Expense.aggregate([
            { $match: { date: { $gte: startDate, $lte: endDate } } },
            { $group: {
                _id: '$category',
                total: { $sum: '$amount' }
            }},
            { $project: {
                _id: 0,
                category: '$_id',
                total: 1
            }},
            { $sort: { total: -1 } }
        ]);

        // 8. Recent Payments (limit 5)
        const recentPayments = await Payment.find({ paymentDate: { $gte: startDate, $lte: endDate } })
            .populate('user', 'name email')
            .sort({ paymentDate: -1 })
            .limit(5)
            .select('paymentDate user description amount status'); // Select specific fields

        // 9. Recent Expenses (limit 5)
        const recentExpenses = await Expense.find({ date: { $gte: startDate, $lte: endDate } })
            .sort({ date: -1 })
            .limit(5)
            .select('date category description amount status'); // Select specific fields

        // 10. Fetch all Subscription Plans details for the subscription tab
        const subscriptionPlans = await SubscriptionPlan.find({})
            .select('name price duration subscriberCount _id') // Select necessary fields
            .lean(); // Use lean for plain JS objects

        // --- Assemble Dashboard Data ---
        const dashboardData = {
            summary: {
                totalRevenue,
                totalExpenses,
                netProfit,
                newSubscriptions,
                activeSubscriptions,
                // Add other summary fields if needed, e.g., outstanding payments
                // outstandingPayments: await Payment.aggregate([...]) // Example
                dateRange: { start: startDate.toISOString(), end: endDate.toISOString(), label: range }
            },
            revenueByPlan, // Now uses 'revenue' field
            expensesByCategory, // Added expenses by category
            recentTransactions: { // Group recent items
                payments: recentPayments.map(p => ({ // Map to consistent structure if needed
                    id: p._id,
                    date: p.paymentDate,
                    customer: p.user?.name, // Handle potential null user
                    description: p.description,
                    amount: p.amount,
                    status: p.status
                })),
                expenses: recentExpenses.map(e => ({ // Map to consistent structure
                    id: e._id,
                    date: e.date,
                    category: e.category,
                    description: e.description,
                    amount: e.amount,
                    status: e.status
                }))
            },
            trends: {
                revenue: revenueTrend,
                expenses: expenseTrend
            },
            subscriptionPlans // Added subscription plans list
        };

        // Cache the dashboard data before responding
        await cacheService.setCache(cacheKey, dashboardData, CACHE_TTL.DASHBOARD);

        res.status(200).json(dashboardData);

    } catch (error) {
        console.error('Error fetching financial dashboard data:', error);
        // Simply pass the error to the global handler
        next(error);
    }
};

/**
 * @desc    Get all payments (with filtering and pagination)
 * @route   GET /api/financials/payments
 * @access  Private (financial_manager, admin)
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.getAllPayments = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status, userId, planId, startDate, endDate } = req.query;
        const query = {};

        if (status) query.status = status;
        if (userId) {
            if (!mongoose.Types.ObjectId.isValid(userId)) throw new BadRequestError('Invalid userId format');
            query.user = userId;
        }
        // Filtering by planId requires joining/lookup, might be complex for simple GET
        // if (planId) { ... }

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) throw new BadRequestError('Invalid date format');
            end.setHours(23, 59, 59, 999);
            query.paymentDate = { $gte: start, $lte: end };
        }

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            sort: { paymentDate: -1 },
            populate: [
                { path: 'user', select: 'name email' },
                { path: 'userSubscription', populate: { path: 'plan', select: 'name' } }
            ]
        };

        const payments = await Payment.paginate(query, options); // Assuming mongoose-paginate-v2 is used

        res.status(200).json(payments);

    } catch (error) {
        console.error('Error fetching payments:', error);
        // Simply pass the error to the global handler
        next(error); 
    }
};

/**
 * @desc    Get a single payment by ID
 * @route   GET /api/financials/payments/:id
 * @access  Private (financial_manager, admin)
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.getPaymentById = async (req, res, next) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate('user', 'name email')
            .populate({ path: 'userSubscription', populate: { path: 'plan', select: 'name price' } });

        if (!payment) {
            throw new NotFoundError('Payment not found');
        }

        res.status(200).json(payment);
    } catch (error) {
        console.error('Error fetching payment by ID:', error);
        // Simply pass the error to the global handler
        next(error); 
    }
};

/**
 * @desc    Record a manual payment (e.g., cash)
 * @route   POST /api/financials/payments
 * @access  Private (financial_manager, admin)
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.recordManualPayment = async (req, res, next) => {
    // Add validation using express-validator in the route definition
    const { userId, amount, method, status = 'completed', notes, userSubscriptionId } = req.body;

    try {
        // Validate user exists
        const user = await User.findById(userId);
        if (!user) throw new NotFoundError(`User not found with ID: ${userId}`);

        // Validate subscription exists if provided
        let userSubscription = null;
        if (userSubscriptionId) {
            userSubscription = await UserSubscription.findById(userSubscriptionId);
            if (!userSubscription) throw new NotFoundError(`UserSubscription not found with ID: ${userSubscriptionId}`);
            // Optional: Check if subscription belongs to the user
            if (userSubscription.user.toString() !== userId) {
                throw new BadRequestError('Subscription does not belong to the specified user');
            }
        }

        const payment = await Payment.create({
            user: userId,
            amount,
            method,
            status,
            notes,
            userSubscription: userSubscriptionId || undefined, // Only link if provided
            paymentDate: new Date() // Record payment date as now
        });

        // Optional: Update subscription status based on payment? (e.g., activate)
        if (userSubscription && status === 'completed') {
            // Add logic here if needed, e.g., update subscription end date
        }

        res.status(201).json(payment);

    } catch (error) {
        console.error('Error recording manual payment:', error);
        // Simply pass the error to the global handler
        next(error); 
    }
};


/**
 * @desc    Get all expenses (with filtering and pagination)
 * @route   GET /api/financials/expenses
 * @access  Private (financial_manager, admin)
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.getAllExpenses = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, category, startDate, endDate } = req.query;
        const query = {};

        if (category) query.category = category;

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) throw new BadRequestError('Invalid date format');
            end.setHours(23, 59, 59, 999);
            query.date = { $gte: start, $lte: end };
        }

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            sort: { date: -1 }
        };

        const expenses = await Expense.paginate(query, options); // Assuming mongoose-paginate-v2

        res.status(200).json(expenses);

    } catch (error) {
        console.error('Error fetching expenses:', error);
        // Simply pass the error to the global handler
        next(error); 
    }
};

/**
 * @desc    Get a single expense by ID
 * @route   GET /api/financials/expenses/:id
 * @access  Private (financial_manager, admin)
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.getExpenseById = async (req, res, next) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            throw new NotFoundError('Expense not found');
        }

        res.status(200).json(expense);
    } catch (error) {
        console.error('Error fetching expense by ID:', error);
        // Simply pass the error to the global handler
        next(error); 
    }
};

/**
 * @desc    Record a new expense
 * @route   POST /api/financials/expenses
 * @access  Private (financial_manager, admin)
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.recordExpense = async (req, res, next) => {
    // Add validation using express-validator in the route definition
    const { description, amount, category, date } = req.body;

    try {
        const expense = await Expense.create({
            description,
            amount,
            category,
            date: date ? new Date(date) : new Date() // Use provided date or default to now
        });

        res.status(201).json(expense);

    } catch (error) {
        console.error('Error recording expense:', error);
        // Simply pass the error to the global handler
        next(error); 
    }
};

/**
 * @desc    Update an expense
 * @route   PUT /api/financials/expenses/:id
 * @access  Private (financial_manager, admin)
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.updateExpense = async (req, res, next) => {
    // Add validation using express-validator in the route definition
    const { description, amount, category, date } = req.body;

    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            throw new NotFoundError('Expense not found');
        }

        expense.description = description || expense.description;
        expense.amount = amount || expense.amount;
        expense.category = category || expense.category;
        expense.date = date ? new Date(date) : expense.date;

        const updatedExpense = await expense.save(); // Trigger validation

        res.status(200).json(updatedExpense);

    } catch (error) {
        console.error('Error updating expense:', error);
        // Simply pass the error to the global handler
        next(error); 
    }
};

/**
 * @desc    Delete an expense
 * @route   DELETE /api/financials/expenses/:id
 * @access  Private (financial_manager, admin)
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.deleteExpense = async (req, res, next) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            throw new NotFoundError('Expense not found');
        }

        await expense.deleteOne();

        res.status(200).json({ message: 'Expense deleted successfully' });

    } catch (error) {
        console.error('Error deleting expense:', error);
        // Simply pass the error to the global handler
        next(error); 
    }
};

/**
 * @desc    Initiate a payment via payment gateway (e.g., Stripe)
 * @route   POST /api/financials/payments/initiate
 * @access  Private (customer, financial_manager, admin)
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.initiatePayment = async (req, res, next) => {
    try {
        const { userId, planId, amount, currency = 'usd' } = req.body;
        
        // Validate required parameters
        if (!userId || !planId || !amount) {
            throw new BadRequestError('Missing required parameters: userId, planId, amount');
        }
        
        // Validate user exists
        const user = await User.findById(userId);
        if (!user) {
            throw new NotFoundError(`User not found with ID: ${userId}`);
        }
        
        // Validate plan exists
        const plan = await SubscriptionPlan.findById(planId);
        if (!plan) {
            throw new NotFoundError(`Subscription plan not found with ID: ${planId}`);
        }

        // Create payment intent with Stripe
        const paymentIntent = await paymentService.createPaymentIntent({
            amount,
            currency,
            userId,
            planId,
            userEmail: user.email
        });
        
        // Create a pending payment record
        const payment = await Payment.create({
            user: userId,
            amount,
            description: `Payment for ${plan.name} plan`,
            status: 'pending',
            paymentMethod: 'credit_card',
            currency,
            transactionId: paymentIntent.intentId,
            gatewayResponse: { clientSecret: paymentIntent.clientSecret }
        });
        
        // Return the client secret to the frontend for completing the payment
        res.status(200).json({
            clientSecret: paymentIntent.clientSecret,
            paymentId: payment._id
        });
        
    } catch (error) {
        console.error('Error initiating payment:', error);
        next(error);
    }
};

/**
 * @desc    Handle payment webhooks from payment gateway (e.g., Stripe)
 * @route   POST /api/financials/payments/webhook
 * @access  Public (called by payment gateway)
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.handlePaymentWebhook = async (req, res, next) => {
    const sig = req.headers['stripe-signature'];
    const rawBody = req.rawBody; // Ensure middleware preserves the raw body
    
    try {
        if (!sig || !rawBody) {
            throw new BadRequestError('Missing webhook signature or request body');
        }
        
        // Verify webhook signature with Stripe
        const event = paymentService.verifyAndConstructEvent(rawBody, sig);
        
        // Handle different webhook events
        switch (event.type) {
            case 'payment_intent.succeeded':
                await handlePaymentSucceeded(event.data.object);
                break;
                
            case 'payment_intent.payment_failed':
                await handlePaymentFailed(event.data.object);
                break;
                
            case 'payment_intent.requires_action':
                await handlePaymentRequiresAction(event.data.object);
                break;
                
            default:
                // Log but do not act on unhandled event types
                console.log(`Unhandled event type: ${event.type}`);
        }
        
        // Return a 200 response to acknowledge receipt of the webhook
        res.status(200).json({ received: true });
        
    } catch (error) {
        console.error('Webhook Error:', error);
        // Return a different error code for signature verification failures
        if (error.message.includes('signature verification failed')) {
            res.status(400).json({ error: 'Invalid signature' });
        } else {
            res.status(400).json({ error: 'Webhook error' });
        }
    }
};

/**
 * @desc    Update a payment status (for manual update by admin/financial_manager)
 * @route   PATCH /api/financials/payments/:id/status
 * @access  Private (financial_manager, admin)
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.updatePaymentStatus = async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;
    
    try {
        // Validate status
        if (!['pending', 'completed', 'failed', 'refunded', 'requires_action'].includes(status)) {
            throw new BadRequestError('Invalid status value');
        }
        
        // Find the payment
        const payment = await Payment.findById(id);
        if (!payment) {
            throw new NotFoundError('Payment not found');
        }
        
        // Store previous status for change tracking
        const previousStatus = payment.status;
        payment.status = status;
        
        // Handle status transitions
        if (previousStatus !== 'completed' && status === 'completed') {
            // If payment is associated with a subscription, link them and activate
            if (payment.userSubscription) {
                const subscription = await UserSubscription.findById(payment.userSubscription);
                if (subscription) {
                    subscription.status = 'active';
                    await subscription.save();
                }
            }
        }
        
        // Save the updated payment
        await payment.save();
        
        res.status(200).json({ message: 'Payment status updated successfully', payment });
        
    } catch (error) {
        console.error('Error updating payment status:', error);
        next(error);
    }
};

// ---- Helper functions for webhook handling -----


/**
 * Handle successful payment from webhook
 * @param {Object} paymentIntent - Payment intent from Stripe
 */
async function handlePaymentSucceeded(paymentIntent) {
    try {
        // Find the payment by transaction ID
        const payment = await Payment.findOne({ transactionId: paymentIntent.id });
        if (!payment) {
            console.error('Payment not found for webhook:', paymentIntent.id);
            return;
        }
        
        // Update payment status
        payment.status = 'completed';
        payment.gatewayResponse = { 
            ...payment.gatewayResponse, 
            paymentIntentId: paymentIntent.id,
            paymentStatus: 'succeeded',
            paymentMethod: paymentIntent.payment_method
        };
        
        await payment.save();
        
        // If payment is for a subscription, create/activate the subscription
        const { userId, planId } = paymentIntent.metadata;
        if (userId && planId) {
            const user = await User.findById(userId);
            const plan = await SubscriptionPlan.findById(planId);
            
            if (user && plan) {
                // Calculate subscription dates based on plan duration
                let durationMonths = 1; // Default to Monthly
                switch (plan.duration) {
                    case 'Quarterly': durationMonths = 3; break;
                    case 'Semi-Annual': durationMonths = 6; break;
                    case 'Annual': durationMonths = 12; break;
                }
                
                const startDate = new Date();
                const endDate = addMonths(startDate, durationMonths);
                
                // Create new subscription or find existing pending one
                let subscription = await UserSubscription.findOne({
                    user: userId,
                    subscriptionPlan: planId,
                    status: 'pending'
                });
                
                if (subscription) {
                    // Update existing pending subscription
                    subscription.status = 'active';
                    subscription.startDate = startDate;
                    subscription.endDate = endDate;
                    subscription.nextBillingDate = endDate;
                } else {
                    // Create new subscription
                    subscription = new UserSubscription({
                        user: userId,
                        subscriptionPlan: planId,
                        startDate,
                        endDate,
                        status: 'active',
                        autoRenew: true,
                        lastBillingDate: startDate,
                        nextBillingDate: endDate
                    });
                }
                
                await subscription.save();
                
                // Link payment to subscription
                payment.userSubscription = subscription._id;
                await payment.save();
                
                // Increment subscriber count on the plan
                await SubscriptionPlan.findByIdAndUpdate(planId, { 
                    $inc: { subscriberCount: 1 } 
                });
            }
        }
    } catch (error) {
        console.error('Error handling payment success webhook:', error);
    }
}

/**
 * Handle failed payment from webhook
 * @param {Object} paymentIntent - Payment intent from Stripe
 */
async function handlePaymentFailed(paymentIntent) {
    try {
        // Find the payment by transaction ID
        const payment = await Payment.findOne({ transactionId: paymentIntent.id });
        if (!payment) {
            console.error('Payment not found for webhook:', paymentIntent.id);
            return;
        }
        
        // Update payment status
        payment.status = 'failed';
        payment.gatewayResponse = { 
            ...payment.gatewayResponse, 
            paymentIntentId: paymentIntent.id,
            paymentStatus: 'failed',
            lastError: paymentIntent.last_payment_error
        };
        
        await payment.save();
        
    } catch (error) {
        console.error('Error handling payment failed webhook:', error);
    }
}

/**
 * Handle payment requires additional action
 * @param {Object} paymentIntent - Payment intent from Stripe
 */
async function handlePaymentRequiresAction(paymentIntent) {
    try {
        // Find the payment by transaction ID
        const payment = await Payment.findOne({ transactionId: paymentIntent.id });
        if (!payment) {
            console.error('Payment not found for webhook:', paymentIntent.id);
            return;
        }
        
        // Update payment status
        payment.status = 'requires_action';
        payment.gatewayResponse = { 
            ...payment.gatewayResponse, 
            paymentIntentId: paymentIntent.id,
            paymentStatus: 'requires_action',
            nextAction: paymentIntent.next_action
        };
        
        await payment.save();
        
    } catch (error) {
        console.error('Error handling payment requires action webhook:', error);
    }
}

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
