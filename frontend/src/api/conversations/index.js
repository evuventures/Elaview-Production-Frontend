// src/pages/api/conversations/index.js
import { PrismaClient } from '@prisma/client';
import { getAuth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { userId } = getAuth(req);
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const conversations = await prisma.conversations.findMany({
      where: {
        participants: {
          some: { userId }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                full_name: true,
                imageUrl: true
              }
            }
          }
        },
        lastMessage: true,
        advertisingArea: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    const formattedConversations = conversations.map(async conv => ({
      id: conv.id,
      participant_ids: conv.participants.map(p => p.userId),
      participants: conv.participants.map(p => ({
        id: p.user.id,
        full_name: p.user.full_name,
        imageUrl: p.user.imageUrl
      })),
      lastMessage: conv.lastMessage?.content || 'No messages yet',
      lastActivity: conv.updatedAt,
      advertisingArea: conv.advertisingArea,
      unreadCount: await prisma.messages.count({
        where: {
          conversationId: conv.id,
          recipientId: userId,
          is_read: false
        }
      })
    }));

    return res.status(200).json(formattedConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}