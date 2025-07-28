// src/pages/browse/BrowsePage.jsx - Redesigned with Elaview Design System
// ✅ UPDATED: Clean Elaview design system implementation with Deep Teal
// ✅ MOBILE: Full-screen map with bottom navigation

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Navigation } from "lucide-react";
import GoogleMap from "@/pages/browse/components/GoogleMap";
import { useUser } from '@clerk/clerk-react';

// ✅ Import all components
import CartModal from './components/CartModal';
import FiltersModal from './components/FiltersModal';
import SpaceDetailsModal from './components/SpaceDetailsModal';
import ROICalculatorModal from './components/ROICalculatorModal';
import PaginationControls from './components/PaginationControls';
import SpacesGrid from './components/SpacesGrid';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import EmptyState from './components/EmptyState';


// ✅ Import utility functions from browse/utils
import { getDistanceInKm } from './utils/distance';
import { getPropertyCoords, getPropertyAddress, getPropertyName } from './utils/propertyHelpers';
import { getNumericPrice } from './utils/areaHelpers';
import { applyPriceFilter, applySpaceTypeFilter, applyAudienceFilter, applyFeaturesFilter } from './utils/filterHelpers';
import { 
  CARDS_PER_PAGE, 
  DEFAULT_MAP_CENTER, 
  DEFAULT_MAP_ZOOM, 
  LOCATION_ZOOM 
} from './utils/mapConstants';

// ✅ Import the working API client
import apiClient from '@/api/apiClient';

