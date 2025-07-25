// src/components/browse/maps/GoogleMap.tsx
// ✅ ENHANCED: GoogleMap with space dropdown functionality

import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X, MapPin, DollarSign } from 'lucide-react';

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
  advertisingAreas?: AdvertisingArea[];
  onAreaClick?: (area: AdvertisingArea) => void;
  showAreaMarkers?: boolean;
}

// ✅ NEW: Space dropdown component with smart positioning
interface SpaceDropdownProps {
  spaces: AdvertisingArea[];
  position: { lat: number; lng: number };
  onSpaceClick: (space: AdvertisingArea) => void;
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
  const [pixelPosition, setPixelPosition] = useState<{ 
    x: number; 
    y: number; 
    placement?: string;
    markerX?: number;
    markerY?: number;
    mapWidth?: number;
    mapHeight?: number;
  } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Convert lat/lng to pixel coordinates with smart positioning
  useEffect(() => {
    const updatePosition = () => {
      const mapDiv = map.getDiv();
      if (!mapDiv) return;

      // Get the map's actual container bounds
      const mapRect = mapDiv.getBoundingClientRect();
      
      // Create a temporary overlay to get pixel position
      const overlay = new window.google.maps.OverlayView();
      overlay.onAdd = function() {};
      overlay.onRemove = function() {};
      overlay.draw = function() {
        const projection = this.getProjection();
        if (projection) {
          const pixelPosition = projection.fromLatLngToDivPixel(
            new window.google.maps.LatLng(position.lat, position.lng)
          );
          
          if (pixelPosition) {
            // Dropdown dimensions
            const dropdownWidth = 300;
            const dropdownHeight = 320; // More accurate height including padding
            const padding = 16; // Increased padding for safety
            const markerHeight = 32; // Account for marker size
            
            // ✅ CORRECTED: Use actual map container dimensions
            const mapWidth = mapRect.width;
            const mapHeight = mapRect.height;
            
            // Calculate available space in each direction from marker position
            const spaceAbove = pixelPosition.y - padding;
            const spaceBelow = mapHeight - pixelPosition.y - markerHeight - padding;
            const spaceLeft = pixelPosition.x - padding;
            const spaceRight = mapWidth - pixelPosition.x - padding;
            
            let x = pixelPosition.x;
            let y = pixelPosition.y;
            let placement = 'top';
            
            console.log('📊 Position Debug:', {
              marker: { x: pixelPosition.x, y: pixelPosition.y },
              mapSize: { width: mapWidth, height: mapHeight },
              spaces: { above: spaceAbove, below: spaceBelow, left: spaceLeft, right: spaceRight },
              dropdownSize: { width: dropdownWidth, height: dropdownHeight }
            });
            
            // ✅ IMPROVED POSITIONING LOGIC
            
            // Try TOP placement first (most preferred)
            if (spaceAbove >= dropdownHeight) {
              placement = 'top';
              y = pixelPosition.y - dropdownHeight - 8; // 8px gap from marker
              x = Math.max(
                dropdownWidth/2 + padding, 
                Math.min(
                  mapWidth - dropdownWidth/2 - padding,
                  pixelPosition.x
                )
              );
            }
            // Try BOTTOM placement
            else if (spaceBelow >= dropdownHeight) {
              placement = 'bottom';
              y = pixelPosition.y + markerHeight + 8; // 8px gap from marker
              x = Math.max(
                dropdownWidth/2 + padding, 
                Math.min(
                  mapWidth - dropdownWidth/2 - padding,
                  pixelPosition.x
                )
              );
            }
            // Try LEFT placement
            else if (spaceLeft >= dropdownWidth) {
              placement = 'left';
              x = pixelPosition.x - dropdownWidth - 8;
              y = Math.max(
                padding,
                Math.min(
                  mapHeight - dropdownHeight - padding,
                  pixelPosition.y - dropdownHeight/2
                )
              );
            }
            // Try RIGHT placement
            else if (spaceRight >= dropdownWidth) {
              placement = 'right';
              x = pixelPosition.x + markerHeight + 8;
              y = Math.max(
                padding,
                Math.min(
                  mapHeight - dropdownHeight - padding,
                  pixelPosition.y - dropdownHeight/2
                )
              );
            }
            // ✅ EMERGENCY FALLBACK: Force fit within bounds
            else {
              // Find the direction with most space
              const maxSpace = Math.max(spaceAbove, spaceBelow, spaceLeft, spaceRight);
              
              if (maxSpace === spaceAbove || maxSpace === spaceBelow) {
                // Vertical placement with constraints
                placement = maxSpace === spaceAbove ? 'top-constrained' : 'bottom-constrained';
                
                if (maxSpace === spaceAbove) {
                  y = padding; // Stick to top edge
                } else {
                  y = mapHeight - dropdownHeight - padding; // Stick to bottom edge
                }
                
                // Center horizontally with constraints
                x = Math.max(
                  dropdownWidth/2 + padding,
                  Math.min(
                    mapWidth - dropdownWidth/2 - padding,
                    pixelPosition.x
                  )
                );
              } else {
                // Horizontal placement with constraints
                placement = maxSpace === spaceLeft ? 'left-constrained' : 'right-constrained';
                
                if (maxSpace === spaceLeft) {
                  x = padding; // Stick to left edge
                } else {
                  x = mapWidth - dropdownWidth - padding; // Stick to right edge
                }
                
                // Center vertically with constraints
                y = Math.max(
                  padding,
                  Math.min(
                    mapHeight - dropdownHeight - padding,
                    pixelPosition.y - dropdownHeight/2
                  )
                );
              }
            }
            
            // ✅ FINAL BOUNDARY CHECK (safety net)
            x = Math.max(padding, Math.min(mapWidth - dropdownWidth - padding, x));
            y = Math.max(padding, Math.min(mapHeight - dropdownHeight - padding, y));
            
            console.log('📍 Final Position:', { x, y, placement });
            
            setPixelPosition({ 
              x, 
              y, 
              placement,
              markerX: pixelPosition.x,
              markerY: pixelPosition.y,
              mapWidth,
              mapHeight
            });
          }
        }
        // Clean up the temporary overlay
        overlay.setMap(null);
      };
      overlay.setMap(map);
    };

    updatePosition();
    
    // Update position when map moves or zooms
    const listeners = [
      map.addListener('zoom_changed', updatePosition),
      map.addListener('center_changed', updatePosition),
      map.addListener('bounds_changed', updatePosition),
      map.addListener('resize', updatePosition) // Also listen for resize events
    ];

    return () => {
      listeners.forEach(listener => {
        if (listener && listener.remove) {
          listener.remove();
        }
      });
    };
  }, [position, map]);

