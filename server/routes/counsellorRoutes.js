const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// 1. Import mein 'predictChances' add karein
const { 
  chat, 
  recommendUniversities, 
  analyzeProfile, 
  reviewSOP,
  predictChances // <-- NEW IMPORT
} = require('../controllers/counsellorController');

router.post('/chat', protect, chat);
router.post('/recommend', protect, recommendUniversities);
router.get('/analyze', protect, analyzeProfile);
router.post('/review-sop', protect, reviewSOP);

// 2. Naya Route Add Karein
router.post('/predict', protect, predictChances); // <-- NEW ROUTE

module.exports = router;