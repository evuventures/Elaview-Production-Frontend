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

// Advertising area interface
export interface AdvertisingArea {
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
  
  // Advertising Areas - Arrays (can be empty)
  advertising_areas: AdvertisingArea[];
  
  // Optional metadata
  created_at?: string;
  updated_at?: string;
  is_published?: boolean;
  status?: 'draft' | 'review' | 'published' | 'archived';
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
  
  // Photos and areas
  main_photos?: string | null;
  advertising_areas?: string | null;
  
  // Generic catch-all for dynamic errors
  [key: string]: string | null | undefined;
}

// Updated property types to match database enums
export type PropertyType = 
  | 'OFFICE'
  | 'RETAIL'
  | 'COMMERCIAL'
  | 'WAREHOUSE'
  | 'OTHER';

export type AdvertisingAreaType = 
  | 'billboard'
  | 'digital_display'
  | 'wall_graphic'
  | 'floor_graphic'
  | 'window_display'
  | 'super_side_ads'
  | 'tail_light_ads'
  | 'wrap_around_ads'
  | 'digital_display_side'
  | 'digital_wraps'
  | 'other';

export type DimensionUnit = 'ft' | 'in' | 'm' | 'cm';

export type PropertyStatus = 'draft' | 'review' | 'published' | 'archived';

// Updated constants
export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'OFFICE', label: 'Office Building' },
  { value: 'RETAIL', label: 'Retail Space' },
  { value: 'COMMERCIAL', label: 'Commercial' },
  { value: 'WAREHOUSE', label: 'Warehouse' },
  { value: 'OTHER', label: 'Other' },
];

export const ADVERTISING_AREA_TYPES: { value: AdvertisingAreaType; label: string }[] = [
  { value: 'billboard', label: 'Billboard' },
  { value: 'digital_display', label: 'Digital Display' },
  { value: 'wall_graphic', label: 'Wall Graphic' },
  { value: 'floor_graphic', label: 'Floor Graphic' },
  { value: 'window_display', label: 'Window Display' },
  { value: 'super_side_ads', label: 'Super Side Ads' },
  { value: 'tail_light_ads', label: 'Tail Light Ads' },
  { value: 'wrap_around_ads', label: 'Wrap Around Ads' },
  { value: 'digital_display_side', label: 'Digital Display (Side)' },
  { value: 'digital_wraps', label: 'Digital Wraps' },
  { value: 'other', label: 'Other' },
];

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
  advertising_areas: [],
  
  // Optional metadata
  is_published: false,
  status: 'draft',
});

// Default advertising area for new areas
export const defaultArea = (): AdvertisingArea => ({
  id: crypto.randomUUID(),
  name: '',
  type: 'billboard',
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

// Local storage keys
export const STORAGE_KEYS = {
  FORM_DATA: 'property_form_data',
  CURRENT_STEP: 'property_form_current_step',
  PHOTOS_CACHE: 'property_photos_cache',
} as const;