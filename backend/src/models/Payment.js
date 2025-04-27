const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'requires_action'],
    default: 'completed'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'bank_transfer', 'cash', 'paypal', 'other'],
    default: 'credit_card'
  },
  userSubscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserSubscription',
    required: false // Allow payments not tied to a subscription
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    default: 'USD' // Default currency
  },
  invoiceNumber: {
    type: String,
    unique: true,
    default: () => 'INV-' + Math.floor(100000 + Math.random() * 900000)
  },
  transactionId: String,
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed, // Stores flexible JSON
    select: false // Don't return by default in queries
  }
});

// Add indexes for faster querying
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ user: 1 });
paymentSchema.index({ userSubscription: 1 }); // Index for filtering by user subscription

module.exports = mongoose.model('Payment', paymentSchema);