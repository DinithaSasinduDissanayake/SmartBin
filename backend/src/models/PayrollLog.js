const mongoose = require('mongoose');

const payrollLogSchema = new mongoose.Schema({
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  payPeriodStart: {
    type: Date,
    required: true
  },
  payPeriodEnd: {
    type: Date,
    required: true
  },
  baseSalary: { // Salary for the period (e.g., monthly salary if period is month)
    type: Number,
    required: true,
    min: 0
  },
  hoursWorked: { // Fetched/calculated from Attendance
    type: Number,
    default: 0
  },
  overtimeHours: {
     type: Number,
     default: 0
  },
  overtimeRate: { // Hourly rate for overtime
     type: Number,
     default: 0
  },
  bonusAmount: { // Calculated based on performance/attendance
    type: Number,
    default: 0
  },
  deductions: [{ // Array for itemized deductions
     name: { type: String, required: true }, // e.g., 'Income Tax', 'EPF', 'Loan'
     amount: { type: Number, required: true, min: 0 }
  }],
  netPay: { // Calculated: base + (ot_hours * ot_rate) + bonus - total_deductions
    type: Number,
    required: true,
    min: 0
  },
  paymentDate: { // Actual date payment was made
    type: Date
  },
  generatedDate: { // When the payroll record was calculated/created
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Pending Calculation', 'Pending Payment', 'Paid', 'Error'],
    default: 'Pending Calculation',
    index: true
  },
  calculationNotes: { // E.g., 'Bonus based on X criteria', 'Deduction for Y'
    type: String
  },
  transactionRef: { // Optional link to a Payment record if integrated
     type: String
  }
});

// Compound index for efficient querying of staff payroll history
payrollLogSchema.index({ staff: 1, payPeriodEnd: -1 });
payrollLogSchema.index({ status: 1 });

module.exports = mongoose.model('PayrollLog', payrollLogSchema);