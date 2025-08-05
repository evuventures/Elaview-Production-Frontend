// src/services/googleMapsLoader.js
// ✅ Centralized Google Maps loader to prevent multiple script loads

class GoogleMapsLoader {
  constructor() {
    this.isLoading = false;
    this.isLoaded = false;
    this.loadPromise = null;
    this.callbacks = [];
  }

  /**
   * Load Google Maps API once and share across all components
   */
  load() {
    // If already loaded, return immediately
    if (this.isLoaded && window.google?.maps) {
      console.log('✅ Google Maps already loaded');
      return Promise.resolve(window.google.maps);
    }

    // If currently loading, return the existing promise
    if (this.isLoading && this.loadPromise) {
      console.log('⏳ Google Maps already loading, waiting...');
      return this.loadPromise;
    }

    // Start loading
    this.isLoading = true;
    this.loadPromise = new Promise((resolve, reject) => {
      try {
        // Check if Google Maps is already available
        if (window.google?.maps?.places) {
          console.log('✅ Google Maps was already available');
          this.isLoaded = true;
          this.isLoading = false;
          resolve(window.google.maps);
          return;
        }

        // Check if script tag already exists
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
          console.log('⏳ Google Maps script tag exists, waiting for load...');
          
          // Wait for Google Maps to be available
          const checkInterval = setInterval(() => {
            if (window.google?.maps?.places) {
              clearInterval(checkInterval);
              console.log('✅ Google Maps loaded from existing script');
              this.isLoaded = true;
              this.isLoading = false;
              resolve(window.google.maps);
            }
          }, 100);

          // Timeout after 10 seconds
          setTimeout(() => {
            clearInterval(checkInterval);
            if (!window.google?.maps) {
              this.isLoading = false;
              reject(new Error('Google Maps failed to load'));
            }
          }, 10000);
          return;
        }

        // Create and load the script
        console.log('📍 Loading Google Maps API...');
        const script = document.createElement('script');
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        
        if (!apiKey) {
          throw new Error('Google Maps API key not found');
        }

        // Use a unique global callback name
        const callbackName = 'initGoogleMapsGlobal';
        
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&v=beta&callback=${callbackName}`;
        script.async = true;
        script.defer = true;
        
        // Define the callback
        window[callbackName] = () => {
          console.log('✅ Google Maps API loaded successfully');
          this.isLoaded = true;
          this.isLoading = false;
          
          // Clean up
          delete window[callbackName];
          
          // Resolve the promise
          resolve(window.google.maps);
          
          // Call any waiting callbacks
          this.callbacks.forEach(cb => cb(window.google.maps));
          this.callbacks = [];
        };

        script.onerror = () => {
          console.error('❌ Failed to load Google Maps');
          this.isLoading = false;
          delete window[callbackName];
          reject(new Error('Failed to load Google Maps'));
        };

        document.head.appendChild(script);
      } catch (error) {
        console.error('❌ Error in GoogleMapsLoader:', error);
        this.isLoading = false;
        reject(error);
      }
    });

    return this.loadPromise;
  }

  /**
   * Check if Google Maps is loaded
   */
  isReady() {
    return this.isLoaded && window.google?.maps?.places;
  }

  /**
   * Wait for Google Maps to be ready
   */
  async waitForLoad() {
    if (this.isReady()) {
      return window.google.maps;
    }
    return this.load();
  }

  /**
   * Add a callback to be called when loaded
   */
  onLoad(callback) {
    if (this.isReady()) {
      callback(window.google.maps);
    } else {
      this.callbacks.push(callback);
      this.load(); // Ensure loading starts
    }
  }
}

// Export singleton instance
const googleMapsLoader = new GoogleMapsLoader();
export default googleMapsLoader;