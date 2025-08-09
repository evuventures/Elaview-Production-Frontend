// src/pages/auth/DebugSignUp.jsx - TEMPORARY DEBUG VERSION
import React, { useState } from 'react';
import { SignUp, useSignUp, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Settings } from 'lucide-react';
import elaviewLogo from '../../public/elaview-logo.png';

export default function DebugSignUpPage() {
  const navigate = useNavigate();
  const { signUp, isLoaded } = useSignUp();
  const { isSignedIn } = useAuth();
  const [debugInfo, setDebugInfo] = useState(null);

  // If already signed in, redirect
  React.useEffect(() => {
    if (isSignedIn) {
      navigate('/browse');
    }
  }, [isSignedIn, navigate]);

  // Debug Clerk configuration
  React.useEffect(() => {
    if (isLoaded && signUp) {
      const info = {
        isLoaded,
        requiredFields: signUp.requiredFields || [],
        optionalFields: signUp.optionalFields || [],
        missingFields: signUp.missingFields || [],
        status: signUp.status,
        attributes: signUp.attributes || {}
      };
      setDebugInfo(info);
      console.log('🔍 CLERK DEBUG INFO:', info);
    }
  }, [isLoaded, signUp]);

  const testCustomSignup = async () => {
    if (!isLoaded || !signUp) return;

    try {
      console.log('🧪 Testing custom signup flow...');
      
      const result = await signUp.create({
        emailAddress: 'test@example.com',
        password: 'MySecurePassword123!',  // ✅ STRONGER PASSWORD
        firstName: 'Test',
        lastName: 'User'
      });
      
      console.log('✅ Custom signup result:', result);
      console.log('📋 Status:', result.status);
      console.log('📋 Missing fields:', result.missingFields);
      
      // Always prepare email verification for non-complete status
      if (result.status !== 'complete') {
        console.log('🔄 Preparing email verification...');
        const verificationResult = await signUp.prepareEmailAddressVerification({ 
          strategy: 'email_code' 
        });
        console.log('📧 Verification prepared:', verificationResult);
      }
      
    } catch (error) {
      console.error('❌ Custom signup failed:', error);
      console.error('🔍 Error details:', JSON.stringify(error, null, 2));
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Side - Debug Info */}
      <div className="w-1/2 bg-slate-800 text-white p-8 overflow-y-auto">
        <div className="mb-8">
          <img 
            src={elaviewLogo} 
            alt="Elaview Logo" 
            className="h-10 w-auto filter brightness-0 invert mb-6"
          />
          <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Debug Information
          </h1>
        </div>

        {debugInfo ? (
          <div className="space-y-6">
            <div className="bg-slate-700 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-blue-400">Clerk Status:</h3>
              <p>Loaded: {debugInfo.isLoaded ? '✅ Yes' : '❌ No'}</p>
              <p>Status: {debugInfo.status || 'Unknown'}</p>
            </div>

            <div className="bg-slate-700 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-green-400">Required Fields:</h3>
              {debugInfo.requiredFields.length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {debugInfo.requiredFields.map((field, i) => (
                    <li key={i} className="text-sm">{field}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">None</p>
              )}
            </div>

            <div className="bg-slate-700 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-yellow-400">Optional Fields:</h3>
              {debugInfo.optionalFields.length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {debugInfo.optionalFields.map((field, i) => (
                    <li key={i} className="text-sm">{field}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">None</p>
              )}
            </div>

            <div className="bg-slate-700 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-red-400">Missing Fields:</h3>
              {debugInfo.missingFields.length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {debugInfo.missingFields.map((field, i) => (
                    <li key={i} className="text-sm">{field}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">None</p>
              )}
            </div>

            <button
              onClick={testCustomSignup}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors mb-2"
            >
              Test Custom Signup Flow
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2"></div>
              <p>Loading debug info...</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Side - Clerk UI */}
      <div className="w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Debug Signup
            </h2>
            <p className="text-gray-600">
              Use this to test your Clerk configuration
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Using Clerk's Built-in UI</p>
                <p>This bypasses your custom form and uses Clerk's default signup flow to help debug configuration issues.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <SignUp 
              routing="path"
              path="/debug-signup"
              redirectUrl="/browse"
              fallbackRedirectUrl="/browse"
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'bg-transparent shadow-none border-none w-full',
                  header: 'hidden',
                  formButtonPrimary: 'w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200',
                  formFieldInput: 'w-full border border-gray-300 rounded-lg py-3 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  formFieldLabel: 'text-sm font-medium text-gray-700 mb-1',
                  socialButtonsBlockButton: 'w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-all duration-200',
                  footerActionLink: 'text-blue-600 hover:text-blue-700 font-medium text-sm',
                }
              }}
            />
          </div>

          <div className="text-center mt-6">
            <button 
              onClick={() => navigate('/sign-up')}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              ← Back to custom signup form
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}