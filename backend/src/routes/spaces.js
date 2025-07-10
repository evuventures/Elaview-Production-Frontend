// backend/src/routes/spaces.js
// Fixed routes to properly return your seeded properties and advertising areas

import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// ✅ PUBLIC ROUTE - GET /api/spaces - Returns properties (your seeded data)
router.get('/', async (req, res) => {
  try {
    console.log('📍 GET /api/spaces - Fetching properties with advertising areas...');

    const properties = await prisma.properties.findMany({
      where: {
        isActive: true,
        status: 'ACTIVE'
      },
      include: {
        advertising_areas: {
          where: {
            isActive: true,
            status: 'active'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`✅ Found ${properties.length} properties`);

    // Transform data to match your frontend expectations
    const transformedProperties = properties.map(property => ({
      id: property.id,
      title: property.title,
      name: property.name,
      description: property.description,
      address: property.address,
      city: property.city,
      state: property.state,
      country: property.country,
      zipCode: property.zipCode,
      latitude: property.latitude,
      longitude: property.longitude,
      propertyType: property.propertyType,
      spaceType: property.spaceType,
      size: property.size,
      primary_image: property.primary_image,
      images: property.images,
      basePrice: property.basePrice,
      pricing: property.pricing,
      currency: property.currency,
      status: property.status,
      isActive: property.isActive,
      isApproved: property.isApproved,
      ownerId: property.ownerId,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
      advertising_areas: property.advertising_areas || []
    }));

    res.json({
      success: true,
      data: transformedProperties,
      count: transformedProperties.length,
      message: `Found ${transformedProperties.length} properties`
    });

  } catch (error) {
    console.error('❌ Error fetching properties:', error);
    console.error('Stack:', error.stack);
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch properties',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ✅ GET /api/spaces/:id - Get single property with advertising areas
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📍 GET /api/spaces/${id} - Fetching single property...`);

    const property = await prisma.properties.findUnique({
      where: { id },
      include: {
        advertising_areas: {
          where: {
            isActive: true,
            status: 'active'
          }
        }
      }
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.json({
      success: true,
      data: property
    });

  } catch (error) {
    console.error('❌ Error fetching property:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch property',
      message: error.message
    });
  }
});

// ✅ GET /api/spaces/:id/areas - Get advertising areas for a property
router.get('/:id/areas', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📺 GET /api/spaces/${id}/areas - Fetching advertising areas...`);

    const areas = await prisma.advertising_areas.findMany({
      where: {
        propertyId: id,
        isActive: true,
        status: 'active'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: areas,
      count: areas.length
    });

  } catch (error) {
    console.error('❌ Error fetching advertising areas:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch advertising areas',
      message: error.message
    });
  }
});

export default router;