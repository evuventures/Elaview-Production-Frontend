// backend/src/routes/auth.js
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { Webhook } from 'svix';

const router = express.Router();
const prisma = new PrismaClient();

// Clerk webhook to sync users
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    
    if (!WEBHOOK_SECRET) {
      throw new Error('Missing CLERK_WEBHOOK_SECRET');
    }

    const headers = req.headers;
    const payload = req.body;

    const wh = new Webhook(WEBHOOK_SECRET);
    let evt;

    try {
      evt = wh.verify(payload, headers);
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return res.status(400).json({ error: 'Error verifying webhook' });
    }

    const { id } = evt.data;
    const eventType = evt.type;

    // Handle user creation
    if (eventType === 'user.created') {
      const { email_addresses, first_name, last_name, image_url } = evt.data;
      
      await prisma.user.create({
        data: {
          clerkId: id,
          email: email_addresses[0]?.email_address || '',
          firstName: first_name,
          lastName: last_name,
          imageUrl: image_url,
        }
      });
    }

    // Handle user updates
    if (eventType === 'user.updated') {
      const { email_addresses, first_name, last_name, image_url } = evt.data;
      
      await prisma.user.update({
        where: { clerkId: id },
        data: {
          email: email_addresses[0]?.email_address || '',
          firstName: first_name,
          lastName: last_name,
          imageUrl: image_url,
        }
      });
    }

    // Handle user deletion
    if (eventType === 'user.deleted') {
      await prisma.user.delete({
        where: { clerkId: id }
      });
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
router.get('/me', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Auth routes working',
      user: req.user || null
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;