# Frontend Context Documentation

This document provides comprehensive context about the Elaview Production Frontend for AI assistants and developers working with this codebase.

## 🔄 MAINTENANCE NOTE
**IMPORTANT**: This document should be updated whenever changes are made to the frontend codebase to ensure it reflects the current state of the project. This includes:
- New components, pages, or features
- API endpoint changes or additions
- Routing modifications
- Data model updates
- Dependency changes
- Environment variable changes
- Migration completions or status updates

Keep this documentation current to maintain its value for AI assistance and developer onboarding.

## Project Overview

**Elaview** is a B2B marketplace that connects landlords with physical advertising space (buildings, billboards, vehicles) with businesses looking to rent those spaces. The platform uses patented technology to calculate rental value based on foot traffic and view rates.

### Business Model
- **Space Owners**: List advertising spaces (billboards, walls, vehicles, etc.)
- **Advertisers**: Browse, book, and manage advertising campaigns
- **Platform**: Facilitates transactions with Stripe integration

## Tech Stack

### Frontend Technologies
- **Framework**: React 18 + Vite
- **Languages**: JavaScript/TypeScript (mixed codebase)
- **Styling**: Tailwind CSS + CSS custom properties
- **UI Components**: Radix UI-based design system
- **Routing**: React Router v7
- **State Management**: React Query (@tanstack/react-query) for server state
- **Authentication**: Clerk (replaced Base44 SDK)
- **Maps**: Google Maps API (@vis.gl/react-google-maps)
- **Payments**: Stripe (@stripe/react-stripe-js)
- **File Storage**: Cloudinary
- **AI Integration**: Google Gemini API (currently mocked)

### Development Tools
- **Build Tool**: Vite
- **Linting**: ESLint
- **Type Checking**: TypeScript (partial adoption)
- **Package Manager**: npm

## Project Structure

### Directory Architecture
```
frontend/
├── src/
│   ├── api/                    # API client and entity layers
│   │   ├── apiClient.js        # Main API client with Clerk integration
│   │   ├── entities.js         # High-level API abstractions
│   │   └── integrations.js     # Third-party integrations
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # Radix UI design system components
│   │   ├── auth/               # Authentication components
│   │   ├── booking/            # Booking-related components
│   │   ├── browse/             # Property browsing components
│   │   ├── campaigns/          # Campaign management components
│   │   ├── dashboard/          # Dashboard components
│   │   ├── layout/             # Layout and navigation components
│   │   ├── messages/           # Messaging system components
│   │   ├── payments/           # Payment processing components
│   │   └── properties/         # Property management components
│   ├── contexts/               # React context providers
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility libraries and configurations
│   ├── pages/                  # Route components organized by feature
│   │   ├── admin/              # Admin panel pages
│   │   ├── auth/               # Authentication pages
│   │   ├── browse/             # Property browsing pages
│   │   ├── campaigns/          # Campaign management pages
│   │   ├── checkout/           # Checkout flow pages
│   │   ├── dashboard/          # Dashboard pages (owner/advertiser)
│   │   ├── messages/           # Messaging pages
│   │   └── properties/         # Property management pages
│   ├── types/                  # TypeScript type definitions
│   └── utils/                  # Utility functions
├── public/                     # Static assets
└── package.json               # Dependencies and scripts
```

## API Architecture

### API Client Structure
The API layer is organized in two main files:

#### `apiClient.js` - Core HTTP Client
- **Base URL**: Configured via `VITE_API_BASE_URL` environment variable
- **Authentication**: Clerk JWT tokens automatically included
- **Error Handling**: Retry logic with exponential backoff
- **Timeout**: 30-second default timeout
- **Methods**: Standard REST methods (GET, POST, PUT, PATCH, DELETE)

#### `entities.js` - High-Level API Abstractions
Provides entity-based API interfaces for:
- **User**: User management and profiles
- **Property**: Property listings and management
- **Space**: Advertising spaces (replaces deprecated AdvertisingArea)
- **Campaign**: Campaign creation and management
- **Booking**: Booking lifecycle management
- **Message**: Messaging system
- **Invoice**: Invoice and payment tracking
- **Notification**: Notification system

