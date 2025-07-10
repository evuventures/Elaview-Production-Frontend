# Google Maps Integration Setup

## Overview
This project has been updated to use Google Maps instead of Leaflet. The implementation includes:

1. **Google Maps TypeScript wrapper** (`src/lib/google-maps.ts`)
2. **React Google Maps component** (`src/components/map/GoogleMap.jsx`)
3. **Updated map page** (`src/pages/map.jsx`)

## Setup Instructions

### 1. Get Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API (optional, for enhanced features)
   - Geocoding API (optional, for address lookups)
4. Create credentials (API key)
5. Configure API key restrictions (recommended for security)

### 2. Configure Environment Variables
1. Copy `.env.example` to `.env`
2. Add your Google Maps API key:
   ```
   REACT_APP_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

### 3. Optional: Create Custom Map Style
1. Go to [Google Cloud Console > Maps > Map Management](https://console.cloud.google.com/google/maps-apis/studio/maps)
2. Create a new map style
3. Get the Map ID and update the `mapId` in the GoogleMap component

## Features

### Current Features
- ✅ Interactive Google Maps with custom markers
- ✅ Property markers with price display
- ✅ User location detection and display
- ✅ Property details popup on marker click
- ✅ Directions to properties via Google Maps
- ✅ Distance calculation from user location
- ✅ Responsive design
- ✅ Loading states and error handling

### Advanced Features (Available in TypeScript Module)
- ✅ Custom marker elements
- ✅ Info windows
- ✅ Circles and overlays
- ✅ Click event handling
- ✅ Map pan and zoom controls
- ✅ Marker clustering (can be implemented)

## Files Changed

### New Files
- `src/lib/google-maps.ts` - Google Maps TypeScript wrapper
- `src/components/map/GoogleMap.jsx` - React component
- `GOOGLE_MAPS_SETUP.md` - This file

### Modified Files
- `src/pages/map.jsx` - Updated to use Google Maps
- `.env.example` - Added Google Maps API key template
- `package.json` - Removed Leaflet dependencies

### Backup Files
- `src/pages/map.jsx.bak` - Original Leaflet implementation

## Usage Examples

### Basic Usage
```jsx
import GoogleMap from '@/components/map/GoogleMap';

<GoogleMap
  properties={properties}
  onPropertyClick={handlePropertyClick}
  center={{ lat: 32.0853, lng: 34.7818 }}
  zoom={12}
  userLocation={userLocation}
  className="h-full"
/>
```

### Advanced Usage with Custom Markers
```javascript
import { GoogleMapsApiLoader, MapManager } from '@/lib/google-maps';

const mapManager = new MapManager();
await GoogleMapsApiLoader.load(apiKey);
const map = await mapManager.createMap(element, options);

// Add custom markers
const marker = mapManager.addMarker({
  position: { lat: 32.0853, lng: 34.7818 },
  title: 'Property Name'
});

// Add info window
mapManager.addInfoWindow(marker, '<h3>Property Details</h3>');
```

## Troubleshooting

### Common Issues
1. **API Key not working**: Make sure the API key is correctly set in `.env` and the Maps JavaScript API is enabled
2. **Markers not showing**: Check that properties have valid latitude/longitude values
3. **TypeScript errors**: Ensure `@types/google.maps` is installed
4. **Map not loading**: Check browser console for errors and verify API key restrictions

### Browser Support
- Chrome: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Edge: ✅ Full support

### Performance Tips
- Use marker clustering for large numbers of properties
- Implement lazy loading for property details
- Optimize API calls with request batching

## Migration Notes

### From Leaflet to Google Maps
- All Leaflet dependencies have been removed
- Map center coordinates remain the same format
- Property marker functionality is preserved
- User location features are enhanced
- Directions integration is improved

### Breaking Changes
- Leaflet-specific imports removed
- Map tiles no longer needed (Google handles this)
- Custom icon creation syntax changed
- Event handling syntax updated

## Support

For issues with Google Maps integration:
1. Check the browser console for errors
2. Verify API key permissions
3. Review Google Maps API documentation
4. Check component props and data structure

For development questions, refer to:
- [Google Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript)
- [Google Maps TypeScript Types](https://www.npmjs.com/package/@types/google.maps)
