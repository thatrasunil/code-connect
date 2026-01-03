# 🔄 Automatic Deployment - Quick Reference

## 🎯 Your URLs
```
Frontend: https://codeconnect-delta.vercel.app/
Backend: https://codeconnect-backend.vercel.app/
```

## ⚡ Quick Start (Once only)

```bash
# 1. Initialize Git
cd d:\codeconnect
git init
git add .
git commit -m "Initial commit"

# 2. Create GitHub repo at https://github.com/new
# Name: codeconnect

# 3. Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/codeconnect.git
git branch -M main
git push -u origin main

# 4. Import to Vercel at https://vercel.com/dashboard
# - New Project → Import Git Repository
# - Select your codeconnect repo
# - Deploy backend (root: backend/)
# - Deploy frontend (root: frontend/)
```

## 🔄 Daily Workflow (Auto-Deploy)

```bash
# Make changes
vim file.js

# Commit
git add .
git commit -m "Your change"

# Push (triggers automatic Vercel deployment)
git push origin main

# ✅ Vercel automatically rebuilds & deploys!
# Monitor at: https://vercel.com/dashboard
```

## ✅ Vercel Configuration

### Backend (`backend/` folder)
```
Build Command: npm install
Environment Variables:
  - MONGODB_URI = connection-string
  - JWT_SECRET = secure-random-key
  - NODE_ENV = production
```

### Frontend (`frontend/` folder)
```
Build Command: npm run build
Environment Variables:
  - REACT_APP_API_URL = https://codeconnect-backend.vercel.app
  - REACT_APP_BACKEND_URL = https://codeconnect-backend.vercel.app
```

## 📊 How Auto-Deployment Works

```
Git Push → GitHub → Vercel Webhook → Auto Build → Deploy ✅
(30 sec)   (instant) (instant)       (2-3 min)    (instant)
```

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Build failed | Check Vercel Dashboard logs |
| API not working | Verify environment variables |
| Code not updating | Check you pushed to main branch |
| Want manual deploy | Use "Redeploy" in Vercel Dashboard |

## 📱 Check Status Anytime

- **Dashboard**: https://vercel.com/dashboard
- **Live App**: https://codeconnect-delta.vercel.app/
- **Git History**: https://github.com/YOUR_USERNAME/codeconnect

## 🎉 That's It!

Every time you:
```bash
git push origin main
```

Your app automatically updates on Vercel! 🚀
