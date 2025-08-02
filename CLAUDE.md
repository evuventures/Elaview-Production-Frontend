# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Elaview is a B2B marketplace that connects property owners with physical advertising space (buildings, storefronts, billboards, vehicles) with businesses looking to rent those spaces for advertising campaigns. The platform uses location-based technology to calculate rental value based on foot traffic and visibility metrics.

## Tech Stack

- **Frontend**: React 18 + Vite, TypeScript/JavaScript (mixed), Tailwind CSS, Radix UI components
- **Backend**: Node.js + Express (hosted on Railway at elaview-backend.up.railway.app)
- **Database**: PostgreSQL with Prisma ORM (hosted on Railway)
- **Authentication**: Clerk (fully integrated, Base44 SDK removed)
- **Maps**: Google Maps API (@vis.gl/react-google-maps, @react-google-maps/api)
- **Payments**: Stripe (fully integrated checkout flow)
- **File Storage**: Cloudinary
- **AI Integration**: Google Gemini API (mocked responses, ready for production)
- **State Management**: React Query (@tanstack/react-query), React Context API
- **Routing**: React Router v7
- **Build Tool**: Vite with path aliases and TypeScript support

## Development Commands

```bash
# Frontend development (runs on port 3000)
cd frontend
npm install
npm run dev

# Build for production
npm run build

# Lint the code
npm run lint

# Preview production build
npm run preview
```

## Architecture Overview

### Frontend Structure
The frontend is located in the `/frontend` directory with the following key areas:

- **Pages** (`/frontend/src/pages/`): Route components organized by feature
  - Main routes: browse/, dashboard/, checkout/, campaigns/, properties/, auth/
  - Role-specific dashboards: dashboard/owner/, dashboard/advertiser/, dashboard/admin/
  - Complex page structure with components/, hooks/, utils/ subdirectories
- **Components** (`/frontend/src/components/`): Reusable UI components organized by feature
  - Feature-based organization: auth/, booking/, browse/, campaigns/, dashboard/, etc.
  - Advanced components: chatbot/, maps/, analytics/, notifications/, payments/
- **API Client** (`/frontend/src/api/`): Centralized API communication with rate limiting
  - Main client: `apiClient.js` with request deduplication and caching
  - Entities layer: `entities.js` with high-level API abstractions
  - Base44 client: `base44Client.js` (legacy, being phased out)
- **Contexts** (`/frontend/src/contexts/`): React context providers for global state
- **Hooks** (`/frontend/src/hooks/`): Custom React hooks for API calls and utilities
- **UI Components** (`/frontend/src/components/ui/`): Radix UI-based design system with extensive customization
- **Library** (`/frontend/src/lib/`): Utility libraries for auth, maps, AI, navigation
- **Types** (`/frontend/src/types/`): TypeScript type definitions
- **Development** (`/frontend/src/dev/`): Debug components and tools

### API Architecture
- **API Client** (`/frontend/src/api/apiClient.js`): Main API client with advanced features:
  - Clerk JWT token integration and automatic refresh
  - Request deduplication and response caching (60s duration)
  - Rate limiting with exponential backoff
  - Automatic retries with jitter for resilience
  - 30-second timeout with abort controller
- **Entities Layer** (`/frontend/src/api/entities.js`): High-level API abstractions
  - Entity classes: User, Property, Space, Campaign, Booking, Message, Invoice
  - Helper functions for data extraction and error handling
  - Support for pagination and filtering
- **Base URL**: https://elaview-backend.up.railway.app/api (configured via `VITE_API_BASE_URL`)

### Authentication Flow
1. Clerk handles all authentication (sign-in, sign-up, session management)
2. Frontend uses Clerk React hooks (`useUser`, `useAuth`) and window.Clerk API
3. API requests automatically include Clerk JWT tokens via Authorization header
4. Backend validates tokens via Clerk middleware
5. User roles and admin status determined by backend API calls
6. Protected routes use `ProtectedRoute` component with role-based access control

### Key User Roles & Access Levels
- **Basic Users**: Authenticated users with profile access
- **Property Owners**: Can list and manage advertising spaces
- **Advertisers**: Can create campaigns and book spaces
- **Admin Users**: System administration with backend-verified admin status
- **Role Management**: Handled dynamically by backend API, not hardcoded in frontend

## Important Development Notes

### Database Changes
- All database schema changes must be made in the Prisma schema file (backend repo)
- Changes must be pushed to Railway PostgreSQL using Prisma migrations
- Never modify database directly

### API Patterns
- **Base URL**: https://elaview-backend.up.railway.app/api
- **Public endpoints**: `/api/spaces`, `/api/areas` (no auth required)
- **Protected endpoints**: All other endpoints require Clerk JWT authentication
- **Rate limiting**: Implemented with backoff and caching strategies
- **Error handling**: Graceful degradation with fallback responses
- **Legacy redirects**: 
  - `/api/properties/*` → `/api/spaces/*` (unified space management)
  - `/booking/*` → `/checkout/*` (checkout flow consolidation)

### Component Patterns
- **UI Foundation**: Radix UI components from `/frontend/src/components/ui/` with extensive customization
- **Design System**: Teal-based color palette, Inter font, sophisticated animations
- **Component Organization**: Feature-based directories with components/, hooks/, utils/ structure
- **TypeScript Usage**: Mixed TypeScript/JavaScript codebase, TypeScript for complex components
- **Styling**: Tailwind CSS with custom utilities and extensive theme configuration

