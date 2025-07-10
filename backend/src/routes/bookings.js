// backend/src/routes/bookings.js
// Fixed to use correct Prisma model names (plural, snake_case)

import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { syncUser } from '../middleware/clerk.js';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schema
const createBookingSchema = z.object({
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  totalAmount: z.number().positive('Total amount must be positive'),
  currency: z.string().default('USD'),
  propertyId: z.string().optional(),
  campaignId: z.string().optional(),
  advertisingAreaId: z.string().optional(),
  notes: z.string().optional(),
});

// GET /api/bookings - Get all bookings
router.get('/', syncUser, async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, isPaid } = req.query;
    
    const where = {
      bookerId: req.user.id,
      ...(status && { status }),
      ...(isPaid !== undefined && { isPaid: isPaid === 'true' }),
    };

    const bookings = await prisma.bookings.findMany({
      where,
      include: {
        properties: {
          select: { id: true, title: true, city: true, address: true }
        },
        campaigns: {
          select: { id: true, title: true }
        },
        advertising_areas: {
          select: { id: true, name: true, city: true }
        },
        invoices: {
          select: { id: true, amount: true, status: true, dueDate: true }
        }
      },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.bookings.count({ where });

    res.json({
      success: true,
      data: bookings,
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

// GET /api/bookings/:id - Get booking by ID
router.get('/:id', syncUser, async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await prisma.bookings.findUnique({
      where: { id },
      include: {
        users: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        properties: {
          include: {
            users: {
              select: { id: true, firstName: true, lastName: true, email: true }
            }
          }
        },
        campaigns: {
          include: {
            users: {
              select: { id: true, firstName: true, lastName: true, email: true }
            }
          }
        },
        advertising_areas: true,
        invoices: true,
        payment_reminders: true
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is authorized to view this booking
    const isOwner = booking.bookerId === req.user.id;
    const isPropertyOwner = booking.properties?.ownerId === req.user.id;
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);

    if (!isOwner && !isPropertyOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/bookings - Create new booking
router.post('/', syncUser, async (req, res, next) => {
  try {
    const validatedData = createBookingSchema.parse(req.body);

    // Check for conflicts if booking a property
    if (validatedData.propertyId) {
      const conflicts = await prisma.bookings.findMany({
        where: {
          propertyId: validatedData.propertyId,
          status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
          OR: [
            {
              startDate: { lte: validatedData.endDate },
              endDate: { gte: validatedData.startDate }
            }
          ]
        }
      });

      if (conflicts.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Property is not available for the selected dates',
          conflicts
        });
      }
    }

    const booking = await prisma.bookings.create({
      data: {
        ...validatedData,
        bookerId: req.user.id,
      },
      include: {
        properties: {
          select: { id: true, title: true, city: true }
        },
        campaigns: {
          select: { id: true, title: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: booking,
      message: 'Booking created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/bookings/:id - Update booking
router.put('/:id', syncUser, async (req, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = createBookingSchema.partial().parse(req.body);

    // Check if user owns the booking
    const existingBooking = await prisma.bookings.findUnique({
      where: { id }
    });

    if (!existingBooking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (existingBooking.bookerId !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    const booking = await prisma.bookings.update({
      where: { id },
      data: validatedData,
      include: {
        properties: {
          select: { id: true, title: true, city: true }
        }
      }
    });

    res.json({
      success: true,
      data: booking,
      message: 'Booking updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/bookings/:id/confirm - Confirm booking
router.post('/:id/confirm', syncUser, async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await prisma.bookings.findUnique({
      where: { id },
      include: { properties: true }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Only property owner or admin can confirm
    const isPropertyOwner = booking.properties?.ownerId === req.user.id;
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);

    if (!isPropertyOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to confirm this booking'
      });
    }

    const updatedBooking = await prisma.bookings.update({
      where: { id },
      data: { status: 'CONFIRMED' }
    });

    res.json({
      success: true,
      data: updatedBooking,
      message: 'Booking confirmed successfully'
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/bookings/:id/cancel - Cancel booking
router.post('/:id/cancel', syncUser, async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await prisma.bookings.findUnique({
      where: { id }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.bookerId !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    const updatedBooking = await prisma.bookings.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    res.json({
      success: true,
      data: updatedBooking,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;