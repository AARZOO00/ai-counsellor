# Production CORS & Auth Fix Guide

## Issues Fixed
1. ✅ CORS errors (No Access-Control-Allow-Origin header)
2. ✅ 401 authentication failures
3. ✅ Preflight OPTIONS requests not handled
4. ✅ Missing environment variable configuration

## Backend Changes

### 1. **server.js** - CORS Configuration
- Added origin whitelist for localhost and Vercel URLs
- Enabled `credentials: true` for cookies/auth headers
- Added explicit preflight OPTIONS handler
- Allowed all required HTTP methods (GET, POST, PUT, DELETE, PATCH)

### 2. **.env** - Environment Variables
```
FRONTEND_URL=https://ai-study-abroad.vercel.app
NODE_ENV=production
GEMINI_API_KEY=your-key-here
```

### 3. **routes/auth.js** - Error Handling
- Added input validation for register endpoint
- Improved error messages for production
- Added explicit token generation

## Frontend Changes

### 1. **client/src/services/api.js** - Dynamic API URL
- Detects environment automatically
- Uses `REACT_APP_API_URL` for production
- Falls back to localhost in development

### 2. **client/.env.production** - Production Config
```
REACT_APP_API_URL=https://your-backend-domain.com/api
NODE_ENV=production
```

## Deployment Steps

### Backend (Render/Vercel/Heroku)
1. Set environment variables in deployment dashboard:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - Your JWT secret key
   - `FRONTEND_URL` - Your Vercel app URL (e.g., https://ai-study-abroad.vercel.app)
   - `NODE_ENV` - Set to "production"
   - `GEMINI_API_KEY` - Your Gemini API key (if using)

2. Deploy the server code
3. Note the backend URL (e.g., https://your-api.onrender.com)

### Frontend (Vercel)
1. Update `.env.production` with your backend URL:
   ```
   REACT_APP_API_URL=https://your-api.onrender.com/api
   ```

2. Push to GitHub and Vercel will auto-deploy
   
3. In Vercel dashboard, add environment variable:
   - Key: `REACT_APP_API_URL`
   - Value: `https://your-api.onrender.com/api`

## Testing Checklist
- [ ] Backend server is running and accessible
- [ ] CORS is configured with correct origins
- [ ] Frontend URL is in backend `.env` FRONTEND_URL
- [ ] Backend URL is in frontend `.env.production` REACT_APP_API_URL
- [ ] Registration endpoint returns token
- [ ] Login endpoint returns token with user data
- [ ] Protected routes include Authorization header
- [ ] Options requests return 200 (preflight)

## Common Issues & Solutions

### Issue: "No Access-Control-Allow-Origin header"
**Solution**: Ensure your frontend URL matches exactly (with https://) in backend CORS whitelist

### Issue: "401 Unauthorized"
**Solution**: Check that token is being sent in Authorization header: `Bearer <token>`

### Issue: "CORS not allowed" error
**Solution**: Verify frontend URL is in allowedOrigins array in server.js

### Issue: Preflight OPTIONS returns 404
**Solution**: Ensure `app.options('*', cors(corsOptions))` is in server.js before routes

## Vercel-Specific Notes
- Vercel auto-sets `NODE_ENV=production`
- Use `.env.production` for frontend environment variables
- Backend can be on separate Render/Heroku/Railway deployment
- Always use https:// in production URLs

## Next Steps
1. Deploy backend with correct env variables
2. Note the backend URL (e.g., https://xyz.onrender.com)
3. Update frontend `.env.production` with this URL
4. Deploy frontend to Vercel
5. Test login/register flow in production
