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
import debugRoutes from './routes/debug.js'; // 🔍 Add debug route

// Import middleware
import { clerkMiddleware } from './middleware/clerk.js';
import { errorHandler } from './middleware/errorHandler.js';

// Only load .env in development (not in production)
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Critical for Railway deployment

// CORS configuration - clean up the origins
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
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`❌ CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.options('*', cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ ROOT ROUTE - Add this to prevent 502 errors
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Elaview API is running',
    status: 'success',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api_health: '/api/health',
      spaces: '/api/spaces',
      areas: '/api/areas'
    },
    timestamp: new Date().toISOString()
  });
});

// ✅ PUBLIC HEALTH CHECKS
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    cors: allowedOrigins
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    cors: allowedOrigins,
    endpoints: {
      spaces: '/api/spaces (primary, public for GET)',
      areas: '/api/areas (short alias, public for GET)',
      'advertising-areas': '/api/advertising-areas (full name, public for GET)',
      properties: '/api/properties (legacy, redirects to spaces)',
      campaigns: '/api/campaigns (protected)',
      bookings: '/api/bookings (protected)',
      messages: '/api/messages (protected)',
      invoices: '/api/invoices (protected)',
      debug: '/api/debug (development only)' // 🔍 Add debug info
    }
  });
});

// 🔍 DEBUG ROUTES - DEVELOPMENT ONLY
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/debug', debugRoutes);
  console.log('🔍 Debug routes enabled for development');
}

// ✅ PUBLIC ROUTES
console.log('🌍 Setting up PUBLIC routes (no auth required)...');

app.use('/api/spaces', spacesRoutes);
app.use('/api/areas', advertisingAreaRoutes);
app.use('/api/advertising-areas', advertisingAreaRoutes);

console.log('   ✅ /api/spaces - Public advertising spaces');
console.log('   ✅ /api/areas - Public advertising areas (short)');
console.log('   ✅ /api/advertising-areas - Public advertising areas (full)');

// ✅ PROTECTED ROUTES
console.log('🔒 Setting up PROTECTED routes (auth required)...');

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
    available_endpoints: {
      public: {
        root: '/ (API info)',
        spaces: '/api/spaces (advertising spaces)',
        areas: '/api/areas (advertising areas)',
        'advertising-areas': '/api/advertising-areas (advertising areas full name)',
        health: '/api/health (system health)',
        debug: '/api/debug (development only)'
      },
      protected: {
        properties: '/api/properties (requires auth)',
        campaigns: '/api/campaigns (requires auth)',
        bookings: '/api/bookings (requires auth)',
        messages: '/api/messages (requires auth)',
        invoices: '/api/invoices (requires auth)',
        upload: '/api/upload (requires auth)'
      }
    }
  });
});

// ✅ CRITICAL: Bind to 0.0.0.0 for Railway
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on ${HOST}:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 CORS enabled for origins: ${allowedOrigins.join(', ')}`);
  console.log('');
  console.log('📍 API ROUTE SUMMARY:');
  console.log('');
  console.log('   🌍 PUBLIC ROUTES (no authentication):');
  console.log('     GET  /');
  console.log('     GET  /health');
  console.log('     GET  /api/health');
  console.log('     GET  /api/spaces');
  console.log('     GET  /api/areas');
  console.log('     GET  /api/advertising-areas');
  if (process.env.NODE_ENV !== 'production') {
    console.log('     GET  /api/debug/schema (🔍 inspect database)');
    console.log('     POST /api/debug/test-property (🧪 test creation)');
  }
  console.log('');
  console.log('   🔒 PROTECTED ROUTES (authentication required):');
  console.log('     ALL  /api/properties');
  console.log('     ALL  /api/campaigns');
  console.log('     ALL  /api/bookings');
  console.log('     ALL  /api/messages');
  console.log('     ALL  /api/invoices');
  console.log('     ALL  /api/upload');
  console.log('     ALL  /api/users');
  console.log('     ALL  /api/auth');
  console.log('');
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🔍 DEBUG ENDPOINTS:`);
    console.log(`   curl http://localhost:${PORT}/api/debug/schema`);
    console.log(`   curl -X POST http://localhost:${PORT}/api/debug/test-property`);
    console.log('');
  }
  console.log(`✅ Test public endpoints:`);
  console.log(`   curl http://localhost:${PORT}/api/spaces`);
  console.log(`   curl http://localhost:${PORT}/api/areas`);
});

export default app;