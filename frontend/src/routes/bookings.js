// frontend/src/routes/bookings.js
import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/bookings - List all bookings with filtering
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      userId, 
      propertyId, 
      campaignId,
      startDate,
      endDate
    } = req.query;
    
    const skip = (page - 1) * limit;
    const where = {};

    // Add filters
    if (status) where.status = status;
    if (userId) where.userId = userId;
    if (propertyId) where.propertyId = propertyId;
    if (campaignId) where.campaignId = campaignId;

    // Date range filtering
    if (startDate || endDate) {
      where.AND = [];
      if (startDate) {
        where.AND.push({
          endDate: {
            gte: new Date(startDate)
          }
        });
      }
      if (endDate) {
        where.AND.push({
          startDate: {
            lte: new Date(endDate)
          }
        });
      }
    }

    const bookings = await prisma.booking.findMany({
      where,
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
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
            state: true,
            pricePerNight: true
          }
        },
        campaign: {
          select: {
            id: true,
            title: true,
            status: true
          }
        },
        invoice: {
          select: {
            id: true,
            amount: true,
            status: true,
            dueDate: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: parseInt(skip),
      take: parseInt(limit)
    });

    const total = await prisma.booking.count({ where });

    console.log(`✅ Bookings retrieved: ${bookings.length} of ${total} total`);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
});

// GET /api/bookings/:id - Get single booking
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
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
        property: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true
              }
            }
          }
        },
        campaign: {
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
        },
        invoice: true
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user has access to this booking
    const hasAccess = booking.userId === req.user.id || 
                     booking.property.userId === req.user.id ||
                     booking.campaign?.userId === req.user.id ||
                     ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    console.log(`✅ Booking retrieved: ${booking.id}`);

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('❌ Error fetching booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: error.message
    });
  }
});

// POST /api/bookings - Create new booking
router.post('/', async (req, res) => {
  try {
    const {
      propertyId,
      campaignId,
      startDate,
      endDate,
      guests,
      specialRequests,
      contactInfo
    } = req.body;

    // Validate required fields
    if (!propertyId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: propertyId, startDate, endDate'
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    if (start < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be in the past'
      });
    }

    // Check if property exists and is available
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        bookings: {
          where: {
            status: { in: ['CONFIRMED', 'PENDING'] },
            OR: [
              {
                startDate: {
                  lte: end
                },
                endDate: {
                  gte: start
                }
              }
            ]
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

    if (property.status !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: 'Property is not available for booking'
      });
    }

    // Check for booking conflicts
    if (property.bookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Property is not available for selected dates'
      });
    }

    // Validate campaign if provided
    let campaign = null;
    if (campaignId) {
      campaign = await prisma.campaign.findUnique({
        where: { id: campaignId }
      });

      if (!campaign || campaign.propertyId !== propertyId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid campaign for this property'
        });
      }

      if (campaign.status !== 'ACTIVE') {
        return res.status(400).json({
          success: false,
          message: 'Campaign is not active'
        });
      }
    }

    // Calculate total amount
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const baseAmount = property.pricePerNight * nights;
    const platformFee = baseAmount * 0.1; // 10% platform fee
    const totalAmount = baseAmount + platformFee;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: req.user.id,
        propertyId,
        campaignId,
        startDate: start,
        endDate: end,
        guests: guests ? parseInt(guests) : 1,
        specialRequests,
        contactInfo,
        nights,
        pricePerNight: property.pricePerNight,
        totalAmount,
        status: 'PENDING'
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
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
            state: true
          }
        },
        campaign: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        bookingId: booking.id,
        userId: req.user.id,
        amount: totalAmount,
        description: `Booking for ${property.title}`,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: 'PENDING'
      }
    });

    console.log(`✅ Booking created: ${booking.id} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      data: {
        ...booking,
        invoice
      },
      message: 'Booking created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
});

// PUT /api/bookings/:id - Update booking
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if booking exists and user has access
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      include: {
        property: true,
        campaign: true
      }
    });

    if (!existingBooking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check permissions
    const hasAccess = existingBooking.userId === req.user.id || 
                     existingBooking.property.userId === req.user.id ||
                     ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Prevent updates to confirmed bookings (except status changes)
    if (existingBooking.status === 'CONFIRMED' && updateData.startDate || updateData.endDate) {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify dates of confirmed booking'
      });
    }

    // Convert dates if present
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);
    if (updateData.guests) updateData.guests = parseInt(updateData.guests);

    const booking = await prisma.booking.update({
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
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
            state: true
          }
        },
        campaign: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    console.log(`✅ Booking updated: ${booking.id}`);

    res.json({
      success: true,
      data: booking,
      message: 'Booking updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking',
      error: error.message
    });
  }
});

// DELETE /api/bookings/:id - Cancel booking
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if booking exists and user has access
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      include: {
        property: true,
        invoice: true
      }
    });

    if (!existingBooking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check permissions
    const hasAccess = existingBooking.userId === req.user.id || 
                     existingBooking.property.userId === req.user.id ||
                     ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check cancellation policy
    const daysTillStart = Math.ceil((new Date(existingBooking.startDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysTillStart < 1 && existingBooking.status === 'CONFIRMED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel booking less than 24 hours before start date'
      });
    }

    // Update booking status instead of deleting
    const booking = await prisma.booking.update({
      where: { id },
      data: { 
        status: 'CANCELLED',
        cancelledAt: new Date()
      }
    });

    // Cancel associated invoice if exists
    if (existingBooking.invoice) {
      await prisma.invoice.update({
        where: { id: existingBooking.invoice.id },
        data: { status: 'CANCELLED' }
      });
    }

    console.log(`✅ Booking cancelled: ${id}`);

    res.json({
      success: true,
      data: booking,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    console.error('❌ Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error.message
    });
  }
});

// GET /api/bookings/analytics/summary - Booking analytics
router.get('/analytics/summary', async (req, res) => {
  try {
    const { userId, propertyId } = req.query;
    const where = {};
    
    if (userId) where.userId = userId;
    if (propertyId) where.propertyId = propertyId;

    const [
      totalBookings,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      totalRevenue,
      upcomingBookings
    ] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.count({ where: { ...where, status: 'CONFIRMED' } }),
      prisma.booking.count({ where: { ...where, status: 'PENDING' } }),
      prisma.booking.count({ where: { ...where, status: 'CANCELLED' } }),
      prisma.booking.aggregate({
        where: { ...where, status: 'CONFIRMED' },
        _sum: { totalAmount: true }
      }),
      prisma.booking.count({
        where: {
          ...where,
          status: 'CONFIRMED',
          startDate: {
            gte: new Date()
          }
        }
      })
    ]);

    const analytics = {
      totalBookings,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      upcomingBookings,
      confirmationRate: totalBookings > 0 ? (confirmedBookings / totalBookings * 100).toFixed(2) : 0
    };

    console.log(`✅ Booking analytics generated`);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('❌ Error generating booking analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate analytics',
      error: error.message
    });
  }
});

export default router;