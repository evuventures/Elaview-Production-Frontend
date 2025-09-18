// src/components/messages/MessageInput.tsx
// ✅ EXTRACTED: From MessagesPage.tsx inline JSX
// ✅ ENHANCED: With proper TypeScript interfaces and B2B features
// ✅ FIXED: Mobile input handling with proper keyboard support

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
 <div className="bg-white border-t border-slate-200">
 <div className="px-4 py-4">
 
 {/* ✅ FIXED: Attachment preview with mobile optimization */}
 {attachments.length> 0 && (
 <div className="mb-3">
 <div className="flex items-center gap-2 flex-wrap">
 {attachments.map(att => (
 <div key={att.id} className="flex items-center gap-2 bg-slate-100 rounded-lg p-2 max-w-full">
 {att.type.startsWith('image/') ? (
 <Image className="w-4 h-4 text-slate-500 flex-shrink-0" />
 ) : (
 <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
 )}
 <span className="text-sm text-slate-700 truncate flex-1 min-w-0">
 {att.name}
 </span>
 <Button
 variant="ghost"
 size={20}
 onClick={() => onRemoveAttachment(att.id)}
 className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700"
>
 <X className="w-3 h-3" />
 </Button>
 </div>
 ))}
 </div>
 </div>
 )}
 
 {/* ✅ FIXED: Input area with proper mobile layout */}
 <div className="flex items-end gap-3">
 {/* Attachment button */}
 <Button
 variant="ghost"
 size={20}
 onClick={() => fileInputRef.current?.click()}
 className="h-12 w-12 p-0 text-slate-500 hover:text-slate-700 flex-shrink-0"
>
 <Paperclip className="w-5 h-5" />
 </Button>

 {/* Message input */}
 <div className="flex-1 relative">
 <Input
 ref={messageInputRef}
 value={newMessage}
 onChange={(e) => onMessageChange(e.target.value)}
 onKeyPress={onKeyPress}
 placeholder={`Message ${otherUserName}...`}
 className="h-12 pr-12 bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-teal-500 focus:border-teal-500"
 />
 
 {/* Send button */}
 <Button
 onClick={onSendMessage}
 disabled={!newMessage.trim() || isSending}
 className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-teal-500 hover:bg-teal-600 text-white disabled:opacity-50"
>
 {isSending ? (
 <Loader2 className="w-4 h-4 animate-spin" />
 ) : (
 <Send className="w-4 h-4" />
 )}
 </Button>
 </div>

 {/* Voice recording button */}
 <Button
 variant="ghost"
 size={20}
 onClick={onToggleRecording}
 className={`h-12 w-12 p-0 flex-shrink-0 ${
 isRecording ? 'text-red-500 hover:text-red-600' : 'text-slate-500 hover:text-slate-700'
 }`}
>
 {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
 </Button>
 </div>
 
 {/* ✅ FIXED: Typing indicator */}
 {isTyping && (
 <div className="flex items-center gap-2 mt-2 text-slate-500">
 <div className="flex gap-1">
 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
 </div>
 <span className="text-sm">{otherUserName} is typing...</span>
 </div>
 )}
 </div>
 
 {/* Hidden file input */}
 <input
 ref={fileInputRef}
 type="file"
 multiple
 onChange={onFileSelect}
 className="hidden"
 accept="image/*,.pdf,.doc,.docx,.txt"
 />
 </div>
 );
};