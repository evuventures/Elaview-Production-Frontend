/**
 * Generate business insights for a property (mock data for demo)
 * @param {Object} property - Property object
 * @returns {Object} Business insights data
 */
export const getBusinessInsights = (property) => {
  const insights = {
    footTraffic: Math.floor(Math.random() * 20000) + 5000,
    conversionRate: (Math.random() * 3 + 1).toFixed(1),
    avgCampaignLift: Math.floor(Math.random() * 25) + 10,
    businessTypes: ['Restaurant', 'Retail', 'Service', 'Healthcare'],
    peakHours: '8AM-10AM, 5PM-7PM',
    demographics: 'Families (45%), Young Professionals (35%), Seniors (20%)'
  };
  return insights;
};

/**
 * Generate trust indicators for a property (mock data for demo)
 * @param {Object} property - Property object
 * @returns {Object} Trust indicator data
 */
export const getTrustIndicators = (property) => {
  return {
    verified: Math.random() > 0.3,
    rating: (Math.random() * 2 + 3).toFixed(1),
    reviewCount: Math.floor(Math.random() * 50) + 5,
    responseTime: Math.floor(Math.random() * 4) + 1,
    businessesServed: Math.floor(Math.random() * 100) + 20
  };
};

/**
 * Calculate ROI projections for an advertising space
 * @param {Object} space - Advertising space object
 * @param {Function} getNumericPrice - Function to get numeric price
 * @returns {Object} ROI calculation results
 */
export const calculateROI = (space, getNumericPrice) => {
  const price = getNumericPrice(space);
  const monthlyPrice = price * 30;
  const insights = getBusinessInsights(space.property);
  
  const estimatedReach = insights.footTraffic * 0.7;
  const estimatedClicks = estimatedReach * (insights.conversionRate / 100);
  const estimatedRevenue = estimatedClicks * 25;
  const roi = ((estimatedRevenue - monthlyPrice) / monthlyPrice * 100).toFixed(0);
  
  return {
    investment: monthlyPrice,
    estimatedReach,
    estimatedClicks: Math.floor(estimatedClicks),
    estimatedRevenue: Math.floor(estimatedRevenue),
    roi
  };
};