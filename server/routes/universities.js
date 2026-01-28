const express = require('express');
const router = express.Router();
const {
  getUniversities,
  shortlistUniversity,
  lockUniversity,
  unlockUniversity,
  removeUniversity
} = require('../controllers/universityController');
const { protect, requireOnboarding } = require('../middleware/auth');

router.get('/', protect, requireOnboarding, getUniversities);
router.put('/:id/shortlist', protect, requireOnboarding, shortlistUniversity);
router.put('/:id/lock', protect, requireOnboarding, lockUniversity);
router.put('/:id/unlock', protect, requireOnboarding, unlockUniversity);
router.delete('/:id', protect, requireOnboarding, removeUniversity);

module.exports = router;