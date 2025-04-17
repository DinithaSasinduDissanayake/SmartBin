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
  duration: {
    type: String,
    enum: ['Monthly', 'Quarterly', 'Semi-Annual', 'Annual'],
    default: 'Monthly'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);