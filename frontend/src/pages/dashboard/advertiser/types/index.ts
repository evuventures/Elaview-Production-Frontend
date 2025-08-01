// Dashboard Types
export interface DashboardStats {
  totalSpent: number;
  activeCampaigns: number;
  pendingMaterials: number;
  completedCampaigns: number;
}

export interface Space {
  id: string;
  name?: string;
  location?: string;
  address?: string;
  dimensions?: string;
  price?: number;
  estimatedMaterialCost?: number;
  imageUrl?: string;
  availability?: string;
  surfaceType?: string;
  materialCompatibility?: string[];
  propertyId?: string;
}

export interface Material {
  id: string;
  name?: string;
  description?: string;
  category: string;
  pricePerUnit?: number;
  imageUrl?: string;
  skillLevel?: string;
}

// Enhanced Booking interface with full material sourcing pipeline
export interface Booking {
  id: string;
  spaceName?: string;
  location?: string;
  status?: 'materials_ordered' | 'materials_shipped' | 'pending_install' | 'active' | 'completed';
  startDate?: string;
  endDate?: string;
  duration?: number; // in days
  
  // Cost breakdown
  totalCost?: number;
  spaceCost?: number;
  materialCost?: number;
  installationCost?: number;
  platformFee?: number;
  
  // Material details
  materialType?: string;
  dimensions?: string;
  materialStatus?: MaterialStatus;
  supplierName?: string;
  
  // Installation details  
  installationStatus?: InstallationStatus;
  installerType?: InstallerType;
  scheduledInstallDate?: string;
  installDeadline?: string;
  estimatedInstallTime?: number; // in minutes
  
  // Shipping & tracking
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  shippingAddress?: string;
  materialDeliveredAt?: string; // NEW: When materials were delivered
  
  // People involved
  propertyOwnerName?: string;
  installerDetails?: InstallerDetails;
  
  // Verification & completion
  verificationImageUrl?: string;
  installationPhotos?: string[]; // NEW: All installation photos
  beforePhotos?: string[]; // NEW: Before installation photos
  afterPhotos?: string[]; // NEW: After installation photos
  installationNotes?: string;
  installationStartedAt?: string; // NEW: When installation began
  installationCompletedAt?: string; // NEW: When installation finished
  photosVerifiedAt?: string; // NEW: When photos were verified
  
  // Timeline tracking
  orderTimeline?: OrderTimelineEvent[];
  
  // Performance data (when campaign is active)
  performanceData?: CampaignPerformance;
}

export interface InstallerDetails {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  phone?: string;
  email?: string;
  specialties?: string[];
}

export interface OrderTimelineEvent {
  status: string;
  timestamp: string;
  description?: string;
}

export interface CampaignPerformance {
  impressions?: number;
  clicks?: number;
  estimatedValue?: number;
  ctr?: number; // click-through rate
}

export interface CustomDimensions {
  width: string;
  height: string;
}

export interface BookingData {
  spaceId: string;
  propertyId?: string;
  materialItemId: string;
  dimensions: CustomDimensions;
  designFileUrl: string;
  totalCost: number;
  installerType?: InstallerType;
  installerId?: string;
}

// Enhanced Component Props Interfaces
export interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  value: number | string | undefined | null;
  label: string;
  color: 'green' | 'blue' | 'yellow' | 'teal';
  subValue?: string;
  actionText?: string;
  onAction?: () => void;
}

export interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionText: string;
  onAction: () => void;
}

export interface SpaceSearchCardProps {
  space: Space;
  onSelect: (space: Space) => void;
}

export interface EnhancedBookingCardProps {
  booking: Booking;
  expandedBooking: string | null;
  onToggleExpand: (bookingId: string | null) => void;
}

export interface BookingCardProps {
  booking: Booking;
  expandedBooking: string | null;
  onToggleExpand: (bookingId: string | null) => void;
}

