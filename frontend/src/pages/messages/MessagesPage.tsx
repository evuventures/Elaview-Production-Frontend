// src/pages/messages/MessagesPage.tsx
// ✅ UPDATED: Fixed user ID mismatch + added enterprise loading components
// ✅ FIXED: Optimistic updates with proper user resolution
// ✅ ENHANCED: Professional enterprise messaging UI
// ✅ WebSocket real-time messaging integration maintained

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { useUser } from '@clerk/clerk-react';
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Search, 
  Phone, 
  Video, 
  ChevronLeft,
  MoreVertical,
  Plus,
  Mic,
  MicOff,
  Image,
  FileText,
  X,
  Check,
  CheckCheck,
  Building2,
  Briefcase,
  Calendar,
  MapPin,
  User,
  Loader2,
  MessageCircle,
  AlertCircle,
  Download,
  Smile,
  Wifi,
  WifiOff
} from 'lucide-react';
import apiClient from '@/api/apiClient';
import { useWebSocketMessages } from '@/hooks/useWebSocket';
import { WSMessage } from '@/services/websocketService';

// ✅ Import new enterprise loading components
import { 
  EnterpriseLoader,
  MessageStatusIndicator,
  EnterpriseSendButton,
  ConnectionStatusIndicator,
  TypingIndicator,
  BusinessMessageTypeIndicator,
  ConversationLoadingSkeleton,
  MessageLoadingSkeleton
} from '@/components/ui/EnterpriseLoading';

// ✅ TypeScript interfaces (enhanced)
interface User {
  id: string;
  clerkId?: string;
  firstName?: string;
  lastName?: string;
  full_name?: string;
  businessName?: string;
  imageUrl?: string;
  isBusinessVerified?: boolean;
  displayName?: string;
}

interface Participant {
  userId: string;
  user: User;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  isRead: boolean;
  isOptimistic?: boolean;
  sender?: User;
  attachments?: Attachment[];
  type?: string;
  deliveryStatus?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  error?: string;
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  preview?: string | null;
}

interface BusinessContext {
  id: string;
  title?: string;
  name?: string;
  address?: string;
}

interface Conversation {
  id: string;
  type: 'DIRECT' | 'GROUP';
  subject?: string;
  createdAt: string;
  updatedAt: string;
  unreadCount: number;
  otherParticipants?: Participant[];
  lastMessage?: Message;
  property?: BusinessContext;
  campaign?: BusinessContext;
  booking?: BusinessContext;
}

