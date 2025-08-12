import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Import pages
import LoginPage from './pages/LoginPage';
import OAuthCallback from './pages/OAuthCallback';
import Dashboard from './pages/Dashboard';
import SunshineProfiles from './pages/SunshineProfiles';
import CreateSunshine from './pages/CreateSunshine';
import StoryGenerator from './pages/StoryGenerator';
import StoryView from './pages/StoryView';
import StoryHistory from './pages/StoryHistory';
import Subscription from './pages/Subscription';
import CheckoutSuccess from './pages/CheckoutSuccess';
import TestPage from './pages/TestPage';
import OAuthTest from './pages/OAuthTest';
import OAuthDiagnostic from './pages/OAuthDiagnostic';

// Import components
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';

// Initialize Stripe (use test key for now)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RuMrTRyzSE6ux2iu5Lz1yI5rnMKBAArQ0GXVTSn6YJ8Jkrbv4t005cFSYn6I');

function App() {
  return (
    <AuthProvider>
      <Elements stripe={stripePromise}>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
            <Routes>
              {/* Public routes - OAuth callbacks MUST be outside protected routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/oauth-diagnostic" element={<OAuthDiagnostic />} />
              <Route path="/auth/:provider/callback" element={<OAuthCallback />} />
              
              {/* Protected routes with Navigation wrapper */}
              <Route path="/" element={<ProtectedRoute />}>
                <Route path="/" element={<Navigation />}>
                  <Route index element={<Dashboard />} />
                  <Route path="sunshines" element={<SunshineProfiles />} />
                  <Route path="sunshines/create" element={<CreateSunshine />} />
                  <Route path="sunshines/:id/edit" element={<CreateSunshine />} />
                  <Route path="stories/generate" element={<StoryGenerator />} />
                  <Route path="stories/:id" element={<StoryView />} />
                  <Route path="stories" element={<StoryHistory />} />
                  <Route path="subscription" element={<Subscription />} />
                  <Route path="subscription/success" element={<CheckoutSuccess />} />
                  <Route path="test" element={<TestPage />} />
                  <Route path="oauth-test" element={<OAuthTest />} />
                </Route>
              </Route>
              
              {/* Fallback - redirect to login for better UX */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </Router>
      </Elements>
    </AuthProvider>
  );
}

export default App;