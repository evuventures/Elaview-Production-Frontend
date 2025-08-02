// src/pages/browse/utils/businessInsights.js
// ✅ FIXED: Realistic insights for Kfar Kama, Israel context

/**
 * Generate business insights from property data
 * ✅ FIXED: Use Kfar Kama, Israel context with realistic data
 * @param {Object} property - Property object
 * @returns {Object} Business insights data
 */
export const getBusinessInsights = (property) => {
  if (!property) {
    return {
      footTraffic: 800,
      conversionRate: 2.1,
      avgCampaignLift: 18,
      businessTypes: ['Mixed Use'],
      peakHours: '9AM-5PM',
      demographics: 'General Population'
    };
  }

  // ✅ FIXED: Generate realistic insights for Kfar Kama properties
  const propertyName = property.title || property.name || '';
  const propertyType = property.propertyType || 'COMMERCIAL';
  const city = property.city || '';
  const features = property.features || {};
  
  // Base traffic by property type and location in Kfar Kama
  const insights = {
    footTraffic: calculateKfarKamaTraffic(propertyName, propertyType),
    conversionRate: calculateConversionRate(propertyName, propertyType),
    avgCampaignLift: calculateCampaignLift(propertyName, propertyType),
    businessTypes: getBusinessTypes(propertyName, propertyType),
    peakHours: getPeakHours(propertyName, propertyType),
    demographics: generateKfarKamaDemographics(propertyName, propertyType)
  };

  return insights;
};

/**
 * Calculate realistic foot traffic for Kfar Kama properties
 * @param {string} propertyName - Property name
 * @param {string} propertyType - Property type
 * @returns {number} Daily foot traffic
 */
const calculateKfarKamaTraffic = (propertyName, propertyType) => {
  const name = propertyName.toLowerCase();
  
  // ✅ Kfar Kama specific traffic patterns
  if (name.includes('cultural') || name.includes('heritage')) {
    return 1200; // Cultural center attracts tourists
  }
  if (name.includes('transport') || name.includes('bus') || name.includes('highway')) {
    return 2800; // Transport hub has high traffic
  }
  if (name.includes('gas') || name.includes('service')) {
    return 950; // Service station traffic
  }
  if (name.includes('business') || name.includes('office')) {
    return 600; // Business park traffic
  }
  if (name.includes('commercial') || name.includes('plaza')) {
    return 1400; // Commercial plaza traffic
  }
  
  // Base traffic by property type
  const baseTraffic = {
    'COMMERCIAL': 1000,
    'RETAIL': 800,
    'OFFICE': 500,
    'TRANSIT_STATION': 2500,
    'EVENT_VENUE': 600
  };
  
  return baseTraffic[propertyType] || 800;
};

/**
 * Calculate conversion rate based on property characteristics
 * @param {string} propertyName - Property name
 * @param {string} propertyType - Property type
 * @returns {number} Conversion rate percentage
 */
const calculateConversionRate = (propertyName, propertyType) => {
  const name = propertyName.toLowerCase();
  
  // Higher conversion for tourist attractions
  if (name.includes('cultural') || name.includes('heritage')) {
    return 3.2; // Tourists more likely to engage
  }
  
  // High conversion for highway/transport
  if (name.includes('highway') || name.includes('transport')) {
    return 2.8; // Highway visibility = good conversion
  }
  
  // Service stations have moderate conversion
  if (name.includes('gas') || name.includes('service')) {
    return 2.5;
  }
  
  // Base conversion rates
  const baseRates = {
    'RETAIL': 2.8,
    'COMMERCIAL': 2.3,
    'TRANSIT_STATION': 2.9,
    'OFFICE': 1.8,
    'EVENT_VENUE': 2.1
  };
  
  return baseRates[propertyType] || 2.2;
};

/**
 * Calculate campaign lift based on location and visibility
 * @param {string} propertyName - Property name
 * @param {string} propertyType - Property type
 * @returns {number} Campaign lift percentage
 */
const calculateCampaignLift = (propertyName, propertyType) => {
  const name = propertyName.toLowerCase();
  
  // Premium locations get higher lift
  if (name.includes('highway') || name.includes('767')) {
    return 32; // Highway 767 visibility
  }
  
  if (name.includes('cultural') || name.includes('heritage')) {
    return 28; // Cultural significance
  }
  
  if (name.includes('transport') || name.includes('bus')) {
    return 25; // Transport hub visibility
  }
  
  // Base lift by property type
  const baseLift = {
    'TRANSIT_STATION': 28,
    'COMMERCIAL': 22,
    'RETAIL': 20,
    'OFFICE': 15,
    'EVENT_VENUE': 18
  };
  
  return baseLift[propertyType] || 18;
};

