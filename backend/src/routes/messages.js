// backend/src/routes/messages.js
// Fixed to use correct Prisma model names matching your schema

import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { syncUser } from '../middleware/clerk.js';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createMessageSchema = z.object({
  subject: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  recipientId: z.string().min(1, 'Recipient is required'),
  type: z.enum(['GENERAL', 'BOOKING_UPDATE', 'PAYMENT_REMINDER', 'SYSTEM_NOTIFICATION', 'SUPPORT_TICKET']).default('GENERAL'),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
});

const createChatMessageSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  chatRoom: z.string().min(1, 'Chat room is required'),
});

// GET /api/messages - Get all messages for current user
router.get('/', syncUser, async (req, res, next) => {
  try {
    console.log('💬 GET /api/messages - Fetching messages...');
    
    const { page = 1, limit = 20, isRead, type } = req.query;
    
    const where = {
      recipientId: req.user.id,
      ...(isRead !== undefined && { isRead: isRead === 'true' }),
      ...(type && { type }),
    };

    // ✅ Fixed: using 'messages' instead of 'message'
    const messages = await prisma.messages.findMany({
      where,
      include: {
        users: {
          select: { id: true, firstName: true, lastName: true, email: true, imageUrl: true }
        }
      },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.messages.count({ where });
    const unreadCount = await prisma.messages.count({ 
      where: { recipientId: req.user.id, isRead: false } 
    });

    console.log(`✅ Found ${messages.length} messages for user ${req.user.id} (${unreadCount} unread)`);

    res.json({
      success: true,
      data: messages,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages',
      message: error.message
    });
  }
});

// GET /api/messages/:id - Get specific message
router.get('/:id', syncUser, async (req, res, next) => {
  try {
    const { id } = req.params;

    // ✅ Fixed: using 'messages' instead of 'message'
    const message = await prisma.messages.findUnique({
      where: { id },
      include: {
        users: {
          select: { id: true, firstName: true, lastName: true, email: true, imageUrl: true }
        }
      }
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the recipient
    if (message.recipientId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this message'
      });
    }

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('❌ Error fetching message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch message',
      message: error.message
    });
  }
});

// POST /api/messages - Send new message
router.post('/', syncUser, async (req, res, next) => {
  try {
    const validatedData = createMessageSchema.parse(req.body);

    // Check if recipient exists
    const recipient = await prisma.users.findUnique({
      where: { id: validatedData.recipientId }
    });

    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    // ✅ Fixed: using 'messages' instead of 'message'
    const message = await prisma.messages.create({
      data: {
        ...validatedData,
        senderId: req.user.id,
      },
      include: {
        users: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: message,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message',
      message: error.message
    });
  }
});

// POST /api/messages/:id/read - Mark message as read
router.post('/:id/read', syncUser, async (req, res, next) => {
  try {
    const { id } = req.params;

    const message = await prisma.messages.findUnique({
      where: { id }
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    if (message.recipientId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this message'
      });
    }

    const updatedMessage = await prisma.messages.update({
      where: { id },
      data: { isRead: true }
    });

    res.json({
      success: true,
      data: updatedMessage,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('❌ Error marking message as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark message as read',
      message: error.message
    });
  }
});

// DELETE /api/messages/:id - Delete message
router.delete('/:id', syncUser, async (req, res, next) => {
  try {
    const { id } = req.params;

    const message = await prisma.messages.findUnique({
      where: { id }
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    if (message.recipientId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }

    await prisma.messages.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete message',
      message: error.message
    });
  }
});

// CHAT ENDPOINTS

// GET /api/messages/chat/:room - Get chat messages for a room
router.get('/chat/:room', syncUser, async (req, res, next) => {
  try {
    const { room } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // ✅ Fixed: using 'chat_messages' instead of 'chatMessage'
    const messages = await prisma.chat_messages.findMany({
      where: { chatRoom: room },
      include: {
        users: {
          select: { id: true, firstName: true, lastName: true, imageUrl: true }
        }
      },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { createdAt: 'asc' }
    });

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('❌ Error fetching chat messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chat messages',
      message: error.message
    });
  }
});

// POST /api/messages/chat - Send chat message
router.post('/chat', syncUser, async (req, res, next) => {
  try {
    const validatedData = createChatMessageSchema.parse(req.body);

    // ✅ Fixed: using 'chat_messages' instead of 'chatMessage'
    const chatMessage = await prisma.chat_messages.create({
      data: {
        ...validatedData,
        senderId: req.user.id,
      },
      include: {
        users: {
          select: { id: true, firstName: true, lastName: true, imageUrl: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: chatMessage
    });
  } catch (error) {
    console.error('❌ Error sending chat message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send chat message',
      message: error.message
    });
  }
});

export default router;