const User = require('../models/User');
const Payment = require('../models/Payment');
const Expense = require('../models/Expense');
const UserSubscription = require('../models/UserSubscription');
const Complaint = require('../models/Complaint');
const Attendance = require('../models/Attendance');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const { parseISO, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } = require('date-fns');

// Helper to parse dates and handle ranges
const getDateRange = (startDate, endDate, range) => {
    let start, end;

    if (range) {
        const now = new Date();
        switch (range) {
            case 'today':
                start = startOfDay(now);
                end = endOfDay(now);
                break;
            case 'this_month':
                start = startOfMonth(now);
                end = endOfMonth(now);
                break;
            case 'last_3_months':
                start = startOfDay(subMonths(now, 3));
                end = endOfDay(now);
                break;
            case 'this_year':
                start = startOfYear(now);
                end = endOfYear(now);
                break;
            default: // Default to this month if range is invalid
                start = startOfMonth(now);
                end = endOfMonth(now);
        }
    } else if (startDate && endDate) {
        try {
            start = startOfDay(parseISO(startDate));
            end = endOfDay(parseISO(endDate));
        } catch (error) {
            console.error("Invalid date format provided:", startDate, endDate);
            // Default to this month if custom dates are invalid
            const now = new Date();
            start = startOfMonth(now);
            end = endOfMonth(now);
        }
    } else {
        // Default range if nothing is provided (e.g., this month)
        const now = new Date();
        start = startOfMonth(now);
        end = endOfMonth(now);
    }
    return { startDate: start, endDate: end };
};

// --- Aggregation Helpers ---

const getUsersCountByRole = async (dateFilter) => {
    // No date filter needed for current user roles usually, but can be added if needed
    return User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $project: { _id: 0, role: '$_id', count: 1 } }
    ]);
};

const getNewUserRegistrationsTrend = async (dateFilter) => {
    // Determine date grouping format based on range (daily, monthly)
    // This is a simplified example; more robust date handling might be needed
    const rangeInDays = (dateFilter.endDate - dateFilter.startDate) / (1000 * 60 * 60 * 24);
    const dateFormat = rangeInDays > 90 ? "%Y-%m" : "%Y-%m-%d"; // Monthly if > 3 months, else daily

    return User.aggregate([
        { $match: { createdAt: { $gte: dateFilter.startDate, $lte: dateFilter.endDate } } },
        {
            $group: {
                _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: '$_id', count: 1 } }
    ]);
};

const getFinancialSummary = async (dateFilter) => {
    const revenuePromise = Payment.aggregate([
        { $match: { status: 'completed', paymentDate: { $gte: dateFilter.startDate, $lte: dateFilter.endDate } } },
        { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
    ]);
    const expensePromise = Expense.aggregate([
        { $match: { date: { $gte: dateFilter.startDate, $lte: dateFilter.endDate } } },
        { $group: { _id: null, totalExpenses: { $sum: '$amount' } } }
    ]);

    const [revenueResult, expenseResult] = await Promise.all([revenuePromise, expensePromise]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;
    const totalExpenses = expenseResult[0]?.totalExpenses || 0;
    const netProfit = totalRevenue - totalExpenses;

    return { totalRevenue, totalExpenses, netProfit };
};

const getSubscriptionStats = async () => {
    const activeSubsPromise = UserSubscription.countDocuments({ status: 'active' });
    const planPopularityPromise = UserSubscription.aggregate([
        { $match: { status: 'active' } }, // Count only active subscriptions for popularity
        { $lookup: { from: 'subscriptionplans', localField: 'plan', foreignField: '_id', as: 'planDetails' } },
        { $unwind: '$planDetails' },
        { $group: { _id: '$planDetails.name', count: { $sum: 1 } } },
        { $project: { _id: 0, planName: '$_id', count: 1 } },
        { $sort: { count: -1 } }
    ]);

    const [activeSubscriptionsCount, planPopularity] = await Promise.all([activeSubsPromise, planPopularityPromise]);

    return { activeSubscriptionsCount, planPopularity };
};

const getPaymentStatusDistribution = async (dateFilter) => {
    return Payment.aggregate([
        { $match: { paymentDate: { $gte: dateFilter.startDate, $lte: dateFilter.endDate } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { _id: 0, status: '$_id', count: 1 } }
    ]);
};

const getComplaintOverview = async (dateFilter) => {
    return Complaint.aggregate([
        // { $match: { createdAt: { $gte: dateFilter.startDate, $lte: dateFilter.endDate } } }, // Optional: filter by creation date
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { _id: 0, status: '$_id', count: 1 } }
    ]);
};

// --- Main Service Function ---

exports.calculateStatistics = async ({ startDate, endDate, range }) => {
    const dateFilter = getDateRange(startDate, endDate, range);

    // Fetch all statistics concurrently
    const [usersByRole, newUserTrend, financialSummary, subscriptionStats, paymentStatus, complaintOverview] = await Promise.all([
        getUsersCountByRole(dateFilter),
        getNewUserRegistrationsTrend(dateFilter),
        getFinancialSummary(dateFilter),
        getSubscriptionStats(), // Subscription stats might not need date filter depending on requirements
        getPaymentStatusDistribution(dateFilter),
        getComplaintOverview(dateFilter)
        // Add calls to other helper functions here (e.g., attendance, recycling, pickups)
    ]);

    // Combine results
    const statisticsData = {
        usersByRole,
        newUserTrend,
        ...financialSummary,
        ...subscriptionStats,
        paymentStatus,
        complaintOverview,
        // Add other stats here
        dateRange: { // Include the actual date range used for clarity
            startDate: dateFilter.startDate.toISOString(),
            endDate: dateFilter.endDate.toISOString()
        }
    };

    return statisticsData;
};
