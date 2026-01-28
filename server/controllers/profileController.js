const Profile = require('../models/Profile');
const User = require('../models/User');

// @desc    Create/Update profile (Onboarding)
// @route   POST /api/profile
exports.createOrUpdateProfile = async (req, res) => {
  try {
    const profileData = {
      userId: req.user.id,
      ...req.body
    };

    let profile = await Profile.findOne({ userId: req.user.id });

    if (profile) {
      // Update existing profile
      profile = await Profile.findOneAndUpdate(
        { userId: req.user.id },
        profileData,
        { new: true, runValidators: true }
      );
    } else {
      // Create new profile
      profile = await Profile.create(profileData);
    }

    // Calculate profile strength
    profile.calculateStrength();
    await profile.save();

    // Mark onboarding as completed
    await User.findByIdAndUpdate(req.user.id, {
      onboardingCompleted: true,
      currentStage: 'discovering_universities'
    });

    res.json({
      success: true,
      profile,
      message: 'Profile saved successfully'
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to save profile' });
  }
};

// @desc    Get user profile
// @route   GET /api/profile
exports.getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ success: true, profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// @desc    Get profile strength
// @route   GET /api/profile/strength
exports.getProfileStrength = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    profile.calculateStrength();
    await profile.save();

    res.json({
      success: true,
      strength: profile.profileStrength
    });
  } catch (error) {
    console.error('Profile strength error:', error);
    res.status(500).json({ error: 'Failed to calculate profile strength' });
  }
};