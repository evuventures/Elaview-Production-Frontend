// src/types/messages.ts
export interface User {
    id: string;
    full_name: string;
    profile_image: string | null;
  }
  
  export interface Message {
    id: string;
    sender_id: string;
    sender?: User;  // Expanded in API responses
    recipient_id: string;
    recipient?: User;  // Expanded in API responses
    content: string;
    message_type: MessageType;
    created_date: string;
    is_read: boolean;
    isOptimistic?: boolean;
    conversation_id?: string;
  }
  
  export interface Conversation {
    id: string;
    participant_ids: string[];
    participants?: User[];  // Expanded in API responses
    last_message?: Message; // From Prisma relation
    last_activity?: string; // Matches Prisma's DateTime
    unread_count: number;
    advertising_area_id?: string;
    created_at?: string;
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
  
  // API Response Types
  export interface ConversationResponse extends Conversation {
    participants: User[];
    last_message: Message;
  }
  
  export interface MessageResponse extends Message {
    sender: User;
    recipient: User;
  }