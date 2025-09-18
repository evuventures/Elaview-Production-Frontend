// src/components/messages/ConversationItem.jsx
// ✅ MOBILE RESPONSIVE: Enhanced conversation item with B2B features
// ✅ B2B FEATURES: Business verification, context indicators, priority badges
// ✅ ACCESSIBILITY: Touch targets, screen reader support, keyboard navigation

import React from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { 
 User as UserIcon, 
 Check, 
 Building2, 
 Briefcase, 
 FileText, 
 Calendar,
 MapPin,
 DollarSign,
 AlertCircle,
 Clock,
 Star,
 MessageCircle,
 Phone,
 Video
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ConversationItem = ({ 
 conversation, 
 onSelect, 
 isSelected, 
 currentUser, 
 allUsers,
 onlineUsers = new Set(),
 onCall,
 onVideoCall,
 className = '' 
}) => {
 const otherParticipantId = conversation.participant_ids.find(id => id !== currentUser?.id);
 const otherParticipant = otherParticipantId ? allUsers[otherParticipantId] : null;
 const isOnline = onlineUsers.has(otherParticipantId);
 
 if (!otherParticipant) {
 return null;
 }

 const getBusinessTypeIcon = (businessType) => {
 switch (businessType) {
 case 'property_inquiry':
 return <Building2 className="w-3 h-3" />;
 case 'campaign_discussion':
 return <Briefcase className="w-3 h-3" />;
 case 'contract_review':
 return <FileText className="w-3 h-3" />;
 case 'quote_request':
 return <DollarSign className="w-3 h-3" />;
 case 'urgent_matter':
 return <AlertCircle className="w-3 h-3" />;
 case 'scheduling':
 return <Calendar className="w-3 h-3" />;
 default:
 return <MessageCircle className="w-3 h-3" />;
 }
 };

 const getBusinessTypeColor = (businessType) => {
 switch (businessType) {
 case 'property_inquiry':
 return 'bg-blue-100 text-blue-700 border-blue-200';
 case 'campaign_discussion':
 return 'bg-green-100 text-green-700 border-green-200';
 case 'contract_review':
 return 'bg-orange-100 text-orange-700 border-orange-200';
 case 'quote_request':
 return 'bg-purple-100 text-purple-700 border-purple-200';
 case 'urgent_matter':
 return 'bg-red-100 text-red-700 border-red-200';
 case 'scheduling':
 return 'bg-indigo-100 text-indigo-700 border-indigo-200';
 default:
 return 'bg-slate-100 text-slate-700 border-slate-200';
 }
 };

 const getPriorityIndicator = (priority) => {
 if (priority === 'high') {
 return <AlertCircle className="w-3 h-3 text-red-500" />;
 }
 if (priority === 'urgent') {
 return <AlertCircle className="w-3 h-3 text-red-600 animate-pulse" />;
 }
 return null;
 };

 const handleKeyPress = (e) => {
 if (e.key === 'Enter' || e.key === ' ') {
 e.preventDefault();
 onSelect(conversation);
 }
 };

 const handleCallClick = (e) => {
 e.stopPropagation();
 onCall?.(otherParticipant);
 };

 const handleVideoCallClick = (e) => {
 e.stopPropagation();
 onVideoCall?.(otherParticipant);
 };

 return (
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 whileHover={{ y: -2, scale: 1.01 }}
 whileTap={{ scale: 0.98 }}
 transition={{ duration: 0.2 }}
 className={`mb-2 ${className}`}
>
 <Card 
 onClick={() => onSelect(conversation)}
 onKeyPress={handleKeyPress}
 tabIndex={0}
 role="button"
 aria-label={`Conversation with ${otherParticipant.full_name} from ${otherParticipant.businessName}`}
 className={`cursor-pointer transition-all duration-300 rounded-xl border group hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
 isSelected 
 ? 'bg-teal-50 ring-1 ring-teal-500 shadow-lg border-teal-200' 
 : 'bg-white hover:bg-slate-50 border-slate-200'
 }`}
>
 <CardContent className="p-4 touch-target-lg">
 <div className="flex items-start gap-3">
 {/* ✅ MOBILE: Enhanced Avatar with multiple indicators */}
 <div className="relative flex-shrink-0">
 <div className="w-12 h-12 bg-slate-300 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-slate-200 group-hover:ring-slate-300 transition-all">
 {otherParticipant.profile_image ? (
 <img 
 src={otherParticipant.profile_image} 
 alt={`${otherParticipant.full_name} profile`}
 className="w-full h-full object-cover"
 />
 ) : (
 <UserIcon className="w-6 h-6 text-slate-600" />
 )}
 </div>
 
 {/* Online status indicator */}
 {isOnline && (
 <div 
 className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"
 aria-label="Online"
 />
 )}
 
 {/* Business verification badge */}
 {otherParticipant.isVerified && (
 <div 
 className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-sm"
 aria-label="Verified business"
 title="Verified Business"
>
 <Check className="w-3 h-3 text-white" />
 </div>
 )}
 
 {/* VIP/Premium indicator */}
 {otherParticipant.isPremium && (
 <div 
 className="absolute -top-1 -left-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center shadow-sm"
 aria-label="Premium member"
 title="Premium Member"
>
 <Star className="w-3 h-3 text-white" />
 </div>
 )}
 </div>
 
 <div className="flex-1 min-w-0">
 {/* Header row with name and time */}
 <div className="flex items-start justify-between mb-1">
 <div className="flex items-center gap-2 flex-1 min-w-0">
 <h3 className={`font-semibold truncate text-sm sm:text-base ${
 isSelected ? 'text-teal-700' : 'text-slate-900'
 }`}>
 {otherParticipant.full_name}
 </h3>
 
 {/* Priority indicator */}
 {conversation.priority && getPriorityIndicator(conversation.priority)}
 
 {/* Business type badge */}
 {conversation.businessType && (
 <Badge 
 variant="outline" 
 className={`text-xs px-2 py-0.5 border ${getBusinessTypeColor(conversation.businessType)}`}
>
 {getBusinessTypeIcon(conversation.businessType)}
 <span className="ml-1 hidden sm:inline">
 {conversation.businessType.replace('_', ' ')}
 </span>
 </Badge>
 )}
 </div>
 
 {/* Time and actions */}
 <div className="flex items-center gap-1 flex-shrink-0 ml-2">
 {/* Quick action buttons (show on hover) */}
 <div className="hidden group-hover:flex items-center gap-1">
 {onCall && (
 <Button
 variant="ghost"
 size={20}
 onClick={handleCallClick}
 className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600"
 aria-label="Call"
>
 <Phone className="w-3 h-3" />
 </Button>
 )}
 {onVideoCall && (
 <Button
 variant="ghost"
 size={20}
 onClick={handleVideoCallClick}
 className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600"
 aria-label="Video call"
>
 <Video className="w-3 h-3" />
 </Button>
 )}
 </div>
 
 {/* Unread count */}
 {conversation.unreadCount> 0 && (
 <Badge 
 variant="default" 
 className="bg-teal-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] h-5 flex items-center justify-center"
 aria-label={`${conversation.unreadCount} unread messages`}
>
 {conversation.unreadCount> 99 ? '99+' : conversation.unreadCount}
 </Badge>
 )}
 
 {/* Timestamp */}
 <span className="text-xs text-slate-500">
 {formatDistanceToNow(conversation.lastActivity, { addSuffix: true })}
 </span>
 </div>
 </div>
 
 {/* Business name */}
 <div className="mb-1">
 <p className="text-xs sm:text-sm text-slate-500 truncate font-medium flex items-center gap-1">
 <Building2 className="w-3 h-3 flex-shrink-0" />
 {otherParticipant.businessName}
 </p>
 </div>
 
 {/* Last message */}
 <div className="mb-2">
 <p className="text-xs sm:text-sm text-slate-600 truncate leading-relaxed">
 {conversation.lastMessage}
 </p>
 </div>
 
 {/* Business context */}
 {conversation.context && (
 <div className="flex items-center gap-1 text-xs text-slate-500">
 {conversation.context.type === 'property' && <MapPin className="w-3 h-3" />}
 {conversation.context.type === 'campaign' && <Briefcase className="w-3 h-3" />}
 {conversation.context.type === 'booking' && <Calendar className="w-3 h-3" />}
 <span className="truncate">{conversation.context.name}</span>
 
 {/* Additional context indicators */}
 {conversation.hasAttachments && (
 <div className="flex items-center gap-1 ml-auto">
 <FileText className="w-3 h-3" />
 </div>
 )}
 
 {conversation.isScheduled && (
 <div className="flex items-center gap-1 ml-1">
 <Clock className="w-3 h-3 text-blue-500" />
 </div>
 )}
 </div>
 )}
 
 {/* Status indicators */}
 <div className="flex items-center justify-between mt-2">
 <div className="flex items-center gap-2">
 {/* Message type indicators */}
 {conversation.lastMessageType === 'quote_request' && (
 <Badge variant="outline" className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 border-purple-200">
 <DollarSign className="w-3 h-3 mr-1" />
 Quote Request
 </Badge>
 )}
 
 {conversation.lastMessageType === 'contract' && (
 <Badge variant="outline" className="text-xs px-2 py-0.5 bg-orange-50 text-orange-700 border-orange-200">
 <FileText className="w-3 h-3 mr-1" />
 Contract
 </Badge>
 )}
 
 {conversation.isPinned && (
 <div className="text-yellow-500" aria-label="Pinned conversation">
 <Star className="w-3 h-3 fill-current" />
 </div>
 )}
 </div>
 
 {/* Engagement indicators */}
 <div className="flex items-center gap-1 text-slate-400">
 {conversation.hasUnreadMentions && (
 <div className="w-2 h-2 bg-red-500 rounded-full" aria-label="You were mentioned" />
 )}
 
 {conversation.awaitingResponse && (
 <Clock className="w-3 h-3 text-amber-500" aria-label="Awaiting response" />
 )}
 </div>
 </div>
 </div>
 </div>
 </CardContent>
 </Card>
 </motion.div>
 );
};

export default ConversationItem;