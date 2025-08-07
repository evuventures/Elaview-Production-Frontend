import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
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
  MessageCircle
} from 'lucide-react';

// ==================== TYPE DEFINITIONS ====================
interface UserType {
  id: string;
  full_name: string;
  profile_image?: string | null;
  businessName?: string;
  isVerified?: boolean;
}

interface Conversation {
  id: string;
  participant_ids: string[];
  lastMessage: string;
  lastActivity: Date;
  unreadCount: number;
  context?: {
    type: 'property' | 'campaign' | 'booking';
    id: string;
    name: string;
  };
  businessType?: string;
}

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  message_type: string;
  created_date: string;
  is_read: boolean;
  isOptimistic?: boolean;
  attachments?: Attachment[];
  businessContext?: {
    type: string;
    priority?: string;
  };
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  preview?: string | null;
}

// ==================== MOCK DATA ====================
const mockUsers: Record<string, UserType> = {
  'user1': { id: 'user1', full_name: 'Current User', businessName: 'Your Company' },
  'user2': { id: 'user2', full_name: 'Sarah Johnson', businessName: 'Metro Advertising Co.', isVerified: true },
  'user3': { id: 'user3', full_name: 'Mike Chen', businessName: 'Downtown Properties LLC', isVerified: true },
  'user4': { id: 'user4', full_name: 'David Martinez', businessName: 'Creative Campaigns Inc.', isVerified: false }
};

const mockConversations: Conversation[] = [
  {
    id: 'conv_1',
    participant_ids: ['user1', 'user2'],
    lastMessage: 'I\'d like to request a quote for your downtown billboard space.',
    lastActivity: new Date(Date.now() - 1000 * 60 * 30),
    unreadCount: 2,
    context: { type: 'property', id: 'prop_1', name: 'Downtown Billboard - Main St' },
    businessType: 'property_inquiry'
  },
  {
    id: 'conv_2',
    participant_ids: ['user1', 'user3'],
    lastMessage: 'Campaign looks great! Ready to move forward with installation.',
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2),
    unreadCount: 0,
    context: { type: 'campaign', id: 'camp_1', name: 'Summer Sale Campaign 2025' },
    businessType: 'campaign_discussion'
  },
  {
    id: 'conv_3',
    participant_ids: ['user1', 'user4'],
    lastMessage: 'Contract attached. Please review and let me know if you have questions.',
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24),
    unreadCount: 1,
    context: { type: 'booking', id: 'book_1', name: 'Q1 2025 Ad Placement' },
    businessType: 'contract_review'
  }
];

const mockMessages: Message[] = [
  {
    id: 'msg1',
    sender_id: 'user2',
    recipient_id: 'user1',
    content: 'Hi! I\'m interested in your downtown billboard space for our summer campaign.',
    message_type: 'text',
    created_date: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    is_read: false
  },
  {
    id: 'msg2',
    sender_id: 'user2',
    recipient_id: 'user1',
    content: 'Could you provide pricing for a 4-week campaign starting July 1st?',
    message_type: 'text',
    created_date: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    is_read: false,
    businessContext: { type: 'rfq', priority: 'high' }
  },
  {
    id: 'msg3',
    sender_id: 'user1',
    recipient_id: 'user2',
    content: 'Hi Sarah! Thanks for your interest. Our rates for that location are $450/day. I\'ll send over our rate sheet with all the details.',
    message_type: 'text',
    created_date: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    is_read: true
  },
  {
    id: 'msg4',
    sender_id: 'user1',
    recipient_id: 'user2',
    content: 'I\'ve attached our full rate sheet and availability calendar. We also have a special promotion for first-time advertisers - 15% off for campaigns booked before March 1st.',
    message_type: 'text',
    created_date: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    is_read: true,
    attachments: [
      { id: 'att1', name: 'Rate_Sheet_Q1_2025.pdf', type: 'application/pdf', size: 245000, preview: null },
      { id: 'att2', name: 'Availability_Calendar.pdf', type: 'application/pdf', size: 180000, preview: null }
    ]
  }
];

