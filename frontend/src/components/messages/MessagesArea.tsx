// src/components/messages/MessagesArea.tsx
// ✅ EXTRACTED: Messages area with timeline from MessagesPage.tsx

import React from 'react';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ConversationMessage } from '@/types/messages';
import { MessageBubble } from './MessageBubble';
import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';

interface MessagesAreaProps {
  messages: ConversationMessage[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const MessagesArea: React.FC<MessagesAreaProps> = ({
  messages,
  isLoading,
  messagesEndRef
}) => {
  return (
    <ScrollArea className="flex-1 mobile-scroll-container">
      <div className="mobile-container mobile-space-sm">
        {isLoading ? (
          <LoadingState message="Loading messages..." />
        ) : messages.length === 0 ? (
          <EmptyState 
            type="messages"
            title="No messages yet"
            description="Start the conversation!"
          />
        ) : (
          <div className="py-4">
            {messages.map((msg, index) => {
              const isMyMessage = msg.sender_id === 'user1';
              const showTimestamp = index === 0 || 
                (new Date(msg.created_date).getTime() - new Date(messages[index - 1].created_date).getTime()) > 300000;
              
              return (
                <div key={msg.id} className="mb-4">
                  {showTimestamp && (
                    <div className="flex justify-center mb-4">
                      <div className="bg-slate-200 px-3 py-1 rounded-full">
                        <span className="mobile-text-small text-slate-600">
                          {format(new Date(msg.created_date), 'MMM d, h:mm a')}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <MessageBubble 
                    message={msg} 
                    isMyMessage={isMyMessage} 
                  />
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </ScrollArea>
  );
};