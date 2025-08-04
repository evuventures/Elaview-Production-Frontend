// src/components/messages/MessageInput.tsx
// ✅ EXTRACTED: From MessagesPage.tsx inline JSX
// ✅ ENHANCED: With proper TypeScript interfaces and B2B features

import React, { useRef } from 'react';
import { 
  Paperclip, 
  Mic, 
  MicOff, 
  Send, 
  Loader2,
  X,
  Image,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  file: File;
  preview?: string | null;
}

interface MessageInputProps {
  newMessage: string;
  attachments: Attachment[];
  isSending: boolean;
  isRecording: boolean;
  isTyping: boolean;
  otherUserName: string;
  onMessageChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAttachment: (attachmentId: string) => void;
  onToggleRecording: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  newMessage,
  attachments,
  isSending,
  isRecording,
  isTyping,
  otherUserName,
  onMessageChange,
  onSendMessage,
  onKeyPress,
  onFileSelect,
  onRemoveAttachment,
  onToggleRecording
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="mobile-container bg-white border-t border-slate-200">
      <div className="py-4 mobile-space-sm">
        
        {/* Attachment preview */}
        {attachments.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center mobile-gap-xs flex-wrap">
              {attachments.map(att => (
                <div key={att.id} className="flex items-center mobile-gap-xs bg-slate-100 rounded-lg p-2">
                  {att.type.startsWith('image/') ? (
                    <Image className="w-4 h-4 text-slate-500" />
                  ) : (
                    <FileText className="w-4 h-4 text-slate-500" />
                  )}
                  <span className="mobile-text-small text-slate-700 truncate max-w-[100px]">
                    {att.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveAttachment(att.id)}
                    className="text-slate-500 hover:text-slate-700 touch-target"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Input area */}
        <div className="flex items-end mobile-gap-sm">
          {/* Attachment button */}
          <div className="flex flex-col mobile-gap-xs">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-slate-500 hover:text-slate-700 touch-target"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            
            {/* Voice message button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleRecording}
              className={`touch-target ${
                isRecording 
                  ? 'text-red-500 hover:text-red-700 bg-red-50' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
          </div>
          
          <div className="flex-1">
            <Input 
              ref={messageInputRef}
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => onMessageChange(e.target.value)}
              onKeyPress={onKeyPress}
              disabled={isSending}
              className="touch-target bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-teal-500 focus:border-teal-500 rounded-2xl resize-none"
            />
          </div>
          
          <Button 
            onClick={onSendMessage}
            disabled={isSending || (!newMessage.trim() && attachments.length === 0)}
            className="touch-target bg-teal-500 hover:bg-teal-600 text-white rounded-2xl shadow-sm disabled:opacity-50"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin"/>
            ) : (
              <Send className="w-4 h-4"/>
            )}
          </Button>
        </div>
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center mobile-gap-xs mt-2 text-slate-500">
            <div className="flex mobile-gap-xs">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
            <span className="mobile-text-small">{otherUserName} is typing...</span>
          </div>
        )}
      </div>
      
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept="image/*,.pdf,.doc,.docx,.txt"
        onChange={onFileSelect}
        className="hidden"
      />
    </div>
  );
};