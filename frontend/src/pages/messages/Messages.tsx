import React, { useState, useEffect, useRef, useMemo } from 'react';
// REMOVE Base44 imports and replace with Clerk
import { useAuth, useUser } from '@clerk/clerk-react';
import { Invoice, Booking, AdvertisingArea, Property, Message } from '@/api/entities';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
const InputComponent = Input as any;
import { Button } from '@/components/ui/button';
const ButtonComponent = Button as any;
import { ScrollArea } from '@/components/ui/scroll-area';
const ScrollAreaComponent = ScrollArea as any;
import { Badge } from '@/components/ui/badge';
import { Send, Search, MessageSquare, MoreVertical, ShieldOff, ArrowLeft, Loader2, Info, CheckCircle, XCircle, PlayCircle, StopCircle, FileText, UserMinus, UserCheck, Sparkles, MessageCircleHeart, Zap } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
const DropdownMenuComponent = DropdownMenu as any;
const DropdownMenuContentComponent = DropdownMenuContent as any;
const DropdownMenuItemComponent = DropdownMenuItem as any;
const DropdownMenuTriggerComponent = DropdownMenuTrigger as any;
import { format, formatDistanceToNow } from 'date-fns';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import InvoiceModal from "@/components/invoices/InvoiceModal";
import BookingDetailsModal from "@/components/booking/BookingDetailsModal";

// Type definitions
interface User {
  id: string;
  full_name: string;
  profile_image: string | null;
}

interface ConversationMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  message_type: MessageType;
  created_date: string;
  is_read: boolean;
  isOptimistic?: boolean;
}

interface Conversation {
  id: string;
  participant_ids: string[];
  lastMessage: string;
  lastActivity: Date;
  unreadCount: number;
  messages?: ConversationMessage[];
  isNew?: boolean;
}

type MessageType = 
  | 'text' 
  | 'system' 
  | 'booking_request' 
  | 'booking_acknowledgment' 
  | 'booking_confirmed' 
  | 'booking_cancelled' 
  | 'campaign_start' 
  | 'campaign_end' 
  | 'payment_due' 
  | 'payment_received' 
  | 'invoice_created' 
  | 'user_blocked' 
  | 'user_unblocked' 
  | 'campaign_change_request' 
  | 'booking_change_approved' 
  | 'booking_change_denied';

interface ModalData {
  type: 'invoice' | 'booking' | null;
  data: any;
}

interface ConversationItemProps {
  conversation: Conversation;
  onSelect: (conversation: Conversation) => void;
  isSelected: boolean;
  currentUser: User | null;
  allUsers: Record<string, User>;
}

// Mock data for conversations since we don't have real backend yet
const mockConversations: Conversation[] = [
  {
    id: 'conv_1',
    participant_ids: ['user1', 'user2'],
    lastMessage: 'Hey, I\'m interested in your downtown billboard space.',
    lastActivity: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    unreadCount: 2,
    messages: []
  },
  {
    id: 'conv_2', 
    participant_ids: ['user1', 'user3'],
    lastMessage: 'The campaign looks great! When can we start?',
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    unreadCount: 0,
    messages: []
  }
];

const mockUsers: Record<string, User> = {
  'user1': { id: 'user1', full_name: 'Current User', profile_image: null },
  'user2': { id: 'user2', full_name: 'Sarah Johnson', profile_image: null },
  'user3': { id: 'user3', full_name: 'Mike Chen', profile_image: null }
};

const mockMessages: ConversationMessage[] = [
  {
    id: 'msg1',
    sender_id: 'user2',
    recipient_id: 'user1',
    content: 'Hey, I\'m interested in your downtown billboard space.',
    message_type: 'text',
    created_date: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    is_read: false
  },
  {
    id: 'msg2',
    sender_id: 'user2',
    recipient_id: 'user1', 
    content: 'What are your rates for a 2-week campaign?',
    message_type: 'text',
    created_date: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    is_read: false
  }
];

