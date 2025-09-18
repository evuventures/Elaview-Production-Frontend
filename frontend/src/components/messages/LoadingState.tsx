// src/components/messages/LoadingState.tsx
// ✅ UPDATED: Now uses consolidated loading component

import React from 'react';
import { EnterpriseLoader } from '@/components/ui/loading';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading messages...'
}) => {
  React.useEffect(() => {
    console.log('🔄 Messages LoadingState: Component mounted with message:', message);
    return () => {
      console.log('🔄 Messages LoadingState: Component unmounted');
    };
  }, [message]);

  return (
    <div className="flex items-center justify-center h-32">
      <div className="text-center">
        <EnterpriseLoader 
          size={20}
          centered
          className="mx-auto mb-2"
        />
      </div>
    </div>
  );
};