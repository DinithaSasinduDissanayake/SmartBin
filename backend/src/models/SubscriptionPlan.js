const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true,
    unique: true
  },
  price: {
    type: Number, // Changed from String to Number
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'] // Added validation for non-negative price
  },
  subscriberCount: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    default: 'This subscription plan includes basic waste collection services, weekly pickup, and access to the SmartBin mobile app.'
  },
  features: {
    type: [String], // Array of strings describing features
    default: []
  },
  duration: {
    type: String,
    enum: ['Monthly', 'Quarterly', 'Semi-Annual', 'Annual'],
    default: 'Monthly'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
subscriptionPlanSchema.index({ price: 1 }); // Index for sorting/querying by price
subscriptionPlanSchema.index({ name: 1, status: 1 }); // Index for finding active plans by name

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);