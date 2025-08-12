import axios from 'axios';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await api.post('/api/v1/auth/refresh', {
            refresh_token: refreshToken
          });
          
          const { access_token } = response.data;
          localStorage.setItem('access_token', access_token);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  // OAuth login with proper backend integration
  googleLogin: async () => {
    // In production, initiate OAuth flow
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    // DEBUG: Log OAuth configuration
    console.log('🔍 OAuth Debug Info:');
    console.log('Client ID from env:', clientId);
    console.log('Client ID length:', clientId?.length);
    console.log('Client ID first/last chars:', clientId ? `${clientId.substring(0, 10)}...${clientId.substring(clientId.length - 10)}` : 'undefined');
    console.log('Redirect URI:', redirectUri);
    console.log('Window origin:', window.location.origin);
    console.log('All env vars:', Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')));
    
    if (clientId) {
      // Real OAuth flow
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=openid%20email%20profile&` +
        `access_type=offline&` +
        `prompt=consent`;
      
      // DEBUG: Log the complete OAuth URL
      console.log('🔗 Complete OAuth URL:', authUrl);
      console.log('🔗 Decoded redirect URI:', decodeURIComponent(redirectUri));
      
      // Alert for debugging (remove in production)
      if (import.meta.env.VITE_DEBUG === 'true') {
        const debugInfo = `OAuth Debug:\n\nClient ID: ${clientId}\n\nRedirect URI: ${redirectUri}\n\nConfirm this matches Google Console?`;
        if (!confirm(debugInfo)) {
          console.error('OAuth cancelled by user for debugging');
          return null;
        }
      }
      
      window.location.href = authUrl;
      return null; // Will redirect, no response needed
    } else {
      // Development/demo mode - use backend demo endpoint
      try {
        const response = await api.post('/api/v1/auth/oauth/login', {
          provider: 'google',
          token: 'demo_token' // Backend will handle demo mode
        });
        return response.data;
      } catch (error) {
        console.error('OAuth login failed:', error);
        throw error;
      }
    }
  },
  
  appleLogin: async () => {
    // Apple OAuth flow
    const redirectUri = `${window.location.origin}/auth/apple/callback`;
    const clientId = import.meta.env.VITE_APPLE_CLIENT_ID;
    
    if (clientId) {
      // Real OAuth flow  
      const authUrl = `https://appleid.apple.com/auth/authorize?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `response_mode=form_post&` +
        `scope=name%20email`;
      
      window.location.href = authUrl;
      return null; // Will redirect, no response needed
    } else {
      // Development/demo mode
      try {
        const response = await api.post('/api/v1/auth/oauth/login', {
          provider: 'apple',
          token: 'demo_token' // Backend will handle demo mode
        });
        return response.data;
      } catch (error) {
        console.error('OAuth login failed:', error);
        throw error;
      }
    }
  },
  
  // Handle OAuth callback
  handleCallback: async (provider, code) => {
    try {
      // Ensure provider is lowercase and valid
      const normalizedProvider = provider?.toLowerCase();
      if (!normalizedProvider || !['google', 'apple'].includes(normalizedProvider)) {
        throw new Error(`Invalid OAuth provider: ${provider}`);
      }
      
      const redirectUri = `${window.location.origin}/auth/${normalizedProvider}/callback`;
      
      console.log('Sending OAuth exchange request:', {
        provider: normalizedProvider,
        code: code.substring(0, 20) + '...',
        redirect_uri: redirectUri
      });
      
      const response = await api.post('/api/v1/auth/oauth/exchange', {
        provider: normalizedProvider,
        code,
        redirect_uri: redirectUri
      });
      return response.data;
    } catch (error) {
      console.error('OAuth callback failed:', error);
      throw error;
    }
  },
  
  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/api/v1/auth/me');
    return response.data;
  },
  
  // Logout
  logout: () => {
    localStorage.clear();
    window.location.href = '/';
  },
  
  // Refresh token
  refreshToken: async (refreshToken) => {
    const response = await api.post('/api/v1/auth/refresh', {
      refresh_token: refreshToken
    });
    return response.data;
  }
};

