const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true
  },
  responses: [{
    question: String,
    answer: String,
    category: String
  }],
  results: {
    topCareerPaths: [String],
    strengths: [String],
    recommendations: String,
    confidence: Number
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Assessment', assessmentSchema);