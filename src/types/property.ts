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
  type: 'billboard' | 'digital_display' | 'wall_graphic' | 'floor_graphic' | 'window_display' | 'other';
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

// Main property form data interface
export interface PropertyFormData {
  // Basic Info - Required fields for form
  property_name: string;
  property_type: string;
  description: string;
  total_sqft: number;
  
  // Location - Required
  location: LocationData;
  
  // Contact Info - Required
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  
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

// Google Maps related interfaces for better type safety
export interface GoogleMapsLibraries {
  places: typeof google.maps.places;
  geometry: typeof google.maps.geometry;
  drawing: typeof google.maps.drawing;
  visualization: typeof google.maps.visualization;
}

export interface AutocompletePrediction {
  description: string;
  matched_substrings: google.maps.places.PredictionSubstring[];
  place_id: string;
  reference: string;
  structured_formatting: google.maps.places.StructuredFormatting;
  terms: google.maps.places.PredictionTerm[];
  types: string[];
}

// Form validation interfaces  
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
  
  // Contact fields
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  
  // Photos and areas
  main_photos?: string | null;
  advertising_areas?: string | null;
  
  // Generic catch-all for dynamic errors
  [key: string]: string | null | undefined;
}

// Form step management
export interface FormStep {
  id: number;
  title: string;
  description: string;
  isComplete: boolean;
  isActive: boolean;
}

// Saved form data for persistence
export interface SavedFormData {
  data: PropertyFormData;
  timestamp: string;
  step: number;
  version: string;
}

// API response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PropertySubmissionResponse {
  property_id: string;
  status: string;
  message: string;
  next_steps?: string[];
}

// Component prop interfaces
export interface LocationPickerProps {
  location: LocationData;
  onLocationChange: (field: keyof LocationData, value: string | number | null) => void;
  onLocationSelect?: (location: LocationData) => void;
  error?: string | null;
  required?: boolean;
  className?: string;
}

export interface PhotoUploaderProps {
  photos: PhotoUpload[];
  onPhotosChange: (photos: PhotoUpload[]) => void;
  maxPhotos?: number;
  acceptedFormats?: string[];
  maxFileSize?: number; // in bytes
  error?: string | null;
  required?: boolean;
}

export interface AdvertisingAreaProps {
  areas: AdvertisingArea[];
  onAreasChange: (areas: AdvertisingArea[]) => void;
  error?: string | null;
}

// Utility types
export type PropertyType = 
  | 'office'
  | 'retail'
  | 'industrial'
  | 'mixed_use'
  | 'medical'
  | 'hospitality'
  | 'residential'
  | 'other';

export type AdvertisingAreaType = 
  | 'billboard'
  | 'digital_display'
  | 'wall_graphic'
  | 'floor_graphic'
  | 'window_display'
  | 'other';

export type DimensionUnit = 'ft' | 'in' | 'm' | 'cm';

export type PropertyStatus = 'draft' | 'review' | 'published' | 'archived';

// Constants
export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'office', label: 'Office Building' },
  { value: 'retail', label: 'Retail Space' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'mixed_use', label: 'Mixed Use' },
  { value: 'medical', label: 'Medical Building' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'residential', label: 'Residential' },
  { value: 'other', label: 'Other' },
];

export const ADVERTISING_AREA_TYPES: { value: AdvertisingAreaType; label: string }[] = [
  { value: 'billboard', label: 'Billboard' },
  { value: 'digital_display', label: 'Digital Display' },
  { value: 'wall_graphic', label: 'Wall Graphic' },
  { value: 'floor_graphic', label: 'Floor Graphic' },
  { value: 'window_display', label: 'Window Display' },
  { value: 'other', label: 'Other' },
];

export const DIMENSION_UNITS: { value: DimensionUnit; label: string }[] = [
  { value: 'ft', label: 'Feet' },
  { value: 'in', label: 'Inches' },
  { value: 'm', label: 'Meters' },
  { value: 'cm', label: 'Centimeters' },
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

// Default form data
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
  
  // Contact info with empty strings
  contact_name: '',
  contact_email: '',
  contact_phone: '',
  
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

// Legacy default area for backward compatibility
export const defaultAreaData = (): AreaData => ({
  id: Date.now(),
  title: '',
  type: '',
  pricing: {
    daily_rate: ''
  },
  images: []
});

// Legacy types for backward compatibility with existing components
export interface AreaData {
  id: string | number;
  title: string;
  type: string;
  pricing: {
    daily_rate: string;
  };
  images: string[];
}

export interface Errors {
  [key: string]: string | null;
}

// Local storage keys
export const STORAGE_KEYS = {
  FORM_DATA: 'property_form_data',
  CURRENT_STEP: 'property_form_current_step',
  PHOTOS_CACHE: 'property_photos_cache',
} as const;