### Key API Endpoints

#### Public Endpoints (No Auth Required)
- `GET /api/spaces` - Browse available advertising spaces
- `GET /api/areas` - Legacy areas endpoint (redirects to spaces)

#### Protected Endpoints (Require Clerk Authentication)
- `GET /api/users/profile` - Current user profile
- `GET /api/dashboard/space-owner` - Space owner dashboard data
- `GET /api/dashboard/advertiser` - Advertiser dashboard data
- `POST /api/checkout/create-payment-intent` - Stripe payment processing
- `POST /api/checkout/confirm-booking` - Complete booking after payment

#### Admin Endpoints (Require Admin Role)
- `GET /api/admin/*` - Admin panel data and operations
- `POST /api/properties/approve` - Property approval system

### Legacy API Migration
- **Properties → Spaces**: The system migrated from "AdvertisingArea" to "Space" terminology
- **Base44 → Clerk**: Complete authentication system migration
- **Backward Compatibility**: Legacy endpoints redirect with 301 status

## Authentication & Authorization

### Clerk Integration
- **Provider**: Clerk handles all authentication flows
- **Session Management**: Automatic token refresh and session handling
- **React Hooks**: `useUser()`, `useAuth()`, `useClerk()`
- **Route Protection**: `ProtectedRoute` component with role-based access

### User Roles
Stored in `user.publicMetadata.role`:
- `USER`: Basic user (default)
- `PROPERTY_OWNER`: Can list advertising spaces
- `ADVERTISER`: Can create campaigns and book spaces
- `ADMIN`: System administration access
- `SUPER_ADMIN`: Full system access

### Route Authorization
```javascript
// Public routes - no authentication
/browse, /help, /learn-more

// Protected routes - requires authentication
/dashboard, /messages, /profile, /checkout/*

// Admin routes - requires admin role
/admin/*, /data-seeder
```

## Data Models & Types

### Core TypeScript Interfaces

#### Property & Space Types
```typescript
interface Space {
  id: string;
  name: string;
  type: SpaceType;
  dimensions: { width: number; height: number; unit: string };
  location_description: string;
  monthly_rate: number;
  min_contract_length: number;
  max_contract_length: number;
  is_available: boolean;
  features: string[];
  photos: PhotoUpload[];
}

interface PropertyFormData {
  property_name: string;
  property_type: PropertyType;
  description: string;
  total_sqft: number;
  location: LocationData;
  main_photos: PhotoUpload[];
  spaces: Space[];
}
```

#### Message System Types
```typescript
interface ConversationMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  message_type: MessageType;
  created_date: string;
  is_read: boolean;
}

type MessageType = 'text' | 'system' | 'booking_request' | 'booking_confirmed' | ...;
```

### Enums & Constants
- **Property Types**: OFFICE, RETAIL, COMMERCIAL, WAREHOUSE, VEHICLE_FLEET, OTHER
- **Space Types**: billboard, digital_display, wall_graphic, floor_graphic, window_display, etc.
- **User Roles**: USER, PROPERTY_OWNER, ADVERTISER, ADMIN, SUPER_ADMIN

## Component Architecture

### Design System (UI Components)
Located in `src/components/ui/`, based on Radix UI:
- **Primitives**: Button, Input, Dialog, Dropdown, etc.
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Accessibility**: ARIA-compliant components from Radix UI
- **Consistency**: Shared design tokens and component patterns

### Layout Components
- **Layout.tsx**: Main application layout with navigation
- **DesktopTopNavV2.jsx**: Desktop navigation bar
- **MobileNav.jsx**: Mobile navigation drawer
- **ProtectedRoute.jsx**: Route-level authentication wrapper

### Feature Components
Organized by business domain:
- **Browse**: Property search, filtering, and map integration
- **Dashboard**: Role-specific dashboards (owner/advertiser/admin)
- **Booking**: Booking flow, calendar, and management
- **Messages**: Real-time messaging system
- **Payments**: Stripe integration and checkout flow

