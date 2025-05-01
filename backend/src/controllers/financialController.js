const mongoose = require('mongoose'); // Import mongoose
const Expense = require('../models/Expense');
const Payment = require('../models/Payment');
const UserSubscription = require('../models/UserSubscription'); // Added
const SubscriptionPlan = require('../models/SubscriptionPlan'); // Added
const User = require('../models/User'); // Ensure User model is imported
const ApiError = require('../errors/ApiError');
const BadRequestError = require('../errors/BadRequestError'); // Added for date validation

// Helper function to determine date range based on 'range' parameter
const getReportDateRange = (range, queryStartDate, queryEndDate) => {
    let startDate, endDate = new Date(); // Default end date to now

    if (queryStartDate && queryEndDate) {
        startDate = new Date(queryStartDate);
        endDate = new Date(queryEndDate);
        endDate.setHours(23, 59, 59, 999); // Include the whole end day
    } else {
        endDate.setHours(23, 59, 59, 999); // Set end time for today
        switch(range) {
            case 'last3months':
                startDate = new Date();
                // Go back 3 months from the *current* month's start date
                startDate.setMonth(startDate.getMonth() - 3);
                startDate.setDate(1); // Set to the 1st day of that month
                startDate.setHours(0, 0, 0, 0); // Set to the beginning of the day
                break;
            case 'year':
                startDate = new Date(endDate.getFullYear(), 0, 1); // Start from Jan 1st of the current year
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'month':
            default: // Default to 'month'
                startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1); // Start from the 1st of the current month
                startDate.setHours(0, 0, 0, 0);
                break;
        }
    }

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new BadRequestError('Invalid date format provided');
    }
    
    // Ensure start date is not after end date
    if (startDate > endDate) {
        throw new BadRequestError('Start date cannot be after end date');
    }

    return { startDate, endDate };
};


