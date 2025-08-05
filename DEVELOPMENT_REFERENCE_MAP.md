# Elaview Development Reference Map

## 📁 Project Structure Mapping

### Frontend Structure
```
frontend/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # Radix UI components
│   │   ├── layout/          # Layout components
│   │   ├── auth/            # Authentication components
│   │   ├── properties/      # Property management
│   │   ├── campaigns/       # Campaign management
│   │   ├── booking/         # Booking system
│   │   ├── messages/        # Messaging system
│   │   ├── admin/           # Admin interface
│   │   ├── dashboard/       # Dashboard components
│   │   ├── payments/        # Payment components
│   │   ├── notifications/   # Notification system
│   │   ├── search/          # Search functionality
│   │   ├── location/        # Location services
│   │   ├── browse/          # Browse functionality
│   │   ├── analytics/       # Analytics components
│   │   ├── verification/    # Verification modals
│   │   └── chatbot/         # Chatbot components
│   ├── pages/               # Page components
│   │   ├── properties/      # Property pages
│   │   ├── campaigns/       # Campaign pages
│   │   ├── bookings/        # Booking pages
│   │   ├── messages/        # Message pages
│   │   ├── admin/           # Admin pages
│   │   ├── dashboard/       # Dashboard pages
│   │   ├── payments/        # Payment pages
│   │   ├── auth/            # Auth pages
│   │   ├── browse/          # Browse pages
│   │   ├── checkout/        # Checkout flow
│   │   ├── user/            # User profile pages
│   │   ├── help/            # Help pages
│   │   └── learn-more/      # Information pages
│   ├── api/                 # API integration
│   │   ├── apiClient.js     # Main API client
│   │   ├── entities.js      # Entity definitions
│   │   ├── integrations.js  # Third-party integrations
│   │   ├── base44Client.js  # Base44 SDK client
│   │   ├── space-owner/     # Space owner APIs
│   │   └── users/           # User APIs
│   ├── services/            # Business logic services
│   │   └── googleMapsLoader.js
│   ├── contexts/            # React contexts
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions
│   ├── types/               # TypeScript types
│   ├── lib/                 # Library configurations
│   ├── styles/              # Global styles
│   └── dev/                 # Development utilities
```

### Backend Structure
```
backend/
├── src/
│   ├── routes/              # API route handlers
│   │   ├── auth.js          # Authentication routes
│   │   ├── users.js         # User management
│   │   ├── properties.js    # Property CRUD
│   │   ├── spaces.js        # Space management
│   │   ├── bookings.js      # Booking system
│   │   ├── campaigns.js     # Campaign management
│   │   ├── messages.js      # Messaging system
│   │   ├── invoices.js      # Invoice management
│   │   ├── notifications.js # Notification system
│   │   ├── checkout.js      # Payment processing
│   │   ├── upload.js        # File upload handling
│   │   ├── dashboard.js     # Dashboard data
│   │   ├── installations.js # Installation management
│   │   ├── materials.js     # Material sourcing
│   │   ├── creatives.js     # Creative management
│   │   ├── conversations.js # Conversation management
│   │   ├── debug.js         # Debug endpoints
│   │   └── test.js          # Test endpoints
│   ├── middleware/          # Express middleware
│   │   └── clerk.js         # Clerk authentication
│   ├── utils/               # Utility functions
│   └── scripts/             # Database scripts
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Database migrations
```

## 🗄️ Database Schema Mapping

### Core Entity Relationships

#### Users & Authentication
```sql
users {
  id: String (CUID)
  clerkId: String (unique)
  email: String (unique)
  role: UserRole (USER, PROPERTY_OWNER, ADVERTISER, ADMIN, SUPER_ADMIN)
  isAdmin: Boolean
  businessProfile: {
    businessName, businessAddress, businessDescription
    businessDocuments, businessIndustry, businessPhone
    businessProfileComplete, businessVerifiedAt
    businessWebsite, taxId, isBusinessVerified
  }
  B2B Features: {
    lastSeenAt, isOnline, businessRating
    totalTransactions, isPremiumMember
    communicationPreferences, businessHours
    autoResponseMessage
  }
  
  Relations:
  - bookings[] (as booker)
  - campaigns[] (as advertiser)
  - properties[] (as owner)
  - sent_chat_messages[]
  - conversation_participations[]
  - created_conversations[]
  - blocked_users[] / blocking_users[]
  - message_templates[]
  - business_contacts[]
}
```