### State Management Patterns
- **Local State**: `useState` for UI-only state
- **Server State**: React Query for API data caching and synchronization
- **Global State**: Context API sparingly used (ChatBotContext)
- **Form State**: React Hook Form for complex forms

## Key Features & Workflows

### Property Listing Flow
1. **Authentication**: User signs in via Clerk
2. **Role Check**: Verify PROPERTY_OWNER role
3. **Form Steps**: Basic info → Location → Photos → Spaces → Review
4. **Validation**: Client-side validation with error handling
5. **Submission**: API call to create property with admin approval required

### Booking Flow
1. **Browse**: Search and filter available spaces
2. **Selection**: Choose space and dates via calendar
3. **Business Profile**: Complete business profile if needed
4. **Checkout**: Stripe payment processing
5. **Confirmation**: Booking creation and notification system

### Admin Workflows
- **Property Approval**: Review and approve new listings
- **User Management**: Manage user roles and permissions
- **Booking Oversight**: Monitor all platform bookings
- **Material Management**: Catalog and order processing

## Google Maps Integration

### Configuration
- **Loader**: `@googlemaps/js-api-loader` for script loading
- **Components**: `@vis.gl/react-google-maps` for React integration
- **API Key**: Configured via `VITE_GOOGLE_MAPS_API_KEY`

### Map Components
- **SimpleBrowseMap.tsx**: Property browsing with markers
- **ModernLocationPicker.tsx**: Address selection and geocoding
- **AddressAutocomplete.jsx**: Google Places autocomplete

### Features
- Property location display and selection
- Address geocoding and reverse geocoding
- Interactive markers and info windows
- Mobile-responsive map interactions

## Payment Processing

### Stripe Integration
- **Client**: `@stripe/stripe-js` and `@stripe/react-stripe-js`
- **Public Key**: `VITE_STRIPE_PUBLISHABLE_KEY`
- **Flow**: PaymentIntent → Client confirmation → Server booking creation

### Payment Components
- **StripeCheckout.jsx**: Payment form with card input
- **CheckoutPage.jsx**: Complete checkout flow
- **PaymentTest.jsx**: Development testing component

### Business Profile Handling
- Progressive checkout with business profile completion
- Validation for business details before payment
- Error handling for failed payments

## Environment Configuration

### Required Environment Variables
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api

# Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# Maps
VITE_GOOGLE_MAPS_API_KEY=AIza...

# File Storage
VITE_CLOUDINARY_CLOUD_NAME=your-cloud
VITE_CLOUDINARY_UPLOAD_PRESET=your-preset

# Payments
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Development Commands
```bash
# Development server (port 3000)
npm run dev

# Production build
npm run build

# Code linting
npm run lint

# Preview production build
npm run preview
```

## Current Status & Migration Notes

### Completed Migrations
- ✅ Base44 SDK → Clerk authentication (complete)
- ✅ AdvertisingArea → Space terminology
- ✅ Legacy route redirects implemented
- ✅ Stripe payment integration
- ✅ Admin dashboard and approval workflows

### Active Development Areas
- 🚧 AI Chatbot (mocked responses, Gemini ready)
- 🚧 Material sourcing and catalog management
- 🚧 Enhanced booking management features
- 🚧 Progressive checkout flow refinements

### Known Technical Debt
- Mixed JavaScript/TypeScript codebase (gradual migration)
- Some legacy component patterns (being modernized)
- Test coverage minimal (only Google Maps tests exist)

## Development Guidelines

### Code Patterns
- **File Naming**: PascalCase for components, camelCase for utilities
- **Component Structure**: Functional components with hooks
- **Error Handling**: Graceful degradation with user-friendly messages
- **API Calls**: Use entity layer abstractions, not direct API client calls

### Security Considerations
- Never log or expose Clerk tokens
- Validate all user inputs on both client and server
- Use HTTPS for all API communications
- Implement proper CORS policies

