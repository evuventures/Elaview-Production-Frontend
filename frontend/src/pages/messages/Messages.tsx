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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// Type assertion for JSX components
const TypedCard = Card as React.ComponentType<React.HTMLAttributes<HTMLDivElement>>;
const TypedCardContent = CardContent as React.ComponentType<React.HTMLAttributes<HTMLDivElement>>;

// Icons
import { 
  MessageSquare, ArrowLeft, MoreVertical, Send, Loader2, ShieldOff,
  Search, Plus, Phone, Video, Settings, Archive, Star, Bell,
  CheckCircle, Clock, User as UserIcon, Crown, Filter, MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
import { User, Conversation, ConversationMessage, MessageType } from '@/types/messages';

// Hardcoded mock data
const mockUsers: Record<string, User> = {
  'user1': { id: 'user1', full_name: 'Current User', profile_image: null },
  'user2': { id: 'user2', full_name: 'Sarah Johnson', profile_image: null },
  'user3': { id: 'user3', full_name: 'Mike Chen', profile_image: null },
  'user4': { id: 'user4', full_name: 'David Martinez', profile_image: null },
  'user5': { id: 'user5', full_name: 'Emily Carter', profile_image: null }
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
  },
  {
    id: 'conv_3',
    participant_ids: ['user1', 'user4'],
    lastMessage: 'Perfect! I\'ll send over the contract details.',
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24),
    unreadCount: 1
  },
  {
    id: 'conv_4',
    participant_ids: ['user1', 'user5'],
    lastMessage: 'Thank you for the quick response!',
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 48),
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
  },
  {
    id: 'msg3',
    sender_id: 'user1',
    recipient_id: 'user2',
    content: 'Hi Sarah! Thanks for your interest. Our rates start at $450/day for that location.',
    message_type: 'text',
    created_date: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    is_read: true
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
  const [showConversations, setShowConversations] = useState<boolean>(true);
  
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

  const filteredConversations = useMemo(() => {
    if (!searchTerm) return conversations;
    return conversations.filter(conversation => {
      const otherParticipantId = conversation.participant_ids.find(id => id !== 'user1');
      const otherParticipant = otherParticipantId ? allUsers[otherParticipantId] : null;
      return otherParticipant?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             conversation.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [conversations, searchTerm, allUsers]);

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
    setShowConversations(false); // Hide conversations on mobile when selecting
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

  const handleBackToConversations = () => {
    setShowConversations(true);
    setSelectedConversation(null);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 bg-teal-500 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-xl">
            <Loader2 className="w-8 h-8 md:w-10 md:h-10 animate-spin text-white" />
          </div>
          <p className="text-slate-600 font-semibold text-base md:text-lg">
            Loading authentication...
          </p>
        </div>
      </div>
    );
  }

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 bg-teal-500 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-xl">
            <MessageCircle className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <p className="text-slate-600 font-semibold text-base md:text-lg">
            Loading your conversations...
          </p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
        <div className="w-full max-w-4xl mx-auto">
          <div className="bg-white border border-slate-200 rounded-2xl md:rounded-3xl overflow-hidden shadow-xl p-8 md:p-12 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 bg-slate-200 rounded-2xl md:rounded-3xl flex items-center justify-center">
              <MessageSquare className="w-8 h-8 md:w-10 md:h-10 text-slate-500" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              Please sign in to view messages
            </h2>
            <p className="text-slate-600 text-lg">
              Access your conversations and connect with other users
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pt-16">
      <div className="h-[calc(100vh-4rem)] flex">
        
        {/* ✅ Left Sidebar: Conversations List (35%) */}
        <div className={`${showConversations ? 'w-full' : 'hidden'} md:w-[35%] md:block h-full border-r border-slate-200`}>
          
          {/* Header */}
          <div className="p-6 border-b border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Messages</h1>
                  <p className="text-sm text-slate-600">
                    {filteredConversations.length} conversations
                  </p>
                </div>
              </div>
              
              <Button 
                size="sm"
                className="bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-1" />
                New
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-2">
              {filteredConversations.map((conversation) => {
                const otherParticipantId = conversation.participant_ids.find(id => id !== 'user1');
                const otherParticipant = otherParticipantId ? allUsers[otherParticipantId] : null;
                const isSelected = selectedConversation?.id === conversation.id;
                
                return (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TypedCard 
                      onClick={() => handleSelectConversation(conversation)}
                      className={`cursor-pointer transition-all duration-300 rounded-xl border ${
                        isSelected 
                          ? 'bg-teal-50 ring-1 ring-teal-500 shadow-lg border-teal-200' 
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <TypedCardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div className="w-10 h-10 bg-slate-300 rounded-full flex items-center justify-center flex-shrink-0">
                            <UserIcon className="w-5 h-5 text-slate-600" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className={`font-semibold truncate ${
                                isSelected ? 'text-teal-700' : 'text-slate-900'
                              }`}>
                                {otherParticipant?.full_name || 'Unknown User'}
                              </h3>
                              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                {conversation.unreadCount > 0 && (
                                  <Badge variant="secondary" className="bg-teal-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] h-5">
                                    {conversation.unreadCount}
                                  </Badge>
                                )}
                                <span className="text-xs text-slate-500">
                                  {formatDistanceToNow(conversation.lastActivity, { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-sm text-slate-600 truncate">
                              {conversation.lastMessage}
                            </p>
                          </div>
                        </div>
                      </TypedCardContent>
                    </TypedCard>
                  </motion.div>
                );
              })}
            </div>
            
            {filteredConversations.length === 0 && (
              <div className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {searchTerm ? 'No conversations found' : 'No conversations yet'}
                </h3>
                <p className="text-slate-600">
                  {searchTerm ? 'Try a different search term' : 'Start a conversation to get started'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ✅ Right Panel: Messages (65%) */}
        <div className={`${showConversations ? 'hidden' : 'w-full'} md:w-[65%] md:block h-full flex flex-col bg-slate-25`}>
          {selectedConversation && otherUser ? (
            <>
              {/* Messages Header */}
              <div className="p-6 border-b border-slate-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBackToConversations}
                      className="md:hidden text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    
                    <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-slate-600" />
                    </div>
                    
                    <div>
                      <h2 className="font-semibold text-slate-900">{otherUser.full_name}</h2>
                      <p className="text-sm text-slate-600">Online now</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="text-center">
                        <Loader2 className="w-6 h-6 animate-spin text-teal-500 mx-auto mb-2" />
                        <p className="text-slate-600 text-sm">Loading messages...</p>
                      </div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="text-center">
                        <MessageCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No messages yet</h3>
                        <p className="text-slate-600">Start the conversation!</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const isMyMessage = msg.sender_id === 'user1';
                      const showTimestamp = index === 0 || 
                        (new Date(msg.created_date).getTime() - new Date(messages[index - 1].created_date).getTime()) > 300000; // 5 minutes
                      
                      return (
                        <div key={msg.id}>
                          {showTimestamp && (
                            <div className="flex justify-center mb-4">
                              <div className="bg-slate-200 px-3 py-1 rounded-full">
                                <span className="text-xs text-slate-600">
                                  {format(new Date(msg.created_date), 'MMM d, h:mm a')}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`flex w-full ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[70%] rounded-2xl p-4 ${
                              isMyMessage 
                                ? 'bg-teal-500 text-white rounded-br-sm' 
                                : 'bg-white text-slate-900 rounded-bl-sm border border-slate-200'
                            }`}>
                              <p className="text-sm leading-relaxed">{msg.content}</p>
                              {msg.isOptimistic && (
                                <div className="flex items-center gap-1 mt-2">
                                  <Clock className="w-3 h-3 text-teal-200" />
                                  <span className="text-xs text-teal-200">Sending...</span>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <div className="p-6 border-t border-slate-200 bg-white">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isSending || isBlockedByMe}
                        className="pr-12 py-3 bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-teal-500 focus:border-teal-500 rounded-xl"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || isSending || isBlockedByMe}
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg"
                      >
                        {isSending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                
                {isBlockingMe && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-2 text-red-600">
                      <ShieldOff className="w-4 h-4" />
                      <span className="text-sm">You cannot send messages to this user</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <div className="w-20 h-20 bg-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="w-10 h-10 text-slate-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Welcome to Messages</h3>
                <p className="text-slate-600 text-lg max-w-md">
                  Select a conversation from the sidebar to start chatting with other users
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;