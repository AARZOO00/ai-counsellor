const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
// Import both functions
const { getToDos, autoGenerateTasks } = require('../controllers/todoController');

// Existing routes...
router.get('/', protect, getToDos);

// NEW ROUTE: Auto Generate
router.post('/auto-generate', protect, autoGenerateTasks);

module.exports = router;