export default function MessagesPage(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser } = useUser();
  
  // ✅ Handle navigation state for opening specific conversations
  const navigationState = location.state as { conversationId?: string; openConversation?: boolean } | null;
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileConversations, setShowMobileConversations] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [onlineUsers] = useState(new Set<string>()); // TODO: Implement real-time presence
  const [isTyping, setIsTyping] = useState(false);
  
  // ✅ NEW: User resolution state for handling ID mismatches
  const [userResolutionCache, setUserResolutionCache] = useState<Map<string, User>>(new Map());
  const [optimisticMessages, setOptimisticMessages] = useState<Map<string, Message>>(new Map());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ ENHANCED: User ID resolution with caching
  const resolveUser = useCallback(async (identifier: string): Promise<User | null> => {
    if (!identifier) return null;
    
    // Check cache first
    if (userResolutionCache.has(identifier)) {
      return userResolutionCache.get(identifier) || null;
    }
    
    try {
      const userData = await apiClient.resolveUserId(identifier);
      if (userData) {
        setUserResolutionCache(prev => new Map(prev.set(identifier, userData)));
        // Also cache by other ID formats
        if (userData.clerkId && userData.clerkId !== identifier) {
          setUserResolutionCache(prev => new Map(prev.set(userData.clerkId, userData)));
        }
        if (userData.id && userData.id !== identifier) {
          setUserResolutionCache(prev => new Map(prev.set(userData.id, userData)));
        }
        return userData;
      }
    } catch (error) {
      console.error('❌ Failed to resolve user:', identifier, error);
    }
    
    return null;
  }, [userResolutionCache]);

  // ✅ FIXED: Enhanced message ownership detection with user resolution
  const isMyMessage = useCallback(async (message: Message): Promise<boolean> => {
    if (!currentUser?.id || !message.senderId) {
      return false;
    }
    
    // Handle optimistic messages
    if (message.isOptimistic) return true;
    
    // Direct comparison
    if (message.senderId === currentUser.id) return true;
    
    // Use API client's enhanced method
    return await apiClient.isMyMessage(message, currentUser.id);
  }, [currentUser?.id]);

  // ✅ SYNCHRONOUS version for immediate UI rendering (uses cache)
  const isMyMessageSync = useCallback((message: Message): boolean => {
    if (!currentUser?.id || !message.senderId) return false;
    
    // Handle optimistic messages
    if (message.isOptimistic) return true;
    
    // Direct comparison
    if (message.senderId === currentUser.id) return true;
    
    // Check cache for resolved user
    const resolvedUser = userResolutionCache.get(message.senderId);
    if (resolvedUser && resolvedUser.clerkId === currentUser.id) return true;
    
    // Handle prefix variations as fallback
    const clerkIdWithoutPrefix = currentUser.id.replace(/^user_/, '');
    if (message.senderId === clerkIdWithoutPrefix) return true;
    
    const messageIdWithPrefix = `user_${message.senderId}`;
    if (currentUser.id === messageIdWithPrefix) return true;
    
    return false;
  }, [currentUser?.id, userResolutionCache]);

  // ✅ Helper to get user display name
  const getUserDisplayName = useCallback((user: User | undefined): string => {
    if (!user) return 'Unknown User';
    
    if (user.displayName) return user.displayName;
    
    return user.full_name || 
           `${user.firstName || ''} ${user.lastName || ''}`.trim() || 
           user.businessName || 
           'Anonymous';
  }, []);

  // ✅ Helper to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // ✅ WebSocket integration for real-time messaging
  const {
    connectionState,
    isConnected,
    sendChatMessage,
    markMessageAsRead,
    sendTypingIndicator,
    typingUsers,
    reconnect,
  } = useWebSocketMessages(
    selectedConversation?.id || null,
    // ✅ Handle new messages via WebSocket
    useCallback((wsMessage: WSMessage) => {
      console.log('📨 WEBSOCKET: New message received:', wsMessage);
      
      if (!wsMessage.data) return;
      
      // ✅ Convert WebSocket message to local Message format
      const newMessage: Message = {
        id: wsMessage.data.id || `ws_${Date.now()}`,
        content: wsMessage.content || wsMessage.data.content || '',
        senderId: wsMessage.senderId || wsMessage.data.senderId || '',
        createdAt: wsMessage.data.createdAt || wsMessage.timestamp,
        isRead: false,
        sender: wsMessage.data.sender,
        attachments: wsMessage.data.attachments || [],
        deliveryStatus: 'delivered'
      };
      
      // ✅ Resolve sender if not already cached
      if (newMessage.senderId && !userResolutionCache.has(newMessage.senderId)) {
        resolveUser(newMessage.senderId);
      }
      
      // ✅ Add message to conversation
      setMessages(prev => {
        // ✅ Prevent duplicates
        const exists = prev.some(msg => msg.id === newMessage.id);
        if (exists) return prev;
        
        return [...prev, newMessage];
      });
      
      // ✅ Update conversation last message
      setConversations(prev =>
        prev.map(conv =>
          conv.id === selectedConversation?.id
            ? { 
                ...conv, 
                lastMessage: newMessage,
                updatedAt: newMessage.createdAt
              }
            : conv
        )
      );
      
      // ✅ Auto-scroll to new message
      setTimeout(() => scrollToBottom(), 100);
      
    }, [selectedConversation?.id, userResolutionCache, resolveUser]),
    
    // ✅ Handle message read receipts
    useCallback((wsMessage: WSMessage) => {
      console.log('👁️ WEBSOCKET: Message read receipt:', wsMessage);
      
      if (wsMessage.data?.messageId) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === wsMessage.data.messageId
              ? { ...msg, isRead: true, deliveryStatus: 'read' }
              : msg
          )
        );
      }
    }, []),
    
    // ✅ Handle typing indicators
    useCallback((wsMessage: WSMessage) => {
      console.log('⌨️ WEBSOCKET: Typing indicator:', wsMessage);
      // Typing state is handled by the hook automatically
    }, [])
  );

  // ✅ Load conversations from API with user resolution
  const loadConversations = useCallback(async () => {
    if (!currentUser?.id) return;
    
    setIsLoadingConversations(true);
    setError(null);
    
    try {
      console.log('💬 Loading conversations for user:', currentUser.id);
      
      const response = await apiClient.getConversations({
        includeArchived: false
      });
      
      if (response.success && isMountedRef.current) {
        console.log(`✅ Loaded ${response.data.length} conversations`);
        setConversations(response.data);
        
        // ✅ Handle navigation state - auto-open specific conversation
        if (navigationState?.conversationId && navigationState?.openConversation) {
          const targetConversation = response.data.find(
            (conv: Conversation) => conv.id === navigationState.conversationId
          );
          
          if (targetConversation) {
            console.log('🎯 Auto-opening conversation from navigation:', targetConversation.id);
            handleSelectConversation(targetConversation);
          }
        }
      } else {
        throw new Error(response.error || 'Failed to load conversations');
      }
    } catch (error: any) {
      console.error('❌ Error loading conversations:', error);
      if (isMountedRef.current) {
        setError(error.message);
        setConversations([]);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoadingConversations(false);
      }
    }
  }, [currentUser?.id, navigationState]);

  // ✅ Load messages for a conversation with user resolution
  const loadMessages = useCallback(async (conversationId: string) => {
    if (!conversationId) return;
    
    setIsLoading(true);
    
    try {
      console.log('💬 Loading messages for conversation:', conversationId);
      
      const response = await apiClient.getConversation(conversationId);
      
      if (response.success && isMountedRef.current) {
        console.log(`✅ Loaded ${response.data.messages.length} messages`);
        
        // ✅ All user resolution is now handled by the enhanced API client
        setMessages(response.data.messages || []);
        
        // Update conversation data with any new info
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId 
              ? { ...conv, ...response.data, unreadCount: 0 }
              : conv
          )
        );
      } else {
        throw new Error(response.error || 'Failed to load messages');
      }
    } catch (error: any) {
      console.error('❌ Error loading messages:', error);
      if (isMountedRef.current) {
        setError(error.message);
        setMessages([]);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // ✅ Handle typing indicator with debouncing
  const handleTypingChange = useCallback((typing: boolean) => {
    if (!selectedConversation?.id) return;
    
    if (typing && !isTyping) {
      setIsTyping(true);
      sendTypingIndicator(selectedConversation.id, true);
      
      // ✅ Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // ✅ Set timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        sendTypingIndicator(selectedConversation.id, false);
      }, 1000);
      
    } else if (!typing && isTyping) {
      setIsTyping(false);
      sendTypingIndicator(selectedConversation.id, false);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  }, [selectedConversation?.id, isTyping, sendTypingIndicator]);

  // Filtered conversations based on search
  const filteredConversations = useMemo(() => {
    if (!searchTerm) return conversations;
    
    return conversations.filter(conv => {
      const otherParticipants = conv.otherParticipants || [];
      const searchLower = searchTerm.toLowerCase();
      
      return otherParticipants.some(participant => {
        const user = participant.user;
        const displayName = getUserDisplayName(user).toLowerCase();
        const businessName = user?.businessName?.toLowerCase() || '';
        return displayName.includes(searchLower) || businessName.includes(searchLower);
      }) || 
      conv.lastMessage?.content?.toLowerCase().includes(searchLower) ||
      conv.subject?.toLowerCase().includes(searchLower);
    });
  }, [conversations, searchTerm, getUserDisplayName]);

  // Get other user in conversation
  const otherUser = useMemo((): User | null => {
    if (!selectedConversation?.otherParticipants?.length) return null;
    return selectedConversation.otherParticipants[0]?.user || null;
  }, [selectedConversation]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Select conversation
  const handleSelectConversation = useCallback(async (conversation: Conversation) => {
    if (!isMountedRef.current) return;
    
    console.log('💬 Selecting conversation:', conversation.id);
    
    setSelectedConversation(conversation);
    setShowMobileConversations(false);
    setMessages([]);
    
    // Load messages for this conversation
    await loadMessages(conversation.id);
    
    // Scroll to bottom after messages load
    setTimeout(scrollToBottom, 100);
  }, [loadMessages, scrollToBottom]);

  // ✅ ENHANCED: Send message with optimistic updates and proper user resolution
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedConversation?.id || !currentUser?.id) return;
    
    const messageContent = newMessage.trim();
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    setNewMessage('');
    setIsSending(true);
    
    // ✅ Stop typing indicator
    handleTypingChange(false);
    
    console.log('📤 SEND MESSAGE DEBUG:', {
      currentUserId: currentUser.id,
      conversationId: selectedConversation.id,
      content: messageContent.slice(0, 30) + '...'
    });
    
    // ✅ Create optimistic message with proper user data
    const optimisticMessage: Message = {
      id: tempId,
      content: messageContent,
      senderId: currentUser.id,
      createdAt: new Date().toISOString(),
      isRead: false,
      isOptimistic: true,
      deliveryStatus: 'sending',
      sender: {
        id: currentUser.id,
        clerkId: currentUser.id,
        firstName: currentUser.firstName || undefined,
        lastName: currentUser.lastName || undefined,
        full_name: currentUser.fullName || undefined,
        imageUrl: currentUser.imageUrl || undefined,
        displayName: getUserDisplayName({
          firstName: currentUser.firstName || undefined,
          lastName: currentUser.lastName || undefined,
          full_name: currentUser.fullName || undefined
        } as User)
      },
      attachments: [...attachments]
    };

    console.log('📝 OPTIMISTIC MESSAGE:', {
      id: optimisticMessage.id,
      senderId: optimisticMessage.senderId,
      currentUserId: currentUser.id,
      willMatch: true // Always true for optimistic messages
    });

    // ✅ Add optimistic message to state
    setOptimisticMessages(prev => new Map(prev.set(tempId, optimisticMessage)));
    setMessages(prev => [...prev, optimisticMessage]);
    setAttachments([]);
    scrollToBottom();

    try {
      // ✅ Send via WebSocket for real-time delivery
      if (isConnected) {
        sendChatMessage(
          selectedConversation.id, 
          messageContent,
          otherUser?.id
        );
      }
      
      // ✅ Send via API for persistence
      const response = await apiClient.sendMessageToConversation(
        selectedConversation.id,
        {
          content: messageContent,
          type: 'GENERAL',
          businessContext: attachments.length > 0 ? { hasAttachments: true } : undefined
        }
      );

      if (response.success && isMountedRef.current) {
        console.log('✅ Message sent successfully via API');
        
        // ✅ Replace optimistic message with real message
        const realMessage = {
          ...response.data,
          isOptimistic: false,
          deliveryStatus: 'sent' as const
        };

        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempId ? realMessage : msg
          )
        );
        
        setOptimisticMessages(prev => {
          const newMap = new Map(prev);
          newMap.delete(tempId);
          return newMap;
        });
        
        // ✅ Update conversation's last message
        setConversations(prev =>
          prev.map(conv =>
            conv.id === selectedConversation.id
              ? { 
                  ...conv, 
                  lastMessage: realMessage,
                  updatedAt: realMessage.createdAt
                }
              : conv
          )
        );
      } else {
        throw new Error(response.error || 'Failed to send message');
      }
    } catch (error: any) {
      console.error('❌ Error sending message:', error);
      
      if (isMountedRef.current) {
        // ✅ Mark optimistic message as failed
        setMessages(prev =>
          prev.map(msg =>
            msg.id === tempId
              ? { ...msg, deliveryStatus: 'failed' as const, error: error.message }
              : msg
          )
        );
        
        // Don't remove the message, let user retry
        if (!isConnected) {
          setNewMessage(messageContent); // Restore message text if no websocket
        }
      }
    } finally {
      if (isMountedRef.current) {
        setIsSending(false);
      }
    }
  }, [newMessage, selectedConversation, currentUser, attachments, scrollToBottom, isConnected, sendChatMessage, otherUser?.id, handleTypingChange, getUserDisplayName]);

  // ✅ Retry failed message
  const handleRetryMessage = useCallback(async (messageId: string) => {
    const failedMessage = messages.find(msg => msg.id === messageId);
    if (!failedMessage || !selectedConversation?.id) return;
    
    // Update message status to sending
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? { ...msg, deliveryStatus: 'sending' as const, error: undefined }
          : msg
      )
    );
    
    try {
      const response = await apiClient.sendMessageToConversation(
        selectedConversation.id,
        {
          content: failedMessage.content,
          type: 'GENERAL'
        }
      );
      
      if (response.success) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === messageId
              ? { ...response.data, deliveryStatus: 'sent' as const }
              : msg
          )
        );
      } else {
        throw new Error(response.error || 'Retry failed');
      }
    } catch (error: any) {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? { ...msg, deliveryStatus: 'failed' as const, error: error.message }
            : msg
        )
      );
    }
  }, [messages, selectedConversation?.id]);

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newAttachments = files.map(file => ({
      id: `att_${Date.now()}_${Math.random()}`,
      name: file.name,
      type: file.type,
      size: file.size,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  }, []);

  // ✅ Enhanced handle enter key with typing indicators
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // ✅ Handle input change with typing indicators
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);
    
    // ✅ Send typing indicator
    if (value.trim()) {
      handleTypingChange(true);
    } else {
      handleTypingChange(false);
    }
  }, [handleTypingChange]);

  // ✅ Component mount/unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    if (currentUser?.id) {
      loadConversations();
    }
    
    return () => {
      isMountedRef.current = false;
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [currentUser?.id, loadConversations]);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // ✅ ENHANCED: Loading state with professional loader
  if (isLoadingConversations) {
    return (
      <div 
        className="flex w-full items-center justify-center bg-gray-50 messages-loading-state"
        style={{ 
          height: 'calc(100vh - 56px)',
          marginTop: '56px'
        }}
      >
        <EnterpriseLoader 
          size="xl"
          theme="brand"
          message="Loading messages..."
          showMessage={true}
          centered={true}
        />
      </div>
    );
  }

  // ✅ ENHANCED: Error state with professional styling
  if (error) {
    return (
      <div 
        className="flex w-full items-center justify-center bg-gray-50 messages-loading-state"
        style={{ 
          height: 'calc(100vh - 56px)',
          marginTop: '56px'
        }}
      >
        <div className="text-center max-w-md mx-4">
          <div className="text-center p-8 rounded-xl bg-white shadow-lg">
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Connection Error</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadConversations}
              className="px-6 py-3 rounded-lg text-white font-bold hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)' }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex w-full bg-white"
      style={{ 
        height: 'calc(100vh - 56px)',
        marginTop: '56px'
      }}
    >
      {/* Mobile override for bottom navigation */}
      <style>{`
        @media (max-width: 767px) {
          div[style*="calc(100vh - 56px)"] {
            height: calc(100vh - 56px - 80px) !important;
          }
          .messages-loading-state {
            height: calc(100vh - 56px - 80px) !important;
          }
        }
        
        @media (min-width: 768px) {
          div[style*="calc(100vh - 56px)"] {
            height: calc(100vh - 56px) !important;
          }
          .messages-loading-state {
            height: calc(100vh - 56px) !important;
          }
        }
      `}</style>

      {/* ✅ CONVERSATIONS SIDEBAR */}
      <div 
        className={`${
          showMobileConversations ? 'w-full' : 'hidden'
        } md:flex md:w-80 border-r border-gray-200 flex flex-col h-full bg-white`}
      >
        {/* ✅ Enhanced Header with Connection Status */}
        <div className="p-3 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-gray-900">Messages</h1>
              
              {/* ✅ WebSocket Connection Status */}
              <ConnectionStatusIndicator 
                isConnected={isConnected}
                onReconnect={reconnect}
                reconnectAttempts={connectionState.reconnectAttempts}
              />
            </div>
            <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <Plus className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* ✅ Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* ✅ Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">No conversations yet</p>
            </div>
          ) : (
            filteredConversations.map(conversation => {
              const otherParticipant = conversation.otherParticipants?.[0];
              const user = otherParticipant?.user;
              
              if (!user) return null;
              
              const isSelected = selectedConversation?.id === conversation.id;
              const isOnline = onlineUsers.has(user.id);
              
              return (
                <div
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation)}
                  className={`p-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                    isSelected ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* ✅ Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                        {user.imageUrl ? (
                          <img 
                            src={user.imageUrl} 
                            alt={getUserDisplayName(user)}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium text-gray-600">
                            {getUserDisplayName(user).slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      {isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>

                    {/* ✅ Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3 className="font-medium text-gray-900 truncate text-sm">
                          {getUserDisplayName(user)}
                        </h3>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {conversation.lastMessage ? 
                            format(new Date(conversation.lastMessage.createdAt), 'p') :
                            format(new Date(conversation.createdAt), 'p')
                          }
                        </span>
                      </div>
                      
                      <p className="text-xs text-gray-600 truncate">
                        {conversation.lastMessage?.content || conversation.subject || 'New conversation'}
                      </p>

                      {/* ✅ Business context */}
                      {(conversation.property || conversation.campaign || conversation.booking) && (
                        <p className="text-xs text-blue-600 truncate mt-0.5">
                          • {conversation.property?.title || 
                             conversation.campaign?.title || 
                             `Booking #${conversation.booking?.id?.slice(-6)}`}
                        </p>
                      )}
                    </div>

                    {/* ✅ Unread Badge */}
                    {conversation.unreadCount > 0 && (
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-xs font-medium text-white">
                          {conversation.unreadCount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ✅ MESSAGES PANEL */}
      <div 
        className={`${
          showMobileConversations ? 'hidden' : 'flex'
        } md:flex flex-1 flex-col h-full bg-white`}
      >
        {selectedConversation && otherUser ? (
          <>
            {/* ✅ Header */}
            <div className="flex-shrink-0 p-3 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowMobileConversations(true)}
                    className="md:hidden p-1.5 rounded-lg hover:bg-gray-100"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                      {otherUser.imageUrl ? (
                        <img 
                          src={otherUser.imageUrl} 
                          alt={getUserDisplayName(otherUser)}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-medium text-gray-600">
                          {getUserDisplayName(otherUser).slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    {onlineUsers.has(otherUser.id) && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-white" />
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-medium text-gray-900 text-sm">
                        {getUserDisplayName(otherUser)}
                      </h2>
                      {onlineUsers.has(otherUser.id) && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600">
                      {selectedConversation.property?.title || 
                       selectedConversation.campaign?.title ||
                       otherUser.businessName || 'Space Inquiry'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button className="p-1.5 rounded-lg hover:bg-gray-100">
                    <Phone className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-gray-100">
                    <Video className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-gray-100">
                    <MoreVertical className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* ✅ Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <EnterpriseLoader 
                    size="md"
                    theme="brand"
                    message="Loading messages..."
                    showMessage={true}
                    centered={true}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message, index) => {
                    const isMyMsg = isMyMessageSync(message);
                    const showDate = index === 0 || 
                      new Date(message.createdAt).toDateString() !== 
                      new Date(messages[index - 1].createdAt).toDateString();
                    
                    return (
                      <div key={message.id}>
                        {showDate && (
                          <div className="flex justify-center mb-3">
                            <div className="px-2 py-1 rounded-full text-xs text-gray-500 bg-white">
                              {format(new Date(message.createdAt), 'MMM d, yyyy')}
                            </div>
                          </div>
                        )}
                        
                        <div className={`flex ${isMyMsg ? 'justify-end' : 'justify-start'} mb-2`}>
                          <div className={`max-w-[75%] ${isMyMsg ? 'order-2' : 'order-1'}`}>
                            {/* ✅ Message Bubble */}
                            <div 
                              className={`rounded-lg px-3 py-2 text-sm ${
                                isMyMsg 
                                  ? 'bg-blue-500 text-white' 
                                  : 'bg-white text-gray-900 border border-gray-200'
                              } ${message.isOptimistic ? 'opacity-70' : ''}`}
                            >
                              <p>{message.content}</p>
                              
                              {/* ✅ File Attachments */}
                              {message.attachments && message.attachments.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {message.attachments.map(att => (
                                    <div key={att.id} className={`flex items-center gap-2 p-2 rounded border ${
                                      isMyMsg ? 'bg-white/10 border-white/20' : 'bg-gray-50 border-gray-200'
                                    }`}>
                                      <div className={`p-1 rounded ${
                                        isMyMsg ? 'bg-white/10' : 'bg-blue-100'
                                      }`}>
                                        {att.type.startsWith('image/') ? 
                                          <Image className={`w-3 h-3 ${isMyMsg ? 'text-white' : 'text-blue-600'}`} /> : 
                                          <FileText className={`w-3 h-3 ${isMyMsg ? 'text-white' : 'text-blue-600'}`} />
                                        }
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className={`text-xs font-medium truncate ${
                                          isMyMsg ? 'text-white' : 'text-gray-900'
                                        }`}>
                                          {att.name}
                                        </p>
                                        <p className={`text-xs ${
                                          isMyMsg ? 'text-white/70' : 'text-gray-500'
                                        }`}>
                                          {formatFileSize(att.size)}
                                        </p>
                                      </div>
                                      <Download className={`w-3 h-3 ${
                                        isMyMsg ? 'text-white' : 'text-gray-400'
                                      }`} />
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              <div className={`flex items-center justify-between mt-1 text-xs ${
                                isMyMsg ? 'text-white/70' : 'text-gray-500'
                              }`}>
                                <span>{format(new Date(message.createdAt), 'p')}</span>
                                
                                {/* ✅ Enhanced message status for sent messages */}
                                {isMyMsg && (
                                  <MessageStatusIndicator
                                    status={message.deliveryStatus || 'sent'}
                                    error={message.error}
                                    onRetry={message.deliveryStatus === 'failed' ? () => handleRetryMessage(message.id) : undefined}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* ✅ Enhanced Typing Indicators */}
                  {typingUsers.length > 0 && (
                    <TypingIndicator users={typingUsers} />
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* ✅ ENHANCED Input Area */}
            <div className="flex-shrink-0 p-3 bg-white border-t border-gray-200">
              {/* ✅ Attachments Preview */}
              {attachments.length > 0 && (
                <div className="mb-2 flex gap-2 flex-wrap">
                  {attachments.map(att => (
                    <div key={att.id} className="flex items-center gap-1 px-2 py-1 rounded bg-gray-100 text-xs">
                      {att.type.startsWith('image/') ? 
                        <Image className="w-3 h-3 text-gray-500" /> : 
                        <FileText className="w-3 h-3 text-gray-500" />
                      }
                      <span className="text-gray-700 max-w-[80px] truncate">{att.name}</span>
                      <button
                        onClick={() => setAttachments(prev => prev.filter(a => a.id !== att.id))}
                        className="p-0.5 rounded hover:bg-gray-200"
                      >
                        <X className="w-3 h-3 text-gray-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <label className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                  <Paperclip className="w-4 h-4 text-gray-600" />
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="image/*,.pdf,.doc,.docx"
                  />
                </label>
                
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="w-full px-3 py-2 pr-20 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    disabled={isSending}
                  />
                  
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-gray-100">
                      <Smile className="w-4 h-4 text-gray-400" />
                    </button>
                    
                    {/* ✅ Enhanced Send Button */}
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || isSending}
                      className="p-1.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      {isSending ? 
                        <EnterpriseLoader size="xs" theme="white" className="w-4 h-4" /> : 
                        <Send className="w-4 h-4" />
                      }
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* ✅ Enhanced Empty State */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Welcome to Messages</h3>
              <p className="text-gray-600 text-sm">
                Select a conversation to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}