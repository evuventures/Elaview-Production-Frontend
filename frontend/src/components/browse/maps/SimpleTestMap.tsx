// src/components/map/SimpleTestMap.tsx
import React, { useEffect, useRef, useState } from 'react';

interface SimpleTestMapProps {
  className?: string;
}

const SimpleTestMap: React.FC<SimpleTestMapProps> = ({ className = '' }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (message: string) => {
    console.log(`🗺️ SimpleTestMap: ${message}`);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) {
        addDebugInfo('❌ Map container not found');
        return;
      }

      try {
        addDebugInfo('🚀 Starting map initialization...');
        
        // Check if Google Maps is loaded
        if (typeof google === 'undefined') {
          addDebugInfo('❌ Google Maps not loaded');
          setError('Google Maps API not loaded');
          setIsLoading(false);
          return;
        }

        addDebugInfo('✅ Google Maps API detected');

        // Import maps library
        addDebugInfo('📚 Importing maps library...');
        const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
        addDebugInfo('✅ Maps library imported');

        // Create the map
        addDebugInfo('🗺️ Creating map instance...');
        const map = new Map(mapRef.current, {
          center: { lat: 33.865728, lng: -117.7747456 }, // Your location from console
          zoom: 10,
          mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID',
          gestureHandling: 'greedy',
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        addDebugInfo('✅ Map created successfully');
        
        // Wait a bit for map to fully initialize
        setTimeout(() => {
          addDebugInfo('🎉 Map initialization complete');
          setIsLoading(false);
        }, 1000);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        addDebugInfo(`❌ Error: ${errorMessage}`);
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    // Add delay to ensure Google Maps API is loaded
    setTimeout(initMap, 500);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-2xl"
        style={{ minHeight: '400px' }}
      />
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/90 rounded-2xl flex flex-col items-center justify-center z-10">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-medium text-gray-700 mb-4">Testing map initialization...</p>
          <div className="text-xs text-gray-500 max-w-md">
            <div className="font-semibold mb-2">Debug Info:</div>
            {debugInfo.slice(-5).map((info, index) => (
              <div key={index} className="mb-1">{info}</div>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="absolute inset-0 bg-red-50 rounded-2xl flex items-center justify-center z-10">
          <div className="text-center">
            <div className="text-red-600 font-semibold mb-2">Map Error</div>
            <div className="text-red-800 text-sm mb-4">{error}</div>
            <div className="text-xs text-gray-600">
              <div className="font-semibold mb-2">Debug Info:</div>
              {debugInfo.map((info, index) => (
                <div key={index} className="mb-1">{info}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleTestMap;