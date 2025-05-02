// backend/src/controllers/budgetController.js
const Budget = require('../models/Budget');
const ApiError = require('../errors/ApiError');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const mongoose = require('mongoose');
const budgetService = require('../services/budgetService'); // Import the service

/**
 * @desc    Create a new budget allocation
 * @route   POST /api/budgets
 * @access  Private (admin, financial_manager)
 */
exports.createBudget = async (req, res, next) => {
    try {
        const { category, periodType, periodStartDate, periodEndDate, allocatedAmount, notes } = req.body;

        // Check for overlapping budgets for the same category and period type
        // This logic might need refinement based on exact overlap rules (e.g., allow overlapping if dates don't clash)
        const existingBudget = await Budget.findOne({
            category,
            periodType,
            // A simple check: ensure no budget exists where the new period falls entirely within an existing one
            // or vice-versa, or they partially overlap. More complex date range overlap logic might be needed.
            $or: [
                { periodStartDate: { $lte: periodEndDate }, periodEndDate: { $gte: periodStartDate } },
            ]
        });

        if (existingBudget) {
            // Consider allowing updates or warning instead of hard error depending on requirements
            // return next(new BadRequestError(`A budget for ${category} (${periodType}) already exists or overlaps with the specified period.`));
            console.warn(`Potential overlapping budget found for ${category} (${periodType}) during period ${periodStartDate} - ${periodEndDate}. Proceeding with creation.`);
        }

        const budget = await Budget.create({
            category,
            periodType,
            periodStartDate,
            periodEndDate,
            allocatedAmount,
            notes,
            createdBy: req.user._id // Assuming user ID is available from 'protect' middleware
        });

        res.status(201).json(budget);
    } catch (error) {
        console.error('Error creating budget:', error);
        if (error.name === 'ValidationError') {
            return next(new BadRequestError(error.message));
        }
        next(error); // Pass to global error handler
    }
};

/**
 * @desc    Get all budget allocations (with filtering)
 * @route   GET /api/budgets
 * @access  Private (admin, financial_manager)
 */
exports.getBudgets = async (req, res, next) => {
    try {
        const { category, periodType, startDate, endDate, page = 1, limit = 10 } = req.query;
        const query = {};

        if (category) query.category = category;
        if (periodType) query.periodType = periodType;

        // Date range filtering: Find budgets that overlap with the query range
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                throw new BadRequestError('Invalid date format for filtering');
            }
            end.setHours(23, 59, 59, 999); // Include the whole end day

            query.$or = [
                // Budget period is completely within the query range
                { periodStartDate: { $gte: start, $lte: end }, periodEndDate: { $gte: start, $lte: end } },
                // Budget period starts before and ends within the query range
                { periodStartDate: { $lt: start }, periodEndDate: { $gte: start, $lte: end } },
                // Budget period starts within and ends after the query range
                { periodStartDate: { $gte: start, $lte: end }, periodEndDate: { $gt: end } },
                // Budget period completely encompasses the query range
                { periodStartDate: { $lt: start }, periodEndDate: { $gt: end } }
            ];
        } else if (startDate) {
            const start = new Date(startDate);
            if (isNaN(start.getTime())) throw new BadRequestError('Invalid start date format');
            query.periodEndDate = { $gte: start }; // Budgets ending on or after startDate
        } else if (endDate) {
            const end = new Date(endDate);
            if (isNaN(end.getTime())) throw new BadRequestError('Invalid end date format');
            end.setHours(23, 59, 59, 999);
            query.periodStartDate = { $lte: end }; // Budgets starting on or before endDate
        }

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            sort: { periodStartDate: -1, category: 1 }, // Sort by start date desc, then category asc
            populate: { path: 'createdBy', select: 'name email' } // Populate creator info
        };

        // Use mongoose-paginate-v2 if available, otherwise use standard find/limit/skip
        const budgets = await (Budget.paginate ? Budget.paginate(query, options) : Budget.find(query).sort(options.sort).skip((options.page - 1) * options.limit).limit(options.limit).populate(options.populate));

        res.status(200).json(budgets);
    } catch (error) {
        console.error('Error fetching budgets:', error);
        next(error);
    }
};

