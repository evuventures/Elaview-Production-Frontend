// src/types/messages.ts

export interface User {
    id: string;
    full_name: string;
    profile_image: string | null;
}
  
export interface ConversationMessage {
    id: string;
    sender_id: string;
    recipient_id: string;
    content: string;
    message_type: MessageType;
    created_date: string;
    is_read: boolean;
    isOptimistic?: boolean;
}

export interface Conversation {
    id: string;
    participant_ids: string[];
    lastMessage: string;
    lastActivity: Date;
    unreadCount: number;
    messages?: ConversationMessage[];
    isNew?: boolean;
}

export interface Message {
    id: string;
    sender_id: string;
    recipient_id: string;
    content: string;
    message_type: MessageType;
    created_date: string;
    is_read: boolean;
    isOptimistic?: boolean;
}

export type MessageType = 
    | 'text' 
    | 'system' 
    | 'booking_request' 
    | 'booking_acknowledgment' 
    | 'booking_confirmed' 
    | 'booking_cancelled' 
    | 'campaign_start' 
    | 'campaign_end' 
    | 'payment_due' 
    | 'payment_received' 
    | 'invoice_created' 
    | 'user_blocked' 
    | 'user_unblocked' 
    | 'campaign_change_request' 
    | 'booking_change_approved' 
    | 'booking_change_denied';