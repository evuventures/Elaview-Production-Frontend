// src/components/messages/EmptyState.tsx
// ✅ EXTRACTED: From MessagesPage.tsx inline JSX

import React from 'react';
import { MessageCircle, MessageSquare } from 'lucide-react';

interface EmptyStateProps {
 type: 'messages' | 'welcome';
 title: string;
 description: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
 type, 
 title, 
 description 
}) => {
 if (type === 'messages') {
 return (
 <div className="flex items-center justify-center h-32">
 <div className="text-center">
 <MessageCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
 <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
 <p className="text-slate-600 mobile-text-responsive">{description}</p>
 </div>
 </div>
 );
 }

 // Welcome state
 return (
 <div className="flex-1 flex items-center justify-center text-center mobile-container">
 <div>
 <div className="w-20 h-20 bg-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
 <MessageSquare className="w-10 h-10 text-slate-500" />
 </div>
 <h3 className="text-2xl font-bold text-slate-900 mb-4">{title}</h3>
 <p className="text-slate-600 mobile-text-large max-w-md">{description}</p>
 </div>
 </div>
 );
};