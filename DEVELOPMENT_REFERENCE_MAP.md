# Elaview Development Reference Map

## 📁 Project Structure Mapping

### Frontend Structure
```
frontend/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # Shadcn/ui Radix components (40+ components)
│   │   │   ├── button.tsx   # Button variants
│   │   │   ├── dialog.jsx   # Modal system
│   │   │   ├── input.tsx    # Form inputs
│   │   │   ├── card.jsx     # Card layouts
│   │   │   ├── table.jsx    # Data tables
│   │   │   ├── calendar.jsx # Date picker
│   │   │   └── ...          # Full Radix UI suite
│   │   ├── admin/           # Admin panel components
│   │   │   ├── PaymentSettingsPanel.tsx
│   │   │   └── PropertyApprovalsPanel.tsx
│   │   ├── analytics/       # Analytics & reporting
│   │   │   ├── AnalyticsButton.jsx
│   │   │   ├── AnalyticsModal.jsx
│   │   │   ├── AnalyticsModal2.jsx
│   │   │   └── SpaceAnalytics.jsx
│   │   ├── auth/            # Authentication
│   │   │   └── ProtectedRoute.jsx
│   │   ├── booking/         # Booking management
│   │   │   ├── BookingDetailsModal.jsx
│   │   │   ├── BookingManagementCard.jsx
│   │   │   ├── CalendarBookingModal.jsx
│   │   │   ├── MultiSpaceBookingModal.jsx
│   │   │   └── RequestChangeModal.jsx
│   │   ├── browse/          # Property browsing & maps
│   │   │   ├── components/  # Browse-specific components
│   │   │   │   ├── CartModal.jsx
│   │   │   │   ├── DesktopTopNavV2.jsx
│   │   │   │   ├── MobileNav.jsx
│   │   │   │   ├── MobileTopBar.jsx
│   │   │   │   ├── PropertyDetailsModal.jsx
│   │   │   │   ├── SpaceCard.jsx
│   │   │   │   └── SpaceDetailsModal.jsx
│   │   │   ├── maps/        # Map components
│   │   │   │   ├── GoogleMap.tsx
│   │   │   │   ├── MapFallback.jsx
│   │   │   │   └── MapUtils.js
│   │   │   └── BrowsePage.jsx
│   │   ├── campaigns/       # Campaign management
│   │   │   ├── CampaignCard.jsx
│   │   │   ├── CampaignFilterControls.jsx
│   │   │   ├── CampaignSelection.jsx
│   │   │   ├── DeleteCampaignDialog.tsx
│   │   │   └── MyCampaignsView.jsx
│   │   ├── chatbot/         # AI chatbot system
│   │   │   ├── ChatBot.jsx
│   │   │   ├── ChatCommands.jsx
│   │   │   ├── EnhancedChatBot.jsx
│   │   │   └── ChatBot.jsx.backup
│   │   ├── dashboard/       # Dashboard components
│   │   │   ├── FilterControls.jsx
│   │   │   └── KPIMetrics.jsx
│   │   ├── invoices/        # Invoice management
│   │   │   └── InvoiceModal.jsx
│   │   ├── layout/          # Layout system
│   │   │   └── Layout.tsx
│   │   ├── location/        # Location services
│   │   │   └── EnhancedLocationPicker.tsx
│   │   ├── messages/        # B2B messaging system
│   │   │   ├── BusinessMessageComponents.jsx
│   │   │   ├── ConversationItem.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── LoadingState.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   ├── MessagesArea.tsx
│   │   │   ├── MessagesHeader.tsx
│   │   │   ├── MessagesSidebar.tsx
│   │   │   ├── SystemMessage.tsx
│   │   │   └── index.ts
│   │   ├── notifications/   # Notification system
│   │   │   ├── BookingNotificationHandler.jsx
│   │   │   └── NotificationDropdown.jsx
│   │   ├── payments/        # Payment processing
│   │   │   ├── MockPaymentModal.jsx
│   │   │   └── StripeCheckout.jsx
│   │   ├── properties/      # Property management
│   │   │   ├── ApprovalModal.jsx
│   │   │   ├── AreaFormModal.jsx
│   │   │   └── MyPropertiesView.jsx
│   │   ├── search/          # Search functionality
│   │   │   ├── AdaptiveSpaceComponent.jsx
│   │   │   ├── AdvancedSearchFilter.jsx
│   │   │   ├── MapSearchFilter.jsx
│   │   │   └── SearchResults.jsx
│   │   └── verification/    # User verification
│   │       └── VerificationModal.jsx
│   ├── pages/               # Page components
│   │   ├── auth/            # Authentication pages
│   │   │   ├── SignInPage.jsx
│   │   │   └── SignUpPage.jsx
│   │   ├── browse/          # Browse pages
│   │   │   ├── components/  # Page-specific components
│   │   │   └── BrowsePage.jsx
│   │   ├── checkout/        # Checkout flow
│   │   │   ├── components/  # Checkout components
│   │   │   ├── hooks/       # Checkout hooks
│   │   │   ├── utils/       # Checkout utilities
│   │   │   └── CheckoutPage.jsx
│   │   ├── dashboard/       # Role-based dashboards
│   │   │   ├── admin/       # Admin dashboard
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   ├── utils/
│   │   │   │   └── AdminDashboard.tsx
│   │   │   ├── advertiser/  # Advertiser dashboard
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   ├── utils/
│   │   │   │   └── AdvertiserDashboard.tsx
│   │   │   └── owner/       # Owner dashboard
│   │   │       ├── components/
│   │   │       ├── hooks/
│   │   │       ├── utils/
│   │   │       └── OwnerDashboard.tsx
│   │   ├── landing/         # Landing page
│   │   │   ├── components/
│   │   │   └── LandingPage.jsx
│   │   ├── messages/        # Messaging pages
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── MessagesPage.tsx
│   │   ├── campaigns/       # Campaign pages
│   │   │   ├── components/
│   │   │   ├── CreateCampaignWizard.jsx
│   │   │   └── CampaignManagement.jsx
│   │   ├── properties/      # Property pages
│   │   │   ├── components/
│   │   │   ├── CreateListingWizard.jsx
│   │   │   └── PropertyManagement.jsx
│   │   ├── bookings/        # Booking pages
│   │   │   ├── components/
│   │   │   └── BookingManagement.jsx
│   │   ├── user/            # User profile
│   │   │   ├── Profile.jsx
│   │   │   └── BusinessProfile.jsx
│   │   ├── help/            # Help & support
│   │   │   └── Help.jsx
│   │   ├── DataSeeder.jsx   # Development data seeder
│   │   └── Pages.tsx        # Route definitions
│   ├── api/                 # API integration layer
│   │   ├── apiClient.js     # Advanced API client with caching/rate limiting
│   │   ├── base44Client.js  # Legacy Base44 integration
│   │   ├── entities.js      # API entity abstractions
│   │   ├── integrations.js  # Third-party integrations
│   │   ├── space-owner/     # Space owner specific APIs
│   │   │   └── dashboard.js
│   │   └── users/           # User management APIs
│   │       └── update-role.js
│   ├── contexts/            # React Context providers
│   │   └── ChatBotContext.jsx
│   ├── hooks/               # Custom React hooks
│   │   ├── use-mobile.jsx   # Mobile detection
│   │   ├── useApiClient.js  # API client hook
│   │   ├── useKPICalculations.js
│   │   ├── useNotifications.js
│   │   └── useUserProfile.js
│   ├── lib/                 # Utility libraries
│   │   ├── auth.js          # Authentication helpers
│   │   ├── api.js           # API utilities
│   │   ├── clerk.js         # Clerk configuration
│   │   ├── gemini.js        # Google Gemini AI
│   │   ├── google-maps.ts   # Google Maps integration
│   │   ├── navigation.js    # Navigation utilities
│   │   └── utils.js         # General utilities
│   ├── services/            # External services
│   │   └── googleMapsLoader.js
│   ├── styles/              # Styling
│   │   └── mobile-messaging.css
│   ├── types/               # TypeScript definitions
│   │   ├── google-maps.d.ts
│   │   ├── messages.ts
│   │   └── property.ts
│   ├── utils/               # Utility functions
│   │   ├── apiClientSingleton.js
│   │   ├── index.ts
│   │   └── rateLimitTester.js
│   ├── dev/                 # Development tools
│   │   └── debug/           # Debug components
│   ├── BACKUP_old_system/   # Legacy code backup
│   ├── App.jsx              # Root application
│   ├── main.jsx             # React entry point
│   ├── index.css            # Global styles
│   └── vite-env.d.ts        # Vite types
├── public/                  # Static assets
│   ├── elaview-logo*.png    # Logo variations
│   ├── elaview-favicon*.png # Favicon variations
│   └── citynight.jpg        # Background images
├── components.json          # Shadcn/ui configuration
├── tailwind.config.js       # Tailwind CSS config
├── vite.config.js           # Vite build config
├── package.json             # Dependencies
└── tsconfig.json            # TypeScript config
```

