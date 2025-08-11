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
  // Mock OAuth login for demo purposes
  googleLogin: async () => {
    // For demo: directly create a mock user session
    try {
      const response = await api.post('/api/v1/auth/demo-login', {
        provider: 'google',
        email: 'demo@mysunshinestory.ai',
        name: 'Demo User'
      });
      return response.data;
    } catch (error) {
      console.error('Demo login failed:', error);
      // Fallback to mock data if backend isn't configured
      const mockResponse = {
        access_token: 'demo_token_' + Date.now(),
        refresh_token: 'demo_refresh_' + Date.now(),
        user: {
          id: 1,
          email: 'demo@mysunshinestory.ai',
          full_name: 'Demo User',
          created_at: new Date().toISOString()
        }
      };
      localStorage.setItem('access_token', mockResponse.access_token);
      localStorage.setItem('refresh_token', mockResponse.refresh_token);
      return mockResponse;
    }
  },
  
  appleLogin: async () => {
    // For demo: directly create a mock user session
    try {
      const response = await api.post('/api/v1/auth/demo-login', {
        provider: 'apple',
        email: 'demo@mysunshinestory.ai',
        name: 'Demo User'
      });
      return response.data;
    } catch (error) {
      console.error('Demo login failed:', error);
      // Fallback to mock data if backend isn't configured
      const mockResponse = {
        access_token: 'demo_token_' + Date.now(),
        refresh_token: 'demo_refresh_' + Date.now(),
        user: {
          id: 1,
          email: 'demo@mysunshinestory.ai',
          full_name: 'Demo User',
          created_at: new Date().toISOString()
        }
      };
      localStorage.setItem('access_token', mockResponse.access_token);
      localStorage.setItem('refresh_token', mockResponse.refresh_token);
      return mockResponse;
    }
  },
  
  // Handle OAuth callback (not used in demo mode)
  handleCallback: async (provider, code) => {
    // This would be used for real OAuth flow
    return null;
  },
  
  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get('/api/v1/auth/me');
      return response.data;
    } catch (error) {
      // For demo, return mock user if token exists
      const token = localStorage.getItem('access_token');
      if (token && token.startsWith('demo_token_')) {
        return {
          id: 1,
          email: 'demo@mysunshinestory.ai',
          full_name: 'Demo User',
          created_at: new Date().toISOString()
        };
      }
      throw error;
    }
  },
  
  // Logout
  logout: () => {
    localStorage.clear();
    window.location.href = '/';
  },
  
  // Refresh token
  refreshToken: async (refreshToken) => {
    try {
      const response = await api.post('/api/v1/auth/refresh', {
        refresh_token: refreshToken
      });
      return response.data;
    } catch (error) {
      // For demo, generate new mock token
      if (refreshToken && refreshToken.startsWith('demo_refresh_')) {
        const newToken = 'demo_token_' + Date.now();
        return { access_token: newToken };
      }
      throw error;
    }
  }
};

