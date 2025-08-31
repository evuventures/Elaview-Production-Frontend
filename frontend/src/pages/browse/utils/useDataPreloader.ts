// src/hooks/useDataPreloader.ts
// High-performance data preloading and caching system

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import apiClient from '@/api/apiClient';

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

// API Cache implementation
class SimpleAPICache {
  private cache = new Map();
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  get(key: string) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  set(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clear(pattern?: string) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

const apiCache = new SimpleAPICache();

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
  const isMountedRef = useRef(true);

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

    return map;
  }, []);

  // Enhanced data loading function
  const loadSpacesData = useCallback(async () => {
    try {
      // Check cache first
      const cacheKey = 'all_spaces_with_properties';
      const cachedData = apiCache.get(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }

      // Load fresh data
      const response = await apiClient.getSpaces();
      const areasData = response.success ? response.data : response;

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
          propertyName: area.property.name || area.property.title,
          propertyAddress: area.property.address,
          propertyCoords: coords,
          propertyType: area.property.propertyType,
          property: area.property,
          distance: null
        });
      });

      const properties = Array.from(propertiesMap.values());
      
      const result = {
        spaces: flattenedSpaces,
        properties: properties,
        propertySpacesMap: new Map() // Will be built below
      };

      // Cache the result
      apiCache.set(cacheKey, result);
      
      return result;

    } catch (error) {
      console.error('Failed to load spaces data:', error);
      throw error;
    }
  }, []);

  // Initial data loading with intelligent batching
  const loadInitialData = useCallback(async () => {
    if (isInitialized.current || !isMountedRef.current) return;
    
    setData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await loadSpacesData();
      
      if (!isMountedRef.current) return;

      const propertySpacesMap = buildPropertySpacesMap(result.properties, result.spaces);
      
      // Calculate batch information
      const BATCH_SIZE = 100;
      totalBatches.current = Math.ceil(result.spaces.length / BATCH_SIZE);
      loadedBatches.current = Math.min(1, totalBatches.current);

      setData({
        spaces: result.spaces.slice(0, BATCH_SIZE),
        properties: result.properties,
        propertySpacesMap,
        isLoading: false,
        error: null,
        cacheTimestamp: Date.now()
      });

      isInitialized.current = true;

    } catch (error) {
      if (isMountedRef.current) {
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load data'
        }));
      }
    }
  }, [buildPropertySpacesMap, loadSpacesData]);

  // Incremental batch loading for performance
  const preloadNextBatch = useCallback(async (): Promise<Space[]> => {
    if (loadedBatches.current >= totalBatches.current) {
      return [];
    }

    try {
      const BATCH_SIZE = 100;
      const result = await loadSpacesData();
      
      const startIndex = loadedBatches.current * BATCH_SIZE;
      const endIndex = startIndex + BATCH_SIZE;
      const nextBatch = result.spaces.slice(startIndex, endIndex);

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

      return nextBatch;

    } catch (error) {
      console.error('Failed to load next batch:', error);
      return [];
    }
  }, [buildPropertySpacesMap, loadSpacesData]);

  // Refresh data functionality
  const refreshData = useCallback(async () => {
    apiCache.clear('spaces');
    apiCache.clear('properties');
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
      ...apiCache.getStats(),
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
    isMountedRef.current = true;
    loadInitialData();
    
    return () => {
      isMountedRef.current = false;
    };
  }, [loadInitialData]);

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
    // Check cache first
    if (markerCache.current.has(propertyId)) {
      const cached = markerCache.current.get(propertyId);
      setSelectedProperty(propertyId);
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