#### Properties & Spaces
```sql
properties {
  id: String (CUID)
  title, description, address
  city, state, country, zipCode
  latitude, longitude, location (JSON)
  propertyType: PropertyType
  size, bedrooms, bathrooms
  basePrice, pricing (JSON), currency
  status: PropertyStatus
  ownerId: String (references users)
  images, photos, videos, documents (JSON)
  
  Relations:
  - users (owner)
  - spaces[]
  - bookings[]
  - campaigns[]
  - conversations[]
  - property_approvals[]
}

spaces {
  id: String (CUID)
  name, title, description, type
  dimensions (JSON), coordinates (JSON)
  city, state, country
  baseRate, pricing (JSON), rateType
  currency, status, isActive
  maxBookings
  propertyId: String (references properties)
  features (JSON)
  
  Material Sourcing:
  - surfaceType, accessDifficulty
  - installRequirements, materialCompatibility
  - estimatedMaterialCost, surfaceCondition
  - weatherExposure, permitsRequired
  - powerAvailable, lightingConditions
  
  Relations:
  - property (parent)
  - bookings[]
}
```

#### Bookings & Campaigns
```sql
bookings {
  id: String (CUID)
  startDate, endDate, totalAmount, currency
  status: BookingStatus
  isPaid: Boolean
  notes, metadata
  bookerId: String (references users)
  propertyId: String (references properties)
  advertisingAreaId: String (references spaces)
  campaignId: String (references campaigns)
  
  Relations:
  - users (booker)
  - properties (property)
  - spaces (advertising_area)
  - campaigns (campaign)
  - creatives[]
  - installations[]
  - invoices[]
}

campaigns {
  id: String (CUID)
  name, title, description
  budget, dailyBudget, currency
  targetAudience (JSON)
  startDate, endDate, isActive
  impressions, clicks, conversions, totalSpent
  status: CampaignStatus
  advertiserId: String (references users)
  propertyId: String (references properties)
  
  Creative Fields:
  - brand_name, content_description
  - content_type, media_dimensions
  - media_files, media_type
  - keywords, primary_objective
  - target_demographics, geographic_targeting
  - creative_concept, call_to_action
  - brand_guidelines, placement_preferences
  
  Relations:
  - users (advertiser)
  - properties (property)
  - bookings[]
  - creatives[]
}
```

#### Messaging System
```sql
conversations {
  id: String (CUID)
  type: ConversationType (DIRECT, GROUP)
  status: ConversationStatus
  accessLevel: ConversationAccessLevel
  createdAt, updatedAt
  
  Relations:
  - conversation_participants[]
  - chat_messages[]
  - properties (optional)
}

conversation_participants {
  conversationId: String (references conversations)
  userId: String (references users)
  role: String
  joinedAt: DateTime
  
  Relations:
  - conversations
  - users
}

chat_messages {
  id: String (CUID)
  conversationId: String (references conversations)
  senderId: String (references users)
  content: String
  type: MessageType
  deliveryStatus: MessageDeliveryStatus
  format: MessageFormat
  createdAt, updatedAt
  
  Relations:
  - conversations
  - users (sender)
  - message_attachments[]
  - message_reactions[]
  - message_read_receipts[]
}
```

#### Material Sourcing System
```sql
material_suppliers {
  id: String (CUID)
  name, type: SupplierType
  contactInfo (JSON)
  rating, totalOrders
  isVerified, isActive
  createdAt, updatedAt
  
  Relations:
  - material_items[]
  - material_orders[]
}

material_items {
  id: String (CUID)
  name, category: MaterialCategory
  specifications (JSON)
  pricing (JSON)
  supplierId: String (references material_suppliers)
  isActive, inStock
  createdAt, updatedAt
  
  Relations:
  - material_suppliers
  - material_order_items[]
}

installations {
  id: String (CUID)
  bookingId: String (references bookings)
  installerId: String (references installers)
  status: InstallationStatus
  schedule (JSON)
  notes, estimatedDuration
  actualStartTime, actualEndTime
  materialsUsed (JSON)
  costBreakdown (JSON)
  createdAt, updatedAt
  
  Relations:
  - bookings
  - installers
}
```

## 🔌 API Endpoint Mapping

