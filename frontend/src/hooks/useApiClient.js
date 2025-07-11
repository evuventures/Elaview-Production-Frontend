// src/hooks/useApiClient.js
// React hook that integrates Clerk authentication with API calls

import { useAuth } from '@clerk/clerk-react';
import { useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export function useApiClient() {
  const { getToken, isSignedIn } = useAuth();

  const request = useCallback(async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      // Get fresh token from Clerk
      const token = isSignedIn ? await getToken() : null;
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      };

      // Add auth token if available
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ Added Clerk token to request');
      } else {
        console.warn('⚠️ No auth token - making unauthenticated request');
      }

      console.log(`🔄 API Request: ${config.method || 'GET'} ${url}`);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`HTTP ${response.status}: ${errorData.message || 'Request failed'}`);
      }
      
      const data = await response.json();
      console.log(`✅ API Response: ${endpoint}`, data);
      return data;
    } catch (error) {
      console.error(`❌ API Error: ${endpoint}`, error.message);
      throw error;
    }
  }, [getToken, isSignedIn]);

  // HTTP methods
  const get = useCallback((endpoint) => request(endpoint), [request]);
  const post = useCallback((endpoint, data) => request(endpoint, { method: 'POST', body: JSON.stringify(data) }), [request]);
  const put = useCallback((endpoint, data) => request(endpoint, { method: 'PUT', body: JSON.stringify(data) }), [request]);
  const del = useCallback((endpoint) => request(endpoint, { method: 'DELETE' }), [request]);

  return {
    request,
    get,
    post,
    put,
    delete: del,
    isSignedIn
  };
}