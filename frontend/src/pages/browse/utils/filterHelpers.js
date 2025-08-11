// src/pages/browse/utils/filterHelpers.js
// ✅ FIXED: Use daily ILS pricing from Kfar Kama data

import { getNumericPrice } from './areaHelpers';
import { getBusinessInsights, getTrustIndicators } from './businessInsights';
import { SPACE_TYPE_CATEGORIES, SPACE_TYPE_CATEGORIES_WALL_EXT } from './mapConstants';

/**
 * Apply price range filter to spaces
 * ✅ FIXED: Handle daily ILS pricing from Kfar Kama data
 * @param {Array} spaces - Array of spaces
 * @param {string} priceRange - Price range filter value
 * @returns {Array} Filtered spaces
 */
export const applyPriceFilter = (spaces, priceRange) => {
  if (priceRange === 'all') return spaces;
  
  return spaces.filter(space => {
    // ✅ FIXED: Use daily pricing (baseRate is daily rate in ILS)
    const dailyPrice = space.baseRate || getNumericPrice(space);
    
    switch (priceRange) {
      case 'under200': return dailyPrice <= 200;    // ₪200/day (~$53)
      case 'under350': return dailyPrice <= 350;    // ₪350/day (~$93)
      case 'under500': return dailyPrice <= 500;    // ₪500/day (~$133)
      case 'premium': return dailyPrice > 500;      // ₪500+/day
      
      // Legacy USD ranges (for backwards compatibility)
      case 'under500': return dailyPrice <= 500;
      case 'under1000': return dailyPrice <= 1000;
      case 'under2000': return dailyPrice <= 2000;
      
      default: return true;
    }
  });
};

/**
 * Apply space type filter to spaces
 * @param {Array} spaces - Array of spaces
 * @param {string} spaceType - Space type filter value
 * @returns {Array} Filtered spaces
 */
export const applySpaceTypeFilter = (spaces, spaceType) => {
  if (spaceType === 'all') return spaces;
  
  const combined = { ...SPACE_TYPE_CATEGORIES, ...SPACE_TYPE_CATEGORIES_WALL_EXT };
  return spaces.filter(space => {
    const type = space.type?.toLowerCase() || '';
    const categoryTypes = combined[spaceType];
    if (!categoryTypes) return false;
    return categoryTypes.some(categoryType =>
      type.includes(categoryType.toLowerCase()) || type === categoryType.toLowerCase()
    );
  });
};

/**
 * Apply audience filter to spaces based on features and location
 * ✅ FIXED: Handle Kfar Kama tourism context
 * @param {Array} spaces - Array of spaces
 * @param {string} audience - Audience filter value
 * @returns {Array} Filtered spaces
 */
export const applyAudienceFilter = (spaces, audience) => {
  if (audience === 'all') return spaces;
  
  return spaces.filter(space => {
    const insights = getBusinessInsights(space.property);
    const features = space.features || [];
    const spaceFeatures = Array.isArray(features) ? features : Object.keys(features);
    const demographics = insights.demographics?.toLowerCase() || '';
    
    switch (audience) {
      case 'tourists':
        return spaceFeatures.includes('tourist_area') || 
               demographics.includes('tourist') ||
               space.propertyName?.toLowerCase().includes('cultural') ||
               space.propertyName?.toLowerCase().includes('heritage');
               
      case 'locals':
        return spaceFeatures.includes('local_business') || 
               demographics.includes('local') ||
               space.type === 'storefront_window';
               
      case 'families': 
        return demographics.includes('families') || 
               demographics.includes('family') ||
               spaceFeatures.includes('family_friendly');
               
      case 'professionals': 
        return demographics.includes('professional') || 
               demographics.includes('business') ||
               space.propertyName?.toLowerCase().includes('business') ||
               space.propertyName?.toLowerCase().includes('office');
               
      case 'commuters':
        return spaceFeatures.includes('highway_visible') || 
               space.propertyName?.toLowerCase().includes('highway') ||
               space.propertyName?.toLowerCase().includes('transport') ||
               space.type === 'pole_mount';
               
      default:
        return true;
    }
  });
};

