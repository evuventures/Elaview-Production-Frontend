// src/components/browse/maps/GoogleMap.tsx
// ✅ CLEAN: Simplified GoogleMap with Elaview design system - Deep Teal
// ✅ MOBILE: Disabled default Google Maps controls on mobile
// src/components/browse/maps/GoogleMap.tsx
// ✅ CLEAN: Simplified GoogleMap with Elaview design system - Deep Teal
// ✅ MOBILE: Disabled default Google Maps controls on mobile

import React, { useEffect, useRef, useState } from 'react';
import { X, MapPin, Heart, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import MapPopup from './MapPopup';

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
  // NEW: cart and favorite handlers
  onAddToCart?: (space: Space) => void;
  onToggleFavorite?: (spaceId: string) => void;
  isInCart?: (spaceId: string) => boolean;
  savedSpaces?: Set<string>;
}

// ✅ CLEAN: Simplified Space Dropdown
interface SpaceDropdownProps {
  spaces: Space[];
  position: { lat: number; lng: number };
  onSpaceClick: (space: Space) => void;
  onClose: () => void;
  map: google.maps.Map;
  onAddToCart?: (space: Space) => void;
  onToggleFavorite?: (spaceId: string) => void;
  isInCart?: (spaceId: string) => boolean;
  savedSpaces?: Set<string>;
}