/**
 * Get business types for the area
 * @param {string} propertyName - Property name
 * @param {string} propertyType - Property type
 * @returns {Array} Array of business types
 */
const getBusinessTypes = (propertyName, propertyType) => {
  const name = propertyName.toLowerCase();
  
  if (name.includes('cultural') || name.includes('heritage')) {
    return ['Tourism', 'Cultural Services', 'Education'];
  }
  
  if (name.includes('transport') || name.includes('bus')) {
    return ['Transportation', 'Travel Services', 'Logistics'];
  }
  
  if (name.includes('gas') || name.includes('service')) {
    return ['Automotive', 'Convenience', 'Travel Services'];
  }
  
  if (name.includes('business') || name.includes('office')) {
    return ['Professional Services', 'Technology', 'Consulting'];
  }
  
  if (name.includes('commercial') || name.includes('plaza')) {
    return ['Retail', 'Dining', 'Professional Services'];
  }
  
  return ['Mixed Use', 'Local Business'];
};

/**
 * Get peak hours based on property type
 * @param {string} propertyName - Property name
 * @param {string} propertyType - Property type
 * @returns {string} Peak hours description
 */
const getPeakHours = (propertyName, propertyType) => {
  const name = propertyName.toLowerCase();
  
  if (name.includes('transport') || name.includes('highway')) {
    return '7AM-9AM, 5PM-7PM'; // Commuter hours
  }
  
  if (name.includes('cultural') || name.includes('heritage')) {
    return '10AM-4PM'; // Tourist hours
  }
  
  if (name.includes('gas') || name.includes('service')) {
    return '6AM-8PM'; // All day service
  }
  
  if (name.includes('business') || name.includes('office')) {
    return '8AM-6PM'; // Business hours
  }
  
  return '9AM-5PM'; // Default business hours
};

/**
 * Generate demographics for Kfar Kama context
 * @param {string} propertyName - Property name
 * @param {string} propertyType - Property type
 * @returns {string} Demographics description
 */
const generateKfarKamaDemographics = (propertyName, propertyType) => {
  const name = propertyName.toLowerCase();
  
  // ✅ Kfar Kama specific demographics
  if (name.includes('cultural') || name.includes('heritage')) {
    return 'Cultural Tourists (40%), Local Residents (35%), Educational Groups (25%)';
  }
  
  if (name.includes('highway') || name.includes('767')) {
    return 'Highway Travelers (50%), Local Commuters (30%), Tourists (20%)';
  }
  
  if (name.includes('transport') || name.includes('bus')) {
    return 'Commuters (45%), Local Residents (35%), Travelers (20%)';
  }
  
  if (name.includes('gas') || name.includes('service')) {
    return 'Local Drivers (40%), Highway Travelers (35%), Tourists (25%)';
  }
  
  if (name.includes('business') || name.includes('office')) {
    return 'Business Professionals (50%), Local Workers (30%), Visitors (20%)';
  }
  
  if (name.includes('commercial') || name.includes('plaza')) {
    return 'Local Shoppers (45%), Business People (30%), Tourists (25%)';
  }
  
  // Default Kfar Kama demographics
  return 'Local Residents (50%), Circassian Community (25%), Tourists (25%)';
};

/**
 * Generate trust indicators from property data
 * ✅ FIXED: Realistic trust indicators for Israeli properties
 * @param {Object} property - Property object
 * @returns {Object} Trust indicator data
 */
export const getTrustIndicators = (property) => {
  if (!property) {
    return {
      verified: false,
      rating: 3.8,
      reviewCount: 12,
      responseTime: 2,
      businessesServed: 15
    };
  }

  const propertyName = property.title || property.name || '';
  const features = property.features || {};
  const isApproved = property.isApproved || false;
  
  // Generate realistic trust indicators
  const baseRating = isApproved ? 4.2 : 3.6;
  const ratingVariation = (Math.random() - 0.5) * 0.6; // ±0.3 variation
  const rating = Math.max(3.0, Math.min(5.0, baseRating + ratingVariation));
  
  return {
    verified: isApproved || features.verifiedBusiness || false,
    rating: Math.round(rating * 10) / 10, // Round to 1 decimal
    reviewCount: Math.floor(rating * 8 + Math.random() * 10), // More reviews for higher ratings
    responseTime: isApproved ? 1 : Math.floor(Math.random() * 3) + 1, // Hours
    businessesServed: Math.floor(rating * 10 + Math.random() * 20) // More businesses for higher ratings
  };
};