export interface MaterialSelectionModalProps {
  selectedSpace: Space | null;
  showModal: boolean;
  availableMaterials: Material[];
  materialsLoading: boolean;
  selectedMaterial: Material | null;
  customDimensions: CustomDimensions;
  uploadedCreative: string | null;
  onClose: () => void;
  onMaterialSelect: (material: Material) => void;
  onDimensionsChange: (dimensions: CustomDimensions) => void;
  onCreativeUpload: (file: string) => void;
  onConfirmBooking: () => void;
  calculateTotalCost: () => number;
  calculateMaterialCost: (material: Material, dimensions: CustomDimensions) => number;
}

// Notification System Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  data?: any;
}

// Status Enums (matching your Prisma schema)
export type MaterialStatus = 
  | 'NOT_ORDERED'
  | 'QUOTE_REQUESTED' 
  | 'MATERIALS_ORDERED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'INSTALLED'
  | 'COMPLETED';

export type InstallationStatus = 
  | 'PENDING'
  | 'SCHEDULED'
  | 'MATERIALS_READY'
  | 'IN_PROGRESS' 
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'NEEDS_REWORK';

export type InstallerType = 
  | 'SELF_INSTALL'
  | 'PLATFORM_INSTALLER'
  | 'THIRD_PARTY'
  | 'SUPPLIER_INSTALLER';

export type MaterialOrderStatus = 
  | 'PENDING'
  | 'QUOTE_REQUESTED' 
  | 'QUOTED'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PRINTED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'FAILED';

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface DashboardData {
  stats: DashboardStats;
  bookings: Booking[];
}

export interface MaterialsCatalogData {
  materials: Material[];
}

export interface SpacesSearchData {
  spaces: Space[];
}

export interface NotificationsData {
  notifications: Notification[];
  unreadCount: number;
}

// Installation Component Props
export interface InstallationStatusTrackerProps {
  booking: Booking;
  onRequestUpdate: () => void;
  onContactOwner: () => void;
  onViewPhotos: () => void;
  onReportIssue: () => void;
}

export interface InstallationPhotosViewerProps {
  booking: Booking;
  showModal: boolean;
  onClose: () => void;
  onRequestRetake: () => void;
  onApprovePhotos: () => void;
  onReportIssue: () => void;
}

export interface InstallationCommunicationProps {
  booking: Booking;
  messages: InstallationMessage[];
  showModal: boolean;
  onClose: () => void;
  onSendMessage: (message: string) => void;
  onRequestCall: () => void;
  onEscalateIssue: () => void;
}

// Installation Message Types
export interface InstallationMessage {
  id: string;
  content: string;
  timestamp: string;
  isFromAdvertiser: boolean;
  status: 'sent' | 'delivered' | 'read';
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'other';
  size?: number;
}

// Phase 3: Material Order Tracking Types
export interface MaterialOrder {
  id: string;
  orderNumber: string;
  bookingId: string;
  supplierId: string;
  supplierName: string;
  status: MaterialOrderStatus;
  
  // Cost breakdown
  subtotal: number;
  tax: number;
  shipping: number;
  platformFee: number;
  totalCost: number;
  currency: string;
  
  // Timeline
  createdAt: string;
  quotedAt?: string;
  confirmedAt?: string;
  productionStartedAt?: string;
  estimatedProductionComplete?: string;
  shippedDate?: string;
  deliveredDate?: string;
  estimatedDelivery?: string;
  
  // Shipping details
  shippingAddress: string | {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  shippingMethod?: string;
  shippingCarrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  
  // Additional details
  scheduledDeliveryDate?: string;
  scheduledTimeSlot?: string;
  specialInstructions?: string;
  notes?: string;
  driverContact?: {
    name: string;
    phone: string;
  };
  
  // Order items
  orderItems?: MaterialOrderItem[];
}

export interface MaterialOrderItem {
  id: string;
  materialItemId: string;
  materialName: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  customSpecs?: Record<string, any>;
  designFileUrl?: string;
}

export interface Supplier {
  id: string;
  name: string;
  website?: string;
  contactEmail: string;
  supportPhone?: string;
  isActive: boolean;
  isPremium?: boolean;
  
