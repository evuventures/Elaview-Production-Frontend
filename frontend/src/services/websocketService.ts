// src/services/websocketService.ts
// ✅ Production-ready WebSocket service for Elaview messaging
// ✅ FIXED: URL construction and environment variable handling

// ✅ Message Types
// ✅ Message Types
export interface WSMessage {
  id: string;
  type: 'NEW_MESSAGE' | 'MESSAGE_READ' | 'USER_TYPING' | 'USER_ONLINE' | 'USER_OFFLINE' | 'CONVERSATION_UPDATE' | 'PING' | 'PONG';
  conversationId?: string;
  senderId?: string;
  recipientId?: string;
  content?: string;
  data?: any;
  timestamp: string;
}

export interface WSConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  lastConnected: Date | null;
  reconnectAttempts: number;
  error: string | null;
}

// ✅ WebSocket Service Class
class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private messageQueue: WSMessage[] = [];
  private listeners: Map<string, Set<(message: WSMessage) => void>> = new Map();
  private stateListeners: Set<(state: WSConnectionState) => void> = new Set();
  
  // ✅ Connection Configuration
  private readonly config = {
    maxReconnectAttempts: 10,
    initialReconnectDelay: 1000, // 1 second
    maxReconnectDelay: 30000, // 30 seconds
    heartbeatInterval: 30000, // 30 seconds
    connectionTimeout: 10000, // 10 seconds
  };

  private state: WSConnectionState = {
    isConnected: false,
    isConnecting: false,
    lastConnected: null,
    reconnectAttempts: 0,
    error: null,
  };

  private currentUserId: string | null = null;
  private authToken: string | null = null;
  private wsUrl: string = '';

  // ✅ FIXED: Get WebSocket URL with proper fallbacks
  private getWebSocketUrl(): string {
    // ✅ Environment variables with proper fallbacks
    const devUrl = import.meta.env.VITE_WEBSOCKET_URL_DEV;
    const prodUrl = import.meta.env.VITE_WEBSOCKET_URL_PROD;
    const autoUrl = import.meta.env.VITE_WEBSOCKET_URL;
    const mode = import.meta.env.MODE;
    
    console.log('🔍 WebSocket: Environment check:', {
      MODE: mode,
      VITE_WEBSOCKET_URL_DEV: devUrl,
      VITE_WEBSOCKET_URL_PROD: prodUrl,
      VITE_WEBSOCKET_URL: autoUrl,
      location: window.location.origin
    });
    
    // ✅ Determine the base URL
    let baseUrl: string;
    
    if (autoUrl && autoUrl !== 'auto') {
      // Use explicit URL if provided and not 'auto'
      baseUrl = autoUrl;
    } else {
      // ✅ Auto-detect based on environment
      const isProduction = mode === 'production';
      
      if (isProduction) {
        baseUrl = prodUrl || 'wss://elaview-backend.up.railway.app/ws';
      } else {
        // ✅ Development: Default to localhost:5000
        baseUrl = devUrl || 'ws://localhost:5000/ws';
      }
    }
    
    console.log('🔗 WebSocket: Selected base URL:', baseUrl);
    return baseUrl;
  }

  // ✅ Initialize WebSocket connection
  public async connect(userId: string, authToken: string): Promise<void> {
    console.log('🔌 WebSocket: Initializing connection for user:', userId);
    
    this.currentUserId = userId;
    this.authToken = authToken;
    
    // ✅ Get the WebSocket URL
    const baseUrl = this.getWebSocketUrl();
    
    if (!baseUrl) {
      throw new Error('No WebSocket URL configured');
    }
    
    // ✅ Add authentication parameters
    this.wsUrl = `${baseUrl}?userId=${encodeURIComponent(userId)}&token=${encodeURIComponent(authToken)}`;
    
    console.log('🔗 WebSocket: Final connection URL:', baseUrl); // Don't log full URL with token
    
    await this.establishConnection();
  }

  // ✅ Establish WebSocket connection with proper error handling
  private async establishConnection(): Promise<void> {
    if (this.state.isConnecting || this.state.isConnected) {
      console.log('⚠️ WebSocket: Connection already in progress or established');
      return;
    }

    this.updateState({ 
      isConnecting: true, 
      error: null 
    });

    try {
      console.log('🔗 WebSocket: Attempting connection to:', this.wsUrl.split('?')[0]); // Don't log auth params
      
      this.ws = new WebSocket(this.wsUrl);
      
      // ✅ Connection timeout
      const connectionTimeout = setTimeout(() => {
        if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
          console.log('⏰ WebSocket: Connection timeout');
          this.ws.close();
          this.handleConnectionError(new Error('Connection timeout'));
        }
      }, this.config.connectionTimeout);

      this.ws.onopen = () => {
        clearTimeout(connectionTimeout);
        this.handleConnectionOpen();
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event);
      };

      this.ws.onclose = (event) => {
        clearTimeout(connectionTimeout);
        this.handleConnectionClose(event);
      };

      this.ws.onerror = (error) => {
        clearTimeout(connectionTimeout);
        this.handleConnectionError(error);
      };

    } catch (error) {
      console.error('❌ WebSocket: Failed to create connection:', error);
      this.handleConnectionError(error);
    }
  }

  // ✅ Handle successful connection
  private handleConnectionOpen(): void {
    console.log('✅ WebSocket: Connected successfully');
    
    this.updateState({
      isConnected: true,
      isConnecting: false,
      lastConnected: new Date(),
      reconnectAttempts: 0,
      error: null,
    });

    // ✅ Start heartbeat
    this.startHeartbeat();
    
    // ✅ Send queued messages
    this.processMessageQueue();
    
    // ✅ Join user's conversations
    this.sendMessage({
      id: `join_${Date.now()}`,
      type: 'USER_ONLINE',
      timestamp: new Date().toISOString(),
    });
  }

  // ✅ Handle incoming messages
  private handleMessage(event: MessageEvent): void {
    try {
      const message: WSMessage = JSON.parse(event.data);
      
      console.log('📨 WebSocket: Received message:', message.type, message);
      
      // ✅ Handle heartbeat pong
      if (message.type === 'PONG') {
        return; // Just acknowledge, no need to notify listeners
      }
      
      // ✅ Notify all listeners for this message type
      const typeListeners = this.listeners.get(message.type);
      if (typeListeners) {
        typeListeners.forEach(listener => {
          try {
            listener(message);
          } catch (error) {
            console.error('❌ WebSocket: Error in message listener:', error);
          }
        });
      }
      
      // ✅ Notify global listeners
      const globalListeners = this.listeners.get('*');
      if (globalListeners) {
        globalListeners.forEach(listener => {
          try {
            listener(message);
          } catch (error) {
            console.error('❌ WebSocket: Error in global listener:', error);
          }
        });
      }
      
    } catch (error) {
      console.error('❌ WebSocket: Failed to parse message:', error);
    }
  }

  // ✅ Handle connection close
  private handleConnectionClose(event: CloseEvent): void {
    console.log('🔌 WebSocket: Connection closed:', event.code, event.reason);
    
    this.stopHeartbeat();
    
    this.updateState({
      isConnected: false,
      isConnecting: false,
      error: event.reason || `Connection closed (${event.code})`,
    });

    // ✅ Attempt reconnection if not a clean close
    if (event.code !== 1000 && this.state.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.scheduleReconnect();
    }
  }

  // ✅ Handle connection errors
  private handleConnectionError(error: any): void {
    console.error('❌ WebSocket: Connection error:', error);
    
    this.updateState({
      isConnected: false,
      isConnecting: false,
      error: error.message || 'Connection failed',
    });

    // ✅ Attempt reconnection
    if (this.state.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.scheduleReconnect();
    }
  }

  // ✅ Schedule reconnection with exponential backoff
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    const attempt = this.state.reconnectAttempts + 1;
    const delay = Math.min(
      this.config.initialReconnectDelay * Math.pow(2, attempt - 1),
      this.config.maxReconnectDelay
    );

    console.log(`🔄 WebSocket: Scheduling reconnect attempt ${attempt} in ${delay}ms`);

    this.updateState({ reconnectAttempts: attempt });

    this.reconnectTimer = setTimeout(() => {
      console.log(`🔄 WebSocket: Attempting reconnect ${attempt}/${this.config.maxReconnectAttempts}`);
      this.establishConnection();
    }, delay);
  }

  // ✅ Start heartbeat to keep connection alive
  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.sendMessage({
          id: `ping_${Date.now()}`,
          type: 'PING',
          timestamp: new Date().toISOString(),
        });
      }
    }, this.config.heartbeatInterval);
  }

  // ✅ Stop heartbeat
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // ✅ Send message through WebSocket
  public sendMessage(message: Partial<WSMessage>): void {
    const fullMessage: WSMessage = {
      id: message.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: message.type || 'NEW_MESSAGE',
      timestamp: message.timestamp || new Date().toISOString(),
      ...message,
    };

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        console.log('📤 WebSocket: Sending message:', fullMessage.type, fullMessage);
        this.ws.send(JSON.stringify(fullMessage));
      } catch (error) {
        console.error('❌ WebSocket: Failed to send message:', error);
        this.queueMessage(fullMessage);
      }
    } else {
      console.log('📦 WebSocket: Queueing message (not connected):', fullMessage.type);
      this.queueMessage(fullMessage);
    }
  }

  // ✅ Queue messages when offline
  private queueMessage(message: WSMessage): void {
    this.messageQueue.push(message);
    
    // ✅ Limit queue size to prevent memory issues
    if (this.messageQueue.length > 100) {
      this.messageQueue = this.messageQueue.slice(-50); // Keep last 50 messages
    }
  }

  // ✅ Process queued messages when reconnected
  private processMessageQueue(): void {
    if (this.messageQueue.length === 0) return;
    
    console.log(`📦 WebSocket: Processing ${this.messageQueue.length} queued messages`);
    
    const messages = [...this.messageQueue];
    this.messageQueue = [];
    
    messages.forEach(message => {
      this.sendMessage(message);
    });
  }

  // ✅ Subscribe to specific message types
  public subscribe(messageType: string, listener: (message: WSMessage) => void): () => void {
    console.log('👂 WebSocket: Subscribing to message type:', messageType);
    
    if (!this.listeners.has(messageType)) {
      this.listeners.set(messageType, new Set());
    }
    
    this.listeners.get(messageType)!.add(listener);
    
    // ✅ Return unsubscribe function
    return () => {
      const typeListeners = this.listeners.get(messageType);
      if (typeListeners) {
        typeListeners.delete(listener);
        if (typeListeners.size === 0) {
          this.listeners.delete(messageType);
        }
      }
    };
  }

  // ✅ Subscribe to connection state changes
  public subscribeToState(listener: (state: WSConnectionState) => void): () => void {
    this.stateListeners.add(listener);
    
    // ✅ Immediately call with current state
    listener(this.state);
    
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  // ✅ Update internal state and notify listeners
  private updateState(updates: Partial<WSConnectionState>): void {
    this.state = { ...this.state, ...updates };
    
    this.stateListeners.forEach(listener => {
      try {
        listener(this.state);
      } catch (error) {
        console.error('❌ WebSocket: Error in state listener:', error);
      }
    });
  }

  // ✅ Manual reconnect
  public reconnect(): void {
    console.log('🔄 WebSocket: Manual reconnect requested');
    
    this.disconnect();
    
    setTimeout(() => {
      this.updateState({ reconnectAttempts: 0 });
      this.establishConnection();
    }, 1000);
  }

  // ✅ Disconnect WebSocket
  public disconnect(): void {
    console.log('🔌 WebSocket: Disconnecting...');
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    this.updateState({
      isConnected: false,
      isConnecting: false,
      error: null,
    });
  }

  // ✅ Get current connection state
  public getState(): WSConnectionState {
    return { ...this.state };
  }

  // ✅ Check if connected
  public isConnected(): boolean {
    return this.state.isConnected;
  }

  // ✅ Convenience methods for common message types
  public sendChatMessage(conversationId: string, content: string, recipientId?: string): void {
    this.sendMessage({
      type: 'NEW_MESSAGE',
      conversationId,
      content,
      recipientId,
      senderId: this.currentUserId || undefined,
    });
  }

  public markMessageAsRead(conversationId: string, messageId: string): void {
    this.sendMessage({
      type: 'MESSAGE_READ',
      conversationId,
      data: { messageId },
      senderId: this.currentUserId || undefined,
    });
  }

  public sendTypingIndicator(conversationId: string, isTyping: boolean): void {
    this.sendMessage({
      type: 'USER_TYPING',
      conversationId,
      data: { isTyping },
      senderId: this.currentUserId || undefined,
    });
  }
}

// ✅ Create singleton instance
export const websocketService = new WebSocketService();

// ✅ Export service class for testing
export default WebSocketService;