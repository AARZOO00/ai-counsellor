const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Profile = require('../models/Profile');
const { createProfile } = require('../controllers/profileController');

// @route   GET /api/profile/me
router.get('/me', protect, async (req, res) => {
  try {
    // Defensive: ensure protect middleware set req.user
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });

    const profile = await Profile.findOne({ userId: req.user.id });
    if (!profile) return res.status(404).json({ msg: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/profile
router.post('/', protect, async (req, res) => {
  // Defensive: ensure protect middleware set req.user
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  // Shallow sanitize incoming payload: convert empty strings to undefined,
  // coerce numeric strings for known numeric fields.
  const incoming = { ...req.body };
  const numericFields = ['gpa', 'graduationYear', 'targetIntakeYear', 'budgetPerYear'];
  Object.keys(incoming).forEach((k) => {
    const v = incoming[k];
    if (typeof v === 'string') {
      if (v.trim() === '') {
        incoming[k] = undefined;
        return;
      }
      if (numericFields.includes(k) && !Number.isNaN(Number(v))) {
        incoming[k] = Number(v);
      }
    }
  });

  // Validate required fields before attempting DB write
  const required = ['currentEducationLevel', 'intendedDegree'];
  const missing = required.filter((f) => !incoming[f]);
  if (missing.length) {
    return res.status(400).json({ message: 'Missing required fields', missing });
  }

  // Build profileFields only from provided, non-undefined values
  const allowed = [
    'currentEducationLevel', 'degree', 'major', 'graduationYear', 'gpa',
    'intendedDegree', 'fieldOfStudy', 'targetIntakeYear', 'preferredCountries',
    'budgetPerYear', 'fundingPlan', 'ielts', 'toefl', 'gre', 'gmat', 'sopStatus'
  ];

  const profileFields = { userId: req.user.id, updatedAt: Date.now() };
  allowed.forEach((key) => {
    if (incoming[key] !== undefined) profileFields[key] = incoming[key];
  });

  // If fundingPlan exists but is an empty string, ensure it's not included (avoids enum error)
  if (profileFields.fundingPlan === '') delete profileFields.fundingPlan;

  try {
    let profile = await Profile.findOne({ userId: req.user.id });
    if (profile) {
      profile = await Profile.findOneAndUpdate({ userId: req.user.id }, { $set: profileFields }, { new: true, runValidators: true });
      return res.json(profile);
    }

    profile = new Profile(profileFields);
    if (typeof profile.calculateStrength === 'function') profile.calculateStrength();
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error('Profile save error:', err);
    // If Mongoose validation error, surface a clearer 400 response
    if (err.name === 'ValidationError') {
      const errors = Object.keys(err.errors).map((k) => ({ field: k, message: err.errors[k].message }));
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    res.status(500).json({ message: err.message || 'Server Error' });
  }
});

// 🚨 YE LINE SABSE ZAROORI HAI
module.exports = router;