import { 
  CheckCircle, Package, Truck, Clock, AlertCircle, Wrench, 
  Camera, Star, Navigation, DollarSign
} from 'lucide-react';
import { 
  Material, CustomDimensions, Space, Booking, MaterialStatus, 
  InstallationStatus, InstallerType 
} from '../types';

// Cost calculation utilities
export const calculateMaterialCost = (material: Material, dimensions: CustomDimensions): number => {
  if (!dimensions.width || !dimensions.height || !material) return 0;
  const sqFt = (parseFloat(dimensions.width) * parseFloat(dimensions.height));
  const materialCost = sqFt * (material.pricePerUnit || 0);
  const markup = materialCost * 0.15; // 15% markup
  return Math.round((materialCost + markup) * 100) / 100;
};

export const calculateTotalCost = (
  selectedSpace: Space | null, 
  selectedMaterial: Material | null, 
  customDimensions: CustomDimensions
): number => {
  if (!selectedSpace || !selectedMaterial) return 0;
  const spaceCost = selectedSpace.price || 0;
  const materialCost = calculateMaterialCost(selectedMaterial, customDimensions);
  const subtotal = spaceCost + materialCost;
  const platformFee = subtotal * 0.05;
  return subtotal + platformFee;
};

// Enhanced status badge configuration for main booking status
export const getStatusBadge = (status?: Booking['status']) => {
  const badges = {
    'materials_ordered': {
      color: 'bg-blue-100 text-blue-800',
      icon: Package,
      text: 'Materials Ordered'
    },
    'materials_shipped': {
      color: 'bg-purple-100 text-purple-800',
      icon: Truck,
      text: 'Materials Shipped'
    },
    'pending_install': {
      color: 'bg-yellow-100 text-yellow-800',
      icon: Clock,
      text: 'Awaiting Installation'
    },
    'active': {
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle,
      text: 'Campaign Active'
    },
    'completed': {
      color: 'bg-gray-100 text-gray-800',
      icon: CheckCircle,
      text: 'Completed'
    }
  };
  
  return badges[status || 'active'] || badges['active'];
};

// Material order status badges
export const getMaterialOrderStatusBadge = (status?: MaterialStatus) => {
  const badges = {
    'NOT_ORDERED': {
      color: 'bg-gray-100 text-gray-800',
      icon: Package,
      text: 'Not Ordered'
    },
    'QUOTE_REQUESTED': {
      color: 'bg-yellow-100 text-yellow-800',
      icon: Clock,
      text: 'Quote Pending'
    },
    'MATERIALS_ORDERED': {
      color: 'bg-blue-100 text-blue-800',
      icon: Package,
      text: 'Ordered'
    },
    'SHIPPED': {
      color: 'bg-purple-100 text-purple-800',
      icon: Truck,
      text: 'Shipped'
    },
    'DELIVERED': {
      color: 'bg-teal-100 text-teal-800',
      icon: CheckCircle,
      text: 'Delivered'
    },
    'INSTALLED': {
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle,
      text: 'Installed'
    },
    'COMPLETED': {
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle,
      text: 'Complete'
    }
  };
  
  return badges[status || 'NOT_ORDERED'] || badges['NOT_ORDERED'];
};

// Installation status badges
export const getInstallationStatusBadge = (status?: InstallationStatus) => {
  const badges = {
    'PENDING': {
      color: 'bg-gray-100 text-gray-800',
      icon: Clock,
      text: 'Pending'
    },
    'SCHEDULED': {
      color: 'bg-blue-100 text-blue-800',
      icon: Clock,
      text: 'Scheduled'
    },
    'MATERIALS_READY': {
      color: 'bg-yellow-100 text-yellow-800',
      icon: Package,
      text: 'Ready to Install'
    },
    'IN_PROGRESS': {
      color: 'bg-orange-100 text-orange-800',
      icon: Wrench,
      text: 'Installing'
    },
    'COMPLETED': {
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle,
      text: 'Installed'
    },
    'FAILED': {
      color: 'bg-red-100 text-red-800',
      icon: AlertCircle,
      text: 'Failed'
    },
    'CANCELLED': {
      color: 'bg-gray-100 text-gray-800',
      icon: AlertCircle,
      text: 'Cancelled'
    },
    'NEEDS_REWORK': {
      color: 'bg-yellow-100 text-yellow-800',
      icon: Wrench,
      text: 'Needs Rework'
    }
  };
  
  return badges[status || 'PENDING'] || badges['PENDING'];
};

