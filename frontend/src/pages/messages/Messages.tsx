import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

// Components
import { MessageBubble } from '@/components/messages/MessageBubble';
import { MessageInput } from '@/components/messages/MessageInput';
import { MessagesHeader } from '@/components/messages/MessagesHeader';
import { LoadingState } from '@/components/messages/LoadingState';
import { EmptyState } from '@/components/messages/EmptyState';

// UI Components
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Icons
import { 
  MessageSquare, User as UserIcon, Search, Plus, Loader
} from 'lucide-react';

// Types
import type { Conversation, Message, User } from '@/types/messages';

interface ConversationListItem extends Conversation {
  participants: User[];
  last_activity: string;
  unread_count: number;
}

const MessagesPage = () => {
  // Authentication
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user: currentUser } = useUser();
  
  // Routing
  const { conversationId } = useParams();
  const navigate = useNavigate();
  
  // State
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationListItem | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    if (!searchTerm) return conversations;
  
    return conversations.filter(conversation => {
      const otherParticipant = conversation.participants?.find(
        p => p.id !== currentUser?.id
      );
  
      return (
        otherParticipant?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conversation.last_message?.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        false
      );
    });
  }, [conversations, searchTerm, currentUser?.id]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!isSignedIn) return;
    
    setIsLoading(true);
    try {
      const token = await getToken();
      const response = await fetch('/api/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch conversations');
      
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, getToken]);

  // Fetch messages
  const fetchMessages = useCallback(async (id: string) => {
    if (!isSignedIn || !id) return;
    
    setIsLoading(true);
    try {
      const token = await getToken();
      const response = await fetch(`/api/conversations/${id}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch messages');
      
      const data: Message[] = await response.json();
      setMessages(data);
      
      // Find and set the conversation and other user
      const conv = conversations.find(c => c.id === id);
      if (conv) {
        setSelectedConversation(conv);
        const other = conv.participants.find(p => p.id !== currentUser?.id);
        setOtherUser(other || null);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, [conversations, currentUser?.id, isSignedIn, getToken]);

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUser) return;
    
    const tempId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      id: tempId,
      sender_id: currentUser.id,
      recipient_id: selectedConversation.participants.find(p => p.id !== currentUser.id)?.id || '',
      content: newMessage.trim(),
      created_date: new Date().toISOString(),
      is_read: false,
      isOptimistic: true,
      message_type: 'text'
    };
  
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    setIsSending(true);
  
    try {
      const token = await getToken();
      const response = await fetch(`/api/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: newMessage.trim() })
      });
  
      if (!response.ok) throw new Error('Failed to send message');
      
      const sentMessage = await response.json();
      setMessages(prev => prev.map(m => m.id === tempId ? sentMessage : m));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setIsSending(false);
    }
  };

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial load
  useEffect(() => {
    if (!isLoaded) return;
    
    if (!isSignedIn) {
      navigate('/sign-in');
      return;
    }
    
    fetchConversations();
    
    if (conversationId) {
      fetchMessages(conversationId);
      setShowSidebar(false);
    }
  }, [isLoaded, isSignedIn, conversationId, fetchConversations, fetchMessages, navigate]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${showSidebar ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-96 border-r bg-white`}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Messages</h1>
            <Button variant="ghost" size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          {isLoading ? (
            <LoadingState />
          ) : filteredConversations.length === 0 ? (
            <EmptyState 
              title={searchTerm ? "No matches" : "No conversations"}
              description={searchTerm ? "Try different search" : "Start a new chat"}
            />
          ) : (
            <div className="divide-y">
              {filteredConversations.map(conversation => (
                <div
                  key={conversation.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    navigate(`/messages/${conversation.id}`);
                    setShowSidebar(false);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {conversation.participants.find(p => p.id !== currentUser?.id)?.profile_image ? (
                        <img 
                          src={conversation.participants.find(p => p.id !== currentUser?.id)?.profile_image || ''}
                          className="w-10 h-10 rounded-full"
                          alt="Profile"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-medium truncate">
                          {conversation.participants.find(p => p.id !== currentUser?.id)?.full_name || 'Unknown'}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(conversation.last_activity || Date.now()))}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.last_message?.content || 'No message'}
                      </p>
                    </div>
                    {conversation.unread_count > 0 && (
                      <div className="ml-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {conversation.unread_count}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className={`${!showSidebar ? 'flex' : 'hidden'} md:flex flex-col flex-1`}>
        {selectedConversation ? (
          <>
            <MessagesHeader
              currentUser={currentUser as User | null}
              otherUser={otherUser}
              onBack={() => setShowSidebar(true)}
              conversation={selectedConversation}
            />
            
            <ScrollArea className="flex-1 p-4">
              {isLoading ? (
                <LoadingState />
              ) : messages.length === 0 ? (
                <EmptyState
                  icon={<MessageSquare className="w-8 h-8" />}
                  title="No messages yet"
                  description="Send a message to start the conversation"
                />
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    const isCurrentUser = message.sender_id === currentUser?.id;
                    const showDate = index === 0 || 
                      new Date(message.created_date).getDate() !== 
                      new Date(messages[index - 1].created_date).getDate();
                    
                    return (
                      <React.Fragment key={message.id}>
                        {showDate && (
                          <div className="flex justify-center my-4">
                            <div className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-500">
                              {format(new Date(message.created_date), 'MMMM d, yyyy')}
                            </div>
                          </div>
                        )}
                        <MessageBubble
                          message={message}
                          isCurrentUser={isCurrentUser}
                          isOptimistic={!!message.isOptimistic}
                        />
                      </React.Fragment>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>
            
            <div className="p-4 border-t">
              <MessageInput
                value={newMessage}
                onChange={setNewMessage}
                onSend={sendMessage}
                onKeyPress={handleKeyDown}
                disabled={isSending || isBlocked}
                isSending={isSending}
                isBlocked={isBlocked}
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <MessageSquare className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Select a conversation</h3>
            <p className="text-gray-500 text-center max-w-md">
              Choose an existing conversation or start a new one
            </p>
            <Button 
              className="mt-4 md:hidden" 
              onClick={() => setShowSidebar(true)}
            >
              View conversations
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;