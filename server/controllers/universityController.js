const University = require('../models/University');

exports.getAllUniversities = async (req, res) => {
  try {
    // Database se 100 universities fetch karo
    const universities = await University.find({}).limit(100);
    
    console.log(`Sending ${universities.length} universities`); // Console mein check karein
    
    res.json({
      success: true,
      data: universities
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
};

// Baaki functions (shortlist, lock etc.)
exports.shortlistUniversity = async (req, res) => res.json({ success: true });
exports.lockUniversity = async (req, res) => res.json({ success: true });
exports.removeUniversity = async (req, res) => res.json({ success: true });
exports.unlockUniversity = async (req, res) => res.json({ success: true });