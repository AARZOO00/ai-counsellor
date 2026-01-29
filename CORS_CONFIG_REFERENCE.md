# Production CORS & Auth Configuration - Code Reference

## Files Modified

### 1. server.js - CORS Configuration

```javascript
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
app.use('/api/universities', require('./routes/universityRoutes'));
app.use('/api/todos', require('./routes/todoRoutes'));
app.use('/api/dashboard', require('./routes/dashboard'));

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
```

### 2. .env (Render Backend)

```
PORT=5001
MONGODB_URI=mongodb+srv://aarzoo11786_db_user:4i8KuX59vYWSABoL@cluster0.bhmcfpj.mongodb.net/?appName=Cluster0
JWT_SECRET=56341c45-3517-4d62-9e43-79126d5b0cb6f3
NODE_ENV=production
FRONTEND_URL=https://ai-counsellor-pink.vercel.app
OPENROUTER_API_KEY=your-key-here
GEMINI_API_KEY=your-gemini-key-here
```

### 3. client/src/services/api.js

```javascript
import axios from "axios";

/* ======================================
   1. SERVER CONNECTION SETUP
====================================== */

// Determine API URL based on environment
const getAPIURL = () => {
  // In production (Vercel), use environment variable
  if (process.env.REACT_APP_API_URL) {
    console.log('[API] Using REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }
  
  // Production default: Render backend
  if (process.env.NODE_ENV === 'production') {
    const url = 'https://ai-counsellor-vosd.onrender.com/api';
    console.log('[API] Using production backend:', url);
    return url;
  }
  
  // Development: localhost
  console.log('[API] Using development localhost');
  return 'http://localhost:5001/api';
};

const API_URL = getAPIURL();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token Interceptor (Har request mein token jodta hai)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ... rest of API definitions
```

### 4. client/.env.production

```
REACT_APP_API_URL=https://ai-counsellor-vosd.onrender.com/api
NODE_ENV=production
```

### 5. client/.env (local development)

```
REACT_APP_API_URL=http://localhost:5001/api
NODE_ENV=development
```

---

## Key Points

### CORS Headers Explained

- **Access-Control-Allow-Origin**: Tells browser which origins can access this API
- **Access-Control-Allow-Credentials**: Allows cookies/auth headers to be sent
- **Access-Control-Allow-Methods**: What HTTP methods are allowed (GET, POST, etc.)
- **Access-Control-Allow-Headers**: What custom headers are allowed (Authorization, etc.)
- **Access-Control-Max-Age**: How long to cache preflight results (86400 = 24 hours)

### Preflight (OPTIONS) Requests

When a browser makes a POST from a different origin, it first sends an OPTIONS request to check if the server allows it. Our code handles this with:

```javascript
app.options('*', cors(corsOptions));      // Matches all paths
app.options('/:path*', cors(corsOptions)); // Explicit catch-all
```

### Why We Need Both

- First line catches requests to `/api/auth/register`, `/api/profile`, etc.
- Second line ensures nested routes like `/api/counsellor/chat` are caught
- Without these, OPTIONS returns 404 and browser blocks the real request

### Credentials Mode

```javascript
credentials: true  // In server CORS options
```

This allows the client to send `Authorization` header and allows the server to set cookies. Client-side (axios) automatically includes this when token exists.

---

## Testing Commands

### Test CORS from command line (if backend is local):

```bash
# Simple GET
curl -H "Origin: https://ai-counsellor-pink.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS \
  http://localhost:5001/api/auth/register -v

# Should return 200 with CORS headers
```

### Test from browser console:

```javascript
// If on https://ai-counsellor-pink.vercel.app
fetch('https://ai-counsellor-vosd.onrender.com/api/health', {
  method: 'GET',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(console.log)
.catch(e => console.error('CORS Error:', e));
```

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "No Access-Control-Allow-Origin header" | Origin not in allowlist | Add your Vercel domain to `allowedOrigins` array |
| OPTIONS returns 404 | Missing `app.options()` handlers | Add both `app.options('*', cors())` and `app.options('/:path*', cors())` |
| Credentials not sent | Missing `credentials: true` | Set in both CORS options and client axios config |
| 401 on auth requests | Token not in header | Verify `Authorization: Bearer <token>` is sent |
| Render cold start delay | Render free tier | Use Render's paid tier or keep-alive service for production |

---

## Next Steps

1. ✅ Push changes to GitHub
2. ✅ Deploy backend on Render (let it auto-build or manual deploy)
3. ✅ Deploy frontend on Vercel (auto-deploys on git push)
4. ✅ Test registration at https://ai-counsellor-pink.vercel.app/register
5. ✅ Monitor Network tab and Render logs for any errors
6. ✅ Check browser console for API URL being logged
