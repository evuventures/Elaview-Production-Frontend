// src/services/locationService.js
// 🌍 Intelligent location detection with fallback chain for Elaview

// Regional defaults - prioritizing US/global markets first
const REGIONAL_CENTERS = {
  // ✅ PRIORITY: North America (primary market)
  US: { lat: 39.8283, lng: -98.5795, zoom: 4, name: 'United States' },
  CA: { lat: 56.1304, lng: -106.3468, zoom: 3, name: 'Canada' },
  MX: { lat: 23.6345, lng: -102.5528, zoom: 5, name: 'Mexico' },
  
  // Europe  
  GB: { lat: 55.3781, lng: -3.4360, zoom: 5, name: 'United Kingdom' },
  DE: { lat: 51.1657, lng: 10.4515, zoom: 6, name: 'Germany' },
  FR: { lat: 46.2276, lng: 2.2137, zoom: 6, name: 'France' },
  ES: { lat: 40.4637, lng: -3.7492, zoom: 6, name: 'Spain' },
  IT: { lat: 41.8719, lng: 12.5674, zoom: 6, name: 'Italy' },
  NL: { lat: 52.1326, lng: 5.2913, zoom: 7, name: 'Netherlands' },
  
  // Middle East
  IL: { lat: 31.7683, lng: 35.2137, zoom: 7, name: 'Israel' },
  KFAR_KAMA: { lat: 32.721105, lng: 35.442834, zoom: 12, name: 'Kfar Kama' },
  
  // Asia Pacific
  AU: { lat: -25.2744, lng: 133.7751, zoom: 4, name: 'Australia' },
  JP: { lat: 36.2048, lng: 138.2529, zoom: 5, name: 'Japan' },
  CN: { lat: 35.8617, lng: 104.1954, zoom: 4, name: 'China' },
  IN: { lat: 20.5937, lng: 78.9629, zoom: 4, name: 'India' },
  SG: { lat: 1.3521, lng: 103.8198, zoom: 11, name: 'Singapore' },
  
  // Global fallback
  GLOBAL: { lat: 39.8283, lng: -98.5795, zoom: 3, name: 'United States' }
};

// IP Geolocation Services (Free tiers)
const IP_SERVICES = {
  // Primary: IPinfo Lite (Unlimited, country-level)
  ipinfo: {
    url: (ip = '') => `https://ipinfo.io/${ip}/json`,
    parse: (data) => ({
      country: data.country,
      city: data.city,
      region: data.region,
      coordinates: data.loc ? {
        lat: parseFloat(data.loc.split(',')[0]),
        lng: parseFloat(data.loc.split(',')[1])
      } : null
    })
  },
  
  // Secondary: ipapi.co (30K/month, city-level)
  ipapi: {
    url: (ip = '') => `https://ipapi.co/${ip}/json/`,
    parse: (data) => ({
      country: data.country_code,
      city: data.city,
      region: data.region,
      coordinates: (data.latitude && data.longitude) ? {
        lat: data.latitude,
        lng: data.longitude
      } : null
    })
  }
};

class LocationService {
  constructor() {
    this.cachedLocation = null;
    this.userLocation = null;
    this.ipLocation = null;
    this.fallbackLocation = null;
    
    // ✅ API usage optimization to stay within free tiers
    this.apiUsageCount = parseInt(localStorage.getItem('elaview_api_usage') || '0');
    this.lastResetDate = localStorage.getItem('elaview_api_reset') || new Date().toDateString();
    this.maxDailyRequests = 900; // Stay safely under 1000/day limit
    
    this.resetDailyCounterIfNeeded();
  }

  /**
   * Reset API counter daily to track usage
   */
  resetDailyCounterIfNeeded() {
    const today = new Date().toDateString();
    if (this.lastResetDate !== today) {
      this.apiUsageCount = 0;
      this.lastResetDate = today;
      localStorage.setItem('elaview_api_usage', '0');
      localStorage.setItem('elaview_api_reset', today);
      console.log('🔄 API usage counter reset for new day');
    }
  }

