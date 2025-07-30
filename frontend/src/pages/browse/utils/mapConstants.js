// src/pages/browse/utils/mapConstants.js
// ✅ Constants for map and pagination configuration

// ✅ Pagination settings
export const CARDS_PER_PAGE = 12;

// ✅ Map settings
export const DEFAULT_MAP_CENTER = { lat: 33.7175, lng: -117.8311 }; // Orange, CA (your location)
export const DEFAULT_MAP_ZOOM = 10;
export const LOCATION_ZOOM = 14; // Zoom level when user centers on their location

// ✅ MVP Space type categories for filtering (matches seed data)
export const SPACE_TYPE_CATEGORIES = {
  digital: ['digital_display', 'digital_marquee', 'luxury_video_wall'],
  outdoor: ['building_exterior', 'pole_mount', 'billboard'], 
  retail: ['storefront_window', 'retail_frontage', 'mall_kiosk'],
  transit: ['bus_shelter', 'platform_display', 'transit_station'],
  indoor: ['wall_graphic', 'floor_graphic', 'lobby_display', 'other']
};

// ✅ Filter options for browse page
export const PRICE_RANGE_OPTIONS = [
  { id: 'all', label: 'Any Budget', min: 0, max: Infinity },
  { id: 'under500', label: 'Under $500/mo', min: 0, max: 500 },
  { id: 'under1000', label: 'Under $1K/mo', min: 0, max: 1000 },
  { id: 'under2000', label: 'Under $2K/mo', min: 0, max: 2000 }
];

export const SPACE_TYPE_OPTIONS = [
  { id: 'all', label: 'All Types' },
  { id: 'retail', label: 'Retail Windows' },
  { id: 'outdoor', label: 'Outdoor Walls' },
  { id: 'digital', label: 'Digital Displays' },
  { id: 'transit', label: 'Transit Areas' },
  { id: 'indoor', label: 'Indoor Spaces' }
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
  { id: 'digital', label: 'Digital Ready' }
];

// ✅ Sort options for browse page
export const SORT_OPTIONS = [
  { id: 'price_asc', label: 'Price: Low to High', sortBy: 'price', order: 'asc' },
  { id: 'price_desc', label: 'Price: High to Low', sortBy: 'price', order: 'desc' },
  { id: 'traffic_desc', label: 'Most Traffic', sortBy: 'traffic', order: 'desc' },
  { id: 'rating_desc', label: 'Highest Rated', sortBy: 'rating', order: 'desc' },
  { id: 'distance_asc', label: 'Nearest First', sortBy: 'distance', order: 'asc' }
];

// ✅ Material compatibility mapping (for future material filtering)
export const MATERIAL_COMPATIBILITY = {
  'storefront_window': ['VINYL_GRAPHICS', 'ADHESIVE_VINYL'],
  'building_exterior': ['FABRIC_BANNERS', 'MESH_BANNERS'],
  'retail_frontage': ['RIGID_SIGNS'],
  'pole_mount': ['FABRIC_BANNERS', 'RIGID_SIGNS']
};

// ✅ Default space dimensions for display
export const DEFAULT_DIMENSIONS = {
  'storefront_window': { width: 48, height: 36, unit: 'inches' },
  'building_exterior': { width: 96, height: 48, unit: 'inches' },
  'retail_frontage': { width: 24, height: 36, unit: 'inches' },
  'pole_mount': { width: 36, height: 60, unit: 'inches' }
};