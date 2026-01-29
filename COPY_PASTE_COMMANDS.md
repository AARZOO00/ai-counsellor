# 📋 Copy-Paste Commands for Deployment

## Prerequisites
- GitHub account with your repo pushed
- Render account connected to GitHub (for auto-deploy)
- Vercel account connected to GitHub (for auto-deploy)

---

## 🔴 Step 1: Commit & Push Code

Open PowerShell in your project root and run:

```powershell
cd "c:\Users\Aarzoo\Job Project\ai-counsellor"

# Stage all files
git add .

# Commit with message
git commit -m "Production CORS fix: allow Vercel domain, handle preflight, use Render backend"

# Push to GitHub
git push origin main
```

**Expected output:**
```
Your branch is ahead of 'origin/main' by 1 commit.
(use "git push" to publish your local commits)

[main abc1234] Production CORS fix...
```

---

## 🟠 Step 2: Deploy Backend (Render)

### Option A: Auto-Deploy (Recommended - if GitHub connected)
- Your push triggers auto-deploy automatically
- Go to: https://dashboard.render.com
- Select your service: "ai-counsellor-vosd"
- Watch the "Logs" tab
- Wait for: "Your service is live"

### Option B: Manual Deploy
```powershell
# Navigate to Render dashboard
# https://dashboard.render.com

# Click on "ai-counsellor-vosd" service
# Click "Deploy" tab
# Click "Manual Deploy"
# Click "Clear Build Cache & Deploy"
```

### Verify Backend is Running
```powershell
# Run this command in PowerShell
Invoke-WebRequest -Uri "https://ai-counsellor-vosd.onrender.com/api/health" -UseBasicParsing

# Or use curl (if installed)
curl https://ai-counsellor-vosd.onrender.com/api/health

# Expected response:
# StatusCode: 200
# {"status":"OK","message":"API is running"}
```

**Wait for backend to respond before moving to Step 3!**

---

## 🟡 Step 3: Deploy Frontend (Vercel)

### Auto-Deploy (Automatic)
- Your push already triggered Vercel auto-deploy
- Go to: https://vercel.com/dashboard
- Click your "ai-counsellor" project
- Watch for "Production" status to show ✓ (usually 2-3 minutes)
- Check "Deployment" tab for details

### Verify Frontend is Running
```powershell
# In browser, visit:
# https://ai-counsellor-pink.vercel.app

# Open DevTools (F12)
# Console tab - should see:
# [API] Using production backend: https://ai-counsellor-vosd.onrender.com/api

# No red errors should appear
```

---

## 🟢 Step 4: Test Registration

### In Browser
```
1. Open: https://ai-counsellor-pink.vercel.app/register
2. Fill form:
   - Full Name: Test User
   - Email: testuser@example.com  
   - Password: TestPass123
3. Click "Create Account"
```

### Expected Results
```
✅ No CORS errors in console
✅ No "net::ERR_FAILED"
✅ Success message or redirect to dashboard
✅ DevTools → Application → localStorage → token key exists
```

### Troubleshooting: If It Fails

#### Check Backend Logs
```powershell
# https://dashboard.render.com
# Click "ai-counsellor-vosd"
# Click "Logs" tab
# Look for [CORS] messages

# Should see:
# [CORS] Request from origin: https://ai-counsellor-pink.vercel.app
```

#### Check Frontend Console
```
Press F12 in browser
Go to Console tab
Should see: [API] Using production backend: https://ai-counsellor-vosd.onrender.com/api
No red ❌ errors
```

#### Check Network Tab
```
F12 → Network tab
Try registration again
Look for POST /auth/register
Status should be 200 or 201 (not 404, not 403)
Response headers should include:
  access-control-allow-origin: https://ai-counsellor-pink.vercel.app
```

#### Force Re-Deploy (Nuclear Option)
```powershell
# If stuck, force Render to re-build

# https://dashboard.render.com
# Click service "ai-counsellor-vosd"
# Click Deploy tab
# Click "Clear Build Cache & Deploy"

# Wait 3-5 minutes for fresh build

# Then retry step 4
```

---

## ✅ Final Verification

### Checklist (Copy & Paste Each)

```powershell
# 1. Backend health check
Invoke-WebRequest -Uri "https://ai-counsellor-vosd.onrender.com/api/health" -UseBasicParsing

# 2. Frontend loads (paste URL in browser)
# https://ai-counsellor-pink.vercel.app

# 3. Check backend logs
# https://dashboard.render.com → ai-counsellor-vosd → Logs

# 4. Check frontend logs
# https://vercel.com/dashboard → ai-counsellor → Deployments

# 5. Test registration
# https://ai-counsellor-pink.vercel.app/register → Fill form → Submit

# 6. Verify token saved
# F12 → Application → localStorage → check for "token" key

# 7. Try to access dashboard
# https://ai-counsellor-pink.vercel.app/dashboard
```

---

## 🎯 Deployment Summary

| Step | Action | Status |
|------|--------|--------|
| 1 | Git push to GitHub | ✅ Done |
| 2 | Render auto-deploys | ⏳ Wait 3-5 min |
| 3 | Verify `/api/health` | ✅ Responding |
| 4 | Vercel auto-deploys | ⏳ Wait 2-3 min |
| 5 | Verify frontend loads | ✅ No errors |
| 6 | Test registration | ✅ Success |
| 7 | Check localStorage | ✅ Token exists |
| 8 | Test dashboard | ✅ Loads data |

---

## 🚨 Emergency Rollback

If something goes very wrong:

```powershell
# Undo last commit locally (don't push yet)
git revert HEAD
git push origin main

# Then:
# - Wait for Render to re-deploy (old code)
# - Wait for Vercel to re-deploy (old code)
# - Test that old code works

# If reverting didn't help, contact support with:
# - Browser console screenshot
# - Network tab screenshot  
# - Render logs screenshot
```

---

## 📞 Support Resources

If stuck:
1. **Render Logs**: https://dashboard.render.com → Logs tab
2. **Vercel Logs**: https://vercel.com/dashboard → Deployments tab
3. **Browser DevTools**: F12 → Console & Network tabs
4. **GitHub Status**: https://www.githubstatus.com (check if GitHub is down)

---

## ⏱️ Typical Timeline

```
0 min   : Run git push
3 min   : Backend auto-deploys (or manual deploy)
5 min   : Backend health check responsive
10 min  : Frontend auto-deploys (or manual deploy)
12 min  : Frontend loads without build errors
15 min  : Test registration works
20 min  : ✅ Full production deployment complete!
```

---

## 🎉 Success!

Once registration works without CORS errors:

```
✅ Backend is correctly deployed
✅ Frontend is correctly deployed
✅ CORS is properly configured
✅ Authentication is working
✅ Database is connected
✅ Production is LIVE!

Users can now:
- Register accounts
- Log in
- Complete profiles
- Generate university recommendations
- Browse universities
- Manage applications
```

---

## 💾 Keep These Commands Handy

```powershell
# Check backend status
Invoke-WebRequest -Uri "https://ai-counsellor-vosd.onrender.com/api/health" -UseBasicParsing

# View Render logs
# https://dashboard.render.com/services/ai-counsellor-vosd

# View Vercel logs  
# https://vercel.com/ai-study-abroad/ai-counsellor

# Quick health test
# Frontend: https://ai-counsellor-pink.vercel.app
# Backend: https://ai-counsellor-vosd.onrender.com/api/health
```

---

Done! Follow these steps in order and your CORS issues will be fixed. 🚀
