// backend/src/routes/advertising-areas.js
// Fixed route to return your seeded advertising areas

import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { syncUser, requireAdmin } from '../middleware/clerk.js';

const router = express.Router();
const prisma = new PrismaClient();

// ✅ PUBLIC ROUTE - GET /api/areas - Browse areas (no authentication required)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, propertyId } = req.query;

    console.log('📺 GET /api/areas - Fetching advertising areas...');

    // Build where clause
    const whereClause = {
      isActive: true,
      status: 'active'
    };

    // Filter by property if specified
    if (propertyId) {
      whereClause.propertyId = propertyId;
    }

    const areas = await prisma.advertising_areas.findMany({
      where: whereClause,
      include: {
        properties: {
          select: {
            id: true,
            title: true,
            name: true,
            city: true,
            state: true,
            address: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    const totalCount = await prisma.advertising_areas.count({
      where: whereClause
    });

    console.log(`✅ Found ${areas.length} advertising areas (${totalCount} total)`);

    res.json({
      success: true,
      data: areas,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ Error fetching advertising areas:', error);
    console.error('Stack:', error.stack);
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch advertising areas',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ✅ GET /api/areas/:id - Get single advertising area
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📺 GET /api/areas/${id} - Fetching single area...`);

    const area = await prisma.advertising_areas.findUnique({
      where: { id },
      include: {
        properties: true
      }
    });

    if (!area) {
      return res.status(404).json({
        success: false,
        message: 'Advertising area not found'
      });
    }

    res.json({
      success: true,
      data: area
    });

  } catch (error) {
    console.error('❌ Error fetching advertising area:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch advertising area',
      message: error.message
    });
  }
});

// ✅ PROTECTED ROUTES - Require authentication

router.post('/', syncUser, async (req, res) => {
  try {
    // TODO: Implement create advertising area
    res.status(501).json({ 
      success: false, 
      message: 'Create advertising area not implemented yet' 
    });
  } catch (error) {
    console.error('❌ Error creating advertising area:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create advertising area',
      message: error.message
    });
  }
});

router.put('/:id', syncUser, async (req, res) => {
  try {
    // TODO: Implement update advertising area
    res.status(501).json({ 
      success: false, 
      message: 'Update advertising area not implemented yet' 
    });
  } catch (error) {
    console.error('❌ Error updating advertising area:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update advertising area',
      message: error.message
    });
  }
});

router.delete('/:id', syncUser, async (req, res) => {
  try {
    // TODO: Implement delete advertising area
    res.status(501).json({ 
      success: false, 
      message: 'Delete advertising area not implemented yet' 
    });
  } catch (error) {
    console.error('❌ Error deleting advertising area:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete advertising area',
      message: error.message
    });
  }
});

export default router;