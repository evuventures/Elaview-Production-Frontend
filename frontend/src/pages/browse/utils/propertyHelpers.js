// src/pages/browse/utils/propertyHelpers.js
// ✅ UPDATED: Handle real API data structure

/**
 * Extract coordinates from property object
 * @param {Object} property - Property object
 * @returns {Object|null} Coordinates object with lat/lng or null if not available
 */
export const getPropertyCoords = (property) => {
  if (!property) return null;
  
  // Try multiple coordinate sources
  if (property.latitude && property.longitude) {
    return { lat: property.latitude, lng: property.longitude };
  }
  
  if (property.coordinates && property.coordinates.lat && property.coordinates.lng) {
    return { lat: property.coordinates.lat, lng: property.coordinates.lng };
  }
  
  if (property.location && property.location.lat && property.location.lng) {
    return { lat: property.location.lat, lng: property.location.lng };
  }
  
  return null;
};

/**
 * Format property address for display
 * @param {Object} property - Property object
 * @returns {string} Formatted address string
 */
export const getPropertyAddress = (property) => {
  if (!property) return 'Address not available';
  
  // Handle different address formats from API
  if (property.address && property.address.trim()) {
    const parts = [property.address];
    if (property.city) parts.push(property.city);
    if (property.state) parts.push(property.state);
    return parts.join(', ');
  }
  
  // Fallback to city, state if no specific address
  if (property.city && property.state) {
    return `${property.city}, ${property.state}`;
  }
  
  if (property.city) {
    return property.city;
  }
  
  return 'Address not available';
};

/**
 * Get display name for property
 * @param {Object} property - Property object
 * @returns {string} Property display name
 */
export const getPropertyName = (property) => {
  if (!property) return 'Unnamed Property';
  
  // Try different name fields that might be present
  return property.title || property.name || property.businessName || 'Unnamed Property';
};

/**
 * Get property type for display
 * @param {Object} property - Property object
 * @returns {string} Formatted property type
 */
export const getPropertyType = (property) => {
  if (!property) return 'Property';
  
  const type = property.propertyType || property.type || 'COMMERCIAL';
  
  // Format property type for display
  const typeLabels = {
    'RETAIL': 'Retail Space',
    'OFFICE': 'Office Building', 
    'COMMERCIAL': 'Commercial Property',
    'RESTAURANT': 'Restaurant',
    'MEDICAL': 'Medical Center',
    'HOTEL': 'Hotel',
    'WAREHOUSE': 'Warehouse',
    'OTHER': 'Commercial Space'
  };
  
  return typeLabels[type] || 'Commercial Property';
};

/**
 * Check if property has required data for display
 * @param {Object} property - Property object
 * @returns {boolean} Whether property has minimum required data
 */
export const isValidProperty = (property) => {
  if (!property) return false;
  
  const hasName = property.title || property.name;
  const hasLocation = property.city || property.address;
  const hasCoords = getPropertyCoords(property) !== null;
  
  return hasName && hasLocation && hasCoords;
};

/**
 * Get property image URL
 * @param {Object} property - Property object
 * @returns {string} Property image URL or fallback
 */
export const getPropertyImage = (property) => {
  if (!property) return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop';
  
  // Try different image fields
  if (property.primary_image) return property.primary_image;
  if (property.primaryImage) return property.primaryImage;
  if (property.image) return property.image;
  
  // Try images array
  if (property.images && Array.isArray(property.images) && property.images.length > 0) {
    return property.images[0];
  }
  
  if (property.photos && Array.isArray(property.photos) && property.photos.length > 0) {
    return property.photos[0];
  }
  
  // Default fallback image
  return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop';
};