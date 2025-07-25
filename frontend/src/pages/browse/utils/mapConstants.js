// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Pagination
export const CARDS_PER_PAGE = 24;

// Map defaults
export const DEFAULT_MAP_CENTER = { lat: 33.7175, lng: -117.8311 }; // Orange County, CA
export const DEFAULT_MAP_ZOOM = 10;
export const LOCATION_ZOOM = 12;

// Filter options
export const PRICE_RANGE_OPTIONS = [
  { id: 'all', label: 'Any Budget' },
  { id: 'under500', label: 'Under $500/mo' },
  { id: 'under1000', label: 'Under $1K/mo' },
  { id: 'under2000', label: 'Under $2K/mo' }
];

export const SPACE_TYPE_OPTIONS = [
  { id: 'all', label: 'All Types' },
  { id: 'digital', label: 'Digital' },
  { id: 'outdoor', label: 'Outdoor' },
  { id: 'retail', label: 'Retail' },
  { id: 'transit', label: 'Transit' },
  { id: 'indoor', label: 'Indoor' }
];

export const AUDIENCE_OPTIONS = [
  { id: 'all', label: 'Everyone' },
  { id: 'families', label: 'Families' },
  { id: 'professionals', label: 'Professionals' },
  { id: 'commuters', label: 'Commuters' }
];

export const FEATURE_OPTIONS = [
  { id: 'verified', label: 'Verified Owner' },
  { id: 'high_traffic', label: 'High Traffic' },
  { id: 'premium', label: 'Premium Location' },
  { id: 'digital', label: 'Digital Display' }
];

// Space type categorization for filtering
export const SPACE_TYPE_CATEGORIES = {
  digital: ['digital_display', 'digital_marquee', 'luxury_video_wall', 'elevator_display', 'concourse_display'],
  outdoor: ['billboard', 'coastal_billboard', 'building_wrap', 'parking_totem', 'bus_shelter'],
  retail: ['mall_kiosk', 'window_display', 'gallery_storefront', 'lobby_display'],
  transit: ['platform_display', 'bus_shelter', 'parking_structure'],
  indoor: ['wall_graphic', 'floor_graphic', 'other']
};