/**
 * Apply features filter to spaces
 * ✅ FIXED: Handle Kfar Kama space features
 * @param {Array} spaces - Array of spaces
 * @param {Array} features - Array of feature filter values
 * @returns {Array} Filtered spaces
 */
export const applyFeaturesFilter = (spaces, features) => {
  if (features.length === 0) return spaces;
  
  return spaces.filter(space => {
    const trust = getTrustIndicators(space.property);
    const insights = getBusinessInsights(space.property);
    const spaceFeatures = space.features || [];
    const featuresList = Array.isArray(spaceFeatures) ? spaceFeatures : Object.keys(spaceFeatures);
    const dailyPrice = space.baseRate || getNumericPrice(space);
    
    return features.every(feature => {
      switch (feature) {
        case 'verified': 
          return trust.verified || space.property?.isApproved;
          
        case 'high_traffic': 
          return insights.footTraffic > 2000 || 
                 featuresList.includes('high_traffic') ||
                 space.type === 'pole_mount'; // Billboards typically high traffic
                 
        case 'premium': 
          return dailyPrice > 350 || // ₪350+ is premium in Kfar Kama
                 featuresList.includes('premium_location') ||
                 space.type === 'pole_mount';
                 
        case 'digital': 
          return space.type?.toLowerCase().includes('digital') || 
                 featuresList.includes('digital_ready') ||
                 space.surfaceType === 'DIGITAL_MOUNT_POLE';
                 
        case 'highway_visible':
          return featuresList.includes('highway_visible') ||
                 featuresList.includes('highway_billboard') ||
                 space.type === 'pole_mount' ||
                 space.type === 'building_exterior';
                 
        case 'weather_protected':
          return featuresList.includes('weather_protected') ||
                 space.weatherExposure === 'MINIMAL' ||
                 space.type === 'storefront_window';
                 
        case 'lighting':
          return featuresList.includes('lighting') ||
                 space.lightingConditions === 'EXCELLENT' ||
                 space.lightingConditions === 'GOOD';
                 
        case 'power_available':
          return space.powerAvailable === true ||
                 featuresList.includes('power_available');
                 
        default: 
          return featuresList.includes(feature);
      }
    });
  });
};

/**
 * Get filter options with counts based on available spaces
 * @param {Array} spaces - Array of all available spaces
 * @returns {Object} Filter options with counts
 */
