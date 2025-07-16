// backend/src/server.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import spacesRoutes from './routes/spaces.js';
import propertyRoutes from './routes/properties.js';
import campaignRoutes from './routes/campaigns.js';
import bookingRoutes from './routes/bookings.js';
import messageRoutes from './routes/messages.js';
import invoiceRoutes from './routes/invoices.js';
import uploadRoutes from './routes/upload.js';
import advertisingAreaRoutes from './routes/advertising-areas.js';
import debugRoutes from './routes/debug.js';

// Import middleware
import { clerkMiddleware } from './middleware/clerk.js';
import { errorHandler } from './middleware/errorHandler.js';

// Only load .env in development (Railway provides env vars directly)
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  process.env.CORS_ORIGIN
].filter(Boolean);

console.log('🔗 CORS enabled for origins:', allowedOrigins);

// Security middleware
app.use(helmet());

// CORS middleware - simplified and more reliable
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`❌ CORS blocked origin: ${origin}`);
      callback(null, false); // Don't throw error, just deny
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', cors());

// Rate limiting - more lenient for production
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased limit
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Logging - only in development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for Railway
app.set('trust proxy', 1);

// ✅ ROOT ROUTE
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Elaview API is running',
    status: 'success',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    endpoints: {
      health: '/health',
      api_health: '/api/health',
      spaces: '/api/spaces',
      areas: '/api/areas'
    },
    timestamp: new Date().toISOString()
  });
});

// ✅ HEALTH CHECKS
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    cors: allowedOrigins
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    cors: allowedOrigins,
    endpoints: {
      spaces: '/api/spaces (public)',
      areas: '/api/areas (public)',
      'advertising-areas': '/api/advertising-areas (public)',
      campaigns: '/api/campaigns (protected)',
      bookings: '/api/bookings (protected)',
      messages: '/api/messages (protected)',
      invoices: '/api/invoices (protected)'
    }
  });
});

// 🔍 DEBUG ROUTES - DEVELOPMENT ONLY
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/debug', debugRoutes);
  console.log('🔍 Debug routes enabled for development');
}

// ✅ PUBLIC ROUTES
console.log('🌍 Setting up PUBLIC routes...');
app.use('/api/spaces', spacesRoutes);
app.use('/api/areas', advertisingAreaRoutes);
app.use('/api/advertising-areas', advertisingAreaRoutes);

console.log('   ✅ /api/spaces - Public advertising spaces');
console.log('   ✅ /api/areas - Public advertising areas (short)');
console.log('   ✅ /api/advertising-areas - Public advertising areas (full)');

// ✅ PROTECTED ROUTES
console.log('🔒 Setting up PROTECTED routes...');
app.use('/api/auth', clerkMiddleware, authRoutes);
app.use('/api/users', clerkMiddleware, userRoutes);
app.use('/api/properties', clerkMiddleware, propertyRoutes);
app.use('/api/campaigns', clerkMiddleware, campaignRoutes);
app.use('/api/bookings', clerkMiddleware, bookingRoutes);
app.use('/api/messages', clerkMiddleware, messageRoutes);
app.use('/api/invoices', clerkMiddleware, invoiceRoutes);
app.use('/api/upload', clerkMiddleware, uploadRoutes);

console.log('   🔒 /api/auth - Authentication');
console.log('   🔒 /api/users - User management');
console.log('   🔒 /api/properties - Properties management');
console.log('   🔒 /api/campaigns - Campaign management');
console.log('   🔒 /api/bookings - Booking management');
console.log('   🔒 /api/messages - Messaging');
console.log('   🔒 /api/invoices - Invoicing');
console.log('   🔒 /api/upload - File uploads');

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    available_endpoints: {
      public: {
        root: '/ (API info)',
        health: '/health (health check)',
        api_health: '/api/health (detailed health)',
        spaces: '/api/spaces (advertising spaces)',
        areas: '/api/areas (advertising areas)'
      },
      protected: {
        auth: '/api/auth (authentication)',
        users: '/api/users (user management)',
        properties: '/api/properties (properties)',
        campaigns: '/api/campaigns (campaigns)',
        bookings: '/api/bookings (bookings)',
        messages: '/api/messages (messaging)',
        invoices: '/api/invoices (invoicing)',
        upload: '/api/upload (file uploads)'
      }
    }
  });
});

// ✅ START SERVER - Bind to 0.0.0.0 for Railway
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on 0.0.0.0:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 CORS enabled for: ${allowedOrigins.join(', ')}`);
  console.log('');
  console.log('📍 API ENDPOINTS:');
  console.log('   🌍 PUBLIC:');
  console.log('     GET  / (API info)');
  console.log('     GET  /health (health check)');
  console.log('     GET  /api/health (detailed health)');
  console.log('     GET  /api/spaces (advertising spaces)');
  console.log('     GET  /api/areas (advertising areas)');
  console.log('');
  console.log('   🔒 PROTECTED (auth required):');
  console.log('     ALL  /api/auth');
  console.log('     ALL  /api/users');
  console.log('     ALL  /api/properties');
  console.log('     ALL  /api/campaigns');
  console.log('     ALL  /api/bookings');
  console.log('     ALL  /api/messages');
  console.log('     ALL  /api/invoices');
  console.log('     ALL  /api/upload');
  console.log('');
  console.log('✅ Server ready for connections');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('💤 Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('💤 Server closed');
    process.exit(0);
  });
});

export default app;