### File Naming Conventions
- **Pages**: PascalCase (e.g., `Dashboard.jsx`, `BrowsePage.jsx`)
- **Components**: PascalCase (e.g., `UserProfile.jsx`, `SpaceCard.jsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useApiClient.js`, `useMultiBooking.js`)
- **API files**: camelCase (e.g., `apiClient.js`, `entities.js`)
- **Types**: camelCase (e.g., `property.ts`, `messages.ts`)
- **Utils**: camelCase (e.g., `bookingHelpers.js`, `pricingCalculator.js`)

### State Management
- **Local State**: React useState for UI-only state
- **Server State**: React Query (@tanstack/react-query) with 5-minute stale time
- **Global State**: React Context API (ChatBotContext, VerificationProvider)
- **Authentication**: Clerk hooks (`useUser`, `useAuth`) for user/auth state
- **Form State**: React Hook Form with Zod validation

### Testing
Currently minimal testing setup:
- **Test Files**: `/frontend/src/lib/google-maps.test.js` only
- **Debug Tools**: Extensive debug components in `/frontend/src/dev/debug/`
- **API Testing**: Built-in API debug tools and rate limiting testing

## Common Tasks

### Add a New Page
1. Create component in appropriate `/frontend/src/pages/` subdirectory
2. Add route in `/frontend/src/pages/Pages.tsx` with proper protection level
3. Use Layout component wrapper with currentPageName prop
4. Add navigation link in layout components if needed
5. Follow existing pattern: protected routes use ProtectedRoute wrapper

### Add a New API Endpoint
1. Add method to `/frontend/src/api/apiClient.js` with proper error handling
2. Add entity method to `/frontend/src/api/entities.js` if applicable
3. Ensure Clerk JWT token inclusion and rate limiting compliance
4. Add appropriate caching strategy for GET requests
5. Test with debug tools in `/frontend/src/dev/debug/`

### Update UI Components
1. Check `/frontend/src/components/ui/` for existing Radix UI components
2. Follow teal-based design system and animation patterns
3. Use Tailwind utilities and custom classes consistently
4. Maintain responsive design across all screen sizes
5. Add proper accessibility attributes

### Work with Maps
1. Use existing map components in `/frontend/src/components/browse/maps/`
2. Google Maps configuration in `/frontend/src/lib/google-maps.ts`
3. Multiple map providers: @vis.gl/react-google-maps and @react-google-maps/api
4. Map fallback components for error handling
5. Location picker components with autocomplete functionality

## Environment Variables

Frontend uses Vite environment variables (`.env` files):
- `VITE_API_BASE_URL`: Backend API URL (https://elaview-backend.up.railway.app/api)
- `VITE_CLERK_PUBLISHABLE_KEY`: Clerk public key for authentication
- `VITE_GOOGLE_MAPS_API_KEY`: Google Maps JavaScript API key
- `VITE_GOOGLE_MAPS_MAP_ID`: Google Maps Map ID for styling
- `VITE_MAPS_PLATFORM_API_KEY`: Additional Maps Platform API key
- `VITE_CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name for file uploads
- `VITE_STRIPE_PUBLISHABLE_KEY`: Stripe public key for payments
- `VITE_GEMINI_API_KEY`: Google Gemini API key for AI features
- `VITE_APP_NAME`: Application name
- `VITE_APP_VERSION`: Application version

## Current Project Status

- ✅ **Authentication**: Clerk fully integrated, Base44 SDK completely removed
- ✅ **API Layer**: Advanced API client with rate limiting, caching, and error handling
- ✅ **Routing**: React Router v7 with comprehensive route structure and protection
- ✅ **UI System**: Radix UI + Tailwind CSS with custom teal-based design system
- ✅ **Payments**: Stripe integration with complete checkout flow
- ✅ **Maps**: Google Maps integration with multiple providers and fallbacks
- ✅ **Dashboards**: Role-specific dashboards for owners, advertisers, and admins
- ✅ **Business Logic**: Complete booking, campaign, and property management flows
- ✅ **Verification**: User profile verification system
- ✅ **File Handling**: Cloudinary integration for uploads and media management
- 🚧 **AI Features**: Gemini API integrated but using mocked responses
- 🚧 **Testing**: Minimal test coverage, debug tools available
- 🚧 **Material Sourcing**: Admin material catalog and order processing system

## Key Files Reference

### Core Application
- **Entry Point**: `/frontend/src/main.jsx` (React + Clerk + React Query setup)
- **App Component**: `/frontend/src/App.jsx`
- **Routing**: `/frontend/src/pages/Pages.tsx` (comprehensive route definitions)
- **Main Layout**: `/frontend/src/components/layout/Layout.tsx`

### API & Data
- **API Client**: `/frontend/src/api/apiClient.js` (advanced client with caching)
- **API Entities**: `/frontend/src/api/entities.js` (high-level abstractions)
- **API Config**: Uses Railway backend at elaview-backend.up.railway.app

### Authentication & Security
- **Clerk Setup**: `/frontend/src/lib/clerk.js`
- **Protected Routes**: `/frontend/src/components/auth/ProtectedRoute.jsx`
- **Verification**: `/frontend/src/components/verification/VerificationProvider.jsx`

### Styling & UI
- **Global Styles**: `/frontend/src/index.css`
- **Tailwind Config**: `/frontend/tailwind.config.js` (custom teal theme)
- **UI Components**: `/frontend/src/components/ui/` (Radix UI foundation)

### Configuration
- **Vite Config**: `/frontend/vite.config.js` (with path aliases)
- **TypeScript**: `/frontend/tsconfig.json` (mixed TS/JS support)
- **Environment**: `/frontend/.env` (API keys and configuration)