const express = require('express');
const router = express.Router();
// Controller import
const { 
  getAllUniversities, 
  shortlistUniversity, 
  lockUniversity, 
  unlockUniversity, 
  removeUniversity 
} = require('../controllers/universityController');

const { protect } = require('../middleware/authMiddleware');

// Routes
router.get('/', getAllUniversities); // GET /api/universities
router.put('/shortlist/:id', protect, shortlistUniversity);
router.put('/lock/:id', protect, lockUniversity);
router.put('/unlock/:id', protect, unlockUniversity);
router.delete('/:id', protect, removeUniversity);

module.exports = router;