// src/components/wrappers/BusinessProfileWrapper.jsx
// ✅ STEP 3: Smart business profile wrapper component
// ✅ RESEARCH-BACKED: Automatically handles when to show business profile modal

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import BusinessDetailsModal from '../modals/BusinessDetailsModal';
import { useBusinessProfile } from '../../hooks/useBusinessProfile';

/**
 * BusinessProfileWrapper - Smart business profile management
 * 
 * Research-backed patterns:
 * - Only shows modal when business profile is incomplete
 * - Persists completion state in localStorage
 * - Provides loading states and error handling
 * - Supports both required and optional flows
 * 
 * Usage Examples:
 * 
 * 1. Wrap entire app (shows modal when needed):
 *    <BusinessProfileWrapper>
 *      <App />
 *    </BusinessProfileWrapper>
 * 
 * 2. Wrap specific routes that require business profile:
 *    <BusinessProfileWrapper required onComplete={handleComplete}>
 *      <CheckoutPage />
 *    </BusinessProfileWrapper>
 * 
 * 3. Use as guard for specific actions:
 *    <BusinessProfileWrapper 
 *      required 
 *      trigger="checkout"
 *      onComplete={() => navigate('/checkout')}
 *    >
 *      <BookingButton />
 *    </BusinessProfileWrapper>
 */
