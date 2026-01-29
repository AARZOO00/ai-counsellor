const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getToDos, createToDo, updateToDo, deleteToDo, autoGenerateTasks } = require('../controllers/todoController');

router.route('/').get(protect, getToDos).post(protect, createToDo);
router.route('/:id').put(protect, updateToDo).delete(protect, deleteToDo);
router.post('/auto-generate', protect, autoGenerateTasks);

// 🚨 YE LINE HONI CHAHIYE
module.exports = router;