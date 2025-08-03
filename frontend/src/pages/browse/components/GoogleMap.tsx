// src/components/browse/maps/GoogleMap.tsx
// ✅ CLEAN: Simplified GoogleMap with Elaview design system - Deep Teal
// ✅ MOBILE: Disabled default Google Maps controls on mobile

import React, { useEffect, useRef, useState } from 'react';
import { X, MapPin } from 'lucide-react';
import { Button } from "@/components/ui/button";

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
  spaces?: Space[];
}

// MIGRATION: Renamed AdvertisingArea to Space
interface Space {
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
  propertyName?: string;
  propertyAddress?: string;
  propertyCoords?: LatLng;
  property?: Property;
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
  spaces?: Space[];
  advertisingAreas?: Space[]; // DEPRECATED: Use spaces instead
  onSpaceClick?: (space: Space) => void;
  onAreaClick?: (area: Space) => void; // DEPRECATED: Use onSpaceClick
  showAreaMarkers?: boolean;
}

// ✅ CLEAN: Simplified Space Dropdown
interface SpaceDropdownProps {
  spaces: Space[];
  position: { lat: number; lng: number };
  onSpaceClick: (space: Space) => void;
  onClose: () => void;
  map: google.maps.Map;
}

const SpaceDropdown: React.FC<SpaceDropdownProps> = ({ 
  spaces, 
  position, 
  onSpaceClick, 
  onClose,
  map 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pixelPosition, setPixelPosition] = useState<{ x: number; y: number } | null>(null);

  // ✅ SIMPLIFIED: Basic positioning
  useEffect(() => {
    const updatePosition = () => {
      const mapDiv = map.getDiv();
      if (!mapDiv) return;

      const overlay = new window.google.maps.OverlayView();
      overlay.onAdd = function() {};
      overlay.onRemove = function() {};
      overlay.draw = function() {
        const projection = this.getProjection();
        if (projection) {
          const pixelPos = projection.fromLatLngToDivPixel(
            new window.google.maps.LatLng(position.lat, position.lng)
          );
          
          if (pixelPos) {
            const mapRect = mapDiv.getBoundingClientRect();
            const dropdownWidth = 280;
            const dropdownHeight = 200;
            
            // Simple centering with boundary checks
            let x = pixelPos.x;
            let y = pixelPos.y - dropdownHeight - 10; // Position above marker
            
            // Keep within bounds
            x = Math.max(dropdownWidth/2, Math.min(mapRect.width - dropdownWidth/2, x));
            y = Math.max(10, Math.min(mapRect.height - dropdownHeight - 10, y));
            
            setPixelPosition({ x, y });
          }
        }
        overlay.setMap(null);
      };
      overlay.setMap(map);
    };

    updatePosition();
    
    const listeners = [
      map.addListener('zoom_changed', updatePosition),
      map.addListener('center_changed', updatePosition)
    ];

    return () => {
      listeners.forEach(listener => listener?.remove?.());
    };
  }, [position, map]);

  const currentSpace = spaces[currentIndex];

  const getSpacePrice = (space: Space) => {
    if (space.baseRate) {
      const rateType = space.rateType || 'MONTHLY';
      const suffix = rateType.toLowerCase().replace('ly', '').replace('y', 'y');
      return `$${space.baseRate}/${suffix}`;
    }
    return 'Contact for pricing';
  };

  const getSpaceName = (space: Space) => {
    return space.name || space.title || 'Advertising Space';
  };

  if (!pixelPosition || !currentSpace) return null;

  return (
    <div
      className="absolute z-50 card card-comfortable shadow-soft-lg max-w-xs"
      style={{
        left: `${pixelPosition.x}px`,
        top: `${pixelPosition.y}px`,
        transform: 'translateX(-50%)',
        width: '280px'
      }}
    >
      {/* ✅ Clean header */}
      <div className="flex items-center justify-between mb-3">
        <span className="caption text-slate-500">
          {spaces.length} space{spaces.length !== 1 ? 's' : ''} available
        </span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-100 rounded-md transition-colors"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* ✅ Simplified space info */}
      <div className="space-y-3">
        <div>
          <h3 className="property-title text-sm mb-1">
            {getSpaceName(currentSpace)}
          </h3>
          <p className="caption text-slate-500 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {currentSpace.propertyName}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <span className="property-price bg-teal-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {getSpacePrice(currentSpace)}
          </span>
          <Button 
            onClick={() => onSpaceClick(currentSpace)}
            className="btn-primary btn-small"
          >
            View Details
          </Button>
        </div>

        {/* ✅ Simple navigation if multiple spaces */}
        {spaces.length > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-200">
            {spaces.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-teal-500' : 'bg-slate-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ✅ Clean arrow */}
      <div 
        className="absolute top-full left-1/2 transform -translate-x-1/2"
        style={{
          width: 0,
          height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '8px solid white',
        }}
      />
    </div>
  );
};

// Global type declarations
interface GoogleMapsWindow extends Window {
  google: any;
  initMainGoogleMap?: () => void;
}

declare const window: GoogleMapsWindow;

const GoogleMap: React.FC<GoogleMapProps> = ({
  properties,
  onPropertyClick,
  center = { lat: 33.7175, lng: -117.8311 },
  zoom = 10,
  className = '',
  onClick,
  marker,
  showPropertyMarkers = true,
  spaces = [],
  advertisingAreas = [], // DEPRECATED: Use spaces instead
  onSpaceClick,
  onAreaClick, // DEPRECATED: Use onSpaceClick instead
  showAreaMarkers = true,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const propertyMarkersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const clickMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  
  // ✅ NEW: Mobile detection state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // ✅ Simplified dropdown state
  const [activeDropdown, setActiveDropdown] = useState<{
    spaces: Space[];
    position: LatLng;
  } | null>(null);

  // ✅ NEW: Mobile detection useEffect
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ✅ Clean up function
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
      propertyMarkersRef.current = cleanupMarkers(propertyMarkersRef.current);
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
        // Check if Google Maps is already loaded
        if (window.google && window.google.maps) {
          createMap();
          return;
        }

        // Load Google Maps if not already loaded
        if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=maps,marker&v=beta&callback=initMainGoogleMap`;
          script.async = true;
          
          window.initMainGoogleMap = () => {
            createMap();
            delete window.initMainGoogleMap;
          };
          
          script.onerror = () => {
            console.error('Failed to load Google Maps');
          };
          
          document.head.appendChild(script);
        } else {
          const checkGoogleMaps = setInterval(() => {
            if (window.google && window.google.maps) {
              clearInterval(checkGoogleMaps);
              createMap();
            }
          }, 100);
        }
      } catch (error) {
        console.error('Error in initMap:', error);
      }
    };

    const createMap = async () => {
      try {
        if (!mapRef.current) return;

        const { Map } = await window.google.maps.importLibrary("maps");
        
        // ✅ FIXED: Conditional UI controls based on mobile state
        const map = new Map(mapRef.current, {
          center,
          zoom,
          mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID',
          gestureHandling: 'greedy',
          disableDefaultUI: isMobile,           // ✅ Disable all UI on mobile
          zoomControl: !isMobile,               // ✅ Hide zoom +/- on mobile
          mapTypeControl: false,                // Always off
          scaleControl: false,                  // Always off
          streetViewControl: false,             // Always off
          rotateControl: false,                 // Always off
          fullscreenControl: !isMobile,         // ✅ Hide fullscreen on mobile
          clickableIcons: false,
          backgroundColor: '#f8fafc',
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            },
            {
              featureType: 'all',
              elementType: 'geometry',
              stylers: [{ color: '#f8fafc' }]
            }
          ]
        });

        mapInstanceRef.current = map;

        // Add click listener to close dropdown
        map.addListener('click', (event: google.maps.MapMouseEvent) => {
          setActiveDropdown(null);
          if (onClick) {
            onClick(event);
          }
        });
        
        setIsMapReady(true);

      } catch (error) {
        console.error('Error creating map:', error);
      }
    };

    initMap();
  }, [isMobile]); // ✅ NEW: Re-create map when mobile state changes

  // ✅ Update map center and zoom when props change
  useEffect(() => {
    if (mapInstanceRef.current && isMapReady) {
      mapInstanceRef.current.panTo(center);
      if (mapInstanceRef.current.getZoom() !== zoom) {
        mapInstanceRef.current.setZoom(zoom);
      }
    }
  }, [center.lat, center.lng, zoom, isMapReady]);

  // ✅ CLEAN: Simplified property markers
  useEffect(() => {
    const createPropertyMarkers = async () => {
      if (!mapInstanceRef.current || !isMapReady || !showPropertyMarkers) {
        propertyMarkersRef.current = cleanupMarkers(propertyMarkersRef.current);
        return;
      }

      try {
        const propertiesWithSpaces = properties.filter(property => 
          property.spaces && property.spaces.length > 0
        );
        
        const { AdvancedMarkerElement } = await window.google.maps.importLibrary("marker");
        propertyMarkersRef.current = cleanupMarkers(propertyMarkersRef.current);

        const newMarkers = [];
        for (const property of propertiesWithSpaces) {
          let position: LatLng | null = null;

          if (property.latitude && property.longitude) {
            position = { lat: property.latitude, lng: property.longitude };
          } else if (property.coords && property.coords.length === 2) {
            position = { lat: property.coords[0], lng: property.coords[1] };
          }

          if (!position) continue;

          const spaceCount = property.spaces?.length || 0;
          
          // ✅ CLEAN: Simple marker design with Deep Teal
          const markerElement = document.createElement('div');
          markerElement.className = 'flex items-center justify-center w-8 h-8 bg-teal-500 text-white rounded-full border-2 border-white shadow-soft cursor-pointer hover:bg-teal-600 transition-all duration-200 hover:scale-110';
          markerElement.style.fontSize = '12px';
          markerElement.style.fontWeight = '600';
          markerElement.textContent = spaceCount.toString();
          markerElement.title = `${spaceCount} space${spaceCount !== 1 ? 's' : ''} available`;

          const marker = new AdvancedMarkerElement({
            map: mapInstanceRef.current,
            position,
            content: markerElement,
            gmpClickable: true,
          });

          // ✅ Show dropdown on property marker click
          // ✅ FIXED: Mobile-aware property marker click handler
marker.addListener('click', (e: any) => {
  e.stop();
  
  // ✅ Check if currently mobile (real-time detection)
  const isCurrentlyMobile = window.innerWidth < 768;
  
  if (isCurrentlyMobile) {
    // ✅ Mobile: Always use bottom sheet via onPropertyClick
    console.log('📱 Mobile property marker clicked - opening bottom sheet');
    onPropertyClick(property);
  } else {
    // ✅ Desktop: Use dropdown as before
    console.log('🖥️ Desktop property marker clicked - showing dropdown');
    
    // MIGRATION: Use spaces or fallback to advertisingAreas for backward compatibility
    const allSpaces = spaces.length > 0 ? spaces : advertisingAreas;
    const propertySpaces = allSpaces.filter(space => 
      space.propertyId === property.id || 
      space.property?.id === property.id ||
      (space.propertyCoords && 
       Math.abs(space.propertyCoords.lat - position!.lat) < 0.001 &&
       Math.abs(space.propertyCoords.lng - position!.lng) < 0.001)
    );

    if (propertySpaces.length > 0) {
      setActiveDropdown({
        spaces: propertySpaces,
        position: position!
      });
    } else {
      onPropertyClick(property);
    }
  }
});

          newMarkers.push(marker);
        }

        propertyMarkersRef.current = newMarkers;

      } catch (error) {
        console.error('Error creating property markers:', error);
      }
    };

    createPropertyMarkers();
  }, [properties, spaces, advertisingAreas, isMapReady, onPropertyClick, showPropertyMarkers]);

  // ✅ Create click marker when marker prop changes
  useEffect(() => {
    const createClickMarker = async () => {
      if (!mapInstanceRef.current || !isMapReady || !marker) return;

      try {
        const { AdvancedMarkerElement, PinElement } = await window.google.maps.importLibrary("marker");

        if (clickMarkerRef.current) {
          clickMarkerRef.current.map = null;
        }

        const pin = new PinElement({
          background: '#0f766e', // Deep Teal color
          borderColor: '#0d9488',
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
        console.error('Error creating click marker:', error);
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
      
      {/* ✅ CLEAN: Simplified space dropdown */}
      {activeDropdown && mapInstanceRef.current && (onSpaceClick || onAreaClick) && (
        <SpaceDropdown
          spaces={activeDropdown.spaces}
          position={activeDropdown.position}
          onSpaceClick={(space) => {
            setActiveDropdown(null);
            // MIGRATION: Use onSpaceClick if available, fallback to onAreaClick for backward compatibility
            if (onSpaceClick) {
              onSpaceClick(space);
            } else if (onAreaClick) {
              onAreaClick(space);
            }
          }}
          onClose={() => setActiveDropdown(null)}
          map={mapInstanceRef.current}
        />
      )}
      
      {/* ✅ CLEAN: Simple loading state */}
      {!isMapReady && (
        <div className="absolute inset-0 bg-slate-50 rounded-2xl flex items-center justify-center">
          <div className="text-center">
            <div className="loading-spinner w-6 h-6 text-teal-500 mx-auto mb-3"></div>
            <p className="body-small text-slate-600">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMap;