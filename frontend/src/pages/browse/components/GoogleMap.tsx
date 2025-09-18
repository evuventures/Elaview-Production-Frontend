// src/components/browse/maps/GoogleMap.tsx
// Cleaned version with all debugging logs removed

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, MapPin } from 'lucide-react';
import { Button } from "@/components/ui/button";

// TypeScript Interfaces
interface LatLng {
 lat: number;
 lng: number;
}

interface MapBounds {
 north: number;
 south: number;
 east: number;
 west: number;
}

interface PixelPosition {
 x: number;
 y: number;
}

interface DropdownDimensions {
 width: number;
 height: number;
}

interface MapViewportBounds {
 width: number;
 height: number;
}

interface OptimalPosition {
 x: number;
 y: number;
 placement: 'top' | 'top-end' | 'bottom' | 'bottom-end';
 arrowDirection: 'up' | 'up-right' | 'down' | 'down-right';
}

interface PositioningConfig {
 markerOffset: number;
 boundaryPadding: number;
 arrowSize: number;
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
 advertisingAreas?: Space[];
 onSpaceClick?: (space: Space) => void;
 onAreaClick?: (area: Space) => void;
 showAreaMarkers?: boolean;
 onBoundsChange?: (bounds: MapBounds, zoom: number) => void;
}

// Smart positioning utilities
const POSITIONING_CONFIG: PositioningConfig = {
 markerOffset: 15,
 boundaryPadding: 12,
 arrowSize: 10
};

/**
 * Calculates optimal dropdown position based on marker location in viewport
 */
const calculateOptimalDropdownPosition = (
 markerPixelPos: PixelPosition,
 mapBounds: MapViewportBounds,
 dropdownDimensions: DropdownDimensions
): OptimalPosition => {
 const { x: markerX, y: markerY } = markerPixelPos;
 const { width: mapWidth, height: mapHeight } = mapBounds;
 const { width: dropdownWidth, height: dropdownHeight } = dropdownDimensions;
 const { markerOffset, boundaryPadding } = POSITIONING_CONFIG;
 
 // Determine which quadrant the marker is in
 const isTopHalf = markerY < mapHeight / 2;
 const isLeftHalf = markerX < mapWidth / 2;
 
 let position: OptimalPosition;
 
 if (isTopHalf && isLeftHalf) {
 position = {
 x: markerX,
 y: markerY + markerOffset,
 placement: 'bottom',
 arrowDirection: 'up'
 };
 } else if (isTopHalf && !isLeftHalf) {
 position = {
 x: markerX - dropdownWidth,
 y: markerY + markerOffset,
 placement: 'bottom-end',
 arrowDirection: 'up-right'
 };
 } else if (!isTopHalf && isLeftHalf) {
 position = {
 x: markerX,
 y: markerY - dropdownHeight - markerOffset,
 placement: 'top',
 arrowDirection: 'down'
 };
 } else {
 position = {
 x: markerX - dropdownWidth,
 y: markerY - dropdownHeight - markerOffset,
 placement: 'top-end',
 arrowDirection: 'down-right'
 };
 }
 
 // Apply boundary collision detection and correction
 position.x = Math.max(
 boundaryPadding, 
 Math.min(mapWidth - dropdownWidth - boundaryPadding, position.x)
 );
 position.y = Math.max(
 boundaryPadding, 
 Math.min(mapHeight - dropdownHeight - boundaryPadding, position.y)
 );
 
 return position;
};

/**
 * Debounced position calculator
 */
let positionCalculationTimeout: NodeJS.Timeout | null = null;

const debouncedPositionCalculation = (
 callback: () => void,
 delay: number = 16
): void => {
 if (positionCalculationTimeout) {
 clearTimeout(positionCalculationTimeout);
 }
 positionCalculationTimeout = setTimeout(callback, delay);
};

