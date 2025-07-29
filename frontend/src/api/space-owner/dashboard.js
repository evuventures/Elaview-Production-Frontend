// pages/api/space-owner/dashboard.js
import { getSession } from '@clerk/nextjs';
import apiClient from '@/api/apiClient';

export default async function handler(req, res) {
  const session = await getSession(req);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const result = await apiClient.getSpaceOwnerDashboard(session.userId);
      
      if (result.success) {
        res.status(200).json(result.data);
      } else {
        res.status(400).json({ error: result.error });
      }
    } catch (error) {
      console.error('Dashboard API error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}