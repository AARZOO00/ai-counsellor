const University = require('../models/University');

// ✅ FIX 1: Return data in correct format matching frontend expectations
exports.getAllUniversities = async (req, res) => {
  try {
    // Database se universities fetch with status and category fields
    const universities = await University.find({})
      .select('name country ranking programs tuitionFee acceptanceRate location category website status costLevel requiredGPA requiredIELTS whyFits risks')
      .limit(100)
      .lean(); // Use lean() for better performance
    
    console.log(`✅ Sending ${universities.length} universities to frontend`);
    
    // Ensure all universities have required status & category fields
    const enrichedUniversities = universities.map(uni => {
      // Parse acceptance rate to generate acceptanceChance
      const acceptanceRate = parseInt(uni.acceptanceRate);
      let acceptanceChance = 'Medium';
      if (acceptanceRate > 60) acceptanceChance = 'High';
      else if (acceptanceRate < 30) acceptanceChance = 'Low';
      
      return {
        _id: uni._id,
        name: uni.name,
        country: uni.country,
        ranking: uni.ranking,
        programs: uni.programs || [],
        tuitionFee: uni.tuitionFee || 0,
        acceptanceRate: uni.acceptanceRate || '50%',
        acceptanceChance: acceptanceChance, // Add computed field
        location: uni.location || uni.country,
        category: uni.category || 'Target', // Ensure category exists
        website: uni.website,
        status: uni.status || 'Recommended', // Ensure status exists (default to Recommended)
        costLevel: uni.costLevel || 'Medium',
        requiredGPA: uni.requiredGPA,
        requiredIELTS: uni.requiredIELTS,
        whyFits: uni.whyFits,
        risks: uni.risks
      };
    });
    
    // CRITICAL: Return in exact format frontend expects
    res.json({
      success: true,
      data: {
        universities: enrichedUniversities, // Frontend expects response.data.universities
        count: enrichedUniversities.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ University fetch error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch universities',
      message: error.message 
    });
  }
};

// ✅ FIX 2: Implement missing university management endpoints
exports.shortlistUniversity = async (req, res) => {
  try {
    const { id } = req.params;
    const university = await University.findByIdAndUpdate(
      id,
      { status: 'Shortlisted', updatedAt: new Date() },
      { new: true }
    );
    res.json({ success: true, message: 'University shortlisted', data: university });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to shortlist' });
  }
};

exports.lockUniversity = async (req, res) => {
  try {
    const { id } = req.params;
    const university = await University.findByIdAndUpdate(
      id,
      { status: 'Locked', updatedAt: new Date() },
      { new: true }
    );
    res.json({ success: true, message: 'University locked', data: university });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to lock' });
  }
};

exports.unlockUniversity = async (req, res) => {
  try {
    const { id } = req.params;
    const university = await University.findByIdAndUpdate(
      id,
      { status: 'Recommended', updatedAt: new Date() },
      { new: true }
    );
    res.json({ success: true, message: 'University unlocked', data: university });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to unlock' });
  }
};

exports.removeUniversity = async (req, res) => {
  try {
    const { id } = req.params;
    await University.findByIdAndDelete(id);
    res.json({ success: true, message: 'University removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to remove' });
  }
};
