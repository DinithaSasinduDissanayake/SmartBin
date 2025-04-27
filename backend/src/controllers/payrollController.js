const PayrollLog = require('../models/PayrollLog');
const User = require('../models/User');
const payrollService = require('../services/payrollService');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../errors');
const mongoose = require('mongoose');

// @desc    Generate payroll for all staff for a given period
// @route   POST /api/payroll/generate
// @access  Private (Admin, Financial Manager)
exports.generatePayrollForPeriod = async (req, res, next) => {
    const { periodStart, periodEnd } = req.body; // Expecting YYYY-MM-DD format

    if (!periodStart || !periodEnd) {
        return next(new BadRequestError('periodStart and periodEnd are required'));
    }

    const startDate = new Date(periodStart);
    const endDate = new Date(periodEnd);
    endDate.setHours(23, 59, 59, 999); // Include the whole end day

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return next(new BadRequestError('Invalid date format for periodStart or periodEnd'));
    }

    try {
        const staffMembers = await User.find({ role: 'staff' });
        if (staffMembers.length === 0) {
             return res.status(200).json({ message: 'No staff members found to generate payroll for.', results: [] });
        }

        const results = [];
        for (const staff of staffMembers) {
            try {
               const log = await payrollService.generateOrGetPayrollLog(staff._id, startDate, endDate);
               results.push({ staffId: staff._id, status: 'Success', logId: log._id });
            } catch (error) {
                results.push({ staffId: staff._id, status: 'Error', message: error.message });
                console.error(`Failed generating payroll for ${staff.email}: ${error.message}`);
            }
        }

        res.status(200).json({ message: 'Payroll generation process completed.', results });

    } catch (error) {
        next(error);
    }
};

// @desc    Get payroll history for a specific staff member
// @route   GET /api/payroll/staff/:staffId
// @access  Private (Admin, Financial Manager, or Staff Owner)
exports.getPayrollHistoryForStaff = async (req, res, next) => {
    const { staffId } = req.params;
    const loggedInUserId = req.user.id;
    const loggedInUserRole = req.user.role;

    if (!mongoose.Types.ObjectId.isValid(staffId)) {
        return next(new BadRequestError('Invalid Staff ID format'));
    }

    // Check permissions
    if (loggedInUserRole !== 'admin' && loggedInUserRole !== 'financial_manager' && loggedInUserId !== staffId) {
         return next(new ForbiddenError('Not authorized to view this payroll history'));
    }

    try {
        // Add pagination later if needed
        const payrollHistory = await PayrollLog.find({ staff: staffId })
                                            .sort({ payPeriodEnd: -1 })
                                            .populate('staff', 'name email'); // Populate basic staff info

        res.status(200).json(payrollHistory);
    } catch (error) {
        next(error);
    }
};

 // @desc    Get a specific payroll log entry by its ID
// @route   GET /api/payroll/:logId
// @access  Private (Admin, Financial Manager, or Staff Owner)
exports.getPayrollLogById = async (req, res, next) => {
    const { logId } = req.params;
    const loggedInUserId = req.user.id;
    const loggedInUserRole = req.user.role;

     if (!mongoose.Types.ObjectId.isValid(logId)) {
        return next(new BadRequestError('Invalid Log ID format'));
    }

    try {
        const payrollLog = await PayrollLog.findById(logId).populate('staff', 'name email');
        if (!payrollLog) {
             throw new NotFoundError('Payroll log not found');
        }

        // Check permissions
        if (loggedInUserRole !== 'admin' && loggedInUserRole !== 'financial_manager' && payrollLog.staff._id.toString() !== loggedInUserId) {
             return next(new ForbiddenError('Not authorized to view this payroll log'));
        }

        res.status(200).json(payrollLog);
    } catch (error) {
        next(error);
    }
};

// @desc    Mark a payroll log as Paid
// @route   PATCH /api/payroll/:logId/mark-paid
// @access  Private (Admin, Financial Manager)
exports.markPayrollAsPaid = async (req, res, next) => {
    const { logId } = req.params;
    const { paymentDate, transactionRef } = req.body; // Optional payment details

     if (!mongoose.Types.ObjectId.isValid(logId)) {
        return next(new BadRequestError('Invalid Log ID format'));
    }

    try {
         const payrollLog = await PayrollLog.findById(logId);
        if (!payrollLog) {
             throw new NotFoundError('Payroll log not found');
        }

        if (payrollLog.status === 'Paid') {
            return next(new BadRequestError('Payroll has already been marked as paid.'));
        }

        payrollLog.status = 'Paid';
        payrollLog.paymentDate = paymentDate ? new Date(paymentDate) : new Date(); // Use provided or now
        if (transactionRef) payrollLog.transactionRef = transactionRef;

        await payrollLog.save();

        res.status(200).json({ message: 'Payroll marked as paid successfully', payrollLog });

    } catch (error) {
        next(error);
    }
};