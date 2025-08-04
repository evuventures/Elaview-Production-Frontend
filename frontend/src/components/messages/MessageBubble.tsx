// src/components/messages/MessageBubble.tsx
// ✅ EXTRACTED: From MessagesPage.tsx inline JSX
// ✅ ENHANCED: With proper TypeScript interfaces and B2B features

import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  Clock, 
  CheckCircle, 
  DollarSign, 
  FileText, 
  Download 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConversationMessage } from '@/types/messages';

interface MessageBubbleProps {
  message: ConversationMessage & {
    businessContext?: {
      type: string;
      priority?: string;
    };
    attachments?: Array<{
      id: string;
      name: string;
      type: string;
    }>;
  };
  isMyMessage: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isMyMessage 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex w-full ${isMyMessage ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 ${
        isMyMessage 
          ? 'bg-teal-500 text-white rounded-br-sm shadow-sm' 
          : 'bg-white text-slate-900 rounded-bl-sm border border-slate-200 shadow-sm'
      }`}>
        
        {/* Business context indicator */}
        {message.businessContext && (
          <div className={`flex items-center mobile-gap-xs mb-2 pb-2 border-b ${
            isMyMessage ? 'border-teal-400' : 'border-slate-200'
          }`}>
            {message.businessContext.type === 'rfq' && <DollarSign className="w-3 h-3" />}
            <span className="mobile-text-small font-medium opacity-80">
              {message.businessContext.type === 'rfq' && 'Quote Request'}
              {message.businessContext.priority === 'high' && ' • High Priority'}
            </span>
          </div>
        )}
        
        <p className="mobile-text-responsive leading-relaxed">{message.content}</p>
        
        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 mobile-space-xs">
            {message.attachments.map(att => (
              <div key={att.id} className={`flex items-center mobile-gap-xs p-2 rounded-lg ${
                isMyMessage ? 'bg-teal-400/20' : 'bg-slate-100'
              }`}>
                <FileText className="w-4 h-4" />
                <span className="mobile-text-small truncate">{att.name}</span>
                <Button variant="ghost" size="sm" className="touch-target">
                  <Download className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
        
        {/* Message status */}
        <div className={`flex items-center justify-between mt-2 ${
          isMyMessage ? 'text-teal-200' : 'text-slate-500'
        }`}>
          <span className="mobile-text-small">
            {format(new Date(message.created_date), 'HH:mm')}
          </span>
          {message.isOptimistic && (
            <div className="flex items-center mobile-gap-xs">
              <Clock className="w-3 h-3" />
              <span className="mobile-text-small">Sending...</span>
            </div>
          )}
          {isMyMessage && !message.isOptimistic && (
            <CheckCircle className="w-3 h-3" />
          )}
        </div>
      </div>
    </motion.div>
  );
};