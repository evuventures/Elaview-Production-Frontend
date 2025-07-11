// backend/src/routes/users.js
import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/users/me - Get current user profile
router.get('/me', async (req, res) => {
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
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: error.message
    });
  }
});

// PUT /api/users/me - Update current user profile
router.put('/me', async (req, res) => {
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
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// GET /api/users - List users (admin only)
router.get('/', async (req, res) => {
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
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// GET /api/users/:id - Get user by ID (admin or self)
router.get('/:id', async (req, res) => {
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
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
});

// PUT /api/users/:id/role - Update user role (admin only)
router.put('/:id/role', async (req, res) => {
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
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: error.message
    });
  }
});

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', async (req, res) => {
  try {
    // Check if user is admin
    if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { id } = req.params;

    // Prevent self-deletion
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        properties: true,
        campaigns: true,
        bookings: true
      }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has active data
    const hasActiveData = existingUser.properties.length > 0 || 
                          existingUser.campaigns.length > 0 || 
                          existingUser.bookings.length > 0;

    if (hasActiveData) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user with active properties, campaigns, or bookings'
      });
    }

    await prisma.user.delete({
      where: { id }
    });

    console.log(`✅ User deleted: ${existingUser.email} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

// GET /api/users/analytics/summary - User analytics (admin only)
router.get('/analytics/summary', async (req, res) => {
  try {
    // Check if user is admin
    if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const [
      totalUsers,
      activeUsers,
      propertyOwners,
      recentSignups,
      usersByRole
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      }),
      prisma.user.count({
        where: {
          properties: {
            some: {}
          }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      }),
      prisma.user.groupBy({
        by: ['role'],
        _count: true
      })
    ]);

    const analytics = {
      totalUsers,
      activeUsers,
      propertyOwners,
      recentSignups,
      usersByRole: usersByRole.reduce((acc, item) => {
        acc[item.role] = item._count;
        return acc;
      }, {})
    };

    console.log(`✅ User analytics generated`);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('❌ Error generating user analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate analytics',
      error: error.message
    });
  }
});

export default router;