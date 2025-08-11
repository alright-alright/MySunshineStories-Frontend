#!/bin/bash

# Railway Deployment Script for MySunshineStory Frontend

echo "🚂 Starting Railway deployment for MySunshineStory frontend..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "   brew install railway (macOS)"
    echo "   npm install -g @railway/cli (npm)"
    exit 1
fi

# Check if logged in to Railway
if ! railway whoami &> /dev/null; then
    echo "🔐 Please log in to Railway..."
    railway login
fi

echo "📦 Building production bundle..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi

echo "✅ Build successful!"

echo ""
echo "📋 Next steps to complete deployment:"
echo ""
echo "1. Go to https://railway.app/new"
echo "2. Select 'Deploy from GitHub repo'"
echo "3. Choose the LucianTales repository"
echo "4. Configure these settings:"
echo "   - Root Directory: /frontend"
echo "   - Branch: main"
echo ""
echo "5. Add these environment variables in Railway:"
echo "   VITE_API_URL=https://luciantales-production.up.railway.app"
echo "   VITE_APP_URL=https://mysunshinestory.ai"
echo "   VITE_GOOGLE_CLIENT_ID=<your_google_client_id>"
echo "   VITE_APPLE_CLIENT_ID=<your_apple_client_id>"
echo ""
echo "6. Configure custom domain:"
echo "   - Add domain: mysunshinestory.ai"
echo "   - Add subdomain: www.mysunshinestory.ai"
echo "   - Update DNS records as provided by Railway"
echo ""
echo "7. Verify deployment at:"
echo "   - Railway URL: https://<your-service>.up.railway.app"
echo "   - Custom domain: https://mysunshinestory.ai"
echo ""
echo "For detailed instructions, see DEPLOYMENT.md"
echo ""
echo "🎉 Happy deploying!"