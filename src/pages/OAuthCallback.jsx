import React, { useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const OAuthCallback = () => {
  const { provider } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleOAuthCallback } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      // Validate provider parameter
      if (!provider || !['google', 'apple'].includes(provider.toLowerCase())) {
        console.error('Invalid OAuth provider:', provider);
        navigate('/login');
        return;
      }

      if (error) {
        console.error('OAuth error:', error);
        navigate('/login');
        return;
      }

      if (code) {
        console.log('Processing OAuth callback:', {
          provider: provider.toLowerCase(),
          code: code.substring(0, 20) + '...',
          redirectUri: `${window.location.origin}/auth/${provider.toLowerCase()}/callback`
        });
        
        const success = await handleOAuthCallback(provider.toLowerCase(), code);
        if (success) {
          // CEO wants users to go directly to create profile after OAuth
          navigate('/sunshines/create');
        } else {
          navigate('/login');
        }
      } else {
        console.error('No authorization code received');
        navigate('/login');
      }
    };

    handleCallback();
  }, [provider, searchParams, navigate, handleOAuthCallback]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center">
      <LoadingSpinner message="Completing login..." />
    </div>
  );
};

export default OAuthCallback;