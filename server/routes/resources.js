const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');

router.get('/', resourceController.getAllResources);
router.get('/careers', resourceController.getCareerPaths);
router.get('/learning', resourceController.getLearningPaths);
router.get('/skills', resourceController.getSkillResources);

module.exports = router;