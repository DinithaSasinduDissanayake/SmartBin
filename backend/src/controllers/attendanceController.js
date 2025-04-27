const mongoose = require('mongoose'); // Import mongoose
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');
const BadRequestError = require('../errors/BadRequestError');
const ApiError = require('../errors/ApiError');

/**
 * @desc    Record check-in for staff
 * @route   POST /api/attendance/check-in
 * @access  Private/Staff/Admin
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.checkIn = async (req, res, next) => {
  try {
    // Check if user is staff or admin
    if (!['staff', 'admin'].includes(req.user.role)) {
      throw new ForbiddenError('Only staff or admin can check in');
    }
    
    // Check if already checked in today without checking out
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const existingRecord = await Attendance.findOne({
      staff: req.user.id,
      date: { $gte: today, $lt: tomorrow },
      checkOutTime: { $exists: false } // Only find records without a checkout time
    });
    
    if (existingRecord) {
      throw new BadRequestError('You are already checked in and have not checked out yet');
    }
    
    // Create new attendance record
    const attendance = new Attendance({
      staff: req.user.id,
      checkInTime: new Date(),
      date: new Date() // Set the date field explicitly
    });
    
    await attendance.save();
    
    res.status(201).json(attendance);
  } catch (error) {
    console.error('Check-in error:', error);
    next(error); // Pass error to global handler
  }
};

/**
 * @desc    Record check-out for staff
 * @route   PUT /api/attendance/check-out
 * @access  Private/Staff/Admin
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.checkOut = async (req, res, next) => {
  try {
    // Check if user is staff or admin
    if (!['staff', 'admin'].includes(req.user.role)) {
      throw new ForbiddenError('Only staff or admin can check out');
    }
    
    // Find today's active check-in record
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const record = await Attendance.findOne({
      staff: req.user.id,
      date: { $gte: today, $lt: tomorrow },
      checkOutTime: { $exists: false } // Find the record that hasn't been checked out yet
    });
    
    if (!record) {
      throw new BadRequestError('No active check-in found for today to check out from');
    }
    
    // Update checkout time (pre-save hook calculates totalHours)
    record.checkOutTime = new Date();
    
    await record.save();
    
    res.json(record);
  } catch (error) {
    console.error('Check-out error:', error);
    next(error); // Pass error to global handler
  }
};

/**
 * @desc    Get current staff member's attendance by date range
 * @route   GET /api/attendance
 * @access  Private/Staff/Admin
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.getMyAttendance = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = { staff: req.user.id };
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new BadRequestError('Invalid date format for startDate or endDate');
      }
      // Ensure end date includes the whole day
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    } else if (startDate) {
        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
            throw new BadRequestError('Invalid date format for startDate');
        }
        query.date = { $gte: start };
    } else if (endDate) {
        const end = new Date(endDate);
        if (isNaN(end.getTime())) {
            throw new BadRequestError('Invalid date format for endDate');
        }
        end.setHours(23, 59, 59, 999);
        query.date = { $lte: end };
    }
    
    const attendance = await Attendance.find(query).sort({ date: -1 });
    
    res.json(attendance);
  } catch (error) {
    console.error('Error fetching own attendance:', error);
    next(error); // Pass error to global handler
  }
};

/**
 * @desc    Get all staff attendance (for admin)
 * @route   GET /api/attendance/all
 * @access  Private/Admin
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.getAllAttendance = async (req, res, next) => {
  try {
    const { startDate, endDate, staffId } = req.query;
    
    let query = {};
    
    if (staffId) {
      if (!mongoose.Types.ObjectId.isValid(staffId)) {
        throw new BadRequestError('Invalid staffId format');
      }
      query.staff = staffId;
    }
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new BadRequestError('Invalid date format for startDate or endDate');
      }
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    } // Add similar logic for single startDate or endDate if needed
    
    const attendance = await Attendance.find(query)
      .populate('staff', 'name email') // Populate staff details
      .sort({ date: -1 });
    
    res.json(attendance);
  } catch (error) {
    console.error('Error fetching all attendance:', error);
    next(error); // Pass error to global handler
  }
};

/**
 * @desc    Update attendance record (for admin)
 * @route   PUT /api/attendance/:id
 * @access  Private/Admin
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.updateAttendance = async (req, res, next) => {
  // Validation handled by express-validator
  const { checkInTime, checkOutTime, status, notes } = req.body;

  try {
    const attendance = await Attendance.findById(req.params.id);
    
    if (!attendance) {
      throw new NotFoundError('Attendance record not found');
    }
    
    // Update fields if provided
    if (checkInTime) attendance.checkInTime = new Date(checkInTime); // Ensure it's a Date object
    if (checkOutTime) attendance.checkOutTime = new Date(checkOutTime); // Ensure it's a Date object
    if (status) attendance.status = status;
    if (notes !== undefined) attendance.notes = notes;
    
    // If times change, the pre-save hook will recalculate totalHours
    await attendance.save();
    
    res.json(attendance);
  } catch (error) {
    console.error('Error updating attendance:', error);
    // Mongoose validation errors handled globally
    next(error); // Pass NotFoundError or others
  }
};

/**
 * @desc    Get staff attendance summary (for admin)
 * @route   GET /api/attendance/summary
 * @access  Private/Admin
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.getAttendanceSummary = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    
    // Validate month and year if provided
    const currentYear = new Date().getFullYear();
    const targetMonth = month ? parseInt(month) - 1 : new Date().getMonth();
    const targetYear = year ? parseInt(year) : currentYear;

    if (isNaN(targetMonth) || targetMonth < 0 || targetMonth > 11 || isNaN(targetYear) || targetYear < 2000 || targetYear > currentYear + 5) {
        throw new BadRequestError('Invalid month or year provided');
    }
    
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999); // End of the month
    
    // Get all staff members
    const staffMembers = await User.find({ role: 'staff' }, '_id name email');
    
    // Use aggregation for potentially better performance
    const summaryData = await Attendance.aggregate([
        { $match: { 
            staff: { $in: staffMembers.map(s => s._id) },
            date: { $gte: startDate, $lte: endDate }
        } },
        { $group: {
            _id: '$staff',
            totalHours: { $sum: '$totalHours' },
            presentDays: { $sum: { $cond: [ { $eq: ['$status', 'Present'] }, 1, 0 ] } },
            absentDays: { $sum: { $cond: [ { $eq: ['$status', 'Absent'] }, 1, 0 ] } },
            lateDays: { $sum: { $cond: [ { $eq: ['$status', 'Late'] }, 1, 0 ] } },
            leaveDays: { $sum: { $cond: [ { $eq: ['$status', 'On Leave'] }, 1, 0 ] } }, // Added leave days
            totalRecords: { $sum: 1 }
        } },
        { $lookup: { // Join with users collection to get staff details
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'staffDetails'
        } },
        { $unwind: '$staffDetails' }, // Deconstruct the staffDetails array
        { $project: { // Shape the output
            _id: 0,
            staff: {
                _id: '$staffDetails._id',
                name: '$staffDetails.name',
                email: '$staffDetails.email'
            },
            summary: {
                totalHours: { $ifNull: ['$totalHours', 0] },
                presentDays: { $ifNull: ['$presentDays', 0] },
                absentDays: { $ifNull: ['$absentDays', 0] },
                lateDays: { $ifNull: ['$lateDays', 0] },
                leaveDays: { $ifNull: ['$leaveDays', 0] },
                totalRecords: { $ifNull: ['$totalRecords', 0] }
            }
        } }
    ]);

    // Add staff members who had no records in the period
    const staffWithRecords = summaryData.map(s => s.staff._id.toString());
    staffMembers.forEach(staff => {
        if (!staffWithRecords.includes(staff._id.toString())) {
            summaryData.push({
                staff: { _id: staff._id, name: staff.name, email: staff.email },
                summary: { totalHours: 0, presentDays: 0, absentDays: 0, lateDays: 0, leaveDays: 0, totalRecords: 0 }
            });
        }
    });

    res.json(summaryData);

  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    next(error); // Pass error to global handler
  }
};