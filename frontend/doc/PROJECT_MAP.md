# ELAVIEW PROJECT MAP 🗺️
**Complete Program Structure & Context Guide**

## 📁 PROJECT OVERVIEW

**ELAVIEW** is a full-stack property advertising platform that allows users to:
- Browse and list advertising spaces (buildings, billboards, transit stations, etc.)
- Create and manage advertising campaigns
- Book advertising spaces
- Process payments and manage invoices
- Use an AI chatbot for assistance

## 🏗️ ARCHITECTURE OVERVIEW

### Frontend (React + Vite)
- **Framework**: React 18 with Vite build system
- **Auth**: Clerk authentication system
- **UI Library**: Radix UI components with Tailwind CSS
- **Maps**: Google Maps integration with TypeScript wrapper
- **AI**: Gemini AI chatbot integration (currently mocked)
- **State Management**: React Context + TanStack Query
- **Routing**: React Router DOM with protected routes

### Backend (Node.js + Express)
- **Framework**: Express.js with ES modules
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: Clerk backend SDK for JWT validation
- **File Storage**: Cloudinary integration
- **Payments**: Stripe integration
- **API**: RESTful API with public/protected endpoints

### Database (PostgreSQL + Prisma)
- **ORM**: Prisma with PostgreSQL
- **Hosting**: Railway database
- **Models**: Users, Properties/Spaces, Campaigns, Bookings, Invoices, Messages

## 🛣️ ROUTING STRUCTURE

### Frontend Routes (`src/pages/Index.jsx`)
```
/ → /browse (redirect)
/browse → Map.jsx (public, main browsing page)
/search → Search.jsx (public, advanced search)
/help → Help.jsx (public)

Protected Routes (require authentication):
/dashboard → Dashboard.jsx (user dashboard)
/messages → Messages.jsx (user messages)
/profile → Profile.jsx (user profile management)
/invoices → Invoices.jsx (user invoices)
/booking-management → BookingManagement.jsx (user bookings)
/create-campaign → CreateCampaign.jsx (create ad campaigns)
/list-space → CreateProperty.jsx (list advertising spaces)
/property-management → PropertyManagement.jsx (manage user's spaces)
/edit-property → EditProperty.jsx (edit space details)
/checkout → Checkout.jsx (payment processing)
/campaign-details → CampaignDetails.jsx (campaign details)

Admin Routes (require admin role):
/admin → Admin.jsx (admin dashboard)
/data-seeder → DataSeeder.jsx (seed test data)

Authentication Routes:
/sign-in → SignIn.jsx (custom Clerk sign-in)
/sign-up → SignUp.jsx (custom Clerk sign-up)
```

### Backend API Routes (`backend/src/server.js`)
```
Public Routes (no authentication):
GET /health - Server health check
GET /api/health - API health check
GET /api/spaces - Browse advertising spaces
GET /api/areas - Browse advertising areas
GET /api/advertising-areas - Browse advertising areas (full name)

Protected Routes (require authentication):
/api/auth/* - Authentication endpoints
/api/users/* - User management
/api/campaigns/* - Campaign management
/api/bookings/* - Booking management
/api/messages/* - Message management
/api/invoices/* - Invoice management
/api/upload/* - File upload
POST,PUT,DELETE /api/spaces/* - Space management (protected operations)

Legacy Redirects:
/api/properties/* → /api/spaces/* (301 redirect)
```

## 📊 DATABASE SCHEMA

### Core Models (Prisma Schema)
```sql
User {
  id, clerkId, email, firstName, lastName, role, phone, imageUrl
  → properties[], campaigns[], bookings[], messages[], invoices[]
}

Property (Advertising Spaces) {
  id, title, description, address, city, state, coordinates
  type, spaceType, dimensions, images, pricing, status
  → owner(User), campaigns[], bookings[], advertisingAreas[]
}

Campaign {
  id, title, description, budget, startDate, endDate, status
  → advertiser(User), property(Property), bookings[], invoices[]
}

Booking {
  id, startDate, endDate, totalAmount, status, isPaid
  → booker(User), property(Property), campaign(Campaign)
}

AdvertisingArea {
  id, name, type, coordinates, pricing, features
  → property(Property), bookings[]
}

Invoice {
  id, amount, dueDate, status, isPaid, stripeInvoiceId
  → user(User), booking(Booking), campaign(Campaign)
}

Message {
  id, content, type, priority, isRead
  → sender(User), recipient(User)
}
```

