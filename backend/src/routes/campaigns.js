// backend/src/routes/campaigns.js
// Updated to handle enhanced campaign fields matching your schema

import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import crypto from 'crypto';
import { syncUser } from '../middleware/clerk.js';

const router = express.Router();
const prisma = new PrismaClient();

// ✅ UPDATED: Enhanced validation schema to match your full schema
const createCampaignSchema = z.object({
  // Core fields - flexible naming
  name: z.string().min(1, 'Campaign name is required'),
  title: z.string().optional(),
  brand_name: z.string().min(1, 'Brand name is required'),
  description: z.string().optional(),
  content_description: z.string().optional(),
  
  // Budget fields - flexible naming
  budget: z.number().positive().optional(),
  total_budget: z.number().positive().optional(),
  dailyBudget: z.number().positive().optional(),
  currency: z.string().default('USD'),
  
  // Date fields - flexible naming
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  
  // Enhanced strategic fields
  primary_objective: z.string().optional(),
  target_demographics: z.union([z.string(), z.object({}).passthrough()]).optional(),
  geographic_targeting: z.union([z.string(), z.object({}).passthrough()]).optional(),
  creative_concept: z.string().optional(),
  call_to_action: z.string().optional(),
  brand_guidelines: z.union([z.string(), z.object({}).passthrough()]).optional(),
  placement_preferences: z.union([z.string(), z.object({}).passthrough()]).optional(),
  success_metrics: z.union([z.string(), z.object({}).passthrough()]).optional(),
  technical_specs: z.union([z.string(), z.object({}).passthrough()]).optional(),
  
  // Media and content fields
  media_files: z.union([z.string(), z.array(z.any())]).optional(),
  media_type: z.string().optional(),
  media_dimensions: z.string().optional(),
  content_type: z.union([z.string(), z.array(z.string()), z.object({}).passthrough()]).optional(),
  
  // Additional fields
  keywords: z.union([z.string(), z.array(z.string())]).optional(),
  targetAudience: z.any().optional(),
  notes: z.string().optional(),
  propertyId: z.string().optional(),
  advertiser_id: z.string().optional(),
  status: z.string().optional().default('PLANNING')
});

// Helper function to normalize campaign data
const normalizeCampaignData = (data, userId) => {
  // Parse JSON strings if they exist
  const parseJsonField = (field) => {
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch {
        return field;
      }
    }
    return field;
  };

  return {
    // ✅ ADD: Generate UUID for the campaign
    id: crypto.randomUUID(),
    // Core fields
    name: data.name,
    title: data.title || data.name,
    brand_name: data.brand_name,
    description: data.description,
    content_description: data.content_description,
    
    // Budget - use total_budget if provided, otherwise budget
    budget: data.total_budget || data.budget,
    total_budget: data.total_budget || data.budget,
    dailyBudget: data.dailyBudget,
    currency: data.currency || 'USD',
    
    // Dates - normalize to both formats
    start_date: new Date(data.start_date || data.startDate),
    end_date: data.end_date ? new Date(data.end_date) : (data.endDate ? new Date(data.endDate) : null),
    startDate: new Date(data.start_date || data.startDate),
    endDate: data.end_date ? new Date(data.end_date) : (data.endDate ? new Date(data.endDate) : null),
    
    // Enhanced strategic fields
    primary_objective: data.primary_objective,
    target_demographics: parseJsonField(data.target_demographics),
    geographic_targeting: parseJsonField(data.geographic_targeting),
    creative_concept: data.creative_concept,
    call_to_action: data.call_to_action,
    brand_guidelines: parseJsonField(data.brand_guidelines),
    placement_preferences: parseJsonField(data.placement_preferences),
    success_metrics: parseJsonField(data.success_metrics),
    technical_specs: parseJsonField(data.technical_specs),
    
    // Media fields
    media_files: parseJsonField(data.media_files),
    media_type: data.media_type,
    media_dimensions: data.media_dimensions,
    content_type: parseJsonField(data.content_type),
    
    // Additional fields
    keywords: parseJsonField(data.keywords),
    targetAudience: parseJsonField(data.targetAudience),
    notes: data.notes,
    
    // System fields
    advertiserId: userId,
    advertiser_id: userId,
    propertyId: data.propertyId,
    status: data.status ? data.status.toUpperCase() : 'PLANNING', // ✅ FIXED: Convert to uppercase
    isActive: false
  };
};

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
    console.log('🚀 Creating campaign with data:', req.body);
    
    // Validate the incoming data
    const validatedData = createCampaignSchema.parse(req.body);
    console.log('✅ Data validation passed');
    
    // Normalize the data for database insertion
    const normalizedData = normalizeCampaignData(validatedData, req.user.id);
    console.log('📝 Normalized data for database:', normalizedData);

    // Create the campaign
    const campaign = await prisma.campaigns.create({
      data: normalizedData,
      include: {
        properties: {
          select: { id: true, title: true, city: true }
        }
      }
    });

    console.log('✅ Campaign created successfully:', campaign.id);

    res.status(201).json({
      success: true,
      data: campaign,
      message: 'Campaign created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating campaign:', error);
    
    // Better error messages for validation errors
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
        details: error.errors
      });
    }
    
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

    // Normalize the update data
    const normalizedData = normalizeCampaignData(validatedData, req.user.id);

    const campaign = await prisma.campaigns.update({
      where: { id },
      data: normalizedData,
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