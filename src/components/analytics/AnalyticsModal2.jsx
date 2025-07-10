import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import SpaceAnalytics from './SpaceAnalytics';

const AnalyticsModal = ({ isOpen, onClose, space }) => {
  if (!space) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[90vw] h-[90vh] flex flex-col glass border-[hsl(var(--border))]">
        <DialogHeader className="p-6 border-b border-[hsl(var(--border))]">
          <DialogTitle className="text-2xl font-bold text-[hsl(var(--foreground))]">Full Analytics Report</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Detailed marketing and traffic analysis for "{space.title}".
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full p-6">
            <SpaceAnalytics space={space} />
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnalyticsModal;