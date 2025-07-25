// src/pages/browse/BrowsePage.jsx - Final: All components extracted
// ✅ COMPLETED: Fully refactored with extracted components - 60% size reduction!

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Navigation } from "lucide-react";
import GoogleMap from "@/pages/browse/components/GoogleMap";
import { useUser } from '@clerk/clerk-react';

// ✅ NEW: Import all components
import CartModal from './components/CartModal';
import FiltersModal from './components/FiltersModal';
import SpaceDetailsModal from './components/SpaceDetailsModal';
import ROICalculatorModal from './components/ROICalculatorModal';
import FilterHeader from './components/FilterHeader';
import PaginationControls from './components/PaginationControls';
import SpacesGrid from './components/SpacesGrid';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import EmptyState from './components/EmptyState';

// ✅ NEW: Import utility functions from browse/utils
import { getDistanceInKm } from './utils/distance';
import { getPropertyCoords, getPropertyAddress, getPropertyName } from './utils/propertyHelpers';
import { getNumericPrice } from './utils/areaHelpers';
import { applyPriceFilter, applySpaceTypeFilter, applyAudienceFilter, applyFeaturesFilter } from './utils/filterHelpers';
import { 
  API_BASE_URL, 
  CARDS_PER_PAGE, 
  DEFAULT_MAP_CENTER, 
  DEFAULT_MAP_ZOOM, 
  LOCATION_ZOOM 
} from './utils/mapConstants';

