// src/api/base44Client.js
// COMPLETELY DISABLED - Base44 is no longer used

console.warn('🚨 Base44 SDK has been completely disabled. Use new backend API instead.');

// Create completely disabled client
export const base44 = {
  entities: {},
  auth: {
    me: async () => {
      console.warn('Base44 auth.me() disabled - use Clerk authentication');
      throw new Error('Base44 disabled - use Clerk authentication instead');
    }
  },
  integrations: {
    Core: {}
  }
};