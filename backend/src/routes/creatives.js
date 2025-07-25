// backend/src/routes/creatives.js
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { syncUser } from '../middleware/clerk.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/creatives - List user's creatives
router.get('/', syncUser, async (req, res, next) => {
  try {
    const creatives = await prisma.creatives.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        booking: {
          select: { id: true, advertisingAreaId: true }
        },
        campaign: {
          select: { id: true, name: true }
        }
      }
    });

    res.json({
      success: true,
      data: creatives
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/creatives - Save creative metadata after Cloudinary upload
router.post('/', syncUser, async (req, res, next) => {
  try {
    const {
      name,
      type,
      url,
      publicId,
      size,
      format,
      width,
      height,
      bookingId,
      campaignId
    } = req.body;

    // Validate required fields
    if (!name || !type || !url || !publicId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, type, url, publicId'
      });
    }

    // Validate file type
    if (!['image', 'video', 'document'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file type. Must be image, video, or document'
      });
    }

    const creative = await prisma.creatives.create({
      data: {
        name,
        type,
        url,
        publicId,
        size: parseInt(size) || 0,
        format: format || null,
        width: width ? parseInt(width) : null,
        height: height ? parseInt(height) : null,
        userId: req.user.id,
        bookingId: bookingId || null,
        campaignId: campaignId || null,
        status: 'pending'
      }
    });

    res.json({
      success: true,
      data: creative
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/creatives/:id - Delete creative
router.delete('/:id', syncUser, async (req, res, next) => {
  try {
    const creative = await prisma.creatives.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id // Ensure user owns this creative
      }
    });

    if (!creative) {
      return res.status(404).json({
        success: false,
        error: 'Creative not found'
      });
    }

    await prisma.creatives.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Creative deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/creatives/:id/approve - Property owner approves creative
router.put('/:id/approve', syncUser, async (req, res, next) => {
  try {
    const { notes } = req.body;
    
    const creative = await prisma.creatives.update({
      where: { id: req.params.id },
      data: { 
        status: 'approved',
        notes: notes || null
      }
    });

    res.json({
      success: true,
      data: creative
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/creatives/:id/reject - Property owner rejects creative
router.put('/:id/reject', syncUser, async (req, res, next) => {
  try {
    const { notes } = req.body;
    
    const creative = await prisma.creatives.update({
      where: { id: req.params.id },
      data: { 
        status: 'rejected',
        notes: notes || 'Creative rejected'
      }
    });

    res.json({
      success: true,
      data: creative
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/creatives/pending - Property owners get creatives awaiting review
router.get('/pending', syncUser, async (req, res, next) => {
  try {
    // Find creatives for bookings where user owns the property
    const creatives = await prisma.creatives.findMany({
      where: {
        status: 'pending',
        booking: {
          properties: {
            ownerId: req.user.id
          }
        }
      },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true }
        },
        booking: {
          select: { 
            id: true, 
            properties: { select: { title: true } },
            advertising_areas: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: creatives
    });
  } catch (error) {
    next(error);
  }
});

export default router;