  /**
   * Check if we can make an API request (stay within free tier)
   */
  canMakeAPIRequest() {
    return this.apiUsageCount < this.maxDailyRequests;
  }

  /**
   * Increment API usage counter
   */
  incrementAPIUsage() {
    this.apiUsageCount++;
    localStorage.setItem('elaview_api_usage', this.apiUsageCount.toString());
    console.log(`📊 API Usage: ${this.apiUsageCount}/${this.maxDailyRequests}`);
  }

  /**
   * 🎯 Main method: Get the best available location
   * Returns: { center: {lat, lng}, zoom: number, source: string, name: string }
   */
  async getBestLocation() {
    console.log('🌍 LocationService: Getting best available location...');
    
    try {
      // 1. Try user geolocation first (if permission granted)
      const userLoc = await this.getUserGeolocation();
      if (userLoc) {
        console.log('✅ Using user geolocation:', userLoc);
        return {
          center: userLoc.coordinates,
          zoom: 12, // Zoom in close for user location
          source: 'user_geolocation',
          name: 'Your Location'
        };
      }

      // 2. Try IP-based geolocation
      const ipLoc = await this.getIPLocation();
      if (ipLoc && ipLoc.coordinates) {
        console.log('✅ Using IP geolocation:', ipLoc);
        const countryCenter = REGIONAL_CENTERS[ipLoc.country];
        if (countryCenter) {
          return {
            center: countryCenter,
            zoom: countryCenter.zoom,
            source: 'ip_geolocation',
            name: countryCenter.name
          };
        }
        
        // Use IP coordinates if we have them but no country match
        return {
          center: ipLoc.coordinates,
          zoom: 8,
          source: 'ip_coordinates',
          name: ipLoc.city || ipLoc.country || 'Detected Location'
        };
      }

      // 3. Browser language fallback
      const langLoc = this.getLanguageBasedLocation();
      if (langLoc) {
        console.log('✅ Using language-based location:', langLoc);
        return langLoc;
      }

      // 4. Final fallback to US (more appropriate for global users)
      console.log('⚠️ Using US fallback location');
      return {
        center: REGIONAL_CENTERS.US,
        zoom: REGIONAL_CENTERS.US.zoom,
        source: 'us_fallback',
        name: 'United States'
      };

    } catch (error) {
      console.error('❌ LocationService error:', error);
      return {
        center: REGIONAL_CENTERS.US,
        zoom: REGIONAL_CENTERS.US.zoom,
        source: 'error_fallback',
        name: 'United States'
      };
    }
  }

