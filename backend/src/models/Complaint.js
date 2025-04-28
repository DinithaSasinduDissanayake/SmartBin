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
    index: true // Index for filtering by status
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

module.exports = mongoose.model('Complaint', complaintSchema);