const ConversationItem: React.FC<ConversationItemProps> = ({ 
  conversation, 
  onSelect, 
  isSelected, 
  currentUser, 
  allUsers 
}) => {
    const otherUserId: string | undefined = conversation.participant_ids.find(id => id !== currentUser?.id);
    const otherUser: User | undefined = otherUserId ? allUsers[otherUserId] : undefined;

    if (!otherUser) return null;

    return (
      <button
      onClick={() => onSelect(conversation)}
      className={`w-full text-left p-4 rounded-2xl transition-transform group duration-150 ease-in-out ${
        isSelected
          ? 'bg-[hsl(var(--primary)/0.1)] border-2 border-[hsl(var(--primary)/0.3)] shadow-[var(--shadow-brand)]'
          : 'hover:bg-[hsl(var(--muted)/0.5)] border-2 border-transparent'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative shrink-0">
          <img
            src={
              otherUser.profile_image ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                otherUser.full_name
              )}&background=6169A7&color=fff&size=48`
            }
            alt={otherUser.full_name}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-[hsl(var(--border))] shadow-md"
          />
          {/* Online status dot */}
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-[hsl(var(--card))] shadow-sm bg-[hsl(var(--success))]" />
        </div>
    
        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Name + Time */}
          <div className="flex justify-between items-center gap-2">
            <div className="truncate font-semibold text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors">
              {otherUser.full_name}
            </div>
            <div className="flex-shrink-0 text-xs text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] px-2 py-0.5 rounded-full">
              {formatDistanceToNow(new Date(conversation.lastActivity), { addSuffix: true })}
            </div>
          </div>
    
          {/* Message + Unread count */}
          <div className="flex justify-between items-center gap-2">
            <div className="relative max-w-[180px]">
              <div className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed pr-2 line-clamp-1">
                {conversation.lastMessage}
              </div>
              {/* Optional: Add a subtle fade effect at the end */}
              <div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-[hsl(var(--muted)/0.5)] to-transparent" />
            </div>
            {conversation.unreadCount > 0 && (
              <Badge
                variant="default"
                className="bg-gradient-brand text-white border-0 rounded-full min-w-[20px] h-5 text-xs font-bold px-2 flex items-center justify-center shadow-sm"
              >
                {conversation.unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </button>
    );
};

export default function MessagesPage(): JSX.Element {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [allUsers, setAllUsers] = useState<Record<string, User>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [modalData, setModalData] = useState<ModalData>({ type: null, data: null });
  
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Use Clerk instead of Base44
  const { isSignedIn, isLoaded } = useAuth();
  const { user: currentUser } = useUser();
  
  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (isLoaded) {
      loadInitialData();
    }
  }, [isLoaded]);

  const otherUser: User | null = useMemo(() => {
    if (!selectedConversation || !currentUser) return null;
    const otherParticipantId: string | undefined = selectedConversation.participant_ids.find(id => id !== 'user1'); // Mock current user ID
    return otherParticipantId ? allUsers[otherParticipantId] || null : null;
  }, [selectedConversation, currentUser, allUsers]);

  const isBlockedByMe: boolean = useMemo(() => false, [currentUser, otherUser]); // Mock - no blocking for now
  const isBlockingMe: boolean = useMemo(() => false, [currentUser, otherUser]); // Mock - no blocking for now
  
  useEffect(() => {
    if (selectedConversation && !selectedConversation.isNew) {
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [selectedConversation?.id]);

  // Enhanced polling mechanism with more efficient interval
  useEffect(() => {
    if (!selectedConversation || selectedConversation.isNew || !currentUser) {
      return;
    }

    const intervalId: NodeJS.Timeout = setInterval(() => {
      loadMessages();
    }, 60000); // Poll every 60 seconds

    return () => clearInterval(intervalId);
  }, [selectedConversation?.id, currentUser]);

  const loadInitialData = async (): Promise<void> => {
    setIsPageLoading(true);
    try {
      if (!isSignedIn || !currentUser) {
        setIsPageLoading(false);
        return;
      }

      console.log('User signed in with Clerk:', currentUser.fullName || currentUser.firstName);

      // Use mock data for now (replace with real API calls later)
      setAllUsers(mockUsers);
      setConversations(mockConversations);
      
      const params = new URLSearchParams(location.search);
      const recipientId: string | null = params.get('recipient_id');
      
      if (recipientId && mockUsers[recipientId]) {
        const existingConversation: Conversation | undefined = mockConversations.find(c => 
          c.participant_ids.includes(recipientId)
        );
        
        if (existingConversation) {
          setSelectedConversation(existingConversation);
        } else {
          const newConversation: Conversation = {
            id: ['user1', recipientId].sort().join('_'),
            participant_ids: ['user1', recipientId],
            lastMessage: "Start a new conversation",
            lastActivity: new Date(),
            unreadCount: 0,
            isNew: true
          };
          setConversations(prev => [newConversation, ...prev]);
          setSelectedConversation(newConversation);
        }
        
        navigate(createPageUrl('Messages'), { replace: true });
      } else if (mockConversations.length > 0) {
        setSelectedConversation(mockConversations[0]);
      }
      
    } catch (error) { 
      console.error('Error loading conversations:', error); 
    }
    setIsPageLoading(false);
  };
  
  const handleSelectConversation = (conversation: Conversation): void => {
    setSelectedConversation(conversation);
    if (location.search) navigate(createPageUrl('Messages'), { replace: true });
  };

  const loadMessages = async (): Promise<void> => {
    if (!selectedConversation || !currentUser) {
      console.log('Cannot load messages - missing conversation or user');
      return;
    }
    
    const otherUserId: string | undefined = selectedConversation.participant_ids.find(id => id !== 'user1'); // Mock current user ID
    if (!otherUserId) {
      console.log('Cannot find other user ID');
      return;
    }

    console.log('Loading messages between user1 and', otherUserId);
    setIsLoading(true);
    
    try {
      // Use mock messages for now (replace with real API calls later)
      const conversationMessages: ConversationMessage[] = mockMessages.filter(msg => {
        const sentByMe: boolean = msg.sender_id === 'user1' && msg.recipient_id === otherUserId;
        const sentToMe: boolean = msg.sender_id === otherUserId && msg.recipient_id === 'user1';
        
        return sentByMe || sentToMe;
      });
      
      console.log('Mock conversation messages:', conversationMessages.length);
      
      const sortedMessages: ConversationMessage[] = conversationMessages.sort((a, b) => 
        new Date(a.created_date).getTime() - new Date(b.created_date).getTime()
      );
      
      console.log('Final visible messages:', sortedMessages.length);
      setMessages(sortedMessages);
      
      // Mock marking messages as read
      setConversations(prevConversations => 
        prevConversations.map(c => 
          c.id === selectedConversation.id ? { ...c, unreadCount: 0 } : c
        )
      );
    } catch (error) { 
      console.error('Error loading messages:', error); 
    }
    setIsLoading(false);
  };

  const handleSendMessage = async (): Promise<void> => {
    if (!newMessage.trim() || !otherUser) return;
    
    const messageContent: string = newMessage.trim();
    
    const optimisticMessage: ConversationMessage = {
        id: `optimistic-${Date.now()}`,
        sender_id: 'user1', // Mock current user ID
        recipient_id: otherUser.id,
        content: messageContent,
        message_type: 'text',
        created_date: new Date().toISOString(),
        is_read: false,
        isOptimistic: true
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');
    setIsSending(true);

    try {
      // Mock sending message (replace with real API call later)
      console.log('Mock: Sending message:', messageContent);
      
      const sentMessage: ConversationMessage = {
        ...optimisticMessage,
        id: `msg_${Date.now()}`,
        isOptimistic: false
      };
      
      setMessages(prev => prev.map(m => m.id === optimisticMessage.id ? sentMessage : m));
      
      setConversations(prev => {
        const updatedConvo: Conversation = {
          ...selectedConversation!,
          lastMessage: sentMessage.content,
          lastActivity: new Date(sentMessage.created_date),
          isNew: false
        };

        setSelectedConversation(updatedConvo);

        const otherConvos: Conversation[] = prev.filter(c => c.id !== selectedConversation!.id);
        return [updatedConvo, ...otherConvos].sort((a,b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
      });

    } catch(err) {
      console.error("Error sending message:", err);
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
      setNewMessage(messageContent);
    } finally {
      setIsSending(false);
    }
  };
  
  const getMessageIcon = (type: MessageType): JSX.Element => {
    const iconMap: Record<MessageType, JSX.Element> = {
        text: <Info className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />,
        system: <Info className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />,
        booking_request: <Info className="w-5 h-5 text-[hsl(var(--primary))]" />,
        booking_acknowledgment: <CheckCircle className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />,
        booking_confirmed: <CheckCircle className="w-5 h-5 text-[hsl(var(--success))]" />,
        booking_cancelled: <XCircle className="w-5 h-5 text-[hsl(var(--destructive))]" />,
        campaign_start: <PlayCircle className="w-5 h-5 text-[hsl(var(--success))]" />,
        campaign_end: <StopCircle className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />,
        payment_due: <FileText className="w-5 h-5 text-[hsl(var(--warning))]" />,
        invoice_created: <FileText className="w-5 h-5 text-[hsl(var(--warning))]" />,
        payment_received: <CheckCircle className="w-5 h-5 text-[hsl(var(--success))]" />,
        user_blocked: <UserMinus className="w-5 h-5 text-[hsl(var(--destructive))]" />,
        user_unblocked: <UserCheck className="w-5 h-5 text-[hsl(var(--success))]" />,
        campaign_change_request: <Info className="w-5 h-5 text-[hsl(var(--primary))]" />,
        booking_change_approved: <CheckCircle className="w-5 h-5 text-[hsl(var(--success))]" />,
        booking_change_denied: <XCircle className="w-5 h-5 text-[hsl(var(--destructive))]" />
    };
    return iconMap[type] || iconMap.system;
  };
  
  const getMessageStyle = (type: MessageType): string => {
    const baseStyle = "w-full max-w-md text-left p-4 rounded-2xl border-2 my-3 backdrop-blur-sm transition-brand hover:shadow-lg";
    const styleMap: Record<MessageType, string> = {
        text: 'bg-[hsl(var(--muted)/0.3)] border-[hsl(var(--border))] text-[hsl(var(--foreground))]',
        system: 'bg-[hsl(var(--muted)/0.3)] border-[hsl(var(--border))] text-[hsl(var(--foreground))]',
        booking_request: 'bg-[hsl(var(--primary)/0.1)] border-[hsl(var(--primary)/0.3)] text-[hsl(var(--primary))]',
        booking_acknowledgment: 'bg-[hsl(var(--muted)/0.3)] border-[hsl(var(--border))] text-[hsl(var(--foreground))]',
        booking_confirmed: 'bg-[hsl(var(--success)/0.1)] border-[hsl(var(--success)/0.3)] text-[hsl(var(--success))]',
        booking_cancelled: 'bg-[hsl(var(--destructive)/0.1)] border-[hsl(var(--destructive)/0.3)] text-[hsl(var(--destructive))]',
        campaign_start: 'bg-[hsl(var(--success)/0.1)] border-[hsl(var(--success)/0.3)] text-[hsl(var(--success))]',
        campaign_end: 'bg-[hsl(var(--muted)/0.3)] border-[hsl(var(--border))] text-[hsl(var(--foreground))]',
        payment_due: 'bg-[hsl(var(--warning)/0.1)] border-[hsl(var(--warning)/0.3)] text-[hsl(var(--warning))]',
        payment_received: 'bg-[hsl(var(--success)/0.1)] border-[hsl(var(--success)/0.3)] text-[hsl(var(--success))]',
        invoice_created: 'bg-[hsl(var(--warning)/0.1)] border-[hsl(var(--warning)/0.3)] text-[hsl(var(--warning))]',
        user_blocked: 'bg-[hsl(var(--destructive)/0.1)] border-[hsl(var(--destructive)/0.3)] text-[hsl(var(--destructive))]',
        user_unblocked: 'bg-[hsl(var(--success)/0.1)] border-[hsl(var(--success)/0.3)] text-[hsl(var(--success))]',
        campaign_change_request: 'bg-[hsl(var(--primary)/0.1)] border-[hsl(var(--primary)/0.3)] text-[hsl(var(--primary))]',
        booking_change_approved: 'bg-[hsl(var(--success)/0.1)] border-[hsl(var(--success)/0.3)] text-[hsl(var(--success))]',
        booking_change_denied: 'bg-[hsl(var(--destructive)/0.1)] border-[hsl(var(--destructive)/0.3)] text-[hsl(var(--destructive))]'
    };
    return `${baseStyle} ${styleMap[type] || styleMap.system}`;
  };

  const handleSystemMessageClick = async (message: ConversationMessage): Promise<void> => {
    console.log('Mock: System message clicked', message);
    // Mock system message handling (replace with real API calls later)
  };

  const handleInvoiceModalPayment = async (invoiceId: string, paymentData: any): Promise<void> => {
    console.log('Mock: Invoice payment', invoiceId, paymentData);
    // Mock invoice payment (replace with real API calls later)
  };

  const handleApproveChangeRequest = async (message: ConversationMessage): Promise<void> => {
    console.log('Mock: Approve change request', message);
    // Mock change request approval (replace with real API calls later)
  };

  const handleDenyChangeRequest = async (message: ConversationMessage): Promise<void> => {
    console.log('Mock: Deny change request', message);
    // Mock change request denial (replace with real API calls later)
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setNewMessage(e.target.value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  if (!isLoaded) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[hsl(var(--background))]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-brand rounded-2xl flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
          <div className="text-[hsl(var(--muted-foreground))] font-medium">Loading authentication...</div>
        </div>
      </div>
    );
  }

  if (isPageLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[hsl(var(--background))]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-brand rounded-2xl flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
          <div className="text-[hsl(var(--muted-foreground))] font-medium">Loading your conversations...</div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[hsl(var(--background))]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-brand rounded-2xl flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <div className="text-[hsl(var(--muted-foreground))] font-medium">Please sign in to view messages</div>
        </div>
      </div>
    );
  }
  
  const filteredConversations: Conversation[] = conversations.filter(c => {
    if (!currentUser || !allUsers) return false;

    const otherUserId: string | undefined = c.participant_ids.find(id => id !== 'user1'); // Mock current user ID
    const user: User | undefined = otherUserId ? allUsers[otherUserId] : undefined;
    return user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
  });

  return (
    <div className="h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] flex flex-col md:flex-row">
        {/* Enhanced Sidebar */}
        <div className={`
            ${selectedConversation && 'hidden md:flex'} w-full md:w-96
            flex-col glass border-r border-[hsl(var(--border))]
        `}>
            <div className="p-6 border-b border-[hsl(var(--border))] glass-strong">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-brand rounded-2xl flex items-center justify-center shadow-[var(--shadow-brand)]">
                        <MessageCircleHeart className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gradient-brand">
                        Messages
                    </h1>
                </div>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--primary))]" />
                    <InputComponent 
                        placeholder="Search contacts..." 
                        className="pl-12 bg-[hsl(var(--card)/0.7)] border-[hsl(var(--border))] rounded-2xl backdrop-blur-sm focus-brand transition-brand"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>
            <ScrollAreaComponent className="flex-1 p-4">
                {filteredConversations.length > 0 ? (
                    <div className="space-y-2">
                        {filteredConversations.map(convo => (
                            <ConversationItem
                                key={convo.id}
                                conversation={convo}
                                onSelect={handleSelectConversation}
                                isSelected={selectedConversation?.id === convo.id}
                                currentUser={{ id: 'user1', full_name: 'Current User', profile_image: null }} // Mock current user
                                allUsers={allUsers}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-8 text-[hsl(var(--muted-foreground))]">
                        <div className="w-20 h-20 mx-auto mb-4 bg-[hsl(var(--muted))] rounded-2xl flex items-center justify-center">
                            <MessageSquare className="w-10 h-10 text-[hsl(var(--primary))]" />
                        </div>
                        {/* ✅ FIXED: Changed from <p> to <div> */}
                        <div className="font-semibold">No conversations found.</div>
                        <div className="text-sm mt-2">Start a conversation from a property details page.</div>
                    </div>
                )}
            </ScrollAreaComponent>
        </div>

      {/* Enhanced Chat Area */}
      <div className={`flex-1 flex flex-col bg-[hsl(var(--card)/0.3)] ${!selectedConversation && 'hidden md:flex'}`}>
        {selectedConversation && otherUser ? (
          <>
            {/* Enhanced Chat Header */}
            <div className="p-6 border-b border-[hsl(var(--border))] glass-strong flex justify-between items-center">
              <div className="flex items-center gap-4">
                <ButtonComponent variant="ghost" size="icon" className="md:hidden rounded-full hover:bg-[hsl(var(--muted))]" onClick={() => setSelectedConversation(null)}>
                    <ArrowLeft className="w-5 h-5" />
                </ButtonComponent>
                <div className="relative">
                    <img 
                        src={otherUser.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.full_name)}&background=6169A7&color=fff&size=40`}
                        alt={otherUser.full_name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-[hsl(var(--border))] shadow-md"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[hsl(var(--success))] rounded-full border-2 border-[hsl(var(--card))] shadow-sm"></div>
                </div>
                <div>
                    <h2 className="font-bold text-lg text-[hsl(var(--foreground))]">{otherUser.full_name}</h2>
                    {/* ✅ FIXED: Changed from <p> to <div> */}
                    <div className="text-sm text-[hsl(var(--success))] font-medium flex items-center gap-1">
                        <div className="w-2 h-2 bg-[hsl(var(--success))] rounded-full animate-pulse"></div>
                        Online
                    </div>
                </div>
              </div>
              <DropdownMenuComponent>
                <DropdownMenuTriggerComponent asChild>
                    <ButtonComponent variant="ghost" size="icon" className="rounded-full hover:bg-[hsl(var(--muted))]">
                        <MoreVertical className="w-5 h-5" />
                    </ButtonComponent>
                </DropdownMenuTriggerComponent>
                <DropdownMenuContentComponent className="glass-strong border-[hsl(var(--border))] rounded-2xl">
                    <DropdownMenuItemComponent className="rounded-xl">View Profile</DropdownMenuItemComponent>
                    <DropdownMenuItemComponent className="text-[hsl(var(--destructive))] rounded-xl">
                      {isBlockedByMe ? 'Unblock User' : 'Block User'}
                    </DropdownMenuItemComponent>
                </DropdownMenuContentComponent>
              </DropdownMenuComponent>
            </div>

            {/* Enhanced Messages */}
            <ScrollAreaComponent className="flex-1 p-6 pb-20 md:pb-6">
              <div className="space-y-4">
                {isLoading ? (
                    <div className="flex justify-center p-8">
                        <div className="w-12 h-12 bg-gradient-brand rounded-2xl flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-white" />
                        </div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
                        <div className="w-20 h-20 mx-auto mb-4 bg-[hsl(var(--muted))] rounded-2xl flex items-center justify-center">
                            <MessageSquare className="w-10 h-10 text-[hsl(var(--primary))]" />
                        </div>
                        {/* ✅ FIXED: Changed from <p> to <div> */}
                        <div className="font-semibold text-lg">No messages yet</div>
                        <div className="text-sm">Start the conversation!</div>
                    </div>
                ) : (
                    messages.map(msg => {
                      const systemMessageTypes: MessageType[] = ['system', 'booking_request', 'booking_acknowledgment', 'booking_confirmed', 'booking_cancelled', 'campaign_start', 'campaign_end', 'payment_due', 'payment_received', 'invoice_created', 'user_blocked', 'user_unblocked', 'campaign_change_request', 'booking_change_approved', 'booking_change_denied'];
                      const isSystemMessage: boolean = systemMessageTypes.includes(msg.message_type);
                      
                      if (isSystemMessage) {
                        return (
                          <div key={msg.id} className="flex justify-center">
                            <div className={`${getMessageStyle(msg.message_type)} shadow-[var(--shadow-brand)]`}>
                              <div className="flex items-start gap-4">
                                <span className="text-lg flex-shrink-0 mt-1 p-2 bg-[hsl(var(--card)/0.7)] rounded-full">
                                  {getMessageIcon(msg.message_type)}
                                </span>
                                <div className="flex-1">
                                  {/* ✅ FIXED: Changed from <p> to <div> */}
                                  <div className="text-sm font-semibold whitespace-pre-line leading-relaxed">{msg.content}</div>
                                  <div className="text-xs opacity-80 mt-2 font-medium">
                                    {format(new Date(msg.created_date), 'MMM d, yyyy HH:mm')}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      const isMyMessage: boolean = msg.sender_id === 'user1'; // Mock current user ID
                      
                      return (
                        <div key={msg.id} className={`flex w-full ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl flex flex-col shadow-sm transition-brand hover:shadow-md ${
                            isMyMessage
                              ? 'bg-gradient-brand text-white rounded-br-md backdrop-blur-sm' 
                              : 'card-brand text-[hsl(var(--card-foreground))] rounded-bl-md shadow-sm backdrop-blur-sm'
                          }`}>
                            {/* ✅ KEPT: This is actual message content, so <p> is appropriate */}
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                            {/* ✅ FIXED: Changed from <p> to <div> */}
                            <div className={`text-xs mt-2 self-end font-medium ${isMyMessage ? 'text-white/80' : 'text-[hsl(var(--muted-foreground))]'}`}>
                              {format(new Date(msg.created_date), 'HH:mm')}
                            </div>
                          </div>
                        </div>
                      );
                    })
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollAreaComponent>

            {/* Enhanced Message Input */}
            <div className="p-6 glass-strong border-t border-[hsl(var(--border))] pb-20 md:pb-6">
              {isBlockingMe ? (
                  <div className="text-center text-sm text-[hsl(var(--muted-foreground))] p-4 bg-[hsl(var(--destructive)/0.1)] rounded-2xl border border-[hsl(var(--destructive))]">
                    <ShieldOff className="w-6 h-6 mx-auto mb-3 text-[hsl(var(--destructive))]" />
                    {/* ✅ FIXED: Changed from <p> to <div> */}
                    <div className="font-medium">You cannot reply to this conversation.</div>
                  </div>
              ) : (
                <div className="flex items-center gap-3">
                  <InputComponent 
                      placeholder="Type your message..."
                      className="flex-1 bg-[hsl(var(--card)/0.7)] border-[hsl(var(--border))] rounded-2xl px-4 py-3 backdrop-blur-sm focus-brand transition-brand"
                      value={newMessage}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      disabled={isSending || isBlockedByMe}
                  />
                  <ButtonComponent 
                      onClick={handleSendMessage}
                      disabled={isSending || !newMessage.trim() || isBlockedByMe}
                      className="btn-gradient rounded-2xl px-6 py-3 shadow-[var(--shadow-brand)] hover:shadow-[var(--shadow-brand-lg)] transition-brand disabled:opacity-50"
                  >
                      {isSending ? (
                          <Loader2 className="w-5 h-5 animate-spin"/>
                      ) : (
                          <Send className="w-5 h-5"/>
                      )}
                  </ButtonComponent>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center text-[hsl(var(--muted-foreground))] p-8">
            <div>
              <div className="w-24 h-24 mx-auto mb-6 bg-[hsl(var(--muted))] rounded-3xl flex items-center justify-center">
                <MessageSquare className="w-12 h-12 text-[hsl(var(--primary))]" />
              </div>
              <h3 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-3 text-gradient-brand">
                Welcome to Elaview Messages
              </h3>
              {/* ✅ FIXED: Changed from <p> to <div> */}
              <div className="text-lg max-w-md mx-auto leading-relaxed">Select a conversation to start chatting with property owners and advertisers</div>
            </div>
          </div>
        )}
      </div>

      {modalData.type === 'invoice' && (
        <div className="text-center p-4">
          <div>Invoice modal would open here (mock data)</div>
          <ButtonComponent onClick={() => setModalData({ type: null, data: null })}>Close</ButtonComponent>
        </div>
      )}

      {modalData.type === 'booking' && (
        <div className="text-center p-4">
          <div>Booking modal would open here (mock data)</div>
          <ButtonComponent onClick={() => setModalData({ type: null, data: null })}>Close</ButtonComponent>
        </div>
      )}
    </div>
  );
}