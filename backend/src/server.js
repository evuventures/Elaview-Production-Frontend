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

// Import middleware
import { clerkMiddleware } from './middleware/clerk.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - support multiple development ports
const allowedOrigins = [
  'http://localhost:3000',      // Current frontend port
  'http://localhost:5173',      // Vite default port
  'http://127.0.0.1:3000',      // Alternative localhost
  'http://127.0.0.1:5173',      // Alternative localhost
  process.env.CORS_ORIGIN       // Environment variable override
].filter(Boolean); // Remove any undefined values

console.log('🔗 CORS enabled for origins:', allowedOrigins);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
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

// Handle preflight requests
app.options('*', cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ PUBLIC HEALTH CHECKS - No authentication required
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
      invoices: '/api/invoices (protected)'
    }
  });
});

// ✅ PUBLIC ROUTES - Apply BEFORE any authentication middleware
console.log('🌍 Setting up PUBLIC routes (no auth required)...');

// Public spaces route
app.use('/api/spaces', spacesRoutes);
console.log('   ✅ /api/spaces - Public advertising spaces');

// Public areas routes (both aliases)
app.use('/api/areas', advertisingAreaRoutes);
app.use('/api/advertising-areas', advertisingAreaRoutes);
console.log('   ✅ /api/areas - Public advertising areas (short)');
console.log('   ✅ /api/advertising-areas - Public advertising areas (full)');

// ✅ PROTECTED ROUTES - Apply Clerk middleware only to these
console.log('🔒 Setting up PROTECTED routes (auth required)...');

// Apply Clerk middleware only to protected routes
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
console.log('   🔒 /api/properties - Legacy properties (protected)');
console.log('   🔒 /api/campaigns - Campaign management');
console.log('   🔒 /api/bookings - Booking management');
console.log('   🔒 /api/messages - Messaging');
console.log('   🔒 /api/invoices - Invoicing');
console.log('   🔒 /api/upload - File uploads');

// ✅ REDIRECT MIDDLEWARE - Handle legacy property endpoints
app.use('/api/properties/*', (req, res, next) => {
  console.log(`🔄 Redirecting legacy property route: ${req.originalUrl}`);
  
  // Rewrite the URL to use spaces instead
  const newUrl = req.originalUrl.replace('/api/properties', '/api/spaces');
  console.log(`🔄 Redirecting to: ${newUrl}`);
  
  // Redirect to the new spaces endpoint
  res.redirect(301, newUrl);
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found',
    available_endpoints: {
      public: {
        spaces: '/api/spaces (advertising spaces)',
        areas: '/api/areas (advertising areas)',
        'advertising-areas': '/api/advertising-areas (advertising areas full name)',
        health: '/api/health (system health)'
      },
      protected: {
        campaigns: '/api/campaigns (requires auth)',
        bookings: '/api/bookings (requires auth)',
        messages: '/api/messages (requires auth)',
        invoices: '/api/invoices (requires auth)',
        upload: '/api/upload (requires auth)'
      }
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 CORS enabled for origins: ${allowedOrigins.join(', ')}`);
  console.log('');
  console.log('📍 API ROUTE SUMMARY:');
  console.log('');
  console.log('   🌍 PUBLIC ROUTES (no authentication):');
  console.log('     GET  /health');
  console.log('     GET  /api/health');
  console.log('     GET  /api/spaces');
  console.log('     GET  /api/areas');
  console.log('     GET  /api/advertising-areas');
  console.log('');
  console.log('   🔒 PROTECTED ROUTES (authentication required):');
  console.log('     POST,PUT,DELETE  /api/spaces');
  console.log('     ALL  /api/campaigns');
  console.log('     ALL  /api/bookings');
  console.log('     ALL  /api/messages');
  console.log('     ALL  /api/invoices');
  console.log('     ALL  /api/upload');
  console.log('     ALL  /api/users');
  console.log('     ALL  /api/auth');
  console.log('');
  console.log('   🔄 LEGACY REDIRECTS:');
  console.log('     /api/properties/* → /api/spaces/*');
  console.log('');
  console.log(`✅ Test public endpoints:`);
  console.log(`   curl http://localhost:${PORT}/api/spaces`);
  console.log(`   curl http://localhost:${PORT}/api/areas`);
});

export default app;