import React from 'react';
import { ConversationMessage, MessageType } from '@/types/messages';
import { format } from 'date-fns';
import { 
 Info, CheckCircle, XCircle, PlayCircle, StopCircle, 
 FileText, UserMinus, UserCheck 
} from 'lucide-react';

interface SystemMessageProps {
 message: ConversationMessage;
 onClick?: () => void;
}

const iconMap: Record<MessageType, React.ReactNode> = {
 text: <Info className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />,
 system: <Info className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />,
 booking_request: <Info className="w-5 h-5 text-[hsl(var(--primary))]" />,
 booking_acknowledgment: <CheckCircle className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />,
 booking_confirmed: <CheckCircle className="w-5 h-5 text-[hsl(var(--success))]" />,
 booking_cancelled: <XCircle className="w-5 h-5 text-[hsl(var(--destructive))]" />,
 campaign_start: <PlayCircle className="w-5 h-5 text-[hsl(var(--success))]" />,
 campaign_end: <StopCircle className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />,
 payment_due: <FileText className="w-5 h-5 text-[hsl(var(--warning))]" />,
 invoice_created: <FileText className="w-5 h-5 text-[hsl(var(--warning))]" />,
 payment_received: <CheckCircle className="w-5 h-5 text-[hsl(var(--success))]" />,
 user_blocked: <UserMinus className="w-5 h-5 text-[hsl(var(--destructive))]" />,
 user_unblocked: <UserCheck className="w-5 h-5 text-[hsl(var(--success))]" />,
 campaign_change_request: <Info className="w-5 h-5 text-[hsl(var(--primary))]" />,
 booking_change_approved: <CheckCircle className="w-5 h-5 text-[hsl(var(--success))]" />,
 booking_change_denied: <XCircle className="w-5 h-5 text-[hsl(var(--destructive))]" />
};

const styleMap: Record<MessageType, string> = {
 text: 'bg-[hsl(var(--muted)/0.3)] border-[hsl(var(--border))] text-[hsl(var(--foreground))]',
 system: 'bg-[hsl(var(--muted)/0.3)] border-[hsl(var(--border))] text-[hsl(var(--foreground))]',
 booking_request: 'bg-[hsl(var(--primary)/0.1)] border-[hsl(var(--primary)/0.3)] text-[hsl(var(--primary))]',
 booking_acknowledgment: 'bg-[hsl(var(--muted)/0.3)] border-[hsl(var(--border))] text-[hsl(var(--foreground))]',
 booking_confirmed: 'bg-[hsl(var(--success)/0.1)] border-[hsl(var(--success)/0.3)] text-[hsl(var(--success))]',
 booking_cancelled: 'bg-[hsl(var(--destructive)/0.1)] border-[hsl(var(--destructive)/0.3)] text-[hsl(var(--destructive))]',
 campaign_start: 'bg-[hsl(var(--success)/0.1)] border-[hsl(var(--success)/0.3)] text-[hsl(var(--success))]',
 campaign_end: 'bg-[hsl(var(--muted)/0.3)] border-[hsl(var(--border))] text-[hsl(var(--foreground))]',
 payment_due: 'bg-[hsl(var(--warning)/0.1)] border-[hsl(var(--warning)/0.3)] text-[hsl(var(--warning))]',
 payment_received: 'bg-[hsl(var(--success)/0.1)] border-[hsl(var(--success)/0.3)] text-[hsl(var(--success))]',
 invoice_created: 'bg-[hsl(var(--warning)/0.1)] border-[hsl(var(--warning)/0.3)] text-[hsl(var(--warning))]',
 user_blocked: 'bg-[hsl(var(--destructive)/0.1)] border-[hsl(var(--destructive)/0.3)] text-[hsl(var(--destructive))]',
 user_unblocked: 'bg-[hsl(var(--success)/0.1)] border-[hsl(var(--success)/0.3)] text-[hsl(var(--success))]',
 campaign_change_request: 'bg-[hsl(var(--primary)/0.1)] border-[hsl(var(--primary)/0.3)] text-[hsl(var(--primary))]',
 booking_change_approved: 'bg-[hsl(var(--success)/0.1)] border-[hsl(var(--success)/0.3)] text-[hsl(var(--success))]',
 booking_change_denied: 'bg-[hsl(var(--destructive)/0.1)] border-[hsl(var(--destructive)/0.3)] text-[hsl(var(--destructive))]'
};

export const SystemMessage: React.FC<SystemMessageProps> = ({ message, onClick }) => {
 return (
 <div 
 className={`w-full max-w-md text-left p-4 rounded-2xl border-2 my-3 backdrop-blur-sm transition-brand hover:shadow-lg ${styleMap[message.message_type]}`}
 onClick={onClick}
>
 <div className="flex items-start gap-4">
 <span className="text-lg flex-shrink-0 mt-1 p-2 bg-[hsl(var(--card)/0.7)] rounded-full">
 {iconMap[message.message_type]}
 </span>
 <div className="flex-1">
 <div className="text-sm font-semibold whitespace-pre-line leading-relaxed">{message.content}</div>
 <div className="text-xs opacity-80 mt-2 font-medium">
 {format(new Date(message.created_date), 'MMM d, yyyy HH:mm')}
 </div>
 </div>
 </div>
 </div>
 );
};