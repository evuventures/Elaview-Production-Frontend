// src/components/debug/MinimalTestMap.tsx
// Ultra-minimal Google Maps component for testing

import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    google: any;
    initMinimalMap?: () => void;
  }
}

const MinimalTestMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('Initializing...');
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    console.log('🧪 MinimalTestMap: Component mounted');
    
    const initMap = async () => {
      try {
        setStatus('Loading Google Maps API...');
        console.log('🧪 MinimalTestMap: Starting initialization');

        // Check if Google Maps is already loaded
        if (window.google && window.google.maps) {
          console.log('🧪 MinimalTestMap: Google Maps already available');
          createMap();
          return;
        }

        // Load Google Maps if not already loaded
        if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
          console.log('🧪 MinimalTestMap: Loading Google Maps script');
          
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=maps,marker&v=beta&callback=initMinimalMap`;
          script.async = true;
          
          window.initMinimalMap = () => {
            console.log('🧪 MinimalTestMap: Google Maps callback executed');
            createMap();
            delete window.initMinimalMap;
          };
          
          script.onerror = () => {
            console.error('🧪 MinimalTestMap: Failed to load Google Maps');
            setStatus('Failed to load Google Maps');
          };
          
          document.head.appendChild(script);
        } else {
          console.log('🧪 MinimalTestMap: Google Maps script already exists, waiting...');
          // Wait for existing script to load
          const checkGoogleMaps = setInterval(() => {
            if (window.google && window.google.maps) {
              clearInterval(checkGoogleMaps);
              createMap();
            }
          }, 100);
        }
      } catch (error) {
        console.error('🧪 MinimalTestMap: Error in initMap:', error);
        setStatus(`Error: ${error}`);
      }
    };

    const createMap = async () => {
      try {
        if (!mapRef.current) {
          console.error('🧪 MinimalTestMap: Map ref not available');
          return;
        }

        console.log('🧪 MinimalTestMap: Creating map instance');
        setStatus('Creating map...');

        const { Map } = await window.google.maps.importLibrary("maps");
        
        const map = new Map(mapRef.current, {
          center: { lat: 33.7175, lng: -117.8311 }, // Orange County
          zoom: 10,
          mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID',
        });

        mapInstanceRef.current = map;
        
        console.log('🧪 MinimalTestMap: Map created successfully!');
        setStatus('Map loaded successfully! 🎉');

        // Add a simple marker to test
        const { AdvancedMarkerElement, PinElement } = await window.google.maps.importLibrary("marker");
        
        const pin = new PinElement({
          background: '#3b82f6',
          borderColor: '#1d4ed8',
          glyphColor: '#ffffff',
          scale: 1.0,
        });

        const marker = new AdvancedMarkerElement({
          map: map,
          position: { lat: 33.7175, lng: -117.8311 },
          content: pin.element,
          title: 'Test Marker',
        });

        console.log('🧪 MinimalTestMap: Test marker added');
        setStatus('Map with test marker loaded! 🎉✨');

      } catch (error) {
        console.error('🧪 MinimalTestMap: Error creating map:', error);
        setStatus(`Map creation error: ${error}`);
      }
    };

    initMap();

    // Cleanup
    return () => {
      console.log('🧪 MinimalTestMap: Component unmounting');
      if (mapInstanceRef.current) {
        console.log('🧪 MinimalTestMap: Cleaning up map instance');
        mapInstanceRef.current = null;
      }
    };
  }, []); // Empty dependency array - run once only

  return (
    <div className="w-full h-full min-h-[400px] relative">
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg border"
        style={{ minHeight: '400px' }}
      />
      
      {/* Status overlay */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border">
        <div className="text-sm font-medium text-gray-900">
          Test Map Status
        </div>
        <div className="text-xs text-gray-600 mt-1">
          {status}
        </div>
        <div className="text-xs text-blue-600 mt-2">
          Check console for detailed logs
        </div>
      </div>
    </div>
  );
};

export default MinimalTestMap;