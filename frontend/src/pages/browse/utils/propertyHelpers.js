/**
 * Extract coordinates from property object
 * @param {Object} property - Property object
 * @returns {Object|null} Coordinates object with lat/lng or null if not available
 */
export const getPropertyCoords = (property) => {
  if (property.latitude && property.longitude) {
    return { lat: property.latitude, lng: property.longitude };
  }
  return null;
};

/**
 * Format property address for display
 * @param {Object} property - Property object
 * @returns {string} Formatted address string
 */
export const getPropertyAddress = (property) => {
  if (property.address) {
    const parts = [property.address];
    if (property.city) parts.push(property.city);
    if (property.state) parts.push(property.state);
    return parts.join(', ');
  }
  if (property.city && property.state) return `${property.city}, ${property.state}`;
  return 'Address not available';
};

/**
 * Get display name for property
 * @param {Object} property - Property object
 * @returns {string} Property display name
 */
export const getPropertyName = (property) => {
  return property.title || property.name || 'Unnamed Property';
};