  const currentSpace = spaces[currentIndex];
  const hasNext = currentIndex < spaces.length - 1;
  const hasPrev = currentIndex > 0;

  const getAreaPrice = (area: AdvertisingArea) => {
    if (area.baseRate) {
      const rateType = area.rateType || 'MONTHLY';
      const suffix = rateType.toLowerCase().replace('ly', '').replace('y', 'y');
      return `$${area.baseRate}/${suffix}`;
    }
    if (area.pricing) {
      try {
        const pricing = typeof area.pricing === 'string' ? JSON.parse(area.pricing) : area.pricing;
        if (pricing.daily) return `$${pricing.daily}/day`;
        if (pricing.weekly) return `$${pricing.weekly}/week`;
        if (pricing.monthly) return `$${pricing.monthly}/month`;
      } catch (e) {
        console.warn('Error parsing area pricing:', e);
      }
    }
    return 'Price on request';
  };

  const getAreaName = (area: AdvertisingArea) => {
    return area.name || area.title || 'Unnamed Advertising Area';
  };

  if (!pixelPosition || !currentSpace) return null;

  // ✅ SMART ARROW POSITIONING based on placement
  const getArrowStyles = () => {
    const arrowSize = 8;
    const { placement, markerX, markerY, mapWidth = 800, mapHeight = 600 } = pixelPosition;
    
    if (placement === 'top' || placement === 'top-constrained') {
      // Arrow points down to marker
      const arrowX = Math.max(20, Math.min(280, (markerX || 0) - pixelPosition.x + 150));
      return {
        position: 'absolute',
        bottom: '-8px',
        left: `${arrowX}px`,
        width: 0,
        height: 0,
        borderLeft: `${arrowSize}px solid transparent`,
        borderRight: `${arrowSize}px solid transparent`,
        borderTop: `${arrowSize}px solid rgb(31 41 55 / 0.95)`,
        transform: 'translateX(-50%)'
      };
    } else if (placement === 'bottom' || placement === 'bottom-constrained') {
      // Arrow points up to marker
      const arrowX = Math.max(20, Math.min(280, (markerX || 0) - pixelPosition.x + 150));
      return {
        position: 'absolute',
        top: '-8px',
        left: `${arrowX}px`,
        width: 0,
        height: 0,
        borderLeft: `${arrowSize}px solid transparent`,
        borderRight: `${arrowSize}px solid transparent`,
        borderBottom: `${arrowSize}px solid rgb(31 41 55 / 0.95)`,
        transform: 'translateX(-50%)'
      };
    } else if (placement === 'left' || placement === 'left-constrained') {
      // Arrow points right to marker
      const arrowY = Math.max(20, Math.min(280, (markerY || 0) - pixelPosition.y + 160));
      return {
        position: 'absolute',
        right: '-8px',
        top: `${arrowY}px`,
        width: 0,
        height: 0,
        borderTop: `${arrowSize}px solid transparent`,
        borderBottom: `${arrowSize}px solid transparent`,
        borderLeft: `${arrowSize}px solid rgb(31 41 55 / 0.95)`,
        transform: 'translateY(-50%)'
      };
    } else if (placement === 'right' || placement === 'right-constrained') {
      // Arrow points left to marker
      const arrowY = Math.max(20, Math.min(280, (markerY || 0) - pixelPosition.y + 160));
      return {
        position: 'absolute',
        left: '-8px',
        top: `${arrowY}px`,
        width: 0,
        height: 0,
        borderTop: `${arrowSize}px solid transparent`,
        borderBottom: `${arrowSize}px solid transparent`,
        borderRight: `${arrowSize}px solid rgb(31 41 55 / 0.95)`,
        transform: 'translateY(-50%)'
      };
    }
    return {};
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute z-50 bg-gray-800/95 backdrop-blur-lg rounded-xl border border-gray-700 shadow-2xl"
      style={{
        left: `${pixelPosition.x}px`,
        top: `${pixelPosition.y}px`,
        width: '300px',
        maxHeight: '320px',
        transform: (pixelPosition.placement?.includes('top') || pixelPosition.placement?.includes('bottom')) 
          ? 'translateX(-50%)' 
          : 'none',
        // ✅ FORCE BOUNDARIES (safety net)
        maxWidth: `${(pixelPosition.mapWidth || 800) - 32}px`,
      }}
    >
      {/* ✅ SMART ARROW */}
      <div style={getArrowStyles() as React.CSSProperties} />
      
      {/* Rest of component remains the same */}
      {/* Header with count and close button */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <div className="text-sm text-gray-300">
          {currentIndex + 1} of {spaces.length} spaces
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Space preview */}
      <div className="p-3">
        <div className="space-y-3">
          {/* Image */}
          <div className="relative w-full h-32 rounded-lg overflow-hidden">
            <img
              src={currentSpace.images || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400'}
              alt={getAreaName(currentSpace)}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400';
              }}
            />
            <div className="absolute bottom-2 right-2">
              <div className="bg-gray-900/90 text-lime-400 text-xs font-bold px-2 py-1 rounded">
                {getAreaPrice(currentSpace)}
              </div>
            </div>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-semibold text-white text-sm leading-tight">
              {getAreaName(currentSpace)}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {currentSpace.propertyName}
            </p>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <MapPin className="w-3 h-3 mr-1" />
              {currentSpace.propertyAddress}
            </div>
          </div>

