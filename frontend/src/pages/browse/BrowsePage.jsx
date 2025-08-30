// src/pages/browse/BrowsePage.jsx - ENHANCED UI/UX VERSION WITH INTRO MODAL
// ✅ UPDATED: Added IntroModal integration for first-time users
// ✅ IMPROVED: Reduced mobile visual clutter and consolidated information hierarchy
// ✅ ENHANCED: Better loading states with skeleton screens and progressive disclosure
// ✅ OPTIMIZED: Improved layout flexibility and touch target optimization
// ✅ FIXED: Better state management and z-index system
// ✅ FIXED: Header section now stays anchored at top while space cards scroll

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Navigation, Filter, Layers } from "lucide-react";
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

// ✅ NEW: Intro Modal Component
import IntroModal from '@/pages/onboarding/IntroPage';

// ✅ Import utility functions
import { getDistanceInKm } from './utils/distance';
import { getPropertyCoords, getPropertyAddress, getPropertyName } from './utils/propertyHelpers';
import { getNumericPrice } from './utils/areaHelpers'; // single import (removed accidental duplicate)
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

// ✅ NEW: Enhanced Z-Index Scale (updated for intro modal)
const Z_INDEX = {
  MAP: 10,
  MOBILE_CONTROLS: 20,
  MOBILE_SHEET: 30,
  CART_BUTTON: 35,
  MOBILE_DRAWER: 40,
  MODAL_BACKDROP: 50,
  MODAL_CONTENT: 55,
  INTRO_MODAL: 60, // Higher than other modals
  DROPDOWN: 65,
  TOAST: 70
};

// ✅ NEW: Skeleton Card Component for Loading States
const SkeletonCard = () => (
  <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3 animate-pulse">
    <div className="flex gap-3">
      <div className="w-16 h-16 bg-slate-200 rounded-lg flex-shrink-0"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
        <div className="h-3 bg-slate-200 rounded w-2/3"></div>
      </div>
      <div className="w-16 h-8 bg-slate-200 rounded-full"></div>
    </div>
    <div className="flex justify-between items-center">
      <div className="h-6 bg-slate-200 rounded-full w-20"></div>
      <div className="h-8 bg-slate-200 rounded w-24"></div>
    </div>
  </div>
);

