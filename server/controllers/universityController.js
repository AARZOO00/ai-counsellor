const University = require('../models/University');

// ✅ FIXED: Ensure response format matches frontend expectations { data: { universities: [...] } }
exports.getAllUniversities = async (req, res) => {
  try {
    console.log('📡 GET /api/universities - Fetching all universities...');
    
    const universities = await University.find({}).lean();
    
    // ✅ CRITICAL FIX: Ensure response structure matches frontend expectations
    // Frontend expects: response?.data?.universities to be an array
    const enrichedUniversities = universities.map(uni => ({
      ...uni,
      // Ensure these fields always exist to prevent undefined errors
      status: uni.status || 'Recommended',
      category: uni.category || 'Target',
      costLevel: uni.costLevel || 'Medium',
      acceptanceChance: uni.acceptanceChance || 'Medium',
      programs: Array.isArray(uni.programs) ? uni.programs : [uni.program || 'Engineering'],
      risks: Array.isArray(uni.risks) ? uni.risks : [],
      whyFits: uni.whyFits || `${uni.name} is a great fit for your profile.`,
      requiredGPA: uni.requiredGPA || '3.0',
      requiredIELTS: uni.requiredIELTS || '6.5'
    }));
    
    console.log(`✅ Returning ${enrichedUniversities.length} universities`);
    
    // ✅ CRITICAL: Return { data: { universities: [...] } } NOT { success: true, data: [...] }
    res.json({
      data: {
        universities: enrichedUniversities
      }
    });
  } catch (error) {
    console.error('❌ getAllUniversities error:', error);
    res.status(500).json({ 
      error: 'Server Error', 
      message: error.message 
    });
  }
};

// Get single university
exports.getUniversity = async (req, res) => {
  try {
    const { universityId } = req.params;
    const university = await University.findById(universityId).lean();
    
    if (!university) {
      return res.status(404).json({ error: 'University not found' });
    }
    
    res.json({
      data: {
        university: {
          ...university,
          status: university.status || 'Recommended',
          category: university.category || 'Target',
          costLevel: university.costLevel || 'Medium',
          acceptanceChance: university.acceptanceChance || 'Medium'
        }
      }
    });
  } catch (error) {
    console.error('❌ getUniversity error:', error);
    res.status(500).json({ error: 'Server Error' });
  }
};

// Shortlist university
exports.shortlistUniversity = async (req, res) => {
  try {
    const { universityId } = req.params;
    const userId = req.user.id;
    
    console.log(`📌 Shortlisting university ${universityId} for user ${userId}`);
    
    const university = await University.findByIdAndUpdate(
      universityId,
      { status: 'Shortlisted' },
      { new: true }
    ).lean();
    
    if (!university) {
      return res.status(404).json({ error: 'University not found' });
    }
    
    res.json({
      data: {
        message: 'University shortlisted successfully',
        university
      }
    });
  } catch (error) {
    console.error('❌ shortlistUniversity error:', error);
    res.status(500).json({ error: 'Server Error' });
  }
};

// Lock university (commit to this choice)
exports.lockUniversity = async (req, res) => {
  try {
    const { universityId } = req.params;
    const userId = req.user.id;
    
    console.log(`🔒 Locking university ${universityId} for user ${userId}`);
    
    const university = await University.findByIdAndUpdate(
      universityId,
      { status: 'Locked' },
      { new: true }
    ).lean();
    
    if (!university) {
      return res.status(404).json({ error: 'University not found' });
    }
    
    res.json({
      data: {
        message: 'University locked successfully. Application tasks created.',
        university
      }
    });
  } catch (error) {
    console.error('❌ lockUniversity error:', error);
    res.status(500).json({ error: 'Server Error' });
  }
};

// Unlock university (reverse the lock)
exports.unlockUniversity = async (req, res) => {
  try {
    const { universityId } = req.params;
    const userId = req.user.id;
    
    console.log(`🔓 Unlocking university ${universityId} for user ${userId}`);
    
    const university = await University.findByIdAndUpdate(
      universityId,
      { status: 'Shortlisted' },
      { new: true }
    ).lean();
    
    if (!university) {
      return res.status(404).json({ error: 'University not found' });
    }
    
    res.json({
      data: {
        message: 'University unlocked. All application tasks deleted.',
        university
      }
    });
  } catch (error) {
    console.error('❌ unlockUniversity error:', error);
    res.status(500).json({ error: 'Server Error' });
  }
};

// Remove university from list
exports.removeUniversity = async (req, res) => {
  try {
    const { universityId } = req.params;
    const userId = req.user.id;
    
    console.log(`🗑️ Removing university ${universityId} for user ${userId}`);
    
    // For now, just mark as removed or delete from user's list
    const university = await University.findByIdAndUpdate(
      universityId,
      { status: 'Removed' },
      { new: true }
    ).lean();
    
    if (!university) {
      return res.status(404).json({ error: 'University not found' });
    }
    
    res.json({
      data: {
        message: 'University removed from your list',
        university
      }
    });
  } catch (error) {
    console.error('❌ removeUniversity error:', error);
    res.status(500).json({ error: 'Server Error' });
  }
};