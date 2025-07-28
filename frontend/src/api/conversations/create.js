// src/pages/api/conversations/create.js
import { PrismaClient } from '@prisma/client';
import { getAuth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = getAuth(req);
    const { advertisingAreaId, ownerId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check for existing conversation
    const existingConversation = await prisma.conversations.findFirst({
      where: {
        participants: {
          some: {
            userId: {
              in: [userId, ownerId]
            }
          }
        },
        advertisingAreaId: advertisingAreaId
      },
      include: {
        participants: true
      }
    });

    if (existingConversation) {
      return res.status(200).json({
        conversationId: existingConversation.id,
        existing: true
      });
    }

    // Create new conversation
    const newConversation = await prisma.conversations.create({
      data: {
        type: 'DIRECT',
        advertisingAreaId: advertisingAreaId,
        participants: {
          create: [
            { userId: userId, role: 'USER' },
            { userId: ownerId, role: 'PROPERTY_OWNER' }
          ]
        }
      }
    });

    // Create initial message
    await prisma.messages.create({
      data: {
        content: `Chat started about advertising space`,
        senderId: userId,
        conversationId: newConversation.id,
        recipientId: ownerId
      }
    });

    return res.status(201).json({
      conversationId: newConversation.id,
      existing: false
    });

  } catch (error) {
    console.error('Error creating conversation:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}