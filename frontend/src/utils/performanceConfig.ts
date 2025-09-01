// src/utils/performanceConfig.ts
// Optimized performance configuration for maximum efficiency
import React from 'react';

export const PERFORMANCE_CONFIG = {
  // API & Data Management
  API: {
    CACHE_DURATION: 5 * 60 * 1000,           // 5 minutes
    CRITICAL_DATA_CACHE: 10 * 60 * 1000,     // 10 minutes for spaces/properties
    MAX_REQUESTS_PER_MINUTE: 10,              // Prevent API overwhelm
    REQUEST_TIMEOUT: 15000,                   // 15 second timeout
    MAX_RETRIES: 3,                           // Retry failed requests
    BATCH_SIZE: 100,                          // Load data in batches
    PRELOAD_THRESHOLD: 50,                    // Preload when < 50 items left
  },

  // Map Performance - SIGNIFICANTLY INCREASED DEBOUNCING
  MAP: {
    MOVE_DEBOUNCE: 3000,                      // 3 seconds (was 1500ms)
    BOUNDS_CHANGE_DEBOUNCE: 2500,             // 2.5 seconds  
    ZOOM_DEBOUNCE: 1500,                      // 1.5 seconds
    MIN_ZOOM_FOR_FILTERING: 8,                // Skip filtering when zoomed out
    MAX_MARKERS_ON_MAP: 150,                  // Reduce from 200 to 150
    MARKER_CLICK_DEBOUNCE: 300,               // Prevent rapid marker clicks
    UPDATE_THRESHOLD: 0.02,                   // Larger threshold for map changes
    BOUNDS_PADDING_KM: 25,                    // Reduced search padding
  },

  // UI Responsiveness
  UI: {
    FILTER_DEBOUNCE: 400,                     // Debounce filter changes
    SEARCH_DEBOUNCE: 600,                     // Debounce search input
    SCROLL_THROTTLE: 32,                      // ~30fps scroll handling
    ANIMATION_DURATION: 200,                  // Faster animations
    PAGE_SIZE: 24,                            // Items per page
    VIRTUAL_SCROLL_BUFFER: 5,                 // Extra items to render
    LAZY_LOAD_MARGIN: '100px',               // Larger lazy load margin
  },

  // Memory Management
  MEMORY: {
    MAX_CACHED_IMAGES: 50,                    // Limit image cache
    MAX_VISIBLE_SPACES: 150,                  // Hard limit for DOM elements
    CLEANUP_INTERVAL: 30 * 60 * 1000,        // 30 minutes
    GC_THRESHOLD: 100,                        // Trigger cleanup after N operations
    MAX_HISTORY_STATES: 10,                   // Limit browser history states
  },

  // Image Optimization
  IMAGES: {
    LOAD_TIMEOUT: 8000,                       // 8 second timeout
    QUALITY: 75,                              // Reduced quality for faster loading
    MAX_WIDTH: 600,                           // Max image width
    WEBP_SUPPORT: true,                       // Use WebP when available
    LAZY_LOADING: true,                       // Enable lazy loading
    INTERSECTION_THRESHOLD: 0.1,              // Load when 10% visible
    PRELOAD_PRIORITY_COUNT: 6,                // Preload first 6 images
  },

  // Performance Monitoring
  MONITORING: {
    ENABLE_PERFORMANCE_LOGS: false,           // Disable in production
    LOG_SLOW_OPERATIONS: true,                // Log operations > threshold
    SLOW_OPERATION_THRESHOLD: 100,            // 100ms threshold
    TRACK_MEMORY_USAGE: true,                 // Monitor memory usage
    ALERT_MEMORY_THRESHOLD: 100 * 1024 * 1024, // 100MB
  }
};

// Performance utilities
export class PerformanceUtils {
  private static operationCounts = new Map<string, number>();
  private static performanceMarks = new Map<string, number>();

  // Throttle function calls
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout | null = null;
    let lastExecTime = 0;