  /**
   * 🎯 Try to get user's precise geolocation (with permission)
   */
  async getUserGeolocation() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.log('🚫 Geolocation not supported');
        resolve(null);
        return;
      }

      // Check if we already have cached user location
      if (this.userLocation) {
        resolve(this.userLocation);
        return;
      }

      console.log('📍 Attempting to get user geolocation...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('✅ Geolocation success:', {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
          
          const location = {
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            },
            accuracy: position.coords.accuracy
          };
          this.userLocation = location;
          resolve(location);
        },
        (error) => {
          console.log('🚫 Geolocation failed:', error.code, error.message);
          resolve(null);
        },
        {
          enableHighAccuracy: false, // Faster, less battery
          timeout: 8000, // Reduced timeout for faster fallback
          maximumAge: 300000 // Cache for 5 minutes
        }
      );
    });
  }

  /**
   * 🌐 Get location from IP address (with usage limits)
   */
  async getIPLocation() {
    // Check cache first
    if (this.ipLocation) {
      return this.ipLocation;
    }

    // ✅ Check API usage limits before making requests
    if (!this.canMakeAPIRequest()) {
      console.log('⚠️ API limit reached, using cached or fallback location');
      return null;
    }

    // Try IPinfo first (unlimited, reliable)
    try {
      console.log('🔍 Trying IPinfo for IP location...');
      const response = await fetch(IP_SERVICES.ipinfo.url(), {
        timeout: 5000
      });
      
      if (response.ok) {
        const data = await response.json();
        const location = IP_SERVICES.ipinfo.parse(data);
        console.log('✅ IPinfo response:', location);
        
        if (location.country) {
          this.ipLocation = location;
          // IPinfo is unlimited, so no usage increment needed
          return location;
        }
      }
    } catch (error) {
      console.log('⚠️ IPinfo failed:', error.message);
    }

    // Fallback to ipapi.co (with usage tracking)
    try {
      console.log('🔍 Trying ipapi.co for IP location...');
      const response = await fetch(IP_SERVICES.ipapi.url(), {
        timeout: 5000
      });
      
      if (response.ok) {
        const data = await response.json();
        const location = IP_SERVICES.ipapi.parse(data);
        console.log('✅ ipapi.co response:', location);
        
        // ✅ Track usage for paid API
        this.incrementAPIUsage();
        
        if (location.country) {
          this.ipLocation = location;
          return location;
        }
      }
    } catch (error) {
      console.log('⚠️ ipapi.co failed:', error.message);
    }

    return null;
  }

  /**
   * 🗣️ Get location based on browser language settings (US context priority)
   */
  getLanguageBasedLocation() {
    try {
      const language = navigator.language || navigator.languages?.[0];
      if (!language) return null;

      // Extract country code from language (e.g., 'en-US' -> 'US')
      const countryCode = language.split('-')[1]?.toUpperCase();
      
      if (countryCode && REGIONAL_CENTERS[countryCode]) {
        const location = REGIONAL_CENTERS[countryCode];
        console.log(`🗣️ Language-based location (${language}):`, location);
        return {
          center: location,
          zoom: location.zoom,
          source: 'browser_language',
          name: location.name
        };
      }

      // ✅ Enhanced language-based regional fallbacks (US context priority)
      const langRegionMap = {
        'en': 'US',    // English -> US
        'es': 'US',    // Spanish -> US (large Hispanic population)
        'fr': 'CA',    // French -> Canada (Quebec)
        'de': 'DE',    // German -> Germany
        'it': 'IT',    // Italian -> Italy
        'pt': 'BR',    // Portuguese -> Brazil (not in our centers, will fallback)
        'ja': 'JP',    // Japanese -> Japan
        'zh': 'CN',    // Chinese -> China
        'ko': 'KR',    // Korean -> Korea (not in our centers, will fallback)
        'ru': 'RU',    // Russian -> Russia (not in our centers, will fallback)
        'he': 'IL',    // Hebrew -> Israel
        'ar': 'IL'     // Arabic -> Israel (many Arabic speakers in Israel)
      };
      
      const langCode = language.split('-')[0];
      const regionCode = langRegionMap[langCode];
      
      if (regionCode && REGIONAL_CENTERS[regionCode]) {
        const location = REGIONAL_CENTERS[regionCode];
        console.log(`🗣️ Language region mapping (${langCode} -> ${regionCode}):`, location);
        return {
          center: location,
          zoom: location.zoom,
          source: 'language_region',
          name: location.name
        };
      }

    } catch (error) {
      console.log('⚠️ Language detection failed:', error);
    }

    return null;
  }

  /**
   * 🎯 Request user location with context (for button click)
   */
  async requestUserLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      console.log('📍 User requested geolocation...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('✅ User geolocation granted:', {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
          
          const location = {
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            },
            accuracy: position.coords.accuracy
          };
          this.userLocation = location;
          resolve(location);
        },
        (error) => {
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
          
          console.log('❌ User geolocation failed:', error.code, message);
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    });
  }

  /**
   * 🧹 Clear cached locations (for testing/refresh)
   */
  clearCache() {
    this.cachedLocation = null;
    this.userLocation = null;
    this.ipLocation = null;
    console.log('🧹 LocationService cache cleared');
  }

  /**
   * 📊 Get API usage stats (for monitoring)
   */
  getUsageStats() {
    return {
      dailyUsage: this.apiUsageCount,
      maxDaily: this.maxDailyRequests,
      remainingToday: this.maxDailyRequests - this.apiUsageCount,
      resetDate: this.lastResetDate
    };
  }
}

// Export singleton instance
export default new LocationService();