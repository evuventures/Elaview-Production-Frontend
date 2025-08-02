# Elaview Backend API Context

This document provides comprehensive context about the Elaview backend API structure, data models, and endpoints for frontend development.

## Project Overview

**Elaview** is a B2B marketplace connecting landlords with advertising space (building walls, windows, vehicles, billboards) with businesses looking to rent those spaces for ads. The platform uses patented technology to calculate rental value based on foot traffic/view rates.

### Technology Stack
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk (webhook-based user sync)
- **Payments**: Stripe (payment intents, webhooks)
- **File Storage**: Cloudinary for image uploads
- **Deployment**: Railway

---

## Core Data Models & Relationships

### 1. Users (`users`)
Primary user model synced from Clerk with business profile fields.

```typescript
interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  full_name?: string;
  imageUrl?: string;
  phone?: string;
  role: 'USER' | 'PROPERTY_OWNER' | 'ADVERTISER' | 'ADMIN' | 'SUPER_ADMIN';
  isAdmin: boolean;
  isActive: boolean;
  
  // Business Profile Fields
  businessName?: string;
  businessType?: BusinessType;
  businessIndustry?: string;
  businessAddress?: object; // JSON
  businessPhone?: string;
  businessWebsite?: string;
  taxId?: string;
  businessRegistration?: string;
  businessDescription?: string;
  
  // Business Verification
  isBusinessVerified: boolean;
  businessVerifiedAt?: Date;
  businessDocuments?: object; // JSON array
  businessProfileComplete: boolean;
  businessProfileCompletedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. Properties (`properties`)
Physical locations owned by space owners.

```typescript
interface Property {
  id: string;
  name?: string;
  title: string;
  description?: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  location?: object; // JSON
  propertyType?: PropertyType;
  size?: number;
  spaceType?: SpaceType;
  dimensions?: object; // JSON
  specifications?: object; // JSON
  primary_image?: string;
  basePrice?: number;
  pricing?: object; // JSON
  currency: string; // default "USD"
  status: PropertyStatus; // default "DRAFT"
  isActive: boolean;
  isApproved: boolean;
  ownerId: string; // FK to users
  features?: object; // JSON
  images?: object; // JSON
  photos?: object; // JSON
  videos?: object; // JSON
  documents?: object; // JSON
  createdAt: Date;
  updatedAt: Date;
}
```

### 3. Spaces (`spaces`) - Advertising Areas
**Important**: This was previously called `advertising_areas`. These are the actual bookable ad spaces within properties.

```typescript
interface Space {
  id: string;
  name: string;
  title?: string;
  description?: string;
  type?: string;
  dimensions?: object; // JSON
  coordinates: object; // JSON - required
  city: string;
  state?: string;
  country: string;
  baseRate?: number;
  pricing?: object; // JSON
  rateType: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'; // default "DAILY"
  currency: string; // default "USD"
  status: string; // default "active"
  isActive: boolean;
  maxBookings?: number;
  images?: string;
  propertyId?: string; // FK to properties
  features?: object; // JSON
  
  // Material Sourcing Fields (MVP)
  surfaceType?: SurfaceType;
  accessDifficulty?: number; // 1-5 scale
  installRequirements?: object; // JSON
  materialCompatibility?: object; // JSON array
  estimatedMaterialCost?: number;
  surfaceCondition?: SurfaceCondition;
  weatherExposure?: WeatherExposure;
  permitsRequired: boolean;
  permitDetails?: string;
  powerAvailable: boolean;
  lightingConditions?: LightingCondition;
  
  createdAt: Date;
  updatedAt: Date;
}
```

### 4. Bookings (`bookings`)
Reservations for advertising spaces.

```typescript
interface Booking {
  id: string;
  startDate: Date;
  endDate: Date;
  totalAmount: number;
  currency: string; // default "USD"
  status: BookingStatus; // default "PENDING"
  isPaid: boolean;
  notes?: string;
  metadata?: string;
  bookingType?: string;
  verificationImageUrl?: string;
  bookerId: string; // FK to users
  propertyId?: string; // FK to properties
  campaignId?: string; // FK to campaigns
  advertisingAreaId?: string; // FK to spaces (legacy name)
  
  // Material Sourcing Fields (MVP)
  materialCost?: number;
  installationCost?: number;
  platformFee?: number;
  materialStatus?: MaterialStatus;
  installationStatus?: InstallationStatus;
  
  createdAt: Date;
  updatedAt: Date;
}
```

### 5. Campaigns (`campaigns`)
Advertiser marketing campaigns.

```typescript
interface Campaign {
  id: string;
  name: string;
  title?: string;
  description?: string;
  budget?: number;
  dailyBudget?: number;
  currency: string; // default "USD"
  targetAudience?: object; // JSON
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  impressions: number;
  clicks: number;
  conversions: number;
  totalSpent: number;
  status: CampaignStatus; // default "DRAFT"
  advertiserId: string; // FK to users
  propertyId?: string; // FK to properties
  
