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

/**
 * @desc    Export attendance report as PDF
 * @route   GET /api/attendance/reports/export
 * @access  Private/Admin
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.exportAttendanceReport = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const PDFDocument = require('pdfkit');
    
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
    
    // Create a PDF document
    const doc = new PDFDocument({
      margin: 50,
      size: 'A4'
    });
    
    // Set response headers for PDF download
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const reportFilename = `attendance-report-${monthNames[targetMonth]}-${targetYear}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${reportFilename}`);
    
    // Pipe the PDF to the response
    doc.pipe(res);
    
    // PDF Generation - Header
    doc.font('Helvetica-Bold').fontSize(18).text('SmartBin Staff Attendance Report', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(14).text(`Report for: ${monthNames[targetMonth]} ${targetYear}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`, { align: 'center' });
    doc.moveDown(2);
    
    // Use aggregation for potentially better performance
    const summaryData = await Attendance.aggregate([
      { $match: { 
        staff: { $in: staffMembers.map(s => s._id) },
        date: { $gte: startDate, $lte: endDate }
      }},
      { $group: {
        _id: '$staff',
        totalHours: { $sum: '$totalHours' },
        presentDays: { $sum: { $cond: [ { $eq: ['$status', 'Present'] }, 1, 0 ] } },
        absentDays: { $sum: { $cond: [ { $eq: ['$status', 'Absent'] }, 1, 0 ] } },
        lateDays: { $sum: { $cond: [ { $eq: ['$status', 'Late'] }, 1, 0 ] } },
        leaveDays: { $sum: { $cond: [ { $eq: ['$status', 'On Leave'] }, 1, 0 ] } }, 
        halfDays: { $sum: { $cond: [ { $eq: ['$status', 'Half-day'] }, 1, 0 ] } },
        totalRecords: { $sum: 1 }
      }},
      { $lookup: { // Join with users collection to get staff details
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'staffDetails'
      }},
      { $unwind: '$staffDetails' }, // Deconstruct the staffDetails array
      { $project: { // Shape the output
        _id: 0,
        staff: {
          _id: '$staffDetails._id',
          name: '$staffDetails.name',
          email: '$staffDetails.email'
        },
        totalHours: { $ifNull: ['$totalHours', 0] },
        presentDays: { $ifNull: ['$presentDays', 0] },
        absentDays: { $ifNull: ['$absentDays', 0] },
        lateDays: { $ifNull: ['$lateDays', 0] },
        leaveDays: { $ifNull: ['$leaveDays', 0] },
        halfDays: { $ifNull: ['$halfDays', 0] },
        totalRecords: { $ifNull: ['$totalRecords', 0] }
      }},
      { $sort: { 'staff.name': 1 } } // Sort by staff name
    ]);

    // Add staff members who had no records in the period
    const staffWithRecords = summaryData.map(s => s.staff._id.toString());
    const noRecordsStaff = [];
    
    staffMembers.forEach(staff => {
      if (!staffWithRecords.includes(staff._id.toString())) {
        noRecordsStaff.push({
          staff: { _id: staff._id, name: staff.name, email: staff.email },
          totalHours: 0, 
          presentDays: 0, 
          absentDays: 0, 
          lateDays: 0, 
          leaveDays: 0,
          halfDays: 0,
          totalRecords: 0
        });
      }
    });
    
    // Combine data
    const allStaffData = [...summaryData, ...noRecordsStaff];
    
    // Calculate department totals
    const departmentTotals = {
      totalHours: 0,
      presentDays: 0,
      absentDays: 0,
      lateDays: 0,
      leaveDays: 0,
      halfDays: 0,
      totalWorkingDays: 0
    };
    
    allStaffData.forEach(staff => {
      departmentTotals.totalHours += staff.totalHours;
      departmentTotals.presentDays += staff.presentDays;
      departmentTotals.absentDays += staff.absentDays;
      departmentTotals.lateDays += staff.lateDays;
      departmentTotals.leaveDays += staff.leaveDays;
      departmentTotals.halfDays += staff.halfDays;
    });
    
    // Get working days in the month (excluding weekends)
    let workingDaysCount = 0;
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 = Sunday, 6 = Saturday
        workingDaysCount++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    departmentTotals.totalWorkingDays = workingDaysCount;
    
    // Department summary section
    doc.font('Helvetica-Bold').fontSize(14).text('Department Summary', { underline: true });
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(11);
    
    doc.text(`Total Working Days in Month: ${departmentTotals.totalWorkingDays}`);
    doc.text(`Total Hours Logged: ${departmentTotals.totalHours.toFixed(2)}`);
    doc.text(`Average Daily Hours: ${(departmentTotals.totalHours / (departmentTotals.presentDays + departmentTotals.halfDays / 2)).toFixed(2) || 0}`);
    doc.text(`Total Present Days: ${departmentTotals.presentDays}`);
    doc.text(`Total Absent Days: ${departmentTotals.absentDays}`);
    doc.text(`Total Late Days: ${departmentTotals.lateDays}`);
    doc.text(`Total Leave Days: ${departmentTotals.leaveDays}`);
    doc.text(`Total Half Days: ${departmentTotals.halfDays}`);
    
    doc.moveDown(2);
    
    // Staff attendance table
    doc.font('Helvetica-Bold').fontSize(14).text('Staff Attendance Details', { underline: true });
    doc.moveDown(0.5);
    
    // Table header
    const tableTop = doc.y + 20;
    doc.font('Helvetica-Bold').fontSize(10);
    
    const colWidths = {
      name: 130,
      hours: 60,
      present: 60,
      absent: 60,
      late: 60,
      leave: 60,
      halfDay: 60,
      perf: 60
    };
    
    // Column headers
    doc.text('Staff Name', 50, tableTop);
    doc.text('Total Hours', 50 + colWidths.name, tableTop);
    doc.text('Present', 50 + colWidths.name + colWidths.hours, tableTop);
    doc.text('Absent', 50 + colWidths.name + colWidths.hours + colWidths.present, tableTop);
    doc.text('Late', 50 + colWidths.name + colWidths.hours + colWidths.present + colWidths.absent, tableTop);
    doc.text('Leave', 50 + colWidths.name + colWidths.hours + colWidths.present + colWidths.absent + colWidths.late, tableTop);
    doc.text('Half Days', 50 + colWidths.name + colWidths.hours + colWidths.present + colWidths.absent + colWidths.late + colWidths.leave, tableTop);
    
    // Draw horizontal line after header
    doc.moveTo(50, tableTop + 15)
       .lineTo(50 + colWidths.name + colWidths.hours + colWidths.present + colWidths.absent + colWidths.late + colWidths.leave + colWidths.halfDay, tableTop + 15)
       .stroke();
    
    // Table rows
    let rowY = tableTop + 25;
    doc.font('Helvetica').fontSize(10);
    
    // Function to add a page if we're running out of space
    const checkAndAddPage = (y) => {
      if (y > 700) {
        doc.addPage();
        // Add header to new page
        doc.font('Helvetica-Bold').fontSize(14).text('Staff Attendance Details (Continued)', { underline: true });
        doc.moveDown(0.5);
        
        // Draw header row on new page
        const newTableTop = doc.y + 15;
        doc.font('Helvetica-Bold').fontSize(10);
        doc.text('Staff Name', 50, newTableTop);
        doc.text('Total Hours', 50 + colWidths.name, newTableTop);
        doc.text('Present', 50 + colWidths.name + colWidths.hours, newTableTop);
        doc.text('Absent', 50 + colWidths.name + colWidths.hours + colWidths.present, newTableTop);
        doc.text('Late', 50 + colWidths.name + colWidths.hours + colWidths.present + colWidths.absent, newTableTop);
        doc.text('Leave', 50 + colWidths.name + colWidths.hours + colWidths.present + colWidths.absent + colWidths.late, newTableTop);
        doc.text('Half Days', 50 + colWidths.name + colWidths.hours + colWidths.present + colWidths.absent + colWidths.late + colWidths.leave, newTableTop);
        
        // Draw horizontal line after header
        doc.moveTo(50, newTableTop + 15)
           .lineTo(50 + colWidths.name + colWidths.hours + colWidths.present + colWidths.absent + colWidths.late + colWidths.leave + colWidths.halfDay, newTableTop + 15)
           .stroke();
        
        doc.font('Helvetica').fontSize(10);
        return newTableTop + 25;
      }
      return y;
    };
    
    // Draw each staff's row
    allStaffData.forEach((staff, i) => {
      rowY = checkAndAddPage(rowY);
      
      doc.text(staff.staff.name, 50, rowY);
      doc.text(staff.totalHours.toFixed(2), 50 + colWidths.name, rowY);
      doc.text(staff.presentDays.toString(), 50 + colWidths.name + colWidths.hours, rowY);
      doc.text(staff.absentDays.toString(), 50 + colWidths.name + colWidths.hours + colWidths.present, rowY);
      doc.text(staff.lateDays.toString(), 50 + colWidths.name + colWidths.hours + colWidths.present + colWidths.absent, rowY);
      doc.text(staff.leaveDays.toString(), 50 + colWidths.name + colWidths.hours + colWidths.present + colWidths.absent + colWidths.late, rowY);
      doc.text(staff.halfDays.toString(), 50 + colWidths.name + colWidths.hours + colWidths.present + colWidths.absent + colWidths.late + colWidths.leave, rowY);
      
      rowY += 20;
    });
    
    // Draw bottom border
    doc.moveTo(50, rowY - 10)
       .lineTo(50 + colWidths.name + colWidths.hours + colWidths.present + colWidths.absent + colWidths.late + colWidths.leave + colWidths.halfDay, rowY - 10)
       .stroke();
    
    doc.moveDown(2);
    
    // Get staff with perfect attendance (all working days present)
    const perfectAttendance = allStaffData.filter(staff => 
      staff.presentDays + staff.halfDays / 2 + staff.leaveDays >= workingDaysCount);
    
    if (perfectAttendance.length > 0) {
      rowY = checkAndAddPage(rowY + 25);
      
      doc.font('Helvetica-Bold').fontSize(12).text('Staff with Perfect Attendance', 50, rowY);
      rowY += 20;
      
      doc.font('Helvetica').fontSize(10);
      perfectAttendance.forEach((staff, i) => {
        rowY = checkAndAddPage(rowY);
        doc.text(`${i+1}. ${staff.staff.name} - ${staff.presentDays} days present, ${staff.leaveDays} approved leaves`, 50, rowY);
        rowY += 15;
      });
    }
    
    // Staff with attendance issues (more than 2 absences or lates)
    const attendanceIssues = allStaffData.filter(staff => 
      staff.absentDays > 2 || staff.lateDays > 3);
    
    if (attendanceIssues.length > 0) {
      rowY = checkAndAddPage(rowY + 25);
      
      doc.font('Helvetica-Bold').fontSize(12).text('Staff with Attendance Concerns', 50, rowY);
      rowY += 20;
      
      doc.font('Helvetica').fontSize(10);
      attendanceIssues.forEach((staff, i) => {
        rowY = checkAndAddPage(rowY);
        doc.text(`${i+1}. ${staff.staff.name} - ${staff.absentDays} absences, ${staff.lateDays} late arrivals`, 50, rowY);
        rowY += 15;
      });
    }
    
    // PDF notes
    rowY = checkAndAddPage(rowY + 40);
    doc.font('Helvetica-Bold').fontSize(12).text('Notes:', 50, rowY);
    rowY += 20;
    
    doc.font('Helvetica').fontSize(10);
    doc.text('- This report provides a summary of staff attendance for the specified month.', 50, rowY);
    rowY += 15;
    doc.text('- Working days exclude weekends and public holidays.', 50, rowY);
    rowY += 15;
    doc.text('- Half days are counted as 0.5 days for attendance calculation purposes.', 50, rowY);
    rowY += 15;
    doc.text(`- Report generated by ${req.user.name} on ${new Date().toLocaleDateString()}.`, 50, rowY);
    
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
    console.error('Error generating attendance report:', error);
    next(error);
  }
};

/**
 * @desc    Get detailed attendance report for a specific period
 * @route   GET /api/attendance/reports/detailed
 * @access  Private/Admin
 * @param   {object} req - Express request object
 * @param   {object} res - Express response object
 * @param   {function} next - Express next middleware function
 */
