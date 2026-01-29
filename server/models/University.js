const mongoose = require('mongoose');

const UniversitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  ranking: { type: Number },
  programs: [String],
  tuitionFees: { type: String },  // String rakhein taaki "$50,000" likh sakein
  acceptanceRate: { type: String }, // String rakhein taaki "5%" likh sakein (Error yahan tha)
  location: { type: String },
  website: { type: String },
  category: { type: String, enum: ['Dream', 'Target', 'Safe'], default: 'Target' }
});

module.exports = mongoose.model('University', UniversitySchema);