const SpaceDropdown: React.FC<SpaceDropdownProps> = ({ 
  spaces, 
  position, 
  onSpaceClick, 
  onClose,
  map,
  onAddToCart,
  onToggleFavorite,
  isInCart,
  savedSpaces
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pixelPosition, setPixelPosition] = useState<{ x: number; y: number } | null>(null);
  const overlayRef = useRef<google.maps.OverlayView | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [popupSize, setPopupSize] = useState<{ width: number; height: number }>({ width: 300, height: 220 });

  // ✅ Stable overlay to compute pixel anchoring like Airbnb popups
  useEffect(() => {
    const mapDiv = map.getDiv();
    if (!mapDiv) return;

  if (!overlayRef.current) {
      const overlay = new window.google.maps.OverlayView();
      overlay.onAdd = function () {};
      overlay.onRemove = function () {};
      overlay.draw = function () {
        try {
          const projection = this.getProjection();
          if (!projection) return;
          const latLng = new window.google.maps.LatLng(position.lat, position.lng);
          const pixelPos = projection.fromLatLngToDivPixel(latLng);
          if (!pixelPos) return;

          // Clamp horizontally to map bounds; vertical is handled by CSS transform
          const mapRect = mapDiv.getBoundingClientRect();
      const margin = 12; // px padding from edges
      const halfW = popupSize.width / 2;
      let x = Math.max(margin + halfW, Math.min(mapRect.width - margin - halfW, pixelPos.x));
          let y = pixelPos.y;
      setPixelPosition({ x, y });
        } catch {}
      };
      overlay.setMap(map);
      overlayRef.current = overlay;
    } else {
      // Force a draw to refresh position when dependencies change
      overlayRef.current.draw();
    }

    const triggerUpdate = () => overlayRef.current && overlayRef.current.draw();
    const listeners = [
      map.addListener('zoom_changed', triggerUpdate),
      map.addListener('center_changed', triggerUpdate),
      map.addListener('drag', triggerUpdate),
      map.addListener('idle', triggerUpdate)
    ];

    return () => {
      listeners.forEach(l => l?.remove?.());
      if (overlayRef.current) {
        overlayRef.current.setMap(null);
        overlayRef.current = null;
      }
    };
  }, [map, position.lat, position.lng, popupSize.width]);

  // Measure popup size after render to decide vertical placement and clamping
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const measure = () => setPopupSize({ width: el.offsetWidth || 300, height: el.offsetHeight || 220 });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [currentIndex, spaces.length]);

  const currentSpace = spaces[currentIndex];

  const getFirstImage = (space: Space): string | null => {
    const tryArrayFirst = (val: any): string | null => Array.isArray(val) && val.length > 0 ? (val[0] || null) : null;
    // If images is a URL string
    if (typeof space.images === 'string') {
      try {
        // If it's a JSON array string, parse and return first
        if (space.images.trim().startsWith('[')) {
          const arr = JSON.parse(space.images);
          const fromArray = tryArrayFirst(arr);
          if (fromArray) return fromArray;
        }
      } catch {}
      if (space.images.startsWith('http')) return space.images;
    }
    const fromArr = tryArrayFirst((space as any).images);
    if (fromArr) return fromArr;
    const propImg = (space.property as any)?.primary_image || tryArrayFirst((space.property as any)?.images) || tryArrayFirst((space.property as any)?.photos);
    return propImg || null;
  };

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
      ref={containerRef}
      className="absolute z-50 card card-comfortable shadow-soft-lg max-w-xs"
      style={{
        left: `${pixelPosition.x}px`,
        top: `${pixelPosition.y}px`,
        // If not enough room above, place below; else position above marker
        transform: popupSize.height + 16 > (pixelPosition.y ?? 0)
          ? 'translate(-50%, 12px)'
          : 'translate(-50%, calc(-100% - 10px))',
        width: '300px'
      }}
    >
      {/* Image + header actions */}
      {currentSpace && (
        <div className="relative w-full h-36 bg-slate-100 overflow-hidden rounded-md mb-3">
          {getFirstImage(currentSpace) ? (
            <img src={getFirstImage(currentSpace)!} alt={currentSpace.name || currentSpace.title || 'Space'} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No image</div>
          )}
          {/* Nav arrows when multiple */}
          {spaces.length > 1 && (
            <>
              <button
                className="absolute left-1 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 hover:bg-white shadow"
                onClick={() => setCurrentIndex((idx) => (idx - 1 + spaces.length) % spaces.length)}
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4 text-slate-700" />
              </button>
              <button
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 hover:bg-white shadow"
                onClick={() => setCurrentIndex((idx) => (idx + 1) % spaces.length)}
                aria-label="Next"
              >
                <ChevronRight className="w-4 h-4 text-slate-700" />
              </button>
            </>
          )}
          {/* Favorite button */}
          <button
            className="absolute top-1 right-1 p-1.5 rounded-full bg-white/80 hover:bg-white shadow"
            onClick={() => onToggleFavorite?.(currentSpace.id)}
            aria-label="Favorite"
          >
            <Heart className={`w-4 h-4 ${savedSpaces?.has(currentSpace.id) ? 'text-red-500 fill-red-500' : 'text-slate-700'}`} />
          </button>
        </div>
      )}

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

        <div className="flex items-center justify-between gap-2">
          <span
            className="property-price text-white px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap"
            style={{ backgroundColor: '#4668AB' }}
          >
            {getSpacePrice(currentSpace)}
          </span>
          <div className="flex flex-col w-full gap-2">
            <Button
              size="sm"
              onClick={() => onSpaceClick(currentSpace)}
              className="w-full text-white"
              style={{ backgroundColor: '#4668AB' }}
            >
              View Details
            </Button>
            <Button
              size="sm"
              onClick={() => onAddToCart?.(currentSpace)}
              className="w-full flex items-center justify-center gap-1 text-white"
              style={{ backgroundColor: '#4668AB' }}
            >
              <ShoppingCart className="w-4 h-4" />
              {isInCart?.(currentSpace.id) ? 'In Cart' : 'Add to cart'}
            </Button>
          </div>
        </div>

        {/* ✅ Simple navigation if multiple spaces */}
        {spaces.length > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-200">
    {spaces.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
      index === currentIndex ? 'bg-[#4668AB]' : 'bg-slate-300'
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
  onAddToCart,
  onToggleFavorite,
  isInCart,
  savedSpaces,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const propertyMarkersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const clickMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const overlayRef = useRef<google.maps.OverlayView | null>(null);
  const activePopupLatLngRef = useRef<LatLng | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  // Prevent immediate close when marker click also triggers a map click
  const suppressNextMapClickCloseRef = useRef<boolean>(false);
  
  // ✅ NEW: Mobile detection state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // ✅ Simplified popup state
  const [activePopup, setActivePopup] = useState<{
    space: Space;
    position: { x: number; y: number };
  } | null>(null);

  // Helper: project LatLng to pixel coordinates relative to map div
  const projectLatLngToPixel = (latLng: LatLng): { x: number; y: number } | null => {
    if (!mapInstanceRef.current || !window.google?.maps || !overlayRef.current) return null;
    const projection = overlayRef.current.getProjection?.();
    if (!projection) return null;
    const gl = new window.google.maps.LatLng(latLng.lat, latLng.lng);
    const pixel = projection.fromLatLngToDivPixel(gl);
    if (!pixel) return null;
    return { x: pixel.x, y: pixel.y };
  };

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

        // Persistent overlay used for pixel projection
        if (!overlayRef.current) {
          const overlay = new window.google.maps.OverlayView();
          overlay.onAdd = function () {};
          overlay.onRemove = function () {};
          overlay.draw = function () {};
          overlay.setMap(map);
          overlayRef.current = overlay;
        }

        // Add click listener to close popup unless suppressed by a marker click
        map.addListener('click', (event: google.maps.MapMouseEvent) => {
          if (suppressNextMapClickCloseRef.current) {
            // Skip closing once right after a marker click
            suppressNextMapClickCloseRef.current = false;
            return;
          }
          setActivePopup(null);
          onClick?.(event);
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
        const { AdvancedMarkerElement } = await window.google.maps.importLibrary('marker');
        propertyMarkersRef.current = cleanupMarkers(propertyMarkersRef.current);

        const newMarkers: google.maps.marker.AdvancedMarkerElement[] = [];
        const globalSpaces = (spaces && spaces.length > 0) ? spaces : advertisingAreas;

        for (const property of properties) {
          // Determine property position
          let position: LatLng | null = null;
          if (property.latitude && property.longitude) {
            position = { lat: property.latitude, lng: property.longitude };
          } else if (property.coords && property.coords.length === 2) {
            position = { lat: property.coords[0], lng: property.coords[1] };
          }
          if (!position) continue;

          // Determine spaces available for this property
          let propertySpaces: Space[] = [];
          if (property.spaces && property.spaces.length > 0) {
            propertySpaces = property.spaces;
          } else if (globalSpaces && globalSpaces.length > 0) {
            propertySpaces = (globalSpaces as Space[]).filter((space: Space) =>
              space.propertyId === property.id ||
              space.property?.id === property.id ||
              (space.propertyCoords &&
                Math.abs(space.propertyCoords.lat - position!.lat) < 0.001 &&
                Math.abs(space.propertyCoords.lng - position!.lng) < 0.001)
            );
          }

          if (propertySpaces.length === 0) continue;

          // Marker UI
          const count = propertySpaces.length;
          const markerElement = document.createElement('div');
          markerElement.className = 'flex items-center justify-center w-8 h-8 bg-teal-500 text-white rounded-full border-2 border-white shadow-soft cursor-pointer hover:bg-teal-600 transition-all duration-200 hover:scale-110';
          markerElement.style.fontSize = '12px';
          markerElement.style.fontWeight = '600';
          markerElement.textContent = String(count);
          markerElement.title = `${count} space${count !== 1 ? 's' : ''} available`;

          const marker = new AdvancedMarkerElement({
            map: mapInstanceRef.current,
            position,
            content: markerElement,
            gmpClickable: true,
          });

          // On click, show compact popup anchored to marker (support AdvancedMarker 'gmp-click')
          const onMarkerClick = (e: any) => {
            console.debug('[Map] marker click', { propertyId: property.id, spaces: propertySpaces.length });
            // Stop the underlying map click from firing, where supported
            try { e?.domEvent?.stopPropagation?.(); } catch {}
            suppressNextMapClickCloseRef.current = true;
            const targetSpace = propertySpaces[0];
            activePopupLatLngRef.current = position!;
            // Ensure overlay projection has a chance to initialize
            try { overlayRef.current?.draw?.(); } catch {}
            const px = projectLatLngToPixel(position!);
            if (px) {
              console.debug('[Map] setActivePopup immediate', { x: px.x, y: px.y, spaceId: targetSpace.id });
              setActivePopup(prev => {
                if (prev && prev.space.id === targetSpace.id && prev.position.x === px.x && prev.position.y === px.y) return prev;
                return { space: targetSpace, position: px };
              });
            } else {
              // Fallback: use click event screen position relative to wrapper
              const clientX = e?.domEvent?.clientX ?? e?.clientX;
              const clientY = e?.domEvent?.clientY ?? e?.clientY;
              const rect = wrapperRef.current?.getBoundingClientRect?.();
              if (rect && typeof clientX === 'number' && typeof clientY === 'number') {
                const fx = clientX - rect.left;
                const fy = clientY - rect.top;
                console.debug('[Map] setActivePopup from clientXY fallback', { x: fx, y: fy, spaceId: targetSpace.id });
                setActivePopup({ space: targetSpace, position: { x: fx, y: fy } });
              }
              window.google?.maps?.event?.addListenerOnce?.(mapInstanceRef.current!, 'idle', () => {
                const px2 = projectLatLngToPixel(position!);
                if (px2) {
                  console.debug('[Map] setActivePopup on idle', { x: px2.x, y: px2.y, spaceId: targetSpace.id });
                  setActivePopup({ space: targetSpace, position: px2 });
                }
              });
              requestAnimationFrame(() => {
                const px3 = projectLatLngToPixel(position!);
                if (px3) {
                  console.debug('[Map] setActivePopup on rAF', { x: px3.x, y: px3.y, spaceId: targetSpace.id });
                  setActivePopup({ space: targetSpace, position: px3 });
                }
              });
            }
          };
          marker.addListener('click', onMarkerClick);
          // AdvancedMarkerElement emits 'gmp-click' when gmpClickable is true
          // @ts-ignore - event name is supported at runtime
          marker.addListener('gmp-click', onMarkerClick);
          // As an extra safety, also listen on the marker content DOM
          markerElement.addEventListener('click', (evt) => {
            try { evt.stopPropagation(); } catch {}
            onMarkerClick({ domEvent: evt });
          });

          newMarkers.push(marker);
        }

        propertyMarkersRef.current = newMarkers;
      } catch (error) {
        console.error('Error creating property markers:', error);
      }
    };

    createPropertyMarkers();
  }, [properties, spaces, advertisingAreas, isMapReady, showPropertyMarkers]);

  // Keep popup anchored when map moves/zooms
  useEffect(() => {
    if (!mapInstanceRef.current || !activePopup || !activePopupLatLngRef.current) return;
    const map = mapInstanceRef.current;
    const update = () => {
      const px = projectLatLngToPixel(activePopupLatLngRef.current!);
      if (!px) return;
      setActivePopup(prev => {
        if (!prev) return prev;
        if (prev.position.x === px.x && prev.position.y === px.y) return prev;
        return { ...prev, position: px };
      });
    };
    const listeners = [
      map.addListener('zoom_changed', update),
      map.addListener('center_changed', update),
      map.addListener('drag', update),
      map.addListener('idle', update),
    ];
    return () => listeners.forEach(l => l?.remove?.());
  }, [activePopup?.space.id]);

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
    <div ref={wrapperRef} className={`relative ${className}`} style={{ height: '100%', width: '100%' }}>
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-2xl"
        style={{ minHeight: '300px' }}
      />
      
      {/* ✅ Minimal/expandable popup para o space selecionado */}
  {activePopup && mapInstanceRef.current && (
        <div
          style={{
            position: 'absolute',
    left: `${activePopup.position.x || 0}px`,
    top: `${activePopup.position.y || 0}px`,
    transform: 'translate(-50%, calc(-100% - 10px))',
            zIndex: 9999,
            pointerEvents: 'auto',
          }}
        >
          <MapPopup
            space={activePopup.space}
            onClose={() => setActivePopup(null)}
            onAddToCart={onAddToCart}
            onToggleFavorite={onToggleFavorite}
            isInCart={isInCart}
            isFavorite={id => savedSpaces?.has(id) ?? false}
          />
        </div>
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