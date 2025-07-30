import { CheckCircle, Package, Truck } from 'lucide-react';
import { Material, CustomDimensions, Space, Booking } from '../types';

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

// Status badge configuration
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
    'active': {
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle,
      text: 'Campaign Active'
    }
  };
  
  // Always return a valid badge, defaulting to 'active' if status is undefined or invalid
  return badges[status || 'active'] || badges['active'];
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

// Area calculation utility
export const calculateArea = (width: string, height: string): number => {
  if (!width || !height) return 0;
  return parseFloat(width) * parseFloat(height);
};

// Price formatting utilities
export const formatPrice = (price?: number): string => {
  if (typeof price !== 'number' || price === null || price === undefined) return 'N/A';
  return `${price.toLocaleString()}`;
};

export const formatStatValue = (value: number | string | undefined | null, label: string): string => {
  // Handle undefined, null, or invalid values
  if (value === null || value === undefined) return '0';
  
  if (typeof value === 'number' && label.includes('Spent')) {
    return `${value.toLocaleString()}`;
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