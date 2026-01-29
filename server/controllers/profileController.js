const Profile = require('../models/Profile');

exports.createProfile = async (req, res) => {
  try {
    // Check karein ki user logged in hai (req.user protect middleware se aata hai)
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Naya profile banayein aur user ID attach karein
    const profile = await Profile.create({
      user: req.user._id,
      ...req.body
    });

    res.status(201).json({ success: true, profile });
  } catch (error) {
    console.error("Profile Create Error:", error);
    res.status(500).json({ message: "Server Error: Could not save profile" });
  }
};