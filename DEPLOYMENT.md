# Frontend Deployment Guide for Railway

## Overview
This guide explains how to deploy the MySunshineStory frontend to Railway and configure the custom domain.

## Prerequisites
- Railway account (https://railway.app)
- Access to GitHub repository
- Domain DNS management access for mysunshinestory.ai

## Deployment Steps

### 1. Create New Railway Service

1. Log in to Railway Dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose the `LucianTales` repository
5. Configure deployment settings:
   - **Root Directory**: `/frontend`
   - **Branch**: `main`

### 2. Set Environment Variables

In Railway service settings, add these environment variables:

```bash
VITE_API_URL=https://luciantales-production.up.railway.app
VITE_APP_URL=https://mysunshinestory.ai
VITE_GOOGLE_CLIENT_ID=<your_google_oauth_client_id>
VITE_APPLE_CLIENT_ID=<your_apple_oauth_client_id>
PORT=<auto-assigned by Railway>
```

### 3. Deploy the Service

Railway will automatically:
1. Detect the Node.js application
2. Install dependencies with `npm ci`
3. Run the build command `npm run build`
4. Start the server with `npm run start`

### 4. Configure Custom Domain

#### In Railway:
1. Go to service Settings → Domains
2. Add custom domain: `mysunshinestory.ai`
3. Add www subdomain: `www.mysunshinestory.ai`
4. Railway will provide DNS records

#### In Your DNS Provider:
Add these records:

**For root domain (mysunshinestory.ai):**
```
Type: A
Name: @
Value: <Railway-provided IP>
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: <Railway-provided domain>.up.railway.app
```

**Alternative using CNAME flattening (if supported):**
```
Type: CNAME
Name: @
Value: <Railway-provided domain>.up.railway.app
```

### 5. Update Backend CORS

Ensure the backend at `https://luciantales-production.up.railway.app` has CORS configured for:
- `https://mysunshinestory.ai`
- `https://www.mysunshinestory.ai`

### 6. SSL Configuration

Railway automatically provisions SSL certificates via Let's Encrypt for custom domains.

## Post-Deployment Checklist

- [ ] Frontend accessible at https://mysunshinestory.ai
- [ ] www redirect working
- [ ] OAuth login functional
- [ ] API calls to backend working
- [ ] Images and assets loading correctly
- [ ] SSL certificate active

## Monitoring

- Check Railway logs: `railway logs`
- Monitor deployments in Railway dashboard
- Set up health checks for uptime monitoring

## Rollback Procedure

If issues occur:
1. In Railway dashboard, go to Deployments
2. Find previous working deployment
3. Click "Rollback" to restore

## Local Testing of Production Build

```bash
# Build locally
npm run build

# Test production build
npm run preview

# Access at http://localhost:4173
```

## Support

- Railway Documentation: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: https://github.com/alright-alright/LucianTales/issues