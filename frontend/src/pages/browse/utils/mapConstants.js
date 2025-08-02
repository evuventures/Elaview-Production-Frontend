// src/pages/browse/utils/mapConstants.js
// ✅ FIXED: Updated for Kfar Kama, Israel and proper filter categories

// ✅ Pagination settings
export const CARDS_PER_PAGE = 12;

// ✅ Map settings - FIXED for Kfar Kama, Israel
export const DEFAULT_MAP_CENTER = { lat: 32.721105, lng: 35.442834 }; // Kfar Kama, Israel
export const DEFAULT_MAP_ZOOM = 12; // Better zoom for small town
export const LOCATION_ZOOM = 15; // Zoom level when user centers on their location

// Alternative map centers for different regions
export const MAP_CENTERS = {
  israel: { lat: 31.7683, lng: 35.2137 }, // Israel center
  kfarKama: { lat: 32.721105, lng: 35.442834 }, // Kfar Kama
  california: { lat: 33.7175, lng: -117.8311 }, // Orange, CA
  galilee: { lat: 32.8, lng: 35.5 } // Galilee region
};

// ✅ FIXED: Space type categories matching Kfar Kama seed data
export const SPACE_TYPE_CATEGORIES = {
  retail: ['storefront_window', 'retail_frontage', 'window_display', 'mall_kiosk'],
  outdoor: ['building_exterior', 'pole_mount', 'billboard', 'building_wrap'],
  digital: ['digital_display', 'digital_marquee', 'luxury_video_wall', 'led_display'],
  transit: ['bus_shelter', 'platform_display', 'transit_station', 'parking_totem'],
  indoor: ['wall_graphic', 'floor_graphic', 'lobby_display', 'elevator_display', 'other']
};

// ✅ FIXED: Price ranges for ILS currency (Kfar Kama pricing)
export const PRICE_RANGE_OPTIONS = [
  { id: 'all', label: 'Any Budget', min: 0, max: Infinity },
  { id: 'under200', label: 'Under ₪200/day', min: 0, max: 200 },
  { id: 'under350', label: 'Under ₪350/day', min: 0, max: 350 },
  { id: 'under500', label: 'Under ₪500/day', min: 0, max: 500 },
  { id: 'premium', label: '₪500+/day', min: 500, max: Infinity }
];

// Alternative USD pricing for US markets
export const USD_PRICE_RANGE_OPTIONS = [
  { id: 'all', label: 'Any Budget', min: 0, max: Infinity },
  { id: 'under500', label: 'Under $500/mo', min: 0, max: 500 },
  { id: 'under1000', label: 'Under $1K/mo', min: 0, max: 1000 },
  { id: 'under2000', label: 'Under $2K/mo', min: 0, max: 2000 }
];

// ✅ Space type options for filtering
export const SPACE_TYPE_OPTIONS = [
  { id: 'all', label: 'All Types' },
  { id: 'retail', label: 'Retail Windows' },
  { id: 'outdoor', label: 'Outdoor Displays' },
  { id: 'digital', label: 'Digital Displays' },
  { id: 'transit', label: 'Transit Areas' },
  { id: 'indoor', label: 'Indoor Spaces' }
];

// ✅ FIXED: Audience options for Kfar Kama context
export const AUDIENCE_OPTIONS = [
  { id: 'all', label: 'Everyone' },
  { id: 'tourists', label: 'Tourists' },
  { id: 'locals', label: 'Local Residents' },
  { id: 'families', label: 'Families' },
  { id: 'professionals', label: 'Business People' },
  { id: 'commuters', label: 'Highway Travelers' }
];

// ✅ Feature options for filtering
export const FEATURE_OPTIONS = [
  { id: 'verified', label: 'Verified Owner' },
  { id: 'high_traffic', label: 'High Traffic' },
  { id: 'premium', label: 'Premium Location' },
  { id: 'digital', label: 'Digital Ready' },
  { id: 'highway_visible', label: 'Highway Visible' },
  { id: 'weather_protected', label: 'Weather Protected' },
  { id: 'lighting', label: 'Good Lighting' },
  { id: 'power_available', label: 'Power Available' }
];

