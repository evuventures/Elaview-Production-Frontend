// src/hooks/useDataPreloader.ts
// High-performance data preloading and caching system

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { apiOptimizer } from '../utils/apiOptimizer';
import { PERFORMANCE_CONFIG, PerformanceUtils } from '../utils/performanceConfig';

interface Space {
  id: string;
  name: string;
  type: string;
  baseRate?: number;
  images?: string;
  coordinates?: { lat: number; lng: number };
  property?: Property;
  propertyId?: string;
}

interface Property {
  id: string;
  name?: string;
  title: string;
  address: string;
  latitude?: number;
  longitude?: number;
  primary_image?: string;
  images?: any;
  photos?: any;
  spaces?: Space[];
}

interface PreloadedData {
  spaces: Space[];
  properties: Property[];
  propertySpacesMap: Map<string, Space[]>;
  isLoading: boolean;
  error: string | null;
  cacheTimestamp: number;
}

interface UseDataPreloaderReturn extends PreloadedData {
  refreshData: () => Promise<void>;
  getSpacesForProperty: (propertyId: string) => Space[];
  getPropertyById: (propertyId: string) => Property | undefined;
  preloadNextBatch: () => Promise<Space[]>;
  getCacheStats: () => any;
}

export const useDataPreloader = (): UseDataPreloaderReturn => {
  const [data, setData] = useState<PreloadedData>({
    spaces: [],
    properties: [],
    propertySpacesMap: new Map(),
    isLoading: true,
    error: null,
    cacheTimestamp: 0
  });

  const loadedBatches = useRef(0);
  const totalBatches = useRef(0);
  const isInitialized = useRef(false);

  // Memoized property lookup for instant access
  const propertyLookup = useMemo(() => {
    const lookup = new Map<string, Property>();
    data.properties.forEach(property => {
      lookup.set(property.id, property);
    });
    return lookup;
  }, [data.properties]);

  // Optimized property-space relationship builder
  const buildPropertySpacesMap = useCallback((
    properties: Property[], 
    spaces: Space[]
  ): Map<string, Space[]> => {
    PerformanceUtils.startOperation('buildPropertySpacesMap');
    
    const map = new Map<string, Space[]>();
    
    // Create efficient lookup
    const spacesByProperty = new Map<string, Space[]>();
    
    spaces.forEach(space => {
      const propertyId = space.propertyId || space.property?.id;
      if (propertyId) {
        if (!spacesByProperty.has(propertyId)) {
          spacesByProperty.set(propertyId, []);
        }
        spacesByProperty.get(propertyId)!.push(space);
      }
    });

    // Add to main map only if property has spaces
    properties.forEach(property => {
      const propertySpaces = spacesByProperty.get(property.id);
      if (propertySpaces && propertySpaces.length > 0) {
        map.set(property.id, propertySpaces);
      }
    });

    PerformanceUtils.endOperation('buildPropertySpacesMap');
    return map;
  }, []);

  // Initial data loading with intelligent batching
  const loadInitialData = useCallback(async () => {
    if (isInitialized.current) return;
    
    PerformanceUtils.startOperation('initialDataLoad');
    setData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Load critical data first
      const { spaces, properties, propertySpacesMap } = await apiOptimizer.preloadSpacesData();
      
      // Calculate batch information
      totalBatches.current = Math.ceil(spaces.length / PERFORMANCE_CONFIG.API.BATCH_SIZE);
      loadedBatches.current = Math.min(1, totalBatches.current);

      setData({
        spaces: spaces.slice(0, PERFORMANCE_CONFIG.API.BATCH_SIZE),
        properties,
        propertySpacesMap,
        isLoading: false,
        error: null,
        cacheTimestamp: Date.now()
      });

      isInitialized.current = true;
      PerformanceUtils.endOperation('initialDataLoad');

    } catch (error) {
      console.error('Failed to load initial data:', error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load data'
      }));
    }
  }, [buildPropertySpacesMap]);

  // Incremental batch loading for performance
  const preloadNextBatch = useCallback(async (): Promise<Space[]> => {
    if (loadedBatches.current >= totalBatches.current) {
      return [];
    }

    PerformanceUtils.startOperation('preloadNextBatch');

    try {
      const startIndex = loadedBatches.current * PERFORMANCE_CONFIG.API.BATCH_SIZE;
      const endIndex = startIndex + PERFORMANCE_CONFIG.API.BATCH_SIZE;

      // Load next batch from API or cache
      const allSpaces = await apiOptimizer.optimizedFetch<Space[]>('/api/spaces?include=property', {
        cacheKey: 'all_spaces_with_properties'
      });

      const nextBatch = allSpaces.slice(startIndex, endIndex);

      if (nextBatch.length > 0) {
        setData(prev => {
          const updatedSpaces = [...prev.spaces, ...nextBatch];
          const updatedMap = buildPropertySpacesMap(prev.properties, updatedSpaces);

          return {
            ...prev,
            spaces: updatedSpaces,
            propertySpacesMap: updatedMap
          };
        });

        loadedBatches.current++;
      }

      PerformanceUtils.endOperation('preloadNextBatch');
      return nextBatch;

    } catch (error) {
      console.error('Failed to load next batch:', error);
      return [];
    }
  }, [buildPropertySpacesMap]);

  // Auto-preloading when approaching end of current data
  useEffect(() => {
    if (data.spaces.length > 0 && 
        data.spaces.length > 0 && 
        loadedBatches.current < totalBatches.current) {
      
      const remainingSpaces = data.spaces.length - (loadedBatches.current * PERFORMANCE_CONFIG.API.BATCH_SIZE);
      
      if (remainingSpaces < PERFORMANCE_CONFIG.API.PRELOAD_THRESHOLD) {
        preloadNextBatch();
      }
    }
  }, [data.spaces.length, preloadNextBatch]);

  // Refresh data functionality
  const refreshData = useCallback(async () => {
    apiOptimizer.clearCache('spaces');
    apiOptimizer.clearCache('properties');
    isInitialized.current = false;
    loadedBatches.current = 0;
    await loadInitialData();
  }, [loadInitialData]);

  // Instant property space lookup (no API calls!)
  const getSpacesForProperty = useCallback((propertyId: string): Space[] => {
    return data.propertySpacesMap.get(propertyId) || [];
  }, [data.propertySpacesMap]);

  // Instant property lookup
  const getPropertyById = useCallback((propertyId: string): Property | undefined => {
    return propertyLookup.get(propertyId);
  }, [propertyLookup]);

  // Get cache statistics for monitoring
  const getCacheStats = useCallback(() => {
    return {
      ...apiOptimizer.getCacheStats(),
      loadedBatches: loadedBatches.current,
      totalBatches: totalBatches.current,
      loadProgress: totalBatches.current > 0 ? loadedBatches.current / totalBatches.current : 0,
      spacesLoaded: data.spaces.length,
      propertiesLoaded: data.properties.length,
      propertySpacesMapped: data.propertySpacesMap.size,
      cacheAge: Date.now() - data.cacheTimestamp
    };
  }, [data.spaces.length, data.properties.length, data.propertySpacesMap.size, data.cacheTimestamp]);

  // Initialize data loading on mount
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Performance monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      PerformanceUtils.checkMemoryUsage();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return {
    ...data,
    refreshData,
    getSpacesForProperty,
    getPropertyById,
    preloadNextBatch,
    getCacheStats
  };
};

