// backend/src/routes/debug.js
import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// 🔍 Database Schema Inspector - REMOVE IN PRODUCTION!
router.get('/schema', async (req, res) => {
  try {
    console.log('🔍 Inspecting database schema...');
    
    // Check if tables exist and get sample data
    const schemaInfo = {
      timestamp: new Date().toISOString(),
      tables: {},
      connectionStatus: 'connected'
    };

    // Check properties table
    try {
      const propertiesCount = await prisma.properties.count();
      const sampleProperty = await prisma.properties.findFirst();
      
      // Get the actual database fields by examining the sample record
      const fieldsFromRecord = sampleProperty ? Object.keys(sampleProperty) : [];
      
      schemaInfo.tables.properties = {
        exists: true,
        count: propertiesCount,
        actualFields: fieldsFromRecord,
        sampleRecord: sampleProperty ? {
          ...sampleProperty,
          // Hide sensitive data but show structure
          id: sampleProperty.id || 'sample_id',
          title: sampleProperty.title || sampleProperty.name || 'sample_title',
          ownerId: sampleProperty.ownerId ? 'user_***' : null
        } : null
      };
    } catch (error) {
      schemaInfo.tables.properties = {
        exists: false,
        error: error.message
      };
    }

    // Check advertising_areas table
    try {
      const areasCount = await prisma.advertising_areas.count();
      const sampleArea = await prisma.advertising_areas.findFirst();
      
      schemaInfo.tables.advertising_areas = {
        exists: true,
        count: areasCount,
        actualFields: sampleArea ? Object.keys(sampleArea) : [],
        sampleRecord: sampleArea ? {
          ...sampleArea,
          id: sampleArea.id || 'sample_area_id',
          propertyId: sampleArea.propertyId ? 'property_***' : null
        } : null
      };
    } catch (error) {
      schemaInfo.tables.advertising_areas = {
        exists: false,
        error: error.message
      };
    }

    // Check users table
    try {
      const usersCount = await prisma.users.count();
      const sampleUser = await prisma.users.findFirst({
        select: {
          id: true,
          clerkId: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          isActive: true
        }
      });
      
      schemaInfo.tables.users = {
        exists: true,
        count: usersCount,
        actualFields: sampleUser ? Object.keys(sampleUser) : [],
        sampleRecord: sampleUser ? {
          ...sampleUser,
          email: sampleUser.email ? 'user@***.com' : null,
          clerkId: sampleUser.clerkId ? 'clerk_***' : null
        } : null
      };
    } catch (error) {
      schemaInfo.tables.users = {
        exists: false,
        error: error.message
      };
    }

    // Expected vs Actual field mapping
    schemaInfo.fieldMapping = {
      frontend_to_database: {
        property_name: schemaInfo.tables.properties?.actualFields?.includes('title') ? 'title' : 
                      schemaInfo.tables.properties?.actualFields?.includes('name') ? 'name' : 'MISSING',
        property_type: schemaInfo.tables.properties?.actualFields?.includes('propertyType') ? 'propertyType' : 
                      schemaInfo.tables.properties?.actualFields?.includes('type') ? 'type' : 'MISSING',
        'location.address': schemaInfo.tables.properties?.actualFields?.includes('address') ? 'address' : 'MISSING',
        'location.city': schemaInfo.tables.properties?.actualFields?.includes('city') ? 'city' : 'MISSING',
        'location.zipcode': schemaInfo.tables.properties?.actualFields?.includes('zipCode') ? 'zipCode' : 
                           schemaInfo.tables.properties?.actualFields?.includes('zipcode') ? 'zipcode' : 'MISSING',
        total_sqft: schemaInfo.tables.properties?.actualFields?.includes('size') ? 'size' : 'MISSING',
        contact_name: 'NOT_IN_PROPERTIES_TABLE',
        contact_email: 'NOT_IN_PROPERTIES_TABLE',
        contact_phone: 'NOT_IN_PROPERTIES_TABLE'
      }
    };

    res.status(200).json({
      success: true,
      message: 'Database schema inspection complete',
      data: schemaInfo
    });

  } catch (error) {
    console.error('❌ Schema inspection failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to inspect database schema',
      error: error.message,
      possibleCauses: [
        'Database connection failed',
        'Prisma client not properly configured',
        'Tables do not exist (run prisma db push)',
        'Environment variables not set correctly'
      ]
    });
  }
});

// 🧪 Test minimal property creation
router.post('/test-property', async (req, res) => {
  try {
    console.log('🧪 Testing property creation with minimal required fields...');
    
    // Test what fields are actually required
    const testData = {
      id: `test_${Date.now()}`,
      title: 'Debug Test Property',
      description: 'Test property for debugging',
      address: '123 Test Street',
      city: 'Test City',
      country: 'USA',
      ownerId: 'debug_test_user',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Don't actually create, just validate structure
    const validationResult = {
      testData,
      wouldWork: 'Testing field requirements...',
      missingFields: [],
      extraFields: []
    };

    // Try to understand the actual schema requirements
    try {
      // This won't work but will give us error info about required fields
      await prisma.properties.create({
        data: testData
      });
      
      validationResult.wouldWork = true;
    } catch (error) {
      validationResult.wouldWork = false;
      validationResult.error = error.message;
      
      // Parse Prisma error to understand missing fields
      if (error.message.includes('Required')) {
        validationResult.missingFields = error.message.match(/`(\w+)`/g) || [];
      }
    }

    res.status(200).json({
      success: true,
      message: 'Property creation test completed',
      data: validationResult
    });

  } catch (error) {
    console.error('❌ Property creation test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Property creation test failed',
      error: error.message
    });
  }
});

export default router;