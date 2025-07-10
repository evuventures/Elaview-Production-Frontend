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
import spacesRoutes from './routes/spaces.js';  // ✅ NEW: Spaces routes
import propertyRoutes from './routes/properties.js';  // ✅ LEGACY: Keep for backward compatibility
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

// Health check (moved before auth middleware so it's publicly accessible)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    cors: allowedOrigins
  });
});

// API health check (also publicly accessible)
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    cors: allowedOrigins,
    // ✅ NEW: Show available endpoints
    endpoints: {
      spaces: '/api/spaces (primary)',
      properties: '/api/properties (legacy, redirects to spaces)',
      areas: '/api/advertising-areas',
      campaigns: '/api/campaigns',
      bookings: '/api/bookings',
      messages: '/api/messages',
      invoices: '/api/invoices'
    }
  });
});

// ✅ MIDDLEWARE BYPASS - Allow public access to specific routes
const publicRoutes = [
  '/api/spaces',
  '/api/properties', // Legacy route
  '/api/advertising-areas'
];

// Custom middleware to bypass Clerk for public routes
app.use('/api', (req, res, next) => {
  const isPublicRoute = publicRoutes.some(route => {
    // Check for exact match or if it's a GET request to these endpoints
    return req.path === route || (req.method === 'GET' && req.path.startsWith(route));
  });

  if (isPublicRoute && req.method === 'GET') {
    console.log(`🌍 Public access granted for: ${req.method} ${req.path}`);
    next(); // Skip Clerk middleware for public GET requests
  } else {
    console.log(`🔒 Protected access required for: ${req.method} ${req.path}`);
    clerkMiddleware(req, res, next); // Apply Clerk middleware for protected routes
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// ✅ PRIMARY ROUTES - Advertising Spaces
app.use('/api/spaces', spacesRoutes);  

// ✅ LEGACY ROUTES - Properties (redirects to spaces for backward compatibility)
app.use('/api/properties', propertyRoutes);

// ✅ OTHER ROUTES
app.use('/api/campaigns', campaignRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/upload', uploadRoutes);

// ✅ ADVERTISING AREAS - Can be aliased as /api/areas for consistency
app.use('/api/advertising-areas', advertisingAreaRoutes);
app.use('/api/areas', advertisingAreaRoutes);  // ✅ NEW: Shorter alias

// ✅ REDIRECT MIDDLEWARE - Handle old property endpoints
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
      spaces: '/api/spaces (primary advertising spaces)',
      areas: '/api/areas or /api/advertising-areas',
      campaigns: '/api/campaigns',
      bookings: '/api/bookings',
      messages: '/api/messages',
      invoices: '/api/invoices',
      upload: '/api/upload',
      health: '/api/health'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 CORS enabled for origins: ${allowedOrigins.join(', ')}`);
  console.log(`✅ Health check available at: http://localhost:${PORT}/health`);
  console.log(`✅ API health check at: http://localhost:${PORT}/api/health`);
  console.log('');
  console.log('📍 Available API Endpoints:');
  console.log('   🏢 Primary: /api/spaces (advertising spaces)');
  console.log('   🏠 Legacy: /api/properties (redirects to spaces)');
  console.log('   📍 Areas: /api/areas or /api/advertising-areas');
  console.log('   📢 Campaigns: /api/campaigns');
  console.log('   📅 Bookings: /api/bookings');
  console.log('   💬 Messages: /api/messages');
  console.log('   💰 Invoices: /api/invoices');
  console.log('   📤 Upload: /api/upload');
  console.log('');
  console.log('🌍 Public endpoints (no auth required):');
  console.log('   GET /api/spaces');
  console.log('   GET /api/areas');
  console.log('   GET /api/properties (legacy)');
  console.log('');
  console.log('🔒 Protected endpoints (auth required):');
  console.log('   POST, PUT, DELETE /api/spaces');
  console.log('   All /api/campaigns');
  console.log('   All /api/bookings');
  console.log('   All /api/messages');
  console.log('   All /api/invoices');
});

export default app;