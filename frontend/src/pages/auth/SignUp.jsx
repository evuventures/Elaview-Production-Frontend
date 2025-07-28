// src/pages/SignUp.jsx
import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Sparkles, Star, Shield, Zap } from 'lucide-react';
import cityNightImage from '@/public/citynight.jpg';

export default function SignUpPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Cityscape Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${cityNightImage})` }}
      ></div>
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40"></div>
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/20 via-transparent to-slate-900/30"></div>
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* App Branding */}
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-xl">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
            Join Our Platform
          </h1>
          <p className="text-white/90 text-lg drop-shadow-md">
            Start buying and selling advertising spaces
          </p>
        </div>

        {/* Benefits Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/20 backdrop-blur-md border border-white/30 text-center p-3 rounded-2xl shadow-2xl">
            <Star className="w-5 h-5 text-yellow-400 mx-auto mb-1 drop-shadow-lg" />
            <p className="text-xs font-medium text-white drop-shadow-md">Premium Listings</p>
          </div>
          <div className="bg-white/20 backdrop-blur-md border border-white/30 text-center p-3 rounded-2xl shadow-2xl">
            <Shield className="w-5 h-5 text-green-400 mx-auto mb-1 drop-shadow-lg" />
            <p className="text-xs font-medium text-white drop-shadow-md">Secure Platform</p>
          </div>
          <div className="bg-white/20 backdrop-blur-md border border-white/30 text-center p-3 rounded-2xl shadow-2xl">
            <Zap className="w-5 h-5 text-blue-400 mx-auto mb-1 drop-shadow-lg" />
            <p className="text-xs font-medium text-white drop-shadow-md">Instant Setup</p>
          </div>
        </div>
        
        {/* Sign-Up Form Card - Enhanced Glassmorphism */}
        <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden">
          <CardContent className="p-8">
            <SignUp 
              routing="path"
              path="/sign-up"
              redirectUrl="/browse"
              fallbackRedirectUrl="/browse"
              appearance={{
                elements: {
                  // Main container
                  rootBox: 'w-full',
                  card: 'bg-transparent shadow-none border-none w-full',
                  
                  // Header
                  header: 'hidden', // Hide default header since we have our own
                  
                  // Form styling to match your app
                  formButtonPrimary: 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 border-none',
                  
                  // Input fields
                  formFieldInput: 'bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl py-3 px-4 text-base text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all duration-200',
                  formFieldLabel: 'text-base font-semibold text-white mb-2 drop-shadow-md',
                  
                  // Social buttons
                  socialButtonsBlockButton: 'bg-white/80 backdrop-blur-sm border border-white/50 hover:bg-white/90 rounded-2xl py-3 px-4 transition-all duration-200 shadow-lg hover:shadow-xl',
                  socialButtonsBlockButtonText: 'text-slate-900 font-medium',
                  
                  // Links and text
                  footerActionLink: 'text-teal-300 hover:text-teal-200 font-medium transition-colors duration-200',
                  formFieldHintText: 'text-white/70 text-sm',
                  formFieldErrorText: 'text-red-300 text-sm',
                  
                  // Divider
                  dividerLine: 'bg-white/30',
                  dividerText: 'text-white/80 bg-black/20 backdrop-blur-sm px-4 rounded-lg',
                  
                  // Form container
                  form: 'space-y-6',
                  formFieldRow: 'space-y-2',
                  
                  // Footer
                  footer: 'text-center mt-6',
                  footerAction: 'text-white/80',
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-white/80 drop-shadow-md">
            <Sparkles className="w-4 h-4" />
            <span>Secure authentication powered by Clerk</span>
          </div>
          <p className="text-sm text-white/90 drop-shadow-md">
            Already have an account?{' '}
            <a
              href="/sign-in"
              className="font-semibold text-teal-300 hover:text-teal-200 transition-all duration-200"
            >
              Sign in here
            </a>
          </p>
          <p className="text-xs text-white/70 drop-shadow-md">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}