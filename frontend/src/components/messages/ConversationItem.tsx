import React from 'react';
import { User, Conversation } from '@/types/messages';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface ConversationItemProps {
  conversation: Conversation;
  onSelect: (conversation: Conversation) => void;
  isSelected: boolean;
  currentUser: User | null;
  allUsers: Record<string, User>;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({ 
  conversation, 
  onSelect, 
  isSelected, 
  currentUser, 
  allUsers 
}) => {
  const otherUserId = conversation.participant_ids.find(id => id !== currentUser?.id);
  const otherUser = otherUserId ? allUsers[otherUserId] : undefined;

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
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-[hsl(var(--card))] shadow-sm bg-[hsl(var(--success))]" />
        </div>
    
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex justify-between items-center gap-2">
            <div className="truncate font-semibold text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors">
              {otherUser.full_name}
            </div>
            <div className="flex-shrink-0 text-xs text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] px-2 py-0.5 rounded-full">
              {formatDistanceToNow(new Date(conversation.last_activity || new Date()), { 
  addSuffix: true 
})}
            </div>
          </div>
    
          <div className="flex justify-between items-center gap-2">
            <div className="relative max-w-[180px]">
              <div className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed pr-2 line-clamp-1">
                {conversation.last_message?.content}
              </div>
              <div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-[hsl(var(--muted)/0.5)] to-transparent" />
            </div>
            {conversation.unread_count > 0 && (
              <Badge
                variant="default"
                className="bg-gradient-brand text-white border-0 rounded-full min-w-[20px] h-5 text-xs font-bold px-2 flex items-center justify-center shadow-sm"
              >
                {conversation.unread_count}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};