### Backend Structure
```
backend/
├── src/
│   ├── routes/              # API route handlers
│   │   ├── advertiser.js    # Advertiser-specific routes
│   │   ├── auth.js          # Authentication & Clerk webhooks
│   │   ├── bookings.js      # Booking lifecycle management
│   │   ├── campaigns.js     # Campaign CRUD operations
│   │   ├── checkout.js      # Payment processing & Stripe
│   │   ├── conversations.js # B2B conversation management
│   │   ├── creatives.js     # Creative asset management
│   │   ├── dashboard.js     # Dashboard analytics
│   │   ├── debug.js         # Debug endpoints
│   │   ├── index.js         # Route index
│   │   ├── installations.js # Installation management
│   │   ├── invoices.js      # Invoice processing
│   │   ├── materials.js     # Material sourcing
│   │   ├── messages.js      # Enhanced B2B messaging
│   │   ├── notifications.js # Notification system
│   │   ├── properties.js    # Property CRUD
│   │   ├── spaceOwner.js    # Space owner routes
│   │   ├── spaces.js        # Space management
│   │   ├── test.js          # Test endpoints
│   │   ├── upload.js        # Cloudinary file handling
│   │   └── users.js         # User management
│   ├── middleware/          # Express middleware
│   │   ├── clerk.js         # Clerk JWT authentication
│   │   └── errorHandler.js  # Global error handling
│   ├── scripts/             # Database seeding
│   │   ├── seed.js          # Main seeding script
│   │   ├── seed-kfar-kama-spaces.js
│   │   ├── seed-manhattan-properties.js
│   │   ├── seed-mvp-spaces.js
│   │   ├── seed-oc-properties.js
│   │   └── seed-properties.js
│   ├── utils/               # Utility functions
│   │   └── endpointChecker.js
│   └── server.js            # Express server setup
├── prisma/                  # Database management
│   ├── schema.prisma        # Database schema
│   ├── schema.prisma.backup # Schema backup
│   └── migrations/          # Database migrations
│       ├── 20250725002700_initial_schema_with_creatives/
│       ├── 20250731061233_add_is_admin_to_users/
│       └── migration_lock.toml
├── INSTRUCTIONS/            # Development docs
│   ├── DbCommands.md
│   ├── HowToPrompt.md
│   ├── PostgreSQLStructure.md
│   └── debuggingDB.md
├── TESTING/                 # Testing docs
│   └── APITestingCommands.md
├── README.md
├── package.json
├── test-api-isadmin.js      # Admin testing
├── verify-admin.js          # Admin verification
└── verify-prisma.sh         # Database verification
```

## 🗄️ Complete Database Schema

### Core User Management
```sql
users {
  id: String (CUID primary key)
  clerkId: String (unique, indexed)
  email: String (unique, indexed)
  firstName: String?
  lastName: String?
  role: UserRole (USER, PROPERTY_OWNER, ADVERTISER, ADMIN, SUPER_ADMIN)
  isAdmin: Boolean (default false)
  
  -- Business Profile (B2B Features)
  businessName: String?
  businessAddress: String?
  businessDescription: String?
  businessDocuments: Json? (array of document URLs)
  businessIndustry: String?
  businessPhone: String?
  businessProfileComplete: Boolean (default false)
  businessVerifiedAt: DateTime?
  businessWebsite: String?
  taxId: String?
  isBusinessVerified: Boolean (default false)
  
  -- Enhanced B2B Features
  lastSeenAt: DateTime?
  isOnline: Boolean (default false)
  businessRating: Float? (1-5 rating)
  totalTransactions: Int (default 0)
  isPremiumMember: Boolean (default false)
  communicationPreferences: Json?
  businessHours: Json?
  autoResponseMessage: String?
  
  -- Timestamps
  createdAt: DateTime (default now())
  updatedAt: DateTime (updatedAt)
  
  -- Relations
  bookings: Booking[] (as booker)
  campaigns: Campaign[] (as advertiser)
  properties: Property[] (as owner)
  sent_chat_messages: ChatMessage[] (as sender)
  conversation_participations: ConversationParticipant[]
  created_conversations: Conversation[]
  blocked_users: UserBlock[] (as blocker)
  blocking_users: UserBlock[] (as blocked)
  message_templates: MessageTemplate[]
  business_contacts: BusinessContact[]
  payment_settings: PaymentSettings?
  payment_reminders: PaymentReminder[]
}
```

