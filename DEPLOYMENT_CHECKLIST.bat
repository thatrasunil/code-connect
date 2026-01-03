@echo off
REM Quick Deployment Checklist for CodeConnect

echo ========================================
echo CodeConnect - Vercel Deployment Checklist
echo ========================================
echo.

echo Step 1: Initialize Git (if needed)
echo Command: git init
echo.

echo Step 2: Add all files to Git
echo Command: git add .
echo.

echo Step 3: Create initial commit
echo Command: git commit -m "Initial commit - CodeConnect app"
echo.

echo Step 4: Create repository on GitHub
echo Go to: https://github.com/new
echo Name: codeconnect
echo.

echo Step 5: Push to GitHub
echo Command: git remote add origin https://github.com/YOUR_USERNAME/codeconnect.git
echo Command: git branch -M main
echo Command: git push -u origin main
echo.

echo Step 6: Deploy Backend
echo - Go to https://vercel.com/dashboard
echo - Click "Add New" → "Project"
echo - Select your codeconnect repository
echo - Root Directory: backend
echo - Add Environment Variables:
echo   MONGODB_URI = your-connection-string
echo   JWT_SECRET = your-secure-key
echo.

echo Step 7: Deploy Frontend
echo - Go to https://vercel.com/dashboard
echo - Click "Add New" → "Project"
echo - Select your codeconnect repository
echo - Root Directory: frontend
echo - Add Environment Variables:
echo   REACT_APP_API_URL = https://your-backend.vercel.app
echo   REACT_APP_BACKEND_URL = https://your-backend.vercel.app
echo.

echo Step 8: Test Deployment
echo - Open frontend URL in browser
echo - Test creating a room
echo - Check real-time editing works
echo.

echo ========================================
echo All steps completed! Your app is live!
echo ========================================
pause
