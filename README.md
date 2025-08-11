# LucianTales Frontend

React-based frontend for MySunshineStories - AI-powered personalized children's story generator.

## Tech Stack
- React 18 with Vite
- Tailwind CSS
- React Router
- Axios for API calls
- Lucide React icons

## Setup

### Environment Variables
Create `.env.local` for development:
```
VITE_API_URL=http://localhost:8000
```

For production, set in Railway:
```
VITE_API_URL=https://your-backend-url.up.railway.app
```

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Production
```bash
npm run start
```

## Deployment to Railway

1. Connect this repository to Railway
2. Add environment variable: `VITE_API_URL=<your-backend-url>`
3. Railway will auto-deploy on push to main

## Features
- OAuth authentication (Google/Apple)
- Sunshine profile management
- AI story generation
- Subscription management
- Story history

## API Connection
This frontend connects to the LucianTales Backend API. Make sure to set the correct `VITE_API_URL` environment variable.