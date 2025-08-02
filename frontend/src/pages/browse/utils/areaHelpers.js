// src/pages/browse/utils/areaHelpers.js
// ✅ FIXED: Handle ILS currency and daily pricing from Kfar Kama seed data
// ✅ FIXED: Removed non-existent 'Storefront' icon from lucide-react

import { 
  Building2, Monitor, Store, MapPin, Zap, Building
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
    // ✅ Kfar Kama space types from seed data
    'storefront_window': 'Storefront Window',
    'building_exterior': 'Building Exterior',
    'retail_frontage': 'Retail Frontage',
    'pole_mount': 'Billboard',
    
    // Additional types
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
 * ✅ FIXED: Handle ILS currency and daily pricing from Kfar Kama data
 * @param {Object} area - Advertising area object
 * @returns {string} Formatted price string
 */
export const getAreaPrice = (area) => {
  if (!area) return 'Price on request';
  
  // ✅ FIXED: Handle ILS currency properly
  const currency = area.currency || 'USD';
  const baseRate = area.baseRate;
  const rateType = area.rateType || 'DAILY';
  
  if (baseRate) {
    // Format currency symbol
    const formatCurrency = (amount, curr) => {
      if (curr === 'ILS') {
        return `₪${Math.round(amount)}`;
      } else if (curr === 'USD') {
        return `$${Math.round(amount)}`;
      } else if (curr === 'EUR') {
        return `€${Math.round(amount)}`;
      }
      return `${curr} ${Math.round(amount)}`;
    };
    
    // Rate type suffixes
    const suffixMap = {
      'HOURLY': '/hr',
      'DAILY': '/day', 
      'WEEKLY': '/week',
      'MONTHLY': '/month',
      'YEARLY': '/year'
    };
    
    const suffix = suffixMap[rateType.toUpperCase()] || '/day';
    return `${formatCurrency(baseRate, currency)}${suffix}`;
  }
  
  // Fallback to pricing object if available
  if (area.pricing) {
    try {
      const pricing = typeof area.pricing === 'string' ? JSON.parse(area.pricing) : area.pricing;
      
      if (pricing.daily && currency === 'ILS') {
        return `₪${Math.round(pricing.daily)}/day`;
      } else if (pricing.daily) {
        return `$${Math.round(pricing.daily)}/day`;
      }
      
      if (pricing.weekly && currency === 'ILS') {
        return `₪${Math.round(pricing.weekly)}/week`;
      } else if (pricing.weekly) {
        return `$${Math.round(pricing.weekly)}/week`;
      }
      
      if (pricing.monthly && currency === 'ILS') {
        return `₪${Math.round(pricing.monthly)}/month`;
      } else if (pricing.monthly) {
        return `$${Math.round(pricing.monthly)}/month`;
      }
    } catch (e) {
      console.warn('Error parsing area pricing:', e);
    }
  }
  
  return 'Price on request';
};

/**
 * Get numeric price for calculations (daily rate)
 * ✅ FIXED: Handle daily pricing from Kfar Kama data
 * @param {Object} area - Advertising area object
 * @returns {number} Daily price in base currency
 */
export const getNumericPrice = (area) => {
  if (!area) return 150;
  
  const baseRate = area.baseRate;
  const rateType = area.rateType || 'DAILY';
  
  if (baseRate) {
    // Convert to daily rate based on rate type
    switch (rateType.toUpperCase()) {
      case 'DAILY': return baseRate;
      case 'WEEKLY': return Math.round(baseRate / 7);
      case 'MONTHLY': return Math.round(baseRate / 30);
      case 'YEARLY': return Math.round(baseRate / 365);
      case 'HOURLY': return baseRate * 8; // Assume 8 hours per day
      default: return baseRate; // Default to base rate as daily
    }
  }
  
  // Fallback to pricing object
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
 * ✅ FIXED: Include icons for Kfar Kama space types and replace Storefront with Store
 * @param {Object} area - Advertising area object
 * @returns {React.Component} Icon component
 */
export const getAreaCategoryIcon = (area) => {
  if (!area) return Building2;
  
  const type = area.type?.toLowerCase() || '';
  
  // Icon mapping for space types
  const iconMap = {
    // Kfar Kama space types - ✅ FIXED: Replaced Storefront with Store
    'storefront_window': Store,
    'building_exterior': Building,
    'retail_frontage': Store,
    'pole_mount': Monitor,
    
    // Additional types
    'digital_display': Zap,
    'digital_marquee': Zap,
    'luxury_video_wall': Monitor,
    'billboard': Monitor,
    'wall_graphic': Building2,
    'floor_graphic': Building2,
    'window_display': Store,
    'mall_kiosk': Store,
    'building_wrap': Building,
    'elevator_display': Monitor,
    'parking_totem': Monitor,
    'platform_display': Monitor,
    'bus_shelter': Building2,
    'gallery_storefront': Store,
    'coastal_billboard': Monitor,
    'lobby_display': Monitor,
    'concourse_display': Monitor,
    'other': MapPin
  };
  
  return iconMap[type] || Building2;
};

/**
 * Get formatted dimensions string
 * @param {Object} area - Advertising area object
 * @returns {string} Formatted dimensions
 */
export const getAreaDimensions = (area) => {
  if (!area || !area.dimensions) return null;
  
  const dims = area.dimensions;
  
  if (dims.width && dims.height) {
    const unit = dims.unit || 'm';
    return `${dims.width} × ${dims.height} ${unit}`;
  }
  
  if (dims.area) {
    const unit = dims.unit || 'm';
    return `${dims.area} ${unit}²`;
  }
  
  return null;
};

/**
 * Get space features array
 * @param {Object} area - Advertising area object
 * @returns {Array} Array of feature strings
 */
export const getAreaFeatures = (area) => {
  if (!area || !area.features) return [];
  
  const features = area.features;
  
  // Handle array format
  if (Array.isArray(features)) {
    return features;
  }
  
  // Handle object format
  if (typeof features === 'object') {
    return Object.keys(features).filter(key => features[key]);
  }
  
  return [];
};

/**
 * Check if space is available
 * @param {Object} area - Advertising area object
 * @returns {boolean} Whether space is available
 */
export const isAreaAvailable = (area) => {
  if (!area) return false;
  
  return area.isActive && area.status === 'active';
};

/**
 * Get material compatibility info
 * @param {Object} area - Advertising area object
 * @returns {Array} Array of compatible material types
 */
export const getAreaMaterialCompatibility = (area) => {
  if (!area || !area.materialCompatibility) return [];
  
  return Array.isArray(area.materialCompatibility) 
    ? area.materialCompatibility 
    : [];
};

/**
 * Get installation difficulty level
 * @param {Object} area - Advertising area object
 * @returns {Object} Installation difficulty info
 */
export const getInstallationInfo = (area) => {
  if (!area) return { difficulty: 1, label: 'Easy' };
  
  const difficulty = area.accessDifficulty || 1;
  
  const labels = {
    1: 'Easy',
    2: 'Moderate', 
    3: 'Difficult',
    4: 'Expert',
    5: 'Professional Only'
  };
  
  return {
    difficulty,
    label: labels[difficulty] || 'Unknown',
    permitsRequired: area.permitsRequired || false,
    estimatedCost: area.estimatedMaterialCost || 0
  };
};

// ✅ VERIFICATION: Test icon mapping after fix
console.log('Testing area icon mapping:', {
  storefront_window: getAreaCategoryIcon({ type: 'storefront_window' }),
  retail_frontage: getAreaCategoryIcon({ type: 'retail_frontage' }),
  building_exterior: getAreaCategoryIcon({ type: 'building_exterior' })
});