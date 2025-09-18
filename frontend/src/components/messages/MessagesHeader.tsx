// src/components/messages/MessagesHeader.tsx
// ✅ EXTRACTED: From MessagesPage.tsx inline JSX
// ✅ ENHANCED: With proper TypeScript interfaces and B2B features

import React from 'react';
import { 
 ArrowLeft, 
 Phone, 
 Video, 
 MoreVertical, 
 Eye,
 Check,
 Building2,
 Briefcase,
 Calendar,
 UserIcon as User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User as UserType } from '@/types/messages';

interface BusinessContext {
 type: 'property' | 'campaign' | 'booking';
 name: string;
 businessType?: string;
}

interface MessagesHeaderProps {
 otherUser: UserType & { 
 businessName?: string; 
 isVerified?: boolean; 
 };
 businessContext?: BusinessContext | null;
 showBusinessContext: boolean;
 onlineUsers: Set<string>;
 onBack: () => void;
 onToggleBusinessContext: () => void;
}

export const MessagesHeader: React.FC<MessagesHeaderProps> = ({
 otherUser,
 businessContext,
 showBusinessContext,
 onlineUsers,
 onBack,
 onToggleBusinessContext
}) => {
 const isOnline = onlineUsers.has(otherUser.id);

 return (
 <div className="mobile-container bg-white border-b border-slate-200">
 <div className="py-4 md:py-6">
 <div className="flex items-center justify-between">
 <div className="flex items-center mobile-gap-sm">
 <Button
 variant="ghost"
 size={20}
 onClick={onBack}
 className="md:hidden text-slate-600 hover:text-slate-900 hover:bg-slate-100 touch-target"
>
 <ArrowLeft className="w-4 h-4" />
 </Button>
 
 <div className="relative">
 <div className="w-10 h-10 bg-slate-300 rounded-full flex items-center justify-center overflow-hidden">
 {otherUser.profile_image ? (
 <img 
 src={otherUser.profile_image} 
 alt={otherUser.full_name}
 className="w-full h-full object-cover"
 />
 ) : (
 <User className="w-5 h-5 text-slate-600" />
 )}
 </div>
 
 {/* Online indicator */}
 {isOnline && (
 <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
 )}
 
 {/* Verification badge */}
 {otherUser.isVerified && (
 <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
 <Check className="w-2.5 h-2.5 text-white" />
 </div>
 )}
 </div>
 
 <div className="flex-1 min-w-0">
 <div className="flex items-center mobile-gap-xs">
 <h2 className="font-semibold text-slate-900 mobile-text-responsive truncate">
 {otherUser.full_name}
 </h2>
 {otherUser.isVerified && (
 <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700">
 Verified
 </Badge>
 )}
 </div>
 <p className="mobile-text-small text-slate-600 truncate">
 {otherUser.businessName}
 </p>
 <p className="mobile-text-small text-green-600 font-medium">
 {isOnline ? 'Online now' : 'Last seen recently'}
 </p>
 </div>
 </div>

 {/* Action buttons */}
 <div className="flex items-center mobile-gap-xs">
 <Button 
 variant="ghost" 
 size={20} 
 className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 touch-target"
>
 <Phone className="w-4 h-4" />
 </Button>
 <Button 
 variant="ghost" 
 size={20} 
 className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 touch-target"
>
 <Video className="w-4 h-4" />
 </Button>
 <Button 
 variant="ghost" 
 size={20} 
 className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 touch-target"
 onClick={onToggleBusinessContext}
>
 <MoreVertical className="w-4 h-4" />
 </Button>
 </div>
 </div>
 
 {/* Business context bar */}
 {businessContext && (
 <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
 <div className="flex items-center mobile-gap-sm">
 {businessContext.type === 'property' && <Building2 className="w-4 h-4 text-slate-500" />}
 {businessContext.type === 'campaign' && <Briefcase className="w-4 h-4 text-slate-500" />}
 {businessContext.type === 'booking' && <Calendar className="w-4 h-4 text-slate-500" />}
 <div className="flex-1 min-w-0">
 <p className="mobile-text-small font-medium text-slate-700 truncate">
 {businessContext.name}
 </p>
 <p className="mobile-text-small text-slate-500 capitalize">
 {businessContext.businessType?.replace('_', ' ')} discussion
 </p>
 </div>
 <Button 
 variant="ghost" 
 size={20}
 className="touch-target text-slate-500 hover:text-slate-700"
>
 <Eye className="w-4 h-4" />
 </Button>
 </div>
 </div>
 )}
 </div>
 </div>
 );
};