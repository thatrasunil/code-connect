# CodeConnect - Vercel Setup Reference

## Complete Vercel Dashboard Setup

### Backend Project Setup

```
Project Name: codeconnect-backend
Framework: Other (Node.js)
Root Directory: backend/

Build Settings:
├── Build Command: npm install
├── Output Directory: (leave empty)
└── Install Command: npm install

Environment Variables:
├── MONGODB_URI = mongodb+srv://username:password@cluster...
├── JWT_SECRET = (your secure random string)
├── PORT = 3001
└── NODE_ENV = production
```

### Frontend Project Setup

```
Project Name: codeconnect-frontend
Framework: Create React App
Root Directory: frontend/

Build Settings:
├── Build Command: npm run build
├── Output Directory: build
└── Install Command: npm install

Environment Variables:
├── REACT_APP_API_URL = https://codeconnect-backend.vercel.app
└── REACT_APP_BACKEND_URL = https://codeconnect-backend.vercel.app
```

---

## Expected Results After Deployment

### Backend Deployment
```
✓ Build: Successful
✓ Status: Ready
✓ URL: https://codeconnect-backend.vercel.app
✓ Logs: Show "Server running on port 3001"
```

### Frontend Deployment
```
✓ Build: Successful
✓ Status: Ready
✓ URL: https://codeconnect-frontend.vercel.app
✓ Logs: Show successful React build
```

---

## Deployed URL Pattern

| Component | URL Format |
|-----------|-----------|
| Backend API | `https://codeconnect-backend.vercel.app` |
| Frontend App | `https://codeconnect-frontend.vercel.app` |
| Code Editor | `https://codeconnect-frontend.vercel.app/room/{roomId}` |

---

## Data Flow After Deployment

```
Frontend Browser
    ↓
REACT_APP_API_URL: https://codeconnect-backend.vercel.app
    ↓
Backend API Endpoints:
├── /api/auth/* (Authentication)
├── /api/room/* (Room operations)
├── /api/admin/* (Admin panel)
└── Socket.IO (Real-time communication)
    ↓
MongoDB Atlas
```

---

## Verification Commands

After deployment, test with these URLs:

```bash
# Test Backend API
curl https://codeconnect-backend.vercel.app/api/health
(or your health check endpoint)

# Test Frontend
Open: https://codeconnect-frontend.vercel.app

# Check real-time connection
1. Open DevTools Network tab
2. Filter for "ws" (WebSocket)
3. Should show WebSocket connection to backend
```

---

## Rollback Procedure

If something goes wrong:

1. **Stop Deployment**
   - Vercel Dashboard → Project → Deployments
   - Click on previous successful deployment
   - Click "Redeploy"

2. **Fix Code Issue**
   ```bash
   git reset HEAD~1
   git push --force origin main
   ```

3. **Redeploy**
   - Vercel will automatically trigger new build

---

## Monitoring & Maintenance

### Weekly Checks
- [ ] Frontend loads without errors
- [ ] Real-time editing works
- [ ] API responses are fast
- [ ] No error spam in Vercel logs

### Monthly Checks
- [ ] Update dependencies: `npm update`
- [ ] Check security vulnerabilities: `npm audit`
- [ ] Review Vercel analytics
- [ ] Check MongoDB storage usage

---

## Custom Domain Setup (Optional)

Once live, add custom domain:

1. Vercel Dashboard → Project → Settings → Domains
2. Enter your domain (e.g., codeconnect.com)
3. Update DNS records as instructed
4. Wait for verification (usually instant)

---

## Performance Optimization Tips

```
Frontend:
- Vercel auto-optimizes builds
- CDN caches static files globally
- Monitor bundle size in logs

Backend:
- Vercel serverless scales automatically
- Use connection pooling for MongoDB
- Monitor cold start times in logs
```

---

## Debugging Deployed Application

### Frontend Issues
1. Check Browser DevTools Console
2. Check Network tab for API calls
3. Vercel Dashboard → Deployments → Click build → View Logs

### Backend Issues
1. Check API response status codes
2. Vercel Dashboard → Backend Project → Deployments → View Logs
3. Check MongoDB connection string in Vercel ENV

### Real-time Issues
1. Check WebSocket connection in Network tab
2. Verify Socket.IO namespace in backend matches frontend
3. Check browser console for Socket.IO errors

---

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Socket.IO Vercel**: https://socket.io/docs/v4/deployment/vercel/
- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas/register
- **Create React App**: https://create-react-app.dev/

---

## Your Deployment Checklist - Final

- [ ] Git initialized and pushed to GitHub
- [ ] MongoDB cluster created and connection string saved
- [ ] Backend deployed to Vercel with env variables
- [ ] Frontend deployed to Vercel with env variables
- [ ] Verified frontend loads without errors
- [ ] Verified real-time editing works
- [ ] Tested from different browsers/devices
- [ ] Custom domain set up (optional)
- [ ] Monitoring configured
- [ ] Team members have access

---

**Congratulations! Your CodeConnect is now deployed on Vercel! 🎉**

Monitor your application and enjoy your live collaborative code editor! 🚀