### Property & Space Management
```sql
properties {
  id: String (CUID primary key)
  title: String
  description: String?
  address: String
  city: String
  state: String
  country: String
  zipCode: String?
  latitude: Float?
  longitude: Float?
  location: Json? (GeoJSON)
  propertyType: PropertyType
  size: Float? (square footage)
  bedrooms: Int?
  bathrooms: Int?
  basePrice: Float?
  pricing: Json? (pricing structure)
  currency: String (default "USD")
  status: PropertyStatus (DRAFT, PENDING, ACTIVE, INACTIVE, REJECTED)
  ownerId: String (references users)
  images: Json? (array of image URLs)
  photos: Json? (legacy field)
  videos: Json? (array of video URLs)
  documents: Json? (array of document URLs)
  
  -- Timestamps
  createdAt: DateTime (default now())
  updatedAt: DateTime (updatedAt)
  
  -- Relations
  owner: User
  spaces: Space[]
  bookings: Booking[]
  campaigns: Campaign[]
  conversations: Conversation[]
  property_approvals: PropertyApproval[]
  
  @@index([ownerId])
  @@index([city, state])
  @@index([status])
  @@index([createdAt])
}

spaces {
  id: String (CUID primary key)
  name: String?
  title: String
  description: String?
  type: String? (billboard, storefront, vehicle, etc.)
  dimensions: Json? ({width, height, depth})
  coordinates: Json? (location within property)
  city: String
  state: String
  country: String
  baseRate: Float
  pricing: Json? (pricing structure)
  rateType: String (default "daily")
  currency: String (default "USD")
  status: String (default "available")
  isActive: Boolean (default true)
  maxBookings: Int (default 1)
  propertyId: String (references properties)
  features: Json? (array of features)
  
  -- Material Sourcing Fields
  surfaceType: String? (vinyl, fabric, LED, etc.)
  accessDifficulty: String? (easy, moderate, difficult)
  installRequirements: Json? (equipment, permits needed)
  materialCompatibility: Json? (compatible material types)
  estimatedMaterialCost: Float?
  surfaceCondition: String? (excellent, good, fair, poor)
  weatherExposure: String? (indoor, covered, outdoor)
  permitsRequired: Boolean (default false)
  powerAvailable: Boolean (default false)
  lightingConditions: String? (bright, moderate, dim)
  
  -- Timestamps
  createdAt: DateTime (default now())
  updatedAt: DateTime (updatedAt)
  
  -- Relations
  property: Property
  bookings: Booking[]
  
  @@index([propertyId])
  @@index([city, state])
  @@index([isActive, status])
  @@index([baseRate])
}
```

### Campaign & Booking System
```sql
campaigns {
  id: String (CUID primary key)
  name: String?
  title: String
  description: String?
  budget: Float?
  dailyBudget: Float?
  currency: String (default "USD")
  targetAudience: Json?
  startDate: DateTime?
  endDate: DateTime?
  isActive: Boolean (default true)
  impressions: Int (default 0)
  clicks: Int (default 0)
  conversions: Int (default 0)
  totalSpent: Float (default 0)
  status: CampaignStatus (DRAFT, ACTIVE, PAUSED, COMPLETED, CANCELLED)
  advertiserId: String (references users)
  propertyId: String? (references properties)
  
  -- Creative Management Fields
  brand_name: String?
  content_description: String?
  content_type: String?
  media_dimensions: Json?
  media_files: Json? (array of media URLs)
  media_type: String?
  keywords: Json? (array of keywords)
  primary_objective: String?
  target_demographics: Json?
  geographic_targeting: Json?
  creative_concept: String?
  call_to_action: String?
  brand_guidelines: String?
  placement_preferences: Json?
  
  -- Timestamps
  createdAt: DateTime (default now())
  updatedAt: DateTime (updatedAt)
  
  -- Relations
  advertiser: User
  property: Property?
  bookings: Booking[]
  creatives: Creative[]
  
  @@index([advertiserId])
  @@index([status])
  @@index([startDate, endDate])
}

bookings {
  id: String (CUID primary key)
  startDate: DateTime
  endDate: DateTime
  totalAmount: Float
  currency: String (default "USD")
  status: BookingStatus (PENDING, CONFIRMED, ACTIVE, COMPLETED, CANCELLED, REFUNDED)
  isPaid: Boolean (default false)
  notes: String?
  metadata: Json?
  bookerId: String (references users)
  propertyId: String (references properties)
  advertisingAreaId: String (references spaces)
  campaignId: String? (references campaigns)
  
  -- Timestamps
  createdAt: DateTime (default now())
  updatedAt: DateTime (updatedAt)
  
  -- Relations
  booker: User
  property: Property
  advertising_area: Space
  campaign: Campaign?
  creatives: Creative[]
  installations: Installation[]
  invoices: Invoice[]
  
  @@index([bookerId])
  @@index([advertisingAreaId])
  @@index([startDate, endDate])
  @@index([status])
}
```

