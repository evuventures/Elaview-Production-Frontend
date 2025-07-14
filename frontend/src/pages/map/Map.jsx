import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from 'react-router-dom'; // ✅ ADD THIS
import { Property, AdvertisingArea } from '@/api/entities';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, Loader2, Building2, Camera, Zap, ArrowLeft } from "lucide-react";
import GoogleMap from "@/components/browse/maps/GoogleMap";
import MapSearchFilter from "@/components/search/MapSearchFilter";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from '@clerk/clerk-react';

// Distance calculation utility
const getDistanceInKm = (lat1, lon1, lat2, lon2) => {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return Infinity;
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Helper functions for Properties
const getPropertyCoords = (property) => {
  if (property.latitude && property.longitude) {
    return { lat: property.latitude, lng: property.longitude };
  }
  return null;
};

const getPropertyAddress = (property) => {
  if (property.address) {
    const parts = [property.address];
    if (property.city) parts.push(property.city);
    if (property.state) parts.push(property.state);
    return parts.join(', ');
  }
  if (property.city && property.state) return `${property.city}, ${property.state}`;
  return 'Address not available';
};

const getPropertyName = (property) => {
  return property.title || property.name || 'Unnamed Property';
};

const getPropertyType = (property) => {
  const type = property.propertyType || property.type;
  
  const typeLabels = {
    'BUILDING': 'Building',
    'OFFICE': 'Office Building',
    'RETAIL': 'Retail Space',
    'COMMERCIAL': 'Commercial',
    'WAREHOUSE': 'Warehouse',
    'OTHER': 'Other'
  };
  
  return typeLabels[type] || (type ? type.charAt(0).toUpperCase() + type.slice(1).toLowerCase() : 'Property');
};

// Helper functions for AdvertisingAreas
const getAreaName = (area) => {
  return area.name || area.title || 'Unnamed Advertising Area';
};

const getAreaType = (area) => {
  const type = area.type;
  const typeLabels = {
    'billboard': 'Billboard',
    'digital_display': 'Digital Display',
    'wall_graphic': 'Wall Graphic',
    'floor_graphic': 'Floor Graphic',
    'window_display': 'Window Display',
    'mall_kiosk': 'Mall Kiosk',
    'building_wrap': 'Building Wrap',
    'elevator_display': 'Elevator Display',
    'parking_totem': 'Parking Totem',
    'platform_display': 'Platform Display',
    'bus_shelter': 'Bus Shelter',
    'gallery_storefront': 'Gallery Storefront',
    'coastal_billboard': 'Coastal Billboard',
    'other': 'Other'
  };
  return typeLabels[type] || (type ? type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ') : 'Advertising Area');
};

const getAreaPrice = (area) => {
  if (area.baseRate) {
    const rateType = area.rateType || 'DAILY';
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

export default function MapPage() {
  const navigate = useNavigate(); // ✅ ADD THIS
  
  // Core state
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [propertyAreas, setPropertyAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAreas, setIsLoadingAreas] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mapCenter, setMapCenter] = useState({ lat: 33.7175, lng: -117.8311 }); // Orange County
  const [mapZoom, setMapZoom] = useState(12);
  const [userLocation, setUserLocation] = useState(null);
  const [viewMode, setViewMode] = useState('properties'); // 'properties' or 'areas'
  
  // ✨ NEW: Animation and interaction states
  const [animatingProperty, setAnimatingProperty] = useState(null);
  const [searchHighlight, setSearchHighlight] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const { user: currentUser } = useUser();
  const isMountedRef = useRef(true);

  // Load properties data
  const loadPropertiesData = async () => {
    if (!isMountedRef.current) return;
    
    setIsLoading(true);
    try {
      console.log('🗺️ Loading properties data...');
      
      const propertiesData = await Property.list();

      if (!isMountedRef.current) {
        console.log('🗺️ Component unmounted during properties loading, aborting');
        return;
      }

      // Filter properties that have valid coordinates
      const validProperties = propertiesData.filter(property => {
        const coords = getPropertyCoords(property);
        return coords !== null;
      });

      console.log(`🏢 Properties loaded: ${validProperties.length}/${propertiesData.length} with coordinates`);

      if (isMountedRef.current) {
        setProperties(validProperties);

        // Center map on first property if available
        if (validProperties.length > 0) {
          const firstPropertyCoords = getPropertyCoords(validProperties[0]);
          if (firstPropertyCoords) {
            setMapCenter(firstPropertyCoords);
          }
        }
      }
    } catch (error) {
      console.error("❌ Error loading properties data:", error);
      if (isMountedRef.current) {
        setProperties([]);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  // Load advertising areas for selected property
  const loadPropertyAreas = async (property) => {
    if (!isMountedRef.current || !property) return;
    
    setIsLoadingAreas(true);
    try {
      console.log('📍 Loading advertising areas for property:', property.id);
      
      const propertySpecificAreas = property.advertising_areas || [];

      console.log(`📍 Found ${propertySpecificAreas.length} advertising areas for property`);

      if (isMountedRef.current) {
        setPropertyAreas(propertySpecificAreas);
        setViewMode('areas');
      }
    } catch (error) {
      console.error("❌ Error loading property areas:", error);
      if (isMountedRef.current) {
        setPropertyAreas([]);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoadingAreas(false);
      }
    }
  };

  // Component mount/unmount
  useEffect(() => {
    console.log('🗺️ Map component mounting');
    isMountedRef.current = true;
    
    loadPropertiesData();
    
    return () => {
      console.log('🗺️ Map component unmounting');
      isMountedRef.current = false;
      setSelectedProperty(null);
      setSelectedArea(null);
      setProperties([]);
      setPropertyAreas([]);
    };
  }, []);

  // Get user location
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!isMountedRef.current) return;
          
          const userCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          console.log('📍 User location detected:', userCoords);
          setUserLocation(userCoords);
          
          // Center map on user location if no properties
          if (properties.length === 0) {
            setMapCenter({ lat: userCoords.lat, lng: userCoords.lng });
          }
        },
        (error) => {
          console.log("⚠️ Could not get user location:", error.message);
        }
      );
    }
  }, []);

  // ✨ ENHANCED: Search filtering with animation feedback
  const filteredProperties = useMemo(() => {
    if (!searchTerm.trim()) {
      setIsSearching(false);
      return properties;
    }
    
    setIsSearching(true);
    const searchLower = searchTerm.toLowerCase();
    const filtered = properties.filter(property => {
      const name = getPropertyName(property).toLowerCase();
      const address = getPropertyAddress(property).toLowerCase();
      const type = getPropertyType(property).toLowerCase();
      
      return name.includes(searchLower) || 
             address.includes(searchLower) || 
             type.includes(searchLower);
    });
    
    console.log(`🔍 Search "${searchTerm}" found ${filtered.length} properties`);
    
    // Set search highlight and clear it after animation
    setSearchHighlight(searchTerm);
    setTimeout(() => setSearchHighlight(''), 300);
    setTimeout(() => setIsSearching(false), 500);
    
    return filtered;
  }, [searchTerm, properties]);

  // Search filtering for areas
  const filteredAreas = useMemo(() => {
    if (!searchTerm.trim()) {
      return propertyAreas;
    }
    
    const searchLower = searchTerm.toLowerCase();
    const filtered = propertyAreas.filter(area => {
      const name = getAreaName(area).toLowerCase();
      const type = getAreaType(area).toLowerCase();
      
      return name.includes(searchLower) || type.includes(searchLower);
    });
    
    console.log(`🔍 Search "${searchTerm}" found ${filtered.length} advertising areas`);
    return filtered;
  }, [searchTerm, propertyAreas]);

  // Nearby properties calculation
  const nearbyProperties = useMemo(() => {
    if (filteredProperties.length > 0 && mapCenter) {
      const propertiesWithDistance = filteredProperties
        .map(property => {
          const coords = getPropertyCoords(property);
          if (!coords) return null;
          
          return {
            ...property,
            coords,
            distance: getDistanceInKm(mapCenter.lat, mapCenter.lng, coords.lat, coords.lng)
          };
        })
        .filter(property => property !== null)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10);
      
      return propertiesWithDistance;
    }
    
    return [];
  }, [filteredProperties, mapCenter]);

  // Event handlers
  const handlePropertyClick = (property) => {
    if (!isMountedRef.current) return;
    
    console.log('🏢 Property clicked:', property);
    const coords = getPropertyCoords(property);
    if (coords) {
      setSelectedProperty(property);
      setMapCenter(coords);
      setMapZoom(15);
      loadPropertyAreas(property);
    }
  };

  // ✨ ENHANCED: Property card click with animations
  const handlePropertyCardClick = (property) => {
    if (!isMountedRef.current) return;
    
    console.log('📱 Property card clicked:', property);
    setAnimatingProperty(property.id); // Animation feedback
    
    const coords = getPropertyCoords(property);
    if (coords) {
      setMapCenter(coords);
      setMapZoom(16); // Closer zoom for better focus
      setSelectedProperty(property);
      
      // Delayed area loading with animation cleanup
      setTimeout(() => {
        loadPropertyAreas(property);
        setAnimatingProperty(null);
      }, 600);
    }
  };

  const handleAreaClick = (area) => {
    if (!isMountedRef.current) return;
    
    console.log('📍 Advertising area clicked:', area);
    setSelectedArea(area);
  };

  const handleBackToProperties = () => {
    setViewMode('properties');
    setSelectedProperty(null);
    setSelectedArea(null);
    setPropertyAreas([]);
    setMapZoom(12);
  };

  // ✅ NEW: Handle booking navigation
  const handleBookSpace = () => {
    if (!selectedProperty || !selectedArea) {
      console.error('❌ Missing property or area for booking');
      return;
    }
    
    console.log('🎯 Navigating to booking:', {
      propertyId: selectedProperty.id,
      spaceId: selectedArea.id
    });
    
    navigate(`/booking/${selectedProperty.id}/${selectedArea.id}`);
  };

  // Determine what to display in the list
  const currentItems = viewMode === 'properties' ? nearbyProperties : filteredAreas;
  const isShowingAreas = viewMode === 'areas';

  return (
    <div 
      className="w-full bg-background -mb-24 md:-mb-8" 
      style={{ 
        height: 'calc(100vh - 80px)', 
        position: 'relative'
      }}
    >
      {/* Google Map - Fill the available space */}
      <GoogleMap
        properties={filteredProperties.filter(property => 
          property.latitude && property.longitude
        )}
        onPropertyClick={handlePropertyClick}
        center={mapCenter}
        zoom={mapZoom}
        className="absolute inset-0 w-full h-full"
      />

      {/* Desktop Search Panel */}
      <div className="absolute top-4 left-4 right-4 md:left-auto md:w-[480px] z-10 p-3 md:p-6">
        <Card className="shadow-lg rounded-3xl overflow-hidden backdrop-blur-sm bg-background/95">
          <CardContent className="p-6">
            {/* Back button when viewing areas */}
            {isShowingAreas && (
              <div className="mb-4">
                <Button
                  variant="outline"
                  onClick={handleBackToProperties}
                  className="w-full rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Properties
                </Button>
              </div>
            )}

            {/* ✨ ENHANCED: Search input with animation feedback */}
            <div className="relative mb-4">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 transition-all duration-300 ${
                isSearching ? 'text-blue-500 animate-pulse' : ''
              }`} />
              <Input
                placeholder={isShowingAreas ? "Search advertising areas..." : "Search properties, locations..."}
                value={searchTerm}
                onChange={(e) => isMountedRef.current && setSearchTerm(e.target.value)}
                className={`pl-10 rounded-2xl transition-all duration-300 ${
                  searchHighlight ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                }`}
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                </div>
              )}
            </div>
            
            {/* Filter component */}
            {!isShowingAreas && (
              <MapSearchFilter 
                properties={properties}
                onFilter={(filtered) => {
                  if (isMountedRef.current) {
                    console.log('🔍 MapSearchFilter applied:', filtered.length, 'results');
                  }
                }}
                className="mb-4"
              />
            )}
            
            {/* Results list */}
            <ScrollArea className="h-[240px] md:h-[450px] pr-2">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {isShowingAreas 
                      ? `${selectedProperty ? getPropertyName(selectedProperty) : 'Property'} - Advertising Areas`
                      : 'Available Properties'
                    }
                  </span>
                  <span className={`transition-all duration-300 ${
                    isSearching ? 'text-blue-500 font-medium' : ''
                  }`}>
                    {currentItems.length} found
                  </span>
                </div>

                {/* Loading states */}
                {(isLoading || (isShowingAreas && isLoadingAreas)) ? (
                  <div className="text-center text-muted-foreground p-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    {isShowingAreas ? 'Loading advertising areas...' : 'Loading properties...'}
                  </div>
                ) : currentItems.length > 0 ? (
                  /* ✨ ENHANCED: Properties or Areas List with animations */
                  currentItems.map(item => (
                    <Card 
                      key={item.id} 
                      onClick={() => isShowingAreas ? handleAreaClick(item) : handlePropertyCardClick(item)} 
                      className={`cursor-pointer transition-all duration-300 group overflow-hidden rounded-2xl transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] ${
                        animatingProperty === item.id ? 'ring-2 ring-blue-500 scale-[1.02] shadow-lg' : ''
                      } ${searchHighlight && (
                        (isShowingAreas ? getAreaName(item) : getPropertyName(item)).toLowerCase().includes(searchHighlight.toLowerCase()) ||
                        (isShowingAreas ? getAreaType(item) : getPropertyType(item)).toLowerCase().includes(searchHighlight.toLowerCase())
                      ) ? 'ring-1 ring-yellow-400 bg-yellow-50/50' : ''}`}
                    >
                      <CardContent className="p-0 flex items-center">
                        <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden">
                          <img 
                            src={
                              isShowingAreas 
                                ? (item.images || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400')
                                : (item.images?.[0] || item.primary_image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400')
                            } 
                            alt={isShowingAreas ? getAreaName(item) : getPropertyName(item)} 
                            className="w-full h-full object-cover rounded-l-2xl transition-transform duration-300 group-hover:scale-110" 
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400';
                            }}
                          />
                          <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-xs px-1 py-0.5 rounded transition-transform duration-300 group-hover:scale-110">
                            {isShowingAreas ? (
                              item.type === 'digital_display' ? <Zap className="w-3 h-3" /> : <Camera className="w-3 h-3" />
                            ) : (
                              <Building2 className="w-3 h-3" />
                            )}
                          </div>
                        </div>
                        <div className="p-4 flex-1 min-w-0">
                          <h4 className="font-bold text-sm truncate group-hover:text-primary transition-colors duration-300 mb-1">
                            {isShowingAreas ? getAreaName(item) : getPropertyName(item)}
                          </h4>
                          <p className="text-xs text-muted-foreground flex items-center truncate mb-1">
                            <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                            {isShowingAreas ? item.city : `${item.city || 'City'}, ${item.state || 'State'}`}
                          </p>
                          <p className="text-xs text-blue-600 mb-2">
                            {isShowingAreas ? getAreaType(item) : getPropertyType(item)}
                          </p>
                          {isShowingAreas ? (
                            <p className="text-xs font-semibold text-green-600">
                              {getAreaPrice(item)}
                            </p>
                          ) : (
                            <div className="flex justify-between items-center">
                              <p className="text-xs text-muted-foreground">
                                {item.distance ? `${item.distance.toFixed(1)} km away` : ''}
                              </p>
                              <p className="text-xs font-semibold text-blue-600">
                                {item.advertising_areas?.length || 0} areas
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  /* Empty state */
                  <div className="text-center text-muted-foreground p-8">
                    <Building2 className="w-12 h-12 mx-auto mb-3" />
                    <p className="font-medium">
                      {searchTerm 
                        ? `No ${isShowingAreas ? 'advertising areas' : 'properties'} found matching your search.`
                        : `No ${isShowingAreas ? 'advertising areas' : 'properties'} found.`
                      }
                    </p>
                    {searchTerm && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 transition-all duration-300 hover:scale-105"
                        onClick={() => isMountedRef.current && setSearchTerm('')}
                      >
                        Clear search
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Google Map - Takes full available height within Layout container */}
      <div className="absolute inset-0">
        <GoogleMap
          properties={filteredProperties.filter(property => 
            property.latitude && property.longitude
          )}
          onPropertyClick={handlePropertyClick}
          center={mapCenter}
          zoom={mapZoom}
          className="w-full h-full"
        />
      </div>

      {/* ✨ ENHANCED: Property Details Panel with animations */}
      {selectedProperty && viewMode === 'properties' && (
        <Card className="absolute bottom-4 left-4 right-4 md:right-auto md:w-[400px] z-40 shadow-lg rounded-3xl overflow-hidden backdrop-blur-sm bg-background/95 animate-in slide-in-from-bottom-4 duration-500">
          <CardContent className="p-0">
            <div className="relative h-48 overflow-hidden">
              <img 
                src={selectedProperty.images?.[0] || selectedProperty.primary_image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'} 
                alt={getPropertyName(selectedProperty)} 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800';
                }}
              />
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-3 right-3 w-8 h-8 p-0 rounded-full transition-all duration-300 hover:scale-110 active:scale-95"
                onClick={() => isMountedRef.current && setSelectedProperty(null)}
              >
                ✕
              </Button>
              <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1 transition-all duration-300 hover:scale-105">
                <Building2 className="w-3 h-3" />
                {getPropertyType(selectedProperty)}
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-xl font-bold mb-2">{getPropertyName(selectedProperty)}</h3>
                <p className="text-sm text-muted-foreground flex items-center mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  {getPropertyAddress(selectedProperty)}
                </p>
              </div>
              
              {selectedProperty.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {selectedProperty.description}
                </p>
              )}
              
              <div className="space-y-2">
                <Button 
                  className="w-full rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-95"
                  onClick={() => loadPropertyAreas(selectedProperty)}
                  disabled={isLoadingAreas}
                >
                  {isLoadingAreas ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading Areas...
                    </>
                  ) : (
                    `View ${selectedProperty.advertising_areas?.length || 0} Advertising Areas`
                  )}
                </Button>
                <Button variant="outline" className="w-full rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-95">
                  Contact Property Owner
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ✨ ENHANCED: Area Details Panel with animations */}
      {selectedArea && (
        <Card className="absolute bottom-4 left-4 right-4 md:right-auto md:w-[400px] z-40 shadow-lg rounded-3xl overflow-hidden backdrop-blur-sm bg-background/95 animate-in slide-in-from-bottom-4 duration-500">
          <CardContent className="p-0">
            <div className="relative h-48 overflow-hidden">
              <img 
                src={selectedArea.images || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'} 
                alt={getAreaName(selectedArea)} 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800';
                }}
              />
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-3 right-3 w-8 h-8 p-0 rounded-full transition-all duration-300 hover:scale-110 active:scale-95"
                onClick={() => isMountedRef.current && setSelectedArea(null)}
              >
                ✕
              </Button>
              <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1 transition-all duration-300 hover:scale-105">
                {selectedArea.type === 'digital_display' ? <Zap className="w-3 h-3" /> : <Camera className="w-3 h-3" />}
                {getAreaType(selectedArea)}
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-xl font-bold mb-2">{getAreaName(selectedArea)}</h3>
                <p className="text-lg font-bold text-green-600">
                  {getAreaPrice(selectedArea)}
                </p>
              </div>
              
              {selectedArea.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {selectedArea.description}
                </p>
              )}
              
              <div className="space-y-2">
                <Button 
                  onClick={handleBookSpace} // ✅ UPDATED: Use the safe handler
                  className="w-full rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-95"
                >
                  Book This Space
                </Button>
                <Button variant="outline" className="w-full rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-95">
                  View Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ✨ Custom CSS for enhanced animations */}
      <style jsx>{`
        .transition-all {
          transition: all 0.3s ease;
        }
        .hover\\:scale-\\[1\\.02\\]:hover {
          transform: scale(1.02);
        }
        .active\\:scale-\\[0\\.98\\]:active {
          transform: scale(0.98);
        }
        .active\\:scale-95:active {
          transform: scale(0.95);
        }
        .group:hover .group-hover\\:scale-110 {
          transform: scale(1.1);
        }
        .animate-in {
          animation: slideInFromBottom 0.5s ease-out;
        }
        .slide-in-from-bottom-4 {
          animation: slideInFromBottom 0.5s ease-out;
        }
        @keyframes slideInFromBottom {
          from {
            transform: translateY(16px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}