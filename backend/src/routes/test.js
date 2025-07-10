// backend/src/routes/test.js
// Simple test route to verify database connection and seeded data

import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// ✅ PUBLIC TEST ROUTE - GET /api/test
router.get('/', async (req, res) => {
  try {
    console.log('🧪 Testing database connection and seeded data...');

    // Test database connection
    const dbStatus = await prisma.$queryRaw`SELECT NOW() as current_time`;
    
    // Count seeded data
    const propertyCount = await prisma.properties.count();
    const areaCount = await prisma.advertising_areas.count();
    const userCount = await prisma.users.count();

    // Get sample property
    const sampleProperty = await prisma.properties.findFirst({
      include: {
        advertising_areas: true
      }
    });

    res.json({
      success: true,
      message: 'Database connection and seeded data test',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        current_time: dbStatus[0]?.current_time
      },
      counts: {
        properties: propertyCount,
        advertising_areas: areaCount,
        users: userCount
      },
      sample_property: sampleProperty ? {
        id: sampleProperty.id,
        title: sampleProperty.title,
        city: sampleProperty.city,
        latitude: sampleProperty.latitude,
        longitude: sampleProperty.longitude,
        advertising_areas_count: sampleProperty.advertising_areas?.length || 0
      } : null,
      endpoints_status: {
        '/api/spaces': 'Returns properties (your main map data)',
        '/api/areas': 'Returns advertising areas',
        '/api/test': 'This endpoint - database test'
      }
    });

  } catch (error) {
    console.error('❌ Database test failed:', error);
    res.status(500).json({
      success: false,
      error: 'Database test failed',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;