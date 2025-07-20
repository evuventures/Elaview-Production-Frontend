// src/components/browse/maps/GoogleMap.tsx
// ✅ COMPLETE: Enhanced GoogleMap with UX improvements + Original functionality

import React, { useEffect, useRef, useState, useMemo } from 'react';

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
  // ✅ Enhanced hierarchical props
  viewMode?: 'properties' | 'areas';
  selectedProperty?: Property | null;
  advertisingAreas?: AdvertisingArea[];
  onAreaClick?: (area: AdvertisingArea) => void;
  showAreaMarkers?: boolean;
  selectedArea?: AdvertisingArea | null;
}

// Global type declarations
interface GoogleMapsWindow extends Window {
  google: any;
  initMainGoogleMap?: () => void;
}

declare const window: GoogleMapsWindow;

// ✅ ENHANCED: Professional icon system with TypeScript
interface CategoryInfo {
  key: string;
  category: string;
  icon: string;
  color: {
    background: string;
    border: string;
    light: string;
  };
}

const getAreaCategory = (area: AdvertisingArea): CategoryInfo => {
  const type = area.type?.toLowerCase() || '';
  
  // Research-based category system with professional SVG icons
  const categories = {
    digital: {
      name: 'Digital Displays',
      icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 10h1a1 1 0 0 0 0-2H9a1 1 0 0 0 0 2zm0 2a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2H9zm11-3.06a1.31 1.31 0 0 0-.06-.27v-.09c-.05-.1-.11-.2-.16-.29L13.64 2.43a1.006 1.006 0 0 0-.54-.32L12.91 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8.94zM6 18c-.55 0-1-.45-1-1V7c0-.55.45-1 1-1h5v5.59c0 .89 1.08 1.34 1.71.71L17 8.01c.63-.63.18-1.71-.71-1.71H12V4h7.5c.28 0 .5.22.5.5V17c0 .55-.45 1-1 1H6z"/></svg>`,
      color: {
        background: '#059669',
        border: '#047857',
        light: '#d1fae5'
      },
      types: ['digital_display', 'digital_marquee', 'luxury_video_wall', 'elevator_display', 'concourse_display']
    },
    outdoor: {
      name: 'Outdoor Advertising',
      icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 12c0 4.95-4.05 9-9 9s-9-4.05-9-9 4.05-9 9-9 9 4.05 9 9zm-9-7c-3.86 0-7 3.14-7 7s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm1 3h5v2h-5v2l-3-3 3-3v2z"/></svg>`,
      color: {
        background: '#ea580c',
        border: '#c2410c',
        light: '#fed7aa'
      },
      types: ['billboard', 'coastal_billboard', 'building_wrap', 'parking_totem', 'bus_shelter']
    },
    retail: {
      name: 'Retail & Mall',
      icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4V2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v2h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h4zm2-1v1h6V3H9zm11 4H4v13h16V7zm-8 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/></svg>`,
      color: {
        background: '#7c3aed',
        border: '#6d28d9',
        light: '#ede9fe'
      },
      types: ['mall_kiosk', 'window_display', 'gallery_storefront', 'lobby_display']
    },
    transit: {
      name: 'Transit & Transport',
      icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2l2-2h4l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/></svg>`,
      color: {
        background: '#2563eb',
        border: '#1d4ed8',
        light: '#dbeafe'
      },
      types: ['platform_display', 'bus_shelter', 'parking_structure']
    },
    indoor: {
      name: 'Indoor Spaces',
      icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`,
      color: {
        background: '#6b7280',
        border: '#4b5563',
        light: '#f3f4f6'
      },
      types: ['wall_graphic', 'floor_graphic', 'other']
    }
  };
  
  // Find matching category
  for (const [key, category] of Object.entries(categories)) {
    if (category.types.some(t => type.includes(t))) {
      return {
        key,
        category: category.name,
        icon: category.icon,
        color: category.color
      };
    }
  }
  
  // Default to indoor if no match
  return {
    key: 'indoor',
    category: categories.indoor.name,
    icon: categories.indoor.icon,
    color: categories.indoor.color
  };
};

// ✅ Enhanced marker creation with better visibility
const createEnhancedMarker = async (
  position: LatLng, 
  type: string, 
  category: CategoryInfo, 
  isSelected = false
): Promise<google.maps.marker.AdvancedMarkerElement> => {
  const { AdvancedMarkerElement, PinElement } = await window.google.maps.importLibrary("marker");
  
  // Create custom icon element for better visibility
  const iconElement = document.createElement('div');
  iconElement.innerHTML = category.icon;
  iconElement.style.width = '16px';
  iconElement.style.height = '16px';
  iconElement.style.color = 'white';
  
  const scale = isSelected ? 1.8 : 1.4; // Larger selected state
  const pin = new PinElement({
    background: category.color.background,
    borderColor: category.color.border,
    glyphColor: '#ffffff',
    scale: scale,
    glyph: iconElement,
  });
  
  // Add selection ring for enhanced visibility
  if (isSelected) {
    pin.element.style.boxShadow = `0 0 0 4px ${category.color.background}40`;
  }
  
  return new AdvancedMarkerElement({
    position,
    content: pin.element,
    gmpClickable: true,
  });
};

// ✅ RESEARCH-PROVEN: Google's official smooth zoom solution using moveCamera API
// Based on Google's documentation: https://developers.google.com/maps/documentation/javascript/examples/move-camera-ease
const smoothZoomTo = (
  map: google.maps.Map, 
  targetCenter: LatLng, 
  targetZoom: number, 
  duration = 1000
): Promise<void> => {
  return new Promise((resolve) => {
    const startZoom = map.getZoom() || 10;
    const startCenter = map.getCenter();
    if (!startCenter) {
      resolve();
      return;
    }
    
    console.log(`🎬 Starting smooth zoom: ${startZoom} → ${targetZoom} over ${duration}ms`);
    const startTime = performance.now();
    
    // Create camera options object for moveCamera API
    const cameraOptions: google.maps.CameraOptions = {
      center: { lat: startCenter.lat(), lng: startCenter.lng() },
      zoom: startZoom
    };
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Google's recommended easing - Quadratic InOut
      const easeProgress = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      // Update camera options (this is the key - don't call setZoom/setCenter directly)
      cameraOptions.zoom = startZoom + (targetZoom - startZoom) * easeProgress;
      cameraOptions.center = {
        lat: startCenter.lat() + (targetCenter.lat - startCenter.lat()) * easeProgress,
        lng: startCenter.lng() + (targetCenter.lng - startCenter.lng()) * easeProgress
      };
      
      // Use moveCamera instead of setZoom/setCenter for smooth performance
      map.moveCamera(cameraOptions);
      
      // Log progress for debugging
      if (Math.floor(progress * 10) !== Math.floor((progress - 0.1) * 10)) {
        console.log(`🎬 Zoom progress: ${Math.round(progress * 100)}% (zoom: ${cameraOptions.zoom?.toFixed(1)})`);
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Ensure final position is exact
        map.moveCamera({ center: targetCenter, zoom: targetZoom });
        console.log(`✅ Smooth zoom completed: Final zoom ${targetZoom}`);
        resolve();
      }
    };
    
    requestAnimationFrame(animate);
  });
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
  // Enhanced hierarchical props
  viewMode = 'properties',
  selectedProperty = null,
  advertisingAreas = [],
  onAreaClick,
  showAreaMarkers = true,
  selectedArea = null
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const propertyMarkersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const areaMarkersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const clickMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [status, setStatus] = useState('Initializing...');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previousState, setPreviousState] = useState<{
    center: LatLng;
    zoom: number;
  } | null>(null);

  // ✅ NEW: Enhanced navigation functions
  // ✅ NEW: Enhanced navigation functions with performance optimization
  const saveCurrentState = () => {
    if (mapInstanceRef.current) {
      const currentCenter = mapInstanceRef.current.getCenter();
      const currentZoom = mapInstanceRef.current.getZoom();
      
      if (currentCenter && currentZoom) {
        const state = {
          center: { lat: currentCenter.lat(), lng: currentCenter.lng() },
          zoom: currentZoom
        };
        setPreviousState(state);
        console.log('💾 Saved map state:', state);
      }
    }
  };

  const restorePreviousState = async () => {
    if (mapInstanceRef.current && previousState) {
      console.log('🔄 Starting smooth restore to previous state:', previousState);
      setIsTransitioning(true);
      
      try {
        // Enhanced smooth transition with performance logging
        const startTime = performance.now();
        await smoothZoomTo(
          mapInstanceRef.current, 
          previousState.center, 
          previousState.zoom,
          1200 // Optimal duration based on research
        );
        const endTime = performance.now();
        console.log(`⚡ Zoom restoration completed in ${Math.round(endTime - startTime)}ms`);
        
      } catch (error) {
        console.error('❌ Error restoring map state:', error);
      }
      
      setPreviousState(null);
      setIsTransitioning(false);
    }
  };

  // ✅ ENHANCED: Clean up function for all marker types
  const cleanupMarkers = (markerArray: google.maps.marker.AdvancedMarkerElement[]) => {
    markerArray.forEach(marker => {
      if (marker && marker.map) {
        marker.map = null;
      }
    });
    return [];
  };

  // ✅ ORIGINAL: Clean up on unmount
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

  // ✅ ORIGINAL: Initialize map
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
          scaleControl: true,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: true,
          clickableIcons: false,
          // ✅ PERFORMANCE: Optimize for smooth animations based on research
          isFractionalZoomEnabled: true, // Enables smooth zoom
          backgroundColor: '#f5f5f5', // Reduces flash during tile loading
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

  // ✅ ENHANCED: Monitor viewMode changes with performance tracking
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady) return;

    console.log(`🎯 View mode changing to: ${viewMode}`);
    
    if (viewMode === 'areas' && !previousState) {
      // Transitioning to areas view - save current state
      console.log('📸 Saving state before drilling into areas');
      saveCurrentState();
    } else if (viewMode === 'properties' && previousState) {
      // Transitioning back to properties - restore previous state
      console.log('🔙 Restoring previous state for properties view');
      restorePreviousState();
    }
  }, [viewMode, isMapReady]);

  // ✅ ENHANCED: Update map center and zoom when props change (but not during transitions)
  useEffect(() => {
    if (mapInstanceRef.current && isMapReady && !isTransitioning && !previousState) {
      console.log('🗺️ GoogleMap: Updating center/zoom', center, zoom);
      
      // Only update if we're not in the middle of a state transition
      // Smooth pan to new center
      mapInstanceRef.current.panTo(center);
      
      // Smooth zoom change
      if (mapInstanceRef.current.getZoom() !== zoom) {
        mapInstanceRef.current.setZoom(zoom);
      }
    }
  }, [center.lat, center.lng, zoom, isMapReady, isTransitioning, previousState]);

  // ✅ ORIGINAL: Create property markers (only in properties view mode)
  useEffect(() => {
    const createPropertyMarkers = async () => {
      if (!mapInstanceRef.current || !isMapReady || viewMode !== 'properties') {
        // Clean up property markers when not in properties view
        propertyMarkersRef.current = cleanupMarkers(propertyMarkersRef.current);
        return;
      }

      if (!showPropertyMarkers) return;

      try {
        console.log('🏢 GoogleMap: Creating property markers for', properties.length, 'properties');
        
        const { AdvancedMarkerElement, PinElement } = await window.google.maps.importLibrary("marker");

        // Clear existing property markers
        propertyMarkersRef.current = cleanupMarkers(propertyMarkersRef.current);

        // Create new property markers
        const newMarkers = [];
        for (const property of properties) {
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

          // Property markers - larger, blue
          const pin = new PinElement({
            background: '#3b82f6',
            borderColor: '#1d4ed8',
            glyphColor: '#ffffff',
            scale: 1.5, // Much larger for better visibility
          });

          const marker = new AdvancedMarkerElement({
            map: mapInstanceRef.current,
            position,
            content: pin.element,
            title: `${property.title || property.name || 'Property'} - Click to view advertising spaces`,
            gmpClickable: true,
          });

          marker.addListener('click', () => {
            console.log('🏢 GoogleMap: Property marker clicked:', property.title);
            onPropertyClick(property);
          });

          newMarkers.push(marker);
        }

        propertyMarkersRef.current = newMarkers;
        console.log(`🏢 GoogleMap: Created ${newMarkers.length} property markers successfully`);

      } catch (error) {
        console.error('🏢 GoogleMap: Error creating property markers:', error);
      }
    };

    createPropertyMarkers();
  }, [properties, isMapReady, onPropertyClick, showPropertyMarkers, viewMode]);

  // ✅ ENHANCED: Create advertising area markers (only in areas view mode)
  useEffect(() => {
    const createAreaMarkers = async () => {
      if (!mapInstanceRef.current || !isMapReady || viewMode !== 'areas') {
        // Clean up area markers when not in areas view
        areaMarkersRef.current = cleanupMarkers(areaMarkersRef.current);
        return;
      }

      if (!showAreaMarkers || !onAreaClick) return;

      try {
        console.log('📍 GoogleMap: Creating area markers for', advertisingAreas.length, 'areas');

        // Clear existing area markers
        areaMarkersRef.current = cleanupMarkers(areaMarkersRef.current);

        // Create new area markers
        const newMarkers = [];
        for (const area of advertisingAreas) {
          let position: LatLng | null = null;

          // Try to get coordinates from the area
          if (area.coordinates) {
            if (typeof area.coordinates === 'object' && area.coordinates.lat && area.coordinates.lng) {
              position = { lat: area.coordinates.lat, lng: area.coordinates.lng };
            }
          }

          // Fallback: use parent property coordinates if available
          if (!position && selectedProperty && selectedProperty.latitude && selectedProperty.longitude) {
            // Add slight offset for multiple areas in same property
            const areaIndex = advertisingAreas.indexOf(area);
            const offsetLat = (areaIndex * 0.0002) - (advertisingAreas.length * 0.0001);
            const offsetLng = (areaIndex * 0.0002) - (advertisingAreas.length * 0.0001);
            
            position = { 
              lat: selectedProperty.latitude + offsetLat, 
              lng: selectedProperty.longitude + offsetLng 
            };
          }

          if (!position) {
            console.warn('📍 GoogleMap: Skipping area without coordinates:', area.id);
            continue;
          }

          const category = getAreaCategory(area);
          const isSelected = selectedArea?.id === area.id;
          
          const marker = await createEnhancedMarker(position, area.type, category, isSelected);
          marker.map = mapInstanceRef.current;
          marker.addListener('click', () => {
            console.log('📍 GoogleMap: Area marker clicked:', area.name);
            onAreaClick(area);
          });

          newMarkers.push(marker);
        }

        areaMarkersRef.current = newMarkers;
        console.log(`📍 GoogleMap: Created ${newMarkers.length} area markers successfully`);

      } catch (error) {
        console.error('📍 GoogleMap: Error creating area markers:', error);
      }
    };

    createAreaMarkers();
  }, [advertisingAreas, isMapReady, onAreaClick, showAreaMarkers, viewMode, selectedProperty, selectedArea]);

  // ✅ ORIGINAL: Create click marker when marker prop changes
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

  // ✅ Get current marker count for status display
  const markerCounts = useMemo(() => {
    const counts = {
      properties: propertyMarkersRef.current.length,
      areas: areaMarkersRef.current.length,
      total: propertyMarkersRef.current.length + areaMarkersRef.current.length
    };
    
    return counts;
  }, [propertyMarkersRef.current.length, areaMarkersRef.current.length]);

  return (
    <div className={`relative ${className}`} style={{ height: '100%', width: '100%' }}>
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-3xl"
        style={{ minHeight: '300px' }}
      />
      
      {/* ✅ NEW: Enhanced Context Bar with Professional Icons */}
      {isMapReady && (
        <div className="absolute top-4 left-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-xl px-4 py-3 shadow-lg border border-white/20">
          <div className="flex items-center gap-3">
          {/* ✅ ENHANCED: Status Indicator with transition feedback */}
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${
                viewMode === 'properties' ? 'bg-blue-500' : 'bg-green-500'
              } ${isTransitioning ? 'animate-pulse' : ''}`} />
              <span className="font-semibold text-sm">
                {isTransitioning ? (
                  previousState ? 'Returning to previous view...' : 'Loading...'
                ) : 
                 viewMode === 'properties' ? `${markerCounts.properties} Properties` : 
                 `${markerCounts.areas} Advertising Spaces`}
              </span>
            </div>
            
            {/* Property Context */}
            {selectedProperty && viewMode === 'areas' && (
              <>
                <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
                  {selectedProperty.title || selectedProperty.name}
                </span>
              </>
            )}
          </div>
          
          {/* ✅ NEW: Professional Category Legend */}
          {viewMode === 'areas' && advertisingAreas.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Categories:</div>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const uniqueCategories = new Map();
                  advertisingAreas.forEach(area => {
                    const { key, category, icon, color } = getAreaCategory(area);
                    if (!uniqueCategories.has(key)) {
                      uniqueCategories.set(key, { category, icon, color });
                    }
                  });
                  
                  return Array.from(uniqueCategories.values()).map((cat: any, index: number) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs"
                      style={{ backgroundColor: cat.color.light }}
                    >
                      <div 
                        className="w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: cat.color.background }}
                        dangerouslySetInnerHTML={{ __html: cat.icon }}
                      />
                      <span className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {cat.category}
                      </span>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}
        </div>
      )}
      
      {!isMapReady && (
        <div className="absolute inset-0 bg-[hsl(var(--muted))] rounded-3xl flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading map...</p>
            <p className="text-xs text-muted-foreground mt-2">
              {status}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {viewMode === 'properties' 
                ? `${properties.length} properties ready to display`
                : `${advertisingAreas.length} advertising areas ready to display`
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMap;