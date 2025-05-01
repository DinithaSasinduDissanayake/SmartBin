// backend/src/controllers/dashboardController.js
const User = require('../models/User');
const Payment = require('../models/Payment');
const Expense = require('../models/Expense');
const UserSubscription = require('../models/UserSubscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const Complaint = require('../models/Complaint');
const ApiError = require('../errors/ApiError');
const { startOfDay, endOfDay, addDays, format, parseISO, isAfter } = require('date-fns');

// Use a fixed date consistent with the seeding script for demo purposes
const DEMO_CURRENT_DATE = new Date('2025-04-26T12:00:00Z'); // Use a fixed time to avoid timezone issues

/**
 * Get financial manager main dashboard data
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
const getFinancialManagerMainDashboardData = async (req, res, next) => {
  try {
    // Use the fixed demo date instead of the actual current date
    const today = DEMO_CURRENT_DATE;
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    // Get today's revenue (sum of all payments received today)
    const todayPayments = await Payment.find({
      paymentDate: { $gte: todayStart, $lte: todayEnd },
      status: 'completed'
    });
    const todayRevenue = todayPayments.reduce((sum, payment) => sum + payment.amount, 0);

    // Get today's expenses
    const todayExpenses = await Expense.find({
      date: { $gte: todayStart, $lte: todayEnd }
    });
    const todayTotalExpenses = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Get new customers count (registered today)
    const newCustomers = await User.countDocuments({
      role: 'customer',
      createdAt: { $gte: todayStart, $lte: todayEnd }
    });

    // Get staff attendance data (mock - would be from attendance model in real implementation)
    // This is a simplified version - in a real app, this would come from the Attendance model
    const staffAttendance = {
      present: 12,
      absent: 3,
      late: 2,
      leave: 1
    };

    // Get pending payments (due within next 7 days from fixed date)
    const pendingPayments = await Payment.find({
      status: 'pending',
      dueDate: { $gte: today, $lte: addDays(today, 7) } // Query relative to fixed date
    }).populate('user', 'name email').limit(5);

    // Get subscriptions ending soon (in the next 7 days from fixed date)
    const subscriptionsEndingSoon = await UserSubscription.find({
      endDate: {
        $gte: today,
        $lte: addDays(today, 7) // Query relative to fixed date
      },
      status: 'active'
    }).populate('user', 'name email')
      .populate('subscriptionPlan', 'name price')
      .limit(5);

    // Get pending expenses awaiting approval
    const pendingExpenses = await Expense.find({
      status: 'pending'
    }).sort({ date: -1 }).limit(5);

    // Get recent payments (today's transactions based on fixed date)
    const recentPayments = await Payment.find({
      paymentDate: { $gte: todayStart, $lte: todayEnd }
    }).populate('user', 'name email')
      .sort({ paymentDate: -1 })
      .limit(10);

    // Get recent financial-related messages/complaints (query by subject)
    const recentMessages = await Complaint.find({
      subject: { $regex: /billing|payment|subscription/i } // Search subject for keywords
    }).populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get upcoming financial events (relative to fixed date)
    const upcomingEvents = [];

    // Add upcoming payment dues
    const upcomingPaymentDues = await Payment.find({
      status: 'pending',
      dueDate: { $gte: today, $lte: addDays(today, 14) } // Query relative to fixed date
    }).populate('user', 'name').sort({ dueDate: 1 }).limit(10);

    upcomingPaymentDues.forEach(payment => {
      upcomingEvents.push({
        type: 'payment_due',
        description: `Payment due from ${payment.user?.name || 'Unknown customer'}`,
        date: payment.dueDate,
        amount: payment.amount
      });
    });

    // Add subscription endings
    const upcomingSubscriptionEndings = await UserSubscription.find({
      endDate: { $gte: today, $lte: addDays(today, 14) }, // Query relative to fixed date
      status: 'active'
    }).populate('user', 'name').populate('subscriptionPlan', 'name price').limit(10);

    upcomingSubscriptionEndings.forEach(subscription => {
      upcomingEvents.push({
        type: 'subscription_end',
        description: `${subscription.subscriptionPlan?.name || 'Unknown'} subscription ending for ${subscription.user?.name || 'Unknown'}`,
        date: subscription.endDate
      });
    });

    // Sort events by date
    upcomingEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Create response data structure
    const dashboardData = {
      dailySnapshot: {
        revenue: todayRevenue,
        expenses: todayTotalExpenses,
        newCustomers,
        staffAttendance
      },
      actionRequired: {
        pendingPayments,
        subscriptionsEndingSoon,
        pendingExpenses
      },
      dailyActivity: {
        recentPayments
      },
      communications: {
        recentMessages
      },
      calendar: {
        upcomingEvents
      }
    };

    res.json(dashboardData);
  } catch (error) {
    next(new ApiError(error.message, 500));
  }
};

module.exports = {
  getFinancialManagerMainDashboardData
};