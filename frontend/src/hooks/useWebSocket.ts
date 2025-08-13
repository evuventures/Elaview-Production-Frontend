// src/hooks/useWebSocket.ts
// ✅ React hook for WebSocket integration with Elaview messaging
// ✅ FIXED: Clerk token authentication with multiple fallback methods

import { useEffect, useCallback, useRef, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { websocketService, WSMessage, WSConnectionState } from '@/services/websocketService';

export interface UseWebSocketReturn {
  // Connection state
  connectionState: WSConnectionState;
  isConnected: boolean;
  
  // Message handlers
  sendChatMessage: (conversationId: string, content: string, recipientId?: string) => void;
  markMessageAsRead: (conversationId: string, messageId: string) => void;
  sendTypingIndicator: (conversationId: string, isTyping: boolean) => void;
  
  // Connection controls
  reconnect: () => void;
  disconnect: () => void;
  
  // Subscription management
  subscribe: (messageType: string, handler: (message: WSMessage) => void) => () => void;
}

export interface UseWebSocketOptions {
  autoConnect?: boolean;
  onMessage?: (message: WSMessage) => void;
  onConnectionChange?: (state: WSConnectionState) => void;
  onError?: (error: string) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const { user, isSignedIn } = useUser();
  const [connectionState, setConnectionState] = useState<WSConnectionState>({
    isConnected: false,
    isConnecting: false,
    lastConnected: null,
    reconnectAttempts: 0,
    error: null,
  });
  
  const {
    autoConnect = true,
    onMessage,
    onConnectionChange,
    onError,
  } = options;

  // ✅ Refs to prevent stale closures
  const onMessageRef = useRef(onMessage);
  const onConnectionChangeRef = useRef(onConnectionChange);
  const onErrorRef = useRef(onError);
  const isInitializedRef = useRef(false);

  // ✅ Update refs when options change
  useEffect(() => {
    onMessageRef.current = onMessage;
    onConnectionChangeRef.current = onConnectionChange;
    onErrorRef.current = onError;
  }, [onMessage, onConnectionChange, onError]);

  // ✅ FIXED: Initialize WebSocket connection with multiple Clerk token methods
  const initializeConnection = useCallback(async () => {
    if (!isSignedIn || !user?.id || isInitializedRef.current) {
      return;
    }

    console.log('🚀 useWebSocket: Initializing connection for user:', user.id);
    
    try {
      // ✅ FIXED: Try multiple methods to get Clerk token
      let token = null;
      
      console.log('🔍 useWebSocket: Attempting to get Clerk token...');
      
      // Method 1: Try getToken from user object (newer Clerk versions)
      if (typeof user.getToken === 'function') {
        console.log('📋 useWebSocket: Trying user.getToken()');
        token = await user.getToken();
      }
      // Method 2: Try window.Clerk.session.getToken (common fallback)
      else if (window.Clerk?.session && typeof window.Clerk.session.getToken === 'function') {
        console.log('📋 useWebSocket: Trying window.Clerk.session.getToken()');
        token = await window.Clerk.session.getToken();
      }
      // Method 3: Try window.Clerk.user.getToken
      else if (window.Clerk?.user && typeof window.Clerk.user.getToken === 'function') {
        console.log('📋 useWebSocket: Trying window.Clerk.user.getToken()');
        token = await window.Clerk.user.getToken();
      }
      // Method 4: Check if there's a different token method
      else if (window.Clerk?.getToken && typeof window.Clerk.getToken === 'function') {
        console.log('📋 useWebSocket: Trying window.Clerk.getToken()');
        token = await window.Clerk.getToken();
      }
      
      console.log('🔑 useWebSocket: Token obtained:', token ? 'YES' : 'NO');
      
      if (!token) {
        // ✅ Debug information for troubleshooting
        console.error('❌ useWebSocket: Token debugging info:', {
          user: user,
          userMethods: user ? Object.getOwnPropertyNames(user) : 'No user',
          windowClerk: window.Clerk ? 'Available' : 'Not available',
          clerkSession: window.Clerk?.session ? 'Available' : 'Not available',
          clerkUser: window.Clerk?.user ? 'Available' : 'Not available'
        });
        throw new Error('Failed to get authentication token from Clerk');
      }

      await websocketService.connect(user.id, token);
      isInitializedRef.current = true;
      
      console.log('✅ useWebSocket: Connection initialized successfully');
    } catch (error) {
      console.error('❌ useWebSocket: Failed to initialize connection:', error);
      if (onErrorRef.current) {
        onErrorRef.current(error instanceof Error ? error.message : 'Connection failed');
      }
    }
  }, [isSignedIn, user?.id]);

  // ✅ Connection state subscription
  useEffect(() => {
    const unsubscribe = websocketService.subscribeToState((state) => {
      console.log('🔄 useWebSocket: Connection state changed:', state);
      setConnectionState(state);
      
      if (onConnectionChangeRef.current) {
        onConnectionChangeRef.current(state);
      }
      
      if (state.error && onErrorRef.current) {
        onErrorRef.current(state.error);
      }
    });

    return unsubscribe;
  }, []);

  // ✅ Global message subscription
  useEffect(() => {
    if (!onMessageRef.current) return;

    const unsubscribe = websocketService.subscribe('*', (message) => {
      console.log('📨 useWebSocket: Received message:', message.type);
      if (onMessageRef.current) {
        onMessageRef.current(message);
      }
    });

    return unsubscribe;
  }, []);

  // ✅ Auto-connect when user is signed in
  useEffect(() => {
    if (autoConnect && isSignedIn && user?.id && !isInitializedRef.current) {
      initializeConnection();
    }
  }, [autoConnect, isSignedIn, user?.id, initializeConnection]);

  // ✅ Cleanup on unmount or user change
  useEffect(() => {
    return () => {
      if (isInitializedRef.current) {
        console.log('🧹 useWebSocket: Cleaning up connection');
        websocketService.disconnect();
        isInitializedRef.current = false;
      }
    };
  }, [user?.id]);

  // ✅ Message sending functions
  const sendChatMessage = useCallback((conversationId: string, content: string, recipientId?: string) => {
    console.log('📤 useWebSocket: Sending chat message to conversation:', conversationId);
    websocketService.sendChatMessage(conversationId, content, recipientId);
  }, []);

  const markMessageAsRead = useCallback((conversationId: string, messageId: string) => {
    console.log('👁️ useWebSocket: Marking message as read:', messageId);
    websocketService.markMessageAsRead(conversationId, messageId);
  }, []);

  const sendTypingIndicator = useCallback((conversationId: string, isTyping: boolean) => {
    console.log('⌨️ useWebSocket: Sending typing indicator:', isTyping);
    websocketService.sendTypingIndicator(conversationId, isTyping);
  }, []);

  // ✅ Connection control functions
  const reconnect = useCallback(() => {
    console.log('🔄 useWebSocket: Manual reconnect requested');
    websocketService.reconnect();
  }, []);

  const disconnect = useCallback(() => {
    console.log('🔌 useWebSocket: Manual disconnect requested');
    websocketService.disconnect();
    isInitializedRef.current = false;
  }, []);

  // ✅ Subscription function
  const subscribe = useCallback((messageType: string, handler: (message: WSMessage) => void) => {
    console.log('👂 useWebSocket: Subscribing to message type:', messageType);
    return websocketService.subscribe(messageType, handler);
  }, []);

  return {
    connectionState,
    isConnected: connectionState.isConnected,
    sendChatMessage,
    markMessageAsRead,
    sendTypingIndicator,
    reconnect,
    disconnect,
    subscribe,
  };
}

// ✅ Specialized hook for message conversations
export function useWebSocketMessages(
  conversationId: string | null,
  onNewMessage?: (message: WSMessage) => void,
  onMessageRead?: (message: WSMessage) => void,
  onUserTyping?: (message: WSMessage) => void
) {
  const { subscribe, ...websocket } = useWebSocket();
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // ✅ Handle new messages for this conversation
  useEffect(() => {
    if (!conversationId || !onNewMessage) return;

    const unsubscribe = subscribe('NEW_MESSAGE', (message) => {
      if (message.conversationId === conversationId) {
        console.log('📨 useWebSocketMessages: New message for conversation:', conversationId);
        onNewMessage(message);
      }
    });

    return unsubscribe;
  }, [conversationId, onNewMessage, subscribe]);

  // ✅ Handle message read receipts
  useEffect(() => {
    if (!conversationId || !onMessageRead) return;

    const unsubscribe = subscribe('MESSAGE_READ', (message) => {
      if (message.conversationId === conversationId) {
        console.log('👁️ useWebSocketMessages: Message read in conversation:', conversationId);
        onMessageRead(message);
      }
    });

    return unsubscribe;
  }, [conversationId, onMessageRead, subscribe]);

  // ✅ Handle typing indicators
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = subscribe('USER_TYPING', (message) => {
      if (message.conversationId === conversationId && message.senderId) {
        const isTyping = message.data?.isTyping || false;
        const userId = message.senderId;
        
        console.log(`⌨️ useWebSocketMessages: User ${userId} typing:`, isTyping);
        
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          
          if (isTyping) {
            newSet.add(userId);
            
            // ✅ Clear any existing timeout for this user
            const existingTimeout = typingTimeoutRef.current.get(userId);
            if (existingTimeout) {
              clearTimeout(existingTimeout);
            }
            
            // ✅ Set new timeout to remove typing indicator
            const timeout = setTimeout(() => {
              setTypingUsers(current => {
                const updated = new Set(current);
                updated.delete(userId);
                return updated;
              });
              typingTimeoutRef.current.delete(userId);
            }, 3000); // Stop showing typing after 3 seconds
            
            typingTimeoutRef.current.set(userId, timeout);
          } else {
            newSet.delete(userId);
            
            // ✅ Clear timeout if user explicitly stops typing
            const existingTimeout = typingTimeoutRef.current.get(userId);
            if (existingTimeout) {
              clearTimeout(existingTimeout);
              typingTimeoutRef.current.delete(userId);
            }
          }
          
          return newSet;
        });
        
        if (onUserTyping) {
          onUserTyping(message);
        }
      }
    });

    return unsubscribe;
  }, [conversationId, onUserTyping, subscribe]);

  // ✅ Cleanup typing timeouts
  useEffect(() => {
    return () => {
      typingTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
      typingTimeoutRef.current.clear();
    };
  }, []);

  return {
    ...websocket,
    typingUsers: Array.from(typingUsers),
    isUserTyping: (userId: string) => typingUsers.has(userId),
  };
}

export default useWebSocket;