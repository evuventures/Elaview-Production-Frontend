// src/pages/browse/Map.jsx
// ✅ ENHANCED: Hierarchical drill-down navigation system

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import { Property, AdvertisingArea } from '@/api/entities';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, MapPin, Loader2, Building2, Camera, Zap, ArrowLeft, 
  Filter, SlidersHorizontal, Grid, List, Eye, Star, Heart, 
  Share2, DollarSign, Users, Award, Navigation,
  Layers, ChevronRight, X, Menu, Maximize2, Minimize2,
  Calculator, MessageCircle, BookOpen, Phone, Mail, TrendingUp,
  Shield, Target, Clock, Bookmark, CheckCircle, AlertCircle,
  BarChart3, PieChart, Activity, Thermometer, Calendar, Home
} from "lucide-react";
import GoogleMap from "@/components/browse/maps/GoogleMap";
import MapSearchFilter from "@/components/search/MapSearchFilter";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from '@clerk/clerk-react';

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

// Helper functions for business insights (keep existing)
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
  const navigate = useNavigate();
  
  // ✅ ENHANCED: Core state with hierarchical navigation
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [propertyAreas, setPropertyAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAreas, setIsLoadingAreas] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mapCenter, setMapCenter] = useState({ lat: 33.7175, lng: -117.8311 });
  const [mapZoom, setMapZoom] = useState(10);
  const [userLocation, setUserLocation] = useState(null);
  
  // ✅ NEW: Hierarchical navigation state
  const [viewMode, setViewMode] = useState('properties'); // 'properties' | 'areas'
  const [navigationHistory, setNavigationHistory] = useState([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // UI state
  const [listView, setListView] = useState('list');
  const [animatingProperty, setAnimatingProperty] = useState(null);
  const [searchHighlight, setSearchHighlight] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [hoverProperty, setHoverProperty] = useState(null);
  const [savedProperties, setSavedProperties] = useState(new Set());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Business filters
  const [businessFilters, setBusinessFilters] = useState({
    budget: 'all',
    businessType: 'all',
    audience: 'all',
    campaignGoal: 'all'
  });
  const [showROICalculator, setShowROICalculator] = useState(false);
  const [mapLayers, setMapLayers] = useState({
    properties: true,
    heatMap: false,
    competitors: false,
    demographics: false
  });
  const [roiData, setROIData] = useState({
    budget: 1000,
    duration: 30,
    businessType: 'restaurant'
  });
  
  const { user: currentUser } = useUser();
  const isMountedRef = useRef(true);

  // Detect mobile view
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

      const validProperties = propertiesData.filter(property => {
        const coords = getPropertyCoords(property);
        return coords !== null;
      });

      console.log(`🏢 Properties loaded: ${validProperties.length}/${propertiesData.length} with coordinates`);

      if (isMountedRef.current) {
        setProperties(validProperties);

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

  // ✅ ENHANCED: Load advertising areas with hierarchical navigation
  const loadPropertyAreas = async (property) => {
    if (!isMountedRef.current || !property) return;
    
    setIsLoadingAreas(true);
    setIsTransitioning(true);
    
    try {
      console.log('📍 Loading advertising areas for property:', property.id);
      
      const propertySpecificAreas = property.advertising_areas || [];

      console.log(`📍 Found ${propertySpecificAreas.length} advertising areas for property`);

      if (isMountedRef.current) {
        // ✅ NEW: Smooth transition to areas view
        setPropertyAreas(propertySpecificAreas);
        
        // Update navigation history
        setNavigationHistory(prev => [
          ...prev,
          {
            type: 'property',
            data: property,
            viewMode: 'properties',
            center: mapCenter,
            zoom: mapZoom
          }
        ]);
        
        // Switch to areas view with smooth zoom
        setTimeout(() => {
          setViewMode('areas');
          
          // Zoom into the property location
          const coords = getPropertyCoords(property);
          if (coords) {
            setMapCenter(coords);
            setMapZoom(16); // Closer zoom for area view
          }
          
          setIsTransitioning(false);
        }, 300);
      }
    } catch (error) {
      console.error("❌ Error loading property areas:", error);
      if (isMountedRef.current) {
        setPropertyAreas([]);
        setIsTransitioning(false);
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

  // Filtering logic
  const filteredProperties = useMemo(() => {
    let filtered = properties;

    if (searchTerm.trim()) {
      setIsSearching(true);
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(property => {
        const name = getPropertyName(property).toLowerCase();
        const address = getPropertyAddress(property).toLowerCase();
        const type = getPropertyType(property).toLowerCase();
        
        return name.includes(searchLower) || 
               address.includes(searchLower) || 
               type.includes(searchLower);
      });
      
      setSearchHighlight(searchTerm);
      setTimeout(() => setSearchHighlight(''), 300);
      setTimeout(() => setIsSearching(false), 500);
    } else {
      setIsSearching(false);
    }

    // Business filters
    if (businessFilters.budget !== 'all') {
      filtered = filtered.filter(property => {
        const areas = property.advertising_areas || [];
        const hasAffordableOption = areas.some(area => {
          const price = area.baseRate || 150;
          switch (businessFilters.budget) {
            case 'under500': return price <= 500/30;
            case 'under1000': return price <= 1000/30;
            case 'under2000': return price <= 2000/30;
            default: return true;
          }
        });
        return hasAffordableOption;
      });
    }

    if (businessFilters.audience !== 'all') {
      filtered = filtered.filter(property => {
        const insights = getBusinessInsights(property);
        const audienceMatch = {
          'families': insights.demographics.includes('Families'),
          'professionals': insights.demographics.includes('Professional'),
          'commuters': property.propertyType === 'transit' || property.city === 'Fullerton'
        };
        return audienceMatch[businessFilters.audience] || true;
      });
    }

    console.log(`🔍 Filtered ${filtered.length} properties from ${properties.length}`);
    return filtered;
  }, [searchTerm, properties, businessFilters]);

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
        .slice(0, 20);
      
      return propertiesWithDistance;
    }
    
    return [];
  }, [filteredProperties, mapCenter]);

  // ROI Calculator
  const calculateROI = (area) => {
    const price = area.baseRate || 150;
    const monthlyPrice = price * 30;
    const insights = getBusinessInsights(selectedProperty);
    
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

  // ✅ ENHANCED: Event handlers with hierarchical navigation
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

  const handlePropertyCardClick = (property) => {
    if (!isMountedRef.current) return;
    
    console.log('📱 Property card clicked:', property);
    setAnimatingProperty(property.id);
    
    const coords = getPropertyCoords(property);
    if (coords) {
      setMapCenter(coords);
      setMapZoom(16);
      setSelectedProperty(property);
      
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
    setDetailsExpanded(true);
  };

  // ✅ NEW: Hierarchical navigation handlers
  const handleBackToProperties = () => {
    setIsTransitioning(true);
    
    // Get previous state from navigation history
    const previousState = navigationHistory[navigationHistory.length - 1];
    
    if (previousState) {
      setMapCenter(previousState.center);
      setMapZoom(previousState.zoom);
    } else {
      // Fallback: zoom out to show all properties
      setMapZoom(10);
    }
    
    setTimeout(() => {
      setViewMode('properties');
      setSelectedProperty(null);
      setSelectedArea(null);
      setPropertyAreas([]);
      setDetailsExpanded(false);
      
      // Clear navigation history
      setNavigationHistory([]);
      setIsTransitioning(false);
    }, 300);
  };

  const handleViewAreasOnMap = () => {
    if (selectedProperty && propertyAreas.length > 0) {
      const coords = getPropertyCoords(selectedProperty);
      if (coords) {
        setMapCenter(coords);
        setMapZoom(17); // Even closer for detailed area view
      }
    }
  };

  // Enhanced action handlers
  const handleGetQuote = () => {
    if (selectedArea) {
      setShowROICalculator(true);
    }
  };

  const handleContactOwner = () => {
    console.log('📞 Contacting property owner for:', selectedProperty?.id);
    alert('Contact functionality would open here - phone, email, or instant message');
  };

  const handleViewSuccessStories = () => {
    console.log('📊 Viewing success stories for:', selectedArea?.type);
    alert('Success stories modal would open here');
  };

  const handleCenterOnLocation = () => {
    if (userLocation) {
      setMapCenter({ lat: userLocation.lat, lng: userLocation.lng });
      setMapZoom(14);
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(coords);
          setMapCenter(coords);
          setMapZoom(14);
        },
        (error) => {
          console.error('Could not get location:', error);
          alert('Unable to access your location. Please check permissions.');
        }
      );
    }
  };

  const toggleMapLayer = (layer) => {
    setMapLayers(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }));
  };

  const toggleSavedProperty = (propertyId) => {
    setSavedProperties(prev => {
      const newSet = new Set(prev);
      if (newSet.has(propertyId)) {
        newSet.delete(propertyId);
      } else {
        newSet.add(propertyId);
      }
      return newSet;
    });
  };

  const handleBookingNavigation = (propertyId, areaId) => {
    navigate(`/booking/${propertyId}/${areaId}`);
  };

  // Determine what to display in the list
  const currentItems = viewMode === 'properties' ? nearbyProperties : filteredAreas;
  const isShowingAreas = viewMode === 'areas';

  // Z-index management for proper layering
  const zIndexLayers = {
    map: 'z-0',
    sidebar: 'z-10',
    mapControls: 'z-20',
    detailsPanel: 'z-30',
    modal: 'z-50'
  };

  return (
    <div 
      className="w-full bg-background -mb-24 md:-mb-8 relative" 
      style={{ 
        height: 'calc(100vh - 80px)',
        overflow: 'hidden'
      }}
    >
      {/* ✅ ENHANCED: Google Map with hierarchical support */}
      <div className={`absolute inset-0 ${zIndexLayers.map}`} style={{ padding: '8px' }}>
        <GoogleMap
          properties={filteredProperties.filter(property => 
            property.latitude && property.longitude
          )}
          onPropertyClick={handlePropertyClick}
          center={mapCenter}
          zoom={mapZoom}
          className="w-full h-full rounded-2xl"
          // ✅ NEW: Hierarchical props
          viewMode={viewMode}
          selectedProperty={selectedProperty}
          advertisingAreas={filteredAreas}
          onAreaClick={handleAreaClick}
          showAreaMarkers={viewMode === 'areas'}
        />
      </div>

      {/* ✅ ENHANCED: Adaptive Sidebar with hierarchical navigation */}
      <div className={`absolute top-4 left-4 ${zIndexLayers.sidebar} transition-all duration-300 ${
        isMobile 
          ? 'right-4' 
          : sidebarCollapsed 
            ? 'w-16' 
            : 'w-[440px]'
      }`}>
        <Card className="shadow-xl rounded-2xl overflow-hidden backdrop-blur-lg bg-background/95 border border-border/50">
          <CardContent className={`${sidebarCollapsed && !isMobile ? 'p-3' : 'p-6'} max-h-[80vh] overflow-y-auto`}>
            {/* ✅ ENHANCED: Header with navigation breadcrumb */}
            <div className="flex items-center justify-between mb-4">
              {!sidebarCollapsed && (
                <>
                  <div className="flex items-center gap-2">
                    {isShowingAreas && (
                      <Button
                        variant="outline"
                        onClick={handleBackToProperties}
                        className="flex items-center gap-2 rounded-xl"
                        disabled={isTransitioning}
                      >
                        <ArrowLeft className="w-4 h-4" />
                        {!isMobile && "Properties"}
                      </Button>
                    )}
                    
                    {/* ✅ NEW: Breadcrumb navigation */}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Home className="w-4 h-4" />
                      {isShowingAreas && selectedProperty && (
                        <>
                          <ChevronRight className="w-3 h-3 mx-1" />
                          <span className="truncate max-w-[120px]">
                            {getPropertyName(selectedProperty)}
                          </span>
                          <ChevronRight className="w-3 h-3 mx-1" />
                          <span>Spaces</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-auto">
                    {/* ✅ NEW: View areas on map button */}
                    {isShowingAreas && propertyAreas.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleViewAreasOnMap}
                        title="Center map on advertising areas"
                      >
                        <Layers className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant={listView === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setListView('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={listView === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setListView('grid')}
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
              
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="ml-2"
                >
                  <Menu className="w-4 h-4" />
                </Button>
              )}
            </div>

            {(!sidebarCollapsed || isMobile) && (
              <>
                {/* Search */}
                <div className="relative mb-4">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 transition-all duration-300 ${
                    isSearching ? 'text-primary animate-pulse' : ''
                  }`} />
                  <Input
                    placeholder={isShowingAreas ? "Search advertising areas..." : "Find spaces for your business..."}
                    value={searchTerm}
                    onChange={(e) => isMountedRef.current && setSearchTerm(e.target.value)}
                    className={`pl-10 pr-12 rounded-xl transition-all duration-300 ${
                      searchHighlight ? 'ring-2 ring-primary ring-opacity-50' : ''
                    }`}
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                
                {/* Business filters (only show for properties view) */}
                {!isShowingAreas && (
                  <div className="space-y-3 mb-4">
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs font-medium text-muted-foreground">Budget:</span>
                      {[
                        { id: 'all', label: 'Any Budget' },
                        { id: 'under500', label: 'Under $500/mo' },
                        { id: 'under1000', label: 'Under $1K/mo' },
                        { id: 'under2000', label: 'Under $2K/mo' }
                      ].map(budget => (
                        <Button
                          key={budget.id}
                          variant={businessFilters.budget === budget.id ? 'default' : 'outline'}
                          size="sm"
                          className="rounded-lg text-xs"
                          onClick={() => setBusinessFilters(prev => ({ ...prev, budget: budget.id }))}
                        >
                          {budget.label}
                        </Button>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs font-medium text-muted-foreground">Target:</span>
                      {[
                        { id: 'all', label: 'Everyone', icon: Users },
                        { id: 'families', label: 'Families', icon: Users },
                        { id: 'professionals', label: 'Professionals', icon: Target },
                        { id: 'commuters', label: 'Commuters', icon: Navigation }
                      ].map(audience => (
                        <Button
                          key={audience.id}
                          variant={businessFilters.audience === audience.id ? 'default' : 'outline'}
                          size="sm"
                          className="rounded-lg text-xs flex items-center gap-1"
                          onClick={() => setBusinessFilters(prev => ({ ...prev, audience: audience.id }))}
                        >
                          <audience.icon className="w-3 h-3" />
                          {audience.label}
                        </Button>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" className="rounded-lg">
                        <Eye className="w-3 h-3 mr-1" />
                        Available Now
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-lg">
                        <Zap className="w-3 h-3 mr-1" />
                        Digital
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-lg">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        High Performance
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* ✅ ENHANCED: Results Summary with view mode context */}
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <span>
                    {isShowingAreas 
                      ? `${selectedProperty ? getPropertyName(selectedProperty) : 'Property'} - Ad Spaces`
                      : 'Available Advertising Spaces'
                    }
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`transition-all duration-300 ${
                      isSearching || isTransitioning ? 'text-primary font-medium' : ''
                    }`}>
                      {currentItems.length} found
                    </span>
                    {businessFilters.budget !== 'all' && (
                      <Badge variant="secondary" className="text-xs">
                        Budget filtered
                      </Badge>
                    )}
                    {isTransitioning && (
                      <Badge variant="outline" className="text-xs">
                        Loading...
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Results List */}
                <ScrollArea className="h-[280px] md:h-[420px] pr-2">
                  <div className={listView === 'grid' ? 'grid grid-cols-1 gap-3' : 'space-y-3'}>
                    {(isLoading || (isShowingAreas && isLoadingAreas)) ? (
                      <div className="text-center text-muted-foreground p-8">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                        {isShowingAreas ? 'Loading advertising spaces...' : 'Finding the best spaces for your business...'}
                      </div>
                    ) : currentItems.length > 0 ? (
                      currentItems.map(item => {
                        const insights = isShowingAreas ? null : getBusinessInsights(item);
                        const trust = isShowingAreas ? null : getTrustIndicators(item);
                        
                        return (
                          <Card 
                            key={item.id} 
                            onClick={() => isShowingAreas ? handleAreaClick(item) : handlePropertyCardClick(item)} 
                            className={`cursor-pointer transition-all duration-300 group overflow-hidden rounded-xl transform hover:scale-[1.02] hover:shadow-lg ${
                              animatingProperty === item.id ? 'ring-2 ring-primary scale-[1.02] shadow-lg' : ''
                            } ${searchHighlight && (
                              (isShowingAreas ? getAreaName(item) : getPropertyName(item)).toLowerCase().includes(searchHighlight.toLowerCase()) ||
                              (isShowingAreas ? getAreaType(item) : getPropertyType(item)).toLowerCase().includes(searchHighlight.toLowerCase())
                            ) ? 'ring-1 ring-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/10' : ''}`}
                          >
                            <CardContent className="p-0 flex items-center">
                              <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden">
                                <img 
                                  src={
                                    isShowingAreas 
                                      ? (item.images || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400')
                                      : (item.images?.[0] || item.primary_image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400')
                                  } 
                                  alt={isShowingAreas ? getAreaName(item) : getPropertyName(item)} 
                                  className="w-full h-full object-cover rounded-l-xl transition-transform duration-300 group-hover:scale-110" 
                                  onError={(e) => {
                                    e.target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400';
                                  }}
                                />
                                <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-xs px-1 py-0.5 rounded transition-transform duration-300 group-hover:scale-110">
                                  {isShowingAreas ? (
                                    (() => {
                                      // Import the same categorization logic here or create a shared utility
                                      const getAreaCategory = (area) => {
                                        const type = area.type?.toLowerCase() || '';
                                        const categories = {
                                          digital: { icon: '⚡', types: ['digital_display', 'digital_marquee', 'luxury_video_wall', 'elevator_display', 'concourse_display'] },
                                          outdoor: { icon: '🎯', types: ['billboard', 'coastal_billboard', 'building_wrap', 'parking_totem', 'bus_shelter'] },
                                          retail: { icon: '🛍️', types: ['mall_kiosk', 'window_display', 'gallery_storefront', 'lobby_display'] },
                                          transit: { icon: '🚊', types: ['platform_display', 'bus_shelter', 'parking_structure'] },
                                          indoor: { icon: '🏢', types: ['wall_graphic', 'floor_graphic', 'other'] }
                                        };
                                        
                                        for (const [key, category] of Object.entries(categories)) {
                                          if (category.types.some(t => type.includes(t))) {
                                            return category.icon;
                                          }
                                        }
                                        return '🏢'; // Default
                                      };
                                      
                                      return <span className="text-sm">{getAreaCategory(item)}</span>;
                                    })()
                                  ) : (
                                    <Building2 className="w-3 h-3" />
                                  )}
                                </div>

                                {!isShowingAreas && trust?.verified && (
                                  <div className="absolute bottom-1 right-1 bg-green-500 text-white text-xs p-0.5 rounded">
                                    <CheckCircle className="w-3 h-3" />
                                  </div>
                                )}
                              </div>
                              
                              <div className="p-3 flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-1">
                                  <h4 className="font-bold text-sm truncate group-hover:text-primary transition-colors duration-300">
                                    {isShowingAreas ? getAreaName(item) : getPropertyName(item)}
                                  </h4>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleSavedProperty(item.id);
                                    }}
                                    className="p-1 hover:bg-muted rounded transition-colors"
                                  >
                                    <Heart className={`w-3 h-3 ${
                                      savedProperties.has(item.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
                                    }`} />
                                  </button>
                                </div>
                                
                                <p className="text-xs text-muted-foreground flex items-center truncate mb-1">
                                  <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                                  {isShowingAreas ? item.city : `${item.city || 'City'}, ${item.state || 'State'}`}
                                </p>

                                {!isShowingAreas && insights && (
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="flex items-center text-xs text-green-600">
                                      <Users className="w-3 h-3 mr-1" />
                                      {insights.footTraffic.toLocaleString()}/day
                                    </div>
                                    {trust?.rating && (
                                      <div className="flex items-center text-xs text-yellow-600">
                                        <Star className="w-3 h-3 mr-1 fill-current" />
                                        {trust.rating}
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                <div className="flex items-center justify-between">
                                  <Badge variant="outline" className="text-xs">
                                    {isShowingAreas ? getAreaType(item) : getPropertyType(item)}
                                  </Badge>
                                  {isShowingAreas ? (
                                    <p className="text-xs font-semibold text-green-600">
                                      {getAreaPrice(item)}
                                    </p>
                                  ) : (
                                    <div className="flex items-center gap-1">
                                      {trust?.verified && (
                                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                          <Shield className="w-2 h-2 mr-1" />
                                          Verified
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {!isShowingAreas && insights && (
                                  <p className="text-xs text-blue-600 mt-1">
                                    Avg. campaign lift: +{insights.avgCampaignLift}%
                                  </p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    ) : (
                      <div className="text-center text-muted-foreground p-8">
                        <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="font-medium">
                          {searchTerm 
                            ? `No ${isShowingAreas ? 'advertising spaces' : 'properties'} found matching your search.`
                            : `No ${isShowingAreas ? 'advertising spaces' : 'properties'} found.`
                          }
                        </p>
                        {businessFilters.budget !== 'all' && (
                          <p className="text-xs mt-1">Try adjusting your budget filter</p>
                        )}
                        {searchTerm && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => isMountedRef.current && setSearchTerm('')}
                          >
                            Clear search
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Map Controls */}
      <div className={`absolute top-4 right-4 ${zIndexLayers.mapControls} flex flex-col gap-2`}>
        <div className="bg-background/90 backdrop-blur shadow-md rounded-xl p-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className={mapLayers.heatMap ? 'bg-primary text-primary-foreground' : ''}
            onClick={() => toggleMapLayer('heatMap')}
            title="Toggle foot traffic heat map"
          >
            <Thermometer className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={mapLayers.demographics ? 'bg-primary text-primary-foreground' : ''}
            onClick={() => toggleMapLayer('demographics')}
            title="Show audience demographics"
          >
            <Users className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={mapLayers.competitors ? 'bg-primary text-primary-foreground' : ''}
            onClick={() => toggleMapLayer('competitors')}
            title="Show competitor locations"
          >
            <Target className="w-4 h-4" />
          </Button>
        </div>
        
        <Button 
          variant="secondary" 
          size="sm" 
          className="bg-background/90 backdrop-blur shadow-md rounded-xl"
          onClick={handleCenterOnLocation}
          title="Center map on your location"
        >
          <Navigation className="w-4 h-4" />
        </Button>
      </div>

      {/* ✅ ENHANCED: Area Details Panel (replaces AdaptiveSpaceComponent popup) */}
      {selectedArea && detailsExpanded && (
        <div className={`absolute bottom-4 right-4 ${zIndexLayers.detailsPanel} w-96 max-w-[calc(100vw-2rem)]`}>
          <Card className="shadow-xl rounded-2xl overflow-hidden backdrop-blur-lg bg-background/95 border border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">{getAreaName(selectedArea)}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedArea(null);
                    setDetailsExpanded(false);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Area Image */}
                <div className="relative w-full h-48 rounded-lg overflow-hidden">
                  <img 
                    src={selectedArea.images || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400'} 
                    alt={getAreaName(selectedArea)}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400';
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-background/80">
                      {getAreaType(selectedArea)}
                    </Badge>
                  </div>
                </div>

                {/* Area Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="text-lg font-bold text-green-600">{getAreaPrice(selectedArea)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="text-sm font-medium">{selectedArea.city}</p>
                  </div>
                </div>

                {/* ROI Preview */}
                {selectedProperty && (() => {
                  const roi = calculateROI(selectedArea);
                  return (
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-2">Estimated ROI</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Monthly Reach:</span>
                          <span className="font-medium ml-1">{roi.estimatedReach.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Est. ROI:</span>
                          <span className="font-bold text-green-600 ml-1">+{roi.roi}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      if (selectedProperty) {
                        handleBookingNavigation(selectedProperty.id, selectedArea.id);
                      }
                    }}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Now
                  </Button>
                  <Button variant="outline" onClick={handleGetQuote}>
                    <Calculator className="w-4 h-4 mr-2" />
                    Get Quote
                  </Button>
                  <Button variant="outline" onClick={handleContactOwner}>
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>

                {/* Property Context */}
                {selectedProperty && (
                  <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground">
                      Part of {getPropertyName(selectedProperty)} • {getPropertyAddress(selectedProperty)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ROI Calculator Modal */}
      {showROICalculator && selectedArea && (
        <div className={`fixed inset-0 ${zIndexLayers.modal} bg-black/50 flex items-center justify-center p-4`}>
          <Card className="w-full max-w-lg bg-background">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">ROI Calculator</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowROICalculator(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {(() => {
                const roi = calculateROI(selectedArea);
                return (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-3">{getAreaName(selectedArea)}</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Monthly Investment</p>
                          <p className="text-lg font-bold">${roi.investment}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Estimated ROI</p>
                          <p className="text-lg font-bold text-green-600">+{roi.roi}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Monthly Reach</p>
                          <p className="text-lg font-bold">{roi.estimatedReach.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Est. Revenue</p>
                          <p className="text-lg font-bold">${roi.estimatedRevenue.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>• Based on location foot traffic and industry averages</p>
                      <p>• Actual results may vary based on campaign quality and timing</p>
                      <p>• Includes estimated 70% view rate and {getBusinessInsights(selectedProperty).conversionRate}% engagement rate</p>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        className="flex-1"
                        onClick={() => {
                          setShowROICalculator(false);
                          if (selectedProperty) {
                            navigate(`/booking/${selectedProperty.id}/${selectedArea.id}`);
                          }
                        }}
                      >
                        Book This Space
                      </Button>
                      <Button variant="outline" onClick={handleContactOwner}>
                        Discuss Details
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}