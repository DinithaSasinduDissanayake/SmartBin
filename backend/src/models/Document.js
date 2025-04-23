const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Document name is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Document type is required'],
    enum: ['ID Card', 'Utility Bill', 'Driver License', 'Passport', 'Other'],
    default: 'Other'
  },
  filePath: {
    type: String,
    required: [true, 'File path is required']
  },
  mimeType: {
    type: String,
    required: [true, 'File type is required']
  },
  size: {
    type: Number,
    required: [true, 'File size is required']
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  verificationStatus: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending'
  },
  verificationDate: {
    type: Date
  },
  verificationNotes: {
    type: String
  }
});

// Indexes
documentSchema.index({ user: 1 }); // Index for querying by user
documentSchema.index({ type: 1 }); // Index for querying by document type
documentSchema.index({ verificationStatus: 1 }); // Index for querying by status

module.exports = mongoose.model('Document', documentSchema);