### Performance Optimization
- React Query for efficient data caching
- Lazy loading for large components
- Image optimization through Cloudinary
- Map component cleanup on route changes

## Debugging & Development Tools

### Debug Routes (Development Only)
- `/debug-api` - API endpoint testing
- `/debug-map` - Google Maps integration testing
- `/data-seeder` - Database seeding for development

### Logging Patterns
- API calls logged with method and endpoint
- Authentication state changes logged
- Error boundaries for component error handling
- Browser console debugging in development mode

## Common Integration Points

### Working with the API
```javascript
// Use entity layer (preferred)
import { Space, Booking } from '@/api/entities';
const spaces = await Space.list({ available: true });

// Direct API client (for custom endpoints)
import apiClient from '@/api/apiClient';
const response = await apiClient.get('/custom-endpoint');
```

### Authentication Checks
```javascript
import { useUser, useAuth } from '@clerk/clerk-react';

const { user, isSignedIn } = useUser();
const { getToken } = useAuth();

// Check user role
const isAdmin = user?.publicMetadata?.role === 'ADMIN';
```

### Map Integration
```javascript
import { useGoogleMapsLoader } from '@/lib/google-maps';

const { isLoaded, loadError } = useGoogleMapsLoader();
if (isLoaded) {
  // Use Google Maps components
}
```

## 🚨 Backend-Frontend Alignment Issues

### Missing Frontend API Implementations
The following backend endpoints are not implemented in the frontend API client:
- `GET /api/auth/me` - Get current user profile
- `POST /api/users/business-profile` - Create business profile (frontend only has PUT)
- `GET /api/spaces/search` - Advanced space search with filters  
- `GET /api/spaces/nearby` - Location-based space search
- `POST /api/properties/:id/spaces` - Add spaces to properties
- `POST /api/bookings/:id/cancel` - Cancel booking functionality
- `POST /api/bookings/:id/verify` - Upload verification images
- **Material Sourcing APIs** (`/api/materials/*`) - Complete feature missing
- **Installation Tracking APIs** (`/api/installations/*`) - Complete feature missing

### Data Model Discrepancies
**✅ Property Types - ALIGNED:**
- Both Backend and Frontend now use: `HOUSE`, `APARTMENT`, `COMMERCIAL`, `OFFICE`, `RETAIL`, `BUILDING`, `VEHICLE_FLEET`, `BILLBOARD`, `DIGITAL_DISPLAY`, `OTHER`

**✅ Space Type Naming Convention - ALIGNED:**
- Both Backend and Frontend now use: `storefront_window`, `building_exterior`, `event_space`, `retail_frontage`, `pole_mount`, `other`

**✅ Property Status - ALIGNED:**
- Both Backend and Frontend now use: `DRAFT`, `PENDING`, `APPROVED`, `REJECTED`, `ACTIVE`, `INACTIVE`, `ARCHIVED`

### Frontend-Only Features
These features exist in frontend but may not have backend support:
- Conversation/ChatMessage entities for enhanced messaging
- Creative management system
- Advanced notification system implementation

### Material Sourcing Gap
Backend has comprehensive material sourcing features not reflected in frontend:
- Surface type tracking (`WINDOW_GLASS`, `STOREFRONT_WINDOW`, `EXTERIOR_WALL_SMOOTH`)
- Installation status tracking (`PENDING`, `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`)
- Material status workflow (`NOT_ORDERED`, `QUOTE_REQUESTED`, `MATERIALS_ORDERED`, `SHIPPED`)
- Cost tracking (materialCost, installationCost, platformFee)

### Checkout Flow Alignment
**✅ Working Well:**
- Stripe payment intent creation and confirmation
- Business profile completion requirement
- Multi-booking support

**⚠️ Potential Issues:**
- Frontend uses `PUT /api/users/business-profile` but backend expects `POST /api/users/business-profile` for creation

**Recommendation**: Prioritize implementing material sourcing APIs and aligning data models for consistent property/space type handling.

---

This documentation should be updated as the codebase evolves, particularly during the ongoing TypeScript migration and feature development.