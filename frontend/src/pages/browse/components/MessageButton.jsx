// src/components/MessageButton.jsx
'use client';

import { MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@clerk/clerk-react';
import { useCreateConversation } from '@/hooks/useCreateConversation';

export const MessageButton = ({
  advertisingAreaId,
  ownerId,
  ownerName,
  disabled = false,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const { isLoaded, userId } = useAuth();
  const { startChatAndRedirect, isLoading } = useCreateConversation();

  if (!isLoaded) {
    return (
      <Button disabled variant={variant} size={size} className={className}>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (userId === ownerId) {
    return null;
  }

  const handleMessageClick = async () => {
    try {
      await startChatAndRedirect({ advertisingAreaId, ownerId });
    } catch (error) {
      console.error('Failed to start chat:', error);
    }
  };

  return (
    <Button
      onClick={handleMessageClick}
      disabled={disabled || isLoading}
      variant={variant}
      size={size}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <MessageCircle className="w-4 h-4 mr-2" />
      )}
      {isLoading ? 'Starting chat...' : `Message ${ownerName || 'Owner'}`}
    </Button>
  );
};