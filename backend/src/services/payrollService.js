const Attendance = require('../models/Attendance');
const Performance = require('../models/Performance');
const User = require('../models/User');
const PayrollLog = require('../models/PayrollLog');
const { BadRequestError } = require('../errors');

/**
 * Calculates payroll details for a specific staff member for a given period.
 * This is a complex function and needs detailed business logic.
 *
 * @param {string} staffId - The ID of the staff member.
 * @param {Date} periodStart - The start date of the pay period.
 * @param {Date} periodEnd - The end date of the pay period.
 * @returns {Promise<object>} Object containing calculated payroll data (baseSalary, bonusAmount, deductions, netPay, etc.)
 */
const calculatePayrollForStaff = async (staffId, periodStart, periodEnd) => {
    console.log(`Calculating payroll for staff ${staffId} from ${periodStart.toISOString()} to ${periodEnd.toISOString()}`);

    const staffUser = await User.findById(staffId);
    if (!staffUser || staffUser.role !== 'staff') {
        throw new BadRequestError(`User ${staffId} not found or is not staff.`);
    }

    // --- 1. Fetch Base Salary ---
    // TODO: Determine where base salary is stored (User model? Separate config? Contract model?)
    // Example: Assuming it's stored on the User model (add this field if needed)
    const baseSalary = staffUser.baseSalary || 30000; // Placeholder: Get actual base salary
    const hourlyRate = staffUser.hourlyRate || (baseSalary / (4 * 40)); // Example hourly rate calculation
    const overtimeRate = hourlyRate * 1.5; // Example overtime rate

    // --- 2. Fetch Attendance Data ---
    const attendanceRecords = await Attendance.find({
        staff: staffId,
        date: { $gte: periodStart, $lte: periodEnd },
        // status: 'Present' // Optionally filter by status
    });

    let totalHoursWorked = 0;
    attendanceRecords.forEach(record => {
        totalHoursWorked += record.totalHours || 0;
    });
    // TODO: Implement more sophisticated logic (e.g., handling missing checkouts, minimum hours)

    // --- 3. Calculate Overtime ---
    // TODO: Define standard working hours per period (e.g., 40 hrs/week * weeks in period)
    const standardHoursForPeriod = 160; // Placeholder
    const overtimeHours = Math.max(0, totalHoursWorked - standardHoursForPeriod);

    // --- 4. Fetch Performance Data ---
    // TODO: Fetch relevant performance reviews/metrics for the period
    const performanceRecords = await Performance.find({
        staff: staffId,
        'reviewPeriod.endDate': { $gte: periodStart, $lte: periodEnd } // Example: reviews ending in the period
    });
    // Example: Calculate average rating for the period
    let averageRating = 0;
    if (performanceRecords.length > 0) {
        averageRating = performanceRecords.reduce((sum, record) => sum + (record.overallRating || 0), 0) / performanceRecords.length;
    }

    // --- 5. Calculate Bonus Amount ---
    // TODO: Implement bonus logic based on attendance, performance, KPIs etc. (Proposal 3.2.2 Obj 7)
    let bonusAmount = 0;
    if (averageRating > 8.5) bonusAmount += 500; // Example: Bonus for high performance
    // Add bonus for attendance based on attendanceRecords (e.g., no absences)
    // Example: Check for perfect attendance (needs more detailed attendance data)
    const presentDays = attendanceRecords.filter(r => r.status === 'Present').length;
    // const totalDaysInPeriod = ... calculate business days ...
    // if (presentDays === totalDaysInPeriod) bonusAmount += 200; // Example attendance bonus


    // --- 6. Calculate Deductions ---
    // TODO: Implement deduction logic (taxes, EPF/ETF, loans, etc.)
    const deductions = [];
    // Example: Simple tax deduction
    const taxableIncome = baseSalary + bonusAmount + (overtimeHours * overtimeRate);
    if (taxableIncome > 25000) { // Example threshold
        deductions.push({ name: 'Income Tax (PAYE)', amount: parseFloat((taxableIncome * 0.05).toFixed(2)) }); // Example 5% tax
    }
    // Add EPF/ETF based on Sri Lankan regulations if applicable

    const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);

    // --- 7. Calculate Net Pay ---
    const netPay = parseFloat(
      (baseSalary + (overtimeHours * overtimeRate) + bonusAmount - totalDeductions).toFixed(2)
    );

    console.log(`Calculation results for ${staffId}: Base=${baseSalary}, Bonus=${bonusAmount}, OT=${overtimeHours}hrs, Deductions=${totalDeductions}, Net=${netPay}`);

    return {
        baseSalary,
        hoursWorked: parseFloat(totalHoursWorked.toFixed(2)),
        overtimeHours: parseFloat(overtimeHours.toFixed(2)),
        overtimeRate,
        bonusAmount: parseFloat(bonusAmount.toFixed(2)),
        deductions, // Array of deduction objects
        netPay,
        calculationNotes: `Avg Rating: ${averageRating.toFixed(1)}. OT Hours: ${overtimeHours.toFixed(1)}. Bonus: ${bonusAmount.toFixed(2)}.` // Example notes
    };
};

/**
 * Generates or retrieves a PayrollLog entry for a staff member and period.
 *
 * @param {string} staffId
 * @param {Date} periodStart
 * @param {Date} periodEnd
 * @returns {Promise<PayrollLog>}
 */
const generateOrGetPayrollLog = async (staffId, periodStart, periodEnd) => {
    // Check if a log already exists
    let payrollLog = await PayrollLog.findOne({
        staff: staffId,
        payPeriodStart: periodStart,
        payPeriodEnd: periodEnd
    });

    if (payrollLog && payrollLog.status !== 'Pending Calculation' && payrollLog.status !== 'Error') {
        console.log(`Payroll log already exists and calculated for ${staffId}, period ending ${periodEnd.toISOString().split('T')[0]}`);
        return payrollLog; // Return existing calculated log
    }

    try {
        const calculatedData = await calculatePayrollForStaff(staffId, periodStart, periodEnd);

        if (payrollLog) {
            // Update existing pending/error log
            payrollLog.set({
                ...calculatedData,
                status: 'Pending Payment', // Update status after successful calculation
                generatedDate: new Date()
            });
        } else {
            // Create new log
            payrollLog = new PayrollLog({
                staff: staffId,
                payPeriodStart: periodStart,
                payPeriodEnd: periodEnd,
                ...calculatedData,
                status: 'Pending Payment' // Set status after successful calculation
            });
        }

        await payrollLog.save();
        console.log(`Successfully generated/updated payroll log for ${staffId}, period ending ${periodEnd.toISOString().split('T')[0]}`);
        return payrollLog;
    } catch (error) {
         console.error(`Error calculating payroll for staff ${staffId}:`, error);
        // Log the error state if creating/updating fails
         if (payrollLog) {
             payrollLog.status = 'Error';
             payrollLog.calculationNotes = `Calculation failed: ${error.message}`;
             await payrollLog.save().catch(saveErr => console.error('Failed to save error state to payroll log:', saveErr));
         } else {
             // Create a log indicating the error if one didn't exist
             payrollLog = new PayrollLog({
                staff: staffId,
                payPeriodStart: periodStart,
                payPeriodEnd: periodEnd,
                status: 'Error',
                calculationNotes: `Initial calculation failed: ${error.message}`,
                // Set default numeric values to avoid validation errors on error save
                baseSalary: 0, netPay: 0
             });
             await payrollLog.save().catch(saveErr => console.error('Failed to save initial error state to payroll log:', saveErr));
         }
        throw error; // Re-throw the error to be handled by the controller
    }
};


module.exports = {
    calculatePayrollForStaff,
    generateOrGetPayrollLog
};