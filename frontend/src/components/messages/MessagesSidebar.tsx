// src/components/messages/MessagesSidebar.tsx
// ✅ EXTRACTED: From MessagesPage.tsx inline JSX
// ✅ ENHANCED: With proper TypeScript interfaces and B2B features
// ✅ FIXED: Enhanced mobile sidebar with proper touch targets

import React from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { 
  Search, 
  Plus, 
  MessageSquare, 
  UserIcon as User, 
  Check, 
  Building2, 
  Briefcase, 
  FileText, 
  MapPin, 
  Calendar 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Conversation, User as UserType } from '@/types/messages';

interface MessagesSidebarProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  allUsers: Record<string, UserType & { businessName?: string; isVerified?: boolean }>;
  onlineUsers: Set<string>;
  searchTerm: string;
  filteredConversations: Conversation[];
  onSelectConversation: (conversation: Conversation) => void;
  onSearchChange: (term: string) => void;
}

export const MessagesSidebar: React.FC<MessagesSidebarProps> = ({
  conversations,
  selectedConversation,
  allUsers,
  onlineUsers,
  searchTerm,
  filteredConversations,
  onSelectConversation,
  onSearchChange
}) => {
  return (
    <div className="w-full h-full border-r border-slate-200 bg-white flex flex-col">
      {/* ✅ FIXED: Header with proper mobile spacing */}
      <div className="flex-shrink-0 bg-white border-b border-slate-200">
        <div className="px-4 py-4 md:py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Messages</h1>
                <p className="text-sm text-slate-600">
                  {filteredConversations.length} conversations
                </p>
              </div>
            </div>
            
            <Button 
              size="sm"
              className="h-10 px-3 bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">New</span>
            </Button>
          </div>

          {/* ✅ FIXED: Search with proper touch targets */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-12 bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>
      </div>

      {/* ✅ FIXED: Conversations list with proper scrolling */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2 space-y-2">
          {filteredConversations.map((conversation) => {
            const otherParticipantId = conversation.participant_ids.find(id => id !== 'user1');
            const otherParticipant = otherParticipantId ? allUsers[otherParticipantId] : null;
            const isSelected = selectedConversation?.id === conversation.id;
            const isOnline = onlineUsers.has(otherParticipantId || '');
            
            if (!otherParticipant) return null;
            
            return (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="mb-2"
              >
                <Card 
                  onClick={() => onSelectConversation(conversation)}
                  className={`cursor-pointer transition-all duration-300 rounded-xl border h-16 md:h-20 ${
                    isSelected 
                      ? 'bg-teal-50 ring-1 ring-teal-500 shadow-lg border-teal-200' 
                      : 'bg-white hover:bg-slate-50 border-slate-200 hover:shadow-md'
                  }`}
                >
                  <CardContent className="p-4 h-full">
                    <div className="flex items-start gap-3 h-full">
                      {/* Avatar with status indicators */}
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 bg-slate-300 rounded-full flex items-center justify-center overflow-hidden">
                          {otherParticipant.profile_image ? (
                            <img 
                              src={otherParticipant.profile_image} 
                              alt={otherParticipant.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-6 h-6 text-slate-600" />
                          )}
                        </div>
                        
                        {/* Online indicator */}
                        {isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                        )}
                        
                        {/* Business verification badge */}
                        {otherParticipant.isVerified && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                       
                      <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <h3 className={`font-semibold truncate text-sm md:text-base ${
                              isSelected ? 'text-teal-700' : 'text-slate-900'
                            }`}>
                              {otherParticipant.full_name}
                            </h3>
                            
                            {/* Business context badge */}
                            {conversation.businessType && (
                              <Badge 
                                variant="secondary" 
                                className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 flex-shrink-0"
                              >
                                {conversation.businessType === 'property_inquiry' && <Building2 className="w-3 h-3 mr-1" />}
                                {conversation.businessType === 'campaign_discussion' && <Briefcase className="w-3 h-3 mr-1" />}
                                {conversation.businessType === 'contract_review' && <FileText className="w-3 h-3 mr-1" />}
                                {conversation.businessType.replace('_', ' ')}
                              </Badge>
                            )}
                          </div>
                           
                          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                            {conversation.unreadCount > 0 && (
                              <Badge 
                                variant="default" 
                                className="bg-teal-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] h-5"
                              >
                                {conversation.unreadCount}
                              </Badge>
                            )}
                            <span className="text-xs text-slate-500">
                              {formatDistanceToNow(conversation.lastActivity, { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        
                        {/* Business name and last message */}
                        <div className="space-y-1">
                          <p className="text-xs text-slate-500 truncate font-medium">
                            {otherParticipant.businessName}
                          </p>
                          <p className="text-xs text-slate-600 truncate">
                            {conversation.lastMessage}
                          </p>
                           
                          {/* Business context */}
                          {conversation.context && (
                            <div className="flex items-center gap-1 mt-1">
                              {conversation.context.type === 'property' && <MapPin className="w-3 h-3 text-slate-400" />}
                              {conversation.context.type === 'campaign' && <Briefcase className="w-3 h-3 text-slate-400" />}
                              {conversation.context.type === 'booking' && <Calendar className="w-3 h-3 text-slate-400" />}
                              <span className="text-xs text-slate-500 truncate">
                                {conversation.context.name}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
        
        {/* Empty state */}
        {filteredConversations.length === 0 && (
          <div className="px-4 text-center py-8">
            <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {searchTerm ? 'No conversations found' : 'No conversations yet'}
            </h3>
            <p className="text-slate-600 text-sm">
              {searchTerm ? 'Try a different search term' : 'Start a conversation from a property listing'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};