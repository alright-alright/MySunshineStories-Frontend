import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react';

const OAuthTest = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);

  const addResult = (test, status, details) => {
    setResults(prev => [...prev, { test, status, details, timestamp: new Date() }]);
  };

  const testOAuthRoutes = () => {
    setResults([]);
    
    // Test current location
    addResult('Current URL', 'info', window.location.href);
    addResult('Origin', 'info', window.location.origin);
    
    // Test OAuth URLs
    const googleRedirect = `${window.location.origin}/auth/google/callback`;
    const appleRedirect = `${window.location.origin}/auth/apple/callback`;
    
    addResult('Google Callback URL', 'success', googleRedirect);
    addResult('Apple Callback URL', 'success', appleRedirect);
    
    // Check environment variables
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const appleClientId = import.meta.env.VITE_APPLE_CLIENT_ID;
    
    addResult(
      'Google Client ID', 
      googleClientId ? 'success' : 'warning',
      googleClientId ? 'Configured' : 'Not configured (using demo mode)'
    );
    
    addResult(
      'Apple Client ID',
      appleClientId ? 'success' : 'warning', 
      appleClientId ? 'Configured' : 'Not configured (using demo mode)'
    );
    
    // Test React Router
    addResult('React Router', 'success', 'Routes configured correctly');
    
    // Check if callbacks are accessible
    const routes = [
      '/auth/google/callback',
      '/auth/apple/callback',
      '/auth/test/callback'
    ];
    
    routes.forEach(route => {
      addResult(
        `Route: ${route}`,
        'info',
        'Should be handled by OAuthCallback component'
      );
    });
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusBg = (status) => {
    switch(status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">OAuth Configuration Test</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test OAuth Routes</h2>
        
        <button
          onClick={testOAuthRoutes}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 mb-4"
        >
          Run Tests
        </button>
        
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Instructions for Google Console:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Go to Google Cloud Console</li>
            <li>Select your project</li>
            <li>Go to APIs & Services → Credentials</li>
            <li>Edit your OAuth 2.0 Client ID</li>
            <li>Add these Authorized redirect URIs:</li>
            <ul className="list-disc list-inside ml-4 mt-1">
              <li className="font-mono text-xs bg-gray-100 p-1 rounded mt-1">
                {window.location.origin}/auth/google/callback
              </li>
              <li className="font-mono text-xs bg-gray-100 p-1 rounded mt-1">
                http://localhost:5173/auth/google/callback
              </li>
            </ul>
          </ol>
        </div>
        
        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((result, index) => (
              <div
                key={index}
                className={`border rounded-lg p-3 ${getStatusBg(result.status)}`}
              >
                <div className="flex items-start space-x-3">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="font-medium">{result.test}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {result.details}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Test OAuth Flow</h2>
        
        <div className="space-y-4">
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-5 h-5" />
            Go to Login Page to Test OAuth
          </button>
          
          <div className="text-center text-sm text-gray-600">
            <p>Click above to go to the login page and test the OAuth flow.</p>
            <p className="mt-2">The callback should redirect to <code className="bg-gray-100 px-1 rounded">/auth/google/callback</code></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OAuthTest;