export default function BrowsePage() {
  const navigate = useNavigate();
  
  // ✅ Core state with dynamic map center and zoom
  const [properties, setProperties] = useState([]);
  const [allSpaces, setAllSpaces] = useState([]);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ✅ Dynamic map center and zoom (can be changed by location button)
  const [mapCenter, setMapCenter] = useState(DEFAULT_MAP_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_MAP_ZOOM);
  const [userLocation, setUserLocation] = useState(null);
  
  // ✅ Pagination state
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

  // ✅ API call to backend using the working apiClient
  const loadPropertiesData = async () => {
    if (!isMountedRef.current) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🗺️ Loading properties from API...');
      
      // Use the working apiClient.getSpaces() method that connects to Railway
      const response = await apiClient.getSpaces();
      
      if (!isMountedRef.current) {
        console.log('🗺️ Component unmounted during loading, aborting');
        return;
      }

      // Handle response format (check if it has success/data structure)
      const propertiesData = response.success ? response.data : response;
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

  // ✅ User location detection (NO auto-centering)
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

  // ✅ Advanced filtering for spaces with pagination
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

  // ✅ Event handlers with NO automatic map movement
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

  // ✅ Actually center map on user location
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

  // ✅ MOBILE LAYOUT: Full-screen map only (uses existing MobileNav component)
  if (isMobile) {
    return (
      <div className="fixed inset-0 overflow-hidden bg-gradient-to-br from-slate-50 via-slate-50 to-teal-50/30">
        {/* ✅ MOBILE: Full-screen Map Container */}
        <div className="w-full h-full relative">
          <div className="w-full h-full bg-white overflow-hidden touch-none">
            <GoogleMap
              properties={properties.filter(property => 
                property.latitude && property.longitude
              )}
              onPropertyClick={handlePropertyClick}
              center={mapCenter}
              zoom={mapZoom}
              className="w-full h-full"
              advertisingAreas={paginatedSpaces}
              onAreaClick={handleSpaceClick}
              showAreaMarkers={true}
            />

            {/* ✅ Mobile Map Controls - Fixed position (stays in same spot regardless of map movement) */}
            <div className="fixed top-[5rem] right-4 z-20 flex flex-col gap-2">
              <Button 
                size="sm" 
                variant="outline"
                className="bg-white/95 backdrop-blur-sm hover:bg-white border-slate-300 text-slate-600 hover:text-slate-800 shadow-lg h-10 w-10 p-0"
                onClick={handleCenterOnLocation}
                title="Center map on your location"
              >
                <Navigation className="w-4 h-4" />
              </Button>
              
              <Button 
                size="sm" 
                variant="outline"
                className="bg-white/95 backdrop-blur-sm hover:bg-white border-slate-300 text-slate-600 hover:text-slate-800 shadow-lg h-10 w-10 p-0"
                onClick={() => setShowFilters(true)}
                title="Filters"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                </svg>
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-teal-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </div>

           {/* ✅ Mobile Map Info Card - Left positioned */}
{!isLoading && !error && (
  <div className="fixed top-20 left-4 z-20">  {/* 👈 Changed from center to left */}
    <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg px-4 py-3 shadow-lg min-w-[120px] max-w-[200px]">
      <div className="text-center">
        <p className="text-xl font-semibold text-teal-600">
          {filteredSpaces.length}
        </p>
        <p className="text-sm text-slate-600 leading-tight">
          {filteredSpaces.length === 1 ? 'Space' : 'Spaces'}
        </p>
      </div>
    </div>
  </div>
)}

            {/* ✅ Mobile Map Legend - Bottom Left (positioned just above MobileNav) */}
            {/* <div className="absolute bottom-[5.5rem] left-4 z-20">
              <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg p-3 shadow-lg">
                <h4 className="font-medium text-xs text-slate-800 mb-2">Legend</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    <span className="text-xs text-slate-600">Ad Spaces</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-slate-600">Properties</span>
                  </div>
                  {userLocation && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-slate-600">You</span>
                    </div>
                  )}
                </div>
              </div>
            </div> */}

            {/* ✅ Mobile Loading State - Fixed position overlay */}
            {isLoading && (
              <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-30">
                <div className="bg-white rounded-lg p-4 text-center shadow-lg">
                  <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-slate-600">Loading spaces...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ✅ Modal Components for Mobile */}
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

  // ✅ DESKTOP LAYOUT: Original side-by-side layout
  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-slate-50 to-teal-50/30">
      <div className="flex h-full">
        
        {/* ✅ LEFT CONTAINER: Content (55%) - Enhanced background */}
        <div className="w-[55%] h-full flex flex-col bg-gradient-to-b from-white/40 to-slate-50/60 backdrop-blur-sm">
  
          {/* ✅ CONTENT: Scrollable area with enhanced glass effect */}
          <div className="flex-1 flex flex-col min-h-0 bg-white/30 backdrop-blur-sm rounded-2xl m-4 shadow-soft border border-white/40">
            <div className="flex-1 overflow-y-auto scrollbar-hide rounded-t-2xl">
              <div className="p-6">
                {/* ✅ Combined Header with Controls */}
                {!isLoading && !error && (
                  <div className="mb-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h1 className="heading-2 text-slate-900">
                          Advertising Spaces
                        </h1>
                        <p className="body-medium text-slate-600 mt-1">
                          {filteredSpaces.length > 0 
                            ? `${filteredSpaces.length} ${filteredSpaces.length === 1 ? 'space' : 'spaces'} available`
                            : 'No spaces found with current filters'
                          }
                        </p>
                        {activeFiltersCount > 0 && (
                          <button
                            onClick={clearFilters}
                            className="btn-ghost btn-small text-slate-600 hover:text-slate-800 mt-2"
                          >
                            Clear all filters ({activeFiltersCount})
                          </button>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <button
                          onClick={() => setShowFilters(true)}
                          className="btn-outline btn-small flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                          </svg>
                          Filters
                          {activeFiltersCount > 0 && (
                            <span className="bg-teal-500 text-white text-xs px-2 py-0.5 rounded-full">
                              {activeFiltersCount}
                            </span>
                          )}
                        </button>
                        
                        <button
                          onClick={() => setShowCart(true)}
                          className="btn-primary btn-small flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6.5M7 13h10M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
                          </svg>
                          Cart
                          {cart.length > 0 && (
                            <span className="bg-white text-teal-600 text-xs px-2 py-0.5 rounded-full font-medium">
                              {cart.length}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {activeFiltersCount > 0 && (
                      <div className="divider"></div>
                    )}
                  </div>
                )}

                {/* ✅ State Components with Elaview styling */}
                {error ? (
                  <div className="py-12">
                    <ErrorState error={error} onRetry={loadPropertiesData} />
                  </div>
                ) : isLoading ? (
                  <div className="py-8">
                    <LoadingState />
                  </div>
                ) : paginatedSpaces.length > 0 ? (
                  <div className="space-y-6">
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
                  </div>
                ) : (
                  <div className="py-12">
                    <EmptyState onClearFilters={clearFilters} />
                  </div>
                )}
              </div>
            </div>
  
            {/* ✅ PAGINATION: Fixed at bottom with enhanced styling */}
            {!isLoading && !error && totalPages > 1 && (
              <div className="bg-white/80 backdrop-blur-sm border-t border-slate-200/60 shadow-soft px-6 py-4 rounded-b-2xl mx-4 mb-4">
                <PaginationControls 
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalPages={totalPages}
                  filteredSpaces={filteredSpaces}
                />
              </div>
            )}
          </div>
        </div>
  
        {/* ✅ RIGHT CONTAINER: Fixed Map (45%) - Enhanced background */}
        <div className="w-[45%] h-full p-4 fixed right-0 bg-gradient-to-bl from-white/20 to-transparent">
          <div className="relative w-full h-[calc(100%-75px)] bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-lg">
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

            {/* ✅ Map Controls - Styled with Elaview design */}
            <div className="absolute top-4 right-4 z-20">
              <Button 
                size="sm" 
                variant="outline"
                className="bg-white/95 backdrop-blur-sm hover:bg-white border-slate-300 text-slate-600 hover:text-slate-800 shadow-soft"
                onClick={handleCenterOnLocation}
                title="Center map on your location"
              >
                <Navigation className="w-4 h-4" />
              </Button>
            </div>

            {/* ✅ Map Legend - Enhanced with Elaview styling */}
            <div className="absolute bottom-4 left-4 z-20">
              <div className="card-compact bg-white/95 backdrop-blur-sm border-slate-200 shadow-soft">
                <h4 className="label text-slate-800 mb-3">Map Legend</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-teal-500 rounded-full shadow-sm"></div>
                    <span className="caption text-slate-600">Ad Spaces</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-success-500 rounded-full shadow-sm"></div>
                    <span className="caption text-slate-600">Properties</span>
                  </div>
                  {userLocation && (
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm animate-pulse-soft"></div>
                      <span className="caption text-slate-600">Your Location</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ✅ Map Status Indicator */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-30">
                <div className="card-compact bg-white text-center">
                  <div className="loading-spinner w-6 h-6 mx-auto mb-2 text-teal-500"></div>
                  <p className="body-small text-slate-600">Loading spaces...</p>
                </div>
              </div>
            )}

            {/* ✅ Map Info Card - Floating summary */}
            {!isLoading && !error && (
              <div className="absolute top-4 left-4 z-20">
                <div className="card-compact bg-white/95 backdrop-blur-sm border-slate-200 shadow-soft max-w-48">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-teal-600">
                      {filteredSpaces.length}
                    </p>
                    <p className="caption text-slate-600">
                      {filteredSpaces.length === 1 ? 'Space Available' : 'Spaces Available'}
                    </p>
                    {activeFiltersCount > 0 && (
                      <p className="caption text-slate-500 mt-1">
                        {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  
      {/* ✅ Modal Components - Desktop */}
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