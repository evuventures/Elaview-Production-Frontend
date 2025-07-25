// src/components/browse/maps/GoogleMap.tsx
// ✅ SIMPLIFIED: MVP-focused GoogleMap with essential features only

import React, { useEffect, useRef, useState } from 'react';

// ✅ TypeScript Interfaces
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
  advertising_areas?: AdvertisingArea[];
}

interface AdvertisingArea {
  id: string;
  name: string;
  title?: string;
  description?: string;
  type: string;
  baseRate?: number;
  pricing?: any;
  rateType?: string;
  currency?: string;
  status?: string;
  isActive?: boolean;
  images?: string;
  city: string;
  state?: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  } | any;
  propertyId?: string;
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
  advertisingAreas?: AdvertisingArea[];
  onAreaClick?: (area: AdvertisingArea) => void;
  showAreaMarkers?: boolean;
}

// Global type declarations
interface GoogleMapsWindow extends Window {
  google: any;
  initMainGoogleMap?: () => void;
}

declare const window: GoogleMapsWindow;

// ✅ SIMPLIFIED: Basic category system for areas
const getAreaColor = (area: AdvertisingArea): { background: string; border: string } => {
  const type = area.type?.toLowerCase() || '';
  
  if (type.includes('digital')) {
    return { background: '#059669', border: '#047857' }; // Green for digital
  }
  if (type.includes('billboard') || type.includes('outdoor')) {
    return { background: '#ea580c', border: '#c2410c' }; // Orange for outdoor
  }
  if (type.includes('retail') || type.includes('mall') || type.includes('storefront')) {
    return { background: '#7c3aed', border: '#6d28d9' }; // Purple for retail
  }
  if (type.includes('transit') || type.includes('platform') || type.includes('bus')) {
    return { background: '#2563eb', border: '#1d4ed8' }; // Blue for transit
  }
  
  // Default indoor/other
  return { background: '#6b7280', border: '#4b5563' }; // Gray for indoor/other
};

