const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/message', chatController.sendMessage);
router.get('/conversation/:sessionId', chatController.getConversation);
router.delete('/conversation/:sessionId', chatController.clearConversation);

module.exports = router;