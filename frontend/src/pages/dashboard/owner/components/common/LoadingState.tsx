// src/pages/dashboard/owner/components/common/LoadingState.tsx
// ✅ UPDATED: Now uses VideoLoader component
import React from 'react';
import VideoLoader from '@/components/ui/VideoLoader';

interface LoadingStateProps {
  isAuthLoading?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ isAuthLoading = false }) => {
  React.useEffect(() => {
    console.log('🔄 Dashboard LoadingState: Component mounted, isAuthLoading:', isAuthLoading);
    return () => {
      console.log('🔄 Dashboard LoadingState: Component unmounted');
    };
  }, [isAuthLoading]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 bg-lime-400 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-xl">
          <VideoLoader 
            size="lg"
            theme="gray"
            centered={true}
          />
        </div>
        <p className="text-gray-300 font-semibold text-base md:text-lg">
          {isAuthLoading ? 'Loading authentication...' : 'Loading your dashboard...'}
        </p>
      </div>
    </div>
  );
};