// src/components/map/SimpleBrowseMap.tsx
// Simplified Google Map component specifically for the browse page

import React, { useEffect, useRef, useState } from 'react';
import { GoogleMapsApiLoader } from '@/lib/google-maps';

interface Property {
 id: string;
 title: string;
 name?: string;
 address: string;
 city: string;
 state?: string;
 latitude: number;
 longitude: number;
 basePrice?: number;
 primary_image?: string;
 propertyType?: string;
 isActive?: boolean;
}

interface SimpleBrowseMapProps {
 properties: Property[];
 onPropertyClick: (property: Property) => void;
 center?: { lat: number; lng: number };
 zoom?: number;
 className?: string;
}

const SimpleBrowseMap: React.FC<SimpleBrowseMapProps> = ({
 properties,
 onPropertyClick,
 center = { lat: 33.7175, lng: -117.8311 }, // Orange County center
 zoom = 10,
 className = ''
}) => {
 const mapRef = useRef<HTMLDivElement>(null);
 const googleMapRef = useRef<google.maps.Map | null>(null);
 const markersRef = useRef<google.maps.Marker[]>([]);
 const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
 
 const [isMapReady, setIsMapReady] = useState(false);
 const [isLoading, setIsLoading] = useState(true);

 // Initialize Google Maps
 useEffect(() => {
 const initializeMap = async () => {
 if (!mapRef.current) return;

 try {
 setIsLoading(true);
 
 // Load Google Maps API
 await GoogleMapsApiLoader.load(import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '');
 
 // Create map
 const map = new google.maps.Map(mapRef.current, {
 center,
 zoom,
 mapTypeControl: false,
 streetViewControl: false,
 fullscreenControl: true,
 gestureHandling: 'greedy',
 styles: [
 {
 featureType: 'poi',
 elementType: 'labels',
 stylers: [{ visibility: 'off' }]
 }
 ]
 });

 googleMapRef.current = map;
 
 // Create info window
 infoWindowRef.current = new google.maps.InfoWindow();
 
 setIsMapReady(true);
 console.log('🗺️ Google Maps initialized successfully');
 
 } catch (error) {
 console.error('❌ Error initializing Google Maps:', error);
 } finally {
 setIsLoading(false);
 }
 };

 initializeMap();
 }, [center.lat, center.lng, zoom]);

 // Update map center when center prop changes
 useEffect(() => {
 if (googleMapRef.current && isMapReady) {
 googleMapRef.current.setCenter(center);
 googleMapRef.current.setZoom(zoom);
 }
 }, [center, zoom, isMapReady]);

 // Create property markers
 useEffect(() => {
 if (!googleMapRef.current || !isMapReady || !properties.length) return;

 console.log(`📍 Creating markers for ${properties.length} properties`);

 // Clear existing markers
 markersRef.current.forEach(marker => marker.setMap(null));
 markersRef.current = [];

 // Create new markers
 properties.forEach(property => {
 if (!property.latitude || !property.longitude) {
 console.warn('⚠️ Property missing coordinates:', property.title);
 return;
 }

 const position = {
 lat: property.latitude,
 lng: property.longitude
 };

 // Create marker
 const marker = new google.maps.Marker({
 position,
 map: googleMapRef.current,
 title: property.title || property.name,
 icon: {
 path: google.maps.SymbolPath.CIRCLE,
 scale: 8,
 fillColor: property.isActive !== false ? '#3b82f6' : '#6b7280',
 fillOpacity: 1,
 strokeColor: '#ffffff',
 strokeWeight: 2
 }
 });

 // Create info window content
 const infoContent = `
 <div style="padding: 8px; max-width: 250px;">
 <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: #1f2937;">
 ${property.title || property.name}
 </h3>
 <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280;">
 📍 ${property.city}, ${property.state || 'CA'}
 </p>
 ${property.basePrice ? `
 <p style="margin: 0 0 8px 0; font-size: 12px; color: #059669; font-weight: bold;">
 💰 From $${property.basePrice}/day
 </p>
 ` : ''}
 <button 
 onclick="window.handlePropertyClick('${property.id}')"
 style="
 background: #3b82f6; 
 color: white; 
 border: none; 
 padding: 6px 12px; 
 border-radius: 6px; 
 font-size: 12px; 
 cursor: pointer;
 width: 100%;
 "
>
 View Details
 </button>
 </div>
 `;

 // Add click listener to marker
 marker.addListener('click', () => {
 if (infoWindowRef.current) {
 infoWindowRef.current.setContent(infoContent);
 infoWindowRef.current.open(googleMapRef.current, marker);
 }
 });

 markersRef.current.push(marker);
 });

 console.log(`✅ Created ${markersRef.current.length} markers`);

 // Fit map to show all markers if multiple properties
 if (properties.length> 1) {
 const bounds = new google.maps.LatLngBounds();
 properties.forEach(property => {
 if (property.latitude && property.longitude) {
 bounds.extend({ lat: property.latitude, lng: property.longitude });
 }
 });
 googleMapRef.current.fitBounds(bounds);
 }

 }, [properties, isMapReady, onPropertyClick]);

 // Set up global property click handler
 useEffect(() => {
 (window as any).handlePropertyClick = (propertyId: string) => {
 const property = properties.find(p => p.id === propertyId);
 if (property) {
 onPropertyClick(property);
 }
 };

 return () => {
 delete (window as any).handlePropertyClick;
 };
 }, [properties, onPropertyClick]);

 if (isLoading) {
 return (
 <div className={`relative ${className}`} style={{ height: '100%', width: '100%' }}>
 <div className="absolute inset-0 bg-muted flex items-center justify-center rounded-lg">
 <div className="text-center">
 <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
 <p className="text-sm text-muted-foreground">Loading map...</p>
 </div>
 </div>
 </div>
 );
 }

 return (
 <div className={`relative ${className}`} style={{ height: '100%', width: '100%' }}>
 <div 
 ref={mapRef} 
 className="w-full h-full"
 style={{ minHeight: '400px' }}
 />
 
 {!isMapReady && (
 <div className="absolute inset-0 bg-muted/50 flex items-center justify-center">
 <div className="text-center bg-background/90 p-4 rounded-lg">
 <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
 <p className="text-xs text-muted-foreground">Initializing map...</p>
 </div>
 </div>
 )}
 </div>
 );
};

export default SimpleBrowseMap;