### Enhanced B2B Messaging System
```sql
conversations {
  id: String (CUID primary key)
  type: ConversationType (DIRECT, GROUP)
  status: ConversationStatus (ACTIVE, ARCHIVED, CLOSED)
  accessLevel: ConversationAccessLevel (PUBLIC, PRIVATE, RESTRICTED)
  propertyId: String? (references properties)
  
  -- Timestamps
  createdAt: DateTime (default now())
  updatedAt: DateTime (updatedAt)
  
  -- Relations
  participants: ConversationParticipant[]
  messages: ChatMessage[]
  property: Property?
  
  @@index([type])
  @@index([status])
  @@index([propertyId])
}

conversation_participants {
  id: String (CUID primary key)
  conversationId: String (references conversations)
  userId: String (references users)
  role: String (default "member")
  joinedAt: DateTime (default now())
  
  -- Relations
  conversation: Conversation
  user: User
  
  @@unique([conversationId, userId])
  @@index([conversationId])
  @@index([userId])
}

chat_messages {
  id: String (CUID primary key)
  conversationId: String (references conversations)
  senderId: String (references users)
  content: String
  type: MessageType (TEXT, IMAGE, DOCUMENT, SYSTEM, BUSINESS_ACTION)
  deliveryStatus: MessageDeliveryStatus (SENT, DELIVERED, READ, FAILED)
  format: MessageFormat (PLAIN_TEXT, RICH_TEXT, STRUCTURED)
  metadata: Json? (additional message data)
  
  -- B2B Features
  businessContext: Json? (RFQ, contract, approval data)
  actionRequired: Boolean (default false)
  priority: String? (low, medium, high, urgent)
  
  -- Timestamps
  createdAt: DateTime (default now())
  updatedAt: DateTime (updatedAt)
  
  -- Relations
  conversation: Conversation
  sender: User
  attachments: MessageAttachment[]
  reactions: MessageReaction[]
  read_receipts: MessageReadReceipt[]
  
  @@index([conversationId])
  @@index([senderId])
  @@index([createdAt])
  @@index([type, deliveryStatus])
}

message_templates {
  id: String (CUID primary key)
  userId: String (references users)
  name: String
  content: String
  category: String? (greeting, follow_up, negotiation, etc.)
  isActive: Boolean (default true)
  usageCount: Int (default 0)
  
  -- Timestamps
  createdAt: DateTime (default now())
  updatedAt: DateTime (updatedAt)
  
  -- Relations
  user: User
  
  @@index([userId])
  @@index([category])
}
```

### Material Sourcing & Installation System
```sql
material_suppliers {
  id: String (CUID primary key)
  name: String
  type: SupplierType (PRINTING, INSTALLATION, MATERIALS, FULL_SERVICE)
  contactInfo: Json (email, phone, address)
  rating: Float? (1-5 rating)
  totalOrders: Int (default 0)
  isVerified: Boolean (default false)
  isActive: Boolean (default true)
  
  -- Timestamps
  createdAt: DateTime (default now())
  updatedAt: DateTime (updatedAt)
  
  -- Relations
  material_items: MaterialItem[]
  material_orders: MaterialOrder[]
  
  @@index([type])
  @@index([isActive, isVerified])
}

material_items {
  id: String (CUID primary key)
  name: String
  category: MaterialCategory (VINYL, FABRIC, LED, DIGITAL, PAINT, OTHER)
  specifications: Json (size, color, durability specs)
  pricing: Json (price per unit, bulk discounts)
  supplierId: String (references material_suppliers)
  isActive: Boolean (default true)
  inStock: Boolean (default true)
  
  -- Timestamps
  createdAt: DateTime (default now())
  updatedAt: DateTime (updatedAt)
  
  -- Relations
  supplier: MaterialSupplier
  order_items: MaterialOrderItem[]
  
  @@index([supplierId])
  @@index([category])
  @@index([isActive, inStock])
}

material_orders {
  id: String (CUID primary key)
  supplierId: String (references material_suppliers)
  bookingId: String? (references bookings)
  status: MaterialOrderStatus (PENDING, CONFIRMED, IN_PRODUCTION, SHIPPED, DELIVERED, CANCELLED)
  totalAmount: Float
  currency: String (default "USD")
  expectedDelivery: DateTime?
  actualDelivery: DateTime?
  notes: String?
  
  -- Timestamps
  createdAt: DateTime (default now())
  updatedAt: DateTime (updatedAt)
  
  -- Relations
  supplier: MaterialSupplier
  booking: Booking?
  order_items: MaterialOrderItem[]
  
  @@index([supplierId])
  @@index([bookingId])
  @@index([status])
}

material_order_items {
  id: String (CUID primary key)
  orderId: String (references material_orders)
  materialId: String (references material_items)
  quantity: Int
  unitPrice: Float
  totalPrice: Float
  specifications: Json? (custom specs for this order)
  
  -- Relations
  order: MaterialOrder
  material: MaterialItem
  
  @@index([orderId])
  @@index([materialId])
}

installations {
  id: String (CUID primary key)
  bookingId: String (references bookings)
  installerId: String (references installers)
  status: InstallationStatus (SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, DELAYED)
  scheduledDate: DateTime?
  actualStartTime: DateTime?
  actualEndTime: DateTime?
  estimatedDuration: Int? (hours)
  notes: String?
  materialsUsed: Json? (list of materials)
  costBreakdown: Json? (labor, materials, permits)
  photoDocumentation: Json? (before/after photos)
  customerSignoff: Boolean (default false)
  
  -- Timestamps
  createdAt: DateTime (default now())
  updatedAt: DateTime (updatedAt)
  
  -- Relations
  booking: Booking
  installer: Installer
  
  @@index([bookingId])
  @@index([installerId])
  @@index([status])
  @@index([scheduledDate])
}

installers {
  id: String (CUID primary key)
  userId: String? (references users, if registered)
  name: String
  company: String?
  contactInfo: Json (email, phone)
  specialties: Json (array of installation types)
  serviceAreas: Json (geographic coverage)
  rating: Float? (1-5 rating)
  totalInstallations: Int (default 0)
  isVerified: Boolean (default false)
  isActive: Boolean (default true)
  
  -- Timestamps
  createdAt: DateTime (default now())
  updatedAt: DateTime (updatedAt)
  
  -- Relations
  user: User?
  installations: Installation[]
  
  @@index([userId])
  @@index([isActive, isVerified])
}
```

### Financial Management
```sql
invoices {
  id: String (CUID primary key)
  bookingId: String (references bookings)
  amount: Float
  currency: String (default "USD")
  status: InvoiceStatus (DRAFT, SENT, PAID, OVERDUE, CANCELLED)
  dueDate: DateTime
  paidAt: DateTime?
  stripeInvoiceId: String?
  
  -- Line Items
  lineItems: Json (detailed breakdown)
  taxAmount: Float (default 0)
  discountAmount: Float (default 0)
  totalAmount: Float
  
  -- Timestamps
  createdAt: DateTime (default now())
  updatedAt: DateTime (updatedAt)
  
  -- Relations
  booking: Booking
  
  @@index([bookingId])
  @@index([status])
  @@index([dueDate])
}

payment_settings {
  id: String (CUID primary key)
  userId: String (unique, references users)
  stripeCustomerId: String?
  defaultPaymentMethodId: String?
  autoPayEnabled: Boolean (default false)
  reminderPreferences: Json
  
  -- Timestamps
  createdAt: DateTime (default now())
  updatedAt: DateTime (updatedAt)
  
  -- Relations
  user: User
  
  @@index([userId])
}

payment_reminders {
  id: String (CUID primary key)
  userId: String (references users)
  invoiceId: String? (references invoices)
  type: ReminderType (PAYMENT_DUE, OVERDUE, FINAL_NOTICE)
  sentAt: DateTime
  method: String (email, sms, notification)
  
  -- Relations
  user: User
  invoice: Invoice?
  
  @@index([userId])
  @@index([invoiceId])
  @@index([sentAt])
}
```

