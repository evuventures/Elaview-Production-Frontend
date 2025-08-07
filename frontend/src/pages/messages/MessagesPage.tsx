// src/pages/messages/MessagesPage.tsx
// ✅ TypeScript version to match your import in Pages.js

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
  AlertCircle
} from 'lucide-react';
import apiClient from '@/api/apiClient';

// ✅ TypeScript interfaces
interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  full_name?: string;
  businessName?: string;
  imageUrl?: string;
  isBusinessVerified?: boolean;
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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);

  // ✅ Helper to get user display name
  const getUserDisplayName = (user: User | undefined): string => {
    if (!user) return 'Unknown User';
    return user.full_name || 
           `${user.firstName || ''} ${user.lastName || ''}`.trim() || 
           user.businessName || 
           'Anonymous';
  };

  // ✅ Load conversations from API
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

  // ✅ Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    if (!conversationId) return;
    
    setIsLoading(true);
    
    try {
      console.log('💬 Loading messages for conversation:', conversationId);
      
      const response = await apiClient.getConversation(conversationId);
      
      if (response.success && isMountedRef.current) {
        console.log(`✅ Loaded ${response.data.messages.length} messages`);
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
  }, [conversations, searchTerm]);

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

  // Send message
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedConversation?.id || !currentUser?.id) return;
    
    const messageContent = newMessage.trim();
    setNewMessage('');
    setIsSending(true);
    
    // Optimistic update
    const optimisticMessage: Message = {
      id: `temp_${Date.now()}`,
      content: messageContent,
      senderId: currentUser.id,
      createdAt: new Date().toISOString(),
      isRead: false,
      isOptimistic: true,
      sender: {
        id: currentUser.id,
        firstName: currentUser.firstName || undefined,
        lastName: currentUser.lastName || undefined,
        full_name: currentUser.fullName || undefined,
        imageUrl: currentUser.imageUrl || undefined
      },
      attachments: [...attachments]
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setAttachments([]);
    scrollToBottom();

    try {
      const response = await apiClient.sendMessageToConversation(
        selectedConversation.id,
        {
          content: messageContent,
          type: 'GENERAL',
          businessContext: attachments.length > 0 ? { hasAttachments: true } : undefined
        }
      );

      if (response.success && isMountedRef.current) {
        // Replace optimistic message with real one
        setMessages(prev => 
          prev.map(msg => 
            msg.id === optimisticMessage.id 
              ? { ...response.data, isOptimistic: false }
              : msg
          )
        );
        
        // Update conversation's last message
        setConversations(prev =>
          prev.map(conv =>
            conv.id === selectedConversation.id
              ? { 
                  ...conv, 
                  lastMessage: response.data,
                  updatedAt: response.data.createdAt
                }
              : conv
          )
        );
        
        console.log('✅ Message sent successfully');
      } else {
        throw new Error(response.error || 'Failed to send message');
      }
    } catch (error: any) {
      console.error('❌ Error sending message:', error);
      
      // Remove optimistic message on error
      if (isMountedRef.current) {
        setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
        setNewMessage(messageContent); // Restore message text
        alert(`Failed to send message: ${error.message}`);
      }
    } finally {
      if (isMountedRef.current) {
        setIsSending(false);
      }
    }
  }, [newMessage, selectedConversation, currentUser, attachments, scrollToBottom]);

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

  // Handle enter key
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // ✅ Component mount/unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    if (currentUser?.id) {
      loadConversations();
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, [currentUser?.id, loadConversations]);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // ✅ Show loading state while conversations load
  if (isLoadingConversations) {
    return (
      <div 
        className="flex w-full absolute inset-0 md:relative md:h-screen items-center justify-center"
        style={{ 
          backgroundColor: '#F8FAFF',
          top: '64px',
          bottom: '80px',
          left: 0,
          right: 0
        }}
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: '#4668AB' }}>
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Loading Messages</h3>
          <p className="text-gray-600">Getting your conversations...</p>
        </div>
      </div>
    );
  }

  // ✅ Show error state
  if (error) {
    return (
      <div 
        className="flex w-full absolute inset-0 md:relative md:h-screen items-center justify-center"
        style={{ 
          backgroundColor: '#F8FAFF',
          top: '64px',
          bottom: '80px',
          left: 0,
          right: 0
        }}
      >
        <div className="text-center max-w-md mx-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-100">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Connection Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => loadConversations()}
            className="px-4 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: '#4668AB' }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex w-full absolute inset-0 md:relative md:h-screen"
      style={{ 
        backgroundColor: '#F8FAFF',
        // Mobile: Account for fixed navigation bars
        top: '64px',
        bottom: '80px',
        left: 0,
        right: 0
      }}
    >
      {/* Desktop override - full height without nav spacing */}
      <style jsx>{`
        @media (min-width: 768px) {
          div[style*="top: 64px"] {
            position: relative !important;
            top: 0 !important;
            bottom: 0 !important;
            height: 100vh !important;
          }
        }
      `}</style>

      {/* CONVERSATIONS SIDEBAR */}
      <div 
        className={`${
          showMobileConversations ? 'w-full' : 'hidden'
        } md:flex md:w-[380px] lg:w-[420px] xl:w-[480px] border-r flex flex-col h-full`}
        style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}
      >
        {/* Sidebar Header */}
        <div className="flex-shrink-0 p-4 md:p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: '#4668AB' }}>
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Messages</h1>
                <p className="text-sm text-gray-600">
                  {filteredConversations.length} conversations
                </p>
              </div>
            </div>
            <button className="p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Plus className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ borderColor: '#E5E7EB' }}
            />
          </div>
        </div>

        {/* Conversations List - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <h3 className="font-medium text-gray-900 mb-1">No conversations yet</h3>
              <p className="text-sm text-gray-600">
                Start messaging property owners to see conversations here
              </p>
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
                  className={`p-4 cursor-pointer transition-all hover:bg-gray-50 ${
                    isSelected ? 'bg-blue-50 border-l-4' : ''
                  }`}
                  style={isSelected ? { 
                    borderLeftColor: '#4668AB',
                    backgroundColor: '#EFF6FF' 
                  } : {}}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                        {user.imageUrl ? (
                          <img 
                            src={user.imageUrl} 
                            alt={getUserDisplayName(user)}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-gray-600" />
                        )}
                      </div>
                      {isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                      )}
                      {user.isBusinessVerified && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: '#4668AB' }}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {getUserDisplayName(user)}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {conversation.lastMessage ? 
                            formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true }) :
                            formatDistanceToNow(new Date(conversation.createdAt), { addSuffix: true })
                          }
                        </span>
                      </div>
                      
                      <p className="text-xs text-gray-600 font-medium mb-1">
                        {user.businessName || 'Business User'}
                      </p>
                      
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage?.content || conversation.subject || 'New conversation'}
                      </p>

                      {/* Business Context */}
                      {conversation.property && (
                        <div className="flex items-center gap-1 mt-2">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500 truncate">
                            {conversation.property.title || conversation.property.name}
                          </span>
                        </div>
                      )}
                      
                      {conversation.campaign && (
                        <div className="flex items-center gap-1 mt-2">
                          <Briefcase className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500 truncate">
                            {conversation.campaign.title || conversation.campaign.name}
                          </span>
                        </div>
                      )}
                      
                      {conversation.booking && (
                        <div className="flex items-center gap-1 mt-2">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500 truncate">
                            Booking #{conversation.booking.id.slice(-6)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Unread Badge */}
                    {conversation.unreadCount > 0 && (
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
                          style={{ backgroundColor: '#4668AB' }}>
                          {conversation.unreadCount}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MESSAGES PANEL */}
      <div 
        className={`${
          showMobileConversations ? 'hidden' : 'flex'
        } md:flex flex-1 flex-col h-full relative`}
        style={{ backgroundColor: '#FFFFFF' }}
      >
        {selectedConversation && otherUser ? (
          <>
            {/* Messages Header - Fixed at top */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-white border-b" style={{ borderColor: '#E5E7EB' }}>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowMobileConversations(true)}
                      className="md:hidden p-2 rounded-lg hover:bg-gray-50"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                        {otherUser.imageUrl ? (
                          <img 
                            src={otherUser.imageUrl} 
                            alt={getUserDisplayName(otherUser)}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                      {onlineUsers.has(otherUser.id) && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-gray-900">
                          {getUserDisplayName(otherUser)}
                        </h2>
                        {otherUser.isBusinessVerified && (
                          <div className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{ backgroundColor: '#EFF6FF', color: '#4668AB' }}>
                            Verified
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {otherUser.businessName || 'Business User'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-gray-50">
                      <Phone className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-50">
                      <Video className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-50">
                      <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Business Context Bar */}
                {(selectedConversation.property || selectedConversation.campaign || selectedConversation.booking) && (
                  <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: '#F8FAFF' }}>
                    <div className="flex items-center gap-2">
                      {selectedConversation.property && <Building2 className="w-4 h-4 text-gray-500" />}
                      {selectedConversation.campaign && <Briefcase className="w-4 h-4 text-gray-500" />}
                      {selectedConversation.booking && <Calendar className="w-4 h-4 text-gray-500" />}
                      <span className="text-sm font-medium text-gray-700">
                        {selectedConversation.property?.title || 
                         selectedConversation.property?.name ||
                         selectedConversation.campaign?.title || 
                         selectedConversation.campaign?.name ||
                         `Booking #${selectedConversation.booking?.id?.slice(-6)}`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Messages Area - Scrollable with proper spacing */}
            <div 
              className="flex-1 overflow-y-auto p-4"
              style={{ 
                paddingTop: (selectedConversation.property || selectedConversation.campaign || selectedConversation.booking) ? '140px' : '100px',
                paddingBottom: attachments.length > 0 ? '140px' : '100px'
              }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" style={{ color: '#4668AB' }} />
                    <p className="text-gray-600">Loading messages...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    const isMyMessage = message.senderId === currentUser?.id;
                    const showDate = index === 0 || 
                      new Date(message.createdAt).toDateString() !== 
                      new Date(messages[index - 1].createdAt).toDateString();
                    
                    return (
                      <div key={message.id}>
                        {showDate && (
                          <div className="flex justify-center mb-4">
                            <div className="px-3 py-1 rounded-full text-xs text-gray-600"
                              style={{ backgroundColor: '#F8FAFF' }}>
                              {format(new Date(message.createdAt), 'MMMM d, yyyy')}
                            </div>
                          </div>
                        )}
                        
                        <div className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} mb-4`}>
                          <div className={`max-w-[70%] md:max-w-[60%] ${isMyMessage ? 'order-2' : 'order-1'}`}>
                            {/* Message Bubble */}
                            <div className={`rounded-2xl px-4 py-2 ${
                              isMyMessage 
                                ? 'text-white' 
                                : 'bg-gray-100 text-gray-900'
                            } ${message.isOptimistic ? 'opacity-70' : ''}`}
                            style={isMyMessage ? { backgroundColor: '#4668AB' } : {}}>
                              <p className="text-sm">{message.content}</p>
                              
                              {/* Attachments */}
                              {message.attachments && message.attachments.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {message.attachments.map(att => (
                                    <div key={att.id} className={`flex items-center gap-2 p-2 rounded ${
                                      isMyMessage ? 'bg-white/10' : 'bg-white'
                                    }`}>
                                      {att.type.startsWith('image/') ? 
                                        <Image className="w-4 h-4" /> : 
                                        <FileText className="w-4 h-4" />
                                      }
                                      <span className="text-xs truncate">{att.name}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              <div className={`flex items-center gap-2 mt-1 text-xs ${
                                isMyMessage ? 'text-white/70' : 'text-gray-500'
                              }`}>
                                <span>{format(new Date(message.createdAt), 'h:mm a')}</span>
                                {isMyMessage && (
                                  message.isRead ? 
                                    <CheckCheck className="w-3 h-3" /> : 
                                    <Check className="w-3 h-3" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input - Fixed at bottom */}
            <div 
              className="absolute bottom-0 left-0 right-0 bg-white border-t" 
              style={{ 
                borderColor: '#E5E7EB',
                minHeight: 'auto',
                maxHeight: attachments.length > 0 ? '120px' : '80px'
              }}
            >
              <div className="p-3">
                {/* Attachments Preview */}
                {attachments.length > 0 && (
                  <div className="mb-2 flex gap-2 flex-wrap">
                    {attachments.map(att => (
                      <div key={att.id} className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 text-xs">
                        {att.type.startsWith('image/') ? 
                          <Image className="w-3 h-3 text-gray-500" /> : 
                          <FileText className="w-3 h-3 text-gray-500" />
                        }
                        <span className="text-gray-700 max-w-[100px] truncate">{att.name}</span>
                        <button
                          onClick={() => setAttachments(prev => prev.filter(a => a.id !== att.id))}
                          className="p-0.5 rounded hover:bg-gray-200 ml-1"
                        >
                          <X className="w-3 h-3 text-gray-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <label className="p-2 rounded-lg hover:bg-gray-50 cursor-pointer flex-shrink-0">
                    <Paperclip className="w-5 h-5 text-gray-600" />
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
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={`Message ${getUserDisplayName(otherUser)}...`}
                      className="w-full px-3 py-2 pr-10 rounded-lg border bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 text-sm"
                      style={{ borderColor: '#E5E7EB', focusRingColor: '#4668AB' }}
                      disabled={isSending}
                    />
                    
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || isSending}
                      className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-white"
                      style={{ backgroundColor: newMessage.trim() ? '#4668AB' : '#9CA3AF' }}
                    >
                      {isSending ? 
                        <Loader2 className="w-4 h-4 animate-spin" /> : 
                        <Send className="w-4 h-4" />
                      }
                    </button>
                  </div>
                  
                  <button
                    onClick={() => setIsRecording(!isRecording)}
                    className={`p-2 rounded-lg hover:bg-gray-50 flex-shrink-0 ${
                      isRecording ? 'text-red-500' : 'text-gray-600'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: '#F8FAFF' }}>
                <MessageCircle className="w-10 h-10" style={{ color: '#4668AB' }} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Messages</h3>
              <p className="text-gray-600 max-w-md">
                Select a conversation to start chatting with other businesses
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}