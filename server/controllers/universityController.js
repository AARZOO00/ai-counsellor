const University = require('../models/University');
const User = require('../models/User');
const ToDo = require('../models/ToDo');

// @desc    Get all universities for user
// @route   GET /api/universities
exports.getUniversities = async (req, res) => {
  try {
    const { status, category } = req.query;
    
    let query = { userId: req.user.id };
    
    if (status) query.status = status;
    if (category) query.category = category;
    
    const universities = await University.find(query).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      universities
    });
  } catch (error) {
    console.error('Get universities error:', error);
    res.status(500).json({ error: 'Failed to fetch universities' });
  }
};

// @desc    Shortlist a university
// @route   PUT /api/universities/:id/shortlist
exports.shortlistUniversity = async (req, res) => {
  try {
    const university = await University.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status: 'Shortlisted' },
      { new: true }
    );
    
    if (!university) {
      return res.status(404).json({ error: 'University not found' });
    }

    // Update user stage
    await User.findByIdAndUpdate(req.user.id, {
      currentStage: 'finalizing_universities'
    });
    
    res.json({
      success: true,
      university,
      message: `${university.name} has been shortlisted`
    });
  } catch (error) {
    console.error('Shortlist error:', error);
    res.status(500).json({ error: 'Failed to shortlist university' });
  }
};

// @desc    Lock a university (Commitment)
// @route   PUT /api/universities/:id/lock
exports.lockUniversity = async (req, res) => {
  try {
    const university = await University.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { 
        status: 'Locked',
        lockedAt: new Date()
      },
      { new: true }
    );
    
    if (!university) {
      return res.status(404).json({ error: 'University not found' });
    }

    // Update user stage
    await User.findByIdAndUpdate(req.user.id, {
      currentStage: 'preparing_applications'
    });

    // Create application to-dos
    const todos = [
      {
        userId: req.user.id,
        universityId: university._id,
        title: 'Complete Statement of Purpose (SOP)',
        description: `Write SOP for ${university.name}`,
        category: 'Document',
        priority: 'High',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      },
      {
        userId: req.user.id,
        universityId: university._id,
        title: 'Prepare Letters of Recommendation',
        description: 'Get 2-3 LORs from professors/employers',
        category: 'Document',
        priority: 'High',
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
      },
      {
        userId: req.user.id,
        universityId: university._id,
        title: 'Complete Application Form',
        description: `Fill out application for ${university.name}`,
        category: 'Application',
        priority: 'Urgent',
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
      },
      {
        userId: req.user.id,
        universityId: university._id,
        title: 'Submit Transcripts',
        description: 'Get official transcripts from current institution',
        category: 'Document',
        priority: 'High',
        deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000)
      }
    ];

    await ToDo.insertMany(todos);
    
    res.json({
      success: true,
      university,
      message: `${university.name} has been locked! Application to-dos created.`
    });
  } catch (error) {
    console.error('Lock university error:', error);
    res.status(500).json({ error: 'Failed to lock university' });
  }
};

// @desc    Unlock a university
// @route   PUT /api/universities/:id/unlock
exports.unlockUniversity = async (req, res) => {
  try {
    const university = await University.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { 
        status: 'Shortlisted',
        lockedAt: null
      },
      { new: true }
    );
    
    if (!university) {
      return res.status(404).json({ error: 'University not found' });
    }

    // Delete associated to-dos
    await ToDo.deleteMany({
      userId: req.user.id,
      universityId: university._id
    });
    
    res.json({
      success: true,
      university,
      message: `${university.name} has been unlocked`
    });
  } catch (error) {
    console.error('Unlock university error:', error);
    res.status(500).json({ error: 'Failed to unlock university' });
  }
};

// @desc    Remove university from list
// @route   DELETE /api/universities/:id
exports.removeUniversity = async (req, res) => {
  try {
    const university = await University.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status: 'Rejected' },
      { new: true }
    );
    
    if (!university) {
      return res.status(404).json({ error: 'University not found' });
    }
    
    res.json({
      success: true,
      message: `${university.name} removed from list`
    });
  } catch (error) {
    console.error('Remove university error:', error);
    res.status(500).json({ error: 'Failed to remove university' });
  }
};