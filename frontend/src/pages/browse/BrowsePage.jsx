// src/pages/browse/BrowsePage.jsx - MOBILE RESPONSIVE VERSION
// ✅ UPDATED: Complete mobile responsiveness with proper nav bar spacing
// ✅ FIXED: Touch targets, safe areas, and overflow issues
// ✅ NEW: Enhanced mobile cart integration and business profile support
// ✅ UPDATED: New color scheme and removed middle layer
// ✅ FIXED: Pagination moved inside scrollable container and scroll bar hidden
// ✅ FIXED: All checkout navigation properly passes full cart data

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Navigation } from "lucide-react";
import GoogleMap from "@/pages/browse/components/GoogleMap";
import { useUser } from '@clerk/clerk-react';

// ✅ Import all components
import CartModal from './components/CartModal';
import FiltersModal from './components/FiltersModal';
import SpaceDetailsModal from './components/SpaceDetailsModal';
import MobileBottomSheet from './components/mobile/MobileBottomSheet';
import ROICalculatorModal from './components/ROICalculatorModal';
import PaginationControls from './components/PaginationControls';
import SpacesGrid from './components/SpacesGrid';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import EmptyState from './components/EmptyState';

// ✅ Mobile cart components
import FloatingCartButton from './components/mobile/FloatingCartButton';
import MobileCartDrawer from './components/mobile/MobileCartDrawer';

// ✅ Business Profile Components
import BusinessDetailsModal from '../checkout/components/BusinessDetailsModal';
import { useBusinessProfile, checkBusinessProfileRequired } from '../checkout/hooks/useBusinessProfile';

// ✅ Import utility functions
import { getDistanceInKm } from './utils/distance';
import { getPropertyCoords, getPropertyAddress, getPropertyName } from './utils/propertyHelpers';
import { getNumericPrice } from './utils/areaHelpers';
import { applyPriceFilter, applySpaceTypeFilter, applyAudienceFilter, applyFeaturesFilter } from './utils/filterHelpers';

// ✅ Import constants
import { 
  CARDS_PER_PAGE, 
  LOCATION_ZOOM,
  ZOOM_LEVELS,
  MAP_OPTIONS,
  MAP_CENTERS,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM
} from './utils/mapConstants';

// ✅ Import intelligent location service
import locationService from './services/locationService';
import apiClient from '@/api/apiClient';

