import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Copy, ExternalLink } from 'lucide-react';

const OAuthDiagnostic = () => {
  const [diagnostics, setDiagnostics] = useState({});
  const [copied, setCopied] = useState('');
  
  // The correct client ID from Google Console
  const EXPECTED_CLIENT_ID = '54277524932-qc0haj2b96vnausho0c6gopjnkt1309u.apps.googleusercontent.com';
  const EXPECTED_REDIRECT = 'https://my-sunshine-stories-frontend-ojb3dgk92-aerware-ai.vercel.app/auth/google/callback';
  
  useEffect(() => {
    runDiagnostics();
  }, []);
  
  const runDiagnostics = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const origin = window.location.origin;
    const actualRedirect = `${origin}/auth/google/callback`;
    
    const diag = {
      // Environment Variable Checks
      clientIdExists: !!clientId,
      clientIdValue: clientId || 'NOT SET',
      clientIdCorrect: clientId === EXPECTED_CLIENT_ID,
      clientIdLength: clientId?.length || 0,
      expectedClientId: EXPECTED_CLIENT_ID,
      
      // Redirect URI Checks
      currentOrigin: origin,
      actualRedirectUri: actualRedirect,
      expectedRedirectUri: EXPECTED_REDIRECT,
      redirectUriMatch: actualRedirect === EXPECTED_REDIRECT,
      
      // OAuth URL Construction
      oauthUrl: clientId ? buildOAuthUrl(clientId, actualRedirect) : null,
      
      // Environment Checks
      nodeEnv: process.env.NODE_ENV,
      viteMode: import.meta.env.MODE,
      isProd: import.meta.env.PROD,
      isDev: import.meta.env.DEV,
      
      // All Vite Environment Variables
      allViteVars: Object.keys(import.meta.env)
        .filter(k => k.startsWith('VITE_'))
        .reduce((acc, key) => {
          acc[key] = import.meta.env[key];
          return acc;
        }, {})
    };
    
    setDiagnostics(diag);
  };
  
  const buildOAuthUrl = (clientId, redirectUri) => {
    return `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=openid%20email%20profile&` +
      `access_type=offline&` +
      `prompt=consent`;
  };
  
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };
  
  const StatusIcon = ({ condition }) => {
    if (condition === true) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (condition === false) return <XCircle className="w-5 h-5 text-red-500" />;
    return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
  };
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">OAuth Diagnostic Tool</h1>
      
      {/* Critical Issues Alert */}
      {(!diagnostics.clientIdCorrect || !diagnostics.redirectUriMatch) && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 mb-2">⚠️ Critical Configuration Issues Detected</h2>
          <ul className="space-y-2 text-sm text-red-700">
            {!diagnostics.clientIdCorrect && (
              <li>• Client ID mismatch: Expected {EXPECTED_CLIENT_ID.substring(0, 20)}...</li>
            )}
            {!diagnostics.redirectUriMatch && (
              <li>• Redirect URI mismatch: Current origin doesn't match Vercel deployment</li>
            )}
          </ul>
        </div>
      )}
      
      {/* Client ID Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <StatusIcon condition={diagnostics.clientIdCorrect} />
          Google Client ID Configuration
        </h2>
        
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Environment Variable Set:</p>
              <p className="font-mono">{diagnostics.clientIdExists ? '✅ Yes' : '❌ No'}</p>
            </div>
            <div>
              <p className="text-gray-600">Client ID Correct:</p>
              <p className="font-mono">{diagnostics.clientIdCorrect ? '✅ Yes' : '❌ No'}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-xs text-gray-600 mb-1">Current Client ID:</p>
            <div className="flex items-center gap-2">
              <code className="text-xs break-all flex-1">
                {diagnostics.clientIdValue}
              </code>
              <button
                onClick={() => copyToClipboard(diagnostics.clientIdValue, 'current')}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="bg-green-50 p-3 rounded">
            <p className="text-xs text-gray-600 mb-1">Expected Client ID (from Google Console):</p>
            <div className="flex items-center gap-2">
              <code className="text-xs break-all flex-1">
                {EXPECTED_CLIENT_ID}
              </code>
              <button
                onClick={() => copyToClipboard(EXPECTED_CLIENT_ID, 'expected')}
                className="p-1 hover:bg-green-200 rounded"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Redirect URI Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <StatusIcon condition={diagnostics.redirectUriMatch} />
          Redirect URI Configuration
        </h2>
        
        <div className="space-y-3">
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-xs text-gray-600 mb-1">Current Origin:</p>
            <code className="text-xs">{diagnostics.currentOrigin}</code>
          </div>
          
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-xs text-gray-600 mb-1">Generated Redirect URI:</p>
            <div className="flex items-center gap-2">
              <code className="text-xs break-all flex-1">
                {diagnostics.actualRedirectUri}
              </code>
              <button
                onClick={() => copyToClipboard(diagnostics.actualRedirectUri, 'redirect')}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="bg-green-50 p-3 rounded">
            <p className="text-xs text-gray-600 mb-1">Expected in Google Console:</p>
            <div className="flex items-center gap-2">
              <code className="text-xs break-all flex-1">
                {EXPECTED_REDIRECT}
              </code>
              <button
                onClick={() => copyToClipboard(EXPECTED_REDIRECT, 'console')}
                className="p-1 hover:bg-green-200 rounded"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* OAuth URL Test */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">OAuth URL Test</h2>
        
        {diagnostics.oauthUrl ? (
          <div className="space-y-3">
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xs text-gray-600 mb-2">Generated OAuth URL:</p>
              <code className="text-xs break-all block mb-3">
                {diagnostics.oauthUrl}
              </code>
              <a
                href={diagnostics.oauthUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                <ExternalLink className="w-4 h-4" />
                Test OAuth Flow
              </a>
            </div>
            <p className="text-sm text-gray-600">
              Click the button above to test the OAuth flow. You should see Google's login page.
              If you see "invalid_client" error, the client ID is incorrect.
            </p>
          </div>
        ) : (
          <p className="text-red-600">Cannot generate OAuth URL - Client ID not configured</p>
        )}
      </div>
      
      {/* Environment Variables */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
        
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-xs text-gray-600 mb-2">All VITE_ variables:</p>
          <pre className="text-xs overflow-x-auto">
            {JSON.stringify(diagnostics.allViteVars, null, 2)}
          </pre>
        </div>
      </div>
      
      {/* Solution Steps */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">📋 How to Fix</h2>
        
        <ol className="space-y-3 text-sm">
          <li>
            <strong>1. Set the correct Client ID in Vercel:</strong>
            <ul className="ml-4 mt-1 space-y-1 text-gray-700">
              <li>• Go to Vercel Dashboard → Settings → Environment Variables</li>
              <li>• Add: <code className="bg-white px-1 rounded">VITE_GOOGLE_CLIENT_ID</code></li>
              <li>• Value: <code className="bg-white px-1 rounded text-xs">{EXPECTED_CLIENT_ID}</code></li>
            </ul>
          </li>
          
          <li>
            <strong>2. Verify Google Console Configuration:</strong>
            <ul className="ml-4 mt-1 space-y-1 text-gray-700">
              <li>• Go to Google Cloud Console → APIs & Services → Credentials</li>
              <li>• Edit your OAuth 2.0 Client ID</li>
              <li>• Add authorized redirect URI:</li>
              <li className="ml-4">
                <code className="bg-white px-1 rounded text-xs">{diagnostics.actualRedirectUri}</code>
              </li>
            </ul>
          </li>
          
          <li>
            <strong>3. Redeploy on Vercel:</strong>
            <ul className="ml-4 mt-1 space-y-1 text-gray-700">
              <li>• After adding environment variables, trigger a new deployment</li>
              <li>• Vercel → Deployments → Redeploy</li>
            </ul>
          </li>
        </ol>
      </div>
      
      {copied && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg">
          Copied {copied}!
        </div>
      )}
    </div>
  );
};

export default OAuthDiagnostic;