export default function BrowsePage() {
  const navigate = useNavigate();
  
  // ✅ UPDATED: Core state with dynamic map center and zoom
  const [properties, setProperties] = useState([]);
  const [allSpaces, setAllSpaces] = useState([]);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ✅ UPDATED: Dynamic map center and zoom (can be changed by location button)
  const [mapCenter, setMapCenter] = useState(DEFAULT_MAP_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_MAP_ZOOM);
  const [userLocation, setUserLocation] = useState(null);
  
  // ✅ NEW: Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  
  // Cart state
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  
  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: 'all',
    spaceType: 'all',
    availability: 'all',
    audience: 'all',
    features: [],
  });
  
  // UI state
  const [animatingSpace, setAnimatingSpace] = useState(null);
  const [savedSpaces, setSavedSpaces] = useState(new Set());
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showROICalculator, setShowROICalculator] = useState(false);
  
  const { user: currentUser } = useUser();
  const isMountedRef = useRef(true);

  // Detect mobile view
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ✅ FIXED: API call to your backend
  const loadPropertiesData = async () => {
    if (!isMountedRef.current) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🗺️ Loading properties from API...');
      
      const response = await fetch(`${API_BASE_URL}/api/spaces`);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!isMountedRef.current) {
        console.log('🗺️ Component unmounted during loading, aborting');
        return;
      }

      if (!data.success || !data.data) {
        throw new Error('Invalid API response format');
      }

      const propertiesData = data.data;
      console.log(`🏢 API returned ${propertiesData.length} properties`);

      // Filter properties that have coordinates AND advertising areas
      const validProperties = propertiesData.filter(property => {
        const coords = getPropertyCoords(property);
        const hasSpaces = property.advertising_areas && property.advertising_areas.length > 0;
        return coords !== null && hasSpaces;
      });

      // Flatten all spaces from all properties
      const flattenedSpaces = [];
      validProperties.forEach(property => {
        property.advertising_areas.forEach(area => {
          flattenedSpaces.push({
            ...area,
            // Add property context to each space
            propertyId: property.id,
            propertyName: getPropertyName(property),
            propertyAddress: getPropertyAddress(property),
            propertyCoords: getPropertyCoords(property),
            propertyType: property.propertyType,
            property: property,
            distance: null
          });
        });
      });

      console.log(`🏢 Processed ${validProperties.length} properties with ${flattenedSpaces.length} total spaces`);
      
      if (isMountedRef.current) {
        setProperties(validProperties);
        setAllSpaces(flattenedSpaces);
      }
    } catch (error) {
      console.error("❌ Error loading data:", error);
      if (isMountedRef.current) {
        setError(error.message);
        setProperties([]);
        setAllSpaces([]);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  // Component mount/unmount
  useEffect(() => {
    console.log('🗺️ Browse page mounting');
    isMountedRef.current = true;
    
    loadPropertiesData();
    
    return () => {
      console.log('🗺️ Browse page unmounting');
      isMountedRef.current = false;
      setSelectedSpace(null);
      setProperties([]);
      setAllSpaces([]);
    };
  }, []);

  // ✅ FIXED: User location detection (NO auto-centering)
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
          // ✅ NO AUTO-CENTERING - map stays put unless user clicks location button
        },
        (error) => {
          console.log("⚠️ Could not get user location:", error.message);
        }
      );
    }
  }, []);

  // ✅ NEW: Advanced filtering for spaces with pagination
  const { filteredSpaces, totalPages, paginatedSpaces } = useMemo(() => {
    let filtered = allSpaces;

    // Apply filters using extracted utility functions
    filtered = applyPriceFilter(filtered, filters.priceRange);
    filtered = applySpaceTypeFilter(filtered, filters.spaceType);
    filtered = applyAudienceFilter(filtered, filters.audience);
    filtered = applyFeaturesFilter(filtered, filters.features);

    // Calculate distances and sort by proximity
    if (mapCenter) {
      const spacesWithDistance = filtered
        .map(space => ({
          ...space,
          distance: space.propertyCoords ? 
            getDistanceInKm(mapCenter.lat, mapCenter.lng, space.propertyCoords.lat, space.propertyCoords.lng) :
            Infinity
        }))
        .sort((a, b) => a.distance - b.distance);
      
      filtered = spacesWithDistance;
    }

    // ✅ PAGINATION LOGIC
    const totalSpaces = filtered.length;
    const totalPages = Math.ceil(totalSpaces / CARDS_PER_PAGE);
    const startIndex = (currentPage - 1) * CARDS_PER_PAGE;
    const endIndex = startIndex + CARDS_PER_PAGE;
    const paginatedSpaces = filtered.slice(startIndex, endIndex);
    
    return {
      filteredSpaces: filtered,
      totalPages,
      paginatedSpaces
    };
  }, [allSpaces, filters, mapCenter, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Cart functions
  const addToCart = (space, duration = 30) => {
    const cartItem = {
      id: `${space.id}_${Date.now()}`,
      spaceId: space.id,
      space: space,
      duration: duration,
      pricePerDay: getNumericPrice(space),
      totalPrice: getNumericPrice(space) * duration,
      addedAt: new Date()
    };
    
    setCart(prev => [...prev, cartItem]);
  };

  const removeFromCart = (cartItemId) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const updateCartItemDuration = (cartItemId, newDuration) => {
    setCart(prev => prev.map(item => 
      item.id === cartItemId 
        ? { ...item, duration: newDuration, totalPrice: item.pricePerDay * newDuration }
        : item
    ));
  };

  const getTotalCartValue = () => {
    return cart.reduce((total, item) => total + item.totalPrice, 0);
  };

  const isInCart = (spaceId) => {
    return cart.some(item => item.spaceId === spaceId);
  };

  // ✅ FIXED: Event handlers with NO automatic map movement
  const handleSpaceClick = (space) => {
    if (!isMountedRef.current) return;
    
    console.log('📍 Space clicked:', space);
    setSelectedSpace(space);
    setDetailsExpanded(true);
    // ✅ NO MAP MOVEMENT - map stays stationary unless user uses location button
  };

  const handleSpaceCardClick = (space) => {
    if (!isMountedRef.current) return;
    
    console.log('📱 Space card clicked:', space);
    setAnimatingSpace(space.id);
    setSelectedSpace(space);
    
    setTimeout(() => {
      setDetailsExpanded(true);
      setAnimatingSpace(null);
    }, 600);
    
    // ✅ NO MAP MOVEMENT - only card animation
  };

  const handlePropertyClick = (property) => {
    if (!isMountedRef.current) return;
    
    console.log('🏢 Property clicked:', property);
    // ✅ NO MAP MOVEMENT - map stays stationary unless user uses location button
  };

  // Filter handlers
  const toggleFilter = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType] === value ? 'all' : value
    }));
  };

  const toggleFeature = (feature) => {
    setFilters(prev => ({
      ...prev,
      features: prev.features.includes(feature) 
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const clearFilters = () => {
    setFilters({
      priceRange: 'all',
      spaceType: 'all',
      availability: 'all',
      audience: 'all',
      features: [],
    });
  };

  const toggleSavedSpace = (spaceId) => {
    setSavedSpaces(prev => {
      const newSet = new Set(prev);
      if (newSet.has(spaceId)) {
        newSet.delete(spaceId);
      } else {
        newSet.add(spaceId);
      }
      return newSet;
    });
  };

  // ✅ FIXED: Actually center map on user location
  const handleCenterOnLocation = () => {
    if (userLocation) {
      console.log('📍 Centering map on user location:', userLocation);
      
      // Close any open modals/dropdowns
      setSelectedSpace(null);
      setDetailsExpanded(false);
      
      // Center map on user location
      setMapCenter({
        lat: userLocation.lat,
        lng: userLocation.lng
      });
      
      // Zoom to a good level for local viewing
      setMapZoom(LOCATION_ZOOM);
      
    } else if (!userLocation) {
      // Request location permission and get user location
      console.log('📍 Requesting user location...');
      
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by this browser.');
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          
          console.log('📍 Got user location:', coords);
          setUserLocation(coords);
          
          // Close any open modals/dropdowns
          setSelectedSpace(null);
          setDetailsExpanded(false);
          
          // Center map on user location
          setMapCenter({
            lat: coords.lat,
            lng: coords.lng
          });
          
          // Zoom to a good level for local viewing
          setMapZoom(LOCATION_ZOOM);
        },
        (error) => {
          console.error('Could not get location:', error);
          let message = 'Unable to access your location. ';
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              message += 'Please allow location access in your browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              message += 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              message += 'Location request timed out.';
              break;
            default:
              message += 'An unknown error occurred.';
              break;
          }
          
          alert(message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // Cache for 5 minutes
        }
      );
    }
  };

  const handleBookingNavigation = (space) => {
    navigate(`/booking/${space.propertyId}/${space.id}`);
  };

  // Active filters count for UI
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.priceRange !== 'all') count++;
    if (filters.spaceType !== 'all') count++;
    if (filters.audience !== 'all') count++;
    count += filters.features.length;
    return count;
  }, [filters]);

  return (
    <div className="h-screen overflow-hidden bg-gray-900 text-white">
      <div className="flex h-full">
        
        {/* ✅ LEFT CONTAINER: FilterHeader + Content (60%) */}
        <div className="w-[60%] h-full flex flex-col">
          
          {/* ✅ HEADER: Fixed at top */}
          <FilterHeader 
            filteredSpaces={filteredSpaces}
            activeFiltersCount={activeFiltersCount}
            setShowFilters={setShowFilters}
            cart={cart}
            setShowCart={setShowCart}
            filters={filters}
            clearFilters={clearFilters}
          />
  
          {/* ✅ CONTENT: Scrollable area */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <div className="p-2">
                {/* ✅ REPLACED: State Components */}
                {error ? (
                  <ErrorState error={error} onRetry={loadPropertiesData} />
                ) : isLoading ? (
                  <LoadingState />
                ) : paginatedSpaces.length > 0 ? (
                  <SpacesGrid
                    spaces={paginatedSpaces}
                    onSpaceCardClick={handleSpaceCardClick}
                    onSpaceClick={handleSpaceClick}
                    animatingSpace={animatingSpace}
                    savedSpaces={savedSpaces}
                    toggleSavedSpace={toggleSavedSpace}
                    isInCart={isInCart}
                    addToCart={addToCart}
                  />
                ) : (
                  <EmptyState onClearFilters={clearFilters} />
                )}
              </div>
            </div>
  
            {/* ✅ PAGINATION: Fixed at bottom */}
            <PaginationControls 
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              filteredSpaces={filteredSpaces}
            />
          </div>
        </div>
  
        {/* ✅ RIGHT CONTAINER: Fixed Map (40%) */}
        <div className="w-[40%] h-full p-4 fixed right-0">
          <div className="relative w-full h-[calc(100%-75px)] bg-gray-800 rounded-2xl overflow-hidden">
            <GoogleMap
              properties={properties.filter(property => 
                property.latitude && property.longitude
              )}
              onPropertyClick={handlePropertyClick}
              center={mapCenter}
              zoom={mapZoom}
              className="w-full h-[calc(100%-100px)]"
              advertisingAreas={paginatedSpaces}
              onAreaClick={handleSpaceClick}
              showAreaMarkers={true}
            />
  
            {/* Map Controls */}
            <div className="absolute top-4 right-4 z-20">
              <Button 
                size="sm" 
                className="bg-gray-800/90 backdrop-blur-lg border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white rounded-xl"
                onClick={handleCenterOnLocation}
                title="Center map on your location"
              >
                <Navigation className="w-4 h-4" />
              </Button>
            </div>
  
            {/* Map Legend */}
            <div className="absolute bottom-4 left-4 z-20">
              <div className="bg-gray-800/90 backdrop-blur-lg rounded-xl p-3 border border-gray-700">
                <p className="text-xs text-gray-400 mb-2">Map Legend</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 bg-lime-400 rounded-full"></div>
                    <span className="text-gray-300">Ad Spaces</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    <span className="text-gray-300">Properties</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      {/* ✅ Modal Components - unchanged */}
      <CartModal 
        showCart={showCart}
        setShowCart={setShowCart}
        cart={cart}
        setCart={setCart}
        removeFromCart={removeFromCart}
        updateCartItemDuration={updateCartItemDuration}
        getTotalCartValue={getTotalCartValue}
      />
  
      <FiltersModal 
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        filters={filters}
        toggleFilter={toggleFilter}
        toggleFeature={toggleFeature}
        clearFilters={clearFilters}
        filteredSpaces={filteredSpaces}
      />
  
      <SpaceDetailsModal 
        selectedSpace={selectedSpace}
        detailsExpanded={detailsExpanded}
        setSelectedSpace={setSelectedSpace}
        setDetailsExpanded={setDetailsExpanded}
        isInCart={isInCart}
        addToCart={addToCart}
        handleBookingNavigation={handleBookingNavigation}
        setShowROICalculator={setShowROICalculator}
      />
  
      <ROICalculatorModal 
        showROICalculator={showROICalculator}
        setShowROICalculator={setShowROICalculator}
        selectedSpace={selectedSpace}
        isInCart={isInCart}
        addToCart={addToCart}
        handleBookingNavigation={handleBookingNavigation}
      />
    </div>
  );
}