/**
 * Calculate ROI projections for advertising space
 * ✅ FIXED: Use ILS currency and Israeli market rates
 * @param {Object} space - Advertising space object
 * @param {Function} getNumericPrice - Function to get numeric price
 * @returns {Object} ROI calculation results
 */
export const calculateROI = (space, getNumericPrice) => {
  const dailyPrice = getNumericPrice(space);
  const monthlyPrice = dailyPrice * 30;
  const insights = getBusinessInsights(space.property);
  
  // ✅ Use realistic Israeli market conversion values
  const estimatedReach = insights.footTraffic * 0.75 * 30; // Monthly reach (75% visibility rate)
  const estimatedClicks = estimatedReach * (insights.conversionRate / 100);
  const conversionValue = getConversionValue(space);
  const estimatedRevenue = estimatedClicks * conversionValue;
  const roi = ((estimatedRevenue - monthlyPrice) / monthlyPrice * 100).toFixed(0);
  
  return {
    investment: monthlyPrice,
    estimatedReach: Math.floor(estimatedReach),
    estimatedClicks: Math.floor(estimatedClicks),
    estimatedRevenue: Math.floor(estimatedRevenue),
    roi: Math.max(-50, roi), // Cap minimum at -50%
    currency: space.currency || 'ILS'
  };
};

/**
 * Get estimated conversion value for Israeli market
 * @param {Object} space - Advertising space object
 * @returns {number} Estimated value per conversion in ILS
 */
const getConversionValue = (space) => {
  const spaceType = space.type || '';
  const propertyName = space.propertyName?.toLowerCase() || '';
  
  // ✅ Israeli market conversion values (in ILS)
  const baseValues = {
    'storefront_window': 120,      // ₪120 (~$32) - High-intent window shoppers
    'building_exterior': 85,       // ₪85 (~$23) - General brand awareness
    'retail_frontage': 100,        // ₪100 (~$27) - Retail foot traffic
    'pole_mount': 75,              // ₪75 (~$20) - Highway visibility
    'other': 90
  };
  
  let baseValue = baseValues[spaceType] || 90;
  
  // Premium locations get higher conversion values
  if (propertyName.includes('highway') || propertyName.includes('767')) {
    baseValue = Math.floor(baseValue * 1.4); // Highway visibility premium
  } else if (propertyName.includes('cultural') || propertyName.includes('heritage')) {
    baseValue = Math.floor(baseValue * 1.3); // Tourist attraction premium
  } else if (propertyName.includes('transport')) {
    baseValue = Math.floor(baseValue * 1.2); // Transport hub premium
  }
  
  return baseValue;
};

/**
 * Get performance metrics summary
 * @param {Object} space - Advertising space object
 * @returns {Object} Performance metrics
 */
export const getPerformanceMetrics = (space) => {
  const insights = getBusinessInsights(space.property);
  const trust = getTrustIndicators(space.property);
  
  return {
    visibility: calculateVisibility(space),
    engagement: calculateEngagement(insights),
    trustScore: Math.round(trust.rating * 20), // Convert 5-star to 100-point scale
    trafficScore: Math.min(100, Math.round(insights.footTraffic / 30)) // Scale to 100
  };
};

/**
 * Calculate visibility score
 * @param {Object} space - Advertising space object
 * @returns {number} Visibility score out of 100
 */
const calculateVisibility = (space) => {
  const type = space.type || '';
  const propertyName = space.propertyName?.toLowerCase() || '';
  
  let score = {
    'pole_mount': 95,
    'building_exterior': 85,
    'storefront_window': 75,
    'retail_frontage': 70
  }[type] || 60;
  
  // Boost for highway locations
  if (propertyName.includes('highway') || propertyName.includes('767')) {
    score = Math.min(100, score + 10);
  }
  
  return score;
};

/**
 * Calculate engagement score
 * @param {Object} insights - Business insights object
 * @returns {number} Engagement score out of 100
 */
const calculateEngagement = (insights) => {
  const trafficScore = Math.min(50, insights.footTraffic / 60); // Max 50 points for traffic
  const conversionScore = insights.conversionRate * 10; // Max ~30 points for conversion
  const liftScore = Math.min(20, insights.avgCampaignLift / 2); // Max 20 points for lift
  
  return Math.round(trafficScore + conversionScore + liftScore);
};