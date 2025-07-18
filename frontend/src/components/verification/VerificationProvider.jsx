// src/components/verification/VerificationProvider.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';

const VerificationContext = createContext(null);

export function VerificationProvider({ children }) {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState({
    hasPhone: false,
    hasCompany: false,
    hasAddress: false,
    hasBio: false,
    hasProfileImage: false
  });
  
  // Global modal state
  const [modalState, setModalState] = useState({
    isOpen: false,
    action: '',
    title: '',
    message: '',
    missingFields: [],
    requiredFields: [],
    onSuccess: null,
    onCancel: null
  });

  // Check verification status - stable function
  const checkVerificationStatus = useCallback(() => {
    if (!user) {
      setIsLoading(false);
      setVerificationStatus({
        hasPhone: false,
        hasCompany: false,
        hasAddress: false,
        hasBio: false,
        hasProfileImage: false
      });
      return;
    }

    setIsLoading(true);
    try {
      // ✅ FIXED: Check unsafeMetadata instead of publicMetadata
      const status = {
        hasPhone: !!(user.phoneNumbers?.[0]?.phoneNumber?.trim() || user.unsafeMetadata?.phone?.trim()),
        hasCompany: !!(user.unsafeMetadata?.company?.trim()),
        hasAddress: !!(user.unsafeMetadata?.address?.trim()),
        hasBio: !!(user.unsafeMetadata?.bio?.trim()),
        hasProfileImage: !!(user.imageUrl?.trim() && user.imageUrl !== user.profileImageUrl) || !!(user.unsafeMetadata?.hasProfileImage)
      };
      
      setVerificationStatus(status);
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking verification status:', error);
      setVerificationStatus({
        hasPhone: false,
        hasCompany: false,
        hasAddress: false,
        hasBio: false,
        hasProfileImage: false
      });
      setIsLoading(false);
    }
  }, [user?.id, user?.unsafeMetadata]); // Include unsafeMetadata in dependencies

  // Check if verified for specific action
  const isVerifiedForAction = useCallback((action) => {
    switch (action) {
      case 'campaign':
        return verificationStatus.hasPhone && verificationStatus.hasCompany;
      case 'property':
        return verificationStatus.hasPhone && verificationStatus.hasAddress;
      case 'booking':
        return verificationStatus.hasPhone;
      case 'payment':
        return verificationStatus.hasPhone && verificationStatus.hasCompany;
      default:
        return verificationStatus.hasPhone;
    }
  }, [verificationStatus]);

  // Get required fields for action
  const getRequiredFields = useCallback((action) => {
    const requirements = {
      campaign: ['phone', 'company'],
      property: ['phone', 'address'],
      booking: ['phone'],
      payment: ['phone', 'company'],
      default: ['phone']
    };
    return requirements[action] || requirements.default;
  }, []);

  // Get missing fields for action
  const getMissingFields = useCallback((action) => {
    const required = getRequiredFields(action);
    const missing = [];
    
    if (required.includes('phone') && !verificationStatus.hasPhone) missing.push('phone');
    if (required.includes('company') && !verificationStatus.hasCompany) missing.push('company');
    if (required.includes('address') && !verificationStatus.hasAddress) missing.push('address');
    if (required.includes('bio') && !verificationStatus.hasBio) missing.push('bio');
    if (required.includes('profileImage') && !verificationStatus.hasProfileImage) missing.push('profileImage');
    
    return missing;
  }, [verificationStatus, getRequiredFields]);

  // Request verification - will show modal if needed
  const requestVerification = useCallback((action, options = {}) => {
    const missing = getMissingFields(action);
    
    if (missing.length === 0) {
      // Already verified, execute success callback immediately
      if (options.onSuccess) {
        setTimeout(options.onSuccess, 0); // Execute async to avoid state update conflicts
      }
      return true;
    }

    // Not verified, show modal
    setModalState({
      isOpen: true,
      action,
      title: options.title || 'Verification Required',
      message: options.message || `Please complete verification to ${action}.`,
      missingFields: missing,
      requiredFields: getRequiredFields(action),
      onSuccess: options.onSuccess || null,
      onCancel: options.onCancel || null
    });
    
    return false;
  }, [getMissingFields, getRequiredFields]);

  // Close modal
  const closeModal = useCallback(() => {
    const currentOnCancel = modalState.onCancel;
    setModalState({
      isOpen: false,
      action: '',
      title: '',
      message: '',
      missingFields: [],
      requiredFields: [],
      onSuccess: null,
      onCancel: null
    });
    
    if (currentOnCancel) {
      setTimeout(currentOnCancel, 0);
    }
  }, [modalState.onCancel]);

  // Handle verification completion
  const handleVerificationComplete = useCallback(async () => {
    const currentOnSuccess = modalState.onSuccess;
    
    // Close modal first
    setModalState({
      isOpen: false,
      action: '',
      title: '',
      message: '',
      missingFields: [],
      requiredFields: [],
      onSuccess: null,
      onCancel: null
    });
    
    // Re-check verification status
    checkVerificationStatus();
    
    // Execute success callback after a short delay
    if (currentOnSuccess) {
      setTimeout(currentOnSuccess, 100);
    }
  }, [modalState.onSuccess, checkVerificationStatus]);

  // Update verification status when user changes
  useEffect(() => {
    checkVerificationStatus();
  }, [checkVerificationStatus]);

  const contextValue = {
    // Status
    isLoading,
    isVerificationLoading: isLoading, // ✅ ADD: Alias for backward compatibility
    verificationStatus,
    
    // Action verification
    isVerifiedForAction,
    getRequiredFields,
    getMissingFields,
    requestVerification,
    
    // Status checking
    checkVerificationStatus,
    
    // Modal state - compatible with both old and new patterns
    modalState,
    isModalOpen: modalState.isOpen,
    modalData: modalState,
    closeModal,
    handleVerificationComplete,
    
    // User info
    user
  };

  return (
    <VerificationContext.Provider value={contextValue}>
      {children}
    </VerificationContext.Provider>
  );
}

export function useVerification() {
  const context = useContext(VerificationContext);
  
  if (!context) {
    console.warn('useVerification must be used within VerificationProvider');
    // Return safe defaults that match what components expect
    return {
      isLoading: false,
      isVerificationLoading: false, // ✅ ADD: For backward compatibility
      verificationStatus: {
        hasPhone: false,
        hasCompany: false,
        hasAddress: false,
        hasBio: false,
        hasProfileImage: false
      },
      isVerifiedForAction: () => true, // Mock: return true when no provider
      getRequiredFields: () => ['phone'],
      getMissingFields: () => [],
      requestVerification: (action, options) => {
        console.warn(`Verification requested for ${action} but no provider found`);
        if (options?.onSuccess) options.onSuccess();
        return true;
      },
      checkVerificationStatus: () => Promise.resolve(),
      modalState: { isOpen: false },
      isModalOpen: false,
      modalData: null,
      closeModal: () => {},
      handleVerificationComplete: () => {},
      user: null
    };
  }
  
  return context;
}