const GoogleMap: React.FC<GoogleMapProps> = ({
  properties,
  onPropertyClick,
  center = { lat: 33.7175, lng: -117.8311 },
  zoom = 10,
  className = '',
  onClick,
  marker,
  showPropertyMarkers = true,
  advertisingAreas = [],
  onAreaClick,
  showAreaMarkers = true,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const propertyMarkersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const areaMarkersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const clickMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [status, setStatus] = useState('Initializing...');

  // ✅ SIMPLIFIED: Clean up function
  const cleanupMarkers = (markerArray: google.maps.marker.AdvancedMarkerElement[]) => {
    markerArray.forEach(marker => {
      if (marker && marker.map) {
        marker.map = null;
      }
    });
    return [];
  };

  // ✅ Clean up on unmount
  useEffect(() => {
    return () => {
      console.log('🗺️ GoogleMap: Component unmounting, cleaning up...');
      
      propertyMarkersRef.current = cleanupMarkers(propertyMarkersRef.current);
      areaMarkersRef.current = cleanupMarkers(areaMarkersRef.current);
      
      if (clickMarkerRef.current && clickMarkerRef.current.map) {
        clickMarkerRef.current.map = null;
      }
      
      mapInstanceRef.current = null;
    };
  }, []);

  // ✅ Initialize map
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
          scaleControl: false,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: true,
          clickableIcons: false,
          backgroundColor: '#f5f5f5',
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

  // ✅ Update map center and zoom when props change
  useEffect(() => {
    if (mapInstanceRef.current && isMapReady) {
      console.log('🗺️ GoogleMap: Updating center/zoom', center, zoom);
      mapInstanceRef.current.panTo(center);
      if (mapInstanceRef.current.getZoom() !== zoom) {
        mapInstanceRef.current.setZoom(zoom);
      }
    }
  }, [center.lat, center.lng, zoom, isMapReady]);

  // ✅ Create property markers
  useEffect(() => {
    const createPropertyMarkers = async () => {
      if (!mapInstanceRef.current || !isMapReady || !showPropertyMarkers) {
        propertyMarkersRef.current = cleanupMarkers(propertyMarkersRef.current);
        return;
      }

      try {
        console.log('🏢 GoogleMap: Creating property markers for', properties.length, 'properties');
        
        // Filter out properties without advertising areas
        const propertiesWithSpaces = properties.filter(property => 
          property.advertising_areas && property.advertising_areas.length > 0
        );
        
        const { AdvancedMarkerElement, PinElement } = await window.google.maps.importLibrary("marker");

        // Clear existing property markers
        propertyMarkersRef.current = cleanupMarkers(propertyMarkersRef.current);

        // Create new property markers
        const newMarkers = [];
        for (const property of propertiesWithSpaces) {
          let position: LatLng | null = null;

          if (property.latitude && property.longitude) {
            position = { lat: property.latitude, lng: property.longitude };
          } else if (property.coords && property.coords.length === 2) {
            position = { lat: property.coords[0], lng: property.coords[1] };
          }

          if (!position) {
            console.warn('🏢 GoogleMap: Skipping property without coordinates:', property.id);
            continue;
          }

          // Simple blue property markers
          const pin = new PinElement({
            background: '#3b82f6',
            borderColor: '#1d4ed8',
            glyphColor: '#ffffff',
            scale: 1.3,
          });

          const spaceCount = property.advertising_areas?.length || 0;
          const marker = new AdvancedMarkerElement({
            map: mapInstanceRef.current,
            position,
            content: pin.element,
            title: `${property.title || property.name || 'Property'} - ${spaceCount} spaces`,
            gmpClickable: true,
          });

          marker.addListener('click', () => {
            console.log('🏢 Property clicked:', property.title);
            onPropertyClick(property);
          });

          newMarkers.push(marker);
        }

        propertyMarkersRef.current = newMarkers;
        console.log(`🏢 Created ${newMarkers.length} property markers`);

      } catch (error) {
        console.error('🏢 GoogleMap: Error creating property markers:', error);
      }
    };

    createPropertyMarkers();
  }, [properties, isMapReady, onPropertyClick, showPropertyMarkers]);

  // ✅ Create advertising area markers
  useEffect(() => {
    const createAreaMarkers = async () => {
      if (!mapInstanceRef.current || !isMapReady || !showAreaMarkers || !onAreaClick) {
        areaMarkersRef.current = cleanupMarkers(areaMarkersRef.current);
        return;
      }

      try {
        console.log('📍 GoogleMap: Creating area markers for', advertisingAreas.length, 'areas');

        const { AdvancedMarkerElement, PinElement } = await window.google.maps.importLibrary("marker");

        // Clear existing area markers
        areaMarkersRef.current = cleanupMarkers(areaMarkersRef.current);

        // Create new area markers
        const newMarkers = [];
        for (const area of advertisingAreas) {
          let position: LatLng | null = null;

          // Get position from area coordinates or property coordinates
          if (area.coordinates && area.coordinates.lat && area.coordinates.lng) {
            position = { lat: area.coordinates.lat, lng: area.coordinates.lng };
          }

          if (!position) {
            console.warn('📍 GoogleMap: Skipping area without coordinates:', area.id);
            continue;
          }

          const colors = getAreaColor(area);
          
          const pin = new PinElement({
            background: colors.background,
            borderColor: colors.border,
            glyphColor: '#ffffff',
            scale: 1.1,
          });

          const marker = new AdvancedMarkerElement({
            map: mapInstanceRef.current,
            position,
            content: pin.element,
            title: `${area.name} - ${area.type}`,
            gmpClickable: true,
          });

          marker.addListener('click', () => {
            console.log('📍 Area clicked:', area.name);
            onAreaClick(area);
          });

          newMarkers.push(marker);
        }

        areaMarkersRef.current = newMarkers;
        console.log(`📍 Created ${newMarkers.length} area markers`);

      } catch (error) {
        console.error('📍 GoogleMap: Error creating area markers:', error);
      }
    };

    createAreaMarkers();
  }, [advertisingAreas, isMapReady, onAreaClick, showAreaMarkers]);

  // ✅ Create click marker when marker prop changes
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
          background: '#dc2626',
          borderColor: '#b91c1c',
          glyphColor: '#ffffff',
          scale: 1.0,
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
        className="w-full h-full rounded-2xl"
        style={{ minHeight: '300px' }}
      />
      
      {/* ✅ SIMPLIFIED: Basic status indicator */}
      {isMapReady && (
        <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md border border-white/20">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm font-medium">
              {properties.length} Properties • {advertisingAreas.length} Spaces
            </span>
          </div>
        </div>
      )}
      
      {!isMapReady && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Loading map...</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{status}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMap;