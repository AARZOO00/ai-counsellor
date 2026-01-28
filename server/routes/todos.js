const express = require('express');
const router = express.Router();
const {
  getToDos,
  createToDo,
  updateToDo,
  toggleToDo,
  deleteToDo
} = require('../controllers/todoController');
const { protect, requireOnboarding } = require('../middleware/auth');

router.get('/', protect, requireOnboarding, getToDos);
router.post('/', protect, requireOnboarding, createToDo);
router.put('/:id', protect, requireOnboarding, updateToDo);
router.put('/:id/toggle', protect, requireOnboarding, toggleToDo);
router.delete('/:id', protect, requireOnboarding, deleteToDo);

module.exports = router;