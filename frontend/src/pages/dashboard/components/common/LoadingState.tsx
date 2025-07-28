// src/pages/dashboard/components/common/LoadingState.tsx
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  isAuthLoading?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ isAuthLoading = false }) => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 bg-lime-400 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-xl">
          <Loader2 className="w-8 h-8 md:w-10 md:h-10 animate-spin text-gray-900" />
        </div>
        <p className="text-gray-300 font-semibold text-base md:text-lg">
          {isAuthLoading ? 'Loading authentication...' : 'Loading your dashboard...'}
        </p>
      </div>
    </div>
  );
};