const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();

// ============================================
// CORS Configuration for Production
// ============================================
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://ai-counsellor-pink.vercel.app',
      'https://ai-study-abroad.vercel.app',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    console.log(`[CORS] Request from origin: ${origin}`);

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is in whitelist
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Check wildcard patterns for *.vercel.app
    if (allowedOrigins.some(allowed => {
      if (allowed.includes('*.vercel.app') && origin.endsWith('.vercel.app')) {
        return true;
      }
      return false;
    })) {
      return callback(null, true);
    }

    console.log(`[CORS] Blocked origin: ${origin}`);
    callback(new Error(`CORS policy: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Explicit preflight handler - CRITICAL for production
app.options('*', cors(corsOptions));
app.options('/:path*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- ROUTES ---
app.use('/api/auth', require('./routes/auth')); 
app.use('/api/profile', require('./routes/profileRoutes')); 
app.use('/api/counsellor', require('./routes/counsellorRoutes')); 
app.use('/api/universities', require('./routes/universityRoutes')); // Make sure filename matches!
app.use('/api/todos', require('./routes/todoRoutes'));
app.use('/api/dashboard', require('./routes/dashboard')); // 🔥 Added Dashboard

// Error handling middleware for CORS and other errors
app.use((err, req, res, next) => {
  if (err.message && err.message.includes('CORS')) {
    console.error('[CORS Error]', err.message);
    return res.status(403).json({ 
      message: 'CORS policy violation',
      error: err.message,
      origin: req.get('origin')
    });
  }
  console.error('[Error]', err.message);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

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