### System Administration
```sql
notifications {
  id: String (CUID primary key)
  userId: String (references users)
  type: String
  title: String
  message: String
  isRead: Boolean (default false)
  data: Json? (additional notification data)
  
  -- Timestamps
  createdAt: DateTime (default now())
  updatedAt: DateTime (updatedAt)
  
  -- Relations
  user: User
  
  @@index([userId])
  @@index([isRead])
  @@index([createdAt])
}

property_approvals {
  id: String (CUID primary key)
  propertyId: String (references properties)
  status: ApprovalStatus (PENDING, APPROVED, REJECTED)
  reviewedBy: String? (references users)
  reviewedAt: DateTime?
  notes: String?
  
  -- Timestamps
  createdAt: DateTime (default now())
  updatedAt: DateTime (updatedAt)
  
  -- Relations
  property: Property
  reviewer: User?
  
  @@index([propertyId])
  @@index([status])
}

user_blocks {
  id: String (CUID primary key)
  blockerId: String (references users)
  blockedId: String (references users)
  reason: String?
  
  -- Timestamps
  createdAt: DateTime (default now())
  
  -- Relations
  blocker: User
  blocked: User
  
  @@unique([blockerId, blockedId])
  @@index([blockerId])
  @@index([blockedId])
}
```

## 🔌 Complete API Endpoint Reference

### Authentication (`/api/auth`)
```javascript
POST /api/auth/webhook           // Clerk user sync webhook
GET  /api/auth/verify           // Token verification
POST /api/auth/logout           // Session cleanup
```

### User Management (`/api/users`)
```javascript
GET    /api/users                     // Admin: List all users
GET    /api/users/profile             // Get current user profile
PUT    /api/users/profile             // Update user profile
GET    /api/users/business-profile    // Get business profile
PUT    /api/users/business-profile    // Update business profile
POST   /api/users/verify-business     // Verify business profile
DELETE /api/users/:id                 // Admin: Delete user
PUT    /api/users/:id/role            // Admin: Update user role
GET    /api/users/stats               // Admin: User statistics
```

### Property Management (`/api/properties`)
```javascript
GET    /api/properties                // List properties with filters
POST   /api/properties                // Create new property
GET    /api/properties/:id            // Get specific property
PUT    /api/properties/:id            // Update property
DELETE /api/properties/:id            // Delete property
POST   /api/properties/:id/approve    // Admin: Approve property
GET    /api/properties/:id/spaces     // Get property spaces
POST   /api/properties/:id/spaces     // Create space in property
PUT    /api/properties/:id/verify     // Verify property ownership
GET    /api/properties/search         // Advanced property search
```

### Space Management (`/api/spaces`)
```javascript
GET    /api/spaces                    // List available spaces
POST   /api/spaces                    // Create new space
GET    /api/spaces/:id                // Get specific space
PUT    /api/spaces/:id                // Update space
DELETE /api/spaces/:id                // Delete space
GET    /api/spaces/:id/availability   // Check availability calendar
GET    /api/spaces/:id/booked-dates   // Get booked date ranges
POST   /api/spaces/search             // Search spaces with filters
GET    /api/spaces/featured           // Get featured spaces
POST   /api/spaces/batch              // Batch space operations
```

### Advertiser Routes (`/api/advertiser`)
```javascript
GET    /api/advertiser/dashboard      // Advertiser dashboard data
GET    /api/advertiser/campaigns      // List advertiser campaigns
GET    /api/advertiser/bookings       // List advertiser bookings
GET    /api/advertiser/analytics      // Campaign analytics
POST   /api/advertiser/campaigns      // Create new campaign
PUT    /api/advertiser/campaigns/:id  // Update campaign
DELETE /api/advertiser/campaigns/:id  // Delete campaign
```

### Space Owner Routes (`/api/spaceOwner`)
```javascript
GET    /api/spaceOwner/dashboard      // Owner dashboard data
GET    /api/spaceOwner/properties     // List owner properties
GET    /api/spaceOwner/bookings       // List property bookings
GET    /api/spaceOwner/analytics      // Property analytics
GET    /api/spaceOwner/revenue        // Revenue reports
POST   /api/spaceOwner/properties     // Create new property
```

### Campaign Management (`/api/campaigns`)
```javascript
GET    /api/campaigns                 // List campaigns
POST   /api/campaigns                 // Create campaign
GET    /api/campaigns/:id             // Get campaign details
PUT    /api/campaigns/:id             // Update campaign
DELETE /api/campaigns/:id             // Delete campaign
POST   /api/campaigns/:id/activate    // Activate campaign
POST   /api/campaigns/:id/pause       // Pause campaign
GET    /api/campaigns/:id/analytics   // Campaign performance
POST   /api/campaigns/:id/duplicate   // Duplicate campaign
PUT    /api/campaigns/:id/budget      // Update campaign budget
```

### Booking System (`/api/bookings`)
```javascript
GET    /api/bookings                  // List user bookings
POST   /api/bookings                  // Create new booking
GET    /api/bookings/:id              // Get booking details
PUT    /api/bookings/:id              // Update booking
DELETE /api/bookings/:id              // Cancel booking
POST   /api/bookings/:id/confirm      // Confirm booking
POST   /api/bookings/multiple         // Create multiple bookings
GET    /api/bookings/calendar/:id     // Get booking calendar
POST   /api/bookings/:id/extend       // Extend booking
PUT    /api/bookings/:id/status       // Update booking status
```

### Enhanced Messaging (`/api/messages`)
```javascript
GET    /api/messages                  // List conversations
POST   /api/messages                  // Send message
GET    /api/messages/conversations/:id     // Get conversation
POST   /api/messages/conversations/:id/messages  // Send to conversation
GET    /api/messages/templates        // Get message templates
POST   /api/messages/templates        // Create template
PUT    /api/messages/templates/:id    // Update template
DELETE /api/messages/templates/:id    // Delete template
PUT    /api/messages/read/:id         // Mark as read
POST   /api/messages/block/:userId    // Block user
POST   /api/messages/unblock/:userId  // Unblock user
GET    /api/messages/blocked          // List blocked users
```

