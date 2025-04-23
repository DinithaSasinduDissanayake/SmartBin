const Expense = require('../models/Expense');
const Payment = require('../models/Payment');
const UserSubscription = require('../models/UserSubscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const User = require('../models/User');
const mongoose = require('mongoose');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const ApiError = require('../errors/ApiError');

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
        let startDate, endDate = new Date();

        // Determine date range
        switch (range) {
            case 'last3months':
                startDate = new Date();
                startDate.setMonth(startDate.getMonth() - 3);
                startDate.setDate(1); // Start from the beginning of the month 3 months ago
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'year':
                startDate = new Date(endDate.getFullYear(), 0, 1); // Start of current year
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'month':
            default:
                startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1); // Start of current month
                startDate.setHours(0, 0, 0, 0);
                break;
        }
        endDate.setHours(23, 59, 59, 999); // End of today

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

        // 6. Revenue Breakdown by Plan (Optional - can be complex)
        const revenueByPlan = await Payment.aggregate([
            { $match: { paymentDate: { $gte: startDate, $lte: endDate }, status: 'completed', userSubscription: { $exists: true } } },
            { $lookup: { // Join with UserSubscription
                from: 'usersubscriptions',
                localField: 'userSubscription',
                foreignField: '_id',
                as: 'subDetails'
            }},
            { $unwind: '$subDetails' },
            { $lookup: { // Join with SubscriptionPlan
                from: 'subscriptionplans',
                localField: 'subDetails.plan',
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
                totalAmount: 1,
                count: 1
            }},
            { $sort: { totalAmount: -1 } }
        ]);

        // 7. Recent Payments (limit 5)
        const recentPayments = await Payment.find({ paymentDate: { $gte: startDate, $lte: endDate } })
            .populate('user', 'name email')
            .sort({ paymentDate: -1 })
            .limit(5);

        // 8. Recent Expenses (limit 5)
        const recentExpenses = await Expense.find({ date: { $gte: startDate, $lte: endDate } })
            .sort({ date: -1 })
            .limit(5);

        // --- Assemble Dashboard Data ---
        const dashboardData = {
            summary: {
                totalRevenue,
                totalExpenses,
                netProfit,
                newSubscriptions,
                activeSubscriptions,
                dateRange: { start: startDate.toISOString(), end: endDate.toISOString(), label: range }
            },
            revenueByPlan,
            recentPayments,
            recentExpenses
        };

        res.status(200).json(dashboardData);

    } catch (error) {
        console.error('Error fetching financial dashboard data:', error);
        next(new ApiError(500, 'Error fetching dashboard data')); // Pass error to global handler
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
        next(error); // Pass potential BadRequestError or others
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
        next(error); // Pass potential NotFoundError or others
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
        // Mongoose validation errors handled globally
        next(error); // Pass NotFoundError, BadRequestError, or others
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
        next(error); // Pass potential BadRequestError or others
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
        next(error); // Pass potential NotFoundError or others
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
        // Mongoose validation errors handled globally
        next(error); // Pass potential validation errors or others
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
        // Mongoose validation errors handled globally
        next(error); // Pass NotFoundError or others
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
        next(error); // Pass NotFoundError or others
    }
};
