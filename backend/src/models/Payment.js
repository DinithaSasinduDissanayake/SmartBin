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
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'completed'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'bank_transfer', 'cash', 'paypal', 'other'],
    default: 'credit_card'
  },
  subscriptionPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
    required: false
  },
  invoiceNumber: {
    type: String,
    unique: true,
    default: () => 'INV-' + Math.floor(100000 + Math.random() * 900000)
  },
  transactionId: String
});

// Add indexes for faster querying
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ user: 1 });

module.exports = mongoose.model('Payment', paymentSchema);