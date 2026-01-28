const ToDo = require('../models/ToDo');

// @desc    Get all to-dos
// @route   GET /api/todos
exports.getToDos = async (req, res) => {
  try {
    const { universityId, completed } = req.query;
    
    let query = { userId: req.user.id };
    
    if (universityId) query.universityId = universityId;
    if (completed !== undefined) query.completed = completed === 'true';
    
    const todos = await ToDo.find(query)
      .populate('universityId', 'name country')
      .sort({ priority: -1, deadline: 1 });
    
    res.json({
      success: true,
      todos
    });
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({ error: 'Failed to fetch to-dos' });
  }
};

// @desc    Create new to-do
// @route   POST /api/todos
exports.createToDo = async (req, res) => {
  try {
    const todoData = {
      userId: req.user.id,
      ...req.body
    };
    
    const todo = await ToDo.create(todoData);
    
    res.status(201).json({
      success: true,
      todo
    });
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({ error: 'Failed to create to-do' });
  }
};

// @desc    Update to-do
// @route   PUT /api/todos/:id
exports.updateToDo = async (req, res) => {
  try {
    const todo = await ToDo.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!todo) {
      return res.status(404).json({ error: 'To-do not found' });
    }
    
    res.json({
      success: true,
      todo
    });
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({ error: 'Failed to update to-do' });
  }
};

// @desc    Toggle to-do completion
// @route   PUT /api/todos/:id/toggle
exports.toggleToDo = async (req, res) => {
  try {
    const todo = await ToDo.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!todo) {
      return res.status(404).json({ error: 'To-do not found' });
    }
    
    todo.completed = !todo.completed;
    todo.completedAt = todo.completed ? new Date() : null;
    await todo.save();
    
    res.json({
      success: true,
      todo
    });
  } catch (error) {
    console.error('Toggle todo error:', error);
    res.status(500).json({ error: 'Failed to toggle to-do' });
  }
};

// @desc    Delete to-do
// @route   DELETE /api/todos/:id
exports.deleteToDo = async (req, res) => {
  try {
    const todo = await ToDo.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!todo) {
      return res.status(404).json({ error: 'To-do not found' });
    }
    
    res.json({
      success: true,
      message: 'To-do deleted'
    });
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({ error: 'Failed to delete to-do' });
  }
};