// backend/src/models/Budget.js
const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Budget category is required'],
    enum: {
      values: ['fuel', 'maintenance', 'salaries', 'utilities', 'equipment', 'office', 'rent', 'marketing', 'insurance', 'taxes', 'other'],
      message: '{VALUE} is not a supported category'
    },
    trim: true
  },
  periodType: {
    type: String,
    required: [true, 'Budget period type is required'],
    enum: ['Monthly', 'Quarterly', 'Yearly']
  },
  periodStartDate: {
    type: Date,
    required: [true, 'Budget period start date is required']
  },
  periodEndDate: {
    type: Date,
    required: [true, 'Budget period end date is required']
  },
  allocatedAmount: {
    type: Number,
    required: [true, 'Allocated budget amount is required'],
    min: [0, 'Allocated amount cannot be negative']
  },
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Indexes for efficient querying
budgetSchema.index({ category: 1 });
budgetSchema.index({ periodStartDate: 1, periodEndDate: 1 });
budgetSchema.index({ category: 1, periodStartDate: 1, periodEndDate: 1 });

// Validate that endDate is not before startDate
budgetSchema.pre('save', function(next) {
  if (this.periodEndDate < this.periodStartDate) {
    next(new Error('Period end date cannot be before period start date'));
  } else {
    next();
  }
});

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget;