  // Performance metrics
  rating?: number;
  totalOrders?: number;
  averageDeliveryDays?: number;
  averagePrice?: number;
  reliabilityScore?: number;
  onTimeDeliveryRate?: number;
  qualityScore?: number;
  responseTime?: number;
  
  // Service details
  serviceAreas?: string[];
  specialties?: string[];
  paymentTerms?: string;
  minimumOrder?: number;
  
  // Recent history
  recentOrders?: {
    id: string;
    orderNumber: string;
    material: string;
    completedAt: string;
    status: 'completed' | 'delayed' | 'failed';
  }[];
  
  warnings?: string[];
}

export interface CostAlternative {
  id: string;
  supplierId: string;
  supplierName: string;
  materialCost: number;
  totalCost: number;
  estimatedDeliveryDays?: number;
  qualityScore?: number;
  valueScore?: number;
  isRecommended?: boolean;
  isPremium?: boolean;
  pros?: string[];
  cons?: string[];
}

export interface CostRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  potentialSavings?: number;
  savingsPercentage?: string;
  actionItems?: string[];
}

export interface OrderTimelineEvent {
  id: string;
  eventType: string;
  title: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'in_progress' | 'failed';
  actor?: string;
  location?: string;
  isAutomated?: boolean;
  canExpand?: boolean;
  hasAttachments?: boolean;
  details?: {
    additionalInfo?: string;
    cost?: {
      amount: number;
      description?: string;
    };
    attachments?: {
      id: string;
      name: string;
      url: string;
    }[];
    photos?: {
      id: string;
      url: string;
      caption?: string;
    }[];
    contact?: {
      name: string;
      email?: string;
      phone?: string;
    };
    nextSteps?: string[];
  };
}

// Component Props for Phase 3
export interface MaterialOrderTrackerProps {
  booking: Booking;
  materialOrder: MaterialOrder | null;
  onContactSupplier: () => void;
  onRequestUpdate: () => void;
  onModifyOrder: () => void;
  onTrackShipment: () => void;
  onViewInvoice: () => void;
}

export interface SupplierDashboardProps {
  suppliers: Supplier[];
  selectedSupplierId?: string;
  onSelectSupplier: (supplierId: string) => void;
  onContactSupplier: (supplierId: string) => void;
  onViewSupplierDetails: (supplierId: string) => void;
  onCompareSuppliers: () => void;
  onRequestQuote: (supplierId: string) => void;
}

export interface OrderTimelineProps {
  materialOrder: MaterialOrder;
  timelineEvents: OrderTimelineEvent[];
  onViewDocument: (url: string) => void;
  onContactSupplier: () => void;
  onDownloadInvoice: () => void;
}

export interface CostOptimizerProps {
  currentOrder?: MaterialOrder;
  alternatives?: CostAlternative[];
  historicalData?: any;
  recommendations?: CostRecommendation[];
  onSelectAlternative: (alternativeId: string) => void;
  onRequestQuote: (supplierId: string) => void;
  onApplyOptimization: (recommendationId: string) => void;
  onViewAnalytics: () => void;
}

export interface DeliveryCoordinatorProps {
  booking: Booking;
  materialOrder: MaterialOrder | null;
  availableTimeSlots?: string[];
  onScheduleDelivery: (date: string, timeSlot: string) => void;
  onRescheduleDelivery: (newDate: string, newTimeSlot: string) => void;
  onContactDriver: () => void;
  onContactOwner: () => void;
  onUpdateDeliveryInstructions: (instructions: string) => void;
}

// Extended Booking interface for Phase 3
export interface ExtendedBooking extends Booking {
  deliveryInstructions?: string;
  deliveryAddress?: string | {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  
  // Material order relationship
  materialOrder?: MaterialOrder;
  
  // Supplier information
  supplierDetails?: Supplier;
}