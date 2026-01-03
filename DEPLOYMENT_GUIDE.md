# CodeConnect - Vercel Deployment Guide

## Complete Deployment Steps

### Prerequisites
- GitHub account
- Vercel account (https://vercel.com)
- MongoDB Atlas account (https://www.mongodb.com/cloud/atlas)

---

## Step 1: Prepare Your Repository

### Initialize Git (if not already done)
```bash
cd d:\codeconnect
git init
git add .
git commit -m "Initial commit - CodeConnect app"
```

### Create GitHub Repository
1. Go to https://github.com/new
2. Create repository named `codeconnect`
3. Do NOT initialize with README
4. Copy the repository URL

### Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/codeconnect.git
git branch -M main
git push -u origin main
```

---

## Step 2: Set Up MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create a database user with username and password
4. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/codeconnect?retryWrites=true&w=majority`
5. Keep this connection string safe - you'll need it for environment variables

---

## Step 3: Deploy Backend to Vercel

### 3a. Create Backend Project
1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Select "Import Git Repository"
4. Paste your GitHub repository URL
5. Click "Continue"

### 3b. Configure Backend Deployment
1. **Project Name**: `codeconnect-backend`
2. **Framework Preset**: "Other"
3. **Root Directory**: Select `backend` folder
4. **Build Command**: `npm install`
5. **Output Directory**: Leave empty

### 3c. Add Environment Variables
Click "Environment Variables" and add:
```
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/codeconnect?retryWrites=true&w=majority
JWT_SECRET = your-secure-random-string-here
PORT = 3001
NODE_ENV = production
```

To generate a secure JWT_SECRET, run this in terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3d. Deploy
Click "Deploy" and wait for completion. You'll get a URL like:
```
https://codeconnect-backend.vercel.app
```

---

## Step 4: Deploy Frontend to Vercel

### 4a. Create Frontend Project
1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Select "Import Git Repository"
4. Paste your GitHub repository URL again
5. Click "Continue"

### 4b. Configure Frontend Deployment
1. **Project Name**: `codeconnect-frontend`
2. **Framework**: "Create React App"
3. **Root Directory**: Select `frontend` folder
4. **Build Command**: `npm run build`
5. **Output Directory**: `build`

### 4c. Add Environment Variables
Click "Environment Variables" and add:
```
REACT_APP_API_URL = https://codeconnect-backend.vercel.app
REACT_APP_BACKEND_URL = https://codeconnect-backend.vercel.app
```

### 4d. Deploy
Click "Deploy" and wait for completion. You'll get a URL like:
```
https://codeconnect-frontend.vercel.app
```

---

## Step 5: Update Backend CORS Settings

After getting your frontend URL, update the backend:

1. Go to your backend Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Add:
```
FRONTEND_URL = https://codeconnect-frontend.vercel.app
```

### In your code (server.js)
The backend already supports this with:
```javascript
process.env.FRONTEND_URL || "https://codeconnect.vercel.app"
```

---

## Step 6: Test Your Deployment

1. Open https://codeconnect-frontend.vercel.app in your browser
2. Try creating a new room
3. Check that:
   - Frontend loads without errors
   - Real-time editing works
   - Chat functionality works
   - WebSocket connections are established

### Check Logs
- **Frontend Logs**: Vercel Dashboard → Your project → "Deployments" tab
- **Backend Logs**: Vercel Dashboard → Your backend project → "Deployments" → Click deployment → "Logs" tab

---

## Step 7: Custom Domain (Optional)

To add a custom domain:
1. Vercel Project → Settings → Domains
2. Add your domain
3. Follow DNS configuration instructions

---

## Troubleshooting

### "Cannot POST /api/..." error
- Check backend is deployed and running
- Verify `REACT_APP_API_URL` environment variable is set correctly
- Check CORS configuration in backend

### WebSocket Connection Failed
- Ensure backend URL doesn't have trailing slash
- Check that Socket.IO is properly configured in editor
- Verify CORS allows your frontend domain

### MongoDB Connection Error
- Verify MongoDB URI is correct in `.env`
- Check MongoDB user has correct password
- Ensure IP whitelist includes Vercel IPs (or use 0.0.0.0/0 for development)

### Build Fails
- Check `package.json` has all required dependencies
- Verify no `process.env` references to missing variables
- Check for syntax errors in configuration files

---

## Useful Commands

```bash
# Test locally before deploying
cd frontend
npm start

cd ../backend
npm start

# Build frontend locally
cd frontend
npm run build

# Install Vercel CLI for local testing
npm install -g vercel
vercel dev
```

---

## Security Checklist

✅ Change JWT_SECRET to a secure random value
✅ Use environment variables for all sensitive data
✅ Never commit .env files
✅ Update CORS allowed origins with your actual domains
✅ Use HTTPS only for API calls
✅ Set MongoDB IP whitelist appropriately

---

## Deployment Complete! 🎉

Your CodeConnect application is now live on Vercel!
- Frontend: https://codeconnect-frontend.vercel.app
- Backend API: https://codeconnect-backend.vercel.app