### Conversations (`/api/conversations`)
```javascript
GET    /api/conversations             // List conversations
POST   /api/conversations             // Create conversation
GET    /api/conversations/:id         // Get conversation details
PUT    /api/conversations/:id         // Update conversation
DELETE /api/conversations/:id         // Delete conversation
POST   /api/conversations/:id/join    // Join conversation
POST   /api/conversations/:id/leave   // Leave conversation
GET    /api/conversations/:id/participants  // List participants
```

### Payment Processing (`/api/checkout`)
```javascript
POST   /api/checkout/create-payment-intent    // Create Stripe payment
POST   /api/checkout/confirm-booking          // Confirm booking with payment
POST   /api/checkout/webhook                  // Stripe webhook handler
GET    /api/checkout/payment-status/:id       // Get payment status
POST   /api/checkout/refund/:bookingId        // Process refund
GET    /api/checkout/payment-methods          // List payment methods
POST   /api/checkout/setup-intent             // Setup payment method
```

### Invoice Management (`/api/invoices`)
```javascript
GET    /api/invoices                  // List invoices
POST   /api/invoices                  // Create invoice
GET    /api/invoices/:id              // Get invoice details
PUT    /api/invoices/:id              // Update invoice
DELETE /api/invoices/:id              // Delete invoice
POST   /api/invoices/:id/send         // Send invoice
POST   /api/invoices/:id/pay          // Mark invoice as paid
GET    /api/invoices/:id/pdf          // Download invoice PDF
```

### Creative Management (`/api/creatives`)
```javascript
GET    /api/creatives                 // List creatives
POST   /api/creatives                 // Create creative
GET    /api/creatives/:id             // Get creative details
PUT    /api/creatives/:id             // Update creative
DELETE /api/creatives/:id             // Delete creative
POST   /api/creatives/:id/approve     // Approve creative
POST   /api/creatives/:id/reject      // Reject creative
```

### Material Sourcing (`/api/materials`)
```javascript
GET    /api/materials/suppliers       // List material suppliers
POST   /api/materials/suppliers       // Create supplier
GET    /api/materials/suppliers/:id   // Get supplier details
PUT    /api/materials/suppliers/:id   // Update supplier
DELETE /api/materials/suppliers/:id   // Delete supplier

GET    /api/materials/items           // List material items
POST   /api/materials/items           // Create material item
GET    /api/materials/items/:id       // Get item details
PUT    /api/materials/items/:id       // Update item
DELETE /api/materials/items/:id       // Delete item

GET    /api/materials/orders          // List material orders
POST   /api/materials/orders          // Create order
GET    /api/materials/orders/:id      // Get order details
PUT    /api/materials/orders/:id      // Update order status
DELETE /api/materials/orders/:id      // Cancel order
```

### Installation Management (`/api/installations`)
```javascript
GET    /api/installations             // List installations
POST   /api/installations             // Schedule installation
GET    /api/installations/:id         // Get installation details
PUT    /api/installations/:id         // Update installation
DELETE /api/installations/:id         // Cancel installation
POST   /api/installations/:id/complete // Mark as complete
POST   /api/installations/:id/photos   // Upload progress photos
GET    /api/installations/schedule    // Get installation schedule
```

### File Upload (`/api/upload`)
```javascript
POST   /api/upload/image              // Upload image to Cloudinary
POST   /api/upload/document           // Upload document
POST   /api/upload/video              // Upload video
POST   /api/upload/multiple           // Upload multiple files
DELETE /api/upload/:publicId          // Delete uploaded file
GET    /api/upload/signed-url         // Get signed upload URL
```

### Dashboard Analytics (`/api/dashboard`)
```javascript
GET    /api/dashboard                 // Main dashboard data
GET    /api/dashboard/owner           // Property owner dashboard
GET    /api/dashboard/advertiser      // Advertiser dashboard
GET    /api/dashboard/admin           // Admin dashboard
GET    /api/dashboard/analytics/:id   // Specific analytics
GET    /api/dashboard/kpis            // Key performance indicators
GET    /api/dashboard/revenue         // Revenue analytics
```

### Notification System (`/api/notifications`)
```javascript
GET    /api/notifications             // List user notifications
POST   /api/notifications             // Create notification
PUT    /api/notifications/:id         // Mark as read
DELETE /api/notifications/:id         // Delete notification
POST   /api/notifications/mark-all-read  // Mark all as read
GET    /api/notifications/unread      // Get unread count
POST   /api/notifications/preferences // Update preferences
```

### Admin Routes (`/api/admin`)
```javascript
GET    /api/admin/users               // User management
GET    /api/admin/properties/approvals     // Property approval queue
PUT    /api/admin/properties/:id/approve   // Approve property
PUT    /api/admin/properties/:id/reject    // Reject property
GET    /api/admin/bookings/oversight       // Booking oversight
GET    /api/admin/materials/catalog        // Material catalog management
GET    /api/admin/materials/orders         // Order processing
POST   /api/admin/users/:id/verify         // Verify business user
PUT    /api/admin/users/:id/ban             // Ban user
PUT    /api/admin/users/:id/unban           // Unban user
GET    /api/admin/analytics                // System analytics
```

### Debug & Testing (`/api/debug`, `/api/test`)
```javascript
GET    /api/debug/health              // System health check
GET    /api/debug/database            // Database connection test
GET    /api/debug/auth                // Authentication test
GET    /api/debug/external-apis       // External API status
POST   /api/test/create-test-data     // Create test data
DELETE /api/test/cleanup               // Cleanup test data
GET    /api/test/rate-limit           // Rate limiting test
```

## 🎨 Modern Component Architecture

### Shadcn/ui Design System (40+ Components)
```javascript
// Core UI Components
Button.tsx          // Multiple variants, sizes, loading states
Input.tsx           // Form inputs with validation
Dialog.jsx          // Modal system with animations
Card.jsx            // Content containers
Table.jsx           // Data tables with sorting/filtering
Calendar.jsx        // Date picker with range selection
Select.jsx          // Dropdown selections
Badge.jsx           // Status indicators
Avatar.jsx          // User avatars
Alert.jsx           // Notification alerts

// Advanced Components  
Command.jsx         // Command palette interface
Popover.jsx         // Floating content
Tooltip.jsx         // Information tooltips
Tabs.jsx            // Tab navigation
Accordion.jsx       // Collapsible content
Carousel.jsx        // Image/content carousel
Chart.jsx           // Data visualization
Progress.jsx        // Progress indicators
Skeleton.jsx        // Loading placeholders
Toast.jsx           // Notification system

// Form Components
Form.jsx            // Form wrapper with validation
Label.jsx           // Form labels
Textarea.jsx        // Multi-line text input
Checkbox.jsx        // Checkbox input
RadioGroup.jsx      // Radio button groups
Switch.jsx          // Toggle switches
Slider.jsx          # Range sliders

// Layout Components
Sheet.jsx           // Side panels
Drawer.jsx          // Bottom/side drawers  
Navigation.jsx      // Navigation menus
Breadcrumb.jsx      # Navigation breadcrumbs
Separator.jsx       // Visual dividers
ScrollArea.tsx      // Custom scrollbars
Resizable.jsx       // Resizable panels
```