// Space Dropdown Component
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
 const [pixelPosition, setPixelPosition] = useState<OptimalPosition | null>(null);
 const [imageError, setImageError] = useState(false);
 const dropdownRef = useRef<HTMLDivElement>(null);
 
 const DROPDOWN_DIMENSIONS: DropdownDimensions = {
 width: 320,
 height: 240
 };

 // Smart positioning with quadrant-based algorithm 
 useEffect(() => {
 const updatePosition = () => {
 debouncedPositionCalculation(() => {
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
 const mapBounds: MapViewportBounds = {
 width: mapRect.width,
 height: mapRect.height
 };
 
 const optimalPosition = calculateOptimalDropdownPosition(
 { x: pixelPos.x, y: pixelPos.y },
 mapBounds,
 DROPDOWN_DIMENSIONS
 );
 
 setPixelPosition(optimalPosition);
 }
 }
 overlay.setMap(null);
 };
 overlay.setMap(map);
 });
 };

 updatePosition();
 
 const listeners = [
 map.addListener('zoom_changed', updatePosition),
 map.addListener('center_changed', updatePosition)
 ];

 return () => {
 listeners.forEach(listener => listener?.remove?.());
 if (positionCalculationTimeout) {
 clearTimeout(positionCalculationTimeout);
 }
 };
 }, [position, map]);

 // Reset image error when space changes
 useEffect(() => {
 setImageError(false);
 }, [currentIndex, spaces]);

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

 // Image retrieval based on Prisma schema
 const getSpaceImage = (space: Space) => {
 // Check space.images field (String? from Prisma schema)
 if (space.images && typeof space.images === 'string' && space.images.trim()) {
 return space.images;
 }
 
 // Check if images might be stored as JSON array
 if (space.images && Array.isArray(space.images) && space.images.length> 0) {
 return space.images[0];
 }
 
 // Check property relation images through property.images (Json? from schema)
 if (space.property && space.property.images) {
 if (Array.isArray(space.property.images) && space.property.images.length> 0) {
 return space.property.images[0];
 }
 
 if (typeof space.property.images === 'string') {
 try {
 const parsed = JSON.parse(space.property.images);
 if (Array.isArray(parsed) && parsed.length> 0) {
 return parsed[0];
 }
 } catch (e) {
 // JSON parse failed
 }
 }
 }
 
 // Check property.primary_image (String? from schema)
 if (space.property && space.property.primary_image && space.property.primary_image.trim()) {
 return space.property.primary_image;
 }
 
 // Check property.photos (Json? from schema) 
 if (space.property && space.property.photos) {
 if (Array.isArray(space.property.photos) && space.property.photos.length> 0) {
 return space.property.photos[0];
 }
 
 if (typeof space.property.photos === 'string') {
 try {
 const parsed = JSON.parse(space.property.photos);
 if (Array.isArray(parsed) && parsed.length> 0) {
 return parsed[0];
 }
 } catch (e) {
 // JSON parse failed
 }
 }
 }
 
 return null;
 };

 const navigateToSpace = (direction: 'prev' | 'next') => {
 if (direction === 'prev') {
 setCurrentIndex(currentIndex === 0 ? spaces.length - 1 : currentIndex - 1);
 } else {
 setCurrentIndex(currentIndex === spaces.length - 1 ? 0 : currentIndex + 1);
 }
 };

 if (!pixelPosition || !currentSpace) return null;

 const spaceImage = getSpaceImage(currentSpace);

 return (
 <div
 ref={dropdownRef}
 className="absolute z-50 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden"
 style={{
 left: `${pixelPosition.x}px`,
 top: `${pixelPosition.y}px`,
 width: `${DROPDOWN_DIMENSIONS.width}px`,
 height: `${DROPDOWN_DIMENSIONS.height}px`
 }}
>
 {/* Close button */}
 <button
 onClick={onClose}
 className="absolute top-3 right-3 z-10 p-1.5 bg-white/90 hover:bg-white rounded-full shadow-sm transition-colors"
>
 <X className="w-4 h-4 text-slate-600" />
 </button>

 {/* Image section */}
 <div className="relative h-40 bg-slate-100">
 {spaceImage && !imageError ? (
 <img
 src={spaceImage}
 alt={getSpaceName(currentSpace)}
 className="w-full h-full object-cover"
 onError={() => setImageError(true)}
 />
 ) : (
 <div className="flex items-center justify-center h-full bg-slate-100">
 <div className="text-center">
 <div className="w-12 h-12 bg-slate-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
 <MapPin className="w-6 h-6 text-slate-400" />
 </div>
 <p className="text-sm text-slate-500">No image available</p>
 </div>
 </div>
 )}

 {/* Navigation arrows - only show if multiple spaces */}
 {spaces.length> 1 && (
 <>
 <button
 onClick={() => navigateToSpace('prev')}
 className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 hover:bg-white rounded-full shadow-sm transition-all duration-200 hover:scale-105"
>
 <svg className="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
 </svg>
 </button>
 
 <button
 onClick={() => navigateToSpace('next')}
 className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 hover:bg-white rounded-full shadow-sm transition-all duration-200 hover:scale-105"
>
 <svg className="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
 </svg>
 </button>
 </>
 )}

 {/* Space indicator dots - only show if multiple spaces */}
 {spaces.length> 1 && (
 <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
 {spaces.map((_, index) => (
 <button
 key={index}
 onClick={() => setCurrentIndex(index)}
 className={`w-2 h-2 rounded-full transition-colors ${
 index === currentIndex 
 ? 'bg-white shadow-sm' 
 : 'bg-white/60 hover:bg-white/80'
 }`}
 />
 ))}
 </div>
 )}
 </div>

 {/* Content section */}
 <div className="p-4">
 <div className="space-y-3">
 {/* Space name */}
 <h3 className="font-semibold text-slate-900 text-base leading-tight">
 {getSpaceName(currentSpace)}
 </h3>

 {/* Price and button row */}
 <div className="flex items-center justify-between">
 <span className="bg-teal-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold">
 {getSpacePrice(currentSpace)}
 </span>
 <button 
 onClick={() => onSpaceClick(currentSpace)}
 className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
>
 View Details
 </button>
 </div>
 </div>
 </div>

 {/* Smart directional arrow */}
 <div 
 className={`absolute ${getArrowPositionClasses(pixelPosition.arrowDirection)}`}
 style={getArrowStyles(pixelPosition.arrowDirection)}
 />
 </div>
 );
};

