// src/components/auth/ProtectedRoute.jsx - FIXED: Simplified onboarding check
// ✅ WORKING: Only uses fields that exist in your schema
// ✅ SIMPLIFIED: No complex onboarding stages, just basic completion check

import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import IntroModal from '@/pages/onboarding/IntroPage';
import apiClient from '@/api/apiClient';

const ProtectedRoute = ({ 
  children, 
  requireAdmin = false, 
  allowedRoles = [], 
  redirectTo = '/sign-in',
  skipOnboardingCheck = false
}) => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const location = useLocation();
  
  // ✅ SIMPLIFIED: Basic onboarding state management
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  // ✅ Routes that should skip onboarding check
  const skipOnboardingRoutes = [
    '/settings',
    '/profile',
    '/help',
    '/sign-out',
    '/sso-callback'
  ];

  const shouldSkipOnboarding = skipOnboardingCheck || 
    skipOnboardingRoutes.some(route => location.pathname.startsWith(route));

  // ✅ SIMPLIFIED: Check onboarding status
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!isSignedIn || !user?.id || hasCheckedOnboarding || shouldSkipOnboarding) {
        return;
      }

      try {
        setIsCheckingOnboarding(true);
        console.log('🎯 Checking onboarding status for user:', user.id);
        
        // Check development bypasses
        const urlParams = new URLSearchParams(window.location.search);
        const skipIntro = urlParams.get('skip_intro') === 'true' || 
                         import.meta.env.VITE_SKIP_INTRO === 'true';
        
        if (skipIntro) {
          console.log('🚀 Development bypass: Skipping onboarding check');
          setHasCheckedOnboarding(true);
          return;
        }

        // Get user profile - this contains hasCompletedOnboarding
        const profileResponse = await apiClient.getUserProfile();

        if (profileResponse.success) {
          setUserProfile(profileResponse.data);
          
          // Simple check: if user hasn't completed onboarding, show intro
          const needsOnboarding = !profileResponse.data.hasCompletedOnboarding;
          
          console.log('🎯 Onboarding check result:', {
            hasCompletedOnboarding: profileResponse.data.hasCompletedOnboarding,
            needsOnboarding
          });

          if (needsOnboarding) {
            console.log('🎯 User needs onboarding, showing intro modal');
            setShowIntroModal(true);
          }
        }

        setHasCheckedOnboarding(true);
      } catch (error) {
        console.error('❌ Error checking onboarding status:', error);
        setHasCheckedOnboarding(true);
      } finally {
        setIsCheckingOnboarding(false);
      }
    };

    // Only check after auth is loaded and user is signed in
    if (isLoaded && isSignedIn) {
      checkOnboardingStatus();
    }
  }, [isLoaded, isSignedIn, user?.id, hasCheckedOnboarding, shouldSkipOnboarding]);

  // ✅ SIMPLIFIED: Handle intro modal completion
  const handleIntroComplete = async (userType) => {
    console.log('🎯 Intro completed with user type:', userType);
    
    try {
      // Complete onboarding with the selected user type
      const response = await apiClient.completeOnboarding({ 
        userType,
        preferredView: userType === 'property-owner' ? 'SPACE_OWNER' : 'ADVERTISER'
      });

      if (response.success) {
        console.log('✅ Onboarding completed successfully');
        setUserProfile(prev => ({
          ...prev,
          hasCompletedOnboarding: true,
          preferredView: userType === 'property-owner' ? 'SPACE_OWNER' : 'ADVERTISER'
        }));
      }
    } catch (error) {
      console.error('❌ Error completing onboarding:', error);
    }

    setShowIntroModal(false);
    
    // ✅ RESPONSIVE ROUTING: Navigate based on device and user type
    const isMobile = window.innerWidth < 768;
    
    if (userType === 'property-owner') {
      // Property owners go to list-space on both mobile and desktop
      window.location.href = '/list-space';
    } else {
      // Advertisers have different destinations
      if (isMobile) {
        // Mobile advertisers go to home page
        window.location.href = '/home';
      } else {
        // Desktop advertisers stay on browse page (current page)
        // Just close modal, they're already where they need to be
      }
    }
  };

  const handleIntroClose = () => {
    console.log('🎯 Intro modal closed without completion');
    setShowIntroModal(false);
  };

  // ✅ Loading state while checking authentication
  if (!isLoaded || isCheckingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">
            {!isLoaded ? 'Loading...' : 'Checking your account...'}
          </p>
        </div>
      </div>
    );
  }

  // ✅ Redirect to sign-in if not authenticated
  if (!isSignedIn) {
    const redirectUrl = `${redirectTo}?redirect_url=${encodeURIComponent(location.pathname + location.search)}`;
    return <Navigate to={redirectUrl} replace />;
  }

  // ✅ Check admin access if required
  if (requireAdmin && userProfile && !userProfile.isAdmin) {
    console.log('❌ Admin access required but user is not admin');
    return <Navigate to="/browse" replace />;
  }

  // ✅ Check role access if specified
  if (allowedRoles.length > 0 && userProfile && !allowedRoles.includes(userProfile.role)) {
    console.log('❌ Role access denied:', userProfile.role, 'not in', allowedRoles);
    return <Navigate to="/browse" replace />;
  }

  return (
    <>
      {/* ✅ Render children (the protected content) */}
      {children}
      
      {/* ✅ Show intro modal if needed */}
      {showIntroModal && (
        <IntroModal
          isOpen={showIntroModal}
          onClose={handleIntroClose}
          onComplete={handleIntroComplete}
        />
      )}
    </>
  );
};

export default ProtectedRoute;