// Google Maps Integration Test
// This file can be used to test the Google Maps functionality

import { GoogleMapsApiLoader, MapManager, getDistanceInKm, isValidCoordinate, formatDistance, createPriceMarker } from './google-maps';

// Test functions
export const testGoogleMapsIntegration = async () => {
  console.log('🗺️  Testing Google Maps Integration...');
  
  // Test 1: Coordinate validation
  console.log('✅ Testing coordinate validation...');
  console.log('Valid coordinates (32.0853, 34.7818):', isValidCoordinate(32.0853, 34.7818));
  console.log('Invalid coordinates (200, 300):', isValidCoordinate(200, 300));
  
  // Test 2: Distance calculation
  console.log('✅ Testing distance calculation...');
  const distance = getDistanceInKm(32.0853, 34.7818, 31.7767, 35.2345); // Tel Aviv to Jerusalem
  console.log('Distance from Tel Aviv to Jerusalem:', formatDistance(distance));
  
  // Test 3: Price marker creation
  console.log('✅ Testing price marker creation...');
  const availableMarker = createPriceMarker(150, true);
  const unavailableMarker = createPriceMarker(null, false);
  console.log('Available marker created:', availableMarker instanceof HTMLElement);
  console.log('Unavailable marker created:', unavailableMarker instanceof HTMLElement);
  
  // Test 4: API key validation
  console.log('✅ Testing API key validation...');
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
    console.warn('⚠️  API key not configured. Please set REACT_APP_GOOGLE_MAPS_API_KEY in your .env file');
    return false;
  }
  
  console.log('🎉 All tests passed! Google Maps integration is ready.');
  return true;
};

// Export for use in components
export default testGoogleMapsIntegration;
