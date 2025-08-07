// src/hooks/useUserProfile.js
// ✅ FIXED: Updated to use apiClient instead of entities
// ✅ RATE LIMITING: Centralized user profile fetching to prevent duplicate calls

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import apiClient from '@/api/apiClient'; // ✅ FIXED: Use apiClient instead of entities

// Global state to prevent duplicate user profile fetching across components
let globalUserProfileState = {
  data: {
    profile: null,
    businessProfile: null,
    isLoading: false,
    error: null,
    lastUpdated: null
  },
  subscribers: new Set(),
  fetchPromise: null
};

const CACHE_DURATION = 120000; // 2 minutes cache for user profile
const BUSINESS_CACHE_DURATION = 300000; // 5 minutes cache for business profile

export const useUserProfile = (options = {}) => {
  const { 
    includeBusinessProfile = true,
    autoFetch = true 
  } = options;
    
  const { isSignedIn, isLoaded } = useAuth();
  const { user: clerkUser } = useUser();
  const [localState, setLocalState] = useState(globalUserProfileState.data);
  const subscriberId = useRef(Math.random().toString(36).substring(7));
  const isMountedRef = useRef(true);

  // ✅ RATE LIMITING: Update local state when global state changes
  const updateLocalState = useCallback((newState) => {
    if (isMountedRef.current) {
      setLocalState(newState);
    }
  }, []);

  // ✅ RATE LIMITING: Notify all subscribers of state changes
  const notifySubscribers = useCallback((newState) => {
    globalUserProfileState.data = newState;
    globalUserProfileState.subscribers.forEach(callback => {
      try {
        callback(newState);
      } catch (error) {
        console.error('Error notifying user profile subscriber:', error);
      }
    });
  }, []);

  // ✅ RATE LIMITING: Fetch user profile with deduplication
  const fetchUserProfile = useCallback(async (force = false) => {
    if (!isSignedIn || !isLoaded || !clerkUser) {
      console.log('👤 USER PROFILE: Skipping fetch - user not ready');
      return globalUserProfileState.data;
    }

    const now = Date.now();
    const { data, fetchPromise } = globalUserProfileState;

    // Check if we have fresh data and don't need to force refresh
    if (!force && data.lastUpdated && (now - data.lastUpdated) < CACHE_DURATION) {
      console.log(`👤 USER PROFILE: Using cached data (${now - data.lastUpdated}ms old)`);
      return data;
    }

    // If a fetch is already in progress, wait for it
    if (fetchPromise) {
      console.log('👤 USER PROFILE: Waiting for existing fetch to complete');
      try {
        return await fetchPromise;
      } catch (error) {
        console.error('👤 USER PROFILE: Existing fetch failed:', error);
        // Continue with new fetch attempt
      }
    }

    // Set loading state
    const loadingState = { ...data, isLoading: true, error: null };
    notifySubscribers(loadingState);

    // Create new fetch promise
    const fetchPromise = (async () => {
      try {
        console.log('👤 USER PROFILE: Fetching user profile...');
        const startTime = Date.now();
        
        let profile = null;
        let businessProfile = null;

        // ✅ FIXED: Fetch basic user profile using apiClient
        try {
          const profileResponse = await apiClient.getUserProfile();
          profile = profileResponse.success ? profileResponse.data : null;
          console.log(`👤 USER PROFILE: Basic profile fetched in ${Date.now() - startTime}ms`);
        } catch (error) {
          if (error.message.includes('404')) {
            console.log('👤 USER PROFILE: No profile found, will create on first update');
            profile = null;
          } else {
            throw error;
          }
        }

        // ✅ FIXED: Fetch business profile using apiClient
        if (includeBusinessProfile) {
          try {
            const businessStartTime = Date.now();
            const businessResponse = await apiClient.getUserBusinessProfile();
            businessProfile = businessResponse.success ? businessResponse.data : null;
            console.log(`👤 USER PROFILE: Business profile fetched in ${Date.now() - businessStartTime}ms`);
          } catch (error) {
            if (error.message.includes('404') || error.message.includes('Business profile not found')) {
              console.log('👤 USER PROFILE: No business profile found');
              businessProfile = null;
            } else {
              console.warn('👤 USER PROFILE: Business profile fetch failed:', error.message);
              businessProfile = null;
            }
          }
        }
        
        const fetchDuration = Date.now() - startTime;
        console.log(`👤 USER PROFILE: Complete profile fetch in ${fetchDuration}ms`);

        const newState = {
          profile,
          businessProfile,
          isLoading: false,
          error: null,
          lastUpdated: now
        };

        notifySubscribers(newState);
        return newState;

      } catch (error) {
        const errorDuration = Date.now() - now;
        console.error(`👤 USER PROFILE: Fetch failed after ${errorDuration}ms:`, error);
        
        const errorState = {
          ...data,
          isLoading: false,
          error: error.message
        };
        
        notifySubscribers(errorState);
        throw error;
      }
    })();

    // Store the promise to prevent duplicate requests
    globalUserProfileState.fetchPromise = fetchPromise;

    try {
      const result = await fetchPromise;
      return result;
    } finally {
      // Clear the promise when done
      globalUserProfileState.fetchPromise = null;
    }
  }, [isSignedIn, isLoaded, clerkUser, includeBusinessProfile, notifySubscribers]);

  // ✅ FIXED: Update user profile using apiClient
  const updateProfile = useCallback(async (updates) => {
    if (!isSignedIn || !clerkUser) {
      throw new Error('User not signed in');
    }

    try {
      // Optimistic update
      const currentState = globalUserProfileState.data;
      const optimisticState = {
        ...currentState,
        profile: currentState.profile ? { ...currentState.profile, ...updates } : updates
      };
      
      notifySubscribers(optimisticState);
      console.log('👤 USER PROFILE: Optimistic profile update applied');

      // ✅ FIXED: Update on server using apiClient
      const response = await apiClient.updateUser(clerkUser.id, updates);
      const updatedProfile = response.success ? response.data : updates;
      
      // Update with server response
      const serverState = {
        ...optimisticState,
        profile: updatedProfile,
        lastUpdated: Date.now()
      };
      
      notifySubscribers(serverState);
      console.log('👤 USER PROFILE: Profile successfully updated on server');
      
      return updatedProfile;

    } catch (error) {
      console.error('👤 USER PROFILE: Failed to update profile:', error);
      // Refresh to get correct state
      fetchUserProfile(true);
      throw error;
    }
  }, [isSignedIn, clerkUser, fetchUserProfile, notifySubscribers]);

  // ✅ FIXED: Update business profile using apiClient
  const updateBusinessProfile = useCallback(async (updates) => {
    if (!isSignedIn || !clerkUser) {
      throw new Error('User not signed in');
    }

    try {
      // Optimistic update
      const currentState = globalUserProfileState.data;
      const optimisticState = {
        ...currentState,
        businessProfile: currentState.businessProfile 
          ? { ...currentState.businessProfile, ...updates } 
          : updates
      };
      
      notifySubscribers(optimisticState);
      console.log('👤 USER PROFILE: Optimistic business profile update applied');

      // ✅ FIXED: Update on server using apiClient
      const response = await apiClient.updateBusinessProfile(updates);
      const updatedBusinessProfile = response.success ? response.data : updates;
      
      // Update with server response
      const serverState = {
        ...optimisticState,
        businessProfile: updatedBusinessProfile,
        lastUpdated: Date.now()
      };
      
      notifySubscribers(serverState);
      console.log('👤 USER PROFILE: Business profile successfully updated on server');
      
      return updatedBusinessProfile;

    } catch (error) {
      console.error('👤 USER PROFILE: Failed to update business profile:', error);
      // Refresh to get correct state
      fetchUserProfile(true);
      throw error;
    }
  }, [isSignedIn, clerkUser, fetchUserProfile, notifySubscribers]);

  // ✅ RATE LIMITING: Force refresh profile
  const refresh = useCallback(() => {
    console.log('👤 USER PROFILE: Force refreshing...');
    return fetchUserProfile(true);
  }, [fetchUserProfile]);

  // ✅ RATE LIMITING: Setup subscription on mount
  useEffect(() => {
    isMountedRef.current = true;
    
    // Subscribe to global state changes
    globalUserProfileState.subscribers.add(updateLocalState);
    console.log(`👤 USER PROFILE: Subscribed ${subscriberId.current} (${globalUserProfileState.subscribers.size} total)`);

    // Initial fetch if auto-fetch is enabled
    if (autoFetch && isSignedIn && isLoaded && clerkUser) {
      fetchUserProfile();
    }

    return () => {
      isMountedRef.current = false;
      globalUserProfileState.subscribers.delete(updateLocalState);
      console.log(`👤 USER PROFILE: Unsubscribed ${subscriberId.current} (${globalUserProfileState.subscribers.size} remaining)`);
    };
  }, [updateLocalState, autoFetch, isSignedIn, isLoaded, clerkUser, fetchUserProfile]);

  return {
    // Data
    profile: localState.profile,
    businessProfile: localState.businessProfile,
    isLoading: localState.isLoading,
    error: localState.error,
    lastUpdated: localState.lastUpdated,
    
    // Clerk user data
    clerkUser,
    isSignedIn,
    isLoaded,
    
    // Actions
    refresh,
    updateProfile,
    updateBusinessProfile,
    
    // Status
    subscriberCount: globalUserProfileState.subscribers.size,
    
    // Helper computed values
    hasProfile: !!localState.profile,
    hasBusinessProfile: !!localState.businessProfile,
    isVerified: localState.profile?.verification_status === 'verified',
    userRole: clerkUser?.publicMetadata?.role || 'USER'
  };
};

// ✅ RATE LIMITING: Utility to get current user profile state without subscribing
export const getUserProfileSnapshot = () => {
  return { ...globalUserProfileState.data };
};

// ✅ RATE LIMITING: Cleanup global state (for testing or app teardown)
export const cleanupUserProfile = () => {
  if (globalUserProfileState.fetchPromise) {
    // Note: Can't cancel ongoing fetch, but prevent duplicate requests
    globalUserProfileState.fetchPromise = null;
  }
  
  globalUserProfileState.data = {
    profile: null,
    businessProfile: null,
    isLoading: false,
    error: null,
    lastUpdated: null
  };
  
  globalUserProfileState.subscribers.clear();
  console.log('👤 USER PROFILE: Global state cleaned up');
};