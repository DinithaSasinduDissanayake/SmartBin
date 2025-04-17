const mongoose = require('mongoose');

const userSubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subscriptionPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'pending'],
    default: 'active'
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  lastBillingDate: {
    type: Date,
    default: Date.now
  },
  nextBillingDate: {
    type: Date,
    required: true
  }
});

// Add indexes for faster querying
userSubscriptionSchema.index({ user: 1 });
userSubscriptionSchema.index({ status: 1 });
userSubscriptionSchema.index({ nextBillingDate: 1 });

module.exports = mongoose.model('UserSubscription', userSubscriptionSchema);