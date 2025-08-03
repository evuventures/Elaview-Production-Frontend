// src/hooks/useBusinessProfile.js
// ✅ ENHANCED: Complete business profile hook with localStorage integration
// ✅ RESEARCH-BACKED: Prevents unnecessary API calls with intelligent caching

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import apiClient from '../../../api/apiClient';

/**
 * Enhanced custom hook for managing business profile state and operations
 * 
 * Research-backed features:
 * - Intelligent caching to reduce API calls
 * - localStorage integration for completion state
 * - Comprehensive validation for B2B requirements
 * - Real-time completion percentage calculation
 */
export function useBusinessProfile() {
  const { user, isLoaded: userLoaded } = useUser();
  
  // Business profile state
  const [businessProfile, setBusinessProfile] = useState(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Load business profile on user change
  useEffect(() => {
    if (userLoaded && user?.id) {
      // Check localStorage first to avoid unnecessary API calls
      const completionKey = `businessProfile_${user.id}`;
      const hasCompletedProfile = localStorage.getItem(completionKey) === 'completed';
      
      if (hasCompletedProfile && !hasLoadedOnce) {
        console.log('✅ Profile marked complete in localStorage, validating with API...');
        // Still load from API to ensure data consistency
        loadBusinessProfile();
      } else if (!hasLoadedOnce) {
        console.log('🔄 Loading business profile for first time...');
        loadBusinessProfile();
      }
    } else if (userLoaded && !user) {
      // User not authenticated
      console.log('❌ User not authenticated, clearing profile state');
      setBusinessProfile(null);
      setIsProfileComplete(false);
      setIsLoading(false);
      setHasLoadedOnce(false);
    }
  }, [userLoaded, user?.id, hasLoadedOnce]);

  /**
   * Load business profile from API with intelligent caching
   */
  const loadBusinessProfile = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('📋 Loading business profile for user:', user.id);
      
      const response = await apiClient.getUserBusinessProfile();
      
      if (response.success && response.data) {
        const profile = response.data;
        console.log('✅ Business profile loaded:', profile);
        
        setBusinessProfile(profile);
        
        // Validate profile completeness
        const isComplete = validateProfileCompleteness(profile);
        setIsProfileComplete(isComplete);
        
        // Update localStorage if profile is complete
        const completionKey = `businessProfile_${user.id}`;
        if (isComplete) {
          localStorage.setItem(completionKey, 'completed');
          localStorage.setItem(`businessProfileCompletedAt_${user.id}`, new Date().toISOString());
          console.log('✅ Profile is complete, updated localStorage');
        } else {
          // Remove completion flag if profile becomes incomplete
          localStorage.removeItem(completionKey);
          console.log('⚠️ Profile incomplete, removed localStorage flag');
        }
        
        setLastChecked(new Date());
      } else {
        console.log('ℹ️ No business profile found or incomplete profile');
        setBusinessProfile(null);
        setIsProfileComplete(false);
        
        // Clear localStorage if no profile found
        const completionKey = `businessProfile_${user.id}`;
        localStorage.removeItem(completionKey);
      }
    } catch (err) {
      console.error('❌ Failed to load business profile:', err);
      setError('Failed to load business profile');
      setBusinessProfile(null);
      setIsProfileComplete(false);
    } finally {
      setIsLoading(false);
      setHasLoadedOnce(true);
    }
  }, [user?.id]);

  /**
   * Enhanced validation for business profile completeness
   * Research-backed B2B requirements: business name, industry, complete address
   */
  const validateProfileCompleteness = useCallback((profile) => {
    if (!profile) {
      console.log('❌ No profile data provided');
      return false;
    }
    
    // Required top-level fields
    const requiredFields = [
      'businessName',
      'businessIndustry'
    ];
    
    // Check required top-level fields
    for (const field of requiredFields) {
      if (!profile[field] || profile[field].trim() === '') {
        console.log(`❌ Missing required field: ${field}`);
        return false;
      }
    }
    
    // Check required address fields (critical for B2B invoicing)
    if (!profile.businessAddress) {
      console.log('❌ Missing business address object');
      return false;
    }
    
    const requiredAddressFields = ['street', 'city', 'state', 'zipCode'];
    for (const field of requiredAddressFields) {
      if (!profile.businessAddress[field] || profile.businessAddress[field].trim() === '') {
        console.log(`❌ Missing required address field: ${field}`);
        return false;
      }
    }
    
    console.log('✅ Business profile validation passed - complete for checkout');
    return true;
  }, []);

  /**
   * Check if business profile needs to be completed
   * Returns true if profile is incomplete and user should see modal
   */
  const needsBusinessProfile = useCallback(() => {
    if (!userLoaded || !user?.id || isLoading) {
      return false;
    }
    
    // Check localStorage first for quick response
    const completionKey = `businessProfile_${user.id}`;
    const hasCompletedProfile = localStorage.getItem(completionKey) === 'completed';
    
    if (hasCompletedProfile && isProfileComplete) {
      return false;
    }
    
    // Profile is needed if not complete
    const needed = !isProfileComplete;
    console.log(`🎯 Business profile needed: ${needed}`);
    return needed;
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
    
    // Check required fields
    if (!businessProfile.businessName || businessProfile.businessName.trim() === '') {
      missing.push('Business Name');
    }
    
    if (!businessProfile.businessIndustry || businessProfile.businessIndustry.trim() === '') {
      missing.push('Industry');
    }
    
    // Check address completeness
    if (!businessProfile.businessAddress) {
      missing.push('Business Address');
    } else {
      const address = businessProfile.businessAddress;
      const addressFields = [
        { key: 'street', name: 'Street Address' },
        { key: 'city', name: 'City' },
        { key: 'state', name: 'State' },
        { key: 'zipCode', name: 'ZIP Code' }
      ];
      
      for (const field of addressFields) {
        if (!address[field.key] || address[field.key].trim() === '') {
          missing.push(field.name);
        }
      }
    }
    
    return missing;
  }, [businessProfile]);

  /**
   * Update business profile and refresh state
   * Enhanced with better error handling and state management
   */
  const updateBusinessProfile = useCallback(async (profileData) => {
    if (!user?.id) {
      console.error('❌ No user ID for profile update');
      return { success: false, error: 'User not authenticated' };
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('💼 Updating business profile in database:', profileData);
      
      const response = await apiClient.updateBusinessProfile(profileData);
      
      if (response.success) {
        console.log('✅ Business profile updated successfully in database');
        
        // Update local state immediately
        setBusinessProfile(response.data);
        
        // Validate and update completion state
        const isComplete = validateProfileCompleteness(response.data);
        setIsProfileComplete(isComplete);
        
        // Update localStorage
        const completionKey = `businessProfile_${user.id}`;
        if (isComplete) {
          localStorage.setItem(completionKey, 'completed');
          localStorage.setItem(`businessProfileCompletedAt_${user.id}`, new Date().toISOString());
          console.log('✅ Updated localStorage completion flag');
        }
        
        setLastChecked(new Date());
        
        return { success: true, data: response.data };
      } else {
        console.error('❌ Failed to update business profile:', response.error);
        const errorMessage = response.error || 'Failed to update business profile';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      console.error('❌ Business profile update error:', err);
      const errorMessage = 'Failed to update business profile. Please check your connection and try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, validateProfileCompleteness]);

  /**
   * Force refresh of business profile data
   * Clears cache and reloads from API
   */
  const refreshProfile = useCallback(() => {
    console.log('🔄 Force refreshing business profile...');
    setHasLoadedOnce(false);
    loadBusinessProfile();
  }, [loadBusinessProfile]);

  /**
   * Get profile completion percentage for UI progress indicators
   * Research-backed: Visual progress encourages completion
   */
  const getCompletionPercentage = useCallback(() => {
    if (!businessProfile) return 0;
    
    let completedFields = 0;
    const totalFields = 8; // Total important fields for B2B
    
    // Core business info (worth 3 points)
    if (businessProfile.businessName && businessProfile.businessName.trim()) completedFields++;
    if (businessProfile.businessIndustry && businessProfile.businessIndustry.trim()) completedFields++;
    if (businessProfile.businessType && businessProfile.businessType.trim()) completedFields++;
    
    // Address (worth 4 points - most important for B2B)
    if (businessProfile.businessAddress?.street && businessProfile.businessAddress.street.trim()) completedFields++;
    if (businessProfile.businessAddress?.city && businessProfile.businessAddress.city.trim()) completedFields++;
    if (businessProfile.businessAddress?.state && businessProfile.businessAddress.state.trim()) completedFields++;
    if (businessProfile.businessAddress?.zipCode && businessProfile.businessAddress.zipCode.trim()) completedFields++;
    
    // Optional but valuable (worth 1 point)
    if ((businessProfile.businessPhone && businessProfile.businessPhone.trim()) || 
        (businessProfile.businessWebsite && businessProfile.businessWebsite.trim())) {
      completedFields++;
    }
    
    const percentage = Math.round((completedFields / totalFields) * 100);
    console.log(`📊 Profile completion: ${percentage}% (${completedFields}/${totalFields} fields)`);
    return percentage;
  }, [businessProfile]);

  /**
   * Check if enough time has passed to recheck profile
   * Prevents excessive API calls with intelligent caching
   */
  const shouldRecheck = useCallback(() => {
    if (!lastChecked) return true;
    
    // Recheck after 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return lastChecked < fiveMinutesAgo;
  }, [lastChecked]);

  /**
   * Clear all profile data and localStorage
   * Useful for testing or user logout
   */
  const clearProfileData = useCallback(() => {
    if (!user?.id) return;
    
    console.log('🗑️ Clearing business profile data');
    
    setBusinessProfile(null);
    setIsProfileComplete(false);
    setError(null);
    setLastChecked(null);
    setHasLoadedOnce(false);
    
    // Clear localStorage
    const completionKey = `businessProfile_${user.id}`;
    localStorage.removeItem(completionKey);
    localStorage.removeItem(`businessProfileCompletedAt_${user.id}`);
  }, [user?.id]);

  return {
    // State
    businessProfile,
    isProfileComplete,
    isLoading,
    error,
    hasLoadedOnce,
    
    // Computed properties
    needsBusinessProfile: needsBusinessProfile(),
    missingFields: getMissingFields(),
    completionPercentage: getCompletionPercentage(),
    
    // Actions
    loadBusinessProfile,
    updateBusinessProfile,
    refreshProfile,
    clearProfileData,
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
  
  // Check localStorage first
  const completionKey = `businessProfile_${userId}`;
  const hasCompletedProfile = localStorage.getItem(completionKey) === 'completed';
  
  if (hasCompletedProfile) {
    console.log('✅ Profile marked complete in localStorage');
    return false;
  }
  
  try {
    console.log('🔍 Checking business profile requirement via API...');
    const response = await apiClient.getUserBusinessProfile();
    
    if (!response.success || !response.data) {
      console.log('❌ No profile found, completion required');
      return true; // Profile required
    }
    
    const profile = response.data;
    
    // Quick validation - just check essential fields
    const hasEssentials = !!(
      profile.businessName &&
      profile.businessName.trim() &&
      profile.businessIndustry && 
      profile.businessIndustry.trim() &&
      profile.businessAddress?.street &&
      profile.businessAddress.street.trim() &&
      profile.businessAddress?.city &&
      profile.businessAddress.city.trim() &&
      profile.businessAddress?.state &&
      profile.businessAddress.state.trim() &&
      profile.businessAddress?.zipCode &&
      profile.businessAddress.zipCode.trim()
    );
    
    if (hasEssentials) {
      // Update localStorage since profile is complete
      localStorage.setItem(completionKey, 'completed');
      localStorage.setItem(`businessProfileCompletedAt_${userId}`, new Date().toISOString());
      console.log('✅ Profile is complete, updated localStorage');
    }
    
    return !hasEssentials; // Return true if profile is needed
  } catch (error) {
    console.error('❌ Error checking business profile:', error);
    return true; // Assume profile required on error
  }
}

export default useBusinessProfile;