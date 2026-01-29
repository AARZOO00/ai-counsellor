const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- ROUTES ---
app.use('/api/auth', require('./routes/auth')); 
app.use('/api/profile', require('./routes/profileRoutes')); 
app.use('/api/counsellor', require('./routes/counsellorRoutes')); 
app.use('/api/universities', require('./routes/universityRoutes')); // Make sure filename matches!
app.use('/api/todos', require('./routes/todoRoutes'));
app.use('/api/dashboard', require('./routes/dashboard')); // 🔥 Added Dashboard

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running' });
});

// MongoDB Connection
const PORT = process.env.PORT || 5001;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.log('❌ DB Error:', err));