### Enums & Types
```sql
UserRole: USER, PROPERTY_OWNER, ADVERTISER, ADMIN, SUPER_ADMIN
PropertyType: HOUSE, APARTMENT, COMMERCIAL, BUILDING, VEHICLE_FLEET, etc.
SpaceType: building, vehicle_fleet, event_venue, transit_station, billboard, etc.
PropertyStatus: DRAFT, PENDING, APPROVED, REJECTED, ACTIVE, INACTIVE
CampaignStatus: DRAFT, PENDING_APPROVAL, APPROVED, ACTIVE, PAUSED, COMPLETED
BookingStatus: PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED
```

## 🔐 AUTHENTICATION FLOW

### Clerk Integration
1. **Frontend Auth**: Uses Clerk React hooks (`useAuth`, `useUser`)
2. **Backend Auth**: Clerk middleware validates JWT tokens
3. **User Context**: Available throughout app via Clerk hooks
4. **Role-Based Access**: Admin access via `user.publicMetadata.role`

### Auth Patterns
```javascript
// Frontend - Get current user
const { user } = useUser();
const { isSignedIn } = useAuth();

// Backend - Validate and sync user
import { clerkMiddleware, syncUser } from './middleware/clerk.js';

// User data access
const userId = user?.id;
const userName = user?.fullName || `${user?.firstName} ${user?.lastName}`;
const userEmail = user?.emailAddresses?.[0]?.emailAddress;
const userRole = user?.publicMetadata?.role;
```

### Verification System (`src/components/verification/`)
```javascript
// VerificationProvider.jsx - Global verification state
// VerificationModal.jsx - Verification UI component
// Checks for required fields: phone, company, address, bio
// Uses Clerk metadata for verification status
```

### Protected Routes
```javascript
// ProtectedRoute.jsx - Route protection wrapper
// Redirects to sign-in if not authenticated
// Supports admin-only routes with requireAdmin prop
```

## 🌐 API CLIENT STRUCTURE

### Frontend API Client (`src/api/apiClient.js`)
```javascript
// Public endpoints (no auth required)
- GET /spaces - Browse advertising spaces
- GET /areas - Browse advertising areas

// Protected endpoints (auth required)
- Campaign operations: getCampaigns(), createCampaign(), etc.
- Space management: getMySpaces(), createSpace(), etc.
- Booking operations: getBookings(), createBooking(), etc.
- User operations: getUserProfile(), updateUserProfile(), etc.
- Invoice operations: getInvoices(), payInvoice(), etc.
```

### API Entities Layer (`src/api/entities.js`)
```javascript
// Abstraction layer over API client
export const Campaign = { list(), get(id), create(data), update(id, data), delete(id) }
export const Space = { list(), get(id), create(data), update(id, data), delete(id) }
export const Booking = { list(), get(id), create(data), update(id, data), cancel(id) }
export const Invoice = { list(), get(id), create(data), pay(id, data) }
export const Area = { list(), get(id) }

// Legacy support (redirects to Space)
export const Property = { /* redirects to Space methods */ }
```

### Base44 Migration Status
- ✅ **COMPLETED**: All Base44 dependencies removed
- ✅ **REPLACED**: With Clerk authentication system
- ✅ **STATUS**: Production-ready, no legacy code remaining

## 🎨 COMPONENT ARCHITECTURE

### Layout System (`src/pages/Layout.jsx`)
```
Layout (Main container)
├── DesktopSidebar (Navigation, search, user info)
├── MobileTopBar (Mobile header)
├── MobileNav (Bottom navigation)
├── Main Content Area
└── ChatBot (AI assistant)
```

### UI Components (`src/components/ui/`)
- Built with Radix UI primitives
- Styled with Tailwind CSS
- Consistent design system
- Responsive and accessible

### Business Components
```
/components/
├── admin/ - Admin-specific components
├── analytics/ - Analytics and reporting
├── booking/ - Booking management
├── chatbot/ - AI chatbot system
├── dashboard/ - Dashboard widgets
├── invoices/ - Invoice management
├── map/ - Google Maps integration
├── messages/ - Messaging system
├── payments/ - Payment processing
├── properties/ - Property/space management
├── search/ - Search functionality
├── ui/ - Reusable UI components
└── verification/ - User verification
```

