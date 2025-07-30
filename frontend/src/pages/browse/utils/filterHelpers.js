// src/pages/browse/utils/filterHelpers.js
// ✅ UPDATED: Use real data instead of mock business insights

import { getNumericPrice } from './areaHelpers';
import { getBusinessInsights, getTrustIndicators } from './businessInsights';
import { SPACE_TYPE_CATEGORIES } from './mapConstants'; // ✅ FIXED: Import from mapConstants

/**
 * Apply price range filter to spaces
 * @param {Array} spaces - Array of spaces
 * @param {string} priceRange - Price range filter value
 * @returns {Array} Filtered spaces
 */
export const applyPriceFilter = (spaces, priceRange) => {
  if (priceRange === 'all') return spaces;
  
  return spaces.filter(space => {
    // ✅ Use monthly pricing since that's how seed data is structured
    const monthlyPrice = space.baseRate || getNumericPrice(space) * 30;
    
    switch (priceRange) {
      case 'under500': return monthlyPrice <= 500;
      case 'under1000': return monthlyPrice <= 1000;
      case 'under2000': return monthlyPrice <= 2000;
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
  
  return spaces.filter(space => {
    const type = space.type?.toLowerCase() || '';
    return SPACE_TYPE_CATEGORIES[spaceType]?.some(t => type.includes(t)) || false;
  });
};

/**
 * Apply audience filter to spaces based on real property demographics
 * @param {Array} spaces - Array of spaces
 * @param {string} audience - Audience filter value
 * @returns {Array} Filtered spaces
 */
export const applyAudienceFilter = (spaces, audience) => {
  if (audience === 'all') return spaces;
  
  return spaces.filter(space => {
    const insights = getBusinessInsights(space.property);
    const demographics = insights.demographics.toLowerCase();
    
    // ✅ Match based on real demographics data from seed
    const audienceMatch = {
      'families': demographics.includes('families') || demographics.includes('family'),
      'professionals': demographics.includes('professional') || demographics.includes('business'),
      'commuters': demographics.includes('commuters') || space.property?.propertyType === 'TRANSIT_STATION'
    };
    
    return audienceMatch[audience] || false;
  });
};

/**
 * Apply features filter to spaces based on real property data
 * @param {Array} spaces - Array of spaces
 * @param {Array} features - Array of feature filter values
 * @returns {Array} Filtered spaces
 */
export const applyFeaturesFilter = (spaces, features) => {
  if (features.length === 0) return spaces;
  
  return spaces.filter(space => {
    const trust = getTrustIndicators(space.property);
    const insights = getBusinessInsights(space.property);
    const spaceFeatures = space.property?.features || {};
    
    return features.every(feature => {
      switch (feature) {
        case 'verified': 
          return trust.verified || spaceFeatures.verifiedBusiness;
        case 'high_traffic': 
          return insights.footTraffic > 2000; // High traffic threshold
        case 'premium': 
          return spaceFeatures.isPremiumLocation || (space.baseRate || 0) > 800;
        case 'digital': 
          return space.type?.toLowerCase().includes('digital') || 
                 space.type?.toLowerCase().includes('led');
        default: 
          return true;
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
    const monthlyPrice = space.baseRate || getNumericPrice(space) * 30;
    const insights = getBusinessInsights(space.property);
    const trust = getTrustIndicators(space.property);
    const demographics = insights.demographics.toLowerCase();
    const spaceFeatures = space.property?.features || {};
    
    // Count price ranges
    if (monthlyPrice <= 500) options.priceRanges.under500 = (options.priceRanges.under500 || 0) + 1;
    if (monthlyPrice <= 1000) options.priceRanges.under1000 = (options.priceRanges.under1000 || 0) + 1;
    if (monthlyPrice <= 2000) options.priceRanges.under2000 = (options.priceRanges.under2000 || 0) + 1;
    
    // Count space types
    const type = space.type?.toLowerCase() || '';
    Object.keys(SPACE_TYPE_CATEGORIES).forEach(category => {
      if (SPACE_TYPE_CATEGORIES[category].some(t => type.includes(t))) {
        options.spaceTypes[category] = (options.spaceTypes[category] || 0) + 1;
      }
    });
    
    // Count audiences based on demographics
    if (demographics.includes('families')) {
      options.audiences.families = (options.audiences.families || 0) + 1;
    }
    if (demographics.includes('professional')) {
      options.audiences.professionals = (options.audiences.professionals || 0) + 1;
    }
    if (demographics.includes('commuters')) {
      options.audiences.commuters = (options.audiences.commuters || 0) + 1;
    }
    
    // Count features
    if (trust.verified || spaceFeatures.verifiedBusiness) {
      options.features.verified = (options.features.verified || 0) + 1;
    }
    if (insights.footTraffic > 2000) {
      options.features.high_traffic = (options.features.high_traffic || 0) + 1;
    }
    if (spaceFeatures.isPremiumLocation || (space.baseRate || 0) > 800) {
      options.features.premium = (options.features.premium || 0) + 1;
    }
    if (type.includes('digital')) {
      options.features.digital = (options.features.digital || 0) + 1;
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
        valueA = a.baseRate || getNumericPrice(a) * 30;
        valueB = b.baseRate || getNumericPrice(b) * 30;
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