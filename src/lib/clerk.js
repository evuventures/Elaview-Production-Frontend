// src/lib/clerk.js
import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-react';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

// Export the ClerkProvider for wrapping your app
export { ClerkProvider };

// Export auth hooks for use in components
export { useAuth, useUser };

// Clerk configuration
export const clerkConfig = {
  publishableKey: PUBLISHABLE_KEY,
  signInUrl: '/sign-in',
  signUpUrl: '/sign-up',
  afterSignInUrl: '/dashboard'
};