          {/* Navigation arrows and details button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {/* Previous button */}
              <button
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={!hasPrev}
                className={`p-1 rounded transition-colors ${
                  hasPrev 
                    ? 'hover:bg-gray-700 text-gray-300' 
                    : 'text-gray-600 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Space indicators */}
              <div className="flex items-center gap-1 mx-2">
                {spaces.slice(0, 3).map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-sm ${
                      index === currentIndex ? 'bg-lime-400' : 'bg-gray-600'
                    }`}
                  />
                ))}
                {spaces.length > 3 && (
                  <div className="text-xs text-gray-500 ml-1">
                    +{spaces.length - 3}
                  </div>
                )}
              </div>

              {/* Next button */}
              <button
                onClick={() => setCurrentIndex(Math.min(spaces.length - 1, currentIndex + 1))}
                disabled={!hasNext}
                className={`p-1 rounded transition-colors ${
                  hasNext 
                    ? 'hover:bg-gray-700 text-gray-300' 
                    : 'text-gray-600 cursor-not-allowed'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Details button */}
            <button
              onClick={() => onSpaceClick(currentSpace)}
              className="bg-lime-400 text-gray-900 text-xs px-3 py-1 rounded hover:bg-lime-500 transition-colors font-medium"
            >
              Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Global type declarations
interface GoogleMapsWindow extends Window {
  google: any;
  initMainGoogleMap?: () => void;
}

declare const window: GoogleMapsWindow;

// ✅ Enhanced color system for areas
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
  
  // ✅ NEW: Dropdown state
  const [activeDropdown, setActiveDropdown] = useState<{
    spaces: AdvertisingArea[];
    position: LatLng;
  } | null>(null);

  // ✅ Group spaces by property location
  const groupSpacesByLocation = (spaces: AdvertisingArea[]) => {
    const grouped = new Map<string, AdvertisingArea[]>();
    
    spaces.forEach(space => {
      if (space.propertyCoords) {
        const key = `${space.propertyCoords.lat.toFixed(6)},${space.propertyCoords.lng.toFixed(6)}`;
        if (!grouped.has(key)) {
          grouped.set(key, []);
        }
        grouped.get(key)!.push(space);
      }
    });
    
    return grouped;
  };

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

        // Add click listener to close dropdown when clicking elsewhere
        map.addListener('click', (event: google.maps.MapMouseEvent) => {
          setActiveDropdown(null);
          if (onClick) {
            onClick(event);
          }
        });
        
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

  // ✅ Create property markers with space count
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
        
        const { AdvancedMarkerElement } = await window.google.maps.importLibrary("marker");

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

          const spaceCount = property.advertising_areas?.length || 0;
          
          // ✅ NEW: Create custom marker with space count
          const markerElement = document.createElement('div');
          markerElement.className = 'flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full border-2 border-white shadow-lg cursor-pointer hover:bg-blue-600 transition-colors';
          markerElement.style.fontSize = '12px';
          markerElement.style.fontWeight = 'bold';
          markerElement.textContent = spaceCount.toString();
          markerElement.title = `${property.title || property.name || 'Property'} - ${spaceCount} spaces`;

          const marker = new AdvancedMarkerElement({
            map: mapInstanceRef.current,
            position,
            content: markerElement,
            gmpClickable: true,
          });

          // ✅ NEW: Show dropdown on property marker click
          marker.addListener('click', (e: any) => {
            e.stop(); // Prevent map click
            console.log('🏢 Property clicked:', property.title, 'with', spaceCount, 'spaces');
            
            // Get spaces for this property from advertisingAreas prop
            const propertySpaces = advertisingAreas.filter(space => 
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
              // Fallback to property click handler
              onPropertyClick(property);
            }
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
  }, [properties, advertisingAreas, isMapReady, onPropertyClick, showPropertyMarkers]);

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
      
      {/* ✅ NEW: Space dropdown */}
      {activeDropdown && mapInstanceRef.current && onAreaClick && (
        <SpaceDropdown
          spaces={activeDropdown.spaces}
          position={activeDropdown.position}
          onSpaceClick={(space) => {
            setActiveDropdown(null);
            onAreaClick(space);
          }}
          onClose={() => setActiveDropdown(null)}
          map={mapInstanceRef.current}
        />
      )}
      
      {/* ✅ Status indicator */}
      {isMapReady && (
        <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md border border-white/20">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm font-medium text-white">
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