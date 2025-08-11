# MySunshineTales Frontend

🌟 Create personalized bedtime stories for your little sunshine! This is the frontend application for MySunshineTales, built with React and Vite.

## 🚀 Live Demo

Visit [mysunshinestories.com](https://mysunshinestories.com) to see the application in action!

## 📦 Tech Stack

- **Framework**: React 19 with Vite
- **Styling**: TailwindCSS
- **Routing**: React Router v7
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Payments**: Stripe

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 18+ and npm
- Backend API running (see [Backend Repository](https://github.com/alright-alright/MySunshineStories-Backend))

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/alright-alright/MySunshineStories-Frontend.git
cd MySunshineStories-Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables:
```env
# Backend API URL
VITE_API_URL=http://localhost:8000

# OAuth (Optional - uses demo mode if not set)
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_APPLE_CLIENT_ID=your-apple-client-id

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-key
```

5. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🚢 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard:
   - `VITE_API_URL`: Your backend API URL
   - `VITE_GOOGLE_CLIENT_ID`: Google OAuth client ID (optional)
   - `VITE_APPLE_CLIENT_ID`: Apple OAuth client ID (optional)
   - `VITE_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key

3. Deploy with:
```bash
vercel --prod
```

### Railway (Alternative)

1. Connect this repository to Railway
2. Add environment variables:
   - `VITE_API_URL`: Your backend API URL
   - Other OAuth and Stripe keys as needed
3. Railway will auto-deploy on push to main

## Features
- OAuth authentication (Google/Apple)
- Sunshine profile management
- AI story generation
- Subscription management
- Story history

## API Connection
This frontend connects to the LucianTales Backend API. Make sure to set the correct `VITE_API_URL` environment variable.