exports.getDetailedAttendanceReport = async (req, res, next) => {
  try {
    const { startDate, endDate, staffId } = req.query;
    
    if (!startDate || !endDate) {
      throw new BadRequestError('Start and end dates are required');
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include all of end date
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestError('Invalid date format');
    }
    
    // Get working days in the period (excluding weekends)
    let workingDaysCount = 0;
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 = Sunday, 6 = Saturday
        workingDaysCount++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    let query = {};
    
    // If staffId is provided, filter by that staff member
    if (staffId) {
      if (!mongoose.Types.ObjectId.isValid(staffId)) {
        throw new BadRequestError('Invalid staffId format');
      }
      query.staff = staffId;
    }
    
    // Add date range to query
    query.date = { $gte: start, $lte: end };
    
    // Get all attendance records in the period
    const attendanceRecords = await Attendance.find(query)
      .populate('staff', 'name email')
      .sort({ date: 1, staff: 1 });
    
    // Group records by staff member
    const recordsByStaff = {};
    attendanceRecords.forEach(record => {
      const staffId = record.staff._id.toString();
      if (!recordsByStaff[staffId]) {
        recordsByStaff[staffId] = {
          staffInfo: {
            id: record.staff._id,
            name: record.staff.name,
            email: record.staff.email
          },
          records: [],
          summary: {
            totalHours: 0,
            presentDays: 0,
            absentDays: 0,
            lateDays: 0,
            leaveDays: 0,
            halfDays: 0,
            attendanceRate: 0
          }
        };
      }
      
      // Add record to staff's records
      recordsByStaff[staffId].records.push({
        id: record._id,
        date: record.date,
        checkInTime: record.checkInTime,
        checkOutTime: record.checkOutTime,
        totalHours: record.totalHours,
        status: record.status,
        notes: record.notes
      });
      
      // Update summary
      recordsByStaff[staffId].summary.totalHours += record.totalHours || 0;
      
      switch(record.status) {
        case 'Present':
          recordsByStaff[staffId].summary.presentDays++;
          break;
        case 'Absent':
          recordsByStaff[staffId].summary.absentDays++;
          break;
        case 'Late':
          recordsByStaff[staffId].summary.lateDays++;
          break;
        case 'On Leave':
          recordsByStaff[staffId].summary.leaveDays++;
          break;
        case 'Half-day':
          recordsByStaff[staffId].summary.halfDays++;
          break;
      }
    });
    
    // Calculate attendance rate for each staff member
    Object.values(recordsByStaff).forEach(staff => {
      const attendanceDays = staff.summary.presentDays + (staff.summary.halfDays / 2) + staff.summary.leaveDays;
      staff.summary.attendanceRate = parseFloat(((attendanceDays / workingDaysCount) * 100).toFixed(2));
      
      // Add work days with no records
      if (staff.summary.presentDays + staff.summary.absentDays + staff.summary.lateDays + 
          staff.summary.leaveDays + staff.summary.halfDays < workingDaysCount) {
        staff.summary.missingRecords = workingDaysCount - (staff.summary.presentDays + staff.summary.absentDays + 
                                      staff.summary.lateDays + staff.summary.leaveDays + staff.summary.halfDays);
      } else {
        staff.summary.missingRecords = 0;
      }
    });
    
    // Convert to array and sort by name
    const reportData = Object.values(recordsByStaff).sort((a, b) => 
      a.staffInfo.name.localeCompare(b.staffInfo.name)
    );
    
    // Return the report data
    res.json({
      periodInfo: {
        startDate: start,
        endDate: end,
        workingDays: workingDaysCount
      },
      staffReports: reportData
    });
    
  } catch (error) {
    console.error('Error generating detailed attendance report:', error);
    next(error);
  }
};