### Feature-Specific Components
```javascript
// Browse & Maps
GoogleMap.tsx                    // Advanced Google Maps integration
SpaceCard.jsx                   // Property/space display cards
PropertyDetailsModal.jsx         // Detailed property view
CartModal.jsx                   // Shopping cart for multiple bookings
MapSearchFilter.jsx             // Map-based search interface
AdaptiveSpaceComponent.jsx      // Responsive space display

// Dashboard & Analytics  
KPIMetrics.jsx                  // Key performance indicators
AnalyticsModal.jsx              // Detailed analytics view
SpaceAnalytics.jsx              // Space-specific analytics
FilterControls.jsx              // Advanced filtering interface

// Booking & Payments
CalendarBookingModal.jsx        // Calendar-based booking
MultiSpaceBookingModal.jsx      // Multi-space booking flow
BookingManagementCard.jsx       // Booking status management
StripeCheckout.jsx              // Stripe payment integration
RequestChangeModal.jsx          // Booking modification requests

// Messaging & Communication
MessagesPage.tsx                // Complete messaging interface
BusinessMessageComponents.jsx   // B2B messaging features
ConversationItem.tsx            // Conversation list items
MessageBubble.tsx               // Individual message display
MessageInput.tsx                // Message composition

// Admin & Management
PaymentSettingsPanel.tsx        // Payment configuration
PropertyApprovalsPanel.tsx      // Property approval workflow
VerificationModal.jsx           // User verification system
ApprovalModal.jsx               // Content approval interface

// AI & Automation
ChatBot.jsx                     // AI-powered chatbot
EnhancedChatBot.jsx            // Advanced chatbot features
ChatCommands.jsx                // Chatbot command system
```

## 🔧 Development Patterns & Architecture

### API Client with Advanced Features
```javascript
// apiClient.js - Production-ready API client
class ApiClient {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL;
    this.pendingRequests = new Map();    // Request deduplication
    this.responseCache = new Map();      // Response caching (60s TTL)
    this.rateLimitQueue = [];           // Rate limit management
  }
  
  // Advanced request handling
  async request(endpoint, method = 'GET', data = null, options = {}) {
    // 1. Request deduplication
    const requestKey = `${method}-${endpoint}-${JSON.stringify(data)}`;
    if (this.pendingRequests.has(requestKey)) {
      return this.pendingRequests.get(requestKey);
    }
    
    // 2. Cache checking (GET requests only)
    if (method === 'GET' && this.responseCache.has(requestKey)) {
      const cached = this.responseCache.get(requestKey);
      if (Date.now() - cached.timestamp < 60000) { // 1 minute TTL
        return cached.data;
      }
    }
    
    // 3. Rate limiting with exponential backoff
    if (this.isRateLimited) {
      await this.handleRateLimit();
    }
    
    // 4. Clerk JWT token integration
    const token = await window.Clerk?.session?.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    };
    
    // 5. Request execution with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
      const promise = fetch(`${this.baseURL}${endpoint}`, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
        ...options
      });
      
      this.pendingRequests.set(requestKey, promise);
      
      const response = await promise;
      clearTimeout(timeoutId);
      
      // 6. Error handling
      if (!response.ok) {
        if (response.status === 429) {
          this.handleRateLimit(response);
          return this.request(endpoint, method, data, options); // Retry
        }
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // 7. Cache successful GET responses
      if (method === 'GET') {
        this.responseCache.set(requestKey, {
          data: result,
          timestamp: Date.now()
        });
      }
      
      return result;
      
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    } finally {
      this.pendingRequests.delete(requestKey);
      clearTimeout(timeoutId);
    }
  }
  
  // High-level entity methods
  async getSpaces(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/spaces${params ? `?${params}` : ''}`);
  }
  
  async createBooking(bookingData) {
    return this.request('/bookings', 'POST', bookingData);
  }
  
  async updateCampaign(id, campaignData) {
    return this.request(`/campaigns/${id}`, 'PUT', campaignData);
  }
}
```

### React Query Integration
```javascript
// Custom hooks with React Query
const useSpaces = (filters = {}) => {
  return useQuery({
    queryKey: ['spaces', filters],
    queryFn: () => apiClient.getSpaces(filters),
    staleTime: 5 * 60 * 1000,        // 5 minutes
    cacheTime: 10 * 60 * 1000,       // 10 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error?.status === 404) return false;
      return failureCount < 3;
    }
  });
};

const useCreateBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (bookingData) => apiClient.createBooking(bookingData),
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries(['bookings']);
      queryClient.invalidateQueries(['spaces']);
      
      // Optimistic updates
      queryClient.setQueryData(['booking', data.id], data);
    },
    onError: (error) => {
      toast.error(`Booking failed: ${error.message}`);
    }
  });
};
```

### Component Patterns
```javascript
// Modern React component with TypeScript
interface SpaceCardProps {
  space: Space;
  onSelect?: (space: Space) => void;
  variant?: 'default' | 'compact' | 'detailed';
  showAnalytics?: boolean;
}

