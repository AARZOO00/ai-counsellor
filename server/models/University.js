const mongoose = require('mongoose');

const universitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // University Details
  name: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  program: String,
  
  // Categorization
  category: {
    type: String,
    enum: ['Dream', 'Target', 'Safe'],
    required: true
  },
  
  // Metrics
  tuitionFee: Number,
  acceptanceRate: Number,
  requiredGPA: Number,
  requiredIELTS: Number,
  
  // AI Analysis
  whyFits: String,
  risks: [String],
  costLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High']
  },
  acceptanceChance: {
    type: String,
    enum: ['Low', 'Medium', 'High']
  },
  
  // Status
  status: {
    type: String,
    enum: ['Recommended', 'Shortlisted', 'Locked', 'Rejected'],
    default: 'Recommended'
  },
  
  lockedAt: Date,
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('University', universitySchema);