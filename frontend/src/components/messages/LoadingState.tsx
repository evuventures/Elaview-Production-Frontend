// src/components/messages/LoadingState.tsx
// ✅ UPDATED: Now uses VideoLoader component
import React from 'react';
import VideoLoader from '@/components/ui/VideoLoader';

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
        <VideoLoader 
          size="sm"
          theme="brand"
          message={message}
          showMessage={true}
          centered={true}
          className="mx-auto mb-2"
        />
      </div>
    </div>
  );
};