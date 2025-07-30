// src/pages/dashboard/utils/api.ts

declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken(): Promise<string>;
      };
    };
  }
}

export const apiCall = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  
  let authToken = '';
  try {
    if (window.Clerk?.session) {
      authToken = await window.Clerk.session.getToken();
    }
  } catch (error) {
    console.error('Failed to get auth token:', error);
    throw new Error('Authentication failed');
  }

  const response = await fetch(`${apiBaseUrl}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API call failed: ${response.status} ${errorText}`);
  }

  return await response.json();
};