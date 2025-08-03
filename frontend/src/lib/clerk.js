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

// ✅ ENHANCED: Clerk configuration with Google account selection
export const clerkConfig = {
  publishableKey: PUBLISHABLE_KEY,
  signInUrl: '/sign-in',
  signUpUrl: '/sign-up',
  afterSignInUrl: '/browse',
  afterSignUpUrl: '/browse',
  
  // ✅ FORCE GOOGLE ACCOUNT SELECTION GLOBALLY
  appearance: {
    elements: {
      socialButtonsBlockButton: 'w-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm text-sm',
    }
  },
  
  // ✅ CRITICAL: Global OAuth settings to force account selection
  socialConnectorOptions: {
    google: {
      prompt: 'select_account',  // Always show Google account picker
      include_granted_scopes: true,
      access_type: 'offline'
    }
  },
  
  // ✅ ENHANCED: Additional OAuth parameters
  oauthSettings: {
    google: {
      additionalScopes: ['email', 'profile'],
      prompt: 'select_account',
      include_granted_scopes: 'true'
    }
  }
};

// ✅ ENHANCED: Custom ClerkProvider wrapper with forced account selection
export const EnhancedClerkProvider = ({ children, ...props }) => {
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/browse"
      afterSignUpUrl="/browse"
      // ✅ GLOBAL GOOGLE ACCOUNT SELECTION SETTINGS
      appearance={{
        elements: {
          socialButtonsBlockButton: 'w-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm text-sm min-h-[44px]',
          formButtonPrimary: 'w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm text-sm min-h-[44px]',
        }
      }}
      // ✅ CRITICAL: This forces Google to show account selection for ALL components
      experimental={{
        googleOneTap: false  // Disable one-tap to force account selection
      }}
      {...props}
    >
      {children}
    </ClerkProvider>
  );
};

// ✅ MANUAL GOOGLE SIGN-OUT HELPER
export const forceGoogleSignOut = async () => {
  try {
    // Method 1: Open Google logout in popup
    const googleLogoutUrl = 'https://accounts.google.com/logout';
    const popup = window.open(
      googleLogoutUrl, 
      'google-logout', 
      'width=500,height=500,scrollbars=yes,resizable=yes'
    );
    
    // Close popup after 2 seconds
    setTimeout(() => {
      popup?.close();
    }, 2000);
    
    // Method 2: Clear Google-related cookies (if same origin)
    document.cookie = 'SAPISID=; Path=/; Domain=.google.com; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'APISID=; Path=/; Domain=.google.com; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'HSID=; Path=/; Domain=.google.com; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'SSID=; Path=/; Domain=.google.com; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    
    console.log('✅ Google logout attempted');
  } catch (error) {
    console.error('❌ Google logout failed:', error);
  }
};

// ✅ ENHANCED: Custom sign-out function that clears Google session
export const enhancedSignOut = async (clerkSignOut) => {
  try {
    // First sign out of Clerk
    await clerkSignOut();
    
    // Then force Google logout
    await forceGoogleSignOut();
    
    // Clear any additional session storage
    sessionStorage.clear();
    
    // Optional: Clear localStorage (be careful with this)
    const businessProfileKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('businessProfile_')
    );
    businessProfileKeys.forEach(key => localStorage.removeItem(key));
    
    console.log('✅ Enhanced sign-out completed');
  } catch (error) {
    console.error('❌ Enhanced sign-out failed:', error);
  }
};

// ✅ DEBUGGING HELPER: Test Google account selection
export const testGoogleAccountSelection = () => {
  console.log('🧪 Testing Google account selection...');
  
  const testUrl = `https://accounts.google.com/oauth/v2/auth?` +
    `client_id=your-google-client-id&` +
    `redirect_uri=${encodeURIComponent(window.location.origin)}&` +
    `response_type=code&` +
    `scope=email profile&` +
    `prompt=select_account`;  // This is the key parameter
  
  console.log('🔗 Test URL:', testUrl);
  console.log('💡 If Google shows account selection, the configuration is working');
  
  // Uncomment to test in a popup
  // window.open(testUrl, 'google-test', 'width=500,height=600');
};

export default clerkConfig;