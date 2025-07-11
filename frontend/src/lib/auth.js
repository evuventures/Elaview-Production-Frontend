// src/lib/auth.js
import { useAuth, useUser } from '@clerk/clerk-react';
import { userAPI } from './api';

// Replacement for Base44 User.me() calls
export const getCurrentUser = async () => {
  try {
    const response = await userAPI.getProfile();
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
};

// Hook to get current user (replaces Base44 User.me())
export const useCurrentUser = () => {
  const { user: clerkUser, isLoaded } = useUser();
  const { isSignedIn } = useAuth();
  
  return {
    user: clerkUser,
    isLoaded,
    isSignedIn,
    // Add compatibility methods for your existing code
    me: () => getCurrentUser(),
  };
};

// For direct replacement in existing code
export const User = {
  me: getCurrentUser,
  // Add other methods as needed
};

// Export Clerk hooks for convenience
export { useAuth, useUser } from '@clerk/clerk-react';