### Authentication Routes (`/api/auth`)
```javascript
POST /api/auth/login          // Clerk authentication
POST /api/auth/logout         // Session termination
GET  /api/auth/verify         // Token verification
```

### User Management (`/api/users`)
```javascript
GET    /api/users                    // Get all users (admin)
GET    /api/users/profile            // Get current user profile
PUT    /api/users/profile            // Update user profile
GET    /api/users/business-profile   // Get business profile
PUT    /api/users/business-profile   // Update business profile
DELETE /api/users/:id                // Delete user (admin)
```

### Property Management (`/api/properties`)
```javascript
GET    /api/properties               // List properties with filters
POST   /api/properties               // Create new property
GET    /api/properties/:id           // Get specific property
PUT    /api/properties/:id           // Update property
DELETE /api/properties/:id           // Delete property
POST   /api/properties/:id/approve   // Approve property (admin)
GET    /api/properties/:id/spaces    // Get property spaces
```

### Space Management (`/api/spaces`)
```javascript
GET    /api/spaces                   // List bookable spaces
POST   /api/spaces                   // Create new space
GET    /api/spaces/:id               // Get specific space
PUT    /api/spaces/:id               // Update space
DELETE /api/spaces/:id               // Delete space
GET    /api/spaces/:id/availability  // Check availability
GET    /api/spaces/:id/booked-dates  // Get booked dates
POST   /api/spaces/search            // Search available spaces
```

### Booking System (`/api/bookings`)
```javascript
GET    /api/bookings                 // List user's bookings
POST   /api/bookings                 // Create new booking
GET    /api/bookings/:id             // Get specific booking
PUT    /api/bookings/:id             // Update booking
DELETE /api/bookings/:id             // Cancel booking
POST   /api/bookings/:id/confirm     // Confirm booking
POST   /api/bookings/multiple        // Create multiple bookings
GET    /api/bookings/calendar/:id    // Get booking calendar
```

### Campaign Management (`/api/campaigns`)
```javascript
GET    /api/campaigns                // List campaigns
POST   /api/campaigns                // Create campaign
GET    /api/campaigns/:id            // Get campaign details
PUT    /api/campaigns/:id            // Update campaign
DELETE /api/campaigns/:id            // Delete campaign
POST   /api/campaigns/:id/activate   // Activate campaign
POST   /api/campaigns/:id/pause      // Pause campaign
GET    /api/campaigns/:id/analytics  // Get campaign analytics
```

### Messaging System (`/api/messages`)
```javascript
GET    /api/messages                 // List conversations
POST   /api/messages                 // Send message
GET    /api/messages/conversations/:id    // Get conversation
POST   /api/messages/conversations/:id/messages  // Send to conversation
GET    /api/messages/templates       // Get message templates
POST   /api/messages/templates       // Create template
PUT    /api/messages/read/:id        // Mark as read
POST   /api/messages/block/:userId   // Block user
```

### Payment Processing (`/api/checkout`)
```javascript
POST   /api/checkout/create-payment-intent  // Create Stripe payment
POST   /api/checkout/confirm-booking        // Confirm booking with payment
POST   /api/checkout/webhook                // Stripe webhook handler
GET    /api/checkout/payment-status/:id     // Get payment status
```

### File Upload (`/api/upload`)
```javascript
POST   /api/upload/image             // Upload image
POST   /api/upload/document          // Upload document
POST   /api/upload/video             // Upload video
DELETE /api/upload/:id               // Delete uploaded file
```

### Admin Routes (`/api/admin`)
```javascript
GET    /api/admin/users              // User management
GET    /api/admin/properties/approvals  // Property approval queue
GET    /api/admin/bookings/oversight    // Booking oversight
GET    /api/admin/materials/catalog     // Material catalog management
GET    /api/admin/materials/orders      // Order processing
POST   /api/admin/users/:id/verify     // Verify business user
```

## 🎨 Component Mapping

### Layout Components
```javascript
// Core Layout
Layout.tsx                    // Main application layout
Navigation.tsx                // Top navigation bar
Sidebar.tsx                   // Side navigation
ProtectedRoute.jsx            // Authentication wrapper

// UI Components (Radix UI)
Button.tsx                    // Button component
Input.tsx                     // Input field
Dialog.tsx                    // Modal dialog
Select.tsx                    // Select dropdown
Calendar.tsx                  // Date picker
Toast.tsx                     // Notification toast
Table.tsx                     // Data table
Card.tsx                      // Card container
Badge.tsx                     // Status badge
```

