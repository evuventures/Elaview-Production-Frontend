// src/components/auth/ProtectedRoute.jsx - FINAL: Stale Closure + State Batching Fix
// ✅ RESEARCH-BASED: Uses functional state updates to prevent stale closures
// ✅ FORCE RE-RENDER: Implements multiple re-render mechanisms for reliability  
// ✅ SIMPLIFIED: Removes complex state management that causes batching issues

import React, { useState, useEffect, useRef, useCallback, useReducer } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import IntroModal from '@/pages/onboarding/IntroPage';
import apiClient from '@/api/apiClient';
import { PageLoader } from '@/components/ui/LoadingAnimation';

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
  
  // ✅ FORCE RE-RENDER: Multiple mechanisms to ensure re-renders happen
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const [, setRenderTrigger] = useState({});
  const renderCountRef = useRef(0);
  
  // ✅ SIMPLIFIED: Basic state management with functional updates
  const [onboardingState, setOnboardingState] = useState({
    hasChecked: false,
    showModal: false,
    needsOnboarding: false,
    isCompleting: false
  });
  
  const [userProfile, setUserProfile] = useState(null);
  const isMountedRef = useRef(true);
  const stateRef = useRef(onboardingState);
  
  // ✅ STABLE REFS: Always have latest values to avoid stale closures
  useEffect(() => {
    stateRef.current = onboardingState;
    renderCountRef.current += 1;
    console.log('🔄 ProtectedRoute: Render #', renderCountRef.current, 'State:', onboardingState);
  }, [onboardingState]);
  
  // ✅ FORCE RE-RENDER: Multiple trigger mechanisms
  const triggerReRender = useCallback(() => {
    console.log('🚀 ProtectedRoute: Forcing re-render via multiple methods');
    
    // Method 1: useReducer force update
    forceUpdate();
    
    // Method 2: useState with new object reference
    setRenderTrigger({});
    
    // Method 3: Functional state update to guarantee change
    setOnboardingState(prev => ({
      ...prev,
      hasChecked: true // Force a change
    }));
  }, []);
  
  // ✅ FUNCTIONAL STATE UPDATES: Avoid stale closure issues
  const updateOnboardingState = useCallback((updates) => {
    console.log('🎯 ProtectedRoute: Updating onboarding state:', updates);
    
    setOnboardingState(prevState => {
      const newState = { ...prevState, ...updates };
      console.log('🎯 ProtectedRoute: State transition:', { from: prevState, to: newState });
      return newState;
    });
    
    // Force re-render to ensure the update takes effect
    setTimeout(() => {
      if (isMountedRef.current) {
        triggerReRender();
      }
    }, 0);
  }, [triggerReRender]);
  
  // ✅ STABLE CALLBACK: Prevents re-creation on every render
  const checkOnboardingStatus = useCallback(async () => {
    if (!user?.id || skipOnboardingCheck) {
      console.log('🎯 ProtectedRoute: Skipping onboarding check');
      updateOnboardingState({ hasChecked: true, needsOnboarding: false });
      return;
    }
    
    console.log('🎯 ProtectedRoute: Starting robust onboarding check...');
    
    try {
      console.log('🎯 ProtectedRoute: Fetching user profile...');
      const response = await apiClient.getUserProfile();
      
      console.log('🎯 ProtectedRoute: Profile response:', response);
      
      if (response?.success) {
        const profile = response.data;
        setUserProfile(profile);
        
        const needsOnboarding = !profile?.hasCompletedOnboarding;
        
        console.log('🎯 ProtectedRoute: Onboarding decision:', {
          hasCompletedOnboarding: profile?.hasCompletedOnboarding,
          needsOnboarding
        });
        
        // ✅ FUNCTIONAL UPDATE: Guaranteed to use latest state
        updateOnboardingState({
          hasChecked: true,
          needsOnboarding,
          showModal: needsOnboarding
        });
        
        if (needsOnboarding) {
          console.log('🎯 ProtectedRoute: User needs onboarding - showing modal');
        } else {
          console.log('🎯 ProtectedRoute: User completed onboarding - proceeding');
        }
        
      } else {
        console.error('❌ ProtectedRoute: Profile fetch failed:', response);
        // ✅ SAFE FALLBACK: Always mark as checked even on error
        updateOnboardingState({ hasChecked: true, needsOnboarding: false });
      }
      
    } catch (error) {
      console.error('❌ ProtectedRoute: Onboarding check error:', error);
      // ✅ SAFE FALLBACK: Always mark as checked even on error  
      updateOnboardingState({ hasChecked: true, needsOnboarding: false });
    }
  }, [user?.id, skipOnboardingCheck, updateOnboardingState]);
  
  // ✅ ONBOARDING COMPLETION: Handle intro completion
  const handleOnboardingComplete = useCallback(async (userType) => {
    console.log('🎯 ProtectedRoute: Intro completed with user type:', userType);
    
    try {
      updateOnboardingState({ isCompleting: true });
      
      const response = await apiClient.completeOnboarding({ userType });
      console.log('🎯 ProtectedRoute: Onboarding completion response:', response);
      
      if (response?.success) {
        // ✅ OPTIMISTIC UPDATE: Update state immediately
        updateOnboardingState({
          hasChecked: true,
          needsOnboarding: false,
          showModal: false,
          isCompleting: false
        });
        
        console.log('✅ ProtectedRoute: Onboarding completed successfully');
        
        // ✅ CLEAR CACHE: Prevent stale data
        apiClient.clearCache?.();
        
        // ✅ FORCE RE-RENDER: Ensure UI updates
        triggerReRender();
        
      } else {
        console.error('❌ ProtectedRoute: Onboarding completion failed:', response);
        updateOnboardingState({ isCompleting: false });
      }
      
    } catch (error) {
      console.error('❌ ProtectedRoute: Onboarding completion error:', error);
      updateOnboardingState({ isCompleting: false });
    }
  }, [updateOnboardingState, triggerReRender]);
  
  // ✅ EFFECT: Run onboarding check when conditions are met
  useEffect(() => {
    if (isLoaded && isSignedIn && !stateRef.current.hasChecked) {
      console.log('🎯 ProtectedRoute: Triggering onboarding check');
      checkOnboardingStatus();
    }
  }, [isLoaded, isSignedIn, checkOnboardingStatus]);
  
  // ✅ CLEANUP: Prevent memory leaks
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // ✅ LOADING STATE: Clear loading conditions
  if (!isLoaded) {
    console.log('⏳ ProtectedRoute: Waiting for auth to load...');
    return <PageLoader message="" centered />;
  }
  
  // ✅ AUTHENTICATION: Redirect if not signed in
  if (!isSignedIn) {
    console.log('🔐 ProtectedRoute: User not signed in, redirecting to:', redirectTo);
    return <Navigate to={redirectTo} replace />;
  }
  
  // ✅ ONBOARDING CHECK: Show loading while checking
  if (!onboardingState.hasChecked && !skipOnboardingCheck) {
    console.log('⏳ ProtectedRoute: Checking onboarding status...');
    return <PageLoader message="Checking your account..." centered />;
  }
  
  // ✅ INTRO MODAL: Show if onboarding needed
  if (onboardingState.showModal && !skipOnboardingCheck) {
    console.log('🎯 ProtectedRoute: Showing intro modal');
    return (
      <IntroModal
        isOpen={true}
        onClose={() => updateOnboardingState({ showModal: false })}
        onComplete={handleOnboardingComplete}
        isCompleting={onboardingState.isCompleting}
      />
    );
  }
  
  // ✅ SUCCESS: Render protected content
  console.log('✅ ProtectedRoute: Rendering protected content');
  return children;
};

export default ProtectedRoute;