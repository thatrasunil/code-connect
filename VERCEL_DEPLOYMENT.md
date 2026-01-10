# Vercel Deployment Guide for CodeConnect

This guide will help you deploy your CodeConnect frontend to Vercel and configure it to work with your Firebase backend.

## 🎯 Overview

Your app uses:
- **Frontend**: React app (deployed to Vercel)
- **Backend**: Firebase (Firestore, Authentication, Analytics)
- **Real-time**: Node.js Socket.IO server (needs separate deployment)

## 📋 Prerequisites

- [ ] GitHub repository with your code
- [ ] Vercel account (free tier works)
- [ ] Firebase project already configured (✅ You have this)
- [ ] Node.js backend deployed (if using real-time features)

---

## 🚀 Step 1: Deploy Node.js Backend (Socket.IO)

Your app uses Socket.IO for real-time collaboration. You need to deploy `backend/server.js` to a hosting service.

### Recommended Options:

#### Option A: Railway (Easiest)
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `code-connect` repository
5. Configure:
   - **Root Directory**: `/backend`
   - **Start Command**: `node server.js`
6. Add environment variables:
   ```
   FIREBASE_SERVICE_ACCOUNT=<your-firebase-service-account-json>
   GOOGLE_API_KEY=<your-gemini-api-key>
   FRONTEND_URL=https://your-app.vercel.app
   ```
7. Copy the deployed URL (e.g., `https://code-connect-production.up.railway.app`)

#### Option B: Render
1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect your GitHub repo
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Add environment variables (same as above)

---

## 🌐 Step 2: Deploy Frontend to Vercel

### 2.1 Push Your Code to GitHub

```bash
cd d:\codeconnect
git add .
git commit -m "Add environment configuration for production"
git push origin main
```

### 2.2 Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New..." → "Project"
4. Import your `code-connect` repository
5. Configure project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### 2.3 Configure Environment Variables

In the Vercel project settings:

1. Go to **Settings** → **Environment Variables**
2. Add the following variables for **Production**:

| Variable Name | Value |
|--------------|-------|
| `REACT_APP_BACKEND_URL` | `http://localhost:8000` (or your deployed Django URL) |
| `REACT_APP_SOCKET_URL` | Your Node.js backend URL from Step 1 |

3. Click "Save"
4. Redeploy: Go to **Deployments** → Click "..." on latest → "Redeploy"

---

## ✅ Step 3: Verify Deployment

1. Open your Vercel URL
2. Open browser DevTools (F12) → Console tab
3. Check that API calls go to your production backend (not localhost)
4. Test Firebase features (auth, quizzes)
5. Test real-time collaboration

---

## 🔧 Troubleshooting

### Issue: Still seeing `localhost` errors

**Solution**: Clear Vercel build cache and redeploy

### Issue: Environment variables not updating

**Solution**: Update in Vercel Dashboard, then manually redeploy

---

For detailed instructions, see the full deployment guide artifact.
