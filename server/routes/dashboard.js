const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Dashboard Stats Route
router.get('/stats', protect, async (req, res) => {
  // Return dummy data for now so the dashboard loads
  res.json({
    universityCount: 12,
    applicationCount: 3,
    pendingTasks: 5,
    profileStatus: "80%"
  });
});

module.exports = router;