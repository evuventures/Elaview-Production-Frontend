// src/hooks/useNotifications.js
// ✅ RATE LIMITING: Centralized notification fetching with single source of truth

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Message } from '@/api/entities';

// Global state to prevent duplicate fetching across components
let globalNotificationState = {
  data: {
    unreadCount: 0,
    messages: [],
    lastUpdated: null,
    isLoading: false,
    error: null
  },
  subscribers: new Set(),
  fetchPromise: null
};

const POLL_INTERVAL = 30000; // Poll every 30 seconds
const CACHE_DURATION = 15000; // Cache for 15 seconds

export const useNotifications = (options = {}) => {
  const { 
    enablePolling = true, 
    pollInterval = POLL_INTERVAL,
    autoFetch = true 
  } = options;
    
  const { isSignedIn, isLoaded } = useAuth();
  const [localState, setLocalState] = useState(globalNotificationState.data);
  const subscriberId = useRef(Math.random().toString(36).substring(7));
  const pollTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  // ✅ RATE LIMITING: Update local state when global state changes
  const updateLocalState = useCallback((newState) => {
    if (isMountedRef.current) {
      setLocalState(newState);
    }
  }, []);

  // ✅ RATE LIMITING: Notify all subscribers of state changes
  const notifySubscribers = useCallback((newState) => {
    globalNotificationState.data = newState;
    globalNotificationState.subscribers.forEach(callback => {
      try {
        callback(newState);
      } catch (error) {
        console.error('Error notifying notification subscriber:', error);
      }
    });
  }, []);

  // ✅ RATE LIMITING: Fetch notifications with deduplication
  const fetchNotifications = useCallback(async (force = false) => {
    if (!isSignedIn || !isLoaded) {
      console.log('📬 NOTIFICATIONS: Skipping fetch - user not signed in');
      return globalNotificationState.data;
    }

    const now = Date.now();
    const { data, fetchPromise } = globalNotificationState;

    // Check if we have fresh data and don't need to force refresh
    if (!force && data.lastUpdated && (now - data.lastUpdated) < CACHE_DURATION) {
      console.log(`📬 NOTIFICATIONS: Using cached data (${now - data.lastUpdated}ms old)`);
      return data;
    }

    // If a fetch is already in progress, wait for it
    if (fetchPromise) {
      console.log('📬 NOTIFICATIONS: Waiting for existing fetch to complete');
      try {
        return await fetchPromise;
      } catch (error) {
        console.error('📬 NOTIFICATIONS: Existing fetch failed:', error);
        // Continue with new fetch attempt
      }
    }

    // Set loading state
    const loadingState = { ...data, isLoading: true, error: null };
    notifySubscribers(loadingState);

    // Create new fetch promise
    const fetchPromise = (async () => {
      try {
        console.log('📬 NOTIFICATIONS: Fetching notifications...');
        const startTime = Date.now();
        
        const messages = await Message.list();
        const unreadMessages = messages.filter(m => !m.read);
        
        const fetchDuration = Date.now() - startTime;
        console.log(`📬 NOTIFICATIONS: Fetched ${messages.length} messages (${unreadMessages.length} unread) in ${fetchDuration}ms`);

        const newState = {
          unreadCount: unreadMessages.length,
          messages: messages.slice(0, 10), // Limit to recent messages
          lastUpdated: now,
          isLoading: false,
          error: null
        };

        notifySubscribers(newState);
        return newState;

      } catch (error) {
        const errorDuration = Date.now() - now;
        console.error(`📬 NOTIFICATIONS: Fetch failed after ${errorDuration}ms:`, error);
        
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
    globalNotificationState.fetchPromise = fetchPromise;

    try {
      const result = await fetchPromise;
      return result;
    } finally {
      // Clear the promise when done
      globalNotificationState.fetchPromise = null;
    }
  }, [isSignedIn, isLoaded, notifySubscribers]);

  // ✅ RATE LIMITING: Setup polling with cleanup
  const startPolling = useCallback(() => {
    if (!enablePolling || !isSignedIn || !isLoaded) {
      return;
    }

    const poll = async () => {
      try {
        await fetchNotifications();
      } catch (error) {
        console.error('📬 NOTIFICATIONS: Polling error:', error);
      }
      
      // Schedule next poll if component is still mounted
      if (isMountedRef.current && enablePolling) {
        pollTimeoutRef.current = setTimeout(poll, pollInterval);
      }
    };

    // Start polling after initial delay
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
    }
    pollTimeoutRef.current = setTimeout(poll, pollInterval);
    
    console.log(`📬 NOTIFICATIONS: Started polling every ${pollInterval}ms`);
  }, [enablePolling, isSignedIn, isLoaded, fetchNotifications, pollInterval]);

  const stopPolling = useCallback(() => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
      console.log('📬 NOTIFICATIONS: Stopped polling');
    }
  }, []);

  // ✅ RATE LIMITING: Mark message as read with optimistic update
  const markAsRead = useCallback(async (messageId) => {
    try {
      // Optimistic update
      const currentState = globalNotificationState.data;
      const updatedMessages = currentState.messages.map(msg =>
        msg.id === messageId ? { ...msg, read: true } : msg
      );
      const newUnreadCount = updatedMessages.filter(m => !m.read).length;
      
      const optimisticState = {
        ...currentState,
        messages: updatedMessages,
        unreadCount: newUnreadCount
      };
      
      notifySubscribers(optimisticState);
      console.log(`📬 NOTIFICATIONS: Optimistically marked message ${messageId} as read`);

      // Update on server
      await Message.update(messageId, { read: true });
      console.log(`📬 NOTIFICATIONS: Successfully marked message ${messageId} as read on server`);

    } catch (error) {
      console.error('📬 NOTIFICATIONS: Failed to mark message as read:', error);
      // Refresh to get correct state
      fetchNotifications(true);
    }
  }, [fetchNotifications, notifySubscribers]);

  // ✅ RATE LIMITING: Mark all messages as read
  const markAllAsRead = useCallback(async () => {
    try {
      const currentState = globalNotificationState.data;
      const unreadMessages = currentState.messages.filter(m => !m.read);
      
      // Optimistic update
      const optimisticState = {
        ...currentState,
        messages: currentState.messages.map(msg => ({ ...msg, read: true })),
        unreadCount: 0
      };
      
      notifySubscribers(optimisticState);
      console.log(`📬 NOTIFICATIONS: Optimistically marked ${unreadMessages.length} messages as read`);

      // Update on server
      await Promise.all(
        unreadMessages.map(msg => Message.update(msg.id, { read: true }))
      );
      console.log(`📬 NOTIFICATIONS: Successfully marked ${unreadMessages.length} messages as read on server`);

    } catch (error) {
      console.error('📬 NOTIFICATIONS: Failed to mark all messages as read:', error);
      // Refresh to get correct state
      fetchNotifications(true);
    }
  }, [fetchNotifications, notifySubscribers]);

  // ✅ RATE LIMITING: Force refresh notifications
  const refresh = useCallback(() => {
    console.log('📬 NOTIFICATIONS: Force refreshing...');
    return fetchNotifications(true);
  }, [fetchNotifications]);

  // ✅ RATE LIMITING: Setup subscription on mount
  useEffect(() => {
    isMountedRef.current = true;
    
    // Subscribe to global state changes
    globalNotificationState.subscribers.add(updateLocalState);
    console.log(`📬 NOTIFICATIONS: Subscribed ${subscriberId.current} (${globalNotificationState.subscribers.size} total)`);

    // Initial fetch if auto-fetch is enabled
    if (autoFetch && isSignedIn && isLoaded) {
      fetchNotifications();
    }

    // Setup polling
    startPolling();

    return () => {
      isMountedRef.current = false;
      globalNotificationState.subscribers.delete(updateLocalState);
      stopPolling();
      console.log(`📬 NOTIFICATIONS: Unsubscribed ${subscriberId.current} (${globalNotificationState.subscribers.size} remaining)`);
    };
  }, [updateLocalState, autoFetch, isSignedIn, isLoaded, fetchNotifications, startPolling, stopPolling]);

  // ✅ RATE LIMITING: Update polling when settings change
  useEffect(() => {
    stopPolling();
    if (enablePolling) {
      startPolling();
    }
  }, [enablePolling, pollInterval, startPolling, stopPolling]);

  return {
    // Data
    unreadCount: localState.unreadCount,
    messages: localState.messages,
    isLoading: localState.isLoading,
    error: localState.error,
    lastUpdated: localState.lastUpdated,
    
    // Actions
    refresh,
    markAsRead,
    markAllAsRead,
    
    // Status
    isPolling: !!pollTimeoutRef.current,
    subscriberCount: globalNotificationState.subscribers.size
  };
};

// ✅ RATE LIMITING: Utility to get current notification state without subscribing
export const getNotificationSnapshot = () => {
  return { ...globalNotificationState.data };
};

// ✅ RATE LIMITING: Cleanup global state (for testing or app teardown)
export const cleanupNotifications = () => {
  if (globalNotificationState.fetchPromise) {
    // Note: Can't cancel ongoing fetch, but prevent duplicate requests
    globalNotificationState.fetchPromise = null;
  }
  
  globalNotificationState.data = {
    unreadCount: 0,
    messages: [],
    lastUpdated: null,
    isLoading: false,
    error: null
  };
  
  globalNotificationState.subscribers.clear();
  console.log('📬 NOTIFICATIONS: Global state cleaned up');
};