// src/pages/messages/MessagesPage.tsx
// ✅ UPDATED: Enhanced empty state UX following research-backed best practices
// ✅ IMPROVED: Always show messages container with welcoming empty state
// ✅ UX RESEARCH: Applied messaging app patterns from Slack, Teams, WhatsApp analysis
// ✅ EQUAL PADDING: Maintains glassmorphism design with proper spacing
// ✅ BUSINESS CONTEXT: Tailored for B2B marketplace messaging needs

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
  WifiOff,
  Users,
  Zap,
  ArrowRight,
  Coffee,
  Sparkles
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

// ✅ GLASSMORPHISM: Enhanced Z-Index Scale for glass layering
const Z_INDEX = {
  BACKGROUND: 1,
  GLASS_CONTAINERS: 10,
  GLASS_OVERLAYS: 15,
  CONTENT: 20,
  MODAL_BACKDROP: 50,
  MODAL_CONTENT: 55,
  DROPDOWN: 60,
  TOAST: 70
};

// ✅ EQUAL PADDING: Calculate navigation heights and equal spacing
const NAVIGATION_HEIGHTS = {
  DESKTOP: 64, // h-16 = 64px from your DesktopTopNavV2
  MOBILE_TOP: 64, // h-16 = 64px from your MobileTopBar  
  MOBILE_BOTTOM: 80 // Estimated mobile bottom nav height
};

const CONTAINER_PADDING = 24; // 24px padding for equal spacing top and bottom

