const express = require('express');
const router = express.Router();
const { 
  chat, 
  recommendUniversities, 
  analyzeProfile 
} = require('../controllers/counsellorController');
const { protect, requireOnboarding } = require('../middleware/auth');

router.post('/chat', protect, requireOnboarding, chat);
router.post('/recommend', protect, requireOnboarding, recommendUniversities);
router.get('/analyze', protect, requireOnboarding, analyzeProfile);

module.exports = router;