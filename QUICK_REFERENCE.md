# 🚀 Quick Reference - CORS Fix Deployment

## The Problem
```
Frontend: https://ai-counsellor-pink.vercel.app
Backend: https://ai-counsellor-vosd.onrender.com
Error: CORS block, net::ERR_FAILED on registration
```

## The Solution (What Changed)

### ✅ Backend: Added Vercel Domain to CORS Whitelist
```javascript
// server/server.js
const allowedOrigins = [
  'https://ai-counsellor-pink.vercel.app',  // ← YOUR VERCEL DOMAIN
  // ... other origins
];
```

### ✅ Backend: Added Preflight Handlers
```javascript
app.options('*', cors(corsOptions));
app.options('/:path*', cors(corsOptions));
```

### ✅ Backend: Set Correct Frontend URL
```
// server/.env
FRONTEND_URL=https://ai-counsellor-pink.vercel.app
```

### ✅ Frontend: Point to Render Backend
```javascript
// client/src/services/api.js
const API_URL = 'https://ai-counsellor-vosd.onrender.com/api';
```

### ✅ Frontend: Production Config
```
// client/.env.production
REACT_APP_API_URL=https://ai-counsellor-vosd.onrender.com/api
```

---

## Deploy Now

### 1️⃣ Backend (Render)
```bash
# Option A: Auto-deploy (if GitHub connected)
git push origin main

# Option B: Manual deploy
# Render Dashboard → ai-counsellor-vosd → Deploy tab
# Click "Clear Build Cache & Deploy"

# Verify:
# Visit https://ai-counsellor-vosd.onrender.com/api/health
# Should return: {"status":"OK","message":"API is running"}
```

### 2️⃣ Frontend (Vercel)
```bash
# Push code (auto-deploys)
git add .
git commit -m "Fix CORS - point to Render backend"
git push origin main

# Verify:
# Visit https://ai-counsellor-pink.vercel.app
# Check DevTools Console - should show no errors
```

### 3️⃣ Test Registration
```
URL: https://ai-counsellor-pink.vercel.app/register
Fill in: Full Name, Email, Password
Click: Create Account

✅ Success: 
- No CORS errors
- Token in localStorage
- Redirect to dashboard

❌ Failure:
- Check browser Network tab
- Check Render logs
```

---

## Debug Checklist

| Check | How | Expected |
|-------|-----|----------|
| Backend Running? | Visit `/api/health` | `{"status":"OK"}` |
| CORS Allowed? | DevTools → Network tab → POST → Headers | `Access-Control-Allow-Origin: https://ai-counsellor-pink.vercel.app` |
| Preflight OK? | DevTools → Network tab → OPTIONS | Status **200** |
| Token Saved? | DevTools → Application → localStorage | Key `token` exists |
| API URL Correct? | DevTools → Console | Logs `https://ai-counsellor-vosd.onrender.com/api` |

---

## Common Fixes

| Problem | Fix |
|---------|-----|
| "No CORS header" | Verify Render env var: `FRONTEND_URL=https://ai-counsellor-pink.vercel.app` |
| "OPTIONS 404" | Check `app.options()` handlers in server.js |
| "401 Unauthorized" | Ensure token is being sent in `Authorization: Bearer <token>` |
| "Still failing" | Force re-deploy: Render Dashboard → Clear Build Cache → Deploy |

---

## Files to Commit
```bash
git add server/server.js
git add server/.env
git add client/src/services/api.js
git add client/.env.production
git commit -m "Production CORS fix for Vercel + Render deployment"
git push origin main
```

---

## Links
- Vercel: https://ai-counsellor-pink.vercel.app
- Render: https://ai-counsellor-vosd.onrender.com
- Vercel Dashboard: https://vercel.com/dashboard
- Render Dashboard: https://dashboard.render.com

---

## Status
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Registration works without CORS errors
- [ ] Token saved and user can access dashboard
- [ ] Production ✅ Ready
