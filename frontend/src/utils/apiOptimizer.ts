// src/utils/apiOptimizer.ts
// High-performance API caching and request optimization system

interface CachedData {
  data: any;
  timestamp: number;
  expiry: number;
}

interface RequestConfig {
  signal?: AbortSignal;
  cacheKey?: string;
  cacheDuration?: number;
  retries?: number;
}

class APIOptimizer {
  private cache = new Map<string, CachedData>();
  private pendingRequests = new Map<string, Promise<any>>();
  private requestCounts = new Map<string, number[]>();
  
  // Configuration
  private readonly DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_REQUESTS_PER_MINUTE = 10;
  private readonly CLEANUP_INTERVAL = 30 * 60 * 1000; // 30 minutes

  constructor() {
    this.startCleanupInterval();
  }

  // Smart caching with automatic cleanup
  private getCacheKey(endpoint: string, params?: any): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${endpoint}${paramString}`;
  }

  // Rate limiting to prevent API overwhelm
  private canMakeRequest(endpoint: string): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    if (!this.requestCounts.has(endpoint)) {
      this.requestCounts.set(endpoint, []);
    }
    
    const requests = this.requestCounts.get(endpoint)!;
    const recentRequests = requests.filter(time => time > oneMinuteAgo);
    
    this.requestCounts.set(endpoint, recentRequests);
    
    return recentRequests.length < this.MAX_REQUESTS_PER_MINUTE;
  }

  private recordRequest(endpoint: string): void {
    const requests = this.requestCounts.get(endpoint) || [];
    requests.push(Date.now());
    this.requestCounts.set(endpoint, requests);
  }

  // Main optimized fetch method
  async optimizedFetch<T>(
    endpoint: string, 
    options: RequestConfig = {}
  ): Promise<T> {
    const { 
      signal, 
      cacheKey, 
      cacheDuration = this.DEFAULT_CACHE_DURATION,
      retries = 3 
    } = options;
    
    const fullCacheKey = cacheKey || this.getCacheKey(endpoint, options);
    
    // Check cache first
    const cached = this.cache.get(fullCacheKey);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }

    // Check for pending identical request (deduplication)
    if (this.pendingRequests.has(fullCacheKey)) {
      return this.pendingRequests.get(fullCacheKey);
    }

    // Rate limiting check
    if (!this.canMakeRequest(endpoint)) {
      throw new Error('Rate limit exceeded. Please wait before making more requests.');
    }

    // Create request promise
    const requestPromise = this.makeRequest<T>(endpoint, signal, retries);
    this.pendingRequests.set(fullCacheKey, requestPromise);

    try {
      const data = await requestPromise;
      
      // Cache successful response
      this.cache.set(fullCacheKey, {
        data,
        timestamp: Date.now(),
        expiry: Date.now() + cacheDuration
      });
      
      this.recordRequest(endpoint);
      return data;
      
    } finally {
      this.pendingRequests.delete(fullCacheKey);
    }
  }

  private async makeRequest<T>(
    endpoint: string, 
    signal?: AbortSignal,
    retries: number = 3
  ): Promise<T> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(endpoint, {
          signal,
          headers: {
            'Content-Type': 'application/json',
            'Accept-Encoding': 'gzip, deflate, br'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
        
      } catch (error) {
        if (signal?.aborted) {
          throw new Error('Request aborted');
        }
        
        if (attempt === retries) {
          throw error;
        }
        
        // Exponential backoff for retries
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
    
    throw new Error('Max retries exceeded');
  }

  // Batch API requests for efficiency
  async batchFetch<T>(requests: Array<{
    endpoint: string;
    options?: RequestConfig;
  }>): Promise<T[]> {
    const promises = requests.map(({ endpoint, options = {} }) =>
      this.optimizedFetch<T>(endpoint, options)
    );
    
    return Promise.allSettled(promises).then(results =>
      results.map(result => 
        result.status === 'fulfilled' ? result.value : null
      ).filter(Boolean)
    );
  }

  // Preload critical data
  async preloadSpacesData(): Promise<{
    spaces: any[];
    properties: any[];
    propertySpacesMap: Map<string, any[]>;
  }> {
    try {
      const [spaces, properties] = await Promise.all([
        this.optimizedFetch('/api/spaces?include=property', {
          cacheKey: 'all_spaces_with_properties',
          cacheDuration: 10 * 60 * 1000 // 10 minutes for critical data
        }),
        this.optimizedFetch('/api/properties?include=spaces', {
          cacheKey: 'all_properties_with_spaces',
          cacheDuration: 10 * 60 * 1000
        })
      ]);

      // Create optimized property-spaces mapping
      const propertySpacesMap = new Map<string, any[]>();
      
      properties.forEach(property => {
        const propertySpaces = spaces.filter(space => 
          space.propertyId === property.id || 
          space.property?.id === property.id
        );
        
        if (propertySpaces.length > 0) {
          propertySpacesMap.set(property.id, propertySpaces);
        }
      });

      return { spaces, properties, propertySpacesMap };
      
    } catch (error) {
      console.error('Failed to preload spaces data:', error);
      throw error;
    }
  }

  // Clear cache manually if needed
  clearCache(pattern?: string): void {
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

  // Get cache statistics for monitoring
  getCacheStats(): {
    size: number;
    hitRate: number;
    oldestEntry: number | null;
  } {
    const now = Date.now();
    let hits = 0;
    let total = 0;
    let oldest: number | null = null;

    this.cache.forEach(cached => {
      total++;
      if (now < cached.expiry) {
        hits++;
      }
      if (!oldest || cached.timestamp < oldest) {
        oldest = cached.timestamp;
      }
    });

    return {
      size: this.cache.size,
      hitRate: total > 0 ? hits / total : 0,
      oldestEntry: oldest
    };
  }

  // Automatic cleanup of expired cache entries
  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      
      for (const [key, cached] of this.cache.entries()) {
        if (now >= cached.expiry) {
          this.cache.delete(key);
        }
      }
      
      // Clean old request counts
      this.requestCounts.forEach((requests, endpoint) => {
        const oneHourAgo = now - 60 * 60 * 1000;
        const recentRequests = requests.filter(time => time > oneHourAgo);
        this.requestCounts.set(endpoint, recentRequests);
      });
      
    }, this.CLEANUP_INTERVAL);
  }
}

// Singleton instance for app-wide usage
export const apiOptimizer = new APIOptimizer();

// React hook for easy integration
export const useOptimizedAPI = () => {
  const abortControllerRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const makeRequest = React.useCallback(async <T>(
    endpoint: string,
    options: Omit<RequestConfig, 'signal'> = {}
  ): Promise<T> => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    return apiOptimizer.optimizedFetch<T>(endpoint, {
      ...options,
      signal: abortControllerRef.current.signal
    });
  }, []);

  const preloadData = React.useCallback(() => {
    return apiOptimizer.preloadSpacesData();
  }, []);

  return { makeRequest, preloadData, clearCache: apiOptimizer.clearCache };
};