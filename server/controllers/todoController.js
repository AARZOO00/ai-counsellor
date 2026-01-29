const ToDo = require('../models/ToDo');
const Profile = require('../models/Profile');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Gemini Setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper
const cleanJSON = (text) => text.replace(/```json/g, '').replace(/```/g, '').trim();

// Fallback logic for AI
const generateWithFallback = async (prompt) => {
  const models = ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro"];
  for (const m of models) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const res = await model.generateContent(prompt);
      return res.response.text();
    } catch (e) { continue; }
  }
  throw new Error("AI Busy");
};

// --- EXPORTS ---

// 1. Get All Tasks
exports.getToDos = async (req, res) => {
  try {
    const todos = await ToDo.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// 2. Auto Generate Tasks
exports.autoGenerateTasks = async (req, res) => {
  try {
    // Check existing
    const existing = await ToDo.find({ userId: req.user.id });
    if (existing.length > 0) return res.status(200).json({ message: "Tasks exist" });

    // Profile check
    const profile = await Profile.findOne({ userId: req.user.id });
    if (!profile) return res.status(400).json({ message: "No profile" });

    // AI Generation
    const prompt = `Create 5 checklist items for studying ${profile.intendedDegree}. Return JSON array of strings only.`;
    
    let tasks = ["Research Universities", "Check Visa Requirements", "Draft Resume", "Prepare for IELTS", "Apply for Loans"];
    try {
        const rawText = await generateWithFallback(prompt);
        tasks = JSON.parse(cleanJSON(rawText));
    } catch(e) {
        console.log("AI Task Gen Failed, using default.");
    }

    const newTasks = tasks.map(t => ({
      userId: req.user.id, 
      title: t, 
      status: 'pending', 
      priority: 'medium', 
      dueDate: new Date(Date.now() + 7*24*60*60*1000)
    }));

    await ToDo.insertMany(newTasks);
    res.status(201).json({ tasks: newTasks });

  } catch (error) {
    console.error("Todo Error:", error.message);
    res.status(200).json({ message: "Skipped auto-gen" });
  }
};

// 3. Create Task (Manual)
exports.createToDo = async (req, res) => {
  try {
    const todo = await ToDo.create({
      userId: req.user.id,
      title: req.body.title,
      dueDate: req.body.dueDate,
      priority: req.body.priority
    });
    res.status(201).json(todo);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
};

// 4. Update Task
exports.updateToDo = async (req, res) => {
  try {
    const todo = await ToDo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Task not found' });
    
    // Toggle status or update fields
    if (req.body.status) todo.status = req.body.status;
    
    await todo.save();
    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: 'Update failed' });
  }
};

// 5. Delete Task
exports.deleteToDo = async (req, res) => {
  try {
    const todo = await ToDo.findById(req.params.id);
    if (todo) {
      await todo.deleteOne();
      res.json({ message: 'Removed' });
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Delete failed' });
  }
};