import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex justify-center p-8">
      <div className="w-12 h-12 bg-gradient-brand rounded-2xl flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-white" />
      </div>
      <div className="ml-4 text-[hsl(var(--muted-foreground))] font-medium">{message}</div>
    </div>
  );
};