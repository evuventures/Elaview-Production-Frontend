// backend/src/routes/invoices.js
// Fixed to use correct Prisma model names matching your schema

import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { syncUser } from '../middleware/clerk.js';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schema
const createInvoiceSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('USD'),
  description: z.string().optional(),
  dueDate: z.string().transform((str) => new Date(str)),
  bookingId: z.string().optional(),
  campaignId: z.string().optional(),
});

// Generate unique invoice number
const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  
  // ✅ Fixed: using 'invoices' instead of 'invoice'
  const count = await prisma.invoices.count({
    where: {
      createdAt: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`)
      }
    }
  });
  
  return `INV-${year}-${String(count + 1).padStart(6, '0')}`;
};

// GET /api/invoices - Get all invoices for current user
router.get('/', syncUser, async (req, res, next) => {
  try {
    console.log('🧾 GET /api/invoices - Fetching invoices...');
    
    const { page = 1, limit = 10, status, isPaid } = req.query;
    
    const where = {
      userId: req.user.id,
      ...(status && { status }),
      ...(isPaid !== undefined && { isPaid: isPaid === 'true' }),
    };

    // ✅ Fixed: using 'invoices' instead of 'invoice'
    const invoices = await prisma.invoices.findMany({
      where,
      include: {
        bookings: {
          select: { 
            id: true, 
            startDate: true, 
            endDate: true, 
            properties: { select: { title: true } } 
          }
        },
        campaigns: {
          select: { id: true, title: true }
        },
        payment_reminders: {
          orderBy: { sentAt: 'desc' },
          take: 1
        }
      },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.invoices.count({ where });

    // Get summary stats
    const stats = await prisma.invoices.aggregate({
      where: { userId: req.user.id },
      _sum: { amount: true },
      _count: { _all: true }
    });

    const unpaidSum = await prisma.invoices.aggregate({
      where: { userId: req.user.id, isPaid: false },
      _sum: { amount: true }
    });

    console.log(`✅ Found ${invoices.length} invoices for user ${req.user.id}`);

    res.json({
      success: true,
      data: invoices,
      stats: {
        totalAmount: stats._sum.amount || 0,
        totalCount: stats._count._all,
        unpaidAmount: unpaidSum._sum.amount || 0
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch invoices',
      message: error.message
    });
  }
});

// GET /api/invoices/:id - Get specific invoice
router.get('/:id', syncUser, async (req, res, next) => {
  try {
    const { id } = req.params;

    // ✅ Fixed: using 'invoices' instead of 'invoice'
    const invoice = await prisma.invoices.findUnique({
      where: { id },
      include: {
        users: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        bookings: {
          include: {
            properties: {
              select: { id: true, title: true, address: true, city: true }
            }
          }
        },
        campaigns: {
          include: {
            properties: {
              select: { id: true, title: true, city: true }
            }
          }
        },
        payment_reminders: {
          orderBy: { sentAt: 'desc' }
        }
      }
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Check if user owns the invoice
    if (invoice.userId !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this invoice'
      });
    }

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('❌ Error fetching invoice:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch invoice',
      message: error.message
    });
  }
});

// POST /api/invoices - Create new invoice (Admin only)
router.post('/', syncUser, async (req, res, next) => {
  try {
    if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const validatedData = createInvoiceSchema.parse(req.body);
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const invoiceNumber = await generateInvoiceNumber();

    // ✅ Fixed: using 'invoices' instead of 'invoice'
    const invoice = await prisma.invoices.create({
      data: {
        ...validatedData,
        userId,
        invoiceNumber,
      },
      include: {
        users: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        bookings: {
          select: { id: true, properties: { select: { title: true } } }
        },
        campaigns: {
          select: { id: true, title: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: invoice,
      message: 'Invoice created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating invoice:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create invoice',
      message: error.message
    });
  }
});

// POST /api/invoices/:id/pay - Process payment for invoice
router.post('/:id/pay', syncUser, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paymentMethod, stripePaymentIntentId } = req.body;

    const invoice = await prisma.invoices.findUnique({
      where: { id }
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    if (invoice.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay this invoice'
      });
    }

    if (invoice.isPaid) {
      return res.status(400).json({
        success: false,
        message: 'Invoice is already paid'
      });
    }

    // TODO: Integrate with Stripe payment processing here
    // For now, we'll just mark as paid

    const updatedInvoice = await prisma.invoices.update({
      where: { id },
      data: {
        isPaid: true,
        paidAt: new Date(),
        status: 'PAID',
        paymentMethod,
        stripePaymentIntentId
      }
    });

    res.json({
      success: true,
      data: updatedInvoice,
      message: 'Payment processed successfully'
    });
  } catch (error) {
    console.error('❌ Error processing payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process payment',
      message: error.message
    });
  }
});

// POST /api/invoices/:id/reminder - Send payment reminder
router.post('/:id/reminder', syncUser, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { method = 'EMAIL', customMessage } = req.body;

    const invoice = await prisma.invoices.findUnique({
      where: { id },
      include: {
        users: {
          select: { firstName: true, lastName: true, email: true }
        }
      }
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Check if user owns the invoice or is admin
    if (invoice.userId !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send reminder for this invoice'
      });
    }

    if (invoice.isPaid) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send reminder for paid invoice'
      });
    }

    const defaultMessage = `Hi ${invoice.users.firstName}, this is a reminder that your invoice ${invoice.invoiceNumber} for $${invoice.amount} is due on ${invoice.dueDate.toDateString()}.`;

    // ✅ Fixed: using 'payment_reminders' instead of 'paymentReminder'
    const reminder = await prisma.payment_reminders.create({
      data: {
        userId: invoice.userId,
        invoiceId: invoice.id,
        message: customMessage || defaultMessage,
        method: method
      }
    });

    // TODO: Actually send the reminder via email/SMS/push notification

    res.json({
      success: true,
      data: reminder,
      message: 'Payment reminder sent successfully'
    });
  } catch (error) {
    console.error('❌ Error sending payment reminder:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send payment reminder',
      message: error.message
    });
  }
});

export default router;