### Property Management Components
```javascript
// Property Creation & Management
CreateListingWizard/          // Property creation wizard
PropertyManagement.jsx        // Property management dashboard
EditProperty.jsx              // Property editing
ApprovalModal.jsx             // Property approval workflow
AreaFormModal.jsx             // Space creation modal
MyPropertiesView.jsx          // Property listing view

// Property Display
PropertyCard.jsx              // Property display card
PropertyDetails.jsx           // Property details view
PropertyGallery.jsx           // Property image gallery
PropertyMap.jsx               // Property location map
```

### Campaign Management Components
```javascript
// Campaign Creation & Management
CreateCampaign.jsx            // Campaign creation form
CampaignDetails.jsx           // Campaign details view
MyCampaignsView.jsx          // Campaign listing
CampaignFilterControls.jsx    // Campaign filtering
DeleteCampaignDialog.tsx      // Campaign deletion dialog

// Campaign Display
CampaignCard.jsx              // Campaign display card
CampaignAnalytics.jsx         // Campaign performance
CampaignBudget.jsx            // Budget management
CampaignCreative.jsx          // Creative management
```

### Booking System Components
```javascript
// Booking Management
CalendarBookingModal.jsx      // Booking calendar
MultiSpaceBookingModal.jsx    // Multi-space booking
BookingManagement.jsx         // Booking management
BookingDetailsModal.jsx       // Booking details
RequestChangeModal.jsx        // Booking change request
BookingManagementCard.jsx     // Booking card

// Booking Display
BookingCalendar.jsx           // Calendar view
BookingTimeline.jsx           // Timeline view
BookingStatus.jsx             // Status indicator
```

### Messaging Components
```javascript
// Messaging Interface
MessagesPage.tsx              // Main messaging interface
ConversationList.jsx          // Conversation listing
MessageThread.jsx             // Message thread view
MessageInput.jsx              // Message composition
MessageBubble.jsx             // Individual message
MessageAttachment.jsx         // File attachment

// Messaging Features
MessageTemplate.jsx            // Message template
UserBlocking.jsx              // User blocking
ReadReceipt.jsx               // Read receipt
TypingIndicator.jsx           // Typing indicator
```

### Admin Components
```javascript
// Admin Dashboard
Admin.tsx                     // Main admin dashboard
UserManagement.tsx            // User management
PropertyApprovals.tsx         // Property approval queue
BookingOversight.tsx          // Booking oversight

// Material Management
MaterialCatalogManagement.tsx // Material catalog
MaterialOrderProcessing.tsx   // Order processing
ClientOnboardingSystem.tsx    // Client onboarding
```

### Payment Components
```javascript
// Payment Processing
Checkout.jsx                  // Payment checkout
PaymentForm.jsx               // Payment form
PaymentStatus.jsx             // Payment status
InvoiceList.jsx               // Invoice listing
PaymentHistory.jsx            // Payment history
```

## 🔧 Development Patterns

### API Client Pattern
```javascript
// apiClient.js - Centralized API client
class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.pendingRequests = new Map();
    this.responseCache = new Map();
  }
  
  async request(endpoint, method, data) {
    // Request deduplication
    // Rate limiting
    // Error handling
    // Caching
  }
  
  // Entity-specific methods
  async getProperties(params) { }
  async createProperty(data) { }
  async updateProperty(id, data) { }
  async deleteProperty(id) { }
}
```

### Component Pattern
```javascript
// Standard component structure
import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/api/apiClient';

const ComponentName = () => {
  // State management
  const [state, setState] = useState();
  
  // Data fetching
  const { data, isLoading, error } = useQuery({
    queryKey: ['entity', id],
    queryFn: () => apiClient.getEntity(id)
  });
  
  // Mutations
  const mutation = useMutation({
    mutationFn: (data) => apiClient.updateEntity(id, data),
    onSuccess: () => {
      // Handle success
    }
  });
  
  // Event handlers
  const handleSubmit = (data) => {
    mutation.mutate(data);
  };
  
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
};
```

### Form Pattern
```javascript
// Form handling with React Hook Form
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  // Validation schema
});

const FormComponent = () => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Default values
    }
  });
  
  const onSubmit = (data) => {
    // Handle form submission
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </Form>
  );
};
```