// Sunshine Profile API
export const sunshineAPI = {
  // List all sunshine profiles
  listProfiles: async () => {
    const response = await api.get('/v1/sunshines');
    return response.data;
  },
  
  // Get single profile
  getProfile: async (id) => {
    const response = await api.get(`/v1/sunshines/${id}`);
    return response.data;
  },
  
  // Create profile
  createProfile: async (formData) => {
    const response = await api.post('/v1/sunshines', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  // Update profile
  updateProfile: async (id, formData) => {
    const response = await api.put(`/v1/sunshines/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  // Delete profile
  deleteProfile: async (id) => {
    const response = await api.delete(`/v1/sunshines/${id}`);
    return response.data;
  },
  
  // Add family member
  addFamilyMember: async (sunshineId, formData) => {
    const response = await api.post(`/v1/sunshines/${sunshineId}/family`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  // Remove family member
  removeFamilyMember: async (sunshineId, memberId) => {
    const response = await api.delete(`/v1/sunshines/${sunshineId}/family/${memberId}`);
    return response.data;
  },
  
  // Add comfort item
  addComfortItem: async (sunshineId, formData) => {
    const response = await api.post(`/v1/sunshines/${sunshineId}/comfort-items`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  // Remove comfort item
  removeComfortItem: async (sunshineId, itemId) => {
    const response = await api.delete(`/v1/sunshines/${sunshineId}/comfort-items/${itemId}`);
    return response.data;
  }
};

// Story API
export const storyAPI = {
  // Generate story (v2 - profile based)
  generateStory: async (data) => {
    const response = await api.post('/v2/stories/generate', data);
    return response.data;
  },
  
  // Generate enhanced story with photos (v3)
  generateEnhancedStory: async (formData) => {
    const response = await api.post('/v3/stories/generate-with-photos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  // Get story history
  getHistory: async (limit = 10, offset = 0) => {
    const response = await api.get('/v2/stories/history', {
      params: { limit, offset }
    });
    return response.data;
  },
  
  // Get single story
  getStory: async (id) => {
    const response = await api.get(`/v2/stories/${id}`);
    return response.data;
  },
  
  // Toggle favorite
  toggleFavorite: async (id) => {
    const response = await api.put(`/v2/stories/${id}/favorite`);
    return response.data;
  },
  
  // Delete story
  deleteStory: async (id) => {
    const response = await api.delete(`/v2/stories/${id}`);
    return response.data;
  },
  
  // Rate story
  rateStory: async (id, rating) => {
    const formData = new FormData();
    formData.append('rating', rating);
    const response = await api.post(`/v2/stories/${id}/rate`, formData);
    return response.data;
  },
  
  // Export to PDF
  exportPDF: async (id) => {
    const response = await api.post(`/v2/stories/${id}/export-pdf`);
    return response.data;
  },
  
  // Get story templates
  getTemplates: async (ageGroup) => {
    const response = await api.get('/v3/stories/story-templates', {
      params: { age_group: ageGroup }
    });
    return response.data;
  },
  
  // Get character consistency tips
  getCharacterTips: async () => {
    const response = await api.get('/v3/stories/character-consistency-tips');
    return response.data;
  },
  
  // Analyze photo for character
  analyzePhoto: async (formData) => {
    const response = await api.post('/v3/stories/analyze-photo-for-character', formData, {
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
    const response = await api.get('/v1/subscription/plans');
    return response.data;
  },
  
  // Get current subscription
  getCurrentSubscription: async () => {
    const response = await api.get('/v1/subscription/current');
    return response.data;
  },
  
  // Create checkout session
  createCheckout: async (plan, successUrl, cancelUrl) => {
    const response = await api.post('/v1/subscription/checkout', {
      plan,
      success_url: successUrl,
      cancel_url: cancelUrl
    });
    return response.data;
  },
  
  // Create payment intent for individual story
  createPaymentIntent: async (description) => {
    const response = await api.post('/v1/subscription/payment-intent', {
      description
    });
    return response.data;
  },
  
  // Update subscription
  updateSubscription: async (plan) => {
    const response = await api.put('/v1/subscription/update', { plan });
    return response.data;
  },
  
  // Cancel subscription
  cancelSubscription: async (immediate = false) => {
    const response = await api.post('/v1/subscription/cancel', { immediate });
    return response.data;
  },
  
  // Reactivate subscription
  reactivateSubscription: async () => {
    const response = await api.post('/v1/subscription/reactivate');
    return response.data;
  },
  
  // Create customer portal session
  createPortalSession: async (returnUrl) => {
    const response = await api.post('/v1/subscription/portal', {
      return_url: returnUrl
    });
    return response.data;
  },
  
  // Get usage stats
  getUsageStats: async () => {
    const response = await api.get('/v1/subscription/usage');
    return response.data;
  },
  
  // Get payment history
  getPaymentHistory: async (limit = 10) => {
    const response = await api.get('/v1/subscription/history', {
      params: { limit }
    });
    return response.data;
  }
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await api.get('/v1/health');
    return response.data;
  }
};

export default api;