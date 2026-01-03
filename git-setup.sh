#!/bin/bash
# Quick Git Setup Script for CodeConnect Deployment

echo "=========================================="
echo "CodeConnect - Git Setup Script"
echo "=========================================="
echo ""

cd "$(dirname "$0")"

# Initialize Git if not already done
if [ ! -d .git ]; then
    echo "Initializing Git repository..."
    git init
    
    echo "Configuring Git user (optional - set your details)"
    echo "Run: git config user.name 'Your Name'"
    echo "Run: git config user.email 'your.email@example.com'"
else
    echo "Git repository already initialized"
fi

echo ""
echo "Adding all files..."
git add .

echo ""
echo "Creating initial commit..."
git commit -m "Initial commit - CodeConnect application ready for deployment"

echo ""
echo "=========================================="
echo "Next steps:"
echo "1. Create a repository on GitHub: https://github.com/new"
echo "2. Name it: codeconnect"
echo "3. Run these commands:"
echo ""
echo "   git remote add origin https://github.com/YOUR_USERNAME/codeconnect.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "4. Then deploy on Vercel: https://vercel.com/dashboard"
echo "=========================================="
