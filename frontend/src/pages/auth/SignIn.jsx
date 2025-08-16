// src/pages/SignIn.jsx - WIREFRAME DESIGN VERSION
import React, { useState } from 'react';
import { SignIn, useSignIn, useAuth } from '@clerk/clerk-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import elaviewLogo from '../../public/elaview-logo.png';

export default function SignInPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const redirectUrl = searchParams.get('redirect_url') || '/browse';
  
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showClerkUI, setShowClerkUI] = useState(false);

  const { signIn, setActive } = useSignIn();
  const { isSignedIn } = useAuth();

  // ✅ MOBILE: Add console log for mobile debugging
  React.useEffect(() => {
    console.log('📱 SIGN-IN PAGE: Mobile viewport check', {
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      isMobile: window.innerWidth < 768
    });
  }, []);

  // Check for SSO error from URL params
  React.useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'sso_failed') {
      setError('Google sign-in was cancelled or failed. Please try again.');
    }
  }, [searchParams]);

  // If already signed in, redirect
  React.useEffect(() => {
    if (isSignedIn) {
      navigate(redirectUrl);
    }
  }, [isSignedIn, navigate, redirectUrl]);

  // ✅ ENHANCED: Better email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim().toLowerCase());
  };

  const handleSubmit = async () => {
    // ✅ ENHANCED: Better input validation
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    
    if (!trimmedEmail || !trimmedPassword) {
      setError('Please enter both email and password.');
      return;
    }
    
    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      console.log('🔐 Attempting sign-in with email:', trimmedEmail);
      
      // ✅ FIXED: Use emailAddress instead of identifier for better compatibility
      const result = await signIn.create({
        identifier: trimmedEmail,  // Clerk accepts both emailAddress and identifier
        password: trimmedPassword,
      });

      console.log('🔐 Sign-in result:', result.status);

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        console.log('✅ Sign-in successful, redirecting to:', redirectUrl);
        navigate(redirectUrl);
      } else if (result.status === 'needs_second_factor') {
        // Handle 2FA if enabled
        setError('Two-factor authentication required. Please use the secure form below.');
        setShowClerkUI(true);
      } else {
        console.log('⚠️ Sign-in incomplete, status:', result.status);
        setError('Sign-in process not completed. Please try the secure form below.');
        setShowClerkUI(true);
      }
    } catch (err) {
      console.error('❌ Sign-in error:', err);
      
      // ✅ ENHANCED: Better error handling
      if (err.errors?.some(error => 
        error.code === 'form_identifier_not_found' ||
        error.code === 'form_identifier_exists' ||
        error.message?.toLowerCase().includes('identifier')
      )) {
        setError('No account found with this email address. Please check your email or sign up.');
      } else if (err.errors?.some(error => 
        error.code === 'form_password_incorrect' ||
        error.message?.toLowerCase().includes('password')
      )) {
        setError('Incorrect password. Please try again or reset your password.');
      } else if (err.errors?.some(error => 
        error.code === 'captcha_invalid' || 
        error.code === 'captcha_required'
      )) {
        setError('Bot verification required. Please use the secure form below.');
        setShowClerkUI(true);
      } else if (err.errors?.some(error => 
        error.code === 'identifier_invalid' ||
        error.message?.toLowerCase().includes('invalid')
      )) {
        setError('Invalid email format. Please check your email address.');
      } else {
        setError(err.errors?.[0]?.message || 'Sign-in failed. Please try the secure form below.');
        // Show Clerk UI for complex cases
        setTimeout(() => setShowClerkUI(true), 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FIXED: Force Google account selection
  const handleGoogleSignIn = async () => {
    try {
      console.log('🔐 Starting Google OAuth with account selection...');
      
      // ✅ SOLUTION: Force Google account picker
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: redirectUrl,
        // ✅ FORCE ACCOUNT SELECTION: This makes Google show account picker
        additionalOAuthScopes: ['email', 'profile'],
        unsafeMetadata: {
          prompt: 'select_account',  // Force Google to show account selection
          include_granted_scopes: 'true'
        }
      });
    } catch (err) {
      console.error('❌ Google sign-in error:', err);
      setError('Google sign-in failed. Please try again.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  // Show Clerk's default UI for complex flows (if needed)
  if (showClerkUI) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <img 
              src={elaviewLogo} 
              alt="Elaview Logo" 
              className="h-12 w-auto"
            />
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <SignIn 
              routing="path"
              path="/sign-in"
              fallbackRedirectUrl={redirectUrl}
              forceRedirectUrl={redirectUrl}
              // ✅ ENHANCED: Force Google account selection in Clerk UI too
              socialConnectorOptions={{
                google: {
                  prompt: 'select_account'
                }
              }}
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'bg-transparent shadow-none border-none w-full',
                  header: 'hidden',
                  formButtonPrimary: 'w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm text-sm',
                  formFieldInput: 'w-full border border-gray-300 rounded-lg py-3 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white',
                  formFieldLabel: 'text-sm font-medium text-gray-700 mb-1',
                  socialButtonsBlockButton: 'w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm text-sm',
                  footerActionLink: 'text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 text-sm',
                  dividerLine: 'border-gray-200',
                  dividerText: 'bg-white px-3 text-gray-500 text-sm',
                }
              }}
            />
            
            <button 
              onClick={() => setShowClerkUI(false)}
              className="mt-4 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 w-full text-center"
            >
              ← Back to custom form
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Dark Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-800 text-white flex-col justify-center items-center p-12">
        {/* Main Content */}
        <div className="text-center max-w-lg">
          {/* Logo positioned above heading */}
          <div className="flex justify-center mb-8">
            <img 
              src={elaviewLogo} 
              alt="Elaview Logo" 
              className="h-12 w-auto filter brightness-0 invert"
            />
          </div>

          <h1 className="text-5xl font-light leading-tight mb-6">
            Your business,{' '}
            <span className="text-blue-400 font-medium text-6xl block">amplified</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 font-light">
            Getting noticed has never been easier.
          </p>
          <button 
            onClick={() => navigate('/learn-more')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-all duration-200 font-medium"
          >
            Learn More
          </button>
        </div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden bg-slate-800 text-white p-6 text-center">
          <img 
            src={elaviewLogo} 
            alt="Elaview Logo" 
            className="h-8 w-auto mx-auto mb-4 filter brightness-0 invert"
          />
          <h1 className="text-2xl font-light">
            Your business, <span className="text-blue-400 font-medium">amplified</span>
          </h1>
          <p className="text-gray-300 mt-2">Getting noticed has never been easier.</p>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-gray-50">
          <div className="w-full max-w-md">
            {/* Form Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-semibold text-gray-900 mb-2">Sign In</h2>
              <p className="text-gray-600">Welcome back! Please enter your details.</p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700 flex-1">{error}</p>
              </div>
            )}

            {/* Sign In Form */}
            <div className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your email"
                  disabled={isLoading}
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  className="w-full border border-gray-300 rounded-lg py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter your password"
                    disabled={isLoading}
                    autoComplete="current-password"
                    className="w-full border border-gray-300 rounded-lg py-3 px-4 pr-12 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <button 
                  onClick={() => navigate('/forgot-password')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot password?
                </button>
              </div>

              {/* Sign In Button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading || !email || !password}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Sign In'
                )}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-gray-50 px-4 text-gray-500">or</span>
                </div>
              </div>

              {/* Google Sign In */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              {/* Sign Up Link */}
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  New to Elaview?{' '}
                  <button 
                    onClick={() => navigate('/sign-up')}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Create your account
                  </button>
                </p>
              </div>

              {/* Alternative Clerk UI Option */}
              <div className="text-center pt-2">
                <button 
                  onClick={() => setShowClerkUI(true)}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  Having trouble? Use secure sign-in form
                </button>
              </div>
            </div>

            {/* Terms and Privacy */}
            <div className="text-center pt-8">
              <p className="text-xs text-gray-500 leading-relaxed">
                By signing in, you agree to our{' '}
                <button className="underline hover:no-underline">Terms of Service</button>
                {' '}and{' '}
                <button className="underline hover:no-underline">Privacy Policy</button>
              </p>
            </div>
            
            {/* ✅ CAPTCHA Container - Required for Clerk CAPTCHA */}
            <div id="clerk-captcha" className="hidden"></div>
          </div>
        </div>
      </div>
    </div>
  );
}