const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewPeriod: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  metrics: {
    productivity: {
      type: Number,
      min: 0,
      max: 10,
      default: 0
    },
    quality: {
      type: Number,
      min: 0,
      max: 10,
      default: 0
    },
    reliability: {
      type: Number,
      min: 0,
      max: 10,
      default: 0
    },
    communication: {
      type: Number,
      min: 0,
      max: 10,
      default: 0
    },
    initiative: {
      type: Number,
      min: 0,
      max: 10,
      default: 0
    }
  },
  overallRating: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  feedback: {
    type: String
  },
  goals: [String],
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
performanceSchema.index({ staff: 1 }); // Index for querying by staff
performanceSchema.index({ reviewer: 1 }); // Index for querying by reviewer
performanceSchema.index({ 'reviewPeriod.endDate': -1 }); // Index for sorting/querying by review end date

// Calculate overall rating from individual metrics
performanceSchema.pre('save', function(next) {
  const metrics = this.metrics;
  const totalScore = metrics.productivity + metrics.quality + 
    metrics.reliability + metrics.communication + metrics.initiative;
  
  this.overallRating = parseFloat((totalScore / 5).toFixed(1));
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Performance', performanceSchema);