const BusinessProfileWrapper = ({ 
  children, 
  required = false,
  trigger = null,
  onComplete = null,
  onSkip = null,
  className = ""
}) => {
  const { user, isLoaded: userLoaded } = useUser();
  
  // Business profile state from custom hook
  const {
    businessProfile,
    isProfileComplete,
    isLoading,
    error,
    needsBusinessProfile,
    updateBusinessProfile,
    completionPercentage,
    missingFields
  } = useBusinessProfile();
  
  // Local modal state
  const [showModal, setShowModal] = useState(false);
  const [modalTrigger, setModalTrigger] = useState(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  /**
   * Initialize modal visibility based on profile completion
   * Research-backed: Check localStorage to prevent showing modal repeatedly
   */
  useEffect(() => {
    if (!userLoaded || !user?.id || hasInitialized) return;
    
    console.log('🏢 BusinessProfileWrapper: Initializing...');
    console.log('📊 Profile complete:', isProfileComplete);
    console.log('📋 Needs profile:', needsBusinessProfile);
    console.log('⚡ Required:', required);
    
    // Check if user has completed profile in this session
    const completionKey = `businessProfile_${user.id}`;
    const hasCompletedThisSession = localStorage.getItem(completionKey) === 'completed';
    
    if (hasCompletedThisSession) {
      console.log('✅ Profile completed this session, not showing modal');
      setHasInitialized(true);
      return;
    }
    
    // Determine if we should show the modal
    const shouldShowModal = needsBusinessProfile && !isLoading;
    
    if (shouldShowModal) {
      if (required) {
        console.log('🚨 Required profile completion - showing modal immediately');
        setShowModal(true);
        setModalTrigger('required');
      } else {
        console.log('ℹ️ Optional profile completion - will show on trigger');
        // For optional, we wait for a trigger or show after delay
        const timer = setTimeout(() => {
          if (!isProfileComplete && !localStorage.getItem(completionKey)) {
            console.log('⏰ Showing optional profile modal after delay');
            setShowModal(true);
            setModalTrigger('delayed');
          }
        }, 2000); // 2 second delay for optional
        
        return () => clearTimeout(timer);
      }
    }
    
    setHasInitialized(true);
  }, [userLoaded, user?.id, needsBusinessProfile, isLoading, required, isProfileComplete, hasInitialized]);

  /**
   * Handle trigger-based modal opening
   * Usage: Call this when user attempts an action that requires business profile
   */
  const triggerProfileCompletion = (reason = 'action') => {
    console.log('🎯 Triggering business profile completion:', reason);
    
    if (isProfileComplete) {
      console.log('✅ Profile already complete, proceeding...');
      if (onComplete) {
        onComplete(businessProfile);
      }
      return true;
    }
    
    setShowModal(true);
    setModalTrigger(reason);
    return false;
  };

  /**
   * Handle successful profile completion
   */
  const handleProfileComplete = async (profileData) => {
    console.log('✅ BusinessProfileWrapper: Profile completed successfully');
    
    // Update localStorage to prevent re-showing
    const completionKey = `businessProfile_${user.id}`;
    localStorage.setItem(completionKey, 'completed');
    localStorage.setItem(`businessProfileCompletedAt_${user.id}`, new Date().toISOString());
    
    setShowModal(false);
    setModalTrigger(null);
    
    // Call completion callback
    if (onComplete) {
      onComplete(profileData);
    }
    
    // Dispatch custom event for other components to listen to
    window.dispatchEvent(new CustomEvent('businessProfileCompleted', {
      detail: { profileData }
    }));
  };

  /**
   * Handle modal close/skip
   */
  const handleModalClose = () => {
    console.log('🚪 BusinessProfileWrapper: Modal closed/skipped');
    
    if (required && !isProfileComplete) {
      // Don't allow closing if required and not complete
      const confirmClose = window.confirm(
        'Business profile is required to continue. Are you sure you want to close?'
      );
      
      if (!confirmClose) {
        return;
      }
    }
    
    setShowModal(false);
    setModalTrigger(null);
    
    if (onSkip) {
      onSkip();
    }
  };

  /**
   * Get completion status for UI indicators
   */
  const getCompletionStatus = () => {
    if (isLoading) return { status: 'loading', message: 'Checking profile...' };
    if (error) return { status: 'error', message: 'Failed to load profile' };
    if (isProfileComplete) return { status: 'complete', message: 'Profile complete' };
    if (missingFields.length > 0) {
      return { 
        status: 'incomplete', 
        message: `Missing: ${missingFields.slice(0, 2).join(', ')}${missingFields.length > 2 ? '...' : ''}`,
        percentage: completionPercentage
      };
    }
    return { status: 'empty', message: 'Profile not started' };
  };

  // Enhanced children with business profile context
  const enhancedChildren = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        // Inject business profile helpers
        businessProfile,
        isProfileComplete,
        triggerProfileCompletion,
        completionStatus: getCompletionStatus(),
        ...child.props
      });
    }
    return child;
  });

  return (
    <div className={className}>
      {/* Render children */}
      {enhancedChildren}
      
      {/* Business Profile Modal */}
      <BusinessDetailsModal
        isOpen={showModal}
        onClose={handleModalClose}
        onProfileComplete={handleProfileComplete}
        required={required || modalTrigger === 'required'}
      />
      
      {/* Optional: Profile completion indicator */}
      {process.env.NODE_ENV === 'development' && user?.id && (
        <div className="fixed bottom-4 left-4 z-50 bg-white border border-slate-200 rounded-lg p-2 text-xs shadow-lg max-w-xs">
          <div className="font-medium text-slate-700">Business Profile Debug</div>
          <div className="text-slate-500 mt-1">
            Status: {getCompletionStatus().status} ({completionPercentage}%)
            <br />
            Required: {required ? 'Yes' : 'No'}
            <br />
            Modal: {showModal ? 'Open' : 'Closed'}
            <br />
            Trigger: {modalTrigger || 'None'}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Higher-order component version
 * Usage: export default withBusinessProfile(MyComponent)
 */
export const withBusinessProfile = (WrappedComponent, options = {}) => {
  return function BusinessProfileHOC(props) {
    return (
      <BusinessProfileWrapper {...options}>
        <WrappedComponent {...props} />
      </BusinessProfileWrapper>
    );
  };
};

/**
 * Hook for manual business profile management
 * Usage: const { triggerProfileCompletion, isComplete } = useBusinessProfileWrapper()
 */
export const useBusinessProfileWrapper = () => {
  const {
    businessProfile,
    isProfileComplete,
    isLoading,
    needsBusinessProfile,
    completionPercentage,
    missingFields
  } = useBusinessProfile();
  
  const [showModal, setShowModal] = useState(false);
  
  const triggerProfileCompletion = () => {
    if (isProfileComplete) return true;
    setShowModal(true);
    return false;
  };
  
  const closeModal = () => setShowModal(false);
  
  return {
    businessProfile,
    isProfileComplete,
    isLoading,
    needsBusinessProfile,
    completionPercentage,
    missingFields,
    showModal,
    triggerProfileCompletion,
    closeModal,
    ProfileModal: () => (
      <BusinessDetailsModal
        isOpen={showModal}
        onClose={closeModal}
        onProfileComplete={(data) => {
          closeModal();
          window.dispatchEvent(new CustomEvent('businessProfileCompleted', {
            detail: { profileData: data }
          }));
        }}
      />
    )
  };
};

export default BusinessProfileWrapper;