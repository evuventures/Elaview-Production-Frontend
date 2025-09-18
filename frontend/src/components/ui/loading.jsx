// src/components/ui/loading.jsx
// One simple loading component for the entire codebase

import React from 'react';
import { Loader2 } from 'lucide-react';

const Loading = ({ 
 size = 20, 
 className = '',
 centered = false 
}) => {
 const spinner = (
 <div className={`flex items-center justify-center ${className}`}>
 <Loader2 className="animate-spin text-blue-600" size={size} />
 </div>
 );

 if (centered) {
 return (
 <div className="flex items-center justify-center w-full h-full">
 {spinner}
 </div>
 );
 }

 return spinner;
};

// Export the same component with different names for compatibility
export const EnterpriseLoader = Loading;
export const LoadingAnimation = Loading;
export const DotsLoader = Loading;
export const LoadingText = Loading;
export const LoadingSkeleton = Loading;
export const PageLoader = (props) => <Loading centered {...props} />;
export const ButtonLoader = Loading;
export const InlineLoader = Loading;
export const CardLoader = Loading;
export const SkeletonLoader = Loading;
export const MinimalSpinner = Loading;
export const PulsingCircle = Loading;

// Additional exports that MessagesPage expects
export const MessageStatusIndicator = Loading;
export const EnterpriseSendButton = Loading;
export const ConnectionStatusIndicator = Loading;
export const TypingIndicator = Loading;
export const BusinessMessageTypeIndicator = Loading;
export const ConversationLoadingSkeleton = Loading;
export const MessageLoadingSkeleton = Loading;

export default Loading;