const SubscriptionPlan = require('../models/SubscriptionPlan');
const Payment = require('../models/Payment');
const Expense = require('../models/Expense');
const UserSubscription = require('../models/UserSubscription');
const User = require('../models/User');

exports.getDashboardData = async (req, res) => {
    try {
        // Get date range from query parameter (default: month)
        const dateRange = req.query.range || 'month';
        
        // Calculate date ranges based on the parameter
        const currentDate = new Date();
        let startDate;
        
        switch (dateRange) {
            case 'year':
                startDate = new Date(currentDate.getFullYear(), 0, 1); // Jan 1 of current year
                break;
            case 'quarter':
                const currentQuarter = Math.floor(currentDate.getMonth() / 3);
                startDate = new Date(currentDate.getFullYear(), currentQuarter * 3, 1);
                break;
            case 'month':
            default:
                startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1); // 1st of current month
                break;
        }
        
        // 1. Count Active Subscriptions
        const activeSubscriptions = await UserSubscription.countDocuments({ 
            status: 'active' 
        });
        
        // 2. Calculate Revenue
        // Current period revenue (month, quarter or year based on dateRange)
        const periodRevenue = await Payment.aggregate([
            {
                $match: {
                    status: 'completed',
                    paymentDate: { $gte: startDate, $lte: currentDate }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" }
                }
            }
        ]);
        
        // Year-to-date revenue
        const yearStartDate = new Date(currentDate.getFullYear(), 0, 1);
        const yearToDateRevenue = await Payment.aggregate([
            {
                $match: {
                    status: 'completed',
                    paymentDate: { $gte: yearStartDate, $lte: currentDate }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" }
                }
            }
        ]);
        
        // Total revenue from subscriptions only
        const subscriptionRevenue = await Payment.aggregate([
            {
                $match: {
                    status: 'completed',
                    subscriptionPlan: { $ne: null },
                    paymentDate: { $gte: startDate, $lte: currentDate }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" }
                }
            }
        ]);
        
        // 3. Calculate Expenses
        // Current period expenses (month, quarter or year based on dateRange)
        const periodExpenses = await Expense.aggregate([
            {
                $match: {
                    status: 'approved',
                    date: { $gte: startDate, $lte: currentDate }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" }
                }
            }
        ]);
        
        // Year-to-date expenses
        const yearToDateExpenses = await Expense.aggregate([
            {
                $match: {
                    status: 'approved',
                    date: { $gte: yearStartDate, $lte: currentDate }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" }
                }
            }
        ]);
        
        // 4. Outstanding Payments (pending or failed)
        const outstandingPayments = await Payment.aggregate([
            {
                $match: {
                    status: { $in: ['pending', 'failed'] }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" }
                }
            }
        ]);
        
        // 5. Recent Transactions
        const recentPayments = await Payment.find()
            .sort({ paymentDate: -1 })
            .limit(5)
            .populate('user', 'name')
            .populate('subscriptionPlan', 'name duration');
            
        const recentExpenses = await Expense.find()
            .sort({ date: -1 })
            .limit(5);
        
        // 6. Revenue by Subscription Plan
        const revenueByPlan = await Payment.aggregate([
            {
                $match: {
                    status: 'completed',
                    subscriptionPlan: { $ne: null },
                    paymentDate: { $gte: startDate, $lte: currentDate }
                }
            },
            {
                $lookup: {
                    from: 'subscriptionplans', // Collection name is usually lowercase and plural
                    localField: 'subscriptionPlan',
                    foreignField: '_id',
                    as: 'planDetails'
                }
            },
            {
                $unwind: '$planDetails'
            },
            {
                $group: {
                    _id: '$planDetails.name',
                    revenue: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    plan: '$_id',
                    revenue: 1,
                    count: 1,
                    _id: 0
                }
            }
        ]);
        
        // 7. Expense breakdown by category
        const expensesByCategory = await Expense.aggregate([
            {
                $match: {
                    status: 'approved',
                    date: { $gte: startDate, $lte: currentDate }
                }
            },
            {
                $group: {
                    _id: '$category',
                    total: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    category: '$_id',
                    total: 1,
                    count: 1,
                    _id: 0
                }
            }
        ]);
        
        // 8. Monthly revenue trend for the past 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const revenueTrend = await Payment.aggregate([
            {
                $match: {
                    status: 'completed',
                    paymentDate: { $gte: sixMonthsAgo, $lte: currentDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$paymentDate" },
                        month: { $month: "$paymentDate" }
                    },
                    total: { $sum: "$amount" }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            },
            {
                $project: {
                    month: {
                        $concat: [
                            { $toString: "$_id.year" },
                            "-",
                            { $toString: "$_id.month" }
                        ]
                    },
                    total: 1,
                    _id: 0
                }
            }
        ]);
        
        // 9. Monthly expense trend for the past 6 months
        const expenseTrend = await Expense.aggregate([
            {
                $match: {
                    status: 'approved',
                    date: { $gte: sixMonthsAgo, $lte: currentDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                        month: { $month: "$date" }
                    },
                    total: { $sum: "$amount" }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            },
            {
                $project: {
                    month: {
                        $concat: [
                            { $toString: "$_id.year" },
                            "-",
                            { $toString: "$_id.month" }
                        ]
                    },
                    total: 1,
                    _id: 0
                }
            }
        ]);
        
        // 10. Subscription plans data
        const subscriptionPlansData = await SubscriptionPlan.find().sort({ price: 1 });
        
        // Compile all data
        const dashboardData = {
            activeSubscriptions,
            totalRevenue: {
                period: periodRevenue.length > 0 ? periodRevenue[0].total : 0,
                year: yearToDateRevenue.length > 0 ? yearToDateRevenue[0].total : 0,
                subscriptions: subscriptionRevenue.length > 0 ? subscriptionRevenue[0].total : 0
            },
            totalExpenses: {
                period: periodExpenses.length > 0 ? periodExpenses[0].total : 0,
                year: yearToDateExpenses.length > 0 ? yearToDateExpenses[0].total : 0
            },
            outstandingPayments: outstandingPayments.length > 0 ? outstandingPayments[0].total : 0,
            recentTransactions: {
                payments: recentPayments.map(payment => ({
                    id: payment._id,
                    date: payment.paymentDate,
                    customer: payment.user ? payment.user.name : 'Unknown',
                    description: payment.description,
                    amount: payment.amount,
                    status: payment.status,
                    paymentMethod: payment.paymentMethod
                })),
                expenses: recentExpenses.map(expense => ({
                    id: expense._id,
                    date: expense.date,
                    category: expense.category,
                    description: expense.description,
                    amount: expense.amount,
                    status: expense.status
                }))
            },
            revenueByPlan,
            expensesByCategory,
            trends: {
                revenue: revenueTrend,
                expenses: expenseTrend
            },
            subscriptionPlans: subscriptionPlansData.map(plan => ({
                id: plan._id,
                name: plan.name,
                price: plan.price,
                subscriberCount: plan.subscriberCount,
                description: plan.description,
                duration: plan.duration
            })),
            dateRange: {
                start: startDate,
                end: currentDate,
                type: dateRange
            }
        };

        res.status(200).json(dashboardData);

    } catch (error) {
        console.error('Error fetching financial dashboard data:', error);
        res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
    }
};
