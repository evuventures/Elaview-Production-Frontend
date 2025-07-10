// backend/src/routes/properties.js
import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/properties - List all properties with filtering
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      city, 
      propertyType, 
      status, 
      userId,
      lat,
      lng,
      radius = 10 // km
    } = req.query;
    
    const skip = (page - 1) * limit;
    const where = {};

    // Add filters
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (propertyType) where.propertyType = propertyType;
    if (status) where.status = status;
    if (userId) where.userId = userId;

    // Geographic filtering (if lat/lng provided)
    // Note: This is a simple bounding box filter. For production, use PostGIS
    if (lat && lng) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      const radiusKm = parseFloat(radius);
      
      // Rough conversion: 1 degree ≈ 111km
      const latDelta = radiusKm / 111;
      const lngDelta = radiusKm / (111 * Math.cos(latNum * Math.PI / 180));

      where.latitude = {
        gte: latNum - latDelta,
        lte: latNum + latDelta
      };
      where.longitude = {
        gte: lngNum - lngDelta,
        lte: lngNum + lngDelta
      };
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        advertisingArea: true,
        campaigns: {
          select: {
            id: true,
            title: true,
            status: true,
            startDate: true,
            endDate: true
          }
        },
        bookings: {
          select: {
            id: true,
            status: true,
            startDate: true,
            endDate: true
          }
        },
        approvals: {
          select: {
            id: true,
            status: true,
            approvedAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: parseInt(skip),
      take: parseInt(limit)
    });

    const total = await prisma.property.count({ where });

    console.log(`✅ Properties retrieved: ${properties.length} of ${total} total`);

    res.json({
      success: true,
      data: properties,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching properties:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch properties',
      error: error.message
    });
  }
});

// GET /api/properties/:id - Get single property
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        advertisingArea: true,
        campaigns: {
          include: {
            bookings: {
              select: {
                id: true,
                status: true,
                startDate: true,
                endDate: true
              }
            }
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
            },
            campaign: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        approvals: {
          include: {
            admin: {
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

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    console.log(`✅ Property retrieved: ${property.title}`);

    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error('❌ Error fetching property:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch property',
      error: error.message
    });
  }
});

// POST /api/properties - Create new property
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      address,
      city,
      state,
      zipCode,
      country,
      latitude,
      longitude,
      propertyType,
      advertisingAreaId,
      images = [],
      amenities = [],
      pricePerNight,
      maxGuests,
      bedrooms,
      bathrooms,
      squareFootage
    } = req.body;

    // Validate required fields
    if (!title || !address || !city || !propertyType || !pricePerNight) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, address, city, propertyType, pricePerNight'
      });
    }

    // Verify advertising area exists (if provided)
    if (advertisingAreaId) {
      const area = await prisma.advertisingArea.findUnique({
        where: { id: advertisingAreaId }
      });
      if (!area) {
        return res.status(404).json({
          success: false,
          message: 'Advertising area not found'
        });
      }
    }

    const property = await prisma.property.create({
      data: {
        title,
        description,
        address,
        city,
        state,
        zipCode,
        country: country || 'US',
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        propertyType,
        advertisingAreaId,
        userId: req.user.id,
        images,
        amenities,
        pricePerNight: parseFloat(pricePerNight),
        maxGuests: maxGuests ? parseInt(maxGuests) : null,
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseInt(bathrooms) : null,
        squareFootage: squareFootage ? parseInt(squareFootage) : null,
        status: 'PENDING' // Default to pending approval
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        advertisingArea: true
      }
    });

    console.log(`✅ Property created: ${property.title} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      data: property,
      message: 'Property created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating property:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create property',
      error: error.message
    });
  }
});

// PUT /api/properties/:id - Update property
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Check if property exists and user has access
    const existingProperty = await prisma.property.findUnique({
      where: { id }
    });

    if (!existingProperty) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check permissions
    if (existingProperty.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own properties'
      });
    }

    // Convert numeric fields
    if (updateData.latitude) updateData.latitude = parseFloat(updateData.latitude);
    if (updateData.longitude) updateData.longitude = parseFloat(updateData.longitude);
    if (updateData.pricePerNight) updateData.pricePerNight = parseFloat(updateData.pricePerNight);
    if (updateData.maxGuests) updateData.maxGuests = parseInt(updateData.maxGuests);
    if (updateData.bedrooms) updateData.bedrooms = parseInt(updateData.bedrooms);
    if (updateData.bathrooms) updateData.bathrooms = parseInt(updateData.bathrooms);
    if (updateData.squareFootage) updateData.squareFootage = parseInt(updateData.squareFootage);

    const property = await prisma.property.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        advertisingArea: true
      }
    });

    console.log(`✅ Property updated: ${property.title}`);

    res.json({
      success: true,
      data: property,
      message: 'Property updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating property:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update property',
      error: error.message
    });
  }
});

// DELETE /api/properties/:id - Delete property
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if property exists and user has access
    const existingProperty = await prisma.property.findUnique({
      where: { id },
      include: {
        campaigns: true,
        bookings: true
      }
    });

    if (!existingProperty) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check permissions
    if (existingProperty.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own properties'
      });
    }

    // Check if property has active campaigns or bookings
    const activeCampaigns = existingProperty.campaigns.filter(c => c.status === 'ACTIVE');
    const activeBookings = existingProperty.bookings.filter(b => 
      ['CONFIRMED', 'PENDING'].includes(b.status) && new Date(b.endDate) > new Date()
    );

    if (activeCampaigns.length > 0 || activeBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete property with active campaigns or bookings'
      });
    }

    await prisma.property.delete({
      where: { id }
    });

    console.log(`✅ Property deleted: ${id}`);

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting property:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete property',
      error: error.message
    });
  }
});

// GET /api/properties/analytics/summary - Property analytics
router.get('/analytics/summary', async (req, res) => {
  try {
    const { userId } = req.query;
    const where = userId ? { userId } : {};

    const [
      totalProperties,
      activeProperties,
      pendingApproval,
      averagePrice,
      totalBookings
    ] = await Promise.all([
      prisma.property.count({ where }),
      prisma.property.count({ where: { ...where, status: 'APPROVED' } }),
      prisma.property.count({ where: { ...where, status: 'PENDING' } }),
      prisma.property.aggregate({
        where,
        _avg: { pricePerNight: true }
      }),
      prisma.booking.count({
        where: {
          property: userId ? { userId } : {}
        }
      })
    ]);

    const analytics = {
      totalProperties,
      activeProperties,
      pendingApproval,
      averagePrice: averagePrice._avg.pricePerNight || 0,
      totalBookings
    };

    console.log(`✅ Property analytics generated`);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('❌ Error generating property analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate analytics',
      error: error.message
    });
  }
});

export default router;