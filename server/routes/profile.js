const express = require('express');
const router = express.Router();
const { 
  createOrUpdateProfile, 
  getProfile, 
  getProfileStrength 
} = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createOrUpdateProfile);
router.get('/', protect, getProfile);
router.get('/strength', protect, getProfileStrength);

module.exports = router;