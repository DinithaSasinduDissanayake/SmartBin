const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['fuel', 'maintenance', 'salaries', 'utilities', 'equipment', 'office', 'rent', 'marketing', 'insurance', 'taxes', 'other'],
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Expense amount is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  date: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receipt: {
    type: String, // URL to uploaded receipt image
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'bank_transfer', 'company_account', 'other'],
    default: 'company_account'
  },
  tags: [String]
});

// Add indexes for faster querying
expenseSchema.index({ date: -1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Expense', expenseSchema);