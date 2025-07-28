import React from 'react';
import { MessageSquare } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description }) => {
  return (
    <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
      <div className="w-20 h-20 mx-auto mb-4 bg-[hsl(var(--muted))] rounded-2xl flex items-center justify-center">
        <MessageSquare className="w-10 h-10 text-[hsl(var(--primary))]" />
      </div>
      <div className="font-semibold text-lg">{title}</div>
      <div className="text-sm">{description}</div>
    </div>
  );
};