// src/pages/auth/SignUp.jsx
import React, { useState } from 'react';
import { SignUp, useSignUp, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import elaviewLogo from '../../public/elaview-logo.png';

export default function SignUpPage() {
  const navigate = useNavigate();
  
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showClerkUI, setShowClerkUI] = useState(false);

  const { signUp, setActive } = useSignUp();
  const { isSignedIn } = useAuth();

  // If already signed in, redirect
  React.useEffect(() => {
    if (isSignedIn) {
      navigate('/browse');
    }
  }, [isSignedIn, navigate]);

  const handleSubmit = async () => {
    // Validate and clean inputs
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    
    if (!trimmedFirstName || !trimmedLastName || !trimmedEmail || !trimmedPassword) {
      setError('Please fill in all fields.');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    
    // Password validation
    if (trimmedPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Attempting sign-up with:', { 
        firstName: trimmedFirstName, 
        lastName: trimmedLastName, 
        emailAddress: trimmedEmail 
      });
      
      const result = await signUp.create({
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        emailAddress: trimmedEmail,
        password: trimmedPassword,
      });

      // Check if we need email verification or CAPTCHA
      if (result.status === 'missing_requirements') {
        console.log('Missing requirements:', result.missingFields);
        
        // Check if CAPTCHA is required
        const hasCaptcha = result.missingFields?.includes('captcha');
        
        if (hasCaptcha) {
          // CAPTCHA is required, switch to Clerk UI which handles this automatically
          setError('Bot verification required. Please use the secure form below.');
          setShowClerkUI(true);
        } else {
          // Email verification is required
          await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
          setError('Please check your email for a verification code and complete sign-up through the secure form below.');
          setShowClerkUI(true);
        }
      } else if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        navigate('/browse');
      }
    } catch (err) {
      console.error('Sign-up error:', err);
      
      // Check if the error is CAPTCHA-related
      if (err.errors?.some(error => 
        error.code === 'captcha_invalid' || 
        error.code === 'captcha_required' ||
        error.code === 'captcha_failed'
      )) {
        setError('Bot verification required. Please use the secure form below to complete sign-up.');
        setShowClerkUI(true);
      } else if (err.errors?.some(error => 
        error.code === 'form_identifier_exists' ||
        error.message?.toLowerCase().includes('already exists')
      )) {
        setError('An account with this email already exists. Please sign in instead.');
      } else if (err.errors?.some(error => 
        error.code === 'form_password_validation_failed' ||
        error.message?.toLowerCase().includes('password')
      )) {
        setError('Password does not meet requirements. Please choose a stronger password.');
      } else {
        setError(err.errors?.[0]?.message || 'Sign-up failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FIXED: Force Google account selection for sign-up too
  const handleGoogleSignUp = async () => {
    try {
      console.log('🔐 Starting Google OAuth signup with account selection...');
      
      // ✅ SOLUTION: Force Google account picker for sign-up
      await signUp.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/browse',
        // ✅ FORCE ACCOUNT SELECTION: This makes Google show account picker
        additionalOAuthScopes: ['email', 'profile'],
        unsafeMetadata: {
          prompt: 'select_account',  // Force Google to show account selection
          include_granted_scopes: 'true'
        }
      });
    } catch (err) {
      console.error('❌ Google sign-up error:', err);
      setError('Google sign-up failed. Please try again.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  // Show Clerk's default UI for verification and complex flows
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
            <SignUp 
              routing="path"
              path="/sign-up"
              redirectUrl="/browse"
              fallbackRedirectUrl="/browse"
              // ✅ ENHANCED: Force Google account selection in Clerk UI
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
            Join the
            <span className="text-5xl xl:text-6xl block font-medium">marketplace</span>
          </h1>
          <p className="text-slate-600 text-lg xl:text-xl font-light">
            Start buying and selling advertising spaces
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
                Join the
                <span className="text-2xl sm:text-3xl block font-medium">marketplace</span>
              </h1>
              <p className="text-slate-600 text-sm font-light mb-3 sm:mb-4">
                Start buying and selling advertising spaces
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
          
          {/* Sign Up Form Container */}
          <div className="w-full max-w-sm mx-auto">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-3 sm:p-4">
              {error && (
                <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-700">{error}</p>
                </div>
              )}
              
              <div className="space-y-3 sm:space-y-4">
                
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="First name"
                        disabled={isLoading}
                        autoComplete="given-name"
                        autoCapitalize="words"
                        className="w-full border border-slate-300 rounded-lg py-2.5 sm:py-3 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all duration-200 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Last name"
                        disabled={isLoading}
                        autoComplete="family-name"
                        autoCapitalize="words"
                        className="w-full border border-slate-300 rounded-lg py-2.5 sm:py-3 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all duration-200 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

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
                      autoComplete="email"
                      autoCapitalize="none"
                      autoCorrect="off"
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
                      placeholder="Create a password"
                      disabled={isLoading}
                      autoComplete="new-password"
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

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 sm:py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-3 h-3" />
                    </>
                  )}
                </button>

                {/* Google Sign Up */}
                <button
                  onClick={handleGoogleSignUp}
                  disabled={isLoading}
                  className="w-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-2.5 sm:py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign up with Google
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

              {/* Sign In Section */}
              <div className="text-center space-y-2">
                <p className="text-xs text-slate-600">Already have an account?</p>
                <button 
                  onClick={() => navigate('/sign-in')}
                  className="text-slate-900 hover:text-slate-700 font-medium transition-colors duration-200 text-sm w-full py-1"
                >
                  Sign in here
                </button>
              </div>

              {/* Alternative Clerk UI Option */}
              <div className="text-center mt-2 sm:mt-3">
                <button 
                  onClick={() => setShowClerkUI(true)}
                  className="text-xs text-slate-500 hover:text-slate-700 transition-colors duration-200 w-full py-1"
                >
                  Need verification or having trouble? Use secure form
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-3 sm:pt-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                By signing up, you agree to our{' '}
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