### Authentication Pattern
```javascript
// Clerk authentication integration
import { useAuth } from '@clerk/clerk-react';

const ProtectedComponent = () => {
  const { isSignedIn, user } = useAuth();
  
  if (!isSignedIn) {
    return <SignIn />;
  }
  
  return (
    <div>
      {/* Protected content */}
    </div>
  );
};
```

## 🗂️ File Organization Patterns

### Component Organization
```
components/
├── ui/                       # Reusable UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   └── Dialog.tsx
├── feature-name/             # Feature-specific components
│   ├── FeatureList.tsx
│   ├── FeatureCard.tsx
│   ├── FeatureForm.tsx
│   └── FeatureModal.tsx
└── shared/                   # Shared components
    ├── LoadingSpinner.tsx
    └── ErrorBoundary.tsx
```

### Page Organization
```
pages/
├── feature-name/
│   ├── FeaturePage.tsx       # Main page component
│   ├── components/           # Page-specific components
│   │   ├── FeatureList.tsx
│   │   └── FeatureForm.tsx
│   └── hooks/               # Page-specific hooks
│       └── useFeature.ts
```

### API Organization
```
api/
├── apiClient.js              # Main API client
├── entities.js               # Entity definitions
├── feature-name/             # Feature-specific APIs
│   ├── featureApi.js
│   └── featureTypes.ts
└── integrations.js           # Third-party integrations
```

## 🔄 State Management Patterns

### React Query for Server State
```javascript
// Query patterns
const { data, isLoading, error } = useQuery({
  queryKey: ['entity', id],
  queryFn: () => apiClient.getEntity(id),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});

// Mutation patterns
const mutation = useMutation({
  mutationFn: (data) => apiClient.createEntity(data),
  onSuccess: () => {
    queryClient.invalidateQueries(['entities']);
  },
  onError: (error) => {
    // Handle error
  }
});
```

### Context for Global State
```javascript
// Context pattern
const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [globalState, setGlobalState] = useState();
  
  const value = {
    globalState,
    setGlobalState,
    // Other global functions
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
```

## 🧪 Testing Patterns

### Component Testing
```javascript
// Component test pattern
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const TestWrapper = ({ children }) => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

test('component renders correctly', () => {
  render(
    <TestWrapper>
      <ComponentName />
    </TestWrapper>
  );
  
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});
```

### API Testing
```javascript
// API test pattern
import { apiClient } from '@/api/apiClient';

test('API call returns expected data', async () => {
  const mockData = { id: '1', name: 'Test' };
  
  // Mock API response
  jest.spyOn(apiClient, 'getEntity').mockResolvedValue(mockData);
  
  const result = await apiClient.getEntity('1');
  
  expect(result).toEqual(mockData);
});
```

## 🚀 Deployment Patterns

### Environment Configuration
```javascript
// Environment variables
VITE_API_BASE_URL=http://localhost:5000/api
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_GOOGLE_MAPS_API_KEY=...
```

### Build Configuration
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
});
```

## 📋 Common Development Tasks

### Adding a New Feature
1. **Database Schema**: Update `schema.prisma`
2. **API Routes**: Create route handler in `backend/src/routes/`
3. **API Client**: Add methods to `frontend/src/api/apiClient.js`
4. **Components**: Create components in `frontend/src/components/`
5. **Pages**: Create page in `frontend/src/pages/`
6. **Routing**: Add route in `frontend/src/pages/Pages.tsx`
7. **Testing**: Add tests for components and API

### Adding a New API Endpoint
1. **Route Handler**: Create in `backend/src/routes/`
2. **Validation**: Add Zod schema
3. **Authentication**: Add middleware if needed
4. **Database**: Add Prisma queries
5. **Error Handling**: Add proper error responses
6. **Testing**: Add API tests

### Adding a New Component
1. **Component File**: Create in appropriate directory
2. **Props Interface**: Define TypeScript interface
3. **Styling**: Add Tailwind classes
4. **Testing**: Add component tests
5. **Documentation**: Add JSDoc comments

### Database Migration
1. **Schema Update**: Modify `schema.prisma`
2. **Migration**: Run `npx prisma db push`
3. **Client Update**: Run `npx prisma generate`
4. **Code Update**: Update affected code
5. **Testing**: Test database changes

This reference map provides a comprehensive guide for understanding the codebase structure, development patterns, and common tasks when working on new features. 