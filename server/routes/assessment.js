const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');

router.get('/questions', assessmentController.getQuestions);
router.post('/submit', assessmentController.submitAssessment);
router.get('/results/:sessionId', assessmentController.getAssessmentResults);

module.exports = router;