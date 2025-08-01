// src/hooks/useBusinessProfile.js
// ✅ STEP 2: Custom hook for business profile management
// Handles profile checking, loading, and validation logic

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import apiClient from '../api/apiClient';

/**
 * Custom hook for managing business profile state and operations
 * Provides business profile validation, loading, and checking functionality
 */
export function useBusinessProfile() {
  const { user, isLoaded: userLoaded } = useUser();
  
  // Business profile state
  const [businessProfile, setBusinessProfile] = useState(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  // Load business profile on user change
  useEffect(() => {
    if (userLoaded && user?.id) {
      loadBusinessProfile();
    } else if (userLoaded && !user) {
      // User not authenticated
      setBusinessProfile(null);
      setIsProfileComplete(false);
      setIsLoading(false);
    }
  }, [userLoaded, user?.id]);

  /**
   * Load business profile from API
   */
  const loadBusinessProfile = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('📋 Loading business profile for user:', user.id);
      
      const response = await apiClient.getUserBusinessProfile();
      
      if (response.success) {
        const profile = response.data;
        console.log('✅ Business profile loaded:', profile);
        
        setBusinessProfile(profile);
        setIsProfileComplete(validateProfileCompleteness(profile));
        setLastChecked(new Date());
      } else {
        console.log('ℹ️ No business profile found or incomplete profile');
        setBusinessProfile(null);
        setIsProfileComplete(false);
      }
    } catch (err) {
      console.error('❌ Failed to load business profile:', err);
      setError('Failed to load business profile');
      setBusinessProfile(null);
      setIsProfileComplete(false);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  /**
   * Validate if business profile is complete enough for checkout
   * Based on research: B2B requires business name, industry, address for invoicing
   */
  const validateProfileCompleteness = (profile) => {
    if (!profile) return false;
    
    const requiredFields = [
      'businessName',
      'businessIndustry',
      'businessAddress'
    ];
    
    // Check required top-level fields
    for (const field of requiredFields) {
      if (!profile[field]) {
        console.log(`❌ Missing required field: ${field}`);
        return false;
      }
    }
    
    // Check required address fields (critical for B2B invoicing)
    if (profile.businessAddress) {
      const requiredAddressFields = ['street', 'city', 'state', 'zipCode'];
      for (const field of requiredAddressFields) {
        if (!profile.businessAddress[field]) {
          console.log(`❌ Missing required address field: ${field}`);
          return false;
        }
      }
    } else {
      console.log('❌ Missing business address');
      return false;
    }
    
    console.log('✅ Business profile is complete for checkout');
    return true;
  };

  /**
   * Check if business profile needs to be completed
   * Returns true if profile is incomplete and user should see modal
   */
  const needsBusinessProfile = useCallback(() => {
    return userLoaded && user?.id && !isLoading && !isProfileComplete;
  }, [userLoaded, user?.id, isLoading, isProfileComplete]);

  /**
   * Get missing required fields for UI feedback
   */
  const getMissingFields = useCallback(() => {
    if (!businessProfile) {
      return [
        'Business Name',
        'Industry',
        'Business Address'
      ];
    }
    
    const missing = [];
    
    if (!businessProfile.businessName) missing.push('Business Name');
    if (!businessProfile.businessIndustry) missing.push('Industry');
    
    if (!businessProfile.businessAddress) {
      missing.push('Business Address');
    } else {
      const address = businessProfile.businessAddress;
      if (!address.street) missing.push('Street Address');
      if (!address.city) missing.push('City');
      if (!address.state) missing.push('State');
      if (!address.zipCode) missing.push('ZIP Code');
    }
    
    return missing;
  }, [businessProfile]);

  /**
   * Update business profile and refresh state
   */
  const updateBusinessProfile = useCallback(async (profileData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('💼 Updating business profile:', profileData);
      
      const response = await apiClient.updateBusinessProfile(profileData);
      
      if (response.success) {
        console.log('✅ Business profile updated successfully');
        
        // Refresh the profile data
        await loadBusinessProfile();
        
        return { success: true, data: response.data };
      } else {
        console.error('❌ Failed to update business profile:', response.error);
        setError(response.error || 'Failed to update business profile');
        return { success: false, error: response.error };
      }
    } catch (err) {
      console.error('❌ Business profile update error:', err);
      const errorMessage = 'Failed to update business profile. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [loadBusinessProfile]);

  /**
   * Force refresh of business profile data
   */
  const refreshProfile = useCallback(() => {
    loadBusinessProfile();
  }, [loadBusinessProfile]);

  /**
   * Get profile completion percentage for UI progress indicators
   */
  const getCompletionPercentage = useCallback(() => {
    if (!businessProfile) return 0;
    
    const totalFields = 8; // Total important fields
    let completedFields = 0;
    
    // Core business info (3 fields)
    if (businessProfile.businessName) completedFields++;
    if (businessProfile.businessIndustry) completedFields++;
    if (businessProfile.businessType) completedFields++;
    
    // Address (4 fields worth 1 each)
    if (businessProfile.businessAddress?.street) completedFields++;
    if (businessProfile.businessAddress?.city) completedFields++;
    if (businessProfile.businessAddress?.state) completedFields++;
    if (businessProfile.businessAddress?.zipCode) completedFields++;
    
    // Optional but valuable field (1 field)
    if (businessProfile.businessPhone || businessProfile.businessWebsite) completedFields++;
    
    return Math.round((completedFields / totalFields) * 100);
  }, [businessProfile]);

  /**
   * Check if enough time has passed to recheck profile
   * Prevents excessive API calls
   */
  const shouldRecheck = useCallback(() => {
    if (!lastChecked) return true;
    
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return lastChecked < fiveMinutesAgo;
  }, [lastChecked]);

  return {
    // State
    businessProfile,
    isProfileComplete,
    isLoading,
    error,
    
    // Computed properties
    needsBusinessProfile: needsBusinessProfile(),
    missingFields: getMissingFields(),
    completionPercentage: getCompletionPercentage(),
    
    // Actions
    loadBusinessProfile,
    updateBusinessProfile,
    refreshProfile,
    shouldRecheck: shouldRecheck(),
    
    // Validation helpers
    validateProfileCompleteness,
    
    // User info
    user,
    userLoaded
  };
}

/**
 * Standalone function to quickly check if user needs business profile
 * Useful for route guards and conditional rendering
 */
export async function checkBusinessProfileRequired(userId) {
  if (!userId) return true;
  
  try {
    const response = await apiClient.getUserBusinessProfile();
    
    if (!response.success || !response.data) {
      return true; // Profile required
    }
    
    const profile = response.data;
    
    // Quick validation - just check essential fields
    const hasEssentials = !!(
      profile.businessName &&
      profile.businessIndustry &&
      profile.businessAddress?.street &&
      profile.businessAddress?.city &&
      profile.businessAddress?.state &&
      profile.businessAddress?.zipCode
    );
    
    return !hasEssentials; // Return true if profile is needed
  } catch (error) {
    console.error('❌ Error checking business profile:', error);
    return true; // Assume profile required on error
  }
}

export default useBusinessProfile;