    return (...args: Parameters<T>) => {
      const currentTime = Date.now();

      if (currentTime - lastExecTime > delay) {
        func(...args);
        lastExecTime = currentTime;
      } else {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
          func(...args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  }

  // Debounce function calls
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }

  // Smart batching for state updates
  static batchStateUpdates<T>(
    updates: Array<() => void>,
    delay: number = 16
  ): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        updates.forEach(update => update());
        resolve();
      }, delay);
    });
  }

  // Performance tracking
  static startOperation(operationName: string): void {
    if (PERFORMANCE_CONFIG.MONITORING.ENABLE_PERFORMANCE_LOGS) {
      this.performanceMarks.set(operationName, performance.now());
    }
  }

  static endOperation(operationName: string): number {
    if (!PERFORMANCE_CONFIG.MONITORING.ENABLE_PERFORMANCE_LOGS) {
      return 0;
    }

    const startTime = this.performanceMarks.get(operationName);
    if (!startTime) return 0;

    const duration = performance.now() - startTime;
    this.performanceMarks.delete(operationName);

    // Log slow operations
    if (PERFORMANCE_CONFIG.MONITORING.LOG_SLOW_OPERATIONS && 
        duration > PERFORMANCE_CONFIG.MONITORING.SLOW_OPERATION_THRESHOLD) {
      console.warn(`Slow operation detected: ${operationName} took ${duration.toFixed(2)}ms`);
    }

    // Track operation counts
    const count = this.operationCounts.get(operationName) || 0;
    this.operationCounts.set(operationName, count + 1);

    return duration;
  }

  // Memory usage monitoring
  static checkMemoryUsage(): void {
    if (!PERFORMANCE_CONFIG.MONITORING.TRACK_MEMORY_USAGE) return;

    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      
      if (memoryInfo.usedJSHeapSize > PERFORMANCE_CONFIG.MONITORING.ALERT_MEMORY_THRESHOLD) {
        console.warn(`High memory usage detected: ${Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024)}MB`);
      }
    }
  }

  // Get performance statistics
  static getPerformanceStats(): {
    operationCounts: Map<string, number>;
    activeMarks: number;
  } {
    return {
      operationCounts: new Map(this.operationCounts),
      activeMarks: this.performanceMarks.size
    };
  }

  // Reset performance tracking
  static resetTracking(): void {
    this.operationCounts.clear();
    this.performanceMarks.clear();
  }
}

// React hooks for performance optimization
export const usePerformanceOptimization = () => {
  const [isLowMemory, setIsLowMemory] = React.useState(false);

  React.useEffect(() => {
    const checkMemory = () => {
      PerformanceUtils.checkMemoryUsage();
      
      // Simple memory pressure detection
      if ('memory' in performance) {
        const memoryInfo = (performance as any).memory;
        const memoryPressure = memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit;
        setIsLowMemory(memoryPressure > 0.8);
      }
    };

    const interval = setInterval(checkMemory, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const debouncedFn = React.useCallback(
    (fn: (...args: any[]) => any, delay: number = PERFORMANCE_CONFIG.UI.FILTER_DEBOUNCE) =>
      PerformanceUtils.debounce(fn, delay),
    []
  );

  const throttledFn = React.useCallback(
    (fn: (...args: any[]) => any, delay: number = PERFORMANCE_CONFIG.UI.SCROLL_THROTTLE) =>
      PerformanceUtils.throttle(fn, delay),
    []
  );

  return {
    isLowMemory,
    debounce: debouncedFn,
    throttle: throttledFn,
    startOperation: PerformanceUtils.startOperation,
    endOperation: PerformanceUtils.endOperation
  };
};

// Export configuration sections for easy access
export const API_CONFIG = PERFORMANCE_CONFIG.API;
export const MAP_CONFIG = PERFORMANCE_CONFIG.MAP;
export const UI_CONFIG = PERFORMANCE_CONFIG.UI;
export const MEMORY_CONFIG = PERFORMANCE_CONFIG.MEMORY;
export const IMAGE_CONFIG = PERFORMANCE_CONFIG.IMAGES;