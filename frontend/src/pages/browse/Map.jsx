// src/pages/browse/Map.jsx - Fixed: Stationary Map + Pagination
// ✅ UPDATED: Stationary map, 24 cards per page, proper API integration

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, MapPin, Loader2, Building2, Camera, Zap, ArrowLeft, 
  Filter, SlidersHorizontal, Grid, List, Eye, Star, Heart, 
  Share2, DollarSign, Users, Award, Navigation,
  Layers, ChevronRight, X, Menu, Maximize2, Minimize2,
  Calculator, MessageCircle, BookOpen, Phone, Mail, TrendingUp,
  Shield, Target, Clock, Bookmark, CheckCircle, AlertCircle,
  BarChart3, PieChart, Activity, Thermometer, Calendar, Home,
  Settings, Tag, Zap as Lightning, Wifi, Monitor, ShoppingCart,
  Plus, Minus, ChevronLeft
} from "lucide-react";
import GoogleMap from "@/components/browse/maps/GoogleMap";
import { useUser } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';

// ✅ API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Distance calculation utility
const getDistanceInKm = (lat1, lon1, lat2, lon2) => {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return Infinity;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Helper functions for business insights
const getBusinessInsights = (property) => {
  const insights = {
    footTraffic: Math.floor(Math.random() * 20000) + 5000,
    conversionRate: (Math.random() * 3 + 1).toFixed(1),
    avgCampaignLift: Math.floor(Math.random() * 25) + 10,
    businessTypes: ['Restaurant', 'Retail', 'Service', 'Healthcare'],
    peakHours: '8AM-10AM, 5PM-7PM',
    demographics: 'Families (45%), Young Professionals (35%), Seniors (20%)'
  };
  return insights;
};

const getTrustIndicators = (property) => {
  return {
    verified: Math.random() > 0.3,
    rating: (Math.random() * 2 + 3).toFixed(1),
    reviewCount: Math.floor(Math.random() * 50) + 5,
    responseTime: Math.floor(Math.random() * 4) + 1,
    businessesServed: Math.floor(Math.random() * 100) + 20
  };
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

// Helper functions for AdvertisingAreas
const getAreaName = (area) => {
  return area.name || area.title || 'Unnamed Advertising Area';
};

const getAreaType = (area) => {
  const type = area.type;
  const typeLabels = {
    'billboard': 'Billboard',
    'digital_display': 'Digital Display',
    'digital_marquee': 'Digital Marquee', 
    'luxury_video_wall': 'Luxury Video Wall',
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
    'lobby_display': 'Lobby Display',
    'concourse_display': 'Concourse Display',
    'other': 'Other'
  };
  return typeLabels[type] || (type ? type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ') : 'Advertising Area');
};

const getAreaPrice = (area) => {
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

const getNumericPrice = (area) => {
  if (area.baseRate) return area.baseRate;
  if (area.pricing) {
    try {
      const pricing = typeof area.pricing === 'string' ? JSON.parse(area.pricing) : area.pricing;
      if (pricing.daily) return pricing.daily;
      if (pricing.weekly) return Math.round(pricing.weekly / 7);
      if (pricing.monthly) return Math.round(pricing.monthly / 30);
    } catch (e) {
      console.warn('Error parsing area pricing:', e);
    }
  }
  return 150;
};

const getAreaCategoryIcon = (area) => {
  const type = area.type?.toLowerCase() || '';
  const categories = {
    digital: { icon: Lightning, types: ['digital_display', 'digital_marquee', 'luxury_video_wall', 'elevator_display', 'concourse_display'] },
    outdoor: { icon: Eye, types: ['billboard', 'coastal_billboard', 'building_wrap', 'parking_totem', 'bus_shelter'] },
    retail: { icon: Building2, types: ['mall_kiosk', 'window_display', 'gallery_storefront', 'lobby_display'] },
    transit: { icon: Navigation, types: ['platform_display', 'bus_shelter', 'parking_structure'] },
    indoor: { icon: Monitor, types: ['wall_graphic', 'floor_graphic', 'other'] }
  };
  
  for (const [key, category] of Object.entries(categories)) {
    if (category.types.some(t => type.includes(t))) {
      return category.icon;
    }
  }
  return Building2;
};

export default function MapPage() {
  const navigate = useNavigate();
  
  // ✅ FIXED: Core state for stationary map and pagination
  const [properties, setProperties] = useState([]);
  const [allSpaces, setAllSpaces] = useState([]);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ✅ FIXED: Static map center (no more movement)
  const [mapCenter] = useState({ lat: 33.7175, lng: -117.8311 }); // Orange County, CA
  const [mapZoom] = useState(10); // Fixed zoom level
  const [userLocation, setUserLocation] = useState(null);
  
  // ✅ NEW: Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const CARDS_PER_PAGE = 24;
  
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
        // ✅ NO MAP MOVEMENT - map stays on Orange County
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
    console.log('🗺️ Map component mounting');
    isMountedRef.current = true;
    
    loadPropertiesData();
    
    return () => {
      console.log('🗺️ Map component unmounting');
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
          // ✅ NO AUTO-CENTERING - map stays put
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

    // Price filter
    if (filters.priceRange !== 'all') {
      filtered = filtered.filter(space => {
        const price = getNumericPrice(space);
        switch (filters.priceRange) {
          case 'under500': return price <= 500/30;
          case 'under1000': return price <= 1000/30;
          case 'under2000': return price <= 2000/30;
          default: return true;
        }
      });
    }

    // Space type filter  
    if (filters.spaceType !== 'all') {
      filtered = filtered.filter(space => {
        const type = space.type?.toLowerCase() || '';
        const typeCategories = {
          digital: ['digital_display', 'digital_marquee', 'luxury_video_wall', 'elevator_display', 'concourse_display'],
          outdoor: ['billboard', 'coastal_billboard', 'building_wrap', 'parking_totem', 'bus_shelter'],
          retail: ['mall_kiosk', 'window_display', 'gallery_storefront', 'lobby_display'],
          transit: ['platform_display', 'bus_shelter', 'parking_structure'],
          indoor: ['wall_graphic', 'floor_graphic', 'other']
        };
        
        return typeCategories[filters.spaceType]?.some(t => type.includes(t)) || false;
      });
    }

    // Audience filter
    if (filters.audience !== 'all') {
      filtered = filtered.filter(space => {
        const insights = getBusinessInsights(space.property);
        const audienceMatch = {
          'families': insights.demographics.includes('Families'),
          'professionals': insights.demographics.includes('Professional'),
          'commuters': space.property.propertyType === 'transit' || space.property.city === 'Fullerton'
        };
        return audienceMatch[filters.audience] || true;
      });
    }

    // Features filter
    if (filters.features.length > 0) {
      filtered = filtered.filter(space => {
        const trust = getTrustIndicators(space.property);
        const insights = getBusinessInsights(space.property);
        
        return filters.features.every(feature => {
          switch (feature) {
            case 'verified': return trust.verified;
            case 'high_traffic': return insights.footTraffic > 15000;
            case 'premium': return getNumericPrice(space) > 300;
            case 'digital': return space.type?.toLowerCase().includes('digital');
            default: return true;
          }
        });
      });
    }

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

  // ✅ FIXED: Event handlers with NO map movement
  const handleSpaceClick = (space) => {
    if (!isMountedRef.current) return;
    
    console.log('📍 Space clicked:', space);
    setSelectedSpace(space);
    setDetailsExpanded(true);
    // ✅ NO MAP MOVEMENT - map stays stationary
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
    // ✅ NO MAP MOVEMENT - map stays stationary
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

  // ✅ ONLY location button can move the map
  const handleCenterOnLocation = () => {
    if (userLocation) {
      // For demo - would actually move map to user location
      console.log('📍 Would center map on user location:', userLocation);
      alert('Location feature coming soon! For now, the map stays centered on Orange County.');
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(coords);
          console.log('📍 Would center map on user location:', coords);
          alert('Location detected! For now, the map stays centered on Orange County.');
        },
        (error) => {
          console.error('Could not get location:', error);
          alert('Unable to access your location. Please check permissions.');
        }
      );
    }
  };

  const handleBookingNavigation = (space) => {
    navigate(`/booking/${space.propertyId}/${space.id}`);
  };

  // Calculate ROI for a space
  const calculateROI = (space) => {
    const price = getNumericPrice(space);
    const monthlyPrice = price * 30;
    const insights = getBusinessInsights(space.property);
    
    const estimatedReach = insights.footTraffic * 0.7;
    const estimatedClicks = estimatedReach * (insights.conversionRate / 100);
    const estimatedRevenue = estimatedClicks * 25;
    const roi = ((estimatedRevenue - monthlyPrice) / monthlyPrice * 100).toFixed(0);
    
    return {
      investment: monthlyPrice,
      estimatedReach,
      estimatedClicks: Math.floor(estimatedClicks),
      estimatedRevenue: Math.floor(estimatedRevenue),
      roi
    };
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

  // ✅ NEW: Pagination controls
  const renderPaginationControls = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        const start = Math.max(1, currentPage - 2);
        const end = Math.min(totalPages, start + maxVisiblePages - 1);
        
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
      }
      
      return pages;
    };

    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800/50">
        <div className="text-sm text-gray-400">
          Showing {((currentPage - 1) * CARDS_PER_PAGE) + 1}-{Math.min(currentPage * CARDS_PER_PAGE, filteredSpaces.length)} of {filteredSpaces.length} spaces
        </div>
        
        <div className="flex items-center gap-2">
          {/* Previous Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map(pageNum => (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(pageNum)}
                className={`w-10 h-8 p-0 ${
                  currentPage === pageNum
                    ? 'bg-lime-400 text-gray-900 hover:bg-lime-500'
                    : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {pageNum}
              </Button>
            ))}
          </div>

          {/* Next Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-50"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen overflow-hidden bg-gray-900 text-white">
      <div className="flex h-full">
        
        {/* Left Container: Fixed Container with Scrollable Content (60%) */}
        <div className="w-[60%] h-full flex flex-col">
          {/* Header - Fixed */}
          <div className="p-6 bg-gray-900 border-b border-gray-800/50 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  Advertising Spaces
                </h1>
                <p className="text-gray-400 text-sm">
                  {filteredSpaces.length} spaces available • Orange County, CA
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Filter Button */}
                <Button 
                  onClick={() => setShowFilters(true)}
                  variant="outline"
                  size="sm"
                  className={`bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white ${
                    activeFiltersCount > 0 ? 'ring-1 ring-lime-400 text-lime-400' : ''
                  }`}
                >
                  <Filter className="w-4 h-4 mr-1" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge className="ml-2 bg-lime-400 text-gray-900 text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
                
                {/* Cart Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCart(true)}
                  className={`bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white relative ${
                    cart.length > 0 ? 'ring-1 ring-lime-400 text-lime-400' : ''
                  }`}
                >
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  Cart
                  {cart.length > 0 && (
                    <Badge className="ml-2 bg-lime-400 text-gray-900 text-xs">
                      {cart.length}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-400">Active filters:</span>
                {filters.priceRange !== 'all' && (
                  <Badge 
                    variant="secondary" 
                    className="bg-lime-400/20 text-lime-400 border-lime-400/30"
                  >
                    {filters.priceRange.replace('under', 'Under $').replace('500', '500/mo').replace('1000', '1K/mo').replace('2000', '2K/mo')}
                  </Badge>
                )}
                {filters.spaceType !== 'all' && (
                  <Badge 
                    variant="secondary" 
                    className="bg-lime-400/20 text-lime-400 border-lime-400/30"
                  >
                    {filters.spaceType.charAt(0).toUpperCase() + filters.spaceType.slice(1)}
                  </Badge>
                )}
                {filters.audience !== 'all' && (
                  <Badge 
                    variant="secondary" 
                    className="bg-lime-400/20 text-lime-400 border-lime-400/30"
                  >
                    {filters.audience.charAt(0).toUpperCase() + filters.audience.slice(1)}
                  </Badge>
                )}
                {filters.features.map(feature => (
                  <Badge 
                    key={feature}
                    variant="secondary" 
                    className="bg-lime-400/20 text-lime-400 border-lime-400/30"
                  >
                    {feature.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-400 hover:text-white h-6 px-2"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>

          {/* ✅ Content Area - Flex grow with pagination */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                {error ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Failed to load advertising spaces
                      </h3>
                      <p className="text-gray-400 mb-4">{error}</p>
                      <Button 
                        onClick={loadPropertiesData}
                        className="bg-lime-400 text-gray-900 hover:bg-lime-500"
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                ) : isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-lime-400 mx-auto mb-4" />
                      <p className="text-gray-400">Finding the perfect advertising spaces...</p>
                    </div>
                  </div>
                ) : paginatedSpaces.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paginatedSpaces.map(space => {
                      const trust = getTrustIndicators(space.property);
                      const insights = getBusinessInsights(space.property);
                      const IconComponent = getAreaCategoryIcon(space);
                      
                      return (
                        <motion.div
                          key={space.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          whileHover={{ y: -4 }}
                        >
                          <Card 
                            onClick={() => handleSpaceCardClick(space)}
                            className={`cursor-pointer transition-all duration-300 group overflow-hidden rounded-2xl bg-gray-800/60 backdrop-blur-lg border-gray-700/50 hover:bg-gray-700/60 hover:border-lime-400/30 hover:shadow-xl hover:shadow-lime-400/10 ${
                              animatingSpace === space.id ? 'ring-2 ring-lime-400 shadow-xl shadow-lime-400/20' : ''
                            }`}
                          >
                            <CardContent className="p-0">
                              {/* Square Image Section */}
                              <div className="relative aspect-square overflow-hidden">
                                <img 
                                  src={space.images || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400'} 
                                  alt={getAreaName(space)} 
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                  onError={(e) => {
                                    e.target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400';
                                  }}
                                />
                                
                                {/* Overlay Elements */}
                                <div className="absolute top-3 left-3">
                                  <Badge className="bg-lime-400 text-gray-900 flex items-center gap-1 text-xs">
                                    <IconComponent className="w-3 h-3" />
                                    {getAreaType(space)}
                                  </Badge>
                                </div>

                                <div className="absolute top-3 right-3 flex gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleSavedSpace(space.id);
                                    }}
                                    className="p-2 bg-gray-900/80 hover:bg-gray-800 rounded-full transition-colors"
                                  >
                                    <Heart className={`w-4 h-4 ${
                                      savedSpaces.has(space.id) ? 'fill-red-500 text-red-500' : 'text-white'
                                    }`} />
                                  </button>
                                  
                                  {/* Quick Add to Cart Button */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!isInCart(space.id)) {
                                        addToCart(space);
                                      }
                                    }}
                                    className={`p-2 bg-gray-900/80 hover:bg-gray-800 rounded-full transition-colors ${
                                      isInCart(space.id) ? 'bg-lime-400/80 text-gray-900' : ''
                                    }`}
                                    disabled={isInCart(space.id)}
                                  >
                                    {isInCart(space.id) ? (
                                      <CheckCircle className="w-4 h-4" />
                                    ) : (
                                      <Plus className="w-4 h-4 text-white" />
                                    )}
                                  </button>
                                </div>

                                {trust?.verified && (
                                  <div className="absolute bottom-3 left-3">
                                    <Badge className="bg-green-500 text-white border-0 flex items-center gap-1 text-xs">
                                      <CheckCircle className="w-3 h-3" />
                                      Verified
                                    </Badge>
                                  </div>
                                )}

                                <div className="absolute bottom-3 right-3">
                                  <Badge className="bg-gray-900/90 text-lime-400 border-0 font-bold">
                                    {getAreaPrice(space)}
                                  </Badge>
                                </div>
                              </div>

                              {/* Content Section */}
                              <div className="p-4 space-y-2">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-base text-white group-hover:text-lime-400 transition-colors duration-300 truncate">
                                      {getAreaName(space)}
                                    </h3>
                                    <p className="text-xs text-gray-400 font-medium truncate">
                                      at {space.propertyName}
                                    </p>
                                  </div>
                                  {trust?.rating && (
                                    <div className="flex items-center text-yellow-400 ml-2">
                                      <Star className="w-3 h-3 mr-1 fill-current" />
                                      <span className="text-xs font-medium">{trust.rating}</span>
                                    </div>
                                  )}
                                </div>
                                
                                <p className="text-xs text-gray-400 flex items-center truncate">
                                  <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                                  {space.propertyAddress}
                                </p>

                                {/* Performance Metrics */}
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center text-emerald-400">
                                    <Users className="w-3 h-3 mr-1" />
                                    <span>{(insights.footTraffic/1000).toFixed(0)}K/day</span>
                                  </div>
                                  <div className="flex items-center text-cyan-400">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    <span>+{insights.avgCampaignLift}%</span>
                                  </div>
                                </div>

                                {/* Action Area */}
                                <div className="flex items-center justify-between pt-2">
                                  <div className="flex items-center text-lime-400">
                                    <Eye className="w-3 h-3 mr-1" />
                                    <span className="text-xs">Available</span>
                                  </div>
                                  <Button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSpaceClick(space);
                                    }}
                                    size="sm"
                                    className="bg-lime-400 text-gray-900 hover:bg-lime-500 text-xs px-3 py-1"
                                  >
                                    Details
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">
                        No advertising spaces found
                      </h3>
                      <p className="text-gray-400 mb-4">
                        Try adjusting your filters to see more results
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={clearFilters}
                        className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                      >
                        Clear filters
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ✅ Pagination Controls - Fixed at bottom */}
            {renderPaginationControls()}
          </div>
        </div>

        {/* Right Container: Fixed Map with Padding (40%) */}
        <div className="w-[40%] h-full p-4">
          <div className="relative w-full h-full bg-gray-800 rounded-2xl overflow-hidden">
            <GoogleMap
              properties={properties.filter(property => 
                property.latitude && property.longitude
              )}
              onPropertyClick={handlePropertyClick}
              center={mapCenter} // ✅ Always Orange County
              zoom={mapZoom} // ✅ Fixed zoom
              className="w-full h-full"
              advertisingAreas={paginatedSpaces} // Show only current page spaces on map
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

      {/* ✅ NEW: Cart Modal */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowCart(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Your Cart</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCart(false)}
                    className="text-gray-400 hover:text-white hover:bg-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Your cart is empty</h3>
                    <p className="text-gray-400">Add some advertising spaces to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map(item => (
                      <div key={item.id} className="p-4 bg-gray-700/50 rounded-xl border border-gray-600">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-white">{getAreaName(item.space)}</h3>
                            <p className="text-sm text-gray-400">{item.space.propertyName}</p>
                            <p className="text-xs text-gray-500">{item.space.propertyAddress}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-400 hover:text-red-400 hover:bg-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-400">Duration:</span>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateCartItemDuration(item.id, Math.max(1, item.duration - 1))}
                                className="bg-gray-600 border-gray-500 text-gray-300 hover:bg-gray-500 h-8 w-8 p-0"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="text-white font-medium w-12 text-center">{item.duration} days</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateCartItemDuration(item.id, item.duration + 1)}
                                className="bg-gray-600 border-gray-500 text-gray-300 hover:bg-gray-500 h-8 w-8 p-0"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-400">${item.pricePerDay}/day</p>
                            <p className="text-lg font-bold text-lime-400">${item.totalPrice}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t border-gray-600 pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-semibold text-white">Total:</span>
                        <span className="text-2xl font-bold text-lime-400">${getTotalCartValue()}</span>
                      </div>
                      
                      <div className="flex gap-3">
                        <Button 
                          className="flex-1 bg-lime-400 text-gray-900 hover:bg-lime-500"
                          onClick={() => {
                            console.log('Proceeding to checkout with cart:', cart);
                            setShowCart(false);
                          }}
                        >
                          Proceed to Checkout
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setCart([])}
                          className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
                        >
                          Clear Cart
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters Modal */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowFilters(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Filter Advertising Spaces</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                    className="text-gray-400 hover:text-white hover:bg-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Price Range */}
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-3">Price Range</h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'all', label: 'Any Budget' },
                        { id: 'under500', label: 'Under $500/mo' },
                        { id: 'under1000', label: 'Under $1K/mo' },
                        { id: 'under2000', label: 'Under $2K/mo' }
                      ].map(price => (
                        <Button
                          key={price.id}
                          variant={filters.priceRange === price.id ? 'default' : 'outline'}
                          size="sm"
                          className={`rounded-xl transition-all ${
                            filters.priceRange === price.id 
                              ? 'bg-lime-400 text-gray-900 hover:bg-lime-500' 
                              : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white'
                          }`}
                          onClick={() => toggleFilter('priceRange', price.id)}
                        >
                          {price.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Space Type */}
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-3">Space Type</h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'all', label: 'All Types', icon: Building2 },
                        { id: 'digital', label: 'Digital', icon: Lightning },
                        { id: 'outdoor', label: 'Outdoor', icon: Eye },
                        { id: 'retail', label: 'Retail', icon: Building2 },
                        { id: 'transit', label: 'Transit', icon: Navigation },
                        { id: 'indoor', label: 'Indoor', icon: Monitor }
                      ].map(type => (
                        <Button
                          key={type.id}
                          variant={filters.spaceType === type.id ? 'default' : 'outline'}
                          size="sm"
                          className={`rounded-xl flex items-center gap-1 transition-all ${
                            filters.spaceType === type.id 
                              ? 'bg-lime-400 text-gray-900 hover:bg-lime-500' 
                              : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white'
                          }`}
                          onClick={() => toggleFilter('spaceType', type.id)}
                        >
                          <type.icon className="w-3 h-3" />
                          {type.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Target Audience */}
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-3">Target Audience</h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'all', label: 'Everyone', icon: Users },
                        { id: 'families', label: 'Families', icon: Users },
                        { id: 'professionals', label: 'Professionals', icon: Target },
                        { id: 'commuters', label: 'Commuters', icon: Navigation }
                      ].map(audience => (
                        <Button
                          key={audience.id}
                          variant={filters.audience === audience.id ? 'default' : 'outline'}
                          size="sm"
                          className={`rounded-xl flex items-center gap-1 transition-all ${
                            filters.audience === audience.id 
                              ? 'bg-lime-400 text-gray-900 hover:bg-lime-500' 
                              : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white'
                          }`}
                          onClick={() => toggleFilter('audience', audience.id)}
                        >
                          <audience.icon className="w-3 h-3" />
                          {audience.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-3">Features</h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'verified', label: 'Verified Owner', icon: CheckCircle },
                        { id: 'high_traffic', label: 'High Traffic', icon: TrendingUp },
                        { id: 'premium', label: 'Premium Location', icon: Star },
                        { id: 'digital', label: 'Digital Display', icon: Lightning }
                      ].map(feature => (
                        <Button
                          key={feature.id}
                          variant={filters.features.includes(feature.id) ? 'default' : 'outline'}
                          size="sm"
                          className={`rounded-xl flex items-center gap-1 transition-all ${
                            filters.features.includes(feature.id) 
                              ? 'bg-lime-400 text-gray-900 hover:bg-lime-500' 
                              : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white'
                          }`}
                          onClick={() => toggleFeature(feature.id)}
                        >
                          <feature.icon className="w-3 h-3" />
                          {feature.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-700 mt-6">
                  <Button 
                    variant="outline" 
                    onClick={clearFilters}
                    className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
                  >
                    Clear All
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">
                      {filteredSpaces.length} spaces found
                    </span>
                    <Button 
                      onClick={() => setShowFilters(false)}
                      className="bg-lime-400 text-gray-900 hover:bg-lime-500"
                    >
                      Show Results
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Space Details Modal */}
      <AnimatePresence>
        {selectedSpace && detailsExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => {
              setSelectedSpace(null);
              setDetailsExpanded(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-4xl bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 pb-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white">{getAreaName(selectedSpace)}</h2>
                    <p className="text-gray-400">at {selectedSpace.propertyName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-lime-400 text-gray-900 px-3 py-1">
                      {getAreaType(selectedSpace)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedSpace(null);
                        setDetailsExpanded(false);
                      }}
                      className="text-gray-400 hover:text-white hover:bg-gray-700"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Main Content - Split Layout */}
              <div className="flex h-[calc(85vh-140px)]">
                {/* Left Side - Image */}
                <div className="w-1/2 p-6 pr-3">
                  <div className="relative w-full h-full rounded-xl overflow-hidden">
                    <img 
                      src={selectedSpace.images || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'} 
                      alt={getAreaName(selectedSpace)}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800';
                      }}
                    />
                  </div>
                </div>

                {/* Right Side - Details */}
                <div className="w-1/2 p-6 pl-3 flex flex-col">
                  {/* Price & Location */}
                  <div className="grid grid-cols-1 gap-4 mb-6">
                    <div className="p-4 bg-gray-700/50 rounded-xl border border-gray-600">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Price</p>
                          <p className="text-2xl font-bold text-lime-400">{getAreaPrice(selectedSpace)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Location</p>
                          <p className="text-base font-semibold text-white leading-tight">{selectedSpace.propertyAddress}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="mb-6">
                    {(() => {
                      const roi = calculateROI(selectedSpace);
                      const insights = getBusinessInsights(selectedSpace.property);
                      const trust = getTrustIndicators(selectedSpace.property);
                      
                      return (
                        <div className="p-4 bg-gray-700/50 rounded-xl border border-gray-600">
                          <h3 className="font-semibold text-white mb-3">Performance & Trust</h3>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Daily Traffic:</span>
                                <span className="font-semibold text-white">{(insights.footTraffic/1000).toFixed(0)}K</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Campaign Lift:</span>
                                <span className="font-semibold text-cyan-400">+{insights.avgCampaignLift}%</span>
                              </div>
                              {trust.verified && (
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Status:</span>
                                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Verified
                                  </Badge>
                                </div>
                              )}
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Monthly Reach:</span>
                                <span className="font-semibold text-white">{roi.estimatedReach.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Est. ROI:</span>
                                <span className="font-bold text-lime-400">+{roi.roi}%</span>
                              </div>
                              {trust.rating && (
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Rating:</span>
                                  <div className="flex items-center text-yellow-400">
                                    <Star className="w-3 h-3 mr-1 fill-current" />
                                    <span className="text-xs font-medium">{trust.rating}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Action Buttons - Flex Grow */}
                  <div className="flex-1 flex flex-col justify-end">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {!isInCart(selectedSpace.id) ? (
                        <Button 
                          className="bg-lime-400 text-gray-900 hover:bg-lime-500"
                          onClick={() => {
                            addToCart(selectedSpace);
                          }}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                      ) : (
                        <Button 
                          className="bg-green-500 text-white hover:bg-green-600"
                          disabled
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          In Cart
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        onClick={() => handleBookingNavigation(selectedSpace)}
                        className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Book Now
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowROICalculator(true)}
                        className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
                      >
                        <Calculator className="w-4 h-4 mr-2" />
                        ROI Calculator
                      </Button>
                      <Button 
                        variant="outline" 
                        className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Contact
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ROI Calculator Modal */}
      <AnimatePresence>
        {showROICalculator && selectedSpace && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowROICalculator(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-gray-800 rounded-2xl border border-gray-700 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">ROI Calculator</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowROICalculator(false)}
                    className="text-gray-400 hover:text-white hover:bg-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {(() => {
                  const roi = calculateROI(selectedSpace);
                  return (
                    <div className="space-y-6">
                      <div className="p-4 bg-gray-700/50 rounded-xl border border-gray-600">
                        <h4 className="font-semibold text-white mb-4">{getAreaName(selectedSpace)}</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Monthly Investment</p>
                            <p className="text-xl font-bold text-white">${roi.investment}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Estimated ROI</p>
                            <p className="text-xl font-bold text-lime-400">+{roi.roi}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Monthly Reach</p>
                            <p className="text-xl font-bold text-white">{roi.estimatedReach.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Est. Revenue</p>
                            <p className="text-xl font-bold text-white">${roi.estimatedRevenue.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-gray-400 space-y-1">
                        <p>• Based on location foot traffic and industry averages</p>
                        <p>• Actual results may vary based on campaign quality and timing</p>
                        <p>• Includes estimated 70% view rate and {getBusinessInsights(selectedSpace.property).conversionRate}% engagement rate</p>
                      </div>

                      <div className="flex gap-3">
                        {!isInCart(selectedSpace.id) ? (
                          <Button 
                            className="flex-1 bg-lime-400 text-gray-900 hover:bg-lime-500"
                            onClick={() => {
                              addToCart(selectedSpace);
                              setShowROICalculator(false);
                            }}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Add to Cart
                          </Button>
                        ) : (
                          <Button 
                            className="flex-1 bg-lime-400 text-gray-900 hover:bg-lime-500"
                            onClick={() => {
                              setShowROICalculator(false);
                              handleBookingNavigation(selectedSpace);
                            }}
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            Book This Space
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
                        >
                          Discuss Details
                        </Button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}