import React from 'react';
import { Message } from '@/types/messages';
import { format } from 'date-fns';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;  // This is the only boolean prop needed
  isOptimistic?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isCurrentUser,
  isOptimistic 
}) => {
  return (
    <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl flex flex-col shadow-sm transition-brand hover:shadow-md ${
      isCurrentUser
        ? 'bg-gradient-brand text-white rounded-br-md backdrop-blur-sm' 
        : 'card-brand text-[hsl(var(--card-foreground))] rounded-bl-md shadow-sm backdrop-blur-sm'
    }`}>
      <p className="text-sm whitespace-pre-wrap leading-relaxed">
        {message.content}
        {isOptimistic && <span className="opacity-50"> (sending...)</span>}
      </p>
      <div className={`text-xs mt-2 self-end font-medium ${
        isCurrentUser ? 'text-white/80' : 'text-[hsl(var(--muted-foreground))]'
      }`}>
        {format(new Date(message.created_date), 'HH:mm')}
      </div>
    </div>
  );
};