export default function BrowsePage() {
  const navigate = useNavigate();
  
  // ✅ Core state with intelligent map center and zoom
  const [properties, setProperties] = useState([]);
  const [allSpaces, setAllSpaces] = useState([]);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ✅ ENHANCED: Dynamic map location with Israeli fallback
  const [mapCenter, setMapCenter] = useState(DEFAULT_MAP_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_MAP_ZOOM);
  const [userLocation, setUserLocation] = useState(null);
  const [mapLocationSource, setMapLocationSource] = useState('loading');
  const [mapLocationName, setMapLocationName] = useState('Loading...');
  
  // ✅ Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  
  // Cart state
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  
  // ✅ Mobile cart state
  const [showMobileCartDrawer, setShowMobileCartDrawer] = useState(false);
  
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showROICalculator, setShowROICalculator] = useState(false);
  
  // ✅ Mobile bottom sheet state
  const [showMobileSheet, setShowMobileSheet] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [sheetTitle, setSheetTitle] = useState("Available Spaces");
  
  // ✅ Business Profile state
  const [showBusinessProfileModal, setShowBusinessProfileModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  
  const { user: currentUser } = useUser();
  const isMountedRef = useRef(true);
  const mobileSheetRef = useRef(null);

  // ✅ Business Profile hook integration
  const {
    businessProfile,
    isProfileComplete,
    isLoading: profileLoading,
    needsBusinessProfile,
    updateBusinessProfile,
    completionPercentage,
    missingFields
  } = useBusinessProfile();

  // ✅ COLOR SCHEME: Verification on mount
  useEffect(() => {
    console.log('🎨 BROWSE PAGE: Updated color scheme verification', {
      primaryBlue: '#4668AB',
      lightBlueBackground: '#F8FAFF',
      whiteCards: '#FFFFFF',
      lightGrayBorders: '#E5E7EB',
      timestamp: new Date().toISOString()
    });
  }, []);

  // ✅ MOBILE: Add mobile viewport debugging
  useEffect(() => {
    console.log('📱 BROWSE PAGE: Mobile viewport check', {
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      isMobile: window.innerWidth < 768,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    });
  }, []);

  // ✅ IMPROVED: Mobile detection with enhanced debugging
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      console.log(`📱 Browse page resize: ${window.innerWidth}px, Mobile: ${mobile}`);
      setIsMobile(mobile);
    };
    
    // Call immediately to ensure correct initial state
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ✅ Initialize intelligent map location on component mount
  useEffect(() => {
    const initializeMapLocation = async () => {
      console.log('🗺️ Initializing intelligent map location...');
      
      try {
        const locationData = await locationService.getBestLocation();
        
        if (isMountedRef.current) {
          console.log('✅ Setting map location:', locationData);
          setMapCenter(locationData.center);
          setMapZoom(locationData.zoom);
          setMapLocationSource(locationData.source);
          setMapLocationName(locationData.name);
          
          if (locationData.source === 'user_geolocation') {
            setUserLocation(locationData.center);
          }
        }
      } catch (error) {
        console.error('❌ Failed to get intelligent location:', error);
        if (isMountedRef.current) {
          setMapCenter(DEFAULT_MAP_CENTER);
          setMapZoom(DEFAULT_MAP_ZOOM);
          setMapLocationSource('error_fallback');
          setMapLocationName('Kfar Kama, Israel');
        }
      }
    };

    initializeMapLocation();
  }, []);

  // ✅ API call to backend using the working apiClient
  const loadPropertiesData = async () => {
    if (!isMountedRef.current) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🗺️ Loading spaces from API...');
      
      const response = await apiClient.getSpaces();
      
      if (!isMountedRef.current) {
        console.log('🗺️ Component unmounted during loading, aborting');
        return;
      }

      const areasData = response.success ? response.data : response;
      console.log(`🎯 API returned ${areasData.length} advertising areas`);

      if (!Array.isArray(areasData)) {
        throw new Error('API did not return an array of areas');
      }

      const validAreas = areasData.filter(area => {
        const hasProperty = area.property && area.property.id;
        const hasCoords = area.coordinates && 
                         (area.coordinates.lat || area.property?.latitude) && 
                         (area.coordinates.lng || area.property?.longitude);
        const isActive = area.isActive && area.status === 'active';
        
        return hasProperty && hasCoords && isActive;
      });

      const propertiesMap = new Map();
      const flattenedSpaces = [];

      validAreas.forEach(area => {
        const coords = {
          lat: area.coordinates?.lat || area.property?.latitude,
          lng: area.coordinates?.lng || area.property?.longitude
        };

        if (!propertiesMap.has(area.property.id)) {
          propertiesMap.set(area.property.id, {
            ...area.property,
            latitude: coords.lat,
            longitude: coords.lng,
            spaces: []
          });
        }

        propertiesMap.get(area.property.id).spaces.push(area);

        flattenedSpaces.push({
          ...area,
          propertyId: area.property.id,
          propertyName: getPropertyName(area.property),
          propertyAddress: getPropertyAddress(area.property),
          propertyCoords: coords,
          propertyType: area.property.propertyType,
          property: area.property,
          distance: null
        });
      });

      const validProperties = Array.from(propertiesMap.values());

      console.log(`🏢 Processed ${validProperties.length} properties with ${flattenedSpaces.length} total spaces`);
      
      if (isMountedRef.current) {
        setProperties(validProperties);
        setAllSpaces(flattenedSpaces);
        
        // ✅ Auto-open mobile sheet with closest spaces
        if (isMobile && flattenedSpaces.length > 0) {
          setShowMobileSheet(true);
          setSheetTitle("Spaces Near You");
        }
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

  // ✅ Advanced filtering for spaces with pagination
  const { filteredSpaces, totalPages, paginatedSpaces } = useMemo(() => {
    let filtered = allSpaces;

    filtered = applyPriceFilter(filtered, filters.priceRange);
    filtered = applySpaceTypeFilter(filtered, filters.spaceType);
    filtered = applyAudienceFilter(filtered, filters.audience);
    filtered = applyFeaturesFilter(filtered, filters.features);

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

  // ✅ Cart functions with mobile logging
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
    console.log('🛒 Item added to cart for mobile:', cartItem);
  };

  const removeFromCart = (cartItemId) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
    console.log('🗑️ Item removed from cart for mobile:', cartItemId);
  };

  const updateCartItemDuration = (cartItemId, newDuration) => {
    setCart(prev => prev.map(item => 
      item.id === cartItemId 
        ? { ...item, duration: newDuration, totalPrice: item.pricePerDay * newDuration }
        : item
    ));
    console.log('⏱️ Cart item duration updated for mobile:', cartItemId, newDuration);
  };

  const getTotalCartValue = () => {
    return cart.reduce((total, item) => total + item.totalPrice, 0);
  };

  const isInCart = (spaceId) => {
    return cart.some(item => item.spaceId === spaceId);
  };

  const clearCart = () => {
    setCart([]);
    console.log('🗑️ Cart cleared for mobile');
  };

  // ✅ Business Profile Integration Functions
  const checkBusinessProfileBeforeBooking = async (space) => {
    if (!currentUser?.id) {
      console.log('❌ No user authenticated, redirecting to login');
      return false;
    }

    console.log('🔍 Checking business profile completion for booking...');
    
    try {
      const completionKey = `businessProfile_${currentUser.id}`;
      const hasCompletedProfile = localStorage.getItem(completionKey) === 'completed';
      
      if (hasCompletedProfile) {
        console.log('✅ Profile marked complete in localStorage, proceeding to booking');
        return true;
      }
      
      console.log('🔄 Checking profile completion in database...');
      const profileRequired = await checkBusinessProfileRequired(currentUser.id);
      
      if (!profileRequired) {
        console.log('✅ Profile complete in database, proceeding to booking');
        return true;
      }
      
      console.log('❌ Business profile incomplete, showing modal');
      
      setPendingNavigation({
        type: 'booking',
        space: space,
        timestamp: Date.now()
      });
      
      setShowBusinessProfileModal(true);
      return false;
      
    } catch (error) {
      console.error('❌ Error checking business profile:', error);
      
      if (needsBusinessProfile) {
        console.log('⚠️ Error checking profile, but hook indicates profile needed');
        setPendingNavigation({
          type: 'booking',
          space: space,
          timestamp: Date.now()
        });
        setShowBusinessProfileModal(true);
        return false;
      }
      
      return true;
    }
  };

  // ✅ FIXED: Business profile completion handler with proper checkout navigation
  const handleBusinessProfileComplete = (profileData) => {
    console.log('✅ Business profile completed successfully:', profileData);
    
    setShowBusinessProfileModal(false);
    
    if (pendingNavigation) {
      console.log('🚀 Processing pending navigation:', pendingNavigation);
      
      if (pendingNavigation.type === 'booking' && pendingNavigation.space) {
        const space = pendingNavigation.space;
        console.log('📅 Proceeding to booking after profile completion:', space.id);
        
        // Create cart item for the pending booking
        const cartItem = {
          id: `${space.id}_${Date.now()}`,
          spaceId: space.id,
          space: space,
          duration: 30,
          pricePerDay: getNumericPrice(space),
          totalPrice: getNumericPrice(space) * 30,
          addedAt: new Date()
        };
        
        // Navigate to checkout with single item cart
        navigate('/checkout', { 
          state: { 
            cart: [cartItem],
            fromPendingBooking: true
          } 
        });
      } else if (pendingNavigation.type === 'checkout') {
        // If it was a cart checkout, proceed with the full cart
        navigate('/checkout', { 
          state: { 
            cart: cart,
            fromCart: true
          } 
        });
      }
      
      setPendingNavigation(null);
    }
  };

  const handleBusinessProfileClose = () => {
    console.log('🚪 Business profile modal closed');
    setShowBusinessProfileModal(false);
    
    if (pendingNavigation) {
      console.log('❌ Clearing pending navigation due to profile modal close');
      setPendingNavigation(null);
    }
  };

  // ✅ Mobile cart handlers
  const handleMobileCartOpen = () => {
    console.log('🛒 Opening mobile cart drawer with items:', cart.length);
    setShowMobileCartDrawer(true);
  };

  const handleMobileCartClose = () => {
    console.log('🛒 Closing mobile cart drawer');
    setShowMobileCartDrawer(false);
  };

  // ✅ FIXED: Proceed to checkout with full cart
  const handleProceedToCheckout = async () => {
    console.log('🛒 Proceeding to checkout with cart:', cart);
    
    if (cart.length === 0) {
      alert('Your cart is empty. Please add some spaces first.');
      return;
    }
    
    // Check business profile before navigating
    if (currentUser?.id) {
      const firstItem = cart[0];
      const canProceed = await checkBusinessProfileBeforeBooking(firstItem.space);
      
      if (!canProceed) {
        // Set pending navigation for checkout
        setPendingNavigation({
          type: 'checkout',
          timestamp: Date.now()
        });
        return;
      }
    }
    
    // Navigate to checkout with the FULL cart
    navigate('/checkout', { 
      state: { 
        cart: cart,
        fromCart: true
      } 
    });
    
    // Close the mobile cart drawer if open
    setShowMobileCartDrawer(false);
  };

  // ✅ FIXED: Property click handler with real-time mobile detection
  const handlePropertyClick = (property) => {
    if (!isMountedRef.current) return;
    
    console.log('🏢 Property clicked:', property);
    console.log('📱 Current isMobile state:', isMobile);
    console.log('📐 Current window width:', window.innerWidth);
    
    const isCurrentlyMobile = window.innerWidth < 768;
    
    if (isCurrentlyMobile) {
      console.log('✅ Handling as mobile click');
      setSelectedProperty(property);
      setSelectedSpace(null);
      setShowMobileSheet(true);
      setSheetTitle(`${property.name || property.title}`);
    } else {
      console.log('🖥️ Handling as desktop click');
      console.log('Desktop property click - implement as needed');
    }
  };

  // ✅ FIXED: Space click handler with real-time mobile detection
  const handleSpaceClick = (space) => {
    if (!isMountedRef.current) return;
    
    console.log('📍 Space clicked:', space);
    console.log('📱 Current isMobile state:', isMobile);
    
    const isCurrentlyMobile = window.innerWidth < 768;
    
    if (isCurrentlyMobile) {
      console.log('✅ Handling as mobile space click');
      setSelectedSpace(space);
      setShowMobileSheet(true);
      setSelectedProperty(null);
      setSheetTitle("Space Details");
    } else {
      console.log('🖥️ Handling as desktop space click');
      setSelectedSpace(space);
      setDetailsExpanded(true);
    }
  };

  const handleSpaceCardClick = (space) => {
    if (!isMountedRef.current) return;
    
    console.log('📱 Space card clicked:', space);
    
    const isCurrentlyMobile = window.innerWidth < 768;
    
    if (isCurrentlyMobile) {
      handleSpaceClick(space);
    } else {
      setAnimatingSpace(space.id);
      setSelectedSpace(space);
      
      setTimeout(() => {
        setDetailsExpanded(true);
        setAnimatingSpace(null);
      }, 600);
    }
  };

  const handleMobileSpaceSelect = (space) => {
    setSelectedSpace(space);
  };

  const handleMobileSheetClose = () => {
    setShowMobileSheet(false);
    setSelectedSpace(null);
    setSelectedProperty(null);
    setSheetTitle("Available Spaces");
  };

  const handleMapClick = useCallback(() => {
    console.log('🗺️ Map clicked - closing sheet');
    if (mobileSheetRef.current) {
      mobileSheetRef.current.minimize();
    }
  }, []);

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

  const handleCenterOnLocation = async () => {
    console.log('📍 Location button clicked');
    
    try {
      setMapLocationName('Getting your location...');
      
      const locationData = await locationService.requestUserLocation();
      
      if (locationData && isMountedRef.current) {
        console.log('✅ Got user location:', locationData);
        
        setUserLocation(locationData.coordinates);
        
        const isCurrentlyMobile = window.innerWidth < 768;
        if (isCurrentlyMobile) {
          setShowMobileSheet(false);
          setSelectedSpace(null);
          setSelectedProperty(null);
        } else {
          setSelectedSpace(null);
          setDetailsExpanded(false);
        }
        
        setMapCenter(locationData.coordinates);
        setMapZoom(LOCATION_ZOOM);
        setMapLocationSource('user_location_button');
        setMapLocationName('Your Location');
      }
    } catch (error) {
      console.error('❌ Location request failed:', error);
      alert(error.message);
      setMapLocationName(mapLocationName === 'Getting your location...' ? 'Location Unavailable' : mapLocationName);
    }
  };

  // ✅ FIXED: Booking navigation with proper cart creation
  const handleBookingNavigation = async (space, campaign = null) => {
    console.log('📅 Booking navigation requested:', space.id, space.property?.id || space.propertyId);
    
    const canProceed = await checkBusinessProfileBeforeBooking(space);
    
    if (canProceed) {
      // For single space booking, create a cart item and navigate
      const cartItem = {
        id: `${space.id}_${Date.now()}`,
        spaceId: space.id,
        space: space,
        duration: 30, // default duration
        pricePerDay: getNumericPrice(space),
        totalPrice: getNumericPrice(space) * 30,
        addedAt: new Date(),
        campaign: campaign || null
      };
      
      // Create a single-item cart for immediate checkout
      const checkoutCart = [cartItem];
      
      // Navigate to checkout with the single item cart
      navigate('/checkout', { 
        state: { 
          cart: checkoutCart,
          fromSingleBooking: true,
          campaign: campaign
        } 
      });
    }
  };

  // ✅ FIXED: Mobile booking handler
  const handleMobileBooking = async (space) => {
    console.log('📱 Mobile booking for space:', space.id);
    
    // For mobile booking, create cart item and navigate
    const cartItem = {
      id: `${space.id}_${Date.now()}`,
      spaceId: space.id,
      space: space,
      duration: 30, // default duration
      pricePerDay: getNumericPrice(space),
      totalPrice: getNumericPrice(space) * 30,
      addedAt: new Date()
    };
    
    // Check business profile
    const canProceed = await checkBusinessProfileBeforeBooking(space);
    
    if (canProceed) {
      // Create a single-item cart for immediate checkout
      const checkoutCart = [cartItem];
      
      // Navigate to checkout
      navigate('/checkout', { 
        state: { 
          cart: checkoutCart,
          fromMobileBooking: true
        } 
      });
    }
  };

  // ✅ NEW: Add to cart and checkout handler
  const handleAddToCartAndCheckout = async (space, duration = 30) => {
    console.log('🛒 Add to cart and checkout for space:', space.id);
    
    // Create cart item
    const cartItem = {
      id: `${space.id}_${Date.now()}`,
      spaceId: space.id,
      space: space,
      duration: duration,
      pricePerDay: getNumericPrice(space),
      totalPrice: getNumericPrice(space) * duration,
      addedAt: new Date()
    };
    
    // Add to existing cart
    const updatedCart = [...cart, cartItem];
    setCart(updatedCart);
    
    // Check business profile
    const canProceed = await checkBusinessProfileBeforeBooking(space);
    
    if (canProceed) {
      // Navigate to checkout with updated cart
      navigate('/checkout', { 
        state: { 
          cart: updatedCart,
          fromAddToCart: true
        } 
      });
    }
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.priceRange !== 'all') count++;
    if (filters.spaceType !== 'all') count++;
    if (filters.audience !== 'all') count++;
    count += filters.features.length;
    return count;
  }, [filters]);

  // Check for campaign creation success from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const campaignCreated = urlParams.get('campaignCreated');
    const spaceId = urlParams.get('spaceId');
    
    if (campaignCreated === 'true' && spaceId) {
      // Find the space and open its details modal
      const space = allSpaces.find(s => s.id === spaceId);
      if (space) {
        setSelectedSpace(space);
        setDetailsExpanded(true);
      }
      
      // Clean up URL parameters
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [allSpaces]);

  // ✅ MOBILE LAYOUT: Enhanced with proper nav bar spacing and safe areas
  if (isMobile) {
    return (
      <div 
        className={`
          fixed inset-0 overflow-hidden
          mobile-nav-full-spacing
          mobile-safe-area
        `}
        style={{ backgroundColor: '#F8FAFF' }}
      >
        {/* ✅ MOBILE: Full-screen Map Container with proper spacing */}
        <div className="w-full h-full relative">
          <div className="w-full h-full bg-white overflow-hidden">
            <GoogleMap
              properties={properties.filter(property => 
                property.latitude && property.longitude
              )}
              onPropertyClick={handlePropertyClick}
              onClick={handleMapClick}
              center={mapCenter}
              zoom={mapZoom}
              className="w-full h-full"
              advertisingAreas={paginatedSpaces}
              onAreaClick={handleSpaceClick}
              showAreaMarkers={true}
            />

            {/* ✅ MOBILE: Enhanced Map Controls with better touch targets */}
            <div className="fixed top-[5.5rem] right-3 sm:right-4 z-20 flex flex-col gap-2">
              <Button 
                size="sm" 
                variant="outline"
                className="
                  bg-white/95 backdrop-blur-sm hover:bg-white border-slate-300 
                  text-slate-600 hover:text-slate-800 shadow-lg 
                  h-11 w-11 p-0 touch-target
                  transition-all duration-200
                "
                onClick={handleCenterOnLocation}
                title="Center map on your location"
              >
                <Navigation className="w-4 h-4" />
              </Button>
              
              <Button 
                size="sm" 
                variant="outline"
                className="
                  bg-white/95 backdrop-blur-sm hover:bg-white border-slate-300 
                  text-slate-600 hover:text-slate-800 shadow-lg 
                  h-11 w-11 p-0 touch-target relative
                  transition-all duration-200
                "
                onClick={() => setShowFilters(true)}
                title="Filters"
                style={{ 
                  color: activeFiltersCount > 0 ? '#4668AB' : undefined,
                  backgroundColor: activeFiltersCount > 0 ? '#EFF6FF' : undefined
                }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                </svg>
                {activeFiltersCount > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium"
                    style={{ backgroundColor: '#4668AB' }}
                  >
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </div>

           {/* ✅ MOBILE: Enhanced Map Info Card with better responsive design */}
           {!isLoading && !error && (
              <div className="fixed top-[5.5rem] left-3 sm:left-4 z-20">
                <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg px-3 py-2.5 shadow-lg min-w-[120px] max-w-[200px]">
                  <div className="text-center">
                    <p 
                      className="text-lg sm:text-xl font-semibold"
                      style={{ color: '#4668AB' }}
                    >
                      {filteredSpaces.length}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 leading-tight">
                      {filteredSpaces.length === 1 ? 'Space' : 'Spaces'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 truncate">
                      📍 {mapLocationName}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ✅ MOBILE: Enhanced Loading State */}
            {isLoading && (
              <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-30">
                <div className="bg-white rounded-lg p-4 text-center shadow-lg max-w-xs mx-4">
                  <div 
                    className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-2"
                    style={{ borderColor: '#4668AB', borderTopColor: 'transparent' }}
                  ></div>
                  <p className="text-sm text-slate-600">Loading spaces...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ✅ Mobile Bottom Sheet with enhanced props */}
        <MobileBottomSheet
          ref={mobileSheetRef}
          isOpen={showMobileSheet}
          onClose={handleMobileSheetClose}
          spaces={filteredSpaces}
          selectedProperty={selectedProperty}
          mapCenter={mapCenter}
          onSpaceSelect={handleMobileSpaceSelect}
          savedSpaces={savedSpaces}
          toggleSavedSpace={toggleSavedSpace}
          onBookNow={handleBookingNavigation}
          onAddToCart={addToCart}
          isInCart={isInCart}
          cartCount={cart.length}
          title={sheetTitle}
        />

        {/* ✅ Enhanced Mobile Cart System with safe area support */}
        <FloatingCartButton
          cartItems={cart}
          onOpenCart={handleMobileCartOpen}
          totalValue={getTotalCartValue()}
        />

        <MobileCartDrawer
          isOpen={showMobileCartDrawer}
          onClose={handleMobileCartClose}
          cartItems={cart}
          onUpdateQuantity={updateCartItemDuration}
          onRemoveItem={removeFromCart}
          onProceedToCheckout={handleProceedToCheckout}
          onClearCart={clearCart}
        />

        {/* ✅ Business Profile Modal for Mobile */}
        <BusinessDetailsModal
          isOpen={showBusinessProfileModal}
          onClose={handleBusinessProfileClose}
          onProfileComplete={handleBusinessProfileComplete}
          required={true}
        />

        {/* ✅ Other Mobile Modals with enhanced mobile styling */}
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

  // ✅ DESKTOP LAYOUT: Updated with new color scheme and fixed pagination positioning
  return (
    <div 
      className="h-screen overflow-hidden"
      style={{ backgroundColor: '#F8FAFF' }}
    >
      <div className="flex h-full">
        
        {/* ✅ LEFT CONTAINER: Content (55%) with hidden scroll bar and pagination inside */}
        <div className="w-[55%] h-full flex flex-col p-6">
          <div className="flex-1 flex flex-col min-h-0">
            {/* ✅ FIXED: Scrollable container with hidden scroll bar and pagination inside */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <div>
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
                            <span 
                              className="text-white text-xs px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: '#4668AB' }}
                            >
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
                            <span 
                              className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{ backgroundColor: '#4668AB', color: '#FFFFFF' }}
                            >
                              {cart.length}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {(activeFiltersCount > 0 || mapLocationSource !== 'loading') && (
                      <div className="divider"></div>
                    )}
                  </div>
                )}

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

                    {/* ✅ FIXED: Pagination moved inside scrollable container */}
                    {!isLoading && !error && filteredSpaces.length > 0 && totalPages > 1 && (
                      <div 
                        className="border-t shadow-lg px-6 py-4 rounded-lg mt-6"
                        style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}
                      >
                        <PaginationControls 
                          currentPage={currentPage}
                          setCurrentPage={setCurrentPage}
                          totalPages={totalPages}
                          filteredSpaces={filteredSpaces}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-12">
                    <EmptyState onClearFilters={clearFilters} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
  
        {/* ✅ RIGHT CONTAINER: Fixed Map (45%) */}
        <div className="w-[45%] h-full p-4 fixed right-0">
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

            <div className="absolute top-4 right-4 z-20">
              <Button 
                size="sm" 
                variant="outline"
                className="bg-white/95 backdrop-blur-sm hover:bg-white border-slate-300 text-slate-600 hover:text-slate-800 shadow-lg"
                onClick={handleCenterOnLocation}
                title="Center map on your location"
              >
                <Navigation className="w-4 h-4" />
              </Button>
            </div>

            <div className="absolute bottom-4 left-4 z-20">
              <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg p-3 shadow-lg">
                <h4 className="font-medium text-xs text-slate-800 mb-3">Map Legend</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full shadow-sm"
                      style={{ backgroundColor: '#4668AB' }}
                    ></div>
                    <span className="text-xs text-slate-600">Ad Spaces</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                    <span className="text-xs text-slate-600">Properties</span>
                  </div>
                  {userLocation && (
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm animate-pulse"></div>
                      <span className="text-xs text-slate-600">Your Location</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isLoading && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-30">
                <div className="bg-white rounded-lg p-4 text-center shadow-lg">
                  <div 
                    className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-2"
                    style={{ borderColor: '#4668AB', borderTopColor: 'transparent' }}
                  ></div>
                  <p className="text-sm text-slate-600">Loading spaces...</p>
                </div>
              </div>
            )}

            {!isLoading && !error && (
              <div className="absolute top-4 left-4 z-20">
                <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg p-3 shadow-lg max-w-56">
                  <div className="text-center">
                    <p 
                      className="text-lg font-semibold"
                      style={{ color: '#4668AB' }}
                    >
                      {filteredSpaces.length}
                    </p>
                    <p className="text-xs text-slate-600">
                      {filteredSpaces.length === 1 ? 'Space Available' : 'Spaces Available'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      📍 {mapLocationName}
                    </p>
                    {activeFiltersCount > 0 && (
                      <p className="text-xs text-slate-500 mt-1">
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

      {/* ✅ Business Profile Modal for Desktop */}
      <BusinessDetailsModal
        isOpen={showBusinessProfileModal}
        onClose={handleBusinessProfileClose}
        onProfileComplete={handleBusinessProfileComplete}
        required={true}
      />
  
      {/* ✅ Desktop Modal Components */}
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