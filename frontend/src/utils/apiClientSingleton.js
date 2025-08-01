// src/utils/apiClientSingleton.js
// ✅ RATE LIMITING: Singleton API client to ensure single instance across app

import { apiClient } from '@/api/apiClient';

// Create singleton instance
const API_CLIENT_INSTANCE = apiClient;

// Add initialization logging
console.log('🔧 API CLIENT SINGLETON: Initialized single API client instance');

// Export singleton
export { API_CLIENT_INSTANCE as apiClient };

// Add global access for debugging
if (typeof window !== 'undefined') {
  window.__ELAVIEW_API_CLIENT__ = API_CLIENT_INSTANCE;
  
  // Add debug commands
  window.__ELAVIEW_DEBUG__ = {
    getCacheStats: () => API_CLIENT_INSTANCE.getCacheStats(),
    clearCache: (pattern) => API_CLIENT_INSTANCE.clearCache(pattern),
    getNotificationSnapshot: () => {
      try {
        // Dynamic import to avoid build issues
        return import('@/hooks/useNotifications').then(module => 
          module.getNotificationSnapshot()
        ).catch(() => ({ error: 'Notifications hook not available' }));
      } catch {
        return { error: 'Notifications hook not available' };
      }
    },
    getUserProfileSnapshot: () => {
      try {
        // Dynamic import to avoid build issues
        return import('@/hooks/useUserProfile').then(module => 
          module.getUserProfileSnapshot()
        ).catch(() => ({ error: 'User profile hook not available' }));
      } catch {
        return { error: 'User profile hook not available' };
      }
    },
    runRateLimitTests: async () => {
      try {
        const { runRateLimitTests } = await import('@/utils/rateLimitTester');
        return await runRateLimitTests();
      } catch {
        return { error: 'Rate limit tester not available' };
      }
    },
    startAPIMonitor: (duration = 30000) => {
      try {
        // Dynamic import to avoid build issues
        return import('@/utils/rateLimitTester').then(module => 
          module.monitorAPICallsFor(duration)
        ).catch(() => ({ error: 'API monitor not available' }));
      } catch {
        return { error: 'API monitor not available' };
      }
    }
  };
  
  console.log('🔧 DEBUG: Added global debug commands to window.__ELAVIEW_DEBUG__');
  console.log('🔧 DEBUG: Commands available:');
  console.log('  - __ELAVIEW_DEBUG__.getCacheStats()');
  console.log('  - __ELAVIEW_DEBUG__.clearCache()');
  console.log('  - __ELAVIEW_DEBUG__.runRateLimitTests()');
  console.log('  - __ELAVIEW_DEBUG__.startAPIMonitor()');
}