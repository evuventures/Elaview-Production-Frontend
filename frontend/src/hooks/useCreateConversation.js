// src/hooks/useCreateConversation.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@clerk/clerk-react';

export const useCreateConversation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { getToken, userId } = useAuth();

  const startChatAndRedirect = async ({ advertisingAreaId, ownerId }) => {
    setIsLoading(true);
    
    try {
      if (!userId) {
        window.location.href = '/sign-in';
        return;
      }

      const token = await getToken();
      const response = await fetch('/api/conversations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          advertisingAreaId,
          ownerId
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to create conversation');
      }

      const data = await response.json();
      
      if (!data?.conversationId) {
        throw new Error('Invalid response from server');
      }
      
      navigate(`/messages/${data.conversationId}`);
      toast.success(data.existing ? 'Existing conversation loaded' : 'New conversation started');
      return data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error(error.message || 'Failed to start chat');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { startChatAndRedirect, isLoading };
};