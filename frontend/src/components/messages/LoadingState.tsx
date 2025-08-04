// src/components/messages/LoadingState.tsx
// ✅ EXTRACTED: From MessagesPage.tsx inline JSX

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Loading messages...' 
}) => {
  return (
    <div className="flex items-center justify-center h-32">
      <div className="text-center">
        <Loader2 className="w-6 h-6 animate-spin text-teal-500 mx-auto mb-2" />
        <p className="text-slate-600 mobile-text-small">{message}</p>
      </div>
    </div>
  );
};