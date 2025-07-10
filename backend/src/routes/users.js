// backend/src/routes/users.js
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { syncUser } from '../middleware/clerk.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/users/me - Get current user profile (matches frontend expectation)
router.get('/me', syncUser, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        properties: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true
          }
        },
        campaigns: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true
          }
        },
        bookings: {
          select: {
            id: true,
            status: true,
            startDate: true,
            endDate: true,
            property: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        sentMessages: {
          select: {
            id: true,
            createdAt: true,
            conversation: {
              select: {
                id: true,
                subject: true
              }
            }
          },
          take: 5,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            properties: true,
            campaigns: true,
            bookings: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log(`✅ User profile retrieved: ${user.email}`);

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('❌ Error fetching user profile:', error);
    next(error);
  }
});

// GET /api/users/profile - Get current user profile (alternative endpoint)
router.get('/profile', syncUser, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        _count: {
          select: {
            properties: true,
            campaigns: true,
            bookings: true,
            sentMessages: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/me - Update current user profile
router.put('/me', syncUser, async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      bio,
      preferences,
      notifications
    } = req.body;

    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;
    if (preferences !== undefined) updateData.preferences = preferences;
    if (notifications !== undefined) updateData.notifications = notifications;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        clerkId: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        bio: true,
        role: true,
        preferences: true,
        notifications: true,
        createdAt: true,
        updatedAt: true
      }
    });

    console.log(`✅ User profile updated: ${user.email}`);

    res.json({
      success: true,
      data: user,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating user profile:', error);
    next(error);
  }
});

// PUT /api/users/profile - Update user profile (alternative endpoint)
router.put('/profile', syncUser, async (req, res, next) => {
  try {
    const { firstName, lastName, phone, bio } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        firstName,
        lastName,
        phone,
        bio
      }
    });

    res.json({
      success: true,
      data: user,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users - List users (admin only)
router.get('/', syncUser, async (req, res, next) => {
  try {
    // Check if user is admin
    if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { page = 1, limit = 10, role, search } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        clerkId: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            properties: true,
            campaigns: true,
            bookings: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: parseInt(skip),
      take: parseInt(limit)
    });

    const total = await prisma.user.count({ where });

    console.log(`✅ Users retrieved: ${users.length} of ${total} total`);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    next(error);
  }
});

// GET /api/users/:id - Get user by ID (admin or self)
router.get('/:id', syncUser, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if user can access this profile
    if (req.user.id !== id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        properties: {
          select: {
            id: true,
            title: true,
            status: true,
            pricePerNight: true,
            createdAt: true
          }
        },
        campaigns: {
          select: {
            id: true,
            title: true,
            status: true,
            budget: true,
            createdAt: true
          }
        },
        bookings: {
          select: {
            id: true,
            status: true,
            startDate: true,
            endDate: true,
            totalAmount: true,
            property: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log(`✅ User retrieved: ${user.email}`);

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    next(error);
  }
});

// Legacy payment settings endpoints (keeping for compatibility)
// GET /api/users/payment-settings - Get payment settings
router.get('/payment-settings', syncUser, async (req, res, next) => {
  try {
    // Since we don't have paymentSettings in current schema, return basic user data
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true
      }
    });

    // Mock payment settings structure for compatibility
    const paymentSettings = {
      id: `ps_${user.id}`,
      userId: user.id,
      stripeCustomerId: null,
      defaultPaymentMethod: null,
      autoPayEnabled: false,
      reminderEnabled: true,
      reminderDaysBefore: 3,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    res.json({
      success: true,
      data: paymentSettings
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/payment-settings - Update payment settings
router.put('/payment-settings', syncUser, async (req, res, next) => {
  try {
    const {
      stripeCustomerId,
      defaultPaymentMethod,
      autoPayEnabled,
      reminderEnabled,
      reminderDaysBefore
    } = req.body;

    // For now, just return success since we don't have payment settings table
    // You can implement this later when adding payment functionality
    
    const paymentSettings = {
      id: `ps_${req.user.id}`,
      userId: req.user.id,
      stripeCustomerId,
      defaultPaymentMethod,
      autoPayEnabled,
      reminderEnabled,
      reminderDaysBefore,
      updatedAt: new Date()
    };

    res.json({
      success: true,
      data: paymentSettings,
      message: 'Payment settings updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/:id/role - Update user role (admin only)
router.put('/:id/role', syncUser, async (req, res, next) => {
  try {
    // Check if user is admin
    if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['USER', 'PROPERTY_OWNER', 'ADMIN', 'SUPER_ADMIN'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    // Prevent self-demotion from SUPER_ADMIN
    if (req.user.id === id && req.user.role === 'SUPER_ADMIN' && role !== 'SUPER_ADMIN') {
      return res.status(400).json({
        success: false,
        message: 'Cannot demote yourself from SUPER_ADMIN'
      });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        updatedAt: true
      }
    });

    console.log(`✅ User role updated: ${user.email} -> ${role} by ${req.user.email}`);

    res.json({
      success: true,
      data: user,
      message: 'User role updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating user role:', error);
    next(error);
  }
});

export default router;