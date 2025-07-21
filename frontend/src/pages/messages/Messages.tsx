import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { createPageUrl } from '@/utils';

// Components
import { MessagesSidebar } from '@/components/messages/MessagesSidebar';
import { MessagesHeader } from '@/components/messages/MessagesHeader';
import { MessageBubble } from '@/components/messages/MessageBubble';
import { SystemMessage } from '@/components/messages/SystemMessage';
import { MessageInput } from '@/components/messages/MessageInput';
import { LoadingState } from '@/components/messages/LoadingState';
import { EmptyState } from '@/components/messages/EmptyState';

// UI Components
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

// Icons
import { MessageSquare, ArrowLeft, MoreVertical, Send, Loader2, ShieldOff } from 'lucide-react';

// Types
import { User, Conversation, ConversationMessage, MessageType } from '@/types/messages';

// Hardcoded mock data
const mockUsers: Record<string, User> = {
  'user1': { id: 'user1', full_name: 'Current User', profile_image: null },
  'user2': { id: 'user2', full_name: 'Sarah Johnson', profile_image: null },
  'user3': { id: 'user3', full_name: 'Mike Chen', profile_image: null }
};

const mockConversations: Conversation[] = [
  {
    id: 'conv_1',
    participant_ids: ['user1', 'user2'],
    lastMessage: 'Hey, I\'m interested in your downtown billboard space.',
    lastActivity: new Date(Date.now() - 1000 * 60 * 30),
    unreadCount: 2
  },
  {
    id: 'conv_2', 
    participant_ids: ['user1', 'user3'],
    lastMessage: 'The campaign looks great! When can we start?',
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2),
    unreadCount: 0
  }
];

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

const MessagesPage: React.FC = () => {
  // State management
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [allUsers, setAllUsers] = useState<Record<string, User>>(mockUsers);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isSignedIn, isLoaded } = useAuth();
  const { user: currentUser } = useUser();

  // Derived state
  const otherUser = useMemo(() => {
    if (!selectedConversation || !currentUser) return null;
    const otherParticipantId = selectedConversation.participant_ids.find(id => id !== currentUser.id);
    return otherParticipantId ? allUsers[otherParticipantId] || null : null;
  }, [selectedConversation, currentUser, allUsers]);

  const isBlockedByMe = useMemo(() => false, [currentUser, otherUser]);
  const isBlockingMe = useMemo(() => false, [currentUser, otherUser]);

  // Effects
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isLoaded) {
      loadInitialData();
    }
  }, [isLoaded]);

  useEffect(() => {
    if (selectedConversation && !selectedConversation.isNew) {
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [selectedConversation?.id]);

  // Handlers
  const loadInitialData = async () => {
    setIsPageLoading(true);
    try {
      if (!isSignedIn || !currentUser) {
        setIsPageLoading(false);
        return;
      }

      // In a real app, you would fetch data here
      setAllUsers(mockUsers);
      setConversations(mockConversations);
      
      const params = new URLSearchParams(location.search);
      const recipientId = params.get('recipient_id');
      
      if (recipientId && mockUsers[recipientId]) {
        const existingConversation = mockConversations.find(c => 
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

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    if (location.search) navigate(createPageUrl('Messages'), { replace: true });
  };

  const loadMessages = async () => {
    if (!selectedConversation || !currentUser) return;
    
    const otherUserId = selectedConversation.participant_ids.find(id => id !== 'user1');
    if (!otherUserId) return;

    setIsLoading(true);
    
    try {
      const conversationMessages = mockMessages.filter(msg => {
        const sentByMe = msg.sender_id === 'user1' && msg.recipient_id === otherUserId;
        const sentToMe = msg.sender_id === otherUserId && msg.recipient_id === 'user1';
        return sentByMe || sentToMe;
      });
      
      const sortedMessages = conversationMessages.sort((a, b) => 
        new Date(a.created_date).getTime() - new Date(b.created_date).getTime()
      );
      
      setMessages(sortedMessages);
      
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

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !otherUser) return;
    
    const messageContent = newMessage.trim();
    const optimisticMessage: ConversationMessage = {
      id: `optimistic-${Date.now()}`,
      sender_id: 'user1',
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
      // In a real app, you would send to API here
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

        const otherConvos = prev.filter(c => c.id !== selectedConversation!.id);
        return [updatedConvo, ...otherConvos].sort((a,b) => 
          new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
        );
      });
    } catch(err) {
      console.error("Error sending message:", err);
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
      setNewMessage(messageContent);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  if (!isLoaded) {
    return <LoadingState message="Loading authentication..." />;
  }

  if (isPageLoading) {
    return <LoadingState message="Loading your conversations..." />;
  }

  if (!isSignedIn) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-background">
        <EmptyState 
          title="Please sign in to view messages" 
          description=""
          // icon={<MessageSquare className="w-8 h-8 text-primary" />}
        />
      </div>
    );
  }

  return (
    <div className="h-screen bg-background text-foreground flex flex-col md:flex-row">
      <MessagesSidebar
        conversations={conversations}
        selectedConversation={selectedConversation}
        onSelectConversation={handleSelectConversation}
        currentUser={{ id: 'user1', full_name: 'Current User', profile_image: null }}
        allUsers={allUsers}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <div className={`flex-1 flex flex-col bg-card/30 ${!selectedConversation && 'hidden md:flex'}`}>
        {selectedConversation && otherUser ? (
          <>
            <MessagesHeader
              otherUser={otherUser}
              isBlockedByMe={isBlockedByMe}
              isBlockingMe={isBlockingMe}
              onBack={() => setSelectedConversation(null)}
            />

            <ScrollArea className="flex-1 p-6 pb-20 md:pb-6">
              <div className="space-y-4">
                {isLoading ? (
                  <LoadingState message="Loading messages..." />
                ) : messages.length === 0 ? (
                  <EmptyState 
                    title="No messages yet" 
                    description="Start the conversation!" 
                  />
                ) : (
                  messages.map(msg => {
                    const systemMessageTypes: MessageType[] = [
                      'system', 'booking_request', 'booking_confirmed',
                      'booking_cancelled', 'campaign_start', 'campaign_end',
                      'payment_due', 'payment_received', 'invoice_created',
                      'user_blocked', 'user_unblocked'
                    ];
                    const isSystemMessage = systemMessageTypes.includes(msg.message_type);
                    
                    if (isSystemMessage) {
                      return (
                        <div key={msg.id} className="flex justify-center">
                          <SystemMessage 
                            message={msg}
                            onClick={() => console.log('System message clicked')}
                          />
                        </div>
                      );
                    }

                    const isMyMessage = msg.sender_id === 'user1';
                    
                    return (
                      <div key={msg.id} className={`flex w-full ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                        <MessageBubble 
                          message={msg}
                          isMyMessage={isMyMessage}
                        />
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-6 border-t border-border pb-20 md:pb-6">
              <MessageInput
                value={newMessage}
                disabled={isSending || isBlockedByMe}
                isSending={isSending}
                isBlocked={isBlockingMe}
                onChange={setNewMessage}
                onSend={handleSendMessage}
                onKeyPress={handleKeyPress}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center text-muted-foreground p-8">
            <EmptyState 
              title="Welcome to Messages"
              description="Select a conversation to start chatting"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;