# Deployment Guide

## Repository Structure

MySunshineTales is split into two separate repositories for independent deployment:

- **Frontend**: [MySunshineStories-Frontend](https://github.com/alright-alright/MySunshineStories-Frontend)
- **Backend**: [MySunshineStories-Backend](https://github.com/alright-alright/MySunshineStories-Backend)

## Frontend Deployment (Vercel)

### 1. Prerequisites
- Vercel account
- GitHub repository connected
- Backend API deployed and accessible

### 2. Environment Variables

Configure these in Vercel dashboard under Settings → Environment Variables:

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API URL | ✅ Yes | `https://api.mysunshinestories.com` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | ❌ No | `123456.apps.googleusercontent.com` |
| `VITE_APPLE_CLIENT_ID` | Apple OAuth Client ID | ❌ No | `com.example.signin` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | ❌ No | `pk_live_xxxxx` |

### 3. Deployment Commands

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Deploy to preview
vercel
```

### 4. Domain Configuration

1. Go to Vercel Dashboard → Settings → Domains
2. Add your custom domain (e.g., mysunshinestories.com)
3. Configure DNS records as instructed by Vercel
4. SSL certificate is automatically provisioned

## Backend Deployment (Railway)

### 1. Prerequisites
- Railway account
- GitHub repository connected
- PostgreSQL database service added

### 2. Environment Variables

Configure these in Railway dashboard:

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ Yes | Auto-provided by Railway |
| `SECRET_KEY` | JWT signing key | ✅ Yes | Generate with `openssl rand -hex 32` |
| `OPENAI_API_KEY` | OpenAI API key | ✅ Yes | `sk-xxxxx` |
| `ALLOWED_ORIGINS` | CORS allowed origins | ✅ Yes | `https://mysunshinestories.com` |
| `STRIPE_SECRET_KEY` | Stripe secret key | ❌ No | `sk_live_xxxxx` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | ❌ No | `whsec_xxxxx` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | ❌ No | Same as frontend |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | ❌ No | `xxxxx` |
| `APPLE_CLIENT_ID` | Apple OAuth client ID | ❌ No | Same as frontend |
| `APPLE_CLIENT_SECRET` | Apple OAuth secret | ❌ No | `xxxxx` |

### 3. Database Migration

Railway will automatically run migrations on deploy if you have this in your `railway.json`:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT"
  }
}
```

## OAuth Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   - `https://mysunshinestories.com/auth/google/callback`
   - `http://localhost:5173/auth/google/callback` (for development)

### Apple Sign In

1. Go to [Apple Developer Portal](https://developer.apple.com)
2. Create App ID with Sign In with Apple capability
3. Create Service ID for web authentication
4. Configure domains and redirect URLs:
   - Domain: `mysunshinestories.com`
   - Redirect: `https://mysunshinestories.com/auth/apple/callback`

## Stripe Configuration

### 1. Create Products and Prices

```bash
# Monthly subscription
stripe products create \
  --name="MySunshineTales Monthly" \
  --description="Monthly subscription for unlimited stories"

stripe prices create \
  --product=prod_xxx \
  --unit-amount=999 \
  --currency=usd \
  --recurring[interval]=month
```

### 2. Configure Webhooks

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://api.mysunshinestories.com/api/v1/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### 3. Update Environment Variables

Add the webhook secret and price IDs to your backend environment.

## Monitoring & Logs

### Frontend (Vercel)
- View logs: Vercel Dashboard → Functions → Logs
- Monitor performance: Vercel Analytics
- Error tracking: Integrate with Sentry

### Backend (Railway)
- View logs: Railway Dashboard → Deployments → View Logs
- Monitor metrics: Railway Dashboard → Metrics
- Database monitoring: Railway PostgreSQL metrics

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Verify `ALLOWED_ORIGINS` includes your frontend URL
   - Check no trailing slashes in URLs

2. **OAuth Not Working**
   - Verify redirect URIs match exactly
   - Check client IDs are correct in both frontend and backend
   - Ensure secrets are only in backend

3. **Database Connection Issues**
   - Check `DATABASE_URL` is correct
   - Verify database is running
   - Check connection pool settings

4. **Stripe Webhooks Failing**
   - Verify webhook secret is correct
   - Check endpoint URL is accessible
   - Review Stripe webhook logs

### Debug Mode

Enable detailed logging:

**Frontend (.env)**:
```env
VITE_DEBUG=true
```

**Backend (.env)**:
```env
DEBUG=true
LOG_LEVEL=DEBUG
```

## Rollback Strategy

### Vercel (Frontend)
1. Go to Deployments tab
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Railway (Backend)
1. Go to Deployments tab
2. Find previous working deployment
3. Click "Rollback"

## Performance Optimization

### Frontend
- Enable Vercel Edge Network
- Use image optimization
- Implement code splitting
- Enable caching headers

### Backend
- Use connection pooling
- Implement Redis caching
- Optimize database queries
- Use CDN for static assets

## Security Checklist

- [ ] All secrets in environment variables
- [ ] HTTPS enabled on all domains
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS protection headers
- [ ] CSRF tokens for state-changing operations
- [ ] Regular dependency updates
- [ ] Security headers configured

## Support

For deployment issues:
- Frontend: Check Vercel status page
- Backend: Check Railway status page
- Create issue on GitHub
- Contact: support@mysunshinestories.com