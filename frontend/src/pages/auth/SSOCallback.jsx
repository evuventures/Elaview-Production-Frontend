// src/pages/auth/SSOCallback.jsx
import React, { useEffect } from 'react';
import { useClerk, useAuth } from '@clerk/clerk-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import elaviewLogo from '../../public/elaview-logo.png';

export default function SSOCallback() {
  const { handleRedirectCallback } = useClerk();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get the redirect URL from query params or use default
  const redirectTo = searchParams.get('redirect_url') || '/browse';

  useEffect(() => {
    console.log('🔄 SSO Callback: Processing authentication...');
    
    const handleCallback = async () => {
      try {
        // Handle the OAuth callback
        await handleRedirectCallback();
        console.log('✅ SSO Callback: Authentication successful');
        
        // Wait a moment for auth state to update
        setTimeout(() => {
          navigate(redirectTo);
        }, 1000);
        
      } catch (error) {
        console.error('❌ SSO Callback error:', error);
        
        // If callback fails, redirect to sign-in with error message
        navigate(`/sign-in?error=sso_failed&redirect_url=${encodeURIComponent(redirectTo)}`);
      }
    };

    handleCallback();
  }, [handleRedirectCallback, navigate, redirectTo]);

  // If already signed in, redirect immediately
  useEffect(() => {
    if (isSignedIn) {
      console.log('✅ SSO Callback: User already signed in, redirecting...');
      navigate(redirectTo);
    }
  }, [isSignedIn, navigate, redirectTo]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src={elaviewLogo} 
            alt="Elaview Logo" 
            className="h-12 w-auto"
          />
        </div>
        
        {/* Loading State */}
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex flex-col items-center">
              {/* Spinner */}
              <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              
              {/* Text */}
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Completing sign-in...
              </h2>
              <p className="text-gray-600 text-center">
                Please wait while we finish setting up your account.
              </p>
            </div>
          </div>
          
          {/* Fallback Link */}
          <div className="mt-6">
            <button 
              onClick={() => navigate('/sign-in')}
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Having trouble? Return to sign-in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}