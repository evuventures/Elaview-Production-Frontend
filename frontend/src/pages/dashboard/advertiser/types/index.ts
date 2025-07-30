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

export interface Booking {
  id: string;
  spaceName?: string;
  location?: string;
  status?: 'materials_ordered' | 'materials_shipped' | 'active';
  startDate?: string;
  endDate?: string;
  totalCost?: number;
  spaceCost?: number;
  materialCost?: number;
  platformFee?: number;
  materialType?: string;
  dimensions?: string;
  materialStatus?: string;
  installationStatus?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
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
}

// Component Props Interfaces
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