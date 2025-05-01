// backend/src/services/budgetService.js
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const BadRequestError = require('../errors/BadRequestError');

/**
 * Calculates the budget vs. actual spending summary for a given period.
 * @param {Date} startDate - The start date of the summary period.
 * @param {Date} endDate - The end date of the summary period.
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of summary objects.
 */
const calculateBudgetVsActual = async (startDate, endDate) => {
    if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new BadRequestError('Valid start and end dates are required for summary calculation');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Ensure the entire end day is included

    // 1. Find relevant budgets overlapping the query period
    const relevantBudgets = await Budget.find({
        $or: [
            { periodStartDate: { $gte: start, $lte: end }, periodEndDate: { $gte: start, $lte: end } },
            { periodStartDate: { $lt: start }, periodEndDate: { $gte: start, $lte: end } },
            { periodStartDate: { $gte: start, $lte: end }, periodEndDate: { $gt: end } },
            { periodStartDate: { $lt: start }, periodEndDate: { $gt: end } }
        ]
    }).select('category allocatedAmount periodStartDate periodEndDate');

    if (relevantBudgets.length === 0) {
        return []; // No budgets found for the period
    }

    // 2. Aggregate actual expenses for relevant categories within the period
    const categories = [...new Set(relevantBudgets.map(b => b.category))];
    const actualExpenses = await Expense.aggregate([
        {
            $match: {
                category: { $in: categories },
                date: { $gte: start, $lte: end },
                // status: 'approved' // Optional: Filter by status if needed
            }
        },
        {
            $group: {
                _id: '$category',
                actual: { $sum: '$amount' }
            }
        },
        {
            $project: {
                _id: 0,
                category: '$_id',
                actual: 1
            }
        }
    ]);

    // 3. Combine budget and actual expense data
    const summaryMap = new Map();

    relevantBudgets.forEach(budget => {
        const budgetStart = budget.periodStartDate;
        const budgetEnd = budget.periodEndDate;
        const budgetDuration = budgetEnd.getTime() - budgetStart.getTime();

        const intersectionStart = Math.max(budgetStart.getTime(), start.getTime());
        const intersectionEnd = Math.min(budgetEnd.getTime(), end.getTime());
        const intersectionDuration = Math.max(0, intersectionEnd - intersectionStart);

        let relevantAllocatedAmount = 0;
        if (budgetDuration > 0 && intersectionDuration > 0) {
            relevantAllocatedAmount = (intersectionDuration / budgetDuration) * budget.allocatedAmount;
        } else if (budgetDuration === 0 && budgetStart >= start && budgetStart <= end) {
            relevantAllocatedAmount = budget.allocatedAmount;
        }

        const existing = summaryMap.get(budget.category) || { category: budget.category, allocated: 0, actual: 0 };
        existing.allocated += relevantAllocatedAmount;
        summaryMap.set(budget.category, existing);
    });

    actualExpenses.forEach(expense => {
        if (summaryMap.has(expense.category)) {
            summaryMap.get(expense.category).actual = expense.actual;
        } else {
            // Include expenses even if no specific budget was set for that category in the period
            summaryMap.set(expense.category, { category: expense.category, allocated: 0, actual: expense.actual });
        }
    });

    // Format the final summary array
    const summary = Array.from(summaryMap.values()).map(item => ({
        ...item,
        allocated: parseFloat(item.allocated.toFixed(2)),
        difference: parseFloat((item.allocated - item.actual).toFixed(2)),
        percentageUsed: item.allocated > 0 ? parseFloat(((item.actual / item.allocated) * 100).toFixed(2)) : (item.actual > 0 ? Infinity : 0)
    })).sort((a, b) => a.category.localeCompare(b.category));

    return summary;
};

module.exports = {
    calculateBudgetVsActual,
};