const SpaceCard = memo(({ 
  space, 
  onSelect, 
  variant = 'default',
  showAnalytics = false 
}: SpaceCardProps) => {
  // Optimized state management
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Memoized calculations
  const formattedPrice = useMemo(() => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: space.currency || 'USD'
    }).format(space.baseRate);
  }, [space.baseRate, space.currency]);
  
  // Optimized event handlers
  const handleSelect = useCallback(() => {
    onSelect?.(space);
  }, [onSelect, space]);
  
  // Conditional rendering based on variant
  const cardContent = useMemo(() => {
    switch (variant) {
      case 'compact':
        return <CompactSpaceContent space={space} />;
      case 'detailed':
        return <DetailedSpaceContent space={space} analytics={showAnalytics} />;
      default:
        return <DefaultSpaceContent space={space} />;
    }
  }, [variant, space, showAnalytics]);
  
  return (
    <Card 
      className={cn(
        "transition-all duration-300 cursor-pointer hover:shadow-lg",
        isHovered && "scale-105"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleSelect}
    >
      <CardHeader>
        <div className="relative aspect-video overflow-hidden rounded-t-lg">
          {!imageLoaded && <Skeleton className="absolute inset-0" />}
          <img
            src={space.images?.[0] || '/placeholder-space.jpg'}
            alt={space.title}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-300",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
        </div>
      </CardHeader>
      
      <CardContent>
        {cardContent}
      </CardContent>
      
      <CardFooter className="flex justify-between items-center">
        <Badge variant="secondary">{space.type}</Badge>
        <span className="text-lg font-semibold">{formattedPrice}/day</span>
      </CardFooter>
    </Card>
  );
});
```

### Form Handling with Validation
```javascript
// Advanced form with React Hook Form + Zod
const createBookingSchema = z.object({
  spaceId: z.string().min(1, "Space is required"),
  startDate: z.date({
    required_error: "Start date is required"
  }),
  endDate: z.date({
    required_error: "End date is required"
  }),
  totalAmount: z.number().positive("Amount must be positive"),
  notes: z.string().optional(),
  campaignId: z.string().optional()
}).refine(data => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"]
});

const CreateBookingForm = ({ spaceId, onSuccess }) => {
  const form = useForm({
    resolver: zodResolver(createBookingSchema),
    defaultValues: {
      spaceId,
      notes: "",
      campaignId: ""
    }
  });
  
  const createBookingMutation = useCreateBooking();
  
  const onSubmit = async (data) => {
    try {
      await createBookingMutation.mutateAsync(data);
      onSuccess?.();
      toast.success("Booking created successfully!");
    } catch (error) {
      toast.error("Failed to create booking");
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) => date < new Date()}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Additional form fields... */}
        
        <Button 
          type="submit" 
          disabled={createBookingMutation.isLoading}
          className="w-full"
        >
          {createBookingMutation.isLoading && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Create Booking
        </Button>
      </form>
    </Form>
  );
};
```

## 🚀 Current Technology Stack

### Frontend Core
- **React 18.3.1** with Vite 6.1.0
- **TypeScript/JavaScript** (mixed codebase)
- **React Router v7** for navigation
- **@tanstack/react-query 5.81.5** for server state
- **React Hook Form** with Zod validation
- **Framer Motion 12.23.12** for animations

### UI & Styling
- **Tailwind CSS 3.4.17** with custom design system
- **Shadcn/ui** (40+ Radix UI components)
- **Lucide React 0.475.0** for icons
- **Class Variance Authority** for component variants
- **Tailwind Animate** for CSS animations

### Authentication & Security
- **Clerk 5.32.4** (complete integration)
- **JWT token management** with automatic refresh
- **Role-based access control**
- **Protected route system**

### External Integrations
- **Stripe 3.7.0** for payments
- **Google Maps API** with multiple providers:
  - @vis.gl/react-google-maps 0.3.6
  - @react-google-maps/api 2.20.3
- **Cloudinary** for file storage
- **Google Gemini AI** for chatbot

### Development Tools
- **Vite** with path aliases (@/* imports)
- **ESLint** for code quality
- **PostCSS** for CSS processing
- **TypeScript** configuration for mixed JS/TS

### Backend Integration
- **Railway hosting** (elaview-backend.up.railway.app)
- **PostgreSQL** with Prisma ORM
- **Node.js + Express** backend
- **Advanced API client** with caching and rate limiting

## 📋 Common Development Workflows

### Adding a New Feature
1. **Database Schema**: Update Prisma schema in backend
2. **API Endpoints**: Create route handlers
3. **API Client**: Add methods to apiClient.js
4. **Types**: Define TypeScript interfaces
5. **Components**: Create feature components
6. **Pages**: Add page components with routing
7. **Hooks**: Create custom hooks for data management
8. **Tests**: Add component and integration tests

### Creating a New Page
1. Create page component in appropriate `/pages/` directory
2. Add route in `/pages/Pages.tsx` with protection level
3. Use `Layout` component with proper navigation
4. Add navigation links if needed
5. Implement error boundaries and loading states

### Adding API Integration
1. Add method to `apiClient.js` with error handling
2. Create React Query hook for data fetching
3. Add optimistic updates for mutations
4. Implement proper caching strategy
5. Add loading and error states to components

### Styling Components
1. Use Shadcn/ui base components
2. Follow teal-based design system
3. Implement responsive design (mobile-first)
4. Add animations with Framer Motion
5. Use Tailwind utilities consistently

## 📊 Current Project Status

### ✅ Production Ready
- **Authentication**: Clerk fully integrated
- **API Layer**: Advanced client with caching and rate limiting
- **UI System**: Complete Shadcn/ui implementation
- **Payments**: Stripe checkout flow
- **Maps**: Google Maps with fallbacks
- **Dashboards**: Role-specific interfaces
- **Messaging**: B2B communication system
- **File Handling**: Cloudinary integration

### 🚧 In Development
- **Material Sourcing**: Admin catalog system
- **Installation Management**: Workflow automation
- **Advanced Analytics**: Performance insights
- **A/B Testing**: Optimization framework

### 🔄 Continuous Improvements
- **Performance Optimization**: Bundle splitting, caching
- **Security Enhancements**: Advanced auth flows
- **User Experience**: Progressive loading, offline support
- **Mobile Optimization**: App-like experience

## 🔑 Key Files Reference

### Application Core
- **Entry Point**: `/src/main.jsx` (React + Clerk + React Query)
- **App Component**: `/src/App.jsx`
- **Routing**: `/src/pages/Pages.tsx` (complete route definitions)
- **Layout**: `/src/components/layout/Layout.tsx`

### API & Data Layer
- **Main API Client**: `/src/api/apiClient.js` (advanced features)
- **Entity Abstractions**: `/src/api/entities.js`
- **Base URL**: https://elaview-backend.up.railway.app/api

### Authentication
- **Clerk Setup**: `/src/lib/clerk.js`
- **Protected Routes**: `/src/components/auth/ProtectedRoute.jsx`
- **User Context**: Built into Clerk hooks

### Configuration
- **Vite Config**: `/vite.config.js` (path aliases, proxy)
- **Tailwind Config**: `/tailwind.config.js` (custom theme)
- **TypeScript**: `/tsconfig.json` (mixed JS/TS support)
- **Environment**: `.env` files for API keys

This comprehensive reference map provides complete guidance for understanding and developing within the Elaview codebase, including all current features, architecture patterns, and development workflows.