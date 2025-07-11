// backend/src/routes/properties.js
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const router = express.Router();
const prisma = new PrismaClient();

// Transform frontend form data to database schema
const transformFormToDatabase = (formData, clerkUserId) => {
  return {
    id: randomUUID(),
    title: formData.property_name,
    description: formData.description || '',
    address: formData.location.address,
    city: formData.location.city,
    zipCode: formData.location.zipcode,
    latitude: formData.location.latitude,
    longitude: formData.location.longitude,
    country: 'USA', // Default for now
    size: formData.total_sqft,
    propertyType: formData.property_type,
    ownerId: clerkUserId,
    status: 'DRAFT',
    isActive: true,
    isApproved: false,
    currency: 'USD',
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

// Transform advertising areas for database
const transformAdvertisingAreas = (areas, propertyId) => {
  return areas.map(area => ({
    id: randomUUID(),
    name: area.name,
    title: area.name, // Use name as title
    description: area.location_description,
    type: area.type,
    dimensions: {
      width: area.dimensions.width,
      height: area.dimensions.height,
      unit: area.dimensions.unit
    },
    coordinates: {
      lat: null, // Will be same as property for now
      lng: null
    },
    city: '', // Will be populated from property
    state: '',
    country: 'USA',
    baseRate: area.monthly_rate,
    pricing: {
      monthly: area.monthly_rate,
      daily: Math.round(area.monthly_rate / 30),
      weekly: Math.round(area.monthly_rate / 4)
    },
    rateType: 'MONTHLY',
    currency: 'USD',
    status: 'active',
    isActive: true,
    features: area.features,
    propertyId: propertyId,
    createdAt: new Date(),
    updatedAt: new Date()
  }));
};

// Validation helper
const validatePropertyData = (formData) => {
  const errors = {};
  
  if (!formData.property_name?.trim()) {
    errors.property_name = 'Property name is required';
  }
  
  if (!formData.property_type) {
    errors.property_type = 'Property type is required';
  }
  
  if (!formData.description?.trim() || formData.description.length < 50) {
    errors.description = 'Description must be at least 50 characters';
  }
  
  if (!formData.total_sqft || formData.total_sqft <= 0) {
    errors.total_sqft = 'Total square footage must be greater than 0';
  }
  
  if (!formData.location?.address?.trim()) {
    errors.address = 'Address is required';
  }
  
  if (!formData.location?.city?.trim()) {
    errors.city = 'City is required';
  }
  
  if (!formData.location?.zipcode?.trim()) {
    errors.zipcode = 'ZIP code is required';
  }
  
  if (!formData.advertising_areas || formData.advertising_areas.length === 0) {
    errors.advertising_areas = 'At least one advertising area is required';
  }
  
  return { isValid: Object.keys(errors).length === 0, errors };
};

// 🏠 CREATE PROPERTY
router.post('/', async (req, res) => {
  try {
    console.log('🏠 Creating new property...');
    console.log('Form data received:', JSON.stringify(req.body, null, 2));
    
    // Get Clerk user info
    const clerkUserId = req.auth?.userId;
    if (!clerkUserId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required - no Clerk user ID found'
      });
    }
    
    console.log('🔑 Clerk User ID:', clerkUserId);
    
    // Check if user exists in our database
    const user = await prisma.users.findFirst({
      where: { clerkId: clerkUserId }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found in database. Please complete your profile first.'
      });
    }
    
    console.log('👤 Database user found:', user.id);
    
    // Validate form data
    const { isValid, errors } = validatePropertyData(req.body);
    if (!isValid) {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    // Transform form data for database
    const propertyData = transformFormToDatabase(req.body, user.id);
    console.log('🔄 Transformed property data:', JSON.stringify(propertyData, null, 2));
    
    // Transform advertising areas
    const advertisingAreasData = transformAdvertisingAreas(req.body.advertising_areas, propertyData.id);
    console.log('🔄 Transformed advertising areas:', advertisingAreasData.length, 'areas');
    
    // Create property and advertising areas in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create property
      const property = await tx.properties.create({
        data: propertyData
      });
      
      console.log('✅ Property created:', property.id);
      
      // Create advertising areas if any
      let advertisingAreas = [];
      if (advertisingAreasData.length > 0) {
        // Update areas with property location data
        const areasWithLocation = advertisingAreasData.map(area => ({
          ...area,
          city: property.city,
          state: property.state,
          coordinates: {
            lat: property.latitude,
            lng: property.longitude
          }
        }));
        
        // Create all areas
        for (const areaData of areasWithLocation) {
          const area = await tx.advertising_areas.create({
            data: areaData
          });
          advertisingAreas.push(area);
        }
        
        console.log('✅ Advertising areas created:', advertisingAreas.length);
      }
      
      return { property, advertisingAreas };
    });
    
    console.log('🎉 Property creation completed successfully');
    
    // Return success response
    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: {
        property_id: result.property.id,
        property: {
          id: result.property.id,
          title: result.property.title,
          address: result.property.address,
          city: result.property.city,
          status: result.property.status
        },
        advertising_areas: result.advertisingAreas.map(area => ({
          id: area.id,
          name: area.name,
          type: area.type
        })),
        next_steps: [
          'Your property has been submitted for review',
          'You will receive an email notification once approved',
          'You can view and edit your property in the dashboard'
        ]
      }
    });
    
  } catch (error) {
    console.error('❌ Property creation failed:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'A property with this information already exists'
      });
    }
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Referenced record not found'
      });
    }
    
    // Generic error response
    res.status(500).json({
      success: false,
      message: 'Failed to create property',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// 🏠 GET ALL PROPERTIES (for the property owner)
router.get('/', async (req, res) => {
  try {
    const clerkUserId = req.auth?.userId;
    if (!clerkUserId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Get user from database
    const user = await prisma.users.findFirst({
      where: { clerkId: clerkUserId }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get user's properties with advertising areas
    const properties = await prisma.properties.findMany({
      where: { ownerId: user.id },
      include: {
        advertising_areas: {
          select: {
            id: true,
            name: true,
            type: true,
            baseRate: true,
            isActive: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.status(200).json({
      success: true,
      data: properties
    });
    
  } catch (error) {
    console.error('❌ Failed to fetch properties:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch properties',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// 🏠 GET SINGLE PROPERTY
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const clerkUserId = req.auth?.userId;
    
    if (!clerkUserId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Get user from database
    const user = await prisma.users.findFirst({
      where: { clerkId: clerkUserId }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get property with advertising areas
    const property = await prisma.properties.findFirst({
      where: { 
        id: id,
        ownerId: user.id // Ensure user owns this property
      },
      include: {
        advertising_areas: true
      }
    });
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found or access denied'
      });
    }
    
    res.status(200).json({
      success: true,
      data: property
    });
    
  } catch (error) {
    console.error('❌ Failed to fetch property:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch property',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;