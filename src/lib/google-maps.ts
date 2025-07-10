// src/lib/google-maps.ts
// ✅ FIXED: Prevents multiple Google Maps API loads

let isLoading = false;
let isLoaded = false;
let loadPromise: Promise<void> | null = null;

export class GoogleMapsApiLoader {
  static async load(apiKey: string): Promise<void> {
    // ✅ FIXED: Return immediately if already loaded
    if (isLoaded) {
      console.log('🗺️ Google Maps API already loaded, skipping...');
      return Promise.resolve();
    }

    // ✅ FIXED: Return existing promise if currently loading
    if (isLoading && loadPromise) {
      console.log('🗺️ Google Maps API already loading, waiting...');
      return loadPromise;
    }

    // ✅ FIXED: Check if Google Maps is already loaded by another script
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      console.log('🗺️ Google Maps API already exists on window, marking as loaded');
      isLoaded = true;
      return Promise.resolve();
    }

    isLoading = true;
    console.log('🗺️ Loading Google Maps API for the first time...');

    loadPromise = new Promise<void>((resolve, reject) => {
      try {
        // Remove any existing script tags for Google Maps to prevent conflicts
        const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
        existingScripts.forEach(script => {
          console.log('🧹 Removing existing Google Maps script to prevent conflicts');
          script.remove();
        });

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=maps,marker,places&v=beta&callback=initMap`;
        script.async = true;
        script.defer = true;

        // ✅ FIXED: Better callback handling
        (window as any).initMap = () => {
          console.log('🗺️ Google Maps API callback executed successfully');
          isLoaded = true;
          isLoading = false;
          
          // Clean up the global callback
          delete (window as any).initMap;
          
          resolve();
        };

        script.onerror = (error) => {
          console.error('❌ Failed to load Google Maps API:', error);
          isLoading = false;
          loadPromise = null;
          reject(new Error('Failed to load Google Maps API'));
        };

        document.head.appendChild(script);
        console.log('🗺️ Google Maps API script added to document');

        // ✅ FIXED: Add timeout to prevent hanging
        setTimeout(() => {
          if (!isLoaded && isLoading) {
            console.error('❌ Google Maps API load timeout');
            isLoading = false;
            loadPromise = null;
            reject(new Error('Google Maps API load timeout'));
          }
        }, 10000); // 10 second timeout

      } catch (error) {
        console.error('❌ Error setting up Google Maps API loader:', error);
        isLoading = false;
        loadPromise = null;
        reject(error);
      }
    });

    return loadPromise;
  }

  // ✅ NEW: Helper method to check if loaded
  static isLoaded(): boolean {
    return isLoaded || (typeof window !== 'undefined' && window.google && window.google.maps);
  }

  // ✅ NEW: Helper method to reset state (for debugging)
  static reset(): void {
    isLoading = false;
    isLoaded = false;
    loadPromise = null;
    console.log('🔄 Google Maps API loader state reset');
  }
}

// Export the rest of your existing google-maps utilities...
export class MapManager {
  // ... your existing MapManager code
}

export const createPriceMarker = (/* your existing function */) => {
  // ... your existing createPriceMarker code
};

export const getDistanceInKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};