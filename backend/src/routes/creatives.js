// backend/src/routes/creatives.js - Creative Assets API Endpoints
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { syncUser } from '../middleware/clerk.js';

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/creatives - Create new creative asset
router.post('/', syncUser, async (req, res) => {
  try {
    const { name, type, url, publicId, size, width, height, status = 'pending' } = req.body;
    const userId = req.user.id;

    console.log(`📸 Creating creative asset: ${name}`);

    const creative = await prisma.creatives.create({
      data: {
        name,
        type,
        url,
        publicId,
        size,
        width,
        height,
        status,
        userId,
        // Optional: Link to specific booking or campaign
        bookingId: req.body.bookingId || null,
        campaignId: req.body.campaignId || null
      }
    });

    console.log(`✅ Creative asset created: ${creative.id}`);
    res.json({ success: true, data: creative });

  } catch (error) {
    console.error('❌ Error creating creative:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create creative asset' 
    });
  }
});

// GET /api/creatives - Get user's creative assets
router.get('/', syncUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, status } = req.query;

    const where = { userId };
    if (status) {
      where.status = status;
    }

    const creatives = await prisma.creatives.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      include: {
        booking: {
          select: { id: true, startDate: true, endDate: true }
        },
        campaign: {
          select: { id: true, name: true, title: true }
        }
      }
    });

    const total = await prisma.creatives.count({ where });

    res.json({
      success: true,
      data: creatives,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ Error fetching creatives:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch creative assets' 
    });
  }
});

// GET /api/creatives/:id - Get specific creative asset
router.get('/:id', syncUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const creative = await prisma.creatives.findFirst({
      where: { 
        id,
        userId // Ensure user can only access their own creatives
      },
      include: {
        booking: {
          select: { id: true, startDate: true, endDate: true }
        },
        campaign: {
          select: { id: true, name: true, title: true }
        }
      }
    });

    if (!creative) {
      return res.status(404).json({ 
        success: false, 
        error: 'Creative asset not found' 
      });
    }

    res.json({ success: true, data: creative });

  } catch (error) {
    console.error('❌ Error fetching creative:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch creative asset' 
    });
  }
});

// PUT /api/creatives/:id - Update creative asset
router.put('/:id', syncUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, status, notes } = req.body;

    // Verify ownership
    const existing = await prisma.creatives.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      return res.status(404).json({ 
        success: false, 
        error: 'Creative asset not found' 
      });
    }

    const updated = await prisma.creatives.update({
      where: { id },
      data: {
        name: name || existing.name,
        status: status || existing.status,
        notes: notes || existing.notes,
        updatedAt: new Date()
      }
    });

    console.log(`✅ Creative asset updated: ${id}`);
    res.json({ success: true, data: updated });

  } catch (error) {
    console.error('❌ Error updating creative:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update creative asset' 
    });
  }
});

// DELETE /api/creatives/:id - Delete creative asset
router.delete('/:id', syncUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify ownership and get Cloudinary public_id
    const creative = await prisma.creatives.findFirst({
      where: { id, userId }
    });

    if (!creative) {
      return res.status(404).json({ 
        success: false, 
        error: 'Creative asset not found' 
      });
    }

    // Delete from database
    await prisma.creatives.delete({
      where: { id }
    });

    // TODO: Delete from Cloudinary using the publicId
    // You can use the Cloudinary admin API here:
    // await cloudinary.uploader.destroy(creative.publicId);

    console.log(`✅ Creative asset deleted: ${id}`);
    res.json({ success: true, message: 'Creative asset deleted' });

  } catch (error) {
    console.error('❌ Error deleting creative:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete creative asset' 
    });
  }
});

// PUT /api/creatives/:id/approve - Admin: Approve creative asset
router.put('/:id/approve', syncUser, async (req, res) => {
  try {
    // TODO: Add admin role check
    const { id } = req.params;
    const { notes } = req.body;

    const updated = await prisma.creatives.update({
      where: { id },
      data: {
        status: 'approved',
        notes,
        updatedAt: new Date()
      }
    });

    console.log(`✅ Creative asset approved: ${id}`);
    res.json({ success: true, data: updated });

  } catch (error) {
    console.error('❌ Error approving creative:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to approve creative asset' 
    });
  }
});

// PUT /api/creatives/:id/reject - Admin: Reject creative asset
router.put('/:id/reject', syncUser, async (req, res) => {
  try {
    // TODO: Add admin role check
    const { id } = req.params;
    const { notes } = req.body;

    const updated = await prisma.creatives.update({
      where: { id },
      data: {
        status: 'rejected',
        notes,
        updatedAt: new Date()
      }
    });

    console.log(`✅ Creative asset rejected: ${id}`);
    res.json({ success: true, data: updated });

  } catch (error) {
    console.error('❌ Error rejecting creative:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to reject creative asset' 
    });
  }
});

export default router;