// Additional hook for property marker optimization
export const usePropertyMarkerOptimization = (preloader: UseDataPreloaderReturn) => {
  const markerCache = useRef(new Map<string, any>());
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);

  // Instant marker click handler - no API calls!
  const handleMarkerClick = useCallback((propertyId: string) => {
    PerformanceUtils.startOperation('markerClick');
    
    // Check cache first
    if (markerCache.current.has(propertyId)) {
      const cached = markerCache.current.get(propertyId);
      setSelectedProperty(propertyId);
      PerformanceUtils.endOperation('markerClick');
      return cached.spaces;
    }

    // Get spaces instantly from preloaded data
    const spaces = preloader.getSpacesForProperty(propertyId);
    const property = preloader.getPropertyById(propertyId);

    if (spaces.length > 0) {
      const markerData = {
        property,
        spaces,
        timestamp: Date.now()
      };

      markerCache.current.set(propertyId, markerData);
      setSelectedProperty(propertyId);
    }

    PerformanceUtils.endOperation('markerClick');
    return spaces;
  }, [preloader]);

  // Clear marker selection
  const clearSelection = useCallback(() => {
    setSelectedProperty(null);
  }, []);

  // Get currently selected spaces
  const selectedSpaces = useMemo(() => {
    if (!selectedProperty) return [];
    return preloader.getSpacesForProperty(selectedProperty);
  }, [selectedProperty, preloader]);

  return {
    handleMarkerClick,
    clearSelection,
    selectedProperty,
    selectedSpaces,
    markerCacheSize: markerCache.current.size
  };
};