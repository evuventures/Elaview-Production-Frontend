// src/pages/browse/utils/areaHelpers.js
// ✅ UPDATED: Handle real data structure with monthly pricing

import { 
  Building2, Camera, Zap, Eye, Navigation, Monitor, 
  Zap as Lightning 
} from "lucide-react";

/**
 * Get display name for advertising area
 * @param {Object} area - Advertising area object
 * @returns {string} Area display name
 */
export const getAreaName = (area) => {
  if (!area) return 'Unnamed Advertising Area';
  return area.name || area.title || 'Unnamed Advertising Area';
};

/**
 * Get formatted type label for advertising area
 * @param {Object} area - Advertising area object
 * @returns {string} Formatted type label
 */
export const getAreaType = (area) => {
  if (!area) return 'Advertising Area';
  
  const type = area.type;
  const typeLabels = {
    // ✅ MVP types from seed data
    'storefront_window': 'Storefront Window',
    'building_exterior': 'Building Exterior',
    'retail_frontage': 'Retail Frontage',
    'pole_mount': 'Pole-Mounted Display',
    
    // Legacy types (in case they exist)
    'billboard': 'Billboard',
    'digital_display': 'Digital Display',
    'digital_marquee': 'Digital Marquee', 
    'luxury_video_wall': 'Luxury Video Wall',
    'wall_graphic': 'Wall Graphic',
    'floor_graphic': 'Floor Graphic',
    'window_display': 'Window Display',
    'mall_kiosk': 'Mall Kiosk',
    'building_wrap': 'Building Wrap',
    'elevator_display': 'Elevator Display',
    'parking_totem': 'Parking Totem',
    'platform_display': 'Platform Display',
    'bus_shelter': 'Bus Shelter',
    'gallery_storefront': 'Gallery Storefront',
    'coastal_billboard': 'Coastal Billboard',
    'lobby_display': 'Lobby Display',
    'concourse_display': 'Concourse Display',
    'other': 'Other'
  };
  
  return typeLabels[type] || (type ? type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ') : 'Advertising Area');
};

/**
 * Get formatted price string for advertising area
 * @param {Object} area - Advertising area object
 * @returns {string} Formatted price string
 */
export const getAreaPrice = (area) => {
  if (!area) return 'Price on request';
  
  // ✅ FIXED: Handle monthly rates from seed data
  if (area.baseRate) {
    const rateType = area.rateType || 'MONTHLY';
    
    // ✅ FIXED: Proper rate type mapping
    const rateTypeMap = {
      'DAILY': 'day',
      'WEEKLY': 'week', 
      'MONTHLY': 'month',
      'YEARLY': 'year'
    };
    
    const suffix = rateTypeMap[rateType.toUpperCase()] || 'month';
    return `$${area.baseRate}/${suffix}`;
  }
  
  if (area.pricing) {
    try {
      const pricing = typeof area.pricing === 'string' ? JSON.parse(area.pricing) : area.pricing;
      if (pricing.daily) return `$${pricing.daily}/day`;
      if (pricing.weekly) return `$${pricing.weekly}/week`;
      if (pricing.monthly) return `$${pricing.monthly}/month`;
    } catch (e) {
      console.warn('Error parsing area pricing:', e);
    }
  }
  
  return 'Price on request';
};

/**
 * Get numeric price for calculations (daily rate)
 * @param {Object} area - Advertising area object
 * @returns {number} Daily price in dollars
 */
export const getNumericPrice = (area) => {
  if (!area) return 150;
  
  // ✅ FIXED: Handle monthly rates from seed data
  if (area.baseRate) {
    const rateType = area.rateType || 'MONTHLY';
    
    // Convert to daily rate based on rate type
    switch (rateType.toUpperCase()) {
      case 'DAILY': return area.baseRate;
      case 'WEEKLY': return Math.round(area.baseRate / 7);
      case 'MONTHLY': return Math.round(area.baseRate / 30);
      case 'YEARLY': return Math.round(area.baseRate / 365);
      default: return Math.round(area.baseRate / 30); // Default to monthly
    }
  }
  
  if (area.pricing) {
    try {
      const pricing = typeof area.pricing === 'string' ? JSON.parse(area.pricing) : area.pricing;
      if (pricing.daily) return pricing.daily;
      if (pricing.weekly) return Math.round(pricing.weekly / 7);
      if (pricing.monthly) return Math.round(pricing.monthly / 30);
    } catch (e) {
      console.warn('Error parsing area pricing:', e);
    }
  }
  
  return 150; // Default fallback price
};

/**
 * Get appropriate icon component for advertising area category
 * @param {Object} area - Advertising area object
 * @returns {React.Component} Icon component
 */
export const getAreaCategoryIcon = (area) => {
  if (!area) return Building2;
  
  const type = area.type?.toLowerCase() || '';
  
  // ✅ Updated for MVP space types
  const categories = {
    digital: { 
      icon: Lightning, 
      types: ['digital_display', 'digital_marquee', 'luxury_video_wall', 'elevator_display', 'concourse_display'] 
    },
    outdoor: { 
      icon: Eye, 
      types: ['billboard', 'coastal_billboard', 'building_wrap', 'parking_totem', 'bus_shelter', 'building_exterior', 'pole_mount'] 
    },
    retail: { 
      icon: Building2, 
      types: ['mall_kiosk', 'window_display', 'gallery_storefront', 'lobby_display', 'storefront_window', 'retail_frontage'] 
    },
    transit: { 
      icon: Navigation, 
      types: ['platform_display', 'bus_shelter', 'parking_structure'] 
    },
    indoor: { 
      icon: Monitor, 
      types: ['wall_graphic', 'floor_graphic', 'other'] 
    }
  };
  
  for (const [key, category] of Object.entries(categories)) {
    if (category.types.some(t => type.includes(t))) {
      return category.icon;
    }
  }
  
  return Building2; // Default fallback icon
};