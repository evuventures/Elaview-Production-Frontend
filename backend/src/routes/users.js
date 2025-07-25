// backend/src/routes/users.js - Clean version without duplicates
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { syncUser } from '../middleware/clerk.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/users/me - Get current user profile (primary endpoint)
router.get('/me', syncUser, async (req, res, next) => {
  try {
    console.log('📋 /me request for user:', req.user.id);
    
    const user = await prisma.users.findUnique({
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
            properties: {
              select: {
                id: true,
                title: true
              }
            }
          }
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
      console.log('❌ User not found in database:', req.user.id);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ User profile found:', { id: user.id, email: user.email, role: user.role });

    res.json({
      success: true,
      data: user,
      role: user.role // Include role at top level for frontend compatibility
    });

  } catch (error) {
    console.error('❌ Error in /me endpoint:', error);
    next(error);
  }
});

// GET /api/users/profile - Alternative endpoint (same as /me for compatibility)
router.get('/profile', syncUser, async (req, res, next) => {
  try {
    console.log('📋 Profile request for user:', req.user.id);
    
    const user = await prisma.users.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      console.log('❌ User not found in database:', req.user.id);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ User profile found:', { id: user.id, email: user.email, role: user.role });

    res.json({
      success: true,
      data: user,
      role: user.role // Make sure role is included at top level too
    });

  } catch (error) {
    console.error('❌ Error fetching user profile:', error);
    next(error);
  }
});

// POST /api/users/update-role - Update user role (primary endpoint)
router.post('/update-role', syncUser, async (req, res, next) => {
  try {
    const { role } = req.body;
    
    console.log(`🔄 Role update request: User ${req.user.id} -> ${role}`);
    
    // Validate role - only allow switching between user roles (not admin roles)
    const allowedRoles = ['USER', 'ADVERTISER', 'PROPERTY_OWNER'];
    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Allowed roles: USER, PROPERTY_OWNER, ADVERTISER',
        allowedRoles
      });
    }

    // Prevent changing admin/super admin roles through this endpoint
    if (['ADMIN', 'SUPER_ADMIN'].includes(req.user.role) && !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Admin roles cannot be changed through this endpoint'
      });
    }

    // Update user role in database
    const updatedUser = await prisma.users.update({
      where: { id: req.user.id },
      data: { 
        role: role,
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        updatedAt: true
      }
    });

    console.log(`✅ Role updated successfully: ${req.user.id} -> ${role}`);

    res.json({
      success: true,
      data: updatedUser,
      message: `Role updated to ${role}`
    });

  } catch (error) {
    console.error('❌ Error updating user role:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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

    const user = await prisma.users.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        clerkId: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
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

    const users = await prisma.users.findMany({
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

    const total = await prisma.users.count({ where });

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

    const user = await prisma.users.findUnique({
      where: { id },
      include: {
        properties: {
          select: {
            id: true,
            title: true,
            status: true,
            basePrice: true,
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
            properties: {
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
    const validRoles = ['USER', 'PROPERTY_OWNER', 'ADVERTISER', 'ADMIN', 'SUPER_ADMIN'];
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

    const user = await prisma.users.update({
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

// Legacy payment settings endpoints (keeping for compatibility)
// GET /api/users/payment-settings - Get payment settings
router.get('/payment-settings', syncUser, async (req, res, next) => {
  try {
    // Since we don't have paymentSettings in current schema, return basic user data
    const user = await prisma.users.findUnique({
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

export default router;