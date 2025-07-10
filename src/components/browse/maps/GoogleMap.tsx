// src/components/map/GoogleMap.tsx
// ✅ FIXED: Based on working MinimalTestMap pattern

import React, { useEffect, useRef, useState, useMemo } from 'react';

interface LatLng {
  lat: number;
  lng: number;
}

interface Property {
  id: string;
  name?: string;
  title: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  coords?: [number, number];
  primary_image?: string;
  images?: string[];
  photos?: string[];
  basePrice?: number;
  pricing?: {
    daily_rate?: number;
    base_price?: number;
  };
  type?: string;
  spaceType?: string;
  features?: string[];
  status?: string;
}

interface GoogleMapProps {
  properties: Property[];
  onPropertyClick: (property: Property) => void;
  center?: LatLng;
  zoom?: number;
  className?: string;
  onClick?: (event: google.maps.MapMouseEvent) => void;
  marker?: LatLng | null;
  showPropertyMarkers?: boolean;
}

// Global type declarations
interface GoogleMapsWindow extends Window {
  google: any;
  initMainGoogleMap?: () => void;
}

declare const window: GoogleMapsWindow;

const GoogleMap: React.FC<GoogleMapProps> = ({
  properties,
  onPropertyClick,
  center = { lat: 33.7175, lng: -117.8311 }, // Orange County default
  zoom = 10,
  className = '',
  onClick,
  marker,
  showPropertyMarkers = true
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const clickMarkerRef = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [status, setStatus] = useState('Initializing...');

  // ✅ FIXED: Clean up on unmount
  useEffect(() => {
    return () => {
      console.log('🗺️ GoogleMap: Component unmounting, cleaning up...');
      
      // Clean up markers
      markersRef.current.forEach(marker => {
        if (marker.map) {
          marker.map = null;
        }
      });
      markersRef.current = [];
      
      if (clickMarkerRef.current && clickMarkerRef.current.map) {
        clickMarkerRef.current.map = null;
      }
      
      mapInstanceRef.current = null;
    };
  }, []);

  // ✅ FIXED: Initialize map using working pattern from MinimalTestMap
  useEffect(() => {
    const initMap = async () => {
      try {
        setStatus('Loading Google Maps API...');
        console.log('🗺️ GoogleMap: Starting initialization...');

        // Check if Google Maps is already loaded
        if (window.google && window.google.maps) {
          console.log('🗺️ GoogleMap: Google Maps already available');
          createMap();
          return;
        }

        // Load Google Maps if not already loaded
        if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
          console.log('🗺️ GoogleMap: Loading Google Maps script');
          
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=maps,marker&v=beta&callback=initMainGoogleMap`;
          script.async = true;
          
          window.initMainGoogleMap = () => {
            console.log('🗺️ GoogleMap: Google Maps callback executed');
            createMap();
            delete window.initMainGoogleMap;
          };
          
          script.onerror = () => {
            console.error('🗺️ GoogleMap: Failed to load Google Maps');
            setStatus('Failed to load Google Maps');
          };
          
          document.head.appendChild(script);
        } else {
          console.log('🗺️ GoogleMap: Google Maps script already exists, waiting...');
          // Wait for existing script to load
          const checkGoogleMaps = setInterval(() => {
            if (window.google && window.google.maps) {
              clearInterval(checkGoogleMaps);
              createMap();
            }
          }, 100);
        }
      } catch (error) {
        console.error('🗺️ GoogleMap: Error in initMap:', error);
        setStatus(`Error: ${error}`);
      }
    };

    const createMap = async () => {
      try {
        if (!mapRef.current) {
          console.error('🗺️ GoogleMap: Map ref not available');
          return;
        }

        console.log('🗺️ GoogleMap: Creating map instance');
        setStatus('Creating map...');

        const { Map } = await window.google.maps.importLibrary("maps");
        
        const map = new Map(mapRef.current, {
          center,
          zoom,
          mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID',
          gestureHandling: 'greedy',
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: true,
          clickableIcons: false,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        mapInstanceRef.current = map;

        // Add click listener if provided
        if (onClick) {
          map.addListener('click', (event: google.maps.MapMouseEvent) => {
            onClick(event);
          });
        }
        
        console.log('🗺️ GoogleMap: Map created successfully!');
        setStatus('Map loaded successfully!');
        setIsMapReady(true);

      } catch (error) {
        console.error('🗺️ GoogleMap: Error creating map:', error);
        setStatus(`Map creation error: ${error}`);
      }
    };

    initMap();
  }, []); // Initialize once only

  // ✅ FIXED: Update map center and zoom when props change
  useEffect(() => {
    if (mapInstanceRef.current && isMapReady) {
      console.log('🗺️ GoogleMap: Updating center/zoom', center, zoom);
      mapInstanceRef.current.setCenter(center);
      mapInstanceRef.current.setZoom(zoom);
    }
  }, [center.lat, center.lng, zoom, isMapReady]);

  // ✅ FIXED: Create property markers when map is ready and properties change
  useEffect(() => {
    const createPropertyMarkers = async () => {
      if (!mapInstanceRef.current || !isMapReady || !showPropertyMarkers) return;

      try {
        console.log('🗺️ GoogleMap: Creating property markers for', properties.length, 'properties');
        
        const { AdvancedMarkerElement, PinElement } = await window.google.maps.importLibrary("marker");

        // Clear existing markers
        markersRef.current.forEach(marker => {
          if (marker.map) {
            marker.map = null;
          }
        });
        markersRef.current = [];

        // Create new markers
        const newMarkers = [];
        for (const property of properties) {
          let position: LatLng | null = null;

          if (property.latitude && property.longitude) {
            position = { lat: property.latitude, lng: property.longitude };
          } else if (property.coords && property.coords.length === 2) {
            position = { lat: property.coords[0], lng: property.coords[1] };
          }

          if (!position) {
            console.warn('🗺️ GoogleMap: Skipping property without coordinates:', property.id);
            continue;
          }

          const pin = new PinElement({
            background: '#3b82f6',
            borderColor: '#1d4ed8',
            glyphColor: '#ffffff',
            scale: 1.0,
          });

          const marker = new AdvancedMarkerElement({
            map: mapInstanceRef.current,
            position,
            content: pin.element,
            title: property.title || property.name || 'Property',
            gmpClickable: true,
          });

          marker.addListener('click', () => {
            console.log('🗺️ GoogleMap: Property marker clicked:', property.title);
            onPropertyClick(property);
          });

          newMarkers.push(marker);
        }

        markersRef.current = newMarkers;
        console.log(`🗺️ GoogleMap: Created ${newMarkers.length} property markers successfully`);

      } catch (error) {
        console.error('🗺️ GoogleMap: Error creating property markers:', error);
      }
    };

    createPropertyMarkers();
  }, [properties, isMapReady, onPropertyClick, showPropertyMarkers]);

  // ✅ FIXED: Create click marker when marker prop changes
  useEffect(() => {
    const createClickMarker = async () => {
      if (!mapInstanceRef.current || !isMapReady || !marker) return;

      try {
        const { AdvancedMarkerElement, PinElement } = await window.google.maps.importLibrary("marker");

        // Remove existing click marker
        if (clickMarkerRef.current) {
          clickMarkerRef.current.map = null;
        }

        const pin = new PinElement({
          background: '#059669',
          borderColor: '#047857',
          glyphColor: '#ffffff',
          scale: 1.2,
        });

        const clickMarker = new AdvancedMarkerElement({
          map: mapInstanceRef.current,
          position: marker,
          content: pin.element,
          title: 'Selected Location',
        });

        clickMarkerRef.current = clickMarker;
      } catch (error) {
        console.error('🗺️ GoogleMap: Error creating click marker:', error);
      }
    };

    createClickMarker();
  }, [marker, isMapReady]);

  return (
    <div className={`relative ${className}`} style={{ height: '100%', width: '100%' }}>
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-3xl"
        style={{ minHeight: '300px' }}
      />
      
      {!isMapReady && (
        <div className="absolute inset-0 bg-[hsl(var(--muted))] rounded-3xl flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading map...</p>
            <p className="text-xs text-muted-foreground mt-2">
              {status}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {properties.length} properties ready to display
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMap;