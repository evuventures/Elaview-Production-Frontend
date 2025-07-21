import React from 'react';
import { Conversation, User } from '@/types/messages';
import { ConversationItem } from './ConversationItem';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, MessageSquare, MessageCircleHeart } from 'lucide-react';

interface MessagesSidebarProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  currentUser: User | null;
  allUsers: Record<string, User>;
  searchTerm: string;
  onSelectConversation: (conversation: Conversation) => void;
  onSearchChange: (term: string) => void;
}

export const MessagesSidebar: React.FC<MessagesSidebarProps> = ({
  conversations,
  selectedConversation,
  currentUser,
  allUsers,
  searchTerm,
  onSelectConversation,
  onSearchChange
}) => {
  const filteredConversations = conversations.filter(c => {
    if (!currentUser || !allUsers) return false;
    const otherUserId = c.participant_ids.find(id => id !== 'user1');
    const user = otherUserId ? allUsers[otherUserId] : undefined;
    return user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
  });

  return (
    <div className="w-full md:w-96 flex-col glass border-r border-[hsl(var(--border))]">
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
          <Input 
            placeholder="Search contacts..." 
            className="pl-12 bg-[hsl(var(--card)/0.7)] border-[hsl(var(--border))] rounded-2xl backdrop-blur-sm focus-brand transition-brand"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="flex-1 p-4">
        {filteredConversations.length > 0 ? (
          <div className="space-y-2">
            {filteredConversations.map(convo => (
              <ConversationItem
                key={convo.id}
                conversation={convo}
                onSelect={onSelectConversation}
                isSelected={selectedConversation?.id === convo.id}
                currentUser={{ id: 'user1', full_name: 'Current User', profile_image: null }}
                allUsers={allUsers}
              />
            ))}
          </div>
        ) : (
          <div className="text-center p-8 text-[hsl(var(--muted-foreground))]">
            <div className="w-20 h-20 mx-auto mb-4 bg-[hsl(var(--muted))] rounded-2xl flex items-center justify-center">
              <MessageSquare className="w-10 h-10 text-[hsl(var(--primary))]" />
            </div>
            <div className="font-semibold">No conversations found.</div>
            <div className="text-sm mt-2">Start a conversation from a property details page.</div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};