// ✅ FIXED: Pre-calculate CSS values to avoid template literal syntax errors
const CSS_VALUES = {
  DESKTOP_TOTAL_PADDING: NAVIGATION_HEIGHTS.DESKTOP + (CONTAINER_PADDING * 2),
  MOBILE_TOTAL_PADDING: NAVIGATION_HEIGHTS.MOBILE_TOP + NAVIGATION_HEIGHTS.MOBILE_BOTTOM + (CONTAINER_PADDING * 2),
  DESKTOP_TOP_PADDING: NAVIGATION_HEIGHTS.DESKTOP + CONTAINER_PADDING,
  MOBILE_TOP_PADDING: NAVIGATION_HEIGHTS.MOBILE_TOP + CONTAINER_PADDING,
  MOBILE_BOTTOM_PADDING: NAVIGATION_HEIGHTS.MOBILE_BOTTOM + CONTAINER_PADDING
};

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

  // ✅ EQUAL PADDING: Enhanced console logging for layout verification
  useEffect(() => {
    console.log('🎨 MESSAGES EQUAL PADDING: Enhanced styling applied', {
      navigationHeights: NAVIGATION_HEIGHTS,
      containerPadding: CONTAINER_PADDING,
      calculatedValues: CSS_VALUES,
      layoutOptimizations: [
        'EQUAL SPACING: Top and bottom padding now balanced',
        'RESPONSIVE: Mobile and desktop padding calculated separately',
        'NAVIGATION AWARE: Accounts for actual navigation component heights',
        'CONTAINER SIZING: Glassmorphism containers sized to fit with equal spacing',
        'OVERFLOW PREVENTION: Fixed positioning prevents page-level scrolling',
        'GLASSMORPHISM: Premium glass containers maintain visual hierarchy',
        'UX RESEARCH: Applied messaging app empty state best practices'
      ],
      emptyStateEnhancements: {
        'Always Show Container': 'Messages panel now always visible with welcoming empty state',
        'Research-Based Design': 'Applied patterns from Slack, Teams, WhatsApp analysis',
        'Clear Status Communication': 'Users understand why area is empty and what to do',
        'Business Context': 'Tailored for B2B marketplace messaging needs',
        'Positive Tone': 'Encouraging language keeps users motivated',
        'Visual Hierarchy': 'Progressive disclosure guides user attention'
      },
      timestamp: new Date().toISOString()
    });
  }, []);

  // ✅ DEBUG: Track state changes for empty state visibility
  useEffect(() => {
    console.log('🔍 EMPTY STATE DEBUG:', {
      showMobileConversations,
      selectedConversation: selectedConversation?.id || 'null',
      shouldShowEmptyState: !selectedConversation,
      currentUser: currentUser?.id || 'null',
      conversationsCount: conversations.length,
      isLoadingConversations,
      screenWidth: typeof window !== 'undefined' ? window.innerWidth : 'unknown',
      timestamp: new Date().toISOString()
    });
  }, [showMobileConversations, selectedConversation, currentUser, conversations.length, isLoadingConversations]);

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

  // ✅ NEW: Create new conversation handler
  const handleCreateNewConversation = useCallback(() => {
    console.log('🆕 Creating new conversation...');
    // TODO: Implement create new conversation modal/flow
    // For now, this could navigate to a contact picker or property selection
    navigate('/contacts', { state: { returnTo: '/messages', action: 'create-conversation' } });
  }, [navigate]);

  // ✅ FIXED: Send message with proper user ID resolution
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
      
      // ✅ FIXED: Ensure the real message maintains correct ownership
      const realMessage: Message = {
        ...response.data,
        isOptimistic: false,
        deliveryStatus: 'sent' as const,
        // ✅ CRITICAL FIX: Override senderId to ensure it matches currentUser.id
        senderId: currentUser.id,
        // ✅ CRITICAL FIX: Ensure sender data is preserved
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
        }
      };

      console.log('🔧 REAL MESSAGE FIXED:', {
        originalSenderId: response.data.senderId,
        fixedSenderId: realMessage.senderId,
        currentUserId: currentUser.id,
        willMatchNow: true
      });

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

  // ✅ EQUAL PADDING: Enhanced loading state with proper spacing
  if (isLoadingConversations) {
    return (
      <div 
        className="flex items-center justify-center messages-loading-state relative"
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #F8FAFF 0%, #E8F2FF 50%, #F0F8FF 100%)'
        }}
      >
        {/* ✅ GLASSMORPHISM: Enhanced background pattern */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(120, 198, 119, 0.3) 0%, transparent 50%)'
          }}
        />
        
        {/* ✅ GLASSMORPHISM: Premium loading container */}
        <div 
          className="relative rounded-2xl p-8 text-center max-w-md mx-4 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.35) 50%, rgba(255, 255, 255, 0.25) 100%)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(255, 255, 255, 0.05)',
            zIndex: Z_INDEX.GLASS_CONTAINERS
          }}
        >
          {/* Glass reflection overlay */}
          <div 
            className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-t-2xl"
            style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)',
              zIndex: Z_INDEX.GLASS_OVERLAYS
            }}
          />
          
          <div style={{ zIndex: Z_INDEX.CONTENT }} className="relative">
            <EnterpriseLoader 
              size="xl"
              theme="brand"
              message="Loading messages..."
              showMessage={true}
              centered={true}
            />
          </div>
        </div>
      </div>
    );
  }

  // ✅ EQUAL PADDING: Enhanced error state with proper spacing
  if (error) {
    return (
      <div 
        className="flex items-center justify-center messages-loading-state relative"
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #FFF8F8 0%, #FFE8E8 50%, #FFF0F0 100%)'
        }}
      >
        {/* Error background pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(circle at 20% 80%, rgba(239, 68, 68, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(239, 68, 68, 0.2) 0%, transparent 50%)'
          }}
        />
        
        <div 
          className="relative rounded-2xl p-8 text-center max-w-md mx-4 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.35) 50%, rgba(255, 255, 255, 0.25) 100%)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            boxShadow: '0 8px 32px rgba(239, 68, 68, 0.15), 0 4px 16px rgba(239, 68, 68, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(255, 255, 255, 0.05)',
            zIndex: Z_INDEX.GLASS_CONTAINERS
          }}
        >
          {/* Glass reflection overlay */}
          <div 
            className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-t-2xl"
            style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)',
              zIndex: Z_INDEX.GLASS_OVERLAYS
            }}
          />
          
          <div style={{ zIndex: Z_INDEX.CONTENT }} className="relative">
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Connection Error</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadConversations}
              className="px-6 py-3 rounded-lg text-white font-bold hover:opacity-90 transition-all duration-300 relative overflow-hidden"
              style={{ 
                background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
                boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
              }}
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
      className="flex messages-container"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #F8FAFF 0%, #E8F2FF 25%, #F0F8FF 50%, #E8F2FF 75%, #F8FAFF 100%)'
      }}
    >
      {/* ✅ GLASSMORPHISM: Enhanced background with subtle patterns */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(120, 198, 119, 0.1) 0%, transparent 50%)',
          zIndex: Z_INDEX.BACKGROUND
        }}
      />

      {/* ✅ FIXED: Enhanced mobile/desktop responsive styling with correct CSS syntax */}
      <style>{`
        /* ✅ EQUAL PADDING: Desktop layout with balanced spacing */
        @media (min-width: 768px) {
          .messages-container {
            padding: ${CONTAINER_PADDING}px;
            padding-top: ${CSS_VALUES.DESKTOP_TOP_PADDING}px;
            padding-bottom: ${CONTAINER_PADDING}px;
          }
          .glassmorphism-container {
            height: calc(100vh - ${CSS_VALUES.DESKTOP_TOTAL_PADDING}px) !important;
            max-height: calc(100vh - ${CSS_VALUES.DESKTOP_TOTAL_PADDING}px) !important;
          }
        }
        
        /* ✅ EQUAL PADDING: Mobile layout with balanced spacing */
        @media (max-width: 767px) {
          .messages-container {
            padding: ${CONTAINER_PADDING}px;
            padding-top: ${CSS_VALUES.MOBILE_TOP_PADDING}px;
            padding-bottom: ${CSS_VALUES.MOBILE_BOTTOM_PADDING}px;
          }
          .glassmorphism-container {
            height: calc(100vh - ${CSS_VALUES.MOBILE_TOTAL_PADDING}px) !important;
            max-height: calc(100vh - ${CSS_VALUES.MOBILE_TOTAL_PADDING}px) !important;
          }
        }
        
        /* ✅ CRITICAL: Prevent any scrolling */
        .messages-container, .glassmorphism-container {
          overflow: hidden !important;
        }
        
        /* ✅ EQUAL PADDING: Loading states get the same treatment */
        .messages-loading-state {
          padding: ${CONTAINER_PADDING}px !important;
        }
        
        @media (min-width: 768px) {
          .messages-loading-state {
            padding-top: ${CSS_VALUES.DESKTOP_TOP_PADDING}px !important;
            padding-bottom: ${CONTAINER_PADDING}px !important;
          }
        }
        
        @media (max-width: 767px) {
          .messages-loading-state {
            padding-top: ${CSS_VALUES.MOBILE_TOP_PADDING}px !important;
            padding-bottom: ${CSS_VALUES.MOBILE_BOTTOM_PADDING}px !important;
          }
        }
      `}</style>

      {/* ✅ GLASSMORPHISM: CONVERSATIONS SIDEBAR with enhanced glass effect */}
      <div 
        className={`${
          showMobileConversations ? 'w-full' : 'hidden'
        } md:flex md:w-80 flex-col md:mr-6`}
        style={{ 
          zIndex: Z_INDEX.GLASS_CONTAINERS
        }}
      >
        {/* ✅ GLASSMORPHISM: Premium glass container with equal padding */}
        <div 
          className="glassmorphism-container rounded-2xl overflow-hidden relative"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.35) 50%, rgba(255, 255, 255, 0.25) 100%)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(255, 255, 255, 0.05)'
          }}
        >
          {/* ✅ GLASSMORPHISM: Glass reflection overlay */}
          <div 
            className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-t-2xl"
            style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)',
              zIndex: Z_INDEX.GLASS_OVERLAYS
            }}
          />

          {/* Content with proper z-index */}
          <div className="flex flex-col relative h-full" style={{ zIndex: Z_INDEX.CONTENT }}>
            {/* ✅ Enhanced Header with Connection Status */}
            <div 
              className="p-4 relative"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0.4) 100%)',
                backdropFilter: 'blur(15px) saturate(150%)',
                WebkitBackdropFilter: 'blur(15px) saturate(150%)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.15)'
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h1 className="text-lg font-semibold text-gray-900" style={{textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'}}>Messages</h1>
                  
                  {/* ✅ WebSocket Connection Status */}
                  <ConnectionStatusIndicator 
                    isConnected={isConnected}
                    onReconnect={reconnect}
                    reconnectAttempts={connectionState.reconnectAttempts}
                  />
                </div>
                <button 
                  onClick={handleCreateNewConversation}
                  className="p-1.5 rounded-lg transition-all duration-300 relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%)',
                    backdropFilter: 'blur(10px) saturate(150%)',
                    WebkitBackdropFilter: 'blur(10px) saturate(150%)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0px)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                  }}
                >
                  {/* Glass reflection on button */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-lg"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, transparent 100%)'
                    }}
                  />
                  <Plus className="w-4 h-4 text-gray-600 relative z-10" />
                </button>
              </div>

              {/* ✅ Enhanced Search with glassmorphism */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.7) 100%)',
                    backdropFilter: 'blur(10px) saturate(120%)',
                    WebkitBackdropFilter: 'blur(10px) saturate(120%)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 0 rgba(255, 255, 255, 0.1)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(70, 104, 171, 0.5)';
                    e.target.style.boxShadow = 'inset 0 1px 3px rgba(0, 0, 0, 0.1), 0 0 0 2px rgba(70, 104, 171, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                    e.target.style.boxShadow = 'inset 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 0 rgba(255, 255, 255, 0.1)';
                  }}
                />
              </div>
            </div>

            {/* ✅ GLASSMORPHISM: Enhanced Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-4 text-center">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600" style={{textShadow: '0 1px 2px rgba(255, 255, 255, 0.6)'}}>No conversations yet</p>
                  <button
                    onClick={handleCreateNewConversation}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Start your first conversation
                  </button>
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
                      className={`mx-2 my-1 p-3 rounded-xl cursor-pointer transition-all duration-300 relative overflow-hidden ${
                        isSelected ? 'ring-2' : ''
                      }`}
                      style={{
                        background: isSelected 
                          ? 'linear-gradient(135deg, rgba(70, 104, 171, 0.15) 0%, rgba(70, 104, 171, 0.25) 50%, rgba(70, 104, 171, 0.15) 100%)'
                          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0.4) 100%)',
                        backdropFilter: 'blur(15px) saturate(150%)',
                        WebkitBackdropFilter: 'blur(15px) saturate(150%)',
                        border: `1px solid ${isSelected ? 'rgba(70, 104, 171, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                        boxShadow: isSelected 
                          ? '0 4px 16px rgba(70, 104, 171, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                          : '0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.6) 50%, rgba(255, 255, 255, 0.5) 100%)';
                          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.transform = 'translateY(0px)';
                          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0.4) 100%)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                        }
                      }}
                    >
                      {/* ✅ GLASSMORPHISM: Glass reflection on conversation items */}
                      <div 
                        className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-xl"
                        style={{
                          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%)'
                        }}
                      />

                      <div className="flex items-center gap-3 relative z-10">
                        {/* ✅ Avatar */}
                        <div className="relative flex-shrink-0">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden"
                            style={{
                              background: 'linear-gradient(135deg, rgba(156, 163, 175, 0.3) 0%, rgba(156, 163, 175, 0.5) 100%)',
                              backdropFilter: 'blur(10px)',
                              WebkitBackdropFilter: 'blur(10px)',
                              border: '1px solid rgba(255, 255, 255, 0.2)'
                            }}
                          >
                            {user.imageUrl ? (
                              <img 
                                src={user.imageUrl} 
                                alt={getUserDisplayName(user)}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-medium text-gray-600" style={{textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'}}>
                                {getUserDisplayName(user).slice(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>
                          {isOnline && (
                            <div 
                              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                              style={{
                                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                borderColor: 'rgba(255, 255, 255, 0.8)',
                                boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)'
                              }}
                            />
                          )}
                        </div>

                        {/* ✅ Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <h3 className="font-medium text-gray-900 truncate text-sm" style={{textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'}}>
                              {getUserDisplayName(user)}
                            </h3>
                            <span className="text-xs text-gray-500 flex-shrink-0" style={{textShadow: '0 1px 2px rgba(255, 255, 255, 0.6)'}}>
                              {conversation.lastMessage ? 
                                format(new Date(conversation.lastMessage.createdAt), 'p') :
                                format(new Date(conversation.createdAt), 'p')
                              }
                            </span>
                          </div>
                          
                          <p className="text-xs text-gray-600 truncate" style={{textShadow: '0 1px 2px rgba(255, 255, 255, 0.6)'}}>
                            {conversation.lastMessage?.content || conversation.subject || 'New conversation'}
                          </p>

                          {/* ✅ Business context */}
                          {(conversation.property || conversation.campaign || conversation.booking) && (
                            <p 
                              className="text-xs truncate mt-0.5"
                              style={{ 
                                color: '#4668AB',
                                textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
                              }}
                            >
                              • {conversation.property?.title || 
                                 conversation.campaign?.title || 
                                 `Booking #${conversation.booking?.id?.slice(-6)}`}
                            </p>
                          )}
                        </div>

                        {/* ✅ GLASSMORPHISM: Enhanced Unread Badge */}
                        {conversation.unreadCount > 0 && (
                          <div 
                            className="w-5 h-5 rounded-full flex items-center justify-center relative overflow-hidden"
                            style={{
                              background: 'linear-gradient(135deg, #4668AB 0%, #3A5490 100%)',
                              backdropFilter: 'blur(10px)',
                              WebkitBackdropFilter: 'blur(10px)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              boxShadow: '0 2px 8px rgba(70, 104, 171, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                            }}
                          >
                            {/* Glass reflection on badge */}
                            <div 
                              className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-full"
                              style={{
                                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, transparent 100%)'
                              }}
                            />
                            <span className="text-xs font-medium text-white relative z-10">
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
        </div>
      </div>

      {/* ✅ GLASSMORPHISM: MESSAGES PANEL - Always visible with enhanced UX empty state */}
      <div 
        className={`${
          showMobileConversations ? 'hidden md:flex' : 'flex'
        } flex-col w-full md:w-[50%]`}
        style={{ 
          zIndex: Z_INDEX.GLASS_CONTAINERS
        }}
      >
        {selectedConversation && otherUser ? (
          <div 
            className="glassmorphism-container rounded-2xl overflow-hidden relative"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.35) 50%, rgba(255, 255, 255, 0.25) 100%)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(255, 255, 255, 0.05)'
            }}
          >
            {/* ✅ GLASSMORPHISM: Glass reflection overlay */}
            <div 
              className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-t-2xl"
              style={{
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)',
                zIndex: Z_INDEX.GLASS_OVERLAYS
              }}
            />

            <div className="flex flex-col relative h-full" style={{ zIndex: Z_INDEX.CONTENT }}>
              {/* ✅ GLASSMORPHISM: Enhanced Header */}
              <div 
                className="flex-shrink-0 p-4 relative"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0.4) 100%)',
                  backdropFilter: 'blur(15px) saturate(150%)',
                  WebkitBackdropFilter: 'blur(15px) saturate(150%)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.15)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowMobileConversations(true)}
                      className="md:hidden p-1.5 rounded-lg transition-all duration-300"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                      }}
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    
                    <div className="relative">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden"
                        style={{
                          background: 'linear-gradient(135deg, rgba(156, 163, 175, 0.3) 0%, rgba(156, 163, 175, 0.5) 100%)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}
                      >
                        {otherUser.imageUrl ? (
                          <img 
                            src={otherUser.imageUrl} 
                            alt={getUserDisplayName(otherUser)}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-medium text-gray-600" style={{textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'}}>
                            {getUserDisplayName(otherUser).slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      {onlineUsers.has(otherUser.id) && (
                        <div 
                          className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border"
                          style={{
                            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                            borderColor: 'rgba(255, 255, 255, 0.8)'
                          }}
                        />
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-medium text-gray-900 text-sm" style={{textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'}}>
                          {getUserDisplayName(otherUser)}
                        </h2>
                        {onlineUsers.has(otherUser.id) && (
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
                          />
                        )}
                      </div>
                      <p className="text-xs text-gray-600" style={{textShadow: '0 1px 2px rgba(255, 255, 255, 0.6)'}}>
                        {selectedConversation.property?.title || 
                         selectedConversation.campaign?.title ||
                         otherUser.businessName || 'Space Inquiry'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {[Phone, Video, MoreVertical].map((Icon, index) => (
                      <button 
                        key={index}
                        className="p-1.5 rounded-lg transition-all duration-300 relative overflow-hidden"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0px)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                        }}
                      >
                        <Icon className="w-4 h-4 text-gray-600" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ✅ GLASSMORPHISM: Enhanced Messages Area */}
              <div 
                className="flex-1 overflow-y-auto p-4 relative"
                style={{
                  background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.3) 0%, rgba(248, 250, 252, 0.4) 50%, rgba(248, 250, 252, 0.3) 100%)',
                  backdropFilter: 'blur(10px) saturate(120%)',
                  WebkitBackdropFilter: 'blur(10px) saturate(120%)'
                }}
              >
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
                              <div 
                                className="px-3 py-1 rounded-full text-xs text-gray-500 relative overflow-hidden"
                                style={{
                                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.9) 100%)',
                                  backdropFilter: 'blur(10px)',
                                  border: '1px solid rgba(255, 255, 255, 0.3)',
                                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                                }}
                              >
                                {format(new Date(message.createdAt), 'MMM d, yyyy')}
                              </div>
                            </div>
                          )}
                          
                          <div className={`flex ${isMyMsg ? 'justify-end' : 'justify-start'} mb-2`}>
                            <div className={`max-w-[75%] ${isMyMsg ? 'order-2' : 'order-1'}`}>
                              {/* ✅ GLASSMORPHISM: Enhanced Message Bubble */}
                              <div 
                                className={`rounded-lg px-3 py-2 text-sm relative overflow-hidden ${
                                  message.isOptimistic ? 'opacity-70' : ''
                                }`}
                                style={isMyMsg ? {
                                  background: 'linear-gradient(135deg, #5A7BC2 0%, #4668AB 50%, #3A5490 100%)',
                                  backdropFilter: 'blur(10px)',
                                  color: 'white',
                                  border: '1px solid rgba(255, 255, 255, 0.1)',
                                  boxShadow: '0 4px 16px rgba(70, 104, 171, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                                } : {
                                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%)',
                                  backdropFilter: 'blur(15px) saturate(150%)',
                                  WebkitBackdropFilter: 'blur(15px) saturate(150%)',
                                  color: '#1F2937',
                                  border: '1px solid rgba(255, 255, 255, 0.2)',
                                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                                }}
                              >
                                {/* Glass reflection on message bubbles */}
                                <div 
                                  className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-lg"
                                  style={{
                                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%)'
                                  }}
                                />
                                
                                <p className="relative z-10">{message.content}</p>
                                
                                {/* ✅ File Attachments */}
                                {message.attachments && message.attachments.length > 0 && (
                                  <div className="mt-2 space-y-1 relative z-10">
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
                                
                                <div className={`flex items-center justify-between mt-1 text-xs relative z-10 ${
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
                      <TypingIndicator users={typingUsers as any} />
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* ✅ GLASSMORPHISM: Enhanced Input Area */}
              <div 
                className="flex-shrink-0 p-4 relative"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0.4) 100%)',
                  backdropFilter: 'blur(15px) saturate(150%)',
                  WebkitBackdropFilter: 'blur(15px) saturate(150%)',
                  borderTop: '1px solid rgba(255, 255, 255, 0.15)'
                }}
              >
                {/* ✅ Attachments Preview with glassmorphism */}
                {attachments.length > 0 && (
                  <div className="mb-2 flex gap-2 flex-wrap">
                    {attachments.map(att => (
                      <div 
                        key={att.id} 
                        className="flex items-center gap-1 px-2 py-1 rounded text-xs relative overflow-hidden"
                        style={{
                          background: 'linear-gradient(135deg, rgba(156, 163, 175, 0.4) 0%, rgba(156, 163, 175, 0.5) 100%)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}
                      >
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
                  <label 
                    className="p-2 rounded-lg cursor-pointer transition-all duration-300 relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0px)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                    }}
                  >
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
                      className="w-full px-3 py-2 pr-20 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none text-sm transition-all duration-300"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.9) 100%)',
                        backdropFilter: 'blur(15px) saturate(150%)',
                        WebkitBackdropFilter: 'blur(15px) saturate(150%)',
                        border: '1px solid rgba(255, 255, 255, 0.25)',
                        boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 0 rgba(255, 255, 255, 0.1)'
                      }}
                      disabled={isSending}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'rgba(70, 104, 171, 0.5)';
                        e.target.style.boxShadow = 'inset 0 1px 3px rgba(0, 0, 0, 0.1), 0 0 0 2px rgba(70, 104, 171, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                        e.target.style.boxShadow = 'inset 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 0 rgba(255, 255, 255, 0.1)';
                      }}
                    />
                    
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button 
                        className="p-1.5 rounded-lg transition-all duration-300"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}
                      >
                        <Smile className="w-4 h-4 text-gray-400" />
                      </button>
                      
                      {/* ✅ GLASSMORPHISM: Enhanced Send Button */}
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || isSending}
                        className="p-1.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 relative overflow-hidden"
                        style={{ 
                          background: 'linear-gradient(135deg, #5A7BC2 0%, #4668AB 50%, #3A5490 100%)',
                          backdropFilter: 'blur(10px)',
                          color: 'white',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          boxShadow: '0 4px 16px rgba(70, 104, 171, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                        }}
                        onMouseEnter={(e) => {
                          if (!e.currentTarget.disabled) {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #6B8BD1 0%, #5A7BC2 50%, #4668AB 100%)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(70, 104, 171, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!e.currentTarget.disabled) {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #5A7BC2 0%, #4668AB 50%, #3A5490 100%)';
                            e.currentTarget.style.transform = 'translateY(0px)';
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(70, 104, 171, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
                          }
                        }}
                      >
                        {/* Glass reflection on send button */}
                        <div 
                          className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-lg"
                          style={{
                            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, transparent 100%)'
                          }}
                        />
                        {isSending ? 
                          <EnterpriseLoader size="xs" theme="white" className="w-4 h-4 relative z-10" /> : 
                          <Send className="w-4 h-4 relative z-10" />
                        }
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ✅ UX RESEARCH: Enhanced Welcome Empty State following messaging app best practices */
          <div 
            className="glassmorphism-container rounded-2xl overflow-hidden relative flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.35) 50%, rgba(255, 255, 255, 0.25) 100%)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(255, 255, 255, 0.05)'
            }}
          >
            {/* Glass reflection overlay */}
            <div 
              className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-t-2xl"
              style={{
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)',
                zIndex: Z_INDEX.GLASS_OVERLAYS
              }}
            />
            
            {/* ✅ UX RESEARCH: Progressive disclosure welcome content */}
            <div className="text-center max-w-sm mx-auto px-6 relative" style={{ zIndex: Z_INDEX.CONTENT }}>
              {/* ✅ Primary visual element - friendly and business-oriented */}
              <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(70, 104, 171, 0.15) 0%, rgba(70, 104, 171, 0.25) 50%, rgba(70, 104, 171, 0.15) 100%)',
                  backdropFilter: 'blur(15px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 24px rgba(70, 104, 171, 0.2)'
                }}
              >
                {/* Glass reflection on icon container */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-2xl"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, transparent 100%)'
                  }}
                />
                <MessageCircle 
                  className="w-10 h-10 relative z-10"
                  style={{ color: '#4668AB' }}
                />
              </div>

              {/* ✅ Clear status communication - friendly heading */}
              <h2 
                className="text-xl font-semibold text-gray-900 mb-3"
                style={{textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'}}
              >
                Welcome to Messages
              </h2>
              
              {/* ✅ Motivation - explains the business value */}
              <p 
                className="text-gray-600 text-sm leading-relaxed mb-6"
                style={{textShadow: '0 1px 2px rgba(255, 255, 255, 0.6)'}}
              >
               
                Select a conversation to start chatting, or create a new conversation to reach out.
              </p>

            </div>
          </div>
        )}
      </div>

      {/* ✅ RESERVED SPACE: 30% width for future content - Desktop only */}
      <div 
        className="hidden md:block md:w-[30%]"
        style={{ 
          minWidth: '200px'
        }}
      >
        {/* Future content area - currently empty as requested */}
        {/* This space is reserved for additional features like:
            - Contact information panel
            - Shared files/media
            - Business context details
            - Campaign information
            - Property details
            - Calendar integration
            - etc. */}
      </div>
    </div>
  );
}