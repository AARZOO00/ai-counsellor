const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Profile = require('../models/Profile');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // 🔥 Manual Tool Import
const { protect } = require('../middleware/authMiddleware');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// 1. REGISTER (Manual Hashing)
router.post('/register', async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    // 🔥 Password Encryption YAHAN hoga
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword // Encrypted password bheja
    });

    if (user) {
      console.log("✅ User Created:", email);
      res.status(201).json({
        _id: user.id,
        fullName: user.fullName,
        email: user.email,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// 2. LOGIN (Manual Check)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(`\n--- Login Attempt: ${email} ---`);

  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log("❌ User not found");
      return res.status(401).json({ message: 'User not found' });
    }

    // 🔥 Password Check YAHAN hoga
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (isMatch) {
      console.log("✅ Login Successful!");
      res.json({
        _id: user.id,
        fullName: user.fullName,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      console.log("❌ Wrong Password");
      res.status(401).json({ message: 'Invalid password' });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// 3. LOAD USER
router.get('/user', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    // Determine if onboarding/profile exists
    const profile = await Profile.findOne({ userId: req.user.id });
    const onboardingCompleted = !!profile;
    return res.json({ ...user.toObject(), onboardingCompleted });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;