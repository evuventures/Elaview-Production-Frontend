// src/pages/browse/utils/distance.js
// ✅ Utility function to calculate distance between two coordinates

/**
 * Calculate the great circle distance between two points on earth
 * using the Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lng1 - Longitude of first point  
 * @param {number} lat2 - Latitude of second point
 * @param {number} lng2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const getDistanceInKm = (lat1, lng1, lat2, lng2) => {
  if (!lat1 || !lng1 || !lat2 || !lng2) return Infinity;
  
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLng = deg2rad(lng2 - lng1);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

/**
 * Calculate distance in miles
 * @param {number} lat1 - Latitude of first point
 * @param {number} lng1 - Longitude of first point  
 * @param {number} lat2 - Latitude of second point
 * @param {number} lng2 - Longitude of second point
 * @returns {number} Distance in miles
 */
export const getDistanceInMiles = (lat1, lng1, lat2, lng2) => {
  const km = getDistanceInKm(lat1, lng1, lat2, lng2);
  return Math.round(km * 0.621371 * 100) / 100; // Convert km to miles
};

/**
 * Convert degrees to radians
 * @param {number} deg - Degrees
 * @returns {number} Radians
 */
const deg2rad = (deg) => {
  return deg * (Math.PI/180);
};

/**
 * Format distance for display
 * @param {number} distanceKm - Distance in kilometers
 * @param {boolean} useImperial - Whether to use miles instead of km
 * @returns {string} Formatted distance string
 */
export const formatDistance = (distanceKm, useImperial = true) => {
  if (!distanceKm || distanceKm === Infinity) return 'Distance unknown';
  
  if (useImperial) {
    const miles = distanceKm * 0.621371;
    if (miles < 0.1) return 'Less than 0.1 mi';
    if (miles < 1) return `${Math.round(miles * 10) / 10} mi`;
    return `${Math.round(miles)} mi`;
  } else {
    if (distanceKm < 0.1) return 'Less than 0.1 km';
    if (distanceKm < 1) return `${Math.round(distanceKm * 10) / 10} km`;
    return `${Math.round(distanceKm)} km`;
  }
};