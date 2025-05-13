const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2'); // Import pagination plugin

const logSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
  level: {
    type: String,
    enum: ['info', 'warn', 'error', 'debug'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  userId: { // Optional: Link log to a specific user
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  ipAddress: { // Optional: Record IP address
    type: String,
  },
  // Add other relevant fields as needed, e.g., request details, component name
}, { timestamps: true }); // Use Mongoose timestamps for createdAt/updatedAt

// Index for faster querying by timestamp and level
logSchema.index({ timestamp: -1 });
logSchema.index({ level: 1 });

// Apply the pagination plugin to the schema
logSchema.plugin(mongoosePaginate);

const Log = mongoose.model('Log', logSchema);

module.exports = Log;
