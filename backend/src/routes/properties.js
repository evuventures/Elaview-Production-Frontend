// backend/src/routes/properties.js
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { syncUser, requireAdmin } from '../middleware/clerk.js';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createPropertySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  title: z.string().optional(),
  description: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  zipcode: z.string().optional(),
  zipCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  type: z.string().min(1, 'Property type is required'),
  propertyType: z.enum(['HOUSE', 'APARTMENT', 'CONDO', 'COMMERCIAL', 'LAND', 'WAREHOUSE', 'OFFICE', 'RETAIL', 'OTHER', 'building', 'vehicle_fleet', 'event_venue', 'transit_station', 'other']).optional(),
  size: z.number().positive().optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  images: z.array(z.string().url()).default([]),
  photos: z.array(z.string().url()).default([]),
  videos: z.array(z.string().url()).default([]),
  documents: z.array(z.string().url()).default([]),
  basePrice: z.number().positive('Base price must be positive').optional(),
  currency: z.string().default('USD'),
  primary_image: z.string().optional(),
  location: z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    zipcode: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }).optional(),
});

// ✅ PUBLIC ROUTE - GET /api/properties - Browse properties (no authentication required)
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 50, status, city, propertyType, type } = req.query;
    
    // ✅ PUBLIC FILTER - Only show approved and active properties to public users
    const where = {
      status: 'active', // Only active properties
      // Add additional public filters
      ...(city && { 
        OR: [
          { city: { contains: city, mode: 'insensitive' } },
          { location: { path: ['city'], string_contains: city } }
        ]
      }),
      ...(propertyType && { 
        OR: [
          { propertyType },
          { type: propertyType }
        ]
      }),
      ...(type && { type }),
    };

    console.log('🏠 Public properties request:', { where, page, limit });

    const properties = await prisma.property.findMany({
      where,
      select: {
        // ✅ PUBLIC FIELDS - Only return safe, public information
        id: true,
        name: true,
        title: true,
        description: true,
        address: true,
        city: true,
        state: true,
        country: true,
        zipcode: true,
        zipCode: true,
        latitude: true,
        longitude: true,
        location: true,
        type: true,
        propertyType: true,
        size: true,
        bedrooms: true,
        bathrooms: true,
        images: true,
        photos: true,
        primary_image: true,
        basePrice: true,
        currency: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        // ✅ PUBLIC OWNER INFO - Limited owner information
        owner: {
          select: { 
            id: true, 
            full_name: true,
            firstName: true, 
            lastName: true,
            // Don't expose email/phone to public
          }
        },
        // ✅ PUBLIC ADVERTISING AREAS - Show available advertising spaces
        advertising_areas: {
          where: { status: 'active' },
          select: {
            id: true,
            title: true,
            type: true,
            description: true,
            pricing: true,
            dimensions: true,
            images: true,
            features: true,
            status: true,
          }
        },
        advertisingAreas: {
          where: { status: 'active' },
          select: {
            id: true,
            title: true,
            type: true,
            description: true,
            pricing: true,
            dimensions: true,
            images: true,
            features: true,
            status: true,
          }
        },
        // ✅ PUBLIC STATS - Basic engagement metrics
        _count: {
          select: { 
            campaigns: true,
            bookings: true 
          }
        }
      },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.property.count({ where });

    console.log(`✅ Found ${properties.length} public properties`);

    res.json({
      success: true,
      data: properties,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Public properties error:', error);
    next(error);
  }
});

// ✅ PROTECTED ROUTE - GET /api/properties/my - Get user's own properties
router.get('/my', syncUser, async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const where = {
      owner_id: req.user.id,
      ...(status && { status }),
    };

    const properties = await prisma.property.findMany({
      where,
      include: {
        owner: {
          select: { id: true, full_name: true, firstName: true, lastName: true, email: true }
        },
        campaigns: {
          select: { id: true, name: true, title: true, status: true }
        },
        advertising_areas: true,
        advertisingAreas: true,
        _count: {
          select: { bookings: true, campaigns: true }
        }
      },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.property.count({ where });

    res.json({
      success: true,
      data: properties,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// ✅ PROTECTED ROUTE - GET /api/properties/:id - Get property by ID (full details for authenticated users)
router.get('/:id', syncUser, async (req, res, next) => {
  try {
    const { id } = req.params;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, full_name: true, firstName: true, lastName: true, email: true, phone: true }
        },
        campaigns: {
          include: {
            advertiser: {
              select: { id: true, full_name: true, firstName: true, lastName: true, email: true }
            }
          }
        },
        bookings: {
          include: {
            booker: {
              select: { id: true, full_name: true, firstName: true, lastName: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        advertising_areas: true,
        advertisingAreas: true,
        propertyApprovals: {
          include: {
            reviewer: {
              select: { id: true, full_name: true, firstName: true, lastName: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
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
    next(error);
  }
});

// ✅ PROTECTED ROUTE - POST /api/properties - Create new property
router.post('/', syncUser, async (req, res, next) => {
  try {
    console.log('Creating property with data:', req.body);
    
    // Handle both location object and direct fields
    const processedData = { ...req.body };
    
    // Extract location fields if they exist in a location object
    if (processedData.location) {
      if (processedData.location.address) processedData.address = processedData.location.address;
      if (processedData.location.city) processedData.city = processedData.location.city;
      if (processedData.location.zipcode) processedData.zipcode = processedData.location.zipcode;
      if (processedData.location.latitude) processedData.latitude = processedData.location.latitude;
      if (processedData.location.longitude) processedData.longitude = processedData.location.longitude;
    }

    // Handle photos array
    if (processedData.photos && !processedData.images) {
      processedData.images = processedData.photos;
    }

    const validatedData = createPropertySchema.parse(processedData);

    const property = await prisma.property.create({
      data: {
        name: validatedData.name,
        title: validatedData.title || validatedData.name,
        description: validatedData.description,
        address: validatedData.address,
        city: validatedData.city,
        state: validatedData.state,
        country: validatedData.country || 'US',
        zipcode: validatedData.zipcode || validatedData.zipCode,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        type: validatedData.type,
        propertyType: validatedData.propertyType || validatedData.type,
        size: validatedData.size,
        bedrooms: validatedData.bedrooms,
        bathrooms: validatedData.bathrooms,
        images: validatedData.images || validatedData.photos || [],
        primary_image: validatedData.primary_image,
        basePrice: validatedData.basePrice,
        currency: validatedData.currency || 'USD',
        owner_id: req.user.id,
        status: validatedData.status || 'draft',
        location: validatedData.location || {},
      },
      include: {
        owner: {
          select: { id: true, full_name: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    console.log('✅ Property created:', property.id);

    res.status(201).json({
      success: true,
      data: property,
      message: 'Property created successfully'
    });
  } catch (error) {
    console.error('❌ Property creation error:', error);
    next(error);
  }
});

// ✅ PROTECTED ROUTE - PUT /api/properties/:id - Update property
router.put('/:id', syncUser, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Process the data similar to creation
    const processedData = { ...req.body };
    
    if (processedData.location) {
      if (processedData.location.address) processedData.address = processedData.location.address;
      if (processedData.location.city) processedData.city = processedData.location.city;
      if (processedData.location.zipcode) processedData.zipcode = processedData.location.zipcode;
      if (processedData.location.latitude) processedData.latitude = processedData.location.latitude;
      if (processedData.location.longitude) processedData.longitude = processedData.location.longitude;
    }

    const validatedData = createPropertySchema.partial().parse(processedData);

    // Check if user owns the property or is admin
    const existingProperty = await prisma.property.findUnique({
      where: { id }
    });

    if (!existingProperty) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    if (existingProperty.owner_id !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this property'
      });
    }

    const property = await prisma.property.update({
      where: { id },
      data: validatedData,
      include: {
        owner: {
          select: { id: true, full_name: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    res.json({
      success: true,
      data: property,
      message: 'Property updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// ✅ PROTECTED ROUTE - DELETE /api/properties/:id - Delete property
router.delete('/:id', syncUser, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if user owns the property or is admin
    const existingProperty = await prisma.property.findUnique({
      where: { id }
    });

    if (!existingProperty) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    if (existingProperty.owner_id !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this property'
      });
    }

    await prisma.property.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// ✅ ADMIN ROUTE - POST /api/properties/:id/approve - Approve property
router.post('/:id/approve', syncUser, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const property = await prisma.property.update({
      where: { id },
      data: {
        status: 'active',
        isApproved: true
      }
    });

    // Create approval record if propertyApprovals table exists
    try {
      await prisma.propertyApproval.create({
        data: {
          propertyId: id,
          property_id: id,
          status: 'APPROVED',
          notes,
          reviewerId: req.user.id,
          reviewer_id: req.user.id,
          reviewedAt: new Date()
        }
      });
    } catch (approvalError) {
      console.log('PropertyApproval table might not exist, skipping approval record');
    }

    res.json({
      success: true,
      data: property,
      message: 'Property approved successfully'
    });
  } catch (error) {
    next(error);
  }
});

// ✅ ADMIN ROUTE - POST /api/properties/:id/reject - Reject property
router.post('/:id/reject', syncUser, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const property = await prisma.property.update({
      where: { id },
      data: {
        status: 'rejected',
        isApproved: false
      }
    });

    // Create rejection record if propertyApprovals table exists
    try {
      await prisma.propertyApproval.create({
        data: {
          propertyId: id,
          property_id: id,
          status: 'REJECTED',
          notes: notes || 'Property rejected by admin',
          reviewerId: req.user.id,
          reviewer_id: req.user.id,
          reviewedAt: new Date()
        }
      });
    } catch (approvalError) {
      console.log('PropertyApproval table might not exist, skipping rejection record');
    }

    res.json({
      success: true,
      data: property,
      message: 'Property rejected'
    });
  } catch (error) {
    next(error);
  }
});

export default router;