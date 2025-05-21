const mongoose = require('mongoose');

const salaryPackageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Salary package name is required'],
    trim: true,
    unique: true
  },
  basicSalary: {
    type: Number,
    required: [true, 'Basic salary is required'],
  },
  bonusPerHour: {
    type: Number,
    default: 0,
  },
  deductionPercentage: {
    type: Number,
    default: 0,
    min: [0, 'Deduction percentage cannot be less than 0.'],
    max: [100, 'Deduction percentage cannot be more than 100.'],
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SalaryPackage', salaryPackageSchema);