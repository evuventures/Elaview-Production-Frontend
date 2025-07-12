// backend/src/routes/properties.js
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const router = express.Router();
const prisma = new PrismaClient();

// ✅ Default coordinates for major cities (fallback for vehicles)
const getCityDefaultCoordinates = (city, state = 'CA') => {
  const cityDefaults = {
    'los angeles': { lat: 34.0522, lng: -118.2437 },
    'san francisco': { lat: 37.7749, lng: -122.4194 },
    'san diego': { lat: 32.7157, lng: -117.1611 },
    'sacramento': { lat: 38.5816, lng: -121.4944 },
    'fresno': { lat: 36.7378, lng: -119.7871 },
    'oakland': { lat: 37.8044, lng: -122.2712 },
    'irvine': { lat: 33.6846, lng: -117.8265 },
    'anaheim': { lat: 33.8366, lng: -117.9143 },
    'santa ana': { lat: 33.7455, lng: -117.8677 },
    'riverside': { lat: 33.9533, lng: -117.3962 },
    'orange': { lat: 33.7879, lng: -117.8531 },
    'fullerton': { lat: 33.8704, lng: -117.9242 },
    'huntington beach': { lat: 33.6595, lng: -117.9988 },
    'costa mesa': { lat: 33.6412, lng: -117.9187 },
    'newport beach': { lat: 33.6189, lng: -117.9298 },
    'long beach': { lat: 33.7701, lng: -118.1937 },
    'pasadena': { lat: 34.1478, lng: -118.1445 },
    'glendale': { lat: 34.1425, lng: -118.2551 },
    'santa clarita': { lat: 34.3917, lng: -118.5426 },
    'pomona': { lat: 34.0552, lng: -117.7499 },
    'torrance': { lat: 33.8358, lng: -118.3406 },
    'sunnyvale': { lat: 37.3688, lng: -122.0363 },
    'fremont': { lat: 37.5485, lng: -121.9886 },
    'hayward': { lat: 37.6688, lng: -122.0808 },
    'concord': { lat: 37.9780, lng: -122.0311 },
    'visalia': { lat: 36.3302, lng: -119.2921 },
    'thousand oaks': { lat: 34.1706, lng: -118.8376 },
    'simi valley': { lat: 34.2694, lng: -118.7815 },
    'santa monica': { lat: 34.0195, lng: -118.4912 },
    'beverly hills': { lat: 34.0736, lng: -118.4004 },
    'west hollywood': { lat: 34.0900, lng: -118.3617 },
    'manhattan beach': { lat: 33.8847, lng: -118.4109 },
    'redondo beach': { lat: 33.8492, lng: -118.3887 },
    'hermosa beach': { lat: 33.8622, lng: -118.3994 },
    'el segundo': { lat: 33.9164, lng: -118.4015 },
    'culver city': { lat: 34.0211, lng: -118.3965 }
    // Add more cities as needed
  };
  
  const cityKey = city.toLowerCase().trim();
  const coords = cityDefaults[cityKey];
  
  if (coords) {
    console.log(`📍 Found coordinates for ${city}: ${coords.lat}, ${coords.lng}`);
    return coords;
  } else {
    console.log(`⚠️ No specific coordinates for ${city}, using Los Angeles default`);
    return { lat: 34.0522, lng: -118.2437 }; // Default to LA
  }
};

// ✅ UPDATED: Transform function with better coordinate handling
const transformFormToDatabase = (formData, databaseUserId) => {
  let latitude = formData.location.latitude;
  let longitude = formData.location.longitude;
  
  // ✅ Handle missing coordinates intelligently
  if (!latitude || !longitude) {
    const isVehicleFleet = formData.property_type === 'VEHICLE_FLEET';
    
    if (isVehicleFleet) {
      // For vehicles, use city defaults
      const cityDefaults = getCityDefaultCoordinates(formData.location.city);
      latitude = cityDefaults.lat;
      longitude = cityDefaults.lng;
      console.log(`🚛 Vehicle fleet: Using default coordinates for ${formData.location.city}`);
    } else {
      // For fixed properties, this should not happen due to validation
      console.error('❌ Fixed property missing coordinates - this should have been caught by validation');
      throw new Error('Coordinates are required for fixed properties');
    }
  } else {
    console.log(`📍 Using provided coordinates: ${latitude}, ${longitude}`);
  }

  return {
    id: randomUUID(),
    title: formData.property_name,
    description: formData.description || '',
    address: formData.location.address || '', // Empty for VEHICLE_FLEET is OK
    city: formData.location.city,
    zipCode: formData.location.zipcode,
    latitude: latitude ? parseFloat(latitude) : null,
    longitude: longitude ? parseFloat(longitude) : null,
    country: 'USA',
    size: formData.total_sqft,
    propertyType: formData.property_type,
    ownerId: databaseUserId,
    status: 'ACTIVE', // ✅ Auto-activate for immediate visibility
    isActive: true,
    isApproved: true, // ✅ Auto-approve for immediate visibility
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

// ✅ UPDATED: More flexible validation that works with address picker
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
  
  // ✅ Property type specific validation
  const isVehicleFleet = formData.property_type === 'VEHICLE_FLEET';
  
  if (!isVehicleFleet && !formData.location?.address?.trim()) {
    errors.address = 'Address is required for fixed properties';
  }
  
  if (!formData.location?.city?.trim()) {
    errors.city = 'City is required';
  }
  
  if (!formData.location?.zipcode?.trim()) {
    errors.zipcode = 'ZIP code is required';
  }
  
  // ✅ UPDATED: Coordinate validation - required for fixed properties, optional for vehicles
  if (!isVehicleFleet) {
    if (!formData.location?.latitude || !formData.location?.longitude) {
      errors.coordinates = 'Location coordinates are required for fixed properties. Please select your exact location on the map.';
    }
  }
  // For vehicles, coordinates are optional and will be defaulted if missing
  
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
    
    // ✅ FIXED: Use req.user and req.clerkId set by middleware
    if (!req.user || !req.clerkId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required - middleware did not provide user info'
      });
    }
    
    console.log('🔑 Clerk User ID:', req.clerkId);
    console.log('👤 Database User ID:', req.user.id);
    
    // ✅ SIMPLIFIED: User already validated by middleware, no need to re-fetch
    const user = req.user;
    
    // Validate form data
    const { isValid, errors } = validatePropertyData(req.body);
    if (!isValid) {
      console.log('❌ Validation failed:', errors);
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
          status: result.property.status,
          latitude: result.property.latitude,
          longitude: result.property.longitude
        },
        advertising_areas: result.advertisingAreas.map(area => ({
          id: area.id,
          name: area.name,
          type: area.type
        })),
        next_steps: [
          'Your property is now live and visible to advertisers',
          'You can view and manage your property in the dashboard',
          'Advertisers can now discover and book your advertising spaces'
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
    // ✅ FIXED: Use middleware-provided user info
    if (!req.user || !req.clerkId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // ✅ SIMPLIFIED: Use middleware-provided user
    const user = req.user;
    
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
    
    // ✅ FIXED: Use middleware-provided user info
    if (!req.user || !req.clerkId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // ✅ SIMPLIFIED: Use middleware-provided user
    const user = req.user;
    
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