exports.getDashboardData = async (req, res, next) => {
  try {
    const { range = 'month', startDate: queryStartDate, endDate: queryEndDate } = req.query; // Get range or specific dates

    // Determine the date range for the report
    const { startDate, endDate } = getReportDateRange(range, queryStartDate, queryEndDate);

    // --- Aggregate Financial Summary ---
    // 1. Total Revenue (Completed Payments)
    const incomeResult = await Payment.aggregate([
      { $match: { paymentDate: { $gte: startDate, $lte: endDate }, status: 'completed' } },
      { $group: { _id: null, totalIncome: { $sum: '$amount' } } }
    ]);
    const totalRevenue = incomeResult.length > 0 ? incomeResult[0].totalIncome : 0;

    // 2. Total Expenses
    const expenseResult = await Expense.aggregate([
      { $match: { date: { $gte: startDate, $lte: endDate } } }, // Assuming 'date' field for expenses
      { $group: { _id: null, totalExpenses: { $sum: '$amount' } } }
    ]);
    const totalExpenses = expenseResult.length > 0 ? expenseResult[0].totalExpenses : 0;

    // 3. Net Profit
    const netProfit = totalRevenue - totalExpenses;

    // --- Aggregate Subscription Data ---
    // 4. Active Subscriptions Count (using UserSubscription model)
    const activeSubscriptions = await UserSubscription.countDocuments({ 
        status: 'active', 
        // Optional: Add date range filter if activation/expiry dates are relevant
        // startDate: { $lte: endDate }, 
        // $or: [{ endDate: { $gte: startDate } }, { endDate: null }] 
    });

    // 5. New Subscriptions in the period (based on UserSubscription start date)
    const newSubscriptions = await UserSubscription.countDocuments({
        startDate: { $gte: startDate, $lte: endDate } // Use startDate field
    });

    // --- Aggregate Revenue/Expense Breakdowns ---
    // 6. Revenue by Subscription Plan
    const revenueByPlan = await Payment.aggregate([
        { $match: { paymentDate: { $gte: startDate, $lte: endDate }, status: 'completed', userSubscription: { $exists: true } } },
        { $lookup: { // Join with UserSubscription to get plan details
            from: 'usersubscriptions', // collection name
            localField: 'userSubscription',
            foreignField: '_id',
            as: 'subDetails'
        }},
        { $unwind: '$subDetails' }, // Deconstruct the subDetails array
        { $lookup: { // Join with SubscriptionPlan to get plan name
            from: 'subscriptionplans', // collection name
            localField: 'subDetails.subscriptionPlan',
            foreignField: '_id',
            as: 'planDetails'
        }},
        { $unwind: '$planDetails' }, // Deconstruct the planDetails array
        { $group: {
            _id: '$planDetails._id', // Group by plan ID
            planName: { $first: '$planDetails.name' }, // Get the plan name
            revenue: { $sum: '$amount' }, // Sum revenue per plan
            count: { $sum: 1 } // Count payments per plan (might differ from subscriber count)
        }},
        { $project: { // Reshape the output
            _id: 0, // Exclude default _id
            planName: 1,
            revenue: 1,
            count: 1 // This is payment count, not subscriber count for the plan
        }},
        { $sort: { revenue: -1 } } // Sort by revenue descending
    ]);

    // 7. Expenses by Category
    const expensesByCategory = await Expense.aggregate([
        { $match: { date: { $gte: startDate, $lte: endDate } } },
        { $group: {
            _id: '$category', // Group by category field
            total: { $sum: '$amount' } // Sum expenses per category
        }},
        { $project: { // Reshape the output
            _id: 0, // Exclude default _id
            category: '$_id', // Rename _id to category
            total: 1
        }},
        { $sort: { total: -1 } } // Sort by total descending
    ]);

    // --- Fetch Recent Transactions ---
    // 8. Recent Payments (limit 5-10)
    const recentPayments = await Payment.find({ paymentDate: { $gte: startDate, $lte: endDate }, status: 'completed' })
        .populate('user', 'name') // Populate user name
        .sort({ paymentDate: -1 })
        .limit(5) // Limit the results
        .select('paymentDate user description amount status'); // Select specific fields

    // 9. Recent Expenses (limit 5-10)
    const recentExpenses = await Expense.find({ date: { $gte: startDate, $lte: endDate } })
        .sort({ date: -1 })
        .limit(5)
        .select('date category description amount status'); // Select specific fields

    // --- Fetch Subscription Plan Overview ---
    // 10. Fetch all Subscription Plans details for the subscription tab
    const subscriptionPlans = await SubscriptionPlan.find({})
        .select('name price duration _id') // Select necessary fields
        .lean(); // Use lean for plain JS objects

    // Add subscriber count to each plan (requires another query)
    for (const plan of subscriptionPlans) {
        // FIX: Use the correct field 'subscriptionPlan' instead of 'plan'
        plan.subscriberCount = await UserSubscription.countDocuments({ subscriptionPlan: plan._id, status: 'active' });
    }
    
    // --- Prepare Trend Data (Example: Monthly Revenue/Expenses for 'year' range) ---
    let revenueTrend = [];
    let expenseTrend = [];

    // This is a simplified example for monthly trends if range is 'year' or 'last3months'
    // For 'month' range, you might want daily trends.
    // This requires more complex aggregation based on the specific 'range'.
    if (range === 'year' || range === 'last3months') {
        const monthFormat = '%Y-%m'; // Group by year-month
        revenueTrend = await Payment.aggregate([
            { $match: { paymentDate: { $gte: startDate, $lte: endDate }, status: 'completed' } },
            { $group: {
                _id: { $dateToString: { format: monthFormat, date: '$paymentDate' } },
                total: { $sum: '$amount' }
            }},
            { $sort: { _id: 1 } }, // Sort by month
            { $project: { _id: 0, month: '$_id', total: 1 } }
        ]);
        expenseTrend = await Expense.aggregate([
            { $match: { date: { $gte: startDate, $lte: endDate } } },
            { $group: {
                _id: { $dateToString: { format: monthFormat, date: '$date' } },
                total: { $sum: '$amount' }
            }},
            { $sort: { _id: 1 } }, // Sort by month
            { $project: { _id: 0, month: '$_id', total: 1 } }
        ]);
    } else if (range === 'month') {
        // Example for daily trend within the month
        const dayFormat = '%Y-%m-%d'; // Group by year-month-day
         revenueTrend = await Payment.aggregate([
            { $match: { paymentDate: { $gte: startDate, $lte: endDate }, status: 'completed' } },
            { $group: {
                _id: { $dateToString: { format: dayFormat, date: '$paymentDate' } },
                total: { $sum: '$amount' }
            }},
            { $sort: { _id: 1 } }, // Sort by day
            { $project: { _id: 0, day: '$_id', total: 1 } } // Use 'day' or similar key
        ]);
        expenseTrend = await Expense.aggregate([
            { $match: { date: { $gte: startDate, $lte: endDate } } },
            { $group: {
                _id: { $dateToString: { format: dayFormat, date: '$date' } },
                total: { $sum: '$amount' }
            }},
            { $sort: { _id: 1 } }, // Sort by day
            { $project: { _id: 0, day: '$_id', total: 1 } } // Use 'day' or similar key
        ]);
    }


    // --- Assemble Dashboard Data ---
    // Structure the response exactly as the frontend expects
    
    // Helper to format date as YYYY-MM-DD in the server's local timezone
    const formatDateForResponse = (date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // JS months are 0-indexed
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const dashboardData = {
        summary: {
            totalRevenue,
            totalExpenses,
            netProfit,
            activeSubscriptions,
            newSubscriptions
        },
        revenueByPlan, // Already fetched
        expensesByCategory, // Already fetched
        trends: {
            revenue: revenueTrend,
            expenses: expenseTrend
        },
        subscriptionPlans, // Fetched and enriched with subscriber counts
        recentTransactions: {
            payments: recentPayments.map(p => ({ // Format to match frontend if needed
                id: p._id,
                date: p.paymentDate,
                customer: p.user?.name || 'N/A', // Handle potential missing user
                description: p.description,
                amount: p.amount,
                status: p.status
            })),
            expenses: recentExpenses.map(e => ({ // Format to match frontend if needed
                id: e._id,
                date: e.date,
                category: e.category,
                description: e.description,
                amount: e.amount,
                status: e.status // Assuming Expense model has status
            }))
        },
        // Include the date range used for clarity - Use local timezone formatting
        dateRange: { 
            startDate: formatDateForResponse(startDate), 
            endDate: formatDateForResponse(endDate) 
        }
    };

    res.status(200).json(dashboardData); // Send the structured data directly

  } catch (error) {
    console.error('Error fetching financial dashboard data:', error);
    // Pass error to the centralized error handler
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
        // Destructure new filters from query
        const { page = 1, limit = 10, status, userId, planId, startDate, endDate, customerName, paymentMethod } = req.query;
        const query = {};

        if (status) query.status = status;
        if (userId) {
            if (!mongoose.Types.ObjectId.isValid(userId)) throw new BadRequestError('Invalid userId format');
            query.user = new mongoose.Types.ObjectId(userId); // Ensure it's an ObjectId
        }
        // Add paymentMethod filter
        if (paymentMethod) query.paymentMethod = paymentMethod;

        // Handle date range filtering
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) throw new BadRequestError('Invalid date format');
            end.setHours(23, 59, 59, 999);
            query.paymentDate = { $gte: start, $lte: end };
        } else if (startDate) {
            const start = new Date(startDate);
            if (isNaN(start.getTime())) throw new BadRequestError('Invalid start date format');
            query.paymentDate = { $gte: start };
        } else if (endDate) {
            const end = new Date(endDate);
            if (isNaN(end.getTime())) throw new BadRequestError('Invalid end date format');
            end.setHours(23, 59, 59, 999);
            query.paymentDate = { $lte: end };
        }

        // Start aggregation pipeline
        let aggregationPipeline = [];

        // Initial match stage based on basic filters
        if (Object.keys(query).length > 0) {
             aggregationPipeline.push({ $match: query });
        }


        // Handle customerName filtering using aggregation if necessary
        if (customerName) {
            // Find user IDs matching the customer name (case-insensitive)
            const users = await User.find({ name: { $regex: customerName, $options: 'i' } }).select('_id');
            const userIds = users.map(user => user._id);
            // Add a match stage to filter payments by these user IDs
            // Ensure this match happens *after* the initial query match if both exist
            aggregationPipeline.push({ $match: { user: { $in: userIds } } });
        }

        // Add lookup stages to populate related data
        aggregationPipeline.push(
            {
                $lookup: {
                    from: "users", // collection name
                    localField: "user",
                    foreignField: "_id",
                    as: "userData" // Changed from userDetails
                }
            },
            {
                $unwind: { // Use unwind instead of directly accessing [0] if you expect only one user
                    path: "$userData",
                    preserveNullAndEmptyArrays: true // Keep payment even if user is somehow missing
                }
            },
            {
                $lookup: {
                    from: "usersubscriptions", // collection name
                    localField: "userSubscription",
                    foreignField: "_id",
                    as: "subscriptionData" // Changed from userSubscriptionDetails
                }
            },
            {
                $unwind: {
                    path: "$subscriptionData",
                    preserveNullAndEmptyArrays: true // Keep payment even if subscription is missing
                }
            },
            {
                $lookup: {
                    from: "subscriptionplans", // collection name
                    localField: "subscriptionData.subscriptionPlan", // Use the field from the unwound subscriptionData
                    foreignField: "_id",
                    as: "planData"
                }
            },
            {
                $unwind: {
                    path: "$planData",
                    preserveNullAndEmptyArrays: true // Keep payment even if plan is missing
                }
            },
             // Project the desired fields, renaming/restructuring as needed
            {
                $project: {
                    // Include original payment fields
                    _id: 1,
                    amount: 1,
                    description: 1,
                    paymentDate: 1,
                    status: 1,
                    paymentMethod: 1,
                    currency: 1,
                    invoiceNumber: 1,
                    transactionId: 1,
                    // Add populated data, handling potential nulls from preserveNullAndEmptyArrays
                    user: { // Keep the user field structure expected by frontend
                        _id: "$userData._id",
                        name: "$userData.name",
                        email: "$userData.email"
                        // Add other user fields if needed
                    },
                    userSubscription: { // Keep subscription structure
                         _id: "$subscriptionData._id",
                         status: "$subscriptionData.status",
                         // Add plan details directly inside subscription if needed, or keep separate
                         plan: {
                             _id: "$planData._id",
                             name: "$planData.name",
                             price: "$planData.price"
                             // Add other plan fields if needed
                         }
                         // Add other subscription fields if needed
                    },
                    // Remove intermediate lookup fields if not needed
                    // userData: 0, // Optional: remove intermediate fields
                    // subscriptionData: 0,
                    // planData: 0
                }
            }
        );

        // Define pagination options
        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            sort: { paymentDate: -1 }, // Default sort
            lean: true // Use lean for better performance with aggregation
        };

        // Create the aggregate object
        const aggregate = Payment.aggregate(aggregationPipeline);

        // Execute aggregation with pagination
        const payments = await Payment.aggregatePaginate(aggregate, options);

        res.status(200).json(payments);

    } catch (error) {
        console.error('Error fetching payments:', error); // Log the specific error
        next(error); // Pass error to the centralized handler
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

/**
 * @desc    Export financial report as PDF
 * @route   GET /api/financials/reports/export
 * @access  Private (financial_manager, admin)
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.exportReport = async (req, res, next) => {
    try {
        const { range = 'month', startDate, endDate } = req.query;
        const PDFDocument = require('pdfkit');
        
        // Create a PDF document
        const doc = new PDFDocument({
            margin: 50,
            size: 'A4'
        });
        
        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=financial-report-${range}-${new Date().toISOString().split('T')[0]}.pdf`);
        
        // Pipe the PDF to the response
        doc.pipe(res);
        
        // Calculate date range based on the provided range parameter or specific dates
        let reportStartDate, reportEndDate = new Date();
        reportEndDate.setHours(23, 59, 59, 999);
        
        if (startDate && endDate) {
            reportStartDate = new Date(startDate);
            reportEndDate = new Date(endDate);
            reportEndDate.setHours(23, 59, 59, 999);
        } else {
            // Use the range parameter if specific dates not provided
            switch(range) {
                case 'last3months':
                    reportStartDate = new Date();
                    reportStartDate.setMonth(reportStartDate.getMonth() - 3);
                    reportStartDate.setDate(1);
                    reportStartDate.setHours(0, 0, 0, 0);
                    break;
                case 'year':
                    reportStartDate = new Date(reportEndDate.getFullYear(), 0, 1);
                    reportStartDate.setHours(0, 0, 0, 0);
                    break;
                case 'month':
                default:
                    reportStartDate = new Date(reportEndDate.getFullYear(), reportEndDate.getMonth(), 1);
                    reportStartDate.setHours(0, 0, 0, 0);
                    break;
            }
        }
        
        if (isNaN(reportStartDate.getTime()) || isNaN(reportEndDate.getTime())) {
            throw new BadRequestError('Invalid date format');
        }
        
        // Fetch data necessary for the report
        
        // 1. Total Revenue 
        const revenueData = await Payment.aggregate([
            { $match: { paymentDate: { $gte: reportStartDate, $lte: reportEndDate }, status: 'completed' } },
            { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
        ]);
        const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

        // 2. Total Expenses
        const expenseData = await Expense.aggregate([
            { $match: { date: { $gte: reportStartDate, $lte: reportEndDate } } },
            { $group: { _id: null, totalExpenses: { $sum: '$amount' } } }
        ]);
        const totalExpenses = expenseData.length > 0 ? expenseData[0].totalExpenses : 0;

        // 3. Net Profit
        const netProfit = totalRevenue - totalExpenses;
        
        // 4. Expenses by Category
        const expensesByCategory = await Expense.aggregate([
            { $match: { date: { $gte: reportStartDate, $lte: reportEndDate } } },
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
        
        // 5. Revenue by Plan
        const revenueByPlan = await Payment.aggregate([
            { $match: { paymentDate: { $gte: reportStartDate, $lte: reportEndDate }, status: 'completed', userSubscription: { $exists: true } } },
            { $lookup: { // Join with UserSubscription to get plan details
                from: 'usersubscriptions',
                localField: 'userSubscription',
                foreignField: '_id',
                as: 'subDetails'
            }},
            { $unwind: '$subDetails' },
            { $lookup: { // Join with SubscriptionPlan to get plan name
                from: 'subscriptionplans',
                localField: 'subDetails.subscriptionPlan',
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
                planName: '$_id',
                revenue: '$totalAmount',
                count: 1
            }},
            { $sort: { revenue: -1 } }
        ]);
        
        // 6. Recent Transactions
        const recentPayments = await Payment.find({ paymentDate: { $gte: reportStartDate, $lte: reportEndDate } })
            .populate('user', 'name email')
            .sort({ paymentDate: -1 })
            .limit(10)
            .select('paymentDate user description amount status');
        
        const recentExpenses = await Expense.find({ date: { $gte: reportStartDate, $lte: reportEndDate } })
            .sort({ date: -1 })
            .limit(10)
            .select('date category description amount');
        
        // Format dates for display
        const formatDate = (date) => {
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        };
        
        // Format currency values
        const formatCurrency = (amount) => {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(amount);
        };
        
        // PDF Generation - Header
        doc.font('Helvetica-Bold').fontSize(18).text('SmartBin Financial Report', { align: 'center' });
        doc.moveDown();
        
        const reportRangeText = startDate && endDate 
            ? `${formatDate(reportStartDate)} to ${formatDate(reportEndDate)}`
            : range === 'month' ? 'Current Month'
            : range === 'last3months' ? 'Last 3 Months'
            : 'Current Year';
            
        doc.fontSize(12).text(`Report Period: ${reportRangeText}`, { align: 'center' });
        doc.moveDown();
        doc.text(`Generated on: ${formatDate(new Date())}`, { align: 'center' });
        doc.moveDown(2);
        
        // Financial Summary Section
        doc.font('Helvetica-Bold').fontSize(14).text('Financial Summary');
        doc.moveDown();
        
        // Draw summary box
        doc.font('Helvetica').fontSize(11);
        const summaryData = [
            ['Total Revenue', formatCurrency(totalRevenue)],
            ['Total Expenses', formatCurrency(totalExpenses)],
            ['Net Profit', formatCurrency(netProfit)],
            ['Profit Margin', totalRevenue > 0 ? `${((netProfit / totalRevenue) * 100).toFixed(2)}%` : '0.00%']
        ];
        
        // Draw summary table
        const summaryTableTop = doc.y;
        doc.moveDown(0.5);
        let summaryTableY = doc.y;
        
        summaryData.forEach((row, i) => {
            doc.font(i === 2 ? 'Helvetica-Bold' : 'Helvetica');
            doc.text(row[0], 100, summaryTableY, { width: 150 });
            doc.text(row[1], 250, summaryTableY, { width: 150, align: 'right' });
            summaryTableY += 25;
        });
        
        doc.rect(90, summaryTableTop, 320, summaryTableY - summaryTableTop).stroke();
        doc.moveDown(2);
        
        // Expenses by Category Section
        if (expensesByCategory.length > 0) {
            doc.font('Helvetica-Bold').fontSize(14).text('Expenses by Category');
            doc.moveDown();
            
            // Draw expenses table
            const expenseTableTop = doc.y;
            
            // Table header
            doc.font('Helvetica-Bold').fontSize(10);
            doc.text('Category', 100, doc.y, { width: 150 });
            doc.text('Amount', 250, doc.y, { width: 150, align: 'right' });
            doc.moveDown();
            
            let expenseTableY = doc.y;
            
            // Table rows
            doc.font('Helvetica').fontSize(10);
            expensesByCategory.forEach((expense, i) => {
                const category = expense.category.charAt(0).toUpperCase() + expense.category.slice(1);
                doc.text(category, 100, expenseTableY, { width: 150 });
                doc.text(formatCurrency(expense.total), 250, expenseTableY, { width: 150, align: 'right' });
                expenseTableY += 20;
                
                if (expenseTableY > 700) { // Check if we need a new page
                    doc.addPage();
                    expenseTableY = 50;
                    doc.font('Helvetica-Bold').fontSize(14).text('Expenses by Category (Continued)');
                    doc.moveDown();
                    doc.font('Helvetica').fontSize(10);
                }
            });
            
            doc.rect(90, expenseTableTop, 320, expenseTableY - expenseTableTop).stroke();
            doc.moveDown(2);
        }
        
        // Revenue by Plan Section
        if (revenueByPlan.length > 0) {
            // Check if we need a new page
            if (doc.y > 650) {
                doc.addPage();
            }
            
            doc.font('Helvetica-Bold').fontSize(14).text('Revenue by Subscription Plan');
            doc.moveDown();
            
            // Draw revenue table
            const revenueTableTop = doc.y;
            
            // Table header
            doc.font('Helvetica-Bold').fontSize(10);
            doc.text('Plan Name', 100, doc.y, { width: 150 });
            doc.text('Revenue', 250, doc.y, { width: 100, align: 'right' });
            doc.text('Subscribers', 350, doc.y, { width: 80, align: 'right' });
            doc.moveDown();
            
            let revenueTableY = doc.y;
            
            // Table rows
            doc.font('Helvetica').fontSize(10);
            revenueByPlan.forEach((plan) => {
                doc.text(plan.planName, 100, revenueTableY, { width: 150 });
                doc.text(formatCurrency(plan.revenue), 250, revenueTableY, { width: 100, align: 'right' });
                doc.text(plan.count.toString(), 350, revenueTableY, { width: 80, align: 'right' });
                revenueTableY += 20;
                
                if (revenueTableY > 700) { // Check if we need a new page
                    doc.addPage();
                    revenueTableY = 50;
                    doc.font('Helvetica-Bold').fontSize(14).text('Revenue by Subscription Plan (Continued)');
                    doc.moveDown();
                    doc.font('Helvetica').fontSize(10);
                }
            });
            
            doc.rect(90, revenueTableTop, 340, revenueTableY - revenueTableTop).stroke();
            doc.moveDown(2);
        }
        
        // Recent Transactions Section
        if (recentPayments.length > 0 || recentExpenses.length > 0) {
            // Check if we need a new page
            if (doc.y > 600) {
                doc.addPage();
            }
            
            doc.font('Helvetica-Bold').fontSize(14).text('Recent Transactions');
            doc.moveDown();
            
            // Recent Payments
            if (recentPayments.length > 0) {
                doc.font('Helvetica-Bold').fontSize(12).text('Recent Payments');
                doc.moveDown();
                
                // Table header
                doc.font('Helvetica-Bold').fontSize(10);
                doc.text('Date', 50, doc.y, { width: 90 });
                doc.text('Customer', 140, doc.y, { width: 100 });
                doc.text('Description', 240, doc.y, { width: 150 });
                doc.text('Amount', 390, doc.y, { width: 80, align: 'right' });
                doc.moveDown();
                
                let paymentsTableY = doc.y;
                
                // Table rows
                doc.font('Helvetica').fontSize(9);
                recentPayments.forEach((payment) => {
                    doc.text(formatDate(payment.paymentDate), 50, paymentsTableY, { width: 90 });
                    doc.text(payment.user?.name || 'N/A', 140, paymentsTableY, { width: 100 });
                    doc.text(payment.description || 'N/A', 240, paymentsTableY, { width: 150 });
                    doc.text(formatCurrency(payment.amount), 390, paymentsTableY, { width: 80, align: 'right' });
                    paymentsTableY += 20;
                    
                    if (paymentsTableY > 700) { // Check if we need a new page
                        doc.addPage();
                        paymentsTableY = 50;
                        doc.font('Helvetica-Bold').fontSize(12).text('Recent Payments (Continued)');
                        doc.moveDown();
                        doc.font('Helvetica').fontSize(9);
                    }
                });
                
                doc.moveDown(2);
            }
            
            // Recent Expenses
            if (recentExpenses.length > 0) {
                // Check if we need a new page
                if (doc.y > 600) {
                    doc.addPage();
                }
                
                doc.font('Helvetica-Bold').fontSize(12).text('Recent Expenses');
                doc.moveDown();
                
                // Table header
                doc.font('Helvetica-Bold').fontSize(10);
                doc.text('Date', 50, doc.y, { width: 90 });
                doc.text('Category', 140, doc.y, { width: 100 });
                doc.text('Description', 240, doc.y, { width: 150 });
                doc.text('Amount', 390, doc.y, { width: 80, align: 'right' });
                doc.moveDown();
                
                let expensesTableY = doc.y;
                
                // Table rows
                doc.font('Helvetica').fontSize(9);
                recentExpenses.forEach((expense) => {
                    doc.text(formatDate(expense.date), 50, expensesTableY, { width: 90 });
                    const category = expense.category.charAt(0).toUpperCase() + expense.category.slice(1);
                    doc.text(category, 140, expensesTableY, { width: 100 });
                    doc.text(expense.description || 'N/A', 240, expensesTableY, { width: 150 });
                    doc.text(formatCurrency(expense.amount), 390, expensesTableY, { width: 80, align: 'right' });
                    expensesTableY += 20;
                    
                    if (expensesTableY > 700) { // Check if we need a new page
                        doc.addPage();
                        expensesTableY = 50;
                        doc.font('Helvetica-Bold').fontSize(12).text('Recent Expenses (Continued)');
                        doc.moveDown();
                        doc.font('Helvetica').fontSize(9);
                    }
                });
            }
        }
        
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
        console.error('Error generating financial report:', error);
        next(error);
    }
};

/**
 * @desc    Get profit and loss report data
 * @route   GET /api/financials/reports/profit-loss
 * @access  Private (financial_manager, admin)
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.getProfitLossReport = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            throw new BadRequestError('Start and end dates are required');
        }
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Include all of end date
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new BadRequestError('Invalid date format');
        }
        
        // Calculate total revenue
        const revenueData = await Payment.aggregate([
            { $match: { paymentDate: { $gte: start, $lte: end }, status: 'completed' } },
            { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
        ]);
        const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
        
        // Calculate total expenses
        const expenseData = await Expense.aggregate([
            { $match: { date: { $gte: start, $lte: end } } },
            { $group: { _id: null, totalExpenses: { $sum: '$amount' } } }
        ]);
        const totalExpenses = expenseData.length > 0 ? expenseData[0].totalExpenses : 0;
        
        // Calculate net profit
        const netProfit = totalRevenue - totalExpenses;
        
        // Get monthly trends for the period
        // First, we need to find all the months within the date range
        const months = [];
        const currentDate = new Date(start);
        while (currentDate <= end) {
            months.push({
                year: currentDate.getFullYear(),
                month: currentDate.getMonth()
            });
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
        
        // Get monthly revenue
        const monthlyRevenue = await Payment.aggregate([
            { 
                $match: { 
                    paymentDate: { $gte: start, $lte: end },
                    status: 'completed'
                } 
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$paymentDate" },
                        month: { $month: "$paymentDate" }
                    },
                    revenue: { $sum: "$amount" }
                }
            }
        ]);
        
        // Get monthly expenses
        const monthlyExpenses = await Expense.aggregate([
            { 
                $match: { 
                    date: { $gte: start, $lte: end }
                } 
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                        month: { $month: "$date" }
                    },
                    expenses: { $sum: "$amount" }
                }
            }
        ]);
        
        // Create a map of monthly data
        const monthlyMap = new Map();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        months.forEach(m => {
            const monthKey = `${m.year}-${m.month}`;
            monthlyMap.set(monthKey, {
                month: `${monthNames[m.month]} ${m.year}`,
                revenue: 0,
                expenses: 0,
                profit: 0
            });
        });
        
        monthlyRevenue.forEach(m => {
            const monthKey = `${m._id.year}-${m._id.month - 1}`; // MongoDB months are 1-12, JS are 0-11
            if (monthlyMap.has(monthKey)) {
                const data = monthlyMap.get(monthKey);
                data.revenue = m.revenue;
                data.profit = data.revenue - data.expenses;
                monthlyMap.set(monthKey, data);
            }
        });
        
        monthlyExpenses.forEach(m => {
            const monthKey = `${m._id.year}-${m._id.month - 1}`; // MongoDB months are 1-12, JS are 0-11
            if (monthlyMap.has(monthKey)) {
                const data = monthlyMap.get(monthKey);
                data.expenses = m.expenses;
                data.profit = data.revenue - data.expenses;
                monthlyMap.set(monthKey, data);
            }
        });
        
        // Convert map to array and sort by date
        const monthlyData = Array.from(monthlyMap.values());
        
        res.status(200).json({
            summary: {
                totalRevenue,
                totalExpenses,
                netProfit,
                profitMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
            },
            monthlyData
        });
        
    } catch (error) {
        console.error('Error generating profit/loss report:', error);
        next(error);
    }
};

/**
 * @desc    Get revenue by customer report
 * @route   GET /api/financials/reports/revenue-by-customer
 * @access  Private (financial_manager, admin)
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.getRevenueByCustomerReport = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            throw new BadRequestError('Start and end dates are required');
        }
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Include all of end date
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new BadRequestError('Invalid date format');
        }
        
        // Get customers with payments
        const customerRevenue = await Payment.aggregate([
            { 
                $match: { 
                    paymentDate: { $gte: start, $lte: end },
                    status: 'completed'
                } 
            },
            { 
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            {
                $unwind: '$userDetails'
            },
            {
                $group: {
                    _id: '$user',
                    name: { $first: '$userDetails.name' },
                    email: { $first: '$userDetails.email' },
                    revenue: { $sum: '$amount' },
                    orders: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    name: 1,
                    email: 1,
                    revenue: 1,
                    orders: 1,
                    averageOrder: { $divide: ['$revenue', '$orders'] }
                }
            },
            {
                $sort: { revenue: -1 }
            }
        ]);
        
        // Calculate summary statistics
        const totalRevenue = customerRevenue.reduce((sum, customer) => sum + customer.revenue, 0);
        const totalCustomers = customerRevenue.length;
        const averageRevenue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
        
        res.status(200).json({
            totalRevenue,
            totalCustomers,
            averageRevenue,
            customers: customerRevenue
        });
        
    } catch (error) {
        console.error('Error generating revenue by customer report:', error);
        next(error);
    }
};

/**
 * @desc    Get expense details report
 * @route   GET /api/financials/reports/expense-details
 * @access  Private (financial_manager, admin)
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.getExpenseDetailsReport = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            throw new BadRequestError('Start and end dates are required');
        }
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Include all of end date
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new BadRequestError('Invalid date format');
        }
        
        // Get total expenses
        const totalExpensesResult = await Expense.aggregate([
            { $match: { date: { $gte: start, $lte: end } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalExpenses = totalExpensesResult.length > 0 ? totalExpensesResult[0].total : 0;
        
        // Get expenses by category
        const expensesByCategory = await Expense.aggregate([
            { $match: { date: { $gte: start, $lte: end } } },
            { 
                $group: {
                    _id: '$category',
                    amount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    category: '$_id',
                    amount: 1,
                    count: 1,
                    percentage: { 
                        $multiply: [
                            { $divide: ['$amount', totalExpenses] }, 
                            100
                        ]
                    }
                }
            },
            { $sort: { amount: -1 } }
        ]);
        
        // Get monthly expense trend
        const monthlyExpenses = await Expense.aggregate([
            { $match: { date: { $gte: start, $lte: end } } },
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                        month: { $month: "$date" }
                    },
                    amount: { $sum: "$amount" }
                }
            },
            {
                $project: {
                    _id: 0,
                    year: '$_id.year',
                    month: '$_id.month',
                    amount: 1
                }
            },
            { $sort: { year: 1, month: 1 } }
        ]);
        
        // Format month names
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formattedMonthlyExpenses = monthlyExpenses.map(item => ({
            month: `${monthNames[item.month - 1]} ${item.year}`,
            amount: item.amount
        }));
        
        // Get expense details
        const expenses = await Expense.find({ date: { $gte: start, $lte: end } })
            .sort({ date: -1 })
            .limit(100); // Limit to prevent too large responses
        
        res.status(200).json({
            totalExpenses,
            expensesByCategory,
            monthlyExpenses: formattedMonthlyExpenses,
            expenses: expenses.map(e => ({
                id: e._id,
                date: e.date,
                category: e.category,
                description: e.description,
                amount: e.amount
            }))
        });
        
    } catch (error) {
        console.error('Error generating expense details report:', error);
        next(error);
    }
};