## 🤖 AI CHATBOT SYSTEM

### Architecture (`src/components/chatbot/`)
```
ChatBot.jsx - Main chatbot interface
├── Voice Recognition (Web Speech API)
├── Text-to-Speech (Speech Synthesis)
├── Context Awareness (Current page, user state)
├── Quick Actions (Page-specific shortcuts)
├── Command Processing (Navigation, actions)
└── Gemini Integration (Currently mocked)
```

### Chatbot Context (`src/contexts/ChatBotContext.jsx`)
```javascript
// Global application context for chatbot
- User state management (Clerk user data)
- Page-aware responses (location.pathname)
- Smart suggestions based on user activity
- Data fetching and caching
- Real-time context updates
```

### Gemini Integration (`src/lib/gemini.js`)
```javascript
// AI Service Layer (Currently mocked)
class GeminiService {
  async initialize() - Initialize AI service
  async generateContent(prompt) - Generate AI responses
  async chat(message) - Chat interface
}
// Note: Currently using mock responses, ready for real Gemini API
```

### Chatbot Features
- ✅ **Context-aware responses** based on current page and user state
- ✅ **Voice interaction** with speech recognition and text-to-speech
- ✅ **Real-time command processing** with visual feedback
- ✅ **Smart quick actions** based on user's current page
- ✅ **Conversation persistence** within session
- ✅ **Error handling** and graceful degradation
- ✅ **Accessibility support** with proper ARIA labels
- ✅ **Mobile-responsive design** with touch-friendly interface

## 🗺️ GOOGLE MAPS INTEGRATION

### Implementation (`src/lib/google-maps.ts`)
```typescript
// TypeScript wrapper for Google Maps
// Features:
- Interactive maps with custom markers
- User location detection
- Distance calculations
- Property price display
- Directions integration
```

### Map Components (`src/components/map/`)
- `GoogleMap.jsx` - Main map component
- Map markers for advertising spaces
- Search and filter integration
- Mobile-responsive design

## 📱 RESPONSIVE DESIGN

### Breakpoints
```css
Mobile: < 768px (Bottom navigation, top bar)
Tablet: 768px - 1024px (Responsive sidebar)
Desktop: > 1024px (Full sidebar, optimal layout)
```

### Theme System
- Light/Dark mode toggle
- CSS custom properties
- Tailwind CSS theming
- User preference persistence

## 🚀 DEPLOYMENT CONFIGURATION

### Frontend (Vite)
```javascript
// vite.config.js - Build configuration
// Environment variables via .env files
// Production build optimization
```

### Backend (Node.js)
```javascript
// Express server with production middleware
// CORS configuration for multiple origins
// Rate limiting and security headers
// Error handling and logging
```

## 📝 DEVELOPMENT WORKFLOW

### File Structure Conventions
```
src/
├── pages/ - Route components (one per page)
├── components/ - Reusable UI components
├── contexts/ - React context providers
├── hooks/ - Custom React hooks
├── lib/ - Utility libraries and configs
├── api/ - API client and data fetching
├── types/ - TypeScript type definitions
└── utils/ - Pure utility functions
```

### Naming Conventions
- **Pages**: PascalCase (e.g., `Dashboard.jsx`)
- **Components**: PascalCase (e.g., `UserProfile.jsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useApiClient.js`)
- **Utilities**: camelCase (e.g., `formatPrice.js`)
- **API**: camelCase (e.g., `apiClient.js`)

## 🔧 CONFIGURATION FILES

### Package Management
```
package.json - Frontend dependencies and scripts
backend/package.json - Backend dependencies and scripts
```

### Build Configuration
```
vite.config.js - Vite build configuration
tailwind.config.js - Tailwind CSS configuration
postcss.config.js - PostCSS configuration
eslint.config.js - ESLint configuration
jsconfig.json - JavaScript/TypeScript configuration
```

### Environment Configuration
```
.env - Frontend environment variables
backend/.env - Backend environment variables
backend/.env.example - Backend environment template
```

## 🎯 KEY FEATURES IMPLEMENTED

