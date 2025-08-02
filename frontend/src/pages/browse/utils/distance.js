// src/pages/browse/utils/distance.js
// ✅ FIXED: More robust distance calculations with better error handling

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
  // ✅ FIXED: Better validation
  if (!isValidCoordinate(lat1) || !isValidCoordinate(lng1) || 
      !isValidCoordinate(lat2) || !isValidCoordinate(lng2)) {
    return Infinity;
  }
  
  // Convert to numbers in case they're strings
  const lat1Num = parseFloat(lat1);
  const lng1Num = parseFloat(lng1);
  const lat2Num = parseFloat(lat2);
  const lng2Num = parseFloat(lng2);
  
  // Validate ranges
  if (Math.abs(lat1Num) > 90 || Math.abs(lat2Num) > 90 ||
      Math.abs(lng1Num) > 180 || Math.abs(lng2Num) > 180) {
    console.warn('Invalid coordinate ranges:', { lat1: lat1Num, lng1: lng1Num, lat2: lat2Num, lng2: lng2Num });
    return Infinity;
  }
  
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2Num - lat1Num);
  const dLng = deg2rad(lng2Num - lng1Num);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1Num)) * Math.cos(deg2rad(lat2Num)) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  
  // ✅ FIXED: Handle edge cases
  if (!isFinite(distance) || distance < 0) {
    return Infinity;
  }
  
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
  if (km === Infinity) return Infinity;
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
 * Validate if a value is a valid coordinate
 * @param {any} coord - Coordinate value to validate
 * @returns {boolean} Whether the coordinate is valid
 */
const isValidCoordinate = (coord) => {
  return coord !== null && 
         coord !== undefined && 
         coord !== '' && 
         !isNaN(parseFloat(coord)) && 
         isFinite(parseFloat(coord));
};

/**
 * Format distance for display
 * ✅ FIXED: Better formatting for Israeli/metric context
 * @param {number} distanceKm - Distance in kilometers
 * @param {boolean} useMetric - Whether to use metric system (default true for Israel)
 * @returns {string} Formatted distance string
 */
export const formatDistance = (distanceKm, useMetric = true) => {
  if (!distanceKm || distanceKm === Infinity || distanceKm < 0) {
    return 'Distance unknown';
  }
  
  if (useMetric) {
    // ✅ Metric system (Israel, Europe)
    if (distanceKm < 0.1) return 'Less than 100m';
    if (distanceKm < 1) return `${Math.round(distanceKm * 1000)}m`;
    if (distanceKm < 10) return `${Math.round(distanceKm * 10) / 10} km`;
    return `${Math.round(distanceKm)} km`;
  } else {
    // Imperial system (US)
    const miles = distanceKm * 0.621371;
    if (miles < 0.1) return 'Less than 0.1 mi';
    if (miles < 1) return `${Math.round(miles * 10) / 10} mi`;
    return `${Math.round(miles)} mi`;
  }
};

/**
 * Get distance category for filtering/sorting
 * @param {number} distanceKm - Distance in kilometers
 * @returns {string} Distance category
 */
export const getDistanceCategory = (distanceKm) => {
  if (!distanceKm || distanceKm === Infinity) return 'unknown';
  
  if (distanceKm < 1) return 'very_close';    // < 1km
  if (distanceKm < 5) return 'close';         // 1-5km
  if (distanceKm < 15) return 'nearby';       // 5-15km
  if (distanceKm < 50) return 'moderate';     // 15-50km
  return 'far';                               // 50km+
};

/**
 * Calculate bearing between two points
 * @param {number} lat1 - Latitude of first point
 * @param {number} lng1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lng2 - Longitude of second point
 * @returns {number} Bearing in degrees (0-360)
 */
export const getBearing = (lat1, lng1, lat2, lng2) => {
  if (!isValidCoordinate(lat1) || !isValidCoordinate(lng1) || 
      !isValidCoordinate(lat2) || !isValidCoordinate(lng2)) {
    return null;
  }
  
  const dLng = deg2rad(lng2 - lng1);
  const lat1Rad = deg2rad(lat1);
  const lat2Rad = deg2rad(lat2);
  
  const y = Math.sin(dLng) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - 
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
  
  const bearing = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  return Math.round(bearing);
};

/**
 * Get compass direction from bearing
 * @param {number} bearing - Bearing in degrees
 * @returns {string} Compass direction (N, NE, E, SE, S, SW, W, NW)
 */
export const getCompassDirection = (bearing) => {
  if (bearing === null || bearing === undefined) return 'Unknown';
  
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
};

/**
 * Check if a point is within a certain radius of another point
 * @param {number} lat1 - Latitude of center point
 * @param {number} lng1 - Longitude of center point
 * @param {number} lat2 - Latitude of test point
 * @param {number} lng2 - Longitude of test point
 * @param {number} radiusKm - Radius in kilometers
 * @returns {boolean} Whether the point is within the radius
 */
export const isWithinRadius = (lat1, lng1, lat2, lng2, radiusKm) => {
  const distance = getDistanceInKm(lat1, lng1, lat2, lng2);
  return distance !== Infinity && distance <= radiusKm;
};

/**
 * Find the closest point from an array of points
 * @param {number} centerLat - Latitude of center point
 * @param {number} centerLng - Longitude of center point
 * @param {Array} points - Array of points with lat/lng properties
 * @returns {Object|null} Closest point with distance property added
 */
export const findClosestPoint = (centerLat, centerLng, points) => {
  if (!points || points.length === 0) return null;
  
  let closest = null;
  let minDistance = Infinity;
  
  points.forEach(point => {
    if (!point || !point.lat || !point.lng) return;
    
    const distance = getDistanceInKm(centerLat, centerLng, point.lat, point.lng);
    if (distance < minDistance) {
      minDistance = distance;
      closest = { ...point, distance };
    }
  });
  
  return closest;
};

/**
 * Sort points by distance from a center point
 * @param {number} centerLat - Latitude of center point
 * @param {number} centerLng - Longitude of center point
 * @param {Array} points - Array of points with lat/lng properties
 * @returns {Array} Sorted array with distance property added to each point
 */
export const sortByDistance = (centerLat, centerLng, points) => {
  if (!points || points.length === 0) return [];
  
  return points
    .map(point => {
      if (!point || !point.lat || !point.lng) {
        return { ...point, distance: Infinity };
      }
      
      const distance = getDistanceInKm(centerLat, centerLng, point.lat, point.lng);
      return { ...point, distance };
    })
    .sort((a, b) => a.distance - b.distance);
};