// ==================== MAIN MESSAGES PAGE COMPONENT ====================
export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileConversations, setShowMobileConversations] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [onlineUsers] = useState(new Set(['user2', 'user3']));

  const currentUserId = 'user1';

  // Filtered conversations based on search
  const filteredConversations = useMemo(() => {
    if (!searchTerm) return conversations;
    return conversations.filter(conv => {
      const otherId = conv.participant_ids.find(id => id !== currentUserId);
      const otherUser = otherId ? mockUsers[otherId] : null;
      return otherUser?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             otherUser?.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [conversations, searchTerm]);

  // Get other user in conversation
  const otherUser = useMemo(() => {
    if (!selectedConversation) return null;
    const otherId = selectedConversation.participant_ids.find(id => id !== currentUserId);
    return otherId ? mockUsers[otherId] : null;
  }, [selectedConversation]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Select conversation
  const handleSelectConversation = useCallback((conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowMobileConversations(false);
    setIsLoading(true);
    
    // Simulate loading messages
    setTimeout(() => {
      setMessages(mockMessages);
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }, 500);

    // Mark as read
    setConversations(prev => 
      prev.map(c => c.id === conversation.id ? { ...c, unreadCount: 0 } : c)
    );
  }, [scrollToBottom]);

  // Send message
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !otherUser || !selectedConversation) return;
    
    const optimisticMessage: Message = {
      id: `msg_${Date.now()}`,
      sender_id: currentUserId,
      recipient_id: otherUser.id,
      content: newMessage.trim(),
      message_type: 'text',
      created_date: new Date().toISOString(),
      is_read: false,
      isOptimistic: true,
      attachments: [...attachments]
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');
    setAttachments([]);
    setIsSending(true);
    scrollToBottom();

    // Simulate API call
    setTimeout(() => {
      setMessages(prev => 
        prev.map(m => m.id === optimisticMessage.id 
          ? { ...m, isOptimistic: false } 
          : m
        )
      );
      setIsSending(false);
    }, 1000);
  }, [newMessage, otherUser, selectedConversation, attachments, scrollToBottom]);

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

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Initial selection
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      handleSelectConversation(conversations[0]);
    }
  }, []);

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
          {filteredConversations.map(conversation => {
            const otherId = conversation.participant_ids.find(id => id !== currentUserId);
            const user = otherId ? mockUsers[otherId] : null;
            if (!user) return null;
            
            const isSelected = selectedConversation?.id === conversation.id;
            const isOnline = onlineUsers.has(otherId);
            
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
                      <User className="w-6 h-6 text-gray-600" />
                    </div>
                    {isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                    )}
                    {user.isVerified && (
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
                        {user.full_name}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(conversation.lastActivity, { addSuffix: true })}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-600 font-medium mb-1">
                      {user.businessName}
                    </p>
                    
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage}
                    </p>

                    {/* Business Context */}
                    {conversation.context && (
                      <div className="flex items-center gap-1 mt-2">
                        {conversation.context.type === 'property' && <MapPin className="w-3 h-3 text-gray-400" />}
                        {conversation.context.type === 'campaign' && <Briefcase className="w-3 h-3 text-gray-400" />}
                        {conversation.context.type === 'booking' && <Calendar className="w-3 h-3 text-gray-400" />}
                        <span className="text-xs text-gray-500 truncate">
                          {conversation.context.name}
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
          })}
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
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      {onlineUsers.has(otherUser.id) && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-gray-900">{otherUser.full_name}</h2>
                        {otherUser.isVerified && (
                          <div className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{ backgroundColor: '#EFF6FF', color: '#4668AB' }}>
                            Verified
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{otherUser.businessName}</p>
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
                {selectedConversation.context && (
                  <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: '#F8FAFF' }}>
                    <div className="flex items-center gap-2">
                      {selectedConversation.context.type === 'property' && <Building2 className="w-4 h-4 text-gray-500" />}
                      {selectedConversation.context.type === 'campaign' && <Briefcase className="w-4 h-4 text-gray-500" />}
                      {selectedConversation.context.type === 'booking' && <Calendar className="w-4 h-4 text-gray-500" />}
                      <span className="text-sm font-medium text-gray-700">
                        {selectedConversation.context.name}
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
                paddingTop: selectedConversation.context ? '140px' : '100px', // Space for header
                paddingBottom: attachments.length > 0 ? '140px' : '100px' // Space for input
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
                    const isMyMessage = message.sender_id === currentUserId;
                    const showDate = index === 0 || 
                      new Date(message.created_date).toDateString() !== 
                      new Date(messages[index - 1].created_date).toDateString();
                    
                    return (
                      <div key={message.id}>
                        {showDate && (
                          <div className="flex justify-center mb-4">
                            <div className="px-3 py-1 rounded-full text-xs text-gray-600"
                              style={{ backgroundColor: '#F8FAFF' }}>
                              {format(new Date(message.created_date), 'MMMM d, yyyy')}
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
                              {/* Business Context Badge */}
                              {message.businessContext && (
                                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${
                                  isMyMessage ? 'bg-white/20 text-white' : 'bg-white text-gray-700'
                                }`}>
                                  {message.businessContext.type === 'rfq' && 'Quote Request'}
                                  {message.businessContext.priority === 'high' && ' • High Priority'}
                                </div>
                              )}
                              
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
                                <span>{format(new Date(message.created_date), 'h:mm a')}</span>
                                {isMyMessage && (
                                  message.is_read ? 
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

            {/* Message Input - Fixed at bottom with proper height */}
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
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      placeholder={`Message ${otherUser.full_name}...`}
                      className="w-full px-3 py-2 pr-10 rounded-lg border bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 text-sm"
                      style={{ borderColor: '#E5E7EB', focusRingColor: '#4668AB' }}
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