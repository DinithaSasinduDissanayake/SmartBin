const mongoose = require('mongoose');

const salaryPackageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Salary package name is required'],
    trim: true,
    unique: true
  },
  basicSalary: {
    type: String,
    required: [true, 'Basic salary is required'],
    trim: true
  },
  bonusPerHour: {
    type: String,
    required: [true, 'Bonus per hour is required'],
    trim: true
  },
  deductionPercentage: {
    type: String,
    required: [true, 'Deduction percentage is required'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SalaryPackage', salaryPackageSchema);