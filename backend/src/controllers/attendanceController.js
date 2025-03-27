const Attendance = require('../models/Attendance');
const User = require('../models/User');

// @desc    Record check-in for staff
// @route   POST /api/attendance/check-in
// @access  Private/Staff
exports.checkIn = async (req, res) => {
  try {
    // Check if user is staff
    if (req.user.role !== 'staff' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only staff can check in' });
    }
    
    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const existingRecord = await Attendance.findOne({
      staff: req.user.id,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    if (existingRecord && !existingRecord.checkOutTime) {
      return res.status(400).json({ message: 'You are already checked in' });
    }
    
    // Create new attendance record
    const attendance = new Attendance({
      staff: req.user.id,
      checkInTime: new Date(),
      date: new Date()
    });
    
    await attendance.save();
    
    res.status(201).json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Record check-out for staff
// @route   PUT /api/attendance/check-out
// @access  Private/Staff
exports.checkOut = async (req, res) => {
  try {
    // Check if user is staff
    if (req.user.role !== 'staff' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only staff can check out' });
    }
    
    // Find today's check-in record
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const record = await Attendance.findOne({
      staff: req.user.id,
      date: {
        $gte: today,
        $lt: tomorrow
      },
      checkOutTime: { $exists: false }
    });
    
    if (!record) {
      return res.status(400).json({ message: 'No active check-in found for today' });
    }
    
    // Update checkout time
    record.checkOutTime = new Date();
    
    await record.save();
    
    res.json(record);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get staff attendance by date range
// @route   GET /api/attendance
// @access  Private/Staff
exports.getMyAttendance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = { staff: req.user.id };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const attendance = await Attendance.find(query).sort({ date: -1 });
    
    res.json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all staff attendance (for admin)
// @route   GET /api/attendance/all
// @access  Private/Admin
exports.getAllAttendance = async (req, res) => {
  try {
    const { startDate, endDate, staffId } = req.query;
    
    let query = {};
    
    if (staffId) {
      query.staff = staffId;
    }
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const attendance = await Attendance.find(query)
      .populate('staff', 'name email')
      .sort({ date: -1 });
    
    res.json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update attendance record (for admin)
// @route   PUT /api/attendance/:id
// @access  Private/Admin
exports.updateAttendance = async (req, res) => {
  try {
    const { checkInTime, checkOutTime, status, notes } = req.body;
    
    const attendance = await Attendance.findById(req.params.id);
    
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    
    // Update fields
    if (checkInTime) attendance.checkInTime = checkInTime;
    if (checkOutTime) attendance.checkOutTime = checkOutTime;
    if (status) attendance.status = status;
    if (notes !== undefined) attendance.notes = notes;
    
    await attendance.save();
    
    res.json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get staff attendance summary
// @route   GET /api/attendance/summary
// @access  Private/Admin
exports.getAttendanceSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    // Default to current month if not specified
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();
    
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0);
    
    // Get all staff members
    const staffMembers = await User.find({ role: 'staff' }, '_id name email');
    
    // Get attendance for each staff
    const summaries = [];
    
    for (const staff of staffMembers) {
      const records = await Attendance.find({
        staff: staff._id,
        date: {
          $gte: startDate,
          $lte: endDate
        }
      });
      
      // Calculate stats
      let totalHours = 0;
      let presentDays = 0;
      let absentDays = 0;
      let lateDays = 0;
      
      records.forEach(record => {
        totalHours += record.totalHours || 0;
        
        if (record.status === 'Present') presentDays++;
        else if (record.status === 'Absent') absentDays++;
        else if (record.status === 'Late') lateDays++;
      });
      
      summaries.push({
        staff: {
          _id: staff._id,
          name: staff.name,
          email: staff.email
        },
        summary: {
          totalHours,
          presentDays,
          absentDays,
          lateDays,
          totalRecords: records.length
        }
      });
    }
    
    res.json(summaries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};