export default function BrowsePage() {
  const navigate = useNavigate();
  
  // ✅ Core state with intelligent map center and zoom
  const [properties, setProperties] = useState([]);
  const [allSpaces, setAllSpaces] = useState([]);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ✅ NEW: Intro modal state
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [hasCheckedIntro, setHasCheckedIntro] = useState(false);
  
  // ✅ ENHANCED: Dynamic map location with Israeli fallback
  const [mapCenter, setMapCenter] = useState(DEFAULT_MAP_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_MAP_ZOOM);
  const [mapBounds, setMapBounds] = useState(null);
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
  // Numeric slider bounds
  priceMin: 0,
  priceMax: 2000,
  });

  // Price histogram (Airbnb style) – reacts to non-price filters (spaceType, audience)
  const priceHistogram = useMemo(() => {
    if (!allSpaces || allSpaces.length === 0) return [];
    // Apply non-price filters so distribution reflects current selection context
    let base = allSpaces;
    base = applySpaceTypeFilter(base, filters.spaceType);
    base = applyAudienceFilter(base, filters.audience);
    if (!base.length) return [];

    const BIN_SIZE = 100;
    const MAX_PRICE = 2000;
    const binCount = Math.ceil(MAX_PRICE / BIN_SIZE);
    const bins = [];
    for (let i = 0; i < binCount; i++) {
      const min = i * BIN_SIZE;
      bins.push({ min, max: min + BIN_SIZE, count: 0 });
    }
    bins.push({ min: MAX_PRICE, max: Infinity, count: 0 }); // overflow

    for (const space of base) {
      const price = getNumericPrice(space);
      if (isNaN(price) || price < 0) continue;
      const capped = Math.min(price, MAX_PRICE); // cap for binning; overflow handled separately
      const idx = price >= MAX_PRICE ? bins.length - 1 : Math.min(bins.length - 2, Math.floor(capped / BIN_SIZE));
      if (idx >= 0 && idx < bins.length) bins[idx].count++;
    }

    // If all counts are zero, return empty to avoid misleading flat chart
    if (bins.every(b => b.count === 0)) return [];
    return bins;
  }, [allSpaces, filters.spaceType, filters.audience]);
  
  // UI state
  const [animatingSpace, setAnimatingSpace] = useState(null);
  const [savedSpaces, setSavedSpaces] = useState(new Set());
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [showROICalculator, setShowROICalculator] = useState(false);
  
  // ✅ IMPROVED: Enhanced mobile state management
  const [isMobile, setIsMobile] = useState(false);
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });
  const [viewportHeight, setViewportHeight] = useState(0);
  
  // ✅ Mobile bottom sheet state
  const [showMobileSheet, setShowMobileSheet] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [sheetTitle, setSheetTitle] = useState("Available Spaces");
  
  // ✅ NEW: Map legend state for progressive disclosure
  const [showMapLegend, setShowMapLegend] = useState(false);
  
  // ✅ Business Profile state
  const [showBusinessProfileModal, setShowBusinessProfileModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  
  const { user: currentUser } = useUser();
  const isMountedRef = useRef(true);
  const mobileSheetRef = useRef(null);
  const resizeTimeoutRef = useRef(null);

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

  // ✅ NEW: Check for first-time user and show intro modal
  useEffect(() => {
    const checkFirstTimeUser = async () => {
      if (!currentUser?.id || hasCheckedIntro) return;
      
      try {
        console.log('🎯 Checking if user needs intro modal...');
        
        // Check development bypasses first
        const urlParams = new URLSearchParams(window.location.search);
        const skipIntro = urlParams.get('skip_intro') === 'true' || 
                         import.meta.env.VITE_SKIP_INTRO === 'true';
        
        if (skipIntro) {
          console.log('🚀 Development bypass: Skipping intro modal');
          setHasCheckedIntro(true);
          return;
        }
        
        const response = await apiClient.checkFirstTimeStatus();
        
        if (response.success && response.data.isFirstTime) {
          console.log('🎯 First-time user detected, showing intro modal');
          setShowIntroModal(true);
        } else {
          console.log('🎯 Returning user, skipping intro modal');
        }
        
        setHasCheckedIntro(true);
      } catch (error) {
        console.error('❌ Error checking first-time status:', error);
        setHasCheckedIntro(true);
      }
    };
    
    // Only check after initial data load to avoid blocking the UI
    if (!isLoading && currentUser?.id) {
      checkFirstTimeUser();
    }
  }, [currentUser?.id, isLoading, hasCheckedIntro]);

  // ✅ IMPROVED: Enhanced mobile detection with debouncing
  useEffect(() => {
    const updateScreenInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const mobile = width < 768;
      
      setScreenSize({ width, height });
      setViewportHeight(height);
      setIsMobile(mobile);
      
      console.log('📱 Enhanced viewport update:', {
        width,
        height,
        isMobile: mobile,
        viewportHeight: height
      });
    };
    
    const debouncedResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = setTimeout(updateScreenInfo, 150);
    };
    
    // Initial setup
    updateScreenInfo();
    
    window.addEventListener('resize', debouncedResize);
    window.addEventListener('orientationchange', debouncedResize);
    
    return () => {
      window.removeEventListener('resize', debouncedResize);
      window.removeEventListener('orientationchange', debouncedResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
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
        
        // ✅ IMPROVED: Auto-open mobile sheet only if user hasn't interacted yet and intro modal isn't showing
        if (isMobile && flattenedSpaces.length > 0 && !showIntroModal) {
          setTimeout(() => {
            if (!showIntroModal) {
              setShowMobileSheet(true);
              setSheetTitle("Spaces Near You");
            }
          }, 1200); // Longer delay to avoid conflicts with intro modal
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
  const { filteredSpaces, visibleSpaces, displayedSpaces, usingFallback, totalPages, paginatedSpaces } = useMemo(() => {
    let filtered = allSpaces;

    filtered = applyPriceFilter(filtered, filters.priceRange);
    // Apply numeric slider bounds if user narrowed the range
    if ((filters.priceMin !== 0) || (filters.priceMax !== 2000)) {
      filtered = filtered.filter(space => {
        const p = space.baseRate || getNumericPrice(space);
        return p >= filters.priceMin && p <= filters.priceMax;
      });
    }
    filtered = applySpaceTypeFilter(filtered, filters.spaceType);
    filtered = applyAudienceFilter(filtered, filters.audience);
    filtered = applyFeaturesFilter(filtered, filters.features);

  // Bounds-based filtering (visible region)
    let visible = filtered;
    if (mapBounds) {
      const { north, south, east, west } = mapBounds;
      visible = filtered.filter(space => {
        const c = space.coordinates && space.coordinates.lat && space.coordinates.lng 
          ? space.coordinates 
          : space.propertyCoords;
        if (!c) return false;
        const latOk = c.lat <= north && c.lat >= south;
        const lngOk = east >= west
          ? c.lng <= east && c.lng >= west
          : (c.lng <= east || c.lng >= west); // antimeridian wraparound
        return latOk && lngOk;
      });
    }

    // Sort visible spaces by distance to current map center
    let sortedVisible = visible;
    if (mapCenter) {
      sortedVisible = visible
        .map(space => ({
          ...space,
          distance: space.propertyCoords ? 
            getDistanceInKm(mapCenter.lat, mapCenter.lng, space.propertyCoords.lat, space.propertyCoords.lng) :
            Infinity
        }))
        .sort((a, b) => a.distance - b.distance);
    }

  // 🛟 Fallback: if nothing visible in the current region, show the 10 closest to the user (no filters)
    const origin = userLocation || mapCenter;
    let fallbackTop10 = [];
    if (origin && (!sortedVisible || sortedVisible.length === 0)) {
      fallbackTop10 = allSpaces
        .filter(s => s.propertyCoords && typeof s.propertyCoords.lat === 'number' && typeof s.propertyCoords.lng === 'number')
        .map(s => ({
          ...s,
          distance: getDistanceInKm(origin.lat, origin.lng, s.propertyCoords.lat, s.propertyCoords.lng)
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10);
    }

    const usingFallback = (!sortedVisible || sortedVisible.length === 0) && fallbackTop10.length > 0;
    const displayed = usingFallback ? fallbackTop10 : sortedVisible;

    const totalSpaces = displayed.length;
    const totalPages = Math.ceil(totalSpaces / CARDS_PER_PAGE);
    const startIndex = (currentPage - 1) * CARDS_PER_PAGE;
    const endIndex = startIndex + CARDS_PER_PAGE;
    const paginatedSpaces = displayed.slice(startIndex, endIndex);
    
    return {
      filteredSpaces: filtered,
      visibleSpaces: sortedVisible,
      displayedSpaces: displayed,
      usingFallback,
      totalPages,
      paginatedSpaces
    };
  }, [allSpaces, filters, mapCenter, userLocation, currentPage, mapBounds]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // ✅ NEW: Intro modal handlers
  const handleIntroComplete = (userType) => {
    console.log('🎯 Intro completed with user type:', userType);
    setShowIntroModal(false);
    
    // User type handling is done in the IntroModal component
    // If they're staying on browse page, we're already here
  };

  const handleIntroClose = () => {
    console.log('🎯 Intro modal closed');
    setShowIntroModal(false);
  };

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
    console.log('🛒 Item added to cart:', cartItem);
  };

  const removeFromCart = (cartItemId) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
    console.log('🗑️ Item removed from cart:', cartItemId);
  };

  const updateCartItemDuration = (cartItemId, newDuration) => {
    setCart(prev => prev.map(item => 
      item.id === cartItemId 
        ? { ...item, duration: newDuration, totalPrice: item.pricePerDay * newDuration }
        : item
    ));
    console.log('⏱️ Cart item duration updated:', cartItemId, newDuration);
  };

  const getTotalCartValue = () => {
    return cart.reduce((total, item) => total + item.totalPrice, 0);
  };

  const isInCart = (spaceId) => {
    return cart.some(item => item.spaceId === spaceId);
  };

  const clearCart = () => {
    setCart([]);
    console.log('🗑️ Cart cleared');
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

  // ✅ Business profile completion handler
  const handleBusinessProfileComplete = (profileData) => {
    console.log('✅ Business profile completed successfully:', profileData);
    
    setShowBusinessProfileModal(false);
    
    if (pendingNavigation) {
      console.log('🚀 Processing pending navigation:', pendingNavigation);
      
      if (pendingNavigation.type === 'booking' && pendingNavigation.space) {
        const space = pendingNavigation.space;
        console.log('📅 Proceeding to booking after profile completion:', space.id);
        
        const cartItem = {
          id: `${space.id}_${Date.now()}`,
          spaceId: space.id,
          space: space,
          duration: 30,
          pricePerDay: getNumericPrice(space),
          totalPrice: getNumericPrice(space) * 30,
          addedAt: new Date()
        };
        
        navigate('/checkout', { 
          state: { 
            cart: [cartItem],
            fromPendingBooking: true
          } 
        });
      } else if (pendingNavigation.type === 'checkout') {
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

  // ✅ Proceed to checkout with full cart
  const handleProceedToCheckout = async () => {
    console.log('🛒 Proceeding to checkout with cart:', cart);
    
    if (cart.length === 0) {
      alert('Your cart is empty. Please add some spaces first.');
      return;
    }
    
    if (currentUser?.id) {
      const firstItem = cart[0];
      const canProceed = await checkBusinessProfileBeforeBooking(firstItem.space);
      
      if (!canProceed) {
        setPendingNavigation({
          type: 'checkout',
          timestamp: Date.now()
        });
        return;
      }
    }
    
    navigate('/checkout', { 
      state: { 
        cart: cart,
        fromCart: true
      } 
    });
    
    setShowMobileCartDrawer(false);
  };

  // ✅ IMPROVED: Property click handler with enhanced mobile detection
  const handlePropertyClick = (property) => {
    if (!isMountedRef.current) return;
    
    console.log('🏢 Property clicked:', property);
    
    if (isMobile) {
      console.log('✅ Handling as mobile click');
      setSelectedProperty(property);
      setSelectedSpace(null);
      setShowMobileSheet(true);
      setSheetTitle(`${property.name || property.title}`);
    } else {
      console.log('🖥️ Handling as desktop click');
      // Desktop property interaction can be enhanced later
    }
  };

  // ✅ IMPROVED: Space click handler
  const handleSpaceClick = (space) => {
    if (!isMountedRef.current) return;
    
    console.log('📍 Space clicked:', space);
    
    if (isMobile) {
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
    
    if (isMobile) {
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

  // Atomic numeric price range setter for slider
  const setPriceRange = (min, max) => {
    setFilters(prev => ({
      ...prev,
      priceMin: Math.max(0, Math.min(min, max)),
      priceMax: Math.max(Math.max(0, min), max)
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
  priceMin: 0,
  priceMax: 2000,
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
        
        if (isMobile) {
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

  // ✅ Booking navigation with proper cart creation
  const handleBookingNavigation = async (space, campaign = null) => {
    console.log('📅 Booking navigation requested:', space.id);
    
    const canProceed = await checkBusinessProfileBeforeBooking(space);
    
    if (canProceed) {
      const cartItem = {
        id: `${space.id}_${Date.now()}`,
        spaceId: space.id,
        space: space,
        duration: 30,
        pricePerDay: getNumericPrice(space),
        totalPrice: getNumericPrice(space) * 30,
        addedAt: new Date(),
        campaign: campaign || null
      };
      
      const checkoutCart = [cartItem];
      
      navigate('/checkout', { 
        state: { 
          cart: checkoutCart,
          fromSingleBooking: true,
          campaign: campaign
        } 
      });
    }
  };

  // ✅ Mobile booking handler
  const handleMobileBooking = async (space) => {
    console.log('📱 Mobile booking for space:', space.id);
    
    const cartItem = {
      id: `${space.id}_${Date.now()}`,
      spaceId: space.id,
      space: space,
      duration: 30,
      pricePerDay: getNumericPrice(space),
      totalPrice: getNumericPrice(space) * 30,
      addedAt: new Date()
    };
    
    const canProceed = await checkBusinessProfileBeforeBooking(space);
    
    if (canProceed) {
      const checkoutCart = [cartItem];
      
      navigate('/checkout', { 
        state: { 
          cart: checkoutCart,
          fromMobileBooking: true
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
      const space = allSpaces.find(s => s.id === spaceId);
      if (space) {
        setSelectedSpace(space);
        setDetailsExpanded(true);
      }
      
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [allSpaces]);

  // ✅ IMPROVED: Mobile layout with reduced visual clutter
  if (isMobile) {
    return (
      <div 
        className="fixed inset-0 overflow-hidden mobile-nav-full-spacing mobile-safe-area"
        style={{ backgroundColor: '#F8FAFF' }}
      >
        {/* ✅ IMPROVED: Full-screen Map Container */}
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
              spaces={displayedSpaces}
              advertisingAreas={displayedSpaces}
              onSpaceClick={handleSpaceClick}
              onAreaClick={handleSpaceClick}
              showAreaMarkers={true}
              showPropertyMarkers={false}
              onBoundsChange={(b, z) => setMapBounds(b)}
            />

            {/* ✅ IMPROVED: Simplified Map Controls with better spacing */}
            <div 
              className="fixed right-3 sm:right-4 flex flex-col gap-2"
              style={{ 
                top: '6rem',
                zIndex: Z_INDEX.MOBILE_CONTROLS
              }}
            >
              <Button 
                size="sm" 
                variant="outline"
                className="bg-white/95 backdrop-blur-sm hover:bg-white border-slate-300 text-slate-600 hover:text-slate-800 shadow-lg h-11 w-11 p-0 touch-target transition-all duration-200"
                onClick={handleCenterOnLocation}
                title="Center map on your location"
              >
                <Navigation className="w-4 h-4" />
              </Button>
              
              <Button 
                size="sm" 
                variant="outline"
                className="bg-white/95 backdrop-blur-sm hover:bg-white border-slate-300 text-slate-600 hover:text-slate-800 shadow-lg h-11 w-11 p-0 touch-target relative transition-all duration-200"
                onClick={() => setShowFilters(true)}
                title="Filters"
                style={{ 
                  color: activeFiltersCount > 0 ? '#4668AB' : undefined,
                  backgroundColor: activeFiltersCount > 0 ? '#EFF6FF' : undefined
                }}
              >
                <Filter className="w-4 h-4" />
                {activeFiltersCount > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium"
                    style={{ backgroundColor: '#4668AB' }}
                  >
                    {activeFiltersCount}
                  </span>
                )}
              </Button>

              {/* ✅ NEW: Progressive Disclosure - Map Legend Toggle */}
              <Button 
                size="sm" 
                variant="outline"
                className="bg-white/95 backdrop-blur-sm hover:bg-white border-slate-300 text-slate-600 hover:text-slate-800 shadow-lg h-11 w-11 p-0 touch-target transition-all duration-200"
                onClick={() => setShowMapLegend(!showMapLegend)}
                title="Map Legend"
                style={{ 
                  color: showMapLegend ? '#4668AB' : undefined,
                  backgroundColor: showMapLegend ? '#EFF6FF' : undefined
                }}
              >
                <Layers className="w-4 h-4" />
              </Button>
            </div>

           {/* ✅ IMPROVED: Map Legend - Progressive Disclosure */}
           {showMapLegend && (
              <div 
                className="fixed left-3 sm:left-4"
                style={{ 
                  bottom: '22rem',
                  zIndex: Z_INDEX.MOBILE_CONTROLS
                }}
              >
                <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg px-3 py-2.5 shadow-lg min-w-[140px] max-w-[180px]">
                  <h4 className="font-medium text-xs text-slate-800 mb-2">Map Legend</h4>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full shadow-sm"
                        style={{ backgroundColor: '#4668AB' }}
                      ></div>
                      <span className="text-xs text-slate-600">Ad Spaces</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                      <span className="text-xs text-slate-600">Properties</span>
                    </div>
                    {userLocation && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm animate-pulse"></div>
                        <span className="text-xs text-slate-600">Your Location</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ✅ ENHANCED: Loading State */}
            {isLoading && (
              <div 
                className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center"
                style={{ zIndex: Z_INDEX.MODAL_BACKDROP }}
              >
                <div className="bg-white rounded-lg p-4 text-center shadow-lg max-w-xs mx-4">
                  <div 
                    className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-2"
                    style={{ borderColor: '#4668AB', borderTopColor: 'transparent' }}
                  ></div>
                  <p className="text-sm text-slate-600">Loading spaces...</p>
                  <p className="text-xs text-slate-500 mt-1">Finding the best opportunities for you</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ✅ NEW: Intro Modal - Higher z-index than other modals */}
        <IntroModal
          isOpen={showIntroModal}
          onClose={handleIntroClose}
          onComplete={handleIntroComplete}
        />

        {/* ✅ Mobile Bottom Sheet with enhanced z-index */}
        <MobileBottomSheet
          ref={mobileSheetRef}
          isOpen={showMobileSheet}
          onClose={handleMobileSheetClose}
          spaces={displayedSpaces}
          selectedProperty={selectedProperty}
          mapCenter={mapCenter}
          onSpaceSelect={handleMobileSpaceSelect}
          savedSpaces={savedSpaces}
          toggleSavedSpace={toggleSavedSpace}
          onBookNow={handleBookingNavigation}
          onAddToCart={addToCart}
          isInCart={isInCart}
          cartCount={cart.length}
          title={usingFallback ? 'Closest spaces to you' : sheetTitle}
          style={{ zIndex: Z_INDEX.MOBILE_SHEET }}
        />

        {/* ✅ Enhanced Mobile Cart System */}
        <FloatingCartButton
          cartItems={cart}
          onOpenCart={handleMobileCartOpen}
          totalValue={getTotalCartValue()}
          style={{ zIndex: Z_INDEX.CART_BUTTON }}
        />

        <MobileCartDrawer
          isOpen={showMobileCartDrawer}
          onClose={handleMobileCartClose}
          cartItems={cart}
          onUpdateQuantity={updateCartItemDuration}
          onRemoveItem={removeFromCart}
          onProceedToCheckout={handleProceedToCheckout}
          onClearCart={clearCart}
          style={{ zIndex: Z_INDEX.MOBILE_DRAWER }}
        />

        {/* ✅ Business Profile Modal for Mobile */}
        <BusinessDetailsModal
          isOpen={showBusinessProfileModal}
          onClose={handleBusinessProfileClose}
          onProfileComplete={handleBusinessProfileComplete}
          required={true}
          style={{ zIndex: Z_INDEX.MODAL_CONTENT }}
        />

        {/* ✅ Other Mobile Modals */}
        <CartModal 
          showCart={showCart}
          setShowCart={setShowCart}
          cart={cart}
          setCart={setCart}
          removeFromCart={removeFromCart}
          updateCartItemDuration={updateCartItemDuration}
          getTotalCartValue={getTotalCartValue}
          style={{ zIndex: Z_INDEX.MODAL_CONTENT }}
        />

        <FiltersModal 
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          filters={filters}
          toggleFilter={toggleFilter}
          toggleFeature={toggleFeature}
          clearFilters={clearFilters}
          filteredSpaces={filteredSpaces}
          setPriceRange={setPriceRange}
          priceHistogram={priceHistogram}
          style={{ zIndex: Z_INDEX.MODAL_CONTENT }}
        />

        <ROICalculatorModal 
          showROICalculator={showROICalculator}
          setShowROICalculator={setShowROICalculator}
          selectedSpace={selectedSpace}
          isInCart={isInCart}
          addToCart={addToCart}
          handleBookingNavigation={handleBookingNavigation}
          style={{ zIndex: Z_INDEX.MODAL_CONTENT }}
        />
      </div>
    );
  }

  // ✅ IMPROVED: Desktop layout with enhanced flexibility and loading states
  return (
    <div 
      className="h-screen overflow-hidden bg-slate-200"
    >
      <div className="flex h-full">
        
        {/* ✅ FIXED: Left Container with proper flexbox constraints */}
        <div 
          className="flex flex-col p-6 transition-all duration-300"
          style={{ 
            width: detailsExpanded ? '52%' : '58%',
            minWidth: '480px',
            height: '100vh', // Explicit height constraint
            overflow: 'hidden' // Prevent container from expanding
          }}
        >
          {/* ✅ FIXED: Header section - flex: none to prevent shrinking */}
          <div 
            className="mb-6"
            style={{ flex: '0 0 auto' }} // Fixed size, won't grow or shrink
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {!isLoading && !error ? (
                  <>
                    <p className="body-medium text-slate-600 mt-1">
                      {displayedSpaces.length > 0 
                        ? `${displayedSpaces.length} ${displayedSpaces.length === 1 ? 'space' : 'spaces'}`
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
                  </>
                ) : (
                  <div className="h-8 flex items-center">
                    {isLoading ? (
                      <p className="body-medium text-slate-600">Loading spaces...</p>
                    ) : error ? (
                      <p className="body-medium text-red-600">Error loading spaces</p>
                    ) : null}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={() => setShowFilters(true)}
                  className="btn-outline btn-small flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
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
          </div>

          {/* ✅ FIXED: Scrollable content with critical flexbox properties */}
          <div 
            className="scrollbar-hide"
            style={{ 
              flex: '1 1 auto',     // Grow to fill space
              minHeight: 0,         // Critical: Override flex default min-height
              overflowY: 'auto'     // Enable scrolling
            }}
          >
            {error ? (
              <div className="py-12">
                <ErrorState error={error} onRetry={loadPropertiesData} />
              </div>
            ) : isLoading ? (
              <div className="py-8">
                {/* ✅ NEW: Enhanced loading with skeleton cards */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-6">
                    <div 
                      className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                      style={{ borderColor: '#4668AB', borderTopColor: 'transparent' }}
                    ></div>
                    <p className="text-slate-600">Loading advertising spaces...</p>
                  </div>
                  {[...Array(6)].map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
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

                {/* ✅ ENHANCED: Improved pagination with better styling */}
                {!isLoading && !error && displayedSpaces.length > 0 && totalPages > 1 && (
                  <div 
                    className="border-t shadow-lg px-6 py-4 rounded-lg mt-6 sticky bottom-0"
                    style={{ 
                      
                      borderColor: '#E5E7EB',
                      backdropFilter: 'blur(10px)',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)'
                    }}
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
                {usingFallback ? (
                  <div className="text-center text-slate-600">
                    Showing the 10 closest spaces to you.
                  </div>
                ) : (
                  <EmptyState onClearFilters={clearFilters} />
                )}
              </div>
            )}
          </div>
        </div>
  
        {/* ✅ IMPROVED: Right Container with enhanced flexibility */}
        <div 
          className="h-full p-4 fixed right-0 transition-all duration-300"
          style={{ 
            width: detailsExpanded ? '48%' : '42%',
            minWidth: '400px'
          }}
        >
          <div className="relative w-full h-[calc(100%-75px)] bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-lg">
            <GoogleMap
              properties={properties.filter(property => 
                property.latitude && property.longitude
              )}
              onPropertyClick={handlePropertyClick}
              center={mapCenter}
              zoom={mapZoom}
              className="w-full h-[calc(100%-100px)]"
              spaces={displayedSpaces}
              advertisingAreas={displayedSpaces}
              onSpaceClick={handleSpaceClick}
              onAreaClick={handleSpaceClick}
              showAreaMarkers={true}
              showPropertyMarkers={false}
              onBoundsChange={(b, z) => setMapBounds(b)}
            />

            <div 
              className="absolute top-4 right-4"
              style={{ zIndex: Z_INDEX.MAP }}
            >
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

            {/* Removed top-left panel to adopt Airbnb-like popup UX; counts now shown in list header */}

            {/* ✅ ENHANCED: Loading state with better messaging */}
            {isLoading && (
              <div 
                className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center"
                style={{ zIndex: Z_INDEX.MODAL_BACKDROP }}
              >
                <div className="bg-white rounded-lg p-4 text-center shadow-lg">
                  <div 
                    className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-2"
                    style={{ borderColor: '#4668AB', borderTopColor: 'transparent' }}
                  ></div>
                  <p className="text-sm text-slate-600">Loading map data...</p>
                  <p className="text-xs text-slate-500 mt-1">Preparing your advertising opportunities</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ NEW: Intro Modal for Desktop - Highest z-index */}
      <IntroModal
        isOpen={showIntroModal}
        onClose={handleIntroClose}
        onComplete={handleIntroComplete}
      />

      {/* ✅ Business Profile Modal for Desktop */}
      <BusinessDetailsModal
        isOpen={showBusinessProfileModal}
        onClose={handleBusinessProfileClose}
        onProfileComplete={handleBusinessProfileComplete}
        required={true}
        style={{ zIndex: Z_INDEX.MODAL_CONTENT }}
      />
  
      {/* ✅ Desktop Modal Components with proper z-index */}
      <CartModal 
        showCart={showCart}
        setShowCart={setShowCart}
        cart={cart}
        setCart={setCart}
        removeFromCart={removeFromCart}
        updateCartItemDuration={updateCartItemDuration}
        getTotalCartValue={getTotalCartValue}
        style={{ zIndex: Z_INDEX.MODAL_CONTENT }}
      />
  
      <FiltersModal 
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        filters={filters}
        toggleFilter={toggleFilter}
        toggleFeature={toggleFeature}
        clearFilters={clearFilters}
        filteredSpaces={filteredSpaces}
  setPriceRange={setPriceRange}
  priceHistogram={priceHistogram}
        style={{ zIndex: Z_INDEX.MODAL_CONTENT }}
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
        style={{ zIndex: Z_INDEX.MODAL_CONTENT }}
      />
  
      <ROICalculatorModal 
        showROICalculator={showROICalculator}
        setShowROICalculator={setShowROICalculator}
        selectedSpace={selectedSpace}
        isInCart={isInCart}
        addToCart={addToCart}
        handleBookingNavigation={handleBookingNavigation}
        style={{ zIndex: Z_INDEX.MODAL_CONTENT }}
      />
    </div>
  );
}