// Sunshine Profile API
export const sunshineAPI = {
  // List all sunshine profiles
  listProfiles: async () => {
    const response = await api.get('/api/v1/sunshines');
    return response.data;
  },
  
  // Get single profile
  getProfile: async (id) => {
    const response = await api.get(`/api/v1/sunshines/${id}`);
    return response.data;
  },
  
  // Create profile
  createProfile: async (formData) => {
    const response = await api.post('/api/v1/sunshines', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  // Update profile
  updateProfile: async (id, formData) => {
    const response = await api.put(`/api/v1/sunshines/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  // Delete profile
  deleteProfile: async (id) => {
    const response = await api.delete(`/api/v1/sunshines/${id}`);
    return response.data;
  },
  
  // Add family member
  addFamilyMember: async (sunshineId, formData) => {
    const response = await api.post(`/api/v1/sunshines/${sunshineId}/family`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  // Remove family member
  removeFamilyMember: async (sunshineId, memberId) => {
    const response = await api.delete(`/api/v1/sunshines/${sunshineId}/family/${memberId}`);
    return response.data;
  },
  
  // Add comfort item
  addComfortItem: async (sunshineId, formData) => {
    const response = await api.post(`/api/v1/sunshines/${sunshineId}/comfort-items`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  // Remove comfort item
  removeComfortItem: async (sunshineId, itemId) => {
    const response = await api.delete(`/api/v1/sunshines/${sunshineId}/comfort-items/${itemId}`);
    return response.data;
  }
};

// Story API
export const storyAPI = {
  // Generate story (v2 - profile based)
  generateStory: async (data) => {
    const response = await api.post('/api/v2/stories/generate', data);
    return response.data;
  },
  
  // Generate enhanced story with photos (v3)
  generateEnhancedStory: async (formData) => {
    const response = await api.post('/api/v3/stories/generate-with-photos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  // Get story history
  getHistory: async (limit = 10, offset = 0) => {
    const response = await api.get('/api/v2/stories/history', {
      params: { limit, offset }
    });
    return response.data;
  },
  
  // Get single story
  getStory: async (id) => {
    const response = await api.get(`/api/v2/stories/${id}`);
    return response.data;
  },
  
  // Toggle favorite
  toggleFavorite: async (id) => {
    const response = await api.put(`/api/v2/stories/${id}/favorite`);
    return response.data;
  },
  
  // Delete story
  deleteStory: async (id) => {
    const response = await api.delete(`/api/v2/stories/${id}`);
    return response.data;
  },
  
  // Rate story
  rateStory: async (id, rating) => {
    const formData = new FormData();
    formData.append('rating', rating);
    const response = await api.post(`/api/v2/stories/${id}/rate`, formData);
    return response.data;
  },
  
  // Export to PDF
  exportPDF: async (id) => {
    const response = await api.post(`/api/v2/stories/${id}/export-pdf`);
    return response.data;
  },
  
  // Get story templates
  getTemplates: async (ageGroup) => {
    const response = await api.get('/api/v3/stories/story-templates', {
      params: { age_group: ageGroup }
    });
    return response.data;
  },
  
  // Get character consistency tips
  getCharacterTips: async () => {
    const response = await api.get('/api/v3/stories/character-consistency-tips');
    return response.data;
  },
  
  // Analyze photo for character
  analyzePhoto: async (formData) => {
    const response = await api.post('/api/v3/stories/analyze-photo-for-character', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

// Subscription API
export const subscriptionAPI = {
  // Get subscription plans
  getPlans: async () => {
    const response = await api.get('/api/v1/subscription/plans');
    return response.data;
  },
  
  // Get current subscription
  getCurrentSubscription: async () => {
    const response = await api.get('/api/v1/subscription/current');
    return response.data;
  },
  
  // Create checkout session
  createCheckout: async (plan, successUrl, cancelUrl) => {
    const response = await api.post('/api/v1/subscription/checkout', {
      plan,
      success_url: successUrl,
      cancel_url: cancelUrl
    });
    return response.data;
  },
  
  // Create payment intent for individual story
  createPaymentIntent: async (description) => {
    const response = await api.post('/api/v1/subscription/payment-intent', {
      description
    });
    return response.data;
  },
  
  // Update subscription
  updateSubscription: async (plan) => {
    const response = await api.put('/api/v1/subscription/update', { plan });
    return response.data;
  },
  
  // Cancel subscription
  cancelSubscription: async (immediate = false) => {
    const response = await api.post('/api/v1/subscription/cancel', { immediate });
    return response.data;
  },
  
  // Reactivate subscription
  reactivateSubscription: async () => {
    const response = await api.post('/api/v1/subscription/reactivate');
    return response.data;
  },
  
  // Create customer portal session
  createPortalSession: async (returnUrl) => {
    const response = await api.post('/api/v1/subscription/portal', {
      return_url: returnUrl
    });
    return response.data;
  },
  
  // Get usage stats
  getUsageStats: async () => {
    const response = await api.get('/api/v1/subscription/usage');
    return response.data;
  },
  
  // Get payment history
  getPaymentHistory: async (limit = 10) => {
    const response = await api.get('/api/v1/subscription/history', {
      params: { limit }
    });
    return response.data;
  }
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await api.get('/api/v1/health');
    return response.data;
  }
};

export default api;