// Color class utilities
export const getStatCardColorClasses = (color: 'green' | 'blue' | 'yellow' | 'teal') => {
  const colorClasses = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    teal: 'bg-teal-100 text-teal-600'
  };
  return colorClasses[color];
};

// Date formatting utilities
export const formatDateRange = (startDate?: string, endDate?: string): string => {
  if (!startDate || !endDate) return 'N/A';
  const start = new Date(startDate).toLocaleDateString();
  const end = new Date(endDate).toLocaleDateString();
  return `${start} - ${end}`;
};

export const formatDeliveryDate = (date?: string): string => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString();
};

// Calculate days until deadline (for urgency indicators) - THIS WAS MISSING!
export const calculateDaysUntilDeadline = (deadline: string): number => {
  const deadlineDate = new Date(deadline);
  const today = new Date();
  const timeDiff = deadlineDate.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

// Area calculation utility
export const calculateArea = (width: string, height: string): number => {
  if (!width || !height) return 0;
  return parseFloat(width) * parseFloat(height);
};

// Price formatting utilities
export const formatPrice = (price?: number): string => {
  if (typeof price !== 'number' || price === null || price === undefined) return 'N/A';
  return `$${price.toLocaleString()}`;
};

export const formatStatValue = (value: number | string | undefined | null, label: string): string => {
  // Handle undefined, null, or invalid values
  if (value === null || value === undefined) return '0';
  
  if (typeof value === 'number' && label.includes('Spent')) {
    return `$${value.toLocaleString()}`;
  }
  
  // Safely convert to string
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  
  return '0';
};

// Validation utilities
export const isBookingDataComplete = (
  selectedSpace: Space | null,
  selectedMaterial: Material | null,
  customDimensions: CustomDimensions,
  uploadedCreative: string | null
): boolean => {
  return !!(
    selectedSpace &&
    selectedMaterial &&
    customDimensions.width &&
    customDimensions.height &&
    uploadedCreative
  );
};

// Filter utilities
export const filterCompatibleMaterials = (
  materials: Material[],
  space: Space
): Material[] => {
  if (!space.materialCompatibility) return materials;
  return materials.filter(material => 
    space.materialCompatibility?.includes(material.category)
  );
};

// Installation type helper
export const getInstallerTypeDisplay = (type?: InstallerType): string => {
  const displayNames = {
    'SELF_INSTALL': 'Property Owner (DIY)',
    'PLATFORM_INSTALLER': 'Elaview Professional',
    'THIRD_PARTY': 'Third Party Installer',
    'SUPPLIER_INSTALLER': 'Supplier Installer'
  };
  
  return displayNames[type || 'SELF_INSTALL'] || 'Self Install';
};

// Priority/urgency helpers
export const getBookingUrgencyLevel = (booking: Booking): 'low' | 'medium' | 'high' | 'critical' => {
  // Check if installation is overdue
  if (booking.installDeadline) {
    const daysUntil = calculateDaysUntilDeadline(booking.installDeadline);
    if (daysUntil < 0) return 'critical'; // Overdue
    if (daysUntil <= 1) return 'high';
    if (daysUntil <= 3) return 'medium';
  }
  
  // Check if materials are delivered but not installed
  if (booking.materialStatus === 'DELIVERED' && 
      booking.installationStatus === 'PENDING') {
    return 'medium';
  }
  
  return 'low';
};

// Campaign performance helpers
export const calculateCTR = (clicks?: number, impressions?: number): number => {
  if (!clicks || !impressions || impressions === 0) return 0;
  return (clicks / impressions) * 100;
};

export const estimateCampaignValue = (impressions?: number, ctr?: number): number => {
  if (!impressions) return 0;
  const avgCPM = 2.50; // Average cost per thousand impressions
  const engagementValue = ctr && ctr > 0 ? (ctr / 100) * impressions * 0.10 : 0;
  return (impressions / 1000) * avgCPM + engagementValue;
};

// Notification helpers
export const getNotificationIcon = (type: 'info' | 'success' | 'warning' | 'error') => {
  const icons = {
    info: Package,
    success: CheckCircle,
    warning: AlertCircle,
    error: AlertCircle
  };
  return icons[type];
};

export const getNotificationColor = (type: 'info' | 'success' | 'warning' | 'error') => {
  const colors = {
    info: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800', 
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800'
  };
  return colors[type];
};