/**
 * @desc    Get a specific budget allocation by ID
 * @route   GET /api/budgets/:id
 * @access  Private (admin, financial_manager)
 */
exports.getBudgetById = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            throw new BadRequestError('Invalid budget ID format');
        }

        const budget = await Budget.findById(req.params.id).populate('createdBy', 'name email');

        if (!budget) {
            throw new NotFoundError('Budget not found');
        }

        res.status(200).json(budget);
    } catch (error) {
        console.error('Error fetching budget by ID:', error);
        next(error);
    }
};

/**
 * @desc    Update a budget allocation
 * @route   PUT /api/budgets/:id
 * @access  Private (admin, financial_manager)
 */
exports.updateBudget = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            throw new BadRequestError('Invalid budget ID format');
        }

        const { category, periodType, periodStartDate, periodEndDate, allocatedAmount, notes } = req.body;

        const budget = await Budget.findById(req.params.id);

        if (!budget) {
            throw new NotFoundError('Budget not found');
        }

        // Optional: Add check if req.user._id matches budget.createdBy or if user is admin
        // if (budget.createdBy.toString() !== req.user._id && req.user.role !== 'admin') {
        //     throw new ForbiddenError('User not authorized to update this budget');
        // }

        // Update fields
        budget.category = category || budget.category;
        budget.periodType = periodType || budget.periodType;
        budget.periodStartDate = periodStartDate || budget.periodStartDate;
        budget.periodEndDate = periodEndDate || budget.periodEndDate;
        budget.allocatedAmount = allocatedAmount !== undefined ? allocatedAmount : budget.allocatedAmount;
        budget.notes = notes !== undefined ? notes : budget.notes;

        const updatedBudget = await budget.save();

        res.status(200).json(updatedBudget);
    } catch (error) {
        console.error('Error updating budget:', error);
        if (error.name === 'ValidationError') {
            return next(new BadRequestError(error.message));
        }
        next(error);
    }
};

/**
 * @desc    Delete a budget allocation
 * @route   DELETE /api/budgets/:id
 * @access  Private (admin, financial_manager)
 */
exports.deleteBudget = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            throw new BadRequestError('Invalid budget ID format');
        }

        const budget = await Budget.findById(req.params.id);

        if (!budget) {
            throw new NotFoundError('Budget not found');
        }

        // Optional: Add ownership/admin check before deletion
        // if (budget.createdBy.toString() !== req.user._id && req.user.role !== 'admin') {
        //     throw new ForbiddenError('User not authorized to delete this budget');
        // }

        await budget.deleteOne(); // Use deleteOne() on the document

        res.status(200).json({ message: 'Budget deleted successfully' });
    } catch (error) {
        console.error('Error deleting budget:', error);
        next(error);
    }
};

/**
 * @desc    Get budget summary (allocated vs. actual spending)
 * @route   GET /api/budgets/summary
 * @access  Private (admin, financial_manager)
 */
exports.getBudgetSummary = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            throw new BadRequestError('Start date and end date query parameters are required for summary');
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new BadRequestError('Invalid date format for summary range');
        }
        end.setHours(23, 59, 59, 999); // Include the whole end day

        // Call the service function to calculate the summary
        const summary = await budgetService.calculateBudgetVsActual(start, end);

        if (summary.length === 0) {
             return res.status(200).json({ message: 'No budgets or expenses found for the specified period.', summary: [] });
        }

        res.status(200).json({ summary });

    } catch (error) {
        console.error('Error generating budget summary:', error);
        // Handle specific errors from the service if needed
        if (error instanceof BadRequestError) {
            return next(error);
        }
        next(error); // Pass to global error handler
    }
};
