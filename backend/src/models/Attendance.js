const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  checkInTime: {
    type: Date,
    required: true
  },
  checkOutTime: {
    type: Date
  },
  totalHours: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late', 'Half-day', 'On Leave'],
    default: 'Present'
  },
  notes: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// Calculate total hours when checkout is recorded
attendanceSchema.pre('save', function(next) {
  if (this.checkInTime && this.checkOutTime) {
    const checkInTime = new Date(this.checkInTime);
    const checkOutTime = new Date(this.checkOutTime);
    
    // Calculate hours difference
    const diff = (checkOutTime - checkInTime) / (1000 * 60 * 60);
    this.totalHours = parseFloat(diff.toFixed(2));
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);