export const getFilterOptions = (spaces) => {
  const options = {
    priceRanges: {},
    spaceTypes: {},
    audiences: {},
    features: {}
  };
  
  spaces.forEach(space => {
    const dailyPrice = space.baseRate || getNumericPrice(space);
    const insights = getBusinessInsights(space.property);
    const trust = getTrustIndicators(space.property);
    const features = space.features || [];
    const featuresList = Array.isArray(features) ? features : Object.keys(features);
    
    // Count price ranges (ILS daily rates)
    if (dailyPrice <= 200) options.priceRanges.under200 = (options.priceRanges.under200 || 0) + 1;
    if (dailyPrice <= 350) options.priceRanges.under350 = (options.priceRanges.under350 || 0) + 1;
    if (dailyPrice <= 500) options.priceRanges.under500 = (options.priceRanges.under500 || 0) + 1;
    if (dailyPrice > 500) options.priceRanges.premium = (options.priceRanges.premium || 0) + 1;
    
    // Count space types
    const type = space.type?.toLowerCase() || '';
    Object.keys(SPACE_TYPE_CATEGORIES).forEach(category => {
      if (SPACE_TYPE_CATEGORIES[category].some(t => type.includes(t.toLowerCase()))) {
        options.spaceTypes[category] = (options.spaceTypes[category] || 0) + 1;
      }
    });
    
    // Count audiences
    const demographics = insights.demographics?.toLowerCase() || '';
    
    if (featuresList.includes('tourist_area') || demographics.includes('tourist')) {
      options.audiences.tourists = (options.audiences.tourists || 0) + 1;
    }
    if (featuresList.includes('local_business') || demographics.includes('local')) {
      options.audiences.locals = (options.audiences.locals || 0) + 1;
    }
    if (demographics.includes('families')) {
      options.audiences.families = (options.audiences.families || 0) + 1;
    }
    if (demographics.includes('professional')) {
      options.audiences.professionals = (options.audiences.professionals || 0) + 1;
    }
    if (featuresList.includes('highway_visible')) {
      options.audiences.commuters = (options.audiences.commuters || 0) + 1;
    }
    
    // Count features
    if (trust.verified || space.property?.isApproved) {
      options.features.verified = (options.features.verified || 0) + 1;
    }
    if (insights.footTraffic > 2000 || featuresList.includes('high_traffic')) {
      options.features.high_traffic = (options.features.high_traffic || 0) + 1;
    }
    if (dailyPrice > 350 || featuresList.includes('premium_location')) {
      options.features.premium = (options.features.premium || 0) + 1;
    }
    if (type.includes('digital') || featuresList.includes('digital_ready')) {
      options.features.digital = (options.features.digital || 0) + 1;
    }
    if (featuresList.includes('highway_visible')) {
      options.features.highway_visible = (options.features.highway_visible || 0) + 1;
    }
    if (space.powerAvailable) {
      options.features.power_available = (options.features.power_available || 0) + 1;
    }
  });
  
  return options;
};

/**
 * Sort spaces by specified criteria
 * @param {Array} spaces - Array of spaces to sort
 * @param {string} sortBy - Sort criteria (price, traffic, rating, etc.)
 * @param {string} order - Sort order (asc, desc)
 * @returns {Array} Sorted spaces
 */
export const sortSpaces = (spaces, sortBy = 'price', order = 'asc') => {
  return [...spaces].sort((a, b) => {
    let valueA, valueB;
    
    switch (sortBy) {
      case 'price':
        valueA = a.baseRate || getNumericPrice(a);
        valueB = b.baseRate || getNumericPrice(b);
        break;
      case 'traffic':
        valueA = getBusinessInsights(a.property).footTraffic;
        valueB = getBusinessInsights(b.property).footTraffic;
        break;
      case 'rating':
        valueA = getTrustIndicators(a.property).rating;
        valueB = getTrustIndicators(b.property).rating;
        break;
      case 'distance':
        valueA = a.distance || 0;
        valueB = b.distance || 0;
        break;
      case 'created':
        valueA = new Date(a.createdAt || 0);
        valueB = new Date(b.createdAt || 0);
        break;
      default:
        valueA = a.createdAt || new Date();
        valueB = b.createdAt || new Date();
    }
    
    if (order === 'desc') {
      return valueB - valueA;
    }
    return valueA - valueB;
  });
};

/**
 * Get quick filter suggestions based on current spaces
 * @param {Array} spaces - Array of available spaces
 * @returns {Array} Array of suggested filters
 */
export const getQuickFilters = (spaces) => {
  const suggestions = [];
  
  // Suggest based on common patterns in data
  const priceRanges = spaces.map(s => s.baseRate || getNumericPrice(s));
  const avgPrice = priceRanges.reduce((a, b) => a + b, 0) / priceRanges.length;
  
  if (avgPrice > 300) {
    suggestions.push({ type: 'price', value: 'under350', label: 'Budget Options' });
  }
  
  // Suggest based on popular space types
  const typeCount = {};
  spaces.forEach(space => {
    const type = space.type;
    typeCount[type] = (typeCount[type] || 0) + 1;
  });
  
  const popularType = Object.keys(typeCount).reduce((a, b) => typeCount[a] > typeCount[b] ? a : b);
  if (popularType) {
    suggestions.push({ type: 'spaceType', value: popularType, label: `${popularType.replace('_', ' ')} Spaces` });
  }
  
  return suggestions;
};