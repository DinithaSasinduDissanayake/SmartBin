const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  user: { // User who submitted the complaint
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Index for faster lookup of user's complaints
  },
  subject: {
    type: String,
    required: [true, 'Complaint subject is required'],
    trim: true,
    maxlength: [150, 'Subject cannot exceed 150 characters']
  },
  description: {
    type: String,
    required: [true, 'Complaint description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  status: { 
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open',
  },
  // Reference to PickupRequest or other related entities if applicable
  relatedRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    // ref: 'PickupRequest' // Uncomment if PickupRequest model exists
  },
  assignedAdmin: { // Admin/Staff handling the complaint
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Initially unassigned
    index: true
  },
  resolutionNotes: {
    type: String,
    default: ''
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware to update `updatedAt` timestamp on save
complaintSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Optional: Add index for sorting by date
complaintSchema.index({ createdAt: -1 });

// Compound index for combined filtering (common in admin dashboard queries)
complaintSchema.index({ status: 1, createdAt: -1 });

// Compound index for user filtering with date sorting (common in user dashboard)
complaintSchema.index({ user: 1, createdAt: -1 });

// Compound index for admin assignment queries
complaintSchema.index({ assignedAdmin: 1, status: 1 });

// Text index for search functionality
complaintSchema.index({ subject: 'text', description: 'text' }, { 
  weights: {
    subject: 3,   // Give more weight to matches in subject
    description: 1
  },
  name: "complaint_text_index"
});

module.exports = mongoose.model('Complaint', complaintSchema);