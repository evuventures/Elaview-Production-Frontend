// src/types/property.ts
// Core location interface
export interface LocationData {
  address: string;
  city: string;
  zipcode: string;
  latitude: number | null;
  longitude: number | null;
}

// Photo upload interface
export interface PhotoUpload {
  id: string;
  file: File;
  preview: string;
  caption?: string;
  isUploading?: boolean;
  uploadProgress?: number;
  error?: string;
}

// Space interface (replaces AdvertisingArea)
export interface Space {
  id: string;
  name: string;
  type: 'billboard' | 'digital_display' | 'wall_graphic' | 'floor_graphic' | 'window_display' | 
        'super_side_ads' | 'tail_light_ads' | 'wrap_around_ads' | 'digital_display_side' | 'digital_wraps' | 'other';
  dimensions: {
    width: number;
    height: number;
    unit: 'ft' | 'in' | 'm' | 'cm';
  };
  location_description: string;
  monthly_rate: number;
  min_contract_length: number; // in months
  max_contract_length: number; // in months
  is_available: boolean;
  features: string[];
  restrictions?: string;
  photos: PhotoUpload[];
}

// DEPRECATED: Use Space interface instead
export interface AdvertisingArea extends Space {
  // This interface is deprecated - use Space instead
}

// Main property form data interface - REMOVED CONTACT FIELDS
export interface PropertyFormData {
  // Basic Info - Required fields for form
  property_name: string;
  property_type: string;
  description: string;
  total_sqft: number;
  
  // Location - Required
  location: LocationData;
  
  // Photos - Arrays (can be empty)
  main_photos: PhotoUpload[];
  
  // Spaces - Arrays (can be empty)
  spaces: Space[];
  
  // Optional metadata
  created_at?: string;
  updated_at?: string;
  is_published?: boolean;
  status?: PropertyStatus;
}

// Form validation interfaces - REMOVED CONTACT FIELDS
export interface FormErrors {
  // Basic property fields
  property_name?: string | null;
  property_type?: string | null;
  description?: string | null;
  total_sqft?: string | null;
  
  // Location fields
  location?: string | null;
  location_address?: string | null;
  
  // Location sub-fields (from LocationData)
  address?: string | null;
  city?: string | null;
  zipcode?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  
  // Photos and spaces
  main_photos?: string | null;
  spaces?: string | null;
  
  
  // Generic catch-all for dynamic errors
  [key: string]: string | null | undefined;
}

// Updated property types to match backend database enums exactly
export type PropertyType = 
  | 'HOUSE'
  | 'APARTMENT'
  | 'COMMERCIAL'
  | 'OFFICE'
  | 'RETAIL'
  | 'BUILDING'
  | 'VEHICLE_FLEET'
  | 'BILLBOARD'
  | 'DIGITAL_DISPLAY'
  | 'OTHER';

export type SpaceType = 
  | 'storefront_window'
  | 'building_exterior'
  | 'event_space'
  | 'retail_frontage'
  | 'pole_mount'
  | 'other';

// DEPRECATED: Use SpaceType instead
export type AdvertisingAreaType = SpaceType;

export type DimensionUnit = 'ft' | 'in' | 'm' | 'cm';

export type PropertyStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

// Updated constants to match backend enums exactly
export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'HOUSE', label: 'House' },
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'COMMERCIAL', label: 'Commercial' },
  { value: 'OFFICE', label: 'Office Building' },
  { value: 'RETAIL', label: 'Retail Space' },
  { value: 'BUILDING', label: 'Building' },
  { value: 'VEHICLE_FLEET', label: 'Vehicle Fleet' },
  { value: 'BILLBOARD', label: 'Billboard' },
  { value: 'DIGITAL_DISPLAY', label: 'Digital Display' },
  { value: 'OTHER', label: 'Other' },
];

export const SPACE_TYPES: { value: SpaceType; label: string }[] = [
  { value: 'storefront_window', label: 'Storefront Window' },
  { value: 'building_exterior', label: 'Building Exterior' },
  { value: 'event_space', label: 'Event Space' },
  { value: 'retail_frontage', label: 'Retail Frontage' },
  { value: 'pole_mount', label: 'Pole Mount' },
  { value: 'other', label: 'Other' },
];

// DEPRECATED: Use SPACE_TYPES instead
export const ADVERTISING_AREA_TYPES = SPACE_TYPES;

// Form validation helpers
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[(]?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateZipCode = (zipcode: string): boolean => {
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zipcode);
};

// Updated default form data - REMOVED CONTACT FIELDS
export const getDefaultFormData = (): PropertyFormData => ({
  // Basic info with empty strings (not undefined)
  property_name: '',
  property_type: '',
  description: '',
  total_sqft: 0,
  
  // Location with all required fields
  location: {
    address: '',
    city: '',
    zipcode: '',
    latitude: null,
    longitude: null,
  },
  
  // Arrays start empty
  main_photos: [],
  spaces: [],
  
  // Optional metadata
  is_published: false,
  status: 'DRAFT',
});

// Default space for new spaces (replaces defaultArea)
export const defaultSpace = (): Space => ({
  id: crypto.randomUUID(),
  name: '',
  type: 'storefront_window',
  dimensions: {
    width: 0,
    height: 0,
    unit: 'ft'
  },
  location_description: '',
  monthly_rate: 0,
  min_contract_length: 1,
  max_contract_length: 12,
  is_available: true,
  features: [],
  restrictions: '',
  photos: []
});

// DEPRECATED: Use defaultSpace instead
export const defaultArea = defaultSpace;

// Saved form data interface for localStorage
export interface SavedFormData {
  data: PropertyFormData;
  timestamp: string;
  step: number;
  version: string;
}

// Local storage keys
export const STORAGE_KEYS = {
  FORM_DATA: 'property_form_data',
  CURRENT_STEP: 'property_form_current_step',
  PHOTOS_CACHE: 'property_photos_cache',
} as const;