// ✅ Sort options for browse page
export const SORT_OPTIONS = [
  { id: 'price_asc', label: 'Price: Low to High', sortBy: 'price', order: 'asc' },
  { id: 'price_desc', label: 'Price: High to Low', sortBy: 'price', order: 'desc' },
  { id: 'traffic_desc', label: 'Most Traffic', sortBy: 'traffic', order: 'desc' },
  { id: 'rating_desc', label: 'Highest Rated', sortBy: 'rating', order: 'desc' },
  { id: 'distance_asc', label: 'Nearest First', sortBy: 'distance', order: 'asc' },
  { id: 'newest', label: 'Newest First', sortBy: 'created', order: 'desc' }
];

// ✅ FIXED: Material compatibility for Kfar Kama space types
export const MATERIAL_COMPATIBILITY = {
  'storefront_window': ['VINYL_GRAPHICS', 'PERFORATED_VINYL', 'DIGITAL_DISPLAYS'],
  'building_exterior': ['MESH_BANNERS', 'RIGID_SIGNS', 'VINYL_GRAPHICS'],
  'retail_frontage': ['PERFORATED_VINYL', 'VINYL_GRAPHICS', 'ADHESIVE_VINYL'],
  'pole_mount': ['DIGITAL_DISPLAYS', 'LED_PANELS', 'RIGID_SIGNS'],
  'window_display': ['VINYL_GRAPHICS', 'ADHESIVE_VINYL'],
  'digital_display': ['LED_PANELS', 'DIGITAL_DISPLAYS'],
  'other': ['VINYL_GRAPHICS', 'RIGID_SIGNS']
};

// ✅ FIXED: Dimensions for Kfar Kama space types (metric system)
export const DEFAULT_DIMENSIONS = {
  'storefront_window': { width: 4, height: 2.5, unit: 'meters' },
  'building_exterior': { width: 4, height: 2.5, unit: 'meters' },
  'retail_frontage': { width: 4, height: 2.5, unit: 'meters' },
  'pole_mount': { width: 6, height: 3, unit: 'meters' },
  'digital_display': { width: 3, height: 2, unit: 'meters' },
  'other': { width: 2, height: 1.5, unit: 'meters' }
};

// ✅ Currency symbols
export const CURRENCY_SYMBOLS = {
  'ILS': '₪',
  'USD': '$',
  'EUR': '€',
  'GBP': '£'
};

// ✅ Map marker colors
export const MARKER_COLORS = {
  space: '#0f766e', // teal-700
  property: '#059669', // emerald-600  
  userLocation: '#3b82f6', // blue-500
  selected: '#dc2626' // red-600
};

// ✅ Feature icons mapping
export const FEATURE_ICONS = {
  'high_traffic': '👥',
  'weather_protected': '🏠',
  'lighting': '💡',
  'digital_ready': '📱',
  'highway_visible': '🛣️',
  'premium_location': '⭐',
  'durable': '💪',
  'large_format': '📏',
  'power_available': '⚡'
};

// ✅ Installation difficulty levels
export const DIFFICULTY_LEVELS = {
  1: { label: 'Easy', color: 'green', description: 'Basic tools, 1-2 hours' },
  2: { label: 'Moderate', color: 'yellow', description: 'Some experience needed, 2-4 hours' },
  3: { label: 'Difficult', color: 'orange', description: 'Professional recommended, 4-8 hours' },
  4: { label: 'Expert', color: 'red', description: 'Expert required, full day' },
  5: { label: 'Professional Only', color: 'red', description: 'Professional installation required' }
};

// ✅ Weather exposure levels
export const WEATHER_EXPOSURE = {
  'MINIMAL': { label: 'Protected', color: 'green' },
  'MODERATE': { label: 'Some Exposure', color: 'yellow' },
  'HIGH': { label: 'High Exposure', color: 'orange' },
  'EXTREME': { label: 'Extreme Exposure', color: 'red' }
};

// ✅ Surface conditions
export const SURFACE_CONDITIONS = {
  'EXCELLENT': { label: 'Excellent', color: 'green' },
  'GOOD': { label: 'Good', color: 'blue' },
  'FAIR': { label: 'Fair', color: 'yellow' },
  'POOR': { label: 'Poor', color: 'orange' },
  'NEEDS_PREP': { label: 'Needs Preparation', color: 'red' }
};