### ✅ Authentication System
- Clerk integration with custom UI
- Role-based access control
- User profile management
- Session management

### ✅ Property/Space Management
- List advertising spaces
- Browse and search spaces
- Google Maps integration
- Image upload and management

### ✅ Campaign Management
- Create advertising campaigns
- Campaign analytics
- Budget management
- Performance tracking

### ✅ Booking System
- Book advertising spaces
- Calendar integration
- Booking management
- Status tracking

### ✅ Payment Processing
- Stripe integration
- Invoice generation
- Payment tracking
- Automated billing

### ✅ AI Chatbot
- Context-aware responses
- Voice interaction
- Quick actions
- Command processing

### ✅ Admin Dashboard
- User management
- Property approvals
- System analytics
- Admin controls

## 🛡️ SECURITY MEASURES

### Authentication
- **JWT token validation** via Clerk middleware
- **Multi-method token verification** (Clerk API, JWKS, JWT decode)
- **Role-based access control** using Clerk metadata
- **Protected routes** with automatic redirects
- **Secure session management** via Clerk

### API Security
- **CORS configuration** for multiple development origins
- **Rate limiting** (100 requests per 15 minutes per IP)
- **Input validation** using Zod schemas
- **Error handling** with secure error messages
- **Helmet middleware** for security headers

### Backend Security (`backend/src/middleware/`)
```javascript
// clerk.js - Authentication middleware
export const clerkMiddleware // Main auth middleware
export const syncUser // Legacy compatibility
export const requireAdmin // Admin-only routes
export const optionalAuth // Optional authentication

// errorHandler.js - Error handling middleware
// Secure error messages in production
// Detailed logging for development
```

### Data Protection
- **Environment variable management** (.env files)
- **Secure API endpoints** with proper authentication
- **User data encryption** via Clerk
- **Privacy controls** in user metadata
- **Database security** via Prisma ORM

## 📊 MONITORING & ANALYTICS

### Application Monitoring
- Health check endpoints
- Error tracking
- Performance monitoring
- User activity tracking

### Business Analytics
- Dashboard analytics
- Campaign performance
- Booking metrics
- Revenue tracking

## 🔄 MIGRATION STATUS

### Base44 → Clerk Migration
- ✅ **COMPLETED**: All Base44 code removed
- ✅ **AUTHENTICATION**: Migrated to Clerk authentication system
- ✅ **USER MANAGEMENT**: Using Clerk user system with metadata
- ✅ **PRODUCTION READY**: No legacy dependencies remaining

### Migration Details
```javascript
// Old Base44 pattern (removed)
const user = await User.me();

// New Clerk pattern (implemented)
const { user } = useUser();
const { isSignedIn } = useAuth();

// Backend user sync
req.user // Synced from Clerk via middleware
```

### Files Successfully Migrated
- ✅ All page components (Dashboard, Profile, Admin, etc.)
- ✅ All admin components (PropertyApprovalsPanel, etc.)
- ✅ All booking components (MultiSpaceBookingModal, etc.)
- ✅ All chatbot components (ChatBot, EnhancedChatBot, etc.)
- ✅ All contexts (ChatBotContext, VerificationProvider, etc.)
- ✅ All UI components (ThemeToggle, etc.)

### Current State
- **Status**: Production-ready
- **Dependencies**: Modern, maintained packages only
- **Performance**: Optimized for production use
- **Security**: Industry-standard authentication
- **Documentation**: Complete with examples

---

## 🎯 QUICK REFERENCE FOR MAJOR CHANGES

### When making changes, always consider:
1. **Authentication**: Use Clerk hooks, not Base44
2. **API Calls**: Use apiClient.js for consistent patterns
3. **User Context**: Available via useUser() hook
4. **Routing**: Update Index.jsx for new routes
5. **Database**: Update Prisma schema for data changes
6. **Types**: Update TypeScript definitions as needed

### Key Files to Update for Major Features:
- **New Pages**: Add to `src/pages/Index.jsx` routing
- **New API**: Add to `backend/src/server.js` and route files
- **New Database**: Update `backend/prisma/schema.prisma`
- **New Components**: Add to appropriate `src/components/` folder
- **New Styles**: Update `tailwind.config.js` if needed

---

**This project map should be updated after any major structural changes to keep the context current and accurate.**