// Helper functions for smart arrow positioning
const getArrowPositionClasses = (direction: OptimalPosition['arrowDirection']): string => {
 switch (direction) {
 case 'up':
 return 'top-0 left-6 transform -translate-y-full';
 case 'up-right': 
 return 'top-0 right-6 transform -translate-y-full';
 case 'down':
 return 'bottom-0 left-6 transform translate-y-full';
 case 'down-right':
 return 'bottom-0 right-6 transform translate-y-full';
 default:
 return 'top-0 left-6 transform -translate-y-full';
 }
};

const getArrowStyles = (direction: OptimalPosition['arrowDirection']): React.CSSProperties => {
 const arrowSize = POSITIONING_CONFIG.arrowSize;
 
 const baseStyles: React.CSSProperties = {
 width: 0,
 height: 0,
 borderStyle: 'solid'
 };
 
 switch (direction) {
 case 'up':
 case 'up-right':
 return {
 ...baseStyles,
 borderLeft: `${arrowSize}px solid transparent`,
 borderRight: `${arrowSize}px solid transparent`,
 borderBottom: `${arrowSize}px solid white`,
 filter: 'drop-shadow(0 -2px 4px rgba(0, 0, 0, 0.1))'
 };
 case 'down':
 case 'down-right':
 return {
 ...baseStyles,
 borderLeft: `${arrowSize}px solid transparent`,
 borderRight: `${arrowSize}px solid transparent`, 
 borderTop: `${arrowSize}px solid white`,
 filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
 };
 default:
 return baseStyles;
 }
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
 advertisingAreas = [],
 onSpaceClick,
 onAreaClick,
 showAreaMarkers = true,
 onBoundsChange
}) => {
 const mapRef = useRef<HTMLDivElement>(null);
 const mapInstanceRef = useRef<google.maps.Map | null>(null);
 const propertyMarkersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
 const clickMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
 const [isMapReady, setIsMapReady] = useState(false);
 
 // Mobile detection state
 const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
 
 // Dropdown state
 const [activeDropdown, setActiveDropdown] = useState<{
 spaces: Space[];
 position: LatLng;
 } | null>(null);

 // Bounds tracking refs
 const boundsListenerRef = useRef<google.maps.MapsEventListener | null>(null);
 const zoomListenerRef = useRef<google.maps.MapsEventListener | null>(null);
 const boundsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

 // Mobile detection
 useEffect(() => {
 const handleResize = () => {
 setIsMobile(window.innerWidth < 768);
 };
 
 window.addEventListener('resize', handleResize);
 return () => window.removeEventListener('resize', handleResize);
 }, []);

 // Debounced bounds change handler
 const handleBoundsChanged = useCallback(() => {
 if (!mapInstanceRef.current || !onBoundsChange) return;

 if (boundsTimeoutRef.current) {
 clearTimeout(boundsTimeoutRef.current);
 }

 boundsTimeoutRef.current = setTimeout(() => {
 const map = mapInstanceRef.current;
 if (!map) return;

 const bounds = map.getBounds();
 const currentZoom = map.getZoom();
 
 if (bounds && currentZoom) {
 const boundsObj: MapBounds = {
 north: bounds.getNorthEast().lat(),
 south: bounds.getSouthWest().lat(),
 east: bounds.getNorthEast().lng(),
 west: bounds.getSouthWest().lng()
 };

 onBoundsChange(boundsObj, currentZoom);
 }
 }, 300);
 }, [onBoundsChange]);

 // Clean up function
 const cleanupMarkers = (markerArray: google.maps.marker.AdvancedMarkerElement[]) => {
 markerArray.forEach(marker => {
 if (marker && marker.map) {
 marker.map = null;
 }
 });
 return [];
 };

 // Clean up bounds listeners
 const cleanupBoundsListeners = useCallback(() => {
 if (boundsListenerRef.current) {
 boundsListenerRef.current.remove();
 boundsListenerRef.current = null;
 }
 if (zoomListenerRef.current) {
 zoomListenerRef.current.remove();
 zoomListenerRef.current = null;
 }
 if (boundsTimeoutRef.current) {
 clearTimeout(boundsTimeoutRef.current);
 boundsTimeoutRef.current = null;
 }
 }, []);

 // Clean up on unmount
 useEffect(() => {
 return () => {
 propertyMarkersRef.current = cleanupMarkers(propertyMarkersRef.current);
 if (clickMarkerRef.current && clickMarkerRef.current.map) {
 clickMarkerRef.current.map = null;
 }
 cleanupBoundsListeners();
 mapInstanceRef.current = null;
 };
 }, [cleanupBoundsListeners]);

 // Initialize map
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
 
 const map = new Map(mapRef.current, {
 center,
 zoom,
 mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID',
 gestureHandling: 'greedy',
 disableDefaultUI: isMobile,
 zoomControl: !isMobile,
 mapTypeControl: false,
 scaleControl: false,
 streetViewControl: false,
 rotateControl: false,
 fullscreenControl: !isMobile,
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

 // Setup bounds change listeners
 if (onBoundsChange) {
 boundsListenerRef.current = map.addListener('bounds_changed', handleBoundsChanged);
 zoomListenerRef.current = map.addListener('zoom_changed', handleBoundsChanged);
 
 // Trigger initial bounds callback
 setTimeout(() => {
 handleBoundsChanged();
 }, 1000);
 }
 
 setIsMapReady(true);

 } catch (error) {
 console.error('Error creating map:', error);
 }
 };

 initMap();
 }, [isMobile, onBoundsChange, handleBoundsChanged]);

 // Update map center and zoom when props change
 useEffect(() => {
 if (mapInstanceRef.current && isMapReady) {
 mapInstanceRef.current.panTo(center);
 if (mapInstanceRef.current.getZoom() !== zoom) {
 mapInstanceRef.current.setZoom(zoom);
 }
 }
 }, [center.lat, center.lng, zoom, isMapReady]);

 // Create property markers
 useEffect(() => {
 const createPropertyMarkers = async () => {
 if (!mapInstanceRef.current || !isMapReady || !showPropertyMarkers) {
 propertyMarkersRef.current = cleanupMarkers(propertyMarkersRef.current);
 return;
 }

 try {
 const propertiesWithSpaces = properties.filter(property => 
 property.spaces && property.spaces.length> 0
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
 
 // Simple marker design
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

 // Mobile-aware property marker click handler
 marker.addListener('click', (e: any) => {
 e.stop();
 
 const isCurrentlyMobile = window.innerWidth < 768;
 
 if (isCurrentlyMobile) {
 onPropertyClick(property);
 } else {
 // Use spaces or fallback to advertisingAreas
 const allSpaces = spaces.length> 0 ? spaces : advertisingAreas;
 const propertySpaces = allSpaces.filter(space => 
 space.propertyId === property.id || 
 space.property?.id === property.id ||
 (space.propertyCoords && 
 Math.abs(space.propertyCoords.lat - position!.lat) < 0.001 &&
 Math.abs(space.propertyCoords.lng - position!.lng) < 0.001)
 );

 if (propertySpaces.length> 0) {
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

 // Create click marker when marker prop changes
 useEffect(() => {
 const createClickMarker = async () => {
 if (!mapInstanceRef.current || !isMapReady || !marker) return;

 try {
 const { AdvancedMarkerElement, PinElement } = await window.google.maps.importLibrary("marker");

 if (clickMarkerRef.current) {
 clickMarkerRef.current.map = null;
 }

 const pin = new PinElement({
 background: '#0f766e',
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
 
 {/* Space dropdown */}
 {activeDropdown && mapInstanceRef.current && (onSpaceClick || onAreaClick) && (
 <SpaceDropdown
 spaces={activeDropdown.spaces}
 position={activeDropdown.position}
 onSpaceClick={(space) => {
 setActiveDropdown(null);
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
 
 {/* Loading state */}
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