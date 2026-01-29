# Commit & Deploy Guide

## Changes Made

### Backend (server/)
- ✅ `server.js` - CORS configuration with Vercel whitelist + preflight handlers
- ✅ `server/.env` - Updated FRONTEND_URL to Vercel domain

### Frontend (client/)
- ✅ `client/src/services/api.js` - Dynamic API URL detection
- ✅ `client/.env.production` - Production backend URL

### Documentation
- ✅ `PRODUCTION_CORS_FIX_SUMMARY.md` - Complete overview
- ✅ `DEPLOYMENT_CHECKLIST.md` - Step-by-step deployment guide
- ✅ `CORS_CONFIG_REFERENCE.md` - Code examples & troubleshooting
- ✅ `QUICK_REFERENCE.md` - Quick lookup guide

---

## Step 1: Commit Changes

```bash
cd c:\Users\Aarzoo\Job Project\ai-counsellor

# Stage all changes
git add .

# Commit with descriptive message
git commit -m "Production CORS fix: allow Vercel domain, handle preflight, point to Render backend

- Backend: Updated CORS whitelist for https://ai-counsellor-pink.vercel.app
- Backend: Added preflight OPTIONS handlers for all routes
- Backend: Set FRONTEND_URL in .env to actual Vercel domain
- Backend: Added CORS error logging for debugging
- Frontend: Dynamic API URL selection based on environment
- Frontend: Set production backend to Render API
- Added comprehensive deployment documentation"

# Push to GitHub
git push origin main
```

---

## Step 2: Deploy Backend (Render)

### If using GitHub integration (Auto-deploy)
- Just wait for Render to detect the push
- Check your Render dashboard: https://dashboard.render.com
- Select "ai-counsellor-vosd" service
- Click "Logs" tab and wait for "Your service is live"

### If manual deploy needed
1. Go to Render Dashboard: https://dashboard.render.com
2. Click on "ai-counsellor-vosd" service
3. Go to "Deploy" tab
4. Click "Clear Build Cache & Deploy"
5. Wait for deployment to complete

### Verify Backend is Running
```bash
# In terminal or browser:
curl https://ai-counsellor-vosd.onrender.com/api/health

# Expected output:
# {"status":"OK","message":"API is running"}
```

---

## Step 3: Deploy Frontend (Vercel)

### Automatic Deployment
- Vercel automatically deploys when code is pushed to GitHub
- Check https://vercel.com/dashboard
- Click on "ai-counsellor" project
- Wait for "Production" status to show ✓

### Verify Frontend is Running
```
Open in browser: https://ai-counsellor-pink.vercel.app
Check DevTools Console (F12) for any errors
Should show: [API] Using production backend: https://ai-counsellor-vosd.onrender.com/api
```

---

## Step 4: Test the Application

### Test Registration (Full Flow)
1. Open: https://ai-counsellor-pink.vercel.app/register
2. Enter:
   - Full Name: Test User
   - Email: test@example.com
   - Password: TestPassword123
3. Click "Create Account"

### Expected Results ✅
- No CORS errors in browser console
- No `net::ERR_FAILED` errors
- Success message appears or redirects to dashboard
- `localStorage.token` contains JWT token

### DevTools Network Tab Checks
1. Look for POST request to `/auth/register`
2. Status should be **200** or **201**
3. Response Headers should include:
   ```
   access-control-allow-origin: https://ai-counsellor-pink.vercel.app
   access-control-allow-credentials: true
   access-control-expose-headers: Content-Type, Authorization
   ```
4. Look for OPTIONS request (preflight)
5. OPTIONS status should be **200**

### If Something Goes Wrong

#### Check Backend Logs (Render)
1. Go to https://dashboard.render.com
2. Click "ai-counsellor-vosd"
3. Click "Logs" tab
4. Look for `[CORS]` messages
5. Should see: `[CORS] Request from origin: https://ai-counsellor-pink.vercel.app`

#### Check Frontend Console
1. Open https://ai-counsellor-pink.vercel.app
2. Press F12 → Console tab
3. Should see: `[API] Using production backend: https://ai-counsellor-vosd.onrender.com/api`
4. No red error messages

#### Common Issues
| Issue | Solution |
|-------|----------|
| "No Access-Control-Allow-Origin" | Render not deployed yet, wait 2-3 min and refresh |
| "OPTIONS 404" | Server.js not deployed, check Render logs |
| "Vercel domain not found" | Clear browser cache (Ctrl+F5) |
| "API endpoint 404" | Check `.env.production` has correct URL |

---

## Step 5: Verify Everything Works

### Checklist
- [ ] Backend health check returns OK
- [ ] Frontend loads without errors
- [ ] Console shows correct API URL
- [ ] Can see OPTIONS preflight requests in Network tab
- [ ] Registration form submits without CORS errors
- [ ] Token is saved to localStorage
- [ ] Can log in successfully
- [ ] Can access dashboard page
- [ ] No errors in Render logs

### Final Status
Once all checks pass:
```
✅ Production deployment complete!
✅ CORS issues resolved
✅ Users can register and log in
✅ Ready for production use
```

---

## Rollback (If Needed)

If something goes wrong, you can quickly revert:

```bash
# Revert last commit
git revert HEAD
git push origin main

# OR reset to previous version
git reset --hard HEAD~1
git push origin main --force
```

Then:
1. Render will auto-redeploy (or manual deploy)
2. Vercel will auto-redeploy

---

## Next Steps (Post-Deployment)

1. ✅ Monitor Render logs for 24 hours
2. ✅ Check user registrations in MongoDB
3. ✅ Monitor Vercel analytics dashboard
4. ✅ Set up error monitoring (optional: Sentry.io)
5. ✅ Consider adding rate limiting to /auth endpoints
6. ✅ Set up email verification for registrations

---

## Support

If deployment fails:
1. Take screenshots of error messages
2. Share Render logs (Dashboard → Logs tab)
3. Share browser console errors (F12 → Console)
4. Share Network tab headers for failed request
5. Check that both services are actually deployed and running

Contact information or documentation can be added here as needed.
