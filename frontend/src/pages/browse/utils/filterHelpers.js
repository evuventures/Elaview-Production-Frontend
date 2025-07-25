import { SPACE_TYPE_CATEGORIES } from './mapConstants'; // ✅ FIXED: same folder
import { getNumericPrice } from './areaHelpers';
import { getBusinessInsights, getTrustIndicators } from './businessInsights';

/**
 * Apply price range filter to spaces
 * @param {Array} spaces - Array of spaces
 * @param {string} priceRange - Price range filter value
 * @returns {Array} Filtered spaces
 */
export const applyPriceFilter = (spaces, priceRange) => {
  if (priceRange === 'all') return spaces;
  
  return spaces.filter(space => {
    const price = getNumericPrice(space);
    switch (priceRange) {
      case 'under500': return price <= 500/30;
      case 'under1000': return price <= 1000/30;
      case 'under2000': return price <= 2000/30;
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
 * Apply audience filter to spaces
 * @param {Array} spaces - Array of spaces
 * @param {string} audience - Audience filter value
 * @returns {Array} Filtered spaces
 */
export const applyAudienceFilter = (spaces, audience) => {
  if (audience === 'all') return spaces;
  
  return spaces.filter(space => {
    const insights = getBusinessInsights(space.property);
    const audienceMatch = {
      'families': insights.demographics.includes('Families'),
      'professionals': insights.demographics.includes('Professional'),
      'commuters': space.property.propertyType === 'transit' || space.property.city === 'Fullerton'
    };
    return audienceMatch[audience] || true;
  });
};

/**
 * Apply features filter to spaces
 * @param {Array} spaces - Array of spaces
 * @param {Array} features - Array of feature filter values
 * @returns {Array} Filtered spaces
 */
export const applyFeaturesFilter = (spaces, features) => {
  if (features.length === 0) return spaces;
  
  return spaces.filter(space => {
    const trust = getTrustIndicators(space.property);
    const insights = getBusinessInsights(space.property);
    
    return features.every(feature => {
      switch (feature) {
        case 'verified': return trust.verified;
        case 'high_traffic': return insights.footTraffic > 15000;
        case 'premium': return getNumericPrice(space) > 300;
        case 'digital': return space.type?.toLowerCase().includes('digital');
        default: return true;
      }
    });
  });
};