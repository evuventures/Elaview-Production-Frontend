// backend/src/routes/campaigns.js
// Fixed to use correct Prisma model names matching your schema

import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { syncUser } from '../middleware/clerk.js';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schema
const createCampaignSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  budget: z.number().positive('Budget must be positive'),
  dailyBudget: z.number().positive().optional(),
  currency: z.string().default('USD'),
  targetAudience: z.any().optional(),
  keywords: z.array(z.string()).default([]),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)).optional(),
  propertyId: z.string().optional(),
});

// GET /api/campaigns - Get all campaigns
router.get('/', syncUser, async (req, res, next) => {
  try {
    console.log('📊 GET /api/campaigns - Fetching campaigns...');
    
    const { page = 1, limit = 10, status, isActive } = req.query;
    
    const where = {
      advertiserId: req.user.id,
      ...(status && { status }),
      ...(isActive !== undefined && { isActive: isActive === 'true' }),
    };

    // ✅ Fixed: using 'campaigns' instead of 'campaign'
    const campaigns = await prisma.campaigns.findMany({
      where,
      include: {
        properties: {
          select: { id: true, title: true, city: true, basePrice: true }
        },
        _count: {
          select: { bookings: true, invoices: true }
        }
      },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.campaigns.count({ where });

    console.log(`✅ Found ${campaigns.length} campaigns for user ${req.user.id}`);

    res.json({
      success: true,
      data: campaigns,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Error fetching campaigns:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch campaigns',
      message: error.message
    });
  }
});

// GET /api/campaigns/:id - Get campaign by ID
router.get('/:id', syncUser, async (req, res, next) => {
  try {
    const { id } = req.params;

    // ✅ Fixed: using 'campaigns' instead of 'campaign'
    const campaign = await prisma.campaigns.findUnique({
      where: { id },
      include: {
        users: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        properties: true,
        bookings: {
          include: {
            users: {
              select: { id: true, firstName: true, lastName: true, email: true }
            }
          }
        },
        invoices: true
      }
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Check if user owns the campaign
    if (campaign.advertiserId !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this campaign'
      });
    }

    res.json({
      success: true,
      data: campaign
    });
  } catch (error) {
    console.error('❌ Error fetching campaign:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch campaign',
      message: error.message
    });
  }
});

// POST /api/campaigns - Create new campaign
router.post('/', syncUser, async (req, res, next) => {
  try {
    const validatedData = createCampaignSchema.parse(req.body);

    // ✅ Fixed: using 'campaigns' instead of 'campaign'
    const campaign = await prisma.campaigns.create({
      data: {
        ...validatedData,
        advertiserId: req.user.id,
      },
      include: {
        properties: {
          select: { id: true, title: true, city: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: campaign,
      message: 'Campaign created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating campaign:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create campaign',
      message: error.message
    });
  }
});

// PUT /api/campaigns/:id - Update campaign
router.put('/:id', syncUser, async (req, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = createCampaignSchema.partial().parse(req.body);

    // Check if user owns the campaign
    const existingCampaign = await prisma.campaigns.findUnique({
      where: { id }
    });

    if (!existingCampaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    if (existingCampaign.advertiserId !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this campaign'
      });
    }

    const campaign = await prisma.campaigns.update({
      where: { id },
      data: validatedData,
      include: {
        properties: {
          select: { id: true, title: true, city: true }
        }
      }
    });

    res.json({
      success: true,
      data: campaign,
      message: 'Campaign updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating campaign:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update campaign',
      message: error.message
    });
  }
});

// POST /api/campaigns/:id/activate - Activate campaign
router.post('/:id/activate', syncUser, async (req, res, next) => {
  try {
    const { id } = req.params;

    const campaign = await prisma.campaigns.findUnique({
      where: { id }
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    if (campaign.advertiserId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to activate this campaign'
      });
    }

    const updatedCampaign = await prisma.campaigns.update({
      where: { id },
      data: {
        isActive: true,
        status: 'ACTIVE'
      }
    });

    res.json({
      success: true,
      data: updatedCampaign,
      message: 'Campaign activated successfully'
    });
  } catch (error) {
    console.error('❌ Error activating campaign:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to activate campaign',
      message: error.message
    });
  }
});

// POST /api/campaigns/:id/pause - Pause campaign
router.post('/:id/pause', syncUser, async (req, res, next) => {
  try {
    const { id } = req.params;

    const campaign = await prisma.campaigns.findUnique({
      where: { id }
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    if (campaign.advertiserId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pause this campaign'
      });
    }

    const updatedCampaign = await prisma.campaigns.update({
      where: { id },
      data: {
        isActive: false,
        status: 'PAUSED'
      }
    });

    res.json({
      success: true,
      data: updatedCampaign,
      message: 'Campaign paused successfully'
    });
  } catch (error) {
    console.error('❌ Error pausing campaign:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to pause campaign',
      message: error.message
    });
  }
});

export default router;