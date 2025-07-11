// backend/src/routes/campaigns.js
import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/campaigns - List all campaigns with property and user data
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, userId } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;

    const campaigns = await prisma.campaign.findMany({
      where,
      include: {
        property: {
          include: {
            advertisingArea: true
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        bookings: {
          select: {
            id: true,
            status: true,
            startDate: true,
            endDate: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: parseInt(skip),
      take: parseInt(limit)
    });

    const total = await prisma.campaign.count({ where });

    console.log(`✅ Campaigns retrieved: ${campaigns.length} of ${total} total`);

    res.json({
      success: true,
      data: campaigns,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching campaigns:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch campaigns',
      error: error.message
    });
  }
});

// GET /api/campaigns/:id - Get single campaign
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        property: {
          include: {
            advertisingArea: true
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        bookings: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    console.log(`✅ Campaign retrieved: ${campaign.title}`);

    res.json({
      success: true,
      data: campaign
    });
  } catch (error) {
    console.error('❌ Error fetching campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch campaign',
      error: error.message
    });
  }
});

// POST /api/campaigns - Create new campaign
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      propertyId,
      budget,
      startDate,
      endDate,
      targetAudience,
      goals,
      status = 'DRAFT'
    } = req.body;

    // Validate required fields
    if (!title || !propertyId || !budget || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, propertyId, budget, startDate, endDate'
      });
    }

    // Verify property exists and user has access
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { user: true }
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check if user owns the property (optional - depends on your business logic)
    if (property.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'You can only create campaigns for your own properties'
      });
    }

    const campaign = await prisma.campaign.create({
      data: {
        title,
        description,
        propertyId,
        userId: req.user.id,
        budget: parseFloat(budget),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        targetAudience,
        goals,
        status
      },
      include: {
        property: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    console.log(`✅ Campaign created: ${campaign.title} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      data: campaign,
      message: 'Campaign created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create campaign',
      error: error.message
    });
  }
});

// PUT /api/campaigns/:id - Update campaign
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if campaign exists and user has access
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id },
      include: { property: true }
    });

    if (!existingCampaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Check permissions
    if (existingCampaign.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own campaigns'
      });
    }

    // Convert date strings to Date objects if present
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);
    if (updateData.budget) updateData.budget = parseFloat(updateData.budget);

    const campaign = await prisma.campaign.update({
      where: { id },
      data: updateData,
      include: {
        property: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    console.log(`✅ Campaign updated: ${campaign.title}`);

    res.json({
      success: true,
      data: campaign,
      message: 'Campaign updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update campaign',
      error: error.message
    });
  }
});

// DELETE /api/campaigns/:id - Delete campaign
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if campaign exists and user has access
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id }
    });

    if (!existingCampaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Check permissions
    if (existingCampaign.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own campaigns'
      });
    }

    await prisma.campaign.delete({
      where: { id }
    });

    console.log(`✅ Campaign deleted: ${id}`);

    res.json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete campaign',
      error: error.message
    });
  }
});

// GET /api/campaigns/analytics/summary - Campaign analytics
router.get('/analytics/summary', async (req, res) => {
  try {
    const { userId } = req.query;
    const where = userId ? { userId } : {};

    const [
      totalCampaigns,
      activeCampaigns,
      totalBudget,
      totalBookings
    ] = await Promise.all([
      prisma.campaign.count({ where }),
      prisma.campaign.count({ where: { ...where, status: 'ACTIVE' } }),
      prisma.campaign.aggregate({
        where,
        _sum: { budget: true }
      }),
      prisma.booking.count({
        where: {
          campaign: userId ? { userId } : {}
        }
      })
    ]);

    const analytics = {
      totalCampaigns,
      activeCampaigns,
      totalBudget: totalBudget._sum.budget || 0,
      totalBookings,
      averageBudget: totalCampaigns > 0 ? (totalBudget._sum.budget || 0) / totalCampaigns : 0
    };

    console.log(`✅ Campaign analytics generated`);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('❌ Error generating campaign analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate analytics',
      error: error.message
    });
  }
});

export default router;