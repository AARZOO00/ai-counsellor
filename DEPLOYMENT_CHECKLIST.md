# Production Deployment Checklist - CORS Fixed

## Frontend: Vercel (https://ai-counsellor-pink.vercel.app)
## Backend: Render (https://ai-counsellor-vosd.onrender.com)

---

## ✅ Changes Made

### Backend (server.js)
- [x] Added explicit whitelist for `https://ai-counsellor-pink.vercel.app`
- [x] Added `exposedHeaders` to CORS options
- [x] Implemented dual OPTIONS handlers: `app.options('*', cors())` and `app.options('/:path*', cors())`
- [x] Added CORS logging for debugging: `console.log('[CORS] Request from origin: ${origin}')`
- [x] Added error handling middleware for CORS errors
- [x] Set `credentials: true` for authentication headers

### Backend (.env on Render)
- [x] `FRONTEND_URL=https://ai-counsellor-pink.vercel.app`
- [x] `NODE_ENV=production`
- [x] All other secrets (MONGODB_URI, JWT_SECRET, etc.)

### Frontend (client/src/services/api.js)
- [x] Updated `getAPIURL()` to use `REACT_APP_API_URL` environment variable
- [x] Default fallback: `https://ai-counsellor-vosd.onrender.com/api`
- [x] Added console logging for API URL detection

### Frontend (.env.production on Vercel)
- [x] `REACT_APP_API_URL=https://ai-counsellor-vosd.onrender.com/api`
- [x] `NODE_ENV=production`

---

## 🚀 Deployment Steps

### Step 1: Deploy Backend to Render
1. Push changes to GitHub
2. Log into Render dashboard
3. Go to your service: `ai-counsellor-vosd`
4. Settings → Environment → Verify these are set:
   ```
   FRONTEND_URL=https://ai-counsellor-pink.vercel.app
   NODE_ENV=production
   MONGODB_URI=<your-mongodb-uri>
   JWT_SECRET=<your-jwt-secret>
   GEMINI_API_KEY=<your-gemini-key>
   ```
5. Click "Deploy" or let it auto-deploy from git push
6. Wait for build to complete (check logs)
7. Verify: Visit `https://ai-counsellor-vosd.onrender.com/api/health`
   - Expected response: `{ "status": "OK", "message": "API is running" }`

### Step 2: Deploy Frontend to Vercel
1. Commit `.env.production` changes
2. Push to GitHub (branch connected to Vercel)
3. Vercel will auto-deploy within 2-3 minutes
4. Check deployment logs in Vercel dashboard
5. Visit `https://ai-counsellor-pink.vercel.app` and test registration

---

## 🧪 Testing After Deployment

### In Browser Console (DevTools F12)
```javascript
// Test API connectivity
fetch('https://ai-counsellor-vosd.onrender.com/api/health', {
  credentials: 'include'
}).then(r => r.json()).then(console.log).catch(console.error);
```

### Registration Flow
1. Go to `https://ai-counsellor-pink.vercel.app/register`
2. Fill in: Full Name, Email, Password
3. Click "Create Account"
4. Expected: 
   - No CORS errors in console
   - Success message or redirect to dashboard
   - Token saved in `localStorage.token`

### Check CORS Headers in Network Tab
1. Open DevTools → Network tab
2. Try to register
3. Click on the `/auth/register` POST request
4. Response Headers should include:
   ```
   Access-Control-Allow-Origin: https://ai-counsellor-pink.vercel.app
   Access-Control-Allow-Credentials: true
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
   ```

### Verify Preflight (OPTIONS) Requests
1. In Network tab, look for requests with METHOD = `OPTIONS`
2. These should return HTTP 200
3. They should have same CORS headers as above

---

## 🐛 Debugging CORS Issues

### If you still get "No Access-Control-Allow-Origin":
1. Check that your Vercel domain is correct:
   - Frontend should be: `https://ai-counsellor-pink.vercel.app`
   - Not: `https://ai-counsellor-pink.vercel.app/` (no trailing slash)

2. Check server logs on Render:
   - Look for `[CORS]` messages
   - Should show: `[CORS] Request from origin: https://ai-counsellor-pink.vercel.app`

3. Verify `.env` on Render matches frontend URL exactly:
   ```
   FRONTEND_URL=https://ai-counsellor-pink.vercel.app
   ```

4. Force re-deploy on Render:
   - Go to Deploy → Manual Deploy → Clear Build Cache & Deploy

### If OPTIONS returns 404:
1. Ensure both handlers are in server.js:
   ```javascript
   app.options('*', cors(corsOptions));
   app.options('/:path*', cors(corsOptions));
   ```

2. These MUST come BEFORE route definitions

### If you get 401 on login:
1. Check that token is being sent in Authorization header
2. Verify JWT_SECRET is same on server and in code
3. Check that password hashing is consistent

---

## 📋 Final Checklist

- [ ] Backend URL: `https://ai-counsellor-vosd.onrender.com`
- [ ] Frontend URL: `https://ai-counsellor-pink.vercel.app`
- [ ] Render env vars include `FRONTEND_URL=https://ai-counsellor-pink.vercel.app`
- [ ] Vercel env var set: `REACT_APP_API_URL=https://ai-counsellor-vosd.onrender.com/api`
- [ ] Backend deployed and health check responds
- [ ] Frontend deployed and loads without build errors
- [ ] Registration works without CORS errors
- [ ] Login works and returns token
- [ ] Protected routes work (Dashboard, Profile, etc.)
- [ ] Browser Network tab shows OPTIONS requests returning 200
- [ ] Browser Network tab shows POST/GET requests with CORS headers

---

## 🔗 Quick Links

- **Vercel Frontend**: https://ai-counsellor-pink.vercel.app
- **Render Backend API**: https://ai-counsellor-vosd.onrender.com/api
- **Backend Health Check**: https://ai-counsellor-vosd.onrender.com/api/health
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Render Dashboard**: https://dashboard.render.com

---

## 📞 Support

If CORS still fails:
1. Check browser console for exact error message
2. Screenshot the Network tab (with CORS response headers visible)
3. Check Render logs: https://dashboard.render.com (select service → Logs)
4. Verify URLs match exactly (including https:// and no trailing slashes)