  // Campaign Details
  brand_name: string;
  content_description?: string;
  content_type?: object; // JSON
  media_dimensions?: string;
  media_files?: object; // JSON
  media_type?: string;
  keywords?: object; // JSON
  primary_objective?: string;
  target_demographics?: object; // JSON
  geographic_targeting?: object; // JSON
  creative_concept?: string;
  call_to_action?: string;
  brand_guidelines?: object; // JSON
  placement_preferences?: object; // JSON
  success_metrics?: object; // JSON
  technical_specs?: object; // JSON
  
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Key Enums

### User & Business Types
```typescript
enum UserRole {
  USER = "USER",
  PROPERTY_OWNER = "PROPERTY_OWNER",
  ADVERTISER = "ADVERTISER",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN"
}

enum BusinessType {
  SMALL_BUSINESS = "SMALL_BUSINESS",
  MEDIUM_BUSINESS = "MEDIUM_BUSINESS",
  LARGE_ENTERPRISE = "LARGE_ENTERPRISE",
  STARTUP = "STARTUP",
  AGENCY = "AGENCY",
  NON_PROFIT = "NON_PROFIT",
  FREELANCER = "FREELANCER",
  CORPORATION = "CORPORATION",
  LLC = "LLC",
  PARTNERSHIP = "PARTNERSHIP",
  OTHER = "OTHER"
}
```

### Property & Space Types
```typescript
enum PropertyType {
  HOUSE = "HOUSE",
  APARTMENT = "APARTMENT",
  COMMERCIAL = "COMMERCIAL",
  OFFICE = "OFFICE",
  RETAIL = "RETAIL",
  BUILDING = "BUILDING",
  VEHICLE_FLEET = "VEHICLE_FLEET",
  BILLBOARD = "BILLBOARD",
  DIGITAL_DISPLAY = "DIGITAL_DISPLAY",
  OTHER = "OTHER"
}

enum SpaceType {
  storefront_window = "storefront_window",
  building_exterior = "building_exterior",
  event_space = "event_space",
  retail_frontage = "retail_frontage",
  pole_mount = "pole_mount",
  other = "other"
}

enum PropertyStatus {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  ARCHIVED = "ARCHIVED"
}
```

### Booking & Campaign Status
```typescript
enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED"
}

enum CampaignStatus {
  DRAFT = "DRAFT",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  APPROVED = "APPROVED",
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  REJECTED = "REJECTED",
  PLANNING = "PLANNING"
}
```

### Material Sourcing (MVP Feature)
```typescript
enum MaterialStatus {
  NOT_ORDERED = "NOT_ORDERED",
  QUOTE_REQUESTED = "QUOTE_REQUESTED",
  MATERIALS_ORDERED = "MATERIALS_ORDERED",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  INSTALLED = "INSTALLED",
  COMPLETED = "COMPLETED"
}

enum InstallationStatus {
  PENDING = "PENDING",
  SCHEDULED = "SCHEDULED",
  MATERIALS_READY = "MATERIALS_READY",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  NEEDS_REWORK = "NEEDS_REWORK"
}

enum SurfaceType {
  WINDOW_GLASS = "WINDOW_GLASS",
  STOREFRONT_WINDOW = "STOREFRONT_WINDOW",
  EXTERIOR_WALL_SMOOTH = "EXTERIOR_WALL_SMOOTH",
  DIGITAL_MOUNT_POLE = "DIGITAL_MOUNT_POLE",
  CONCRETE_SURFACE = "CONCRETE_SURFACE",
  OTHER = "OTHER"
}
```

---

## API Endpoints Structure

### Base URL
```
Production: [Your Railway URL]
Development: http://localhost:5000
```

### Authentication
All protected routes require Clerk authentication. Include the Clerk session token in the Authorization header:
```
Authorization: Bearer <clerk_session_token>
```

### Core API Routes

#### 1. Authentication (`/api/auth/*`)
- `POST /api/auth/webhook` - Clerk webhook for user sync
- `GET /api/auth/me` - Get current user profile

#### 2. Users (`/api/users/*`)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/business-profile` - Complete business profile
- `GET /api/users/business-profile` - Get business profile completion status

#### 3. Spaces (`/api/spaces/*`) 
**Important**: Returns `spaces` (advertising areas) for public browsing
- `GET /api/spaces` - Get all active advertising spaces (public)
- `GET /api/spaces/:id` - Get specific space details
- `GET /api/spaces/search` - Search spaces with filters
- `GET /api/spaces/nearby` - Get spaces near coordinates

Query parameters for spaces:
```typescript
interface SpaceFilters {
  city?: string;
  state?: string;
  spaceType?: SpaceType;
  minPrice?: number;
  maxPrice?: number;
  startDate?: string; // ISO date
  endDate?: string; // ISO date
  lat?: number;
  lng?: number;
  radius?: number; // in miles
}
```

#### 4. Properties (`/api/properties/*`)
Property management for space owners
- `GET /api/properties` - Get user's properties
- `POST /api/properties` - Create new property
- `GET /api/properties/:id` - Get property details
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property
- `POST /api/properties/:id/spaces` - Add advertising space to property

#### 5. Checkout & Payments (`/api/checkout/*`)
Stripe payment processing with multi-booking support
- `POST /api/checkout/create-payment-intent` - Create payment intent for booking(s)
- `POST /api/checkout/confirm` - Confirm payment and create booking(s)
- `POST /api/checkout/webhook` - Stripe webhook handler

Checkout payload:
```typescript
interface CheckoutRequest {
  bookings: Array<{
    spaceId: string;
    startDate: string; // ISO date
    endDate: string; // ISO date
    campaignId?: string;
  }>;
  paymentMethodId: string;
  businessProfileComplete: boolean; // Must be true to proceed
}
```

#### 6. Bookings (`/api/bookings/*`)
Booking management
- `GET /api/bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id` - Update booking
- `POST /api/bookings/:id/cancel` - Cancel booking
- `POST /api/bookings/:id/verify` - Upload verification image (space owners)

#### 7. Campaigns (`/api/campaigns/*`)
Campaign management for advertisers
- `GET /api/campaigns` - Get user's campaigns
- `POST /api/campaigns` - Create new campaign
- `GET /api/campaigns/:id` - Get campaign details
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign

#### 8. Materials (`/api/materials/*`) - MVP Feature
Material sourcing system
- `GET /api/materials/catalog` - Get available materials
- `POST /api/materials/order` - Order materials for booking
- `GET /api/materials/orders` - Get material orders
- `GET /api/materials/orders/:id` - Get order details

#### 9. Installations (`/api/installations/*`) - MVP Feature
Installation tracking
- `GET /api/installations` - Get installations
- `POST /api/installations` - Create installation record
- `PUT /api/installations/:id` - Update installation status
- `POST /api/installations/:id/photos` - Upload before/after photos

---

## Important Implementation Details

### 1. Space vs Property Distinction
- **Properties**: Buildings/locations owned by space owners
- **Spaces** (formerly advertising_areas): Actual bookable ad spaces within properties
- The `/api/spaces` endpoint returns spaces for public browsing, NOT properties

### 2. Business Profile Completion
The checkout flow requires a completed business profile:
```typescript
// Check before allowing checkout
if (!user.businessProfileComplete) {
  // Redirect to business profile completion
  // Required fields: businessName, businessType, businessAddress, businessPhone
}
```

### 3. Multi-Booking Checkout
The platform supports booking multiple spaces in a single transaction:
```typescript
const checkoutData = {
  bookings: [
    { spaceId: "space1", startDate: "2025-08-01", endDate: "2025-08-31" },
    { spaceId: "space2", startDate: "2025-08-01", endDate: "2025-08-31" }
  ],
  paymentMethodId: "pm_123",
  businessProfileComplete: true
};
```

### 4. Stripe Integration
- Uses Payment Intents for secure payments
- Webhook endpoint handles payment confirmations
- Raw body parsing required for webhook signature verification

### 5. Material Sourcing MVP
New feature allowing advertisers to order materials (vinyl, signs) and track installations:
- Materials are linked to bookings
- Space owners can track installation progress
- Photo upload for verification

### 6. Image Upload
Uses Cloudinary for image storage:
- Property images
- Space images
- Verification photos
- Installation before/after photos

---

## Error Handling

### Standard Error Response
```typescript
interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  details?: any;
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `500` - Internal Server Error

---

## Environment Variables Required

Frontend should be aware these are configured:
- `DATABASE_URL` - PostgreSQL connection
- `CLERK_SECRET_KEY` - Clerk authentication
- `STRIPE_SECRET_KEY` - Stripe payments
- `FRONTEND_URL` - Your frontend URL for CORS
- `JWT_SECRET` - JWT token signing
- `CLOUDINARY_*` - Image upload configuration

---

## Development Notes

### 1. Authentication Flow
1. User signs up/logs in via Clerk on frontend
2. Clerk webhook syncs user to backend database
3. Frontend includes Clerk session token in API requests
4. Backend validates token and identifies user

### 2. Business Profile Flow
1. User completes Clerk registration
2. User fills out business profile (businessName, businessType, etc.)
3. `businessProfileComplete` flag set to true
4. User can now make bookings

### 3. Booking Flow
1. User browses spaces via `/api/spaces`
2. User selects space(s) and dates
3. Frontend calls `/api/checkout/create-payment-intent`
4. User completes payment on frontend
5. Frontend calls `/api/checkout/confirm`
6. Booking(s) created and confirmed

### 4. Space Owner Flow
1. User creates property via `/api/properties`
2. User adds advertising spaces to property
3. Spaces appear in public `/api/spaces` endpoint
4. User receives bookings and manages them
5. User can upload verification images

This context should provide your frontend team with comprehensive understanding of the backend API structure and data models. Let me know if you need any clarification or additional details!