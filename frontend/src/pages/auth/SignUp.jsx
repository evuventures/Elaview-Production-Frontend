// src/pages/auth/SignUp.jsx - WIREFRAME DESIGN VERSION
import React, { useState } from 'react';
import { SignUp, useSignUp, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
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
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showClerkUI, setShowClerkUI] = useState(false);

  const { signUp, setActive } = useSignUp();
  const { isSignedIn } = useAuth();

  // ✅ MOBILE: Add console log for mobile debugging
  React.useEffect(() => {
    console.log('📱 SIGN-UP PAGE: Mobile viewport check', {
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      isMobile: window.innerWidth < 768
    });
  }, []);

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
    
    // Password validation - enhanced for Clerk's requirements
    if (trimmedPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    
    // ✅ ENHANCED: Check for password strength
    const hasUpperCase = /[A-Z]/.test(trimmedPassword);
    const hasLowerCase = /[a-z]/.test(trimmedPassword);
    const hasNumbers = /\d/.test(trimmedPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(trimmedPassword);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      setError('Password must contain uppercase, lowercase, and numbers. Consider adding special characters for extra security.');
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
      
      // ✅ DEBUG: Log what Clerk expects
      console.log('🔍 Clerk signup object state:', signUp);
      console.log('🔍 Available fields:', {
        requiredFields: signUp?.requiredFields,
        optionalFields: signUp?.optionalFields,
        missingFields: signUp?.missingFields
      });
      
      // ✅ CORRECTED: Use camelCase for frontend API (not snake_case)
      const result = await signUp.create({
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        emailAddress: trimmedEmail,
        password: trimmedPassword,
      });

      console.log('🔍 Signup result status:', result.status);
      console.log('🔍 Signup result details:', result);
      
      if (result.status === 'complete') {
        console.log('✅ Signup complete immediately!');
        await setActive({ session: result.createdSessionId });
        navigate('/browse');
      } else {
        // ✅ NEW APPROACH: Handle verification in custom UI
        console.log('🔄 Preparing email verification...');
        
        try {
          await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
          console.log('📧 Email verification prepared successfully');
          
          // Show custom verification step instead of Clerk UI
          setShowVerification(true);
          setError(''); // Clear any previous errors
          
        } catch (prepError) {
          console.error('❌ Could not prepare email verification:', prepError);
          setError('Please complete sign-up using the secure form below.');
          setShowClerkUI(true);
        }
      }
    } catch (err) {
      console.error('Sign-up error:', err);
      console.error('🔍 Full error details:', JSON.stringify(err, null, 2));
      
      // Check if the error is CAPTCHA-related
      if (err.errors?.some(error => 
        error.code === 'captcha_invalid' || 
        error.code === 'captcha_required' ||
        error.code === 'captcha_failed'
      )) {
        setError('Bot verification required. Please use the secure form below to complete sign-up.');
        setShowClerkUI(true);
      } else if (err.errors?.some(error => 
        error.code === 'form_param_unknown' ||
        error.message?.toLowerCase().includes('not a valid parameter')
      )) {
        console.error('❌ CONFIGURATION ERROR: Check your Clerk Dashboard settings!');
        setError('Configuration error. Please contact support if this persists.');
        // Show Clerk UI as fallback
        setShowClerkUI(true);
      } else if (err.errors?.some(error => 
        error.code === 'form_identifier_exists' ||
        error.message?.toLowerCase().includes('already exists')
      )) {
        setError('An account with this email already exists. Please sign in instead.');
      } else if (err.errors?.some(error => 
        error.code === 'form_password_validation_failed' ||
        error.code === 'form_password_not_strong_enough' ||
        error.message?.toLowerCase().includes('password')
      )) {
        const passwordError = err.errors.find(error => 
          error.code === 'form_password_not_strong_enough' || 
          error.message?.toLowerCase().includes('password')
        );
        
        if (passwordError?.meta?.zxcvbn?.suggestions?.length > 0) {
          const suggestions = passwordError.meta.zxcvbn.suggestions.map(s => s.message).join(' ');
          setError(`Password too weak: ${suggestions} Try adding more unique words, numbers, and symbols.`);
        } else {
          setError('Password does not meet requirements. Please choose a stronger password with uppercase, lowercase, numbers, and symbols.');
        }
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

  const handleVerification = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter the verification code.');
      return;
    }
    
    setIsVerifying(true);
    setError('');
    
    try {
      console.log('🔐 Attempting email verification with code:', verificationCode.trim());
      
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode.trim(),
      });
      
      console.log('✅ Verification result:', result.status);
      
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        console.log('🎉 Signup and verification complete! Redirecting to /browse');
        navigate('/browse');
      } else {
        console.log('⚠️ Verification incomplete, status:', result.status);
        setError('Verification incomplete. Please try again or use the secure form below.');
        setShowClerkUI(true);
      }
    } catch (err) {
      console.error('❌ Verification error:', err);
      
      if (err.errors?.some(error => 
        error.code === 'form_code_incorrect' ||
        error.message?.toLowerCase().includes('incorrect')
      )) {
        setError('Incorrect verification code. Please check your email and try again.');
      } else if (err.errors?.some(error => 
        error.code === 'verification_expired' ||
        error.message?.toLowerCase().includes('expired')
      )) {
        setError('Verification code expired. Please request a new code or use the secure form below.');
        setShowClerkUI(true);
      } else {
        setError(err.errors?.[0]?.message || 'Verification failed. Please try again.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyPressVerification = (e) => {
    if (e.key === 'Enter') {
      handleVerification();
    }
  };

  // Show verification step
  if (showVerification && !showClerkUI) {
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
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Check Your Email</h2>
              <p className="text-gray-600">
                We sent a verification code to <span className="font-medium">{email}</span>
              </p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700 flex-1">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  onKeyPress={handleKeyPressVerification}
                  placeholder="Enter 6-digit code"
                  disabled={isVerifying}
                  maxLength={6}
                  className="w-full border border-gray-300 rounded-lg py-3 px-4 text-center text-lg font-mono tracking-widest text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <button
                onClick={handleVerification}
                disabled={isVerifying || !verificationCode.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Verify Email'
                )}
              </button>

              <button 
                onClick={() => setShowVerification(false)}
                className="w-full text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm"
              >
                ← Back to sign up
              </button>

              <button 
                onClick={() => setShowClerkUI(true)}
                className="w-full text-blue-600 hover:text-blue-700 transition-colors duration-200 text-sm"
              >
                Use secure verification form
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show Clerk's default UI for verification and complex flows
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
            <SignUp 
              routing="path"
              path="/sign-up"
              fallbackRedirectUrl="/browse"
              forceRedirectUrl="/browse"
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
            Join the{' '}
            <span className="text-blue-400 font-medium text-6xl block">marketplace</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 font-light">
            Start buying and selling advertising spaces.
          </p>
          <button 
            onClick={() => navigate('/learn-more')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-all duration-200 font-medium"
          >
            Learn More
          </button>
        </div>
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden bg-slate-800 text-white p-6 text-center">
          <img 
            src={elaviewLogo} 
            alt="Elaview Logo" 
            className="h-8 w-auto mx-auto mb-4 filter brightness-0 invert"
          />
          <h1 className="text-2xl font-light">
            Join the <span className="text-blue-400 font-medium">marketplace</span>
          </h1>
          <p className="text-gray-300 mt-2">Start buying and selling advertising spaces.</p>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-gray-50">
          <div className="w-full max-w-md">
            {/* Form Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-semibold text-gray-900 mb-2">Create Account</h2>
              <p className="text-gray-600">Welcome! Please fill in the details to get started.</p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700 flex-1">{error}</p>
              </div>
            )}

            {/* Sign Up Form */}
            <div className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="First name"
                    disabled={isLoading}
                    autoComplete="given-name"
                    autoCapitalize="words"
                    className="w-full border border-gray-300 rounded-lg py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Last name"
                    disabled={isLoading}
                    autoComplete="family-name"
                    autoCapitalize="words"
                    className="w-full border border-gray-300 rounded-lg py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

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
                    placeholder="Create a password"
                    disabled={isLoading}
                    autoComplete="new-password"
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

              {/* Create Account Button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading || !firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Create Account'
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

              {/* Google Sign Up */}
              <button
                onClick={handleGoogleSignUp}
                disabled={isLoading}
                className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign up with Google
              </button>

              {/* Sign In Link */}
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button 
                    onClick={() => navigate('/sign-in')}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Sign in here
                  </button>
                </p>
              </div>

              {/* Alternative Clerk UI Option */}
              <div className="text-center pt-2">
                <button 
                  onClick={() => setShowClerkUI(true)}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  Need verification or having trouble? Use secure form
                </button>
              </div>
            </div>

            {/* Terms and Privacy */}
            <div className="text-center pt-8">
              <p className="text-xs text-gray-500 leading-relaxed">
                By signing up, you agree to our{' '}
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