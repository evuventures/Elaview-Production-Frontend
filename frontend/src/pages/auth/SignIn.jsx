// src/pages/SignIn.jsx
import React, { useState } from 'react';
import { SignIn, useSignIn, useAuth } from '@clerk/clerk-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
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

  // If already signed in, redirect
  React.useEffect(() => {
    if (isSignedIn) {
      navigate(redirectUrl);
    }
  }, [isSignedIn, navigate, redirectUrl]);

  const handleSubmit = async () => {
    if (!email || !password) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await signIn.create({
        identifier: email,
        password: password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        navigate(redirectUrl);
      } else {
        setError('Sign-in process not completed. Please try again.');
      }
    } catch (err) {
      console.error('Sign-in error:', err);
      
      // Check if the error is CAPTCHA-related
      if (err.errors?.some(error => error.code === 'captcha_invalid' || error.code === 'captcha_required')) {
        setError('Bot verification required. Please use the alternative form below to complete sign-in.');
        setShowClerkUI(true);
      } else {
        setError(err.errors?.[0]?.message || 'Invalid email or password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: redirectUrl,
      });
    } catch (err) {
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
      <div 
        className="min-h-screen flex items-center justify-center p-3 sm:p-4 lg:p-8"
        style={{ backgroundColor: '#f7f5e6' }} 
      >
        <div className="w-full max-w-sm sm:max-w-md">
          {/* Responsive Logo */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <img 
              src={elaviewLogo} 
              alt="Elaview Logo" 
              className="h-12 sm:h-14 md:h-16 w-auto"
            />
          </div>
          
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
            <SignIn 
              routing="path"
              path="/sign-in"
              redirectUrl={redirectUrl}
              fallbackRedirectUrl="/browse"
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'bg-transparent shadow-none border-none w-full',
                  header: 'hidden',
                  formButtonPrimary: 'w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm text-sm min-h-[44px]',
                  formFieldInput: 'w-full border border-slate-300 rounded-lg py-3 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all duration-200 bg-white min-h-[44px]',
                  formFieldLabel: 'text-xs font-medium text-slate-700 mb-1',
                  socialButtonsBlockButton: 'w-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm text-sm min-h-[44px]',
                  footerActionLink: 'text-slate-900 hover:text-slate-700 font-medium transition-colors duration-200 text-sm',
                  dividerLine: 'border-slate-200',
                  dividerText: 'bg-white px-3 text-slate-500 text-xs',
                }
              }}
            />
            
            <button 
              onClick={() => setShowClerkUI(false)}
              className="mt-4 text-xs text-slate-600 hover:text-slate-900 transition-colors duration-200 min-h-[44px] flex items-center"
            >
              ← Back to custom form
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex"
      style={{ backgroundColor: '#f7f5e6' }} 
    >
      {/* Left Half - Logo, Header, Subheader */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-8 xl:p-12">
        {/* Logo */}
        <div className="mb-8 xl:mb-12">
          <img 
            src={elaviewLogo} 
            alt="Elaview Logo" 
            className="h-16 xl:h-20 w-auto"
          />
        </div>

        {/* Header */}
        <div className="text-center max-w-md mb-8 xl:mb-12">
          <h1 className="text-4xl xl:text-5xl font-light text-slate-900 leading-tight mb-4">
            Your business,
            <span className="text-5xl xl:text-6xl block font-medium">amplified</span>
          </h1>
          <p className="text-slate-600 text-lg xl:text-xl font-light">
            Getting noticed has never been easier
          </p>
        </div>

        {/* Learn More Button */}
        <button 
          onClick={() => navigate('/learn-more')}
          className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 px-6 xl:px-8 py-3 xl:py-3.5 rounded-lg transition-all duration-200 shadow-sm text-sm xl:text-base"
        >
          Learn more
        </button>
      </div>

      {/* Right Half - Form and everything else */}
      <div className="w-full lg:w-1/2 flex flex-col h-screen max-h-screen overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center p-3 sm:p-4 lg:p-6 xl:p-8 py-4 sm:py-6">
          
          {/* Mobile Logo and Header (shown only on mobile) */}
          <div className="lg:hidden mb-4 sm:mb-6">
            <div className="flex justify-center mb-3 sm:mb-4">
              <img 
                src={elaviewLogo} 
                alt="Elaview Logo" 
                className="h-10 sm:h-12 w-auto"
              />
            </div>
            <div className="text-center mb-4">
              <h1 className="text-xl sm:text-2xl font-light text-slate-900 leading-tight mb-1 sm:mb-2">
                Your business,
                <span className="text-2xl sm:text-3xl block font-medium">amplified</span>
              </h1>
              <p className="text-slate-600 text-sm font-light mb-3 sm:mb-4">
                Getting noticed has never been easier
              </p>
              {/* Learn More Button for Mobile */}
              <button 
                onClick={() => navigate('/learn-more')}
                className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg transition-all duration-200 shadow-sm text-sm"
              >
                Learn more
              </button>
            </div>
          </div>
          
          {/* Login Form Container */}
          <div className="w-full max-w-sm mx-auto">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-3 sm:p-4">
              {error && (
                <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-700">{error}</p>
                </div>
              )}
              
              <div className="space-y-3 sm:space-y-4">
                
                {/* Email Field */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter your email"
                      disabled={isLoading}
                      className="w-full border border-slate-300 rounded-lg py-2.5 sm:py-3 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all duration-200 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter your password"
                      disabled={isLoading}
                      className="w-full border border-slate-300 rounded-lg py-2.5 sm:py-3 pl-10 pr-12 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all duration-200 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between py-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900 focus:ring-2"
                    />
                    <span className="text-xs text-slate-600">Remember me</span>
                  </label>
                  <button 
                    onClick={() => navigate('/forgot-password')}
                    className="text-xs text-slate-600 hover:text-slate-900 transition-colors duration-200 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !email || !password}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 sm:py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-3 h-3" />
                    </>
                  )}
                </button>

                {/* Google Sign In */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-2.5 sm:py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-3 sm:my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-slate-500">
                    or
                  </span>
                </div>
              </div>

              {/* Sign Up Section */}
              <div className="text-center space-y-2">
                <p className="text-xs text-slate-600">New to Elaview?</p>
                <button 
                  onClick={() => navigate('/sign-up')}
                  className="text-slate-900 hover:text-slate-700 font-medium transition-colors duration-200 text-sm w-full py-1"
                >
                  Create your account
                </button>
              </div>

              {/* Alternative Clerk UI Option */}
              <div className="text-center mt-2 sm:mt-3">
                <button 
                  onClick={() => setShowClerkUI(true)}
                  className="text-xs text-slate-500 hover:text-slate-700 transition-colors duration-200 w-full py-1"
                >
                  Having trouble? Use secure sign-in form
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-3 sm:pt-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                By signing in, you agree to our{' '}
                <button className="underline hover:no-underline">Terms of Service</button>
                {' '}and{' '}
                <button className="underline hover:no-underline">Privacy Policy</button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}