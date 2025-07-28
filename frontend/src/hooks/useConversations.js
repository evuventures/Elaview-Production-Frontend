// src/hooks/useConversations.js
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

export const useConversations = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getToken, userId } = useAuth();

  const fetchConversations = async () => {
    try {
      const token = await getToken();
      const response = await fetch('/api/conversations', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data = await response.json();
      setConversations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchConversations();
    }
  }, [userId]);

  const refreshConversations = () => {
    setLoading(true);
    fetchConversations();
  };

  return { conversations, loading, error, refreshConversations };
};