// src/api/apiClient.js
// ✅ RATE LIMITING FIXES: Request deduplication, caching, and exponential backoff
// ✅ FIXED: Business Profile 404 handling + Advertiser Dashboard

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const API_TIMEOUT = 30000;
const CACHE_DURATION = 60000; // 1 minute cache
// const DEDUP_DURATION = 5000; // 5 second deduplication window (reserved for future use)

console.log('🚀 API Client initialized with rate limiting:', API_BASE_URL);

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.timeout = API_TIMEOUT;
    
    // ✅ RATE LIMITING: Request deduplication and caching
    this.pendingRequests = new Map(); // Prevent duplicate requests
    this.responseCache = new Map(); // Cache responses
    this.requestQueue = new Map(); // Queue similar requests
    this.rateLimitBackoff = new Map(); // Track rate limit backoff per endpoint
    
    console.log('📊 RATE LIMITING: Initialized request deduplication and caching');
    
    // ✅ RATE LIMITING: Periodic cache cleanup
    this.setupCacheCleanup();
  }

  // ✅ RATE LIMITING: Setup periodic cache cleanup
  setupCacheCleanup() {
    // Clean expired cache entries every 5 minutes
    this.cacheCleanupInterval = setInterval(() => {
      this.cleanExpiredCache();
    }, 5 * 60 * 1000);
    
    // Clean rate limit backoffs every minute
    this.backoffCleanupInterval = setInterval(() => {
      this.cleanExpiredBackoffs();
    }, 60 * 1000);
  }

  // ✅ RATE LIMITING: Clean expired cache entries
  cleanExpiredCache() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, value] of this.responseCache) {
      if (now - value.timestamp > CACHE_DURATION) {
        this.responseCache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 CACHE CLEANUP: Removed ${cleaned} expired entries`);
    }
  }

  // ✅ RATE LIMITING: Clean expired rate limit backoffs
  cleanExpiredBackoffs() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [endpoint, backoffUntil] of this.rateLimitBackoff) {
      if (now >= backoffUntil) {
        this.rateLimitBackoff.delete(endpoint);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 BACKOFF CLEANUP: Removed ${cleaned} expired backoffs`);
    }
  }

  // ✅ RATE LIMITING: Cleanup method for component unmount
  destroy() {
    if (this.cacheCleanupInterval) {
      clearInterval(this.cacheCleanupInterval);
    }
    if (this.backoffCleanupInterval) {
      clearInterval(this.backoffCleanupInterval);
    }
    this.responseCache.clear();
    this.pendingRequests.clear();
    this.rateLimitBackoff.clear();
    console.log('🧹 API CLIENT: Destroyed and cleaned up');
  }

  async getAuthToken() {
    try {
      if (window.Clerk) {
        const session = await window.Clerk.session;
        if (session) {
          const token = await session.getToken();
          console.log('✅ Got Clerk token via window.Clerk');
          return token;
        }
      }
      console.log('⚠️ No Clerk token available');
      return null;
    } catch (error) {
      console.error('❌ Error getting auth token:', error);
      return null;
    }
  }

  // ✅ RATE LIMITING: Generate cache key for request deduplication
  getCacheKey(endpoint, method, data) {
    return `${method}:${endpoint}:${data ? JSON.stringify(data) : ''}`;
  }

  // ✅ RATE LIMITING: Check if endpoint is under rate limit backoff
  isRateLimited(endpoint) {
    const backoffUntil = this.rateLimitBackoff.get(endpoint);
    if (backoffUntil && Date.now() < backoffUntil) {
      const remainingMs = backoffUntil - Date.now();
      console.log(`🚫 RATE LIMIT: ${endpoint} backed off for ${remainingMs}ms`);
      return true;
    }
    return false;
  }

  // ✅ RATE LIMITING: Set backoff for rate limited endpoint
  setRateLimitBackoff(endpoint, retryAfter = 60) {
    const backoffMs = retryAfter * 1000 + Math.random() * 5000; // Add jitter
    const backoffUntil = Date.now() + backoffMs;
    this.rateLimitBackoff.set(endpoint, backoffUntil);
    console.log(`🚫 RATE LIMIT: ${endpoint} backed off until ${new Date(backoffUntil).toISOString()}`);
  }

  async request(endpoint, method = 'GET', data = null, attempt = 1, maxAttempts = 3) {
    const timestamp = Date.now();
    const cacheKey = this.getCacheKey(endpoint, method, data);
    
    // ✅ RATE LIMITING: Check rate limit backoff first
    if (this.isRateLimited(endpoint)) {
      throw new Error(`Rate limited: ${endpoint} is under backoff`);
    }

    // ✅ RATE LIMITING: Check cache for GET requests
    if (method === 'GET') {
      const cached = this.responseCache.get(cacheKey);
      if (cached && (timestamp - cached.timestamp) < CACHE_DURATION) {
        console.log(`💾 CACHE HIT: ${endpoint} (${timestamp - cached.timestamp}ms old)`);
        return cached.data;
      }
    }

    // ✅ RATE LIMITING: Check for pending identical request
    if (this.pendingRequests.has(cacheKey)) {
      console.log(`🔄 REQUEST DEDUP: Waiting for pending ${method} ${endpoint}`);
      return this.pendingRequests.get(cacheKey);
    }

    // ✅ RATE LIMITING: Create and track pending request
    const requestPromise = this._executeRequest(endpoint, method, data, attempt, maxAttempts, timestamp);
    this.pendingRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      
      // ✅ RATE LIMITING: Cache successful GET responses
      if (method === 'GET' && result) {
        this.responseCache.set(cacheKey, {
          data: result,
          timestamp: timestamp
        });
        console.log(`💾 CACHE SET: ${endpoint}`);
      }
      
      return result;
    } finally {
      // ✅ RATE LIMITING: Clean up pending request
      this.pendingRequests.delete(cacheKey);
    }
  }

  async _executeRequest(endpoint, method, data, attempt, maxAttempts, startTime) {
    const url = `${this.baseURL}${endpoint}`;
    const token = await this.getAuthToken();
    
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      ...(data && { body: JSON.stringify(data) })
    };

    try {
      const duration = Date.now() - startTime;
      console.log(`📡 API REQUEST [${attempt}/${maxAttempts}]: ${method} ${endpoint} (+${duration}ms)`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const responseDuration = Date.now() - startTime;
        console.log(`❌ API ERROR [${response.status}]: ${endpoint} (+${responseDuration}ms)`);
        
        // ✅ RATE LIMITING: Handle 429 with exponential backoff
        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('Retry-After')) || 60;
          this.setRateLimitBackoff(endpoint, retryAfter);
          throw new Error(`Rate limited: ${response.status}`);
        }
        
        // ✅ OPTIMIZATION: Don't retry 4xx errors except 429
        if (response.status >= 500 && attempt < maxAttempts) {
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000; // Add jitter
          console.log(`⏳ RETRY: ${endpoint} in ${delay}ms (attempt ${attempt + 1}/${maxAttempts})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this._executeRequest(endpoint, method, data, attempt + 1, maxAttempts, startTime);
        }
        
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const successDuration = Date.now() - startTime;
      console.log(`✅ API SUCCESS: ${method} ${endpoint} (+${successDuration}ms)`);
      return result;

    } catch (error) {
      // ✅ OPTIMIZATION: Smart retry logic
      if (attempt < maxAttempts && 
          !error.message.includes('aborted') && 
          !error.message.includes('429') &&
          !error.message.includes('Rate limited')) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        const errorDuration = Date.now() - startTime;
        console.log(`⏳ RETRY: ${endpoint} in ${delay}ms (+${errorDuration}ms, attempt ${attempt + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this._executeRequest(endpoint, method, data, attempt + 1, maxAttempts, startTime);
      }
      
      const errorDuration = Date.now() - startTime;
      console.log(`❌ API FAILED: ${endpoint} (+${errorDuration}ms, attempt ${attempt}/${maxAttempts})`, error.message);
      throw error;
    }
  }

  // ✅ RATE LIMITING: Cache management methods
  clearCache(pattern = null) {
    if (pattern) {
      for (const [key] of this.responseCache) {
        if (key.includes(pattern)) {
          this.responseCache.delete(key);
        }
      }
      console.log(`💾 CACHE CLEAR: Cleared entries matching "${pattern}"`);
    } else {
      this.responseCache.clear();
      console.log('💾 CACHE CLEAR: All cache cleared');
    }
  }

  getCacheStats() {
    const now = Date.now();
    let valid = 0, expired = 0;
    
    for (const [, value] of this.responseCache) {
      if (now - value.timestamp < CACHE_DURATION) {
        valid++;
      } else {
        expired++;
      }
    }
    
    return {
      total: this.responseCache.size,
      valid,
      expired,
      pending: this.pendingRequests.size,
      rateLimited: this.rateLimitBackoff.size
    };
  }

  // ✅ CORE ENDPOINTS
  async get(endpoint) {
    return this.request(endpoint, 'GET');
  }

  async post(endpoint, data) {
    return this.request(endpoint, 'POST', data);
  }

  async put(endpoint, data) {
    return this.request(endpoint, 'PUT', data);
  }

  async patch(endpoint, data) {
    return this.request(endpoint, 'PATCH', data);
  }

  async delete(endpoint) {
    return this.request(endpoint, 'DELETE');
  }

  // ✅ HEALTH CHECK
  async healthCheck() {
    return this.get('/health');
  }

  // ✅ USERS (matches your actual schema)
  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/users${queryString ? `?${queryString}` : ''}`);
  }

  async getUser(id) {
    return this.get(`/users/${id}`);
  }

  async getUserProfile() {
    return this.get('/users/profile');
  }

  async updateUser(id, data) {
    return this.put(`/users/${id}`, data);
  }

  async deleteUser(id) {
    return this.delete(`/users/${id}`);
  }

  // ✅ FIXED: BUSINESS PROFILE MANAGEMENT (404 handling fixed)
  async getUserBusinessProfile() {
    console.log('🏢 Fetching user business profile...');
    try {
      // Make the request, but handle 404s gracefully
      const response = await fetch(`${this.baseURL}/users/business-profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(await this.getAuthToken() && { 'Authorization': `Bearer ${await this.getAuthToken()}` })
        }
      });

      console.log(`📡 Business profile response: ${response.status}`);

      // Handle 404 specifically - this is expected for new users
      if (response.status === 404) {
        console.log('ℹ️ No business profile found (expected for new users)');
        return {
          success: false,
          error: 'Business profile not found',
          needsProfile: true  // Flag to indicate user needs to create profile
        };
      }

      // Handle other non-200 responses as errors
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        console.log('✅ Business profile retrieved:', result.data);
        return {
          success: true,
          data: result.data
        };
      } else {
        console.log('ℹ️ Business profile response indicates no profile');
        return {
          success: false,
          error: 'Business profile not found',
          needsProfile: true
        };
      }
    } catch (error) {
      console.error('❌ Get business profile error:', error);
      return {
        success: false,
        error: 'Failed to get business profile',
        networkError: true
      };
    }
  }

  async updateBusinessProfile(profileData) {
    console.log('🏢 Updating business profile:', profileData);
    try {
      // Validate required fields before sending
      const requiredFields = ['businessName', 'businessIndustry'];
      for (const field of requiredFields) {
        if (!profileData[field]) {
          return {
            success: false,
            error: `Missing required field: ${field}`
          };
        }
      }
      
      const response = await this.put('/users/business-profile', profileData);
      
      if (response.success) {
        console.log('✅ Business profile updated successfully');
        return {
          success: true,
          data: response.data
        };
      } else {
        console.error('❌ Business profile update failed:', response.error);
        return {
          success: false,
          error: response.error || 'Failed to update business profile'
        };
      }
    } catch (error) {
      console.error('❌ Update business profile error:', error);
      return {
        success: false,
        error: 'Failed to update business profile'
      };
    }
  }

  async checkBusinessProfileStatus() {
    console.log('📋 Checking business profile status...');
    try {
      const response = await this.get('/users/business-profile/status');
      
      return {
        success: true,
        data: {
          isComplete: response.data?.isComplete || false,
          missingFields: response.data?.missingFields || [],
          completionPercentage: response.data?.completionPercentage || 0
        }
      };
    } catch (error) {
      console.error('❌ Check business profile status error:', error);
      return {
        success: false,
        error: 'Failed to check business profile status'
      };
    }
  }

  // ✅ PROPERTIES (matches your actual schema)
  async getProperties(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/properties${queryString ? `?${queryString}` : ''}`);
  }

  async getProperty(id) {
    return this.get(`/properties/${id}`);
  }

  async createProperty(data) {
    return this.post('/properties', data);
  }

  async updateProperty(id, data) {
    return this.put(`/properties/${id}`, data);
  }

  async deleteProperty(id) {
    return this.delete(`/properties/${id}`);
  }

  // ✅ ADVERTISING AREAS - NOW DEPRECATED, USE SPACES INSTEAD
  // These methods are kept for backward compatibility but route to spaces
  async getAreas(params = {}) {
    console.log('⚠️ getAreas() is deprecated - use getSpaces() instead');
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/spaces${queryString ? `?${queryString}` : ''}`);
  }

  async getArea(id) {
    console.log('⚠️ getArea() is deprecated - use getSpace() instead');
    return this.get(`/spaces/${id}`);
  }

  async createArea(data) {
    console.log('⚠️ createArea() is deprecated - use createSpace() instead');
    return this.post('/spaces', data);
  }

  async updateArea(id, data) {
    console.log('⚠️ updateArea() is deprecated - use updateSpace() instead');
    return this.put(`/spaces/${id}`, data);
  }

  async deleteArea(id) {
    console.log('⚠️ deleteArea() is deprecated - use deleteSpace() instead');
    return this.delete(`/spaces/${id}`);
  }

  // ✅ SPACES (Unified API for all advertising spaces)
  async getSpaces(params = {}) {
    console.log('🏢 Getting spaces with params:', params);
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/spaces${queryString ? `?${queryString}` : ''}`);
  }

  async getSpace(id) {
    console.log('🏢 Getting space:', id);
    return this.get(`/spaces/${id}`);
  }

  async createSpace(data) {
    console.log('🏢 Creating space:', data);
    return this.post('/spaces', data);
  }

  async updateSpace(id, data) {
    console.log('🏢 Updating space:', id, data);
    return this.put(`/spaces/${id}`, data);
  }

  async deleteSpace(id) {
    console.log('🏢 Deleting space:', id);
    return this.delete(`/spaces/${id}`);
  }

  // ✅ SPACE AVAILABILITY CHECKING (Progressive Configuration)
  async checkSpaceAvailability(spaceId, startDate, endDate) {
    console.log('📅 Checking availability for space:', spaceId, 'from', startDate, 'to', endDate);
    return this.get(`/spaces/${spaceId}/availability?start=${startDate}&end=${endDate}`);
  }

  async getSpaceBookedDates(spaceId, monthYear) {
    console.log('📅 Getting booked dates for space:', spaceId, 'for month:', monthYear);
    return this.get(`/spaces/${spaceId}/booked-dates?month=${monthYear}`);
  }

  // ✅ CAMPAIGNS (matches your actual schema)
  async getCampaigns(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/campaigns${queryString ? `?${queryString}` : ''}`);
  }

  async getCampaign(id) {
    return this.get(`/campaigns/${id}`);
  }

  async createCampaign(data) {
    return this.post('/campaigns', data);
  }

  async updateCampaign(id, data) {
    return this.put(`/campaigns/${id}`, data);
  }

  async deleteCampaign(id) {
    return this.delete(`/campaigns/${id}`);
  }

  // ✅ BOOKINGS (matches your actual schema - bookerId, totalAmount)
  async getBookings(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/bookings${queryString ? `?${queryString}` : ''}`);
  }

  async getBooking(id) {
    return this.get(`/bookings/${id}`);
  }

  async createBooking(data) {
    return this.post('/bookings', data);
  }

  async updateBooking(id, data) {
    return this.put(`/bookings/${id}`, data);
  }

  async deleteBooking(id) {
    return this.delete(`/bookings/${id}`);
  }

  // ✅ PROGRESSIVE CONFIGURATION CHECKOUT ENDPOINTS
  
  // Stripe Payment Processing
  async createPaymentIntent(paymentData) {
    console.log('💳 Creating Stripe payment intent:', paymentData);
    return this.post('/checkout/create-payment-intent', paymentData);
  }

  async confirmBooking(paymentIntentId, orderData, businessProfile) {
    console.log('📋 Confirming booking after payment:', paymentIntentId);
    return this.post('/checkout/confirm-booking', {
      paymentIntentId,
      orderData,
      businessProfile
    });
  }

  async getPaymentStatus(paymentIntentId) {
    console.log('🔍 Checking payment status:', paymentIntentId);
    return this.get(`/checkout/payment-status/${paymentIntentId}`);
  }

  // Multi-Booking Creation (Progressive Configuration)
  async createMultipleBookings(bookingsData) {
    console.log('📋 Creating multiple bookings from cart:', bookingsData);
    return this.post('/checkout/create-multi-bookings', bookingsData);
  }

  // ✅ MESSAGES (matches your actual schema - recipientId, conversationId)
  async getMessages(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/messages${queryString ? `?${queryString}` : ''}`);
  }

  async getMessage(id) {
    return this.get(`/messages/${id}`);
  }

  async createMessage(data) {
    return this.post('/messages', data);
  }

  async updateMessage(id, data) {
    return this.put(`/messages/${id}`, data);
  }

  async deleteMessage(id) {
    return this.delete(`/messages/${id}`);
  }

  // ✅ INVOICES (matches your actual schema - with Stripe integration)
  async getInvoices(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/invoices${queryString ? `?${queryString}` : ''}`);
  }

  async getInvoice(id) {
    return this.get(`/invoices/${id}`);
  }

  async createInvoice(data) {
    return this.post('/invoices', data);
  }

  async updateInvoice(id, data) {
    return this.put(`/invoices/${id}`, data);
  }

  async deleteInvoice(id) {
    return this.delete(`/invoices/${id}`);
  }

  // ✅ DASHBOARD METHODS - FIXED FOR YOUR ACTUAL BACKEND
  async getSpaceOwnerDashboard() {
    console.log('📊 Fetching space owner dashboard...');
    try {
      const response = await this.get('/dashboard/space-owner');
      if (response.success) {
        console.log('✅ Space owner dashboard data received:', response.data);
        return response;
      } else {
        console.error('❌ Space owner dashboard fetch failed:', response.error);
        return response;
      }
    } catch (error) {
      console.error('❌ Space owner dashboard error:', error);
      return {
        success: false,
        error: 'Failed to fetch space owner dashboard data',
        data: {
          stats: {
            totalRevenue: 0,
            activeListings: 0,
            pendingInstalls: 0,
            completedBookings: 0
          },
          bookings: [],
          listings: [],
          installations: []
        }
      };
    }
  }

  // ✅ FIXED: ADVERTISER DASHBOARD METHOD  
  async getAdvertiserDashboard() {
    console.log('📊 Fetching advertiser dashboard...');
    try {
      const response = await this.get('/dashboard/advertiser');
      if (response.success) {
        console.log('✅ Advertiser dashboard data received:', response.data);
        console.log(`📊 Stats: $${response.data.stats.totalSpent} spent, ${response.data.stats.activeCampaigns} active campaigns, ${response.data.bookings.length} total bookings`);
        return response;
      } else {
        console.error('❌ Advertiser dashboard fetch failed:', response.error);
        return response;
      }
    } catch (error) {
      console.error('❌ Advertiser dashboard error:', error);
      return {
        success: false,
        error: 'Failed to fetch advertiser dashboard data',
        data: {
          stats: {
            totalSpent: 0,
            activeCampaigns: 0,
            pendingMaterials: 0,
            completedCampaigns: 0
          },
          bookings: [],
          totalBookings: 0,
          lastUpdated: new Date().toISOString()
        }
      };
    }
  }

  // ✅ MATERIALS & SEARCH METHODS
  async getMaterialsCatalog(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    console.log('📦 Fetching materials catalog...');
    try {
      const response = await this.get(`/materials/catalog${queryString ? `?${queryString}` : ''}`);
      return response;
    } catch (error) {
      console.error('❌ Materials catalog error:', error);
      // Return mock data for development
      return {
        success: true,
        data: {
          materials: [
            {
              id: 'vinyl-1',
              name: 'Premium Vinyl Graphics',
              category: 'VINYL_GRAPHICS',
              basePrice: 15.99,
              unit: 'sq_ft',
              description: 'High-quality weather-resistant vinyl',
              compatibility: ['STOREFRONT_WINDOW', 'EXTERIOR_WALL_SMOOTH']
            }
          ]
        }
      };
    }
  }

  async searchAvailableSpaces(filters = {}) {
    const queryString = new URLSearchParams(filters).toString();
    console.log('🔍 Searching available spaces with filters:', filters);
    try {
      const response = await this.get(`/spaces/search${queryString ? `?${queryString}` : ''}`);
      return response;
    } catch (error) {
      // Fallback to regular spaces endpoint
      console.log('🔄 Fallback to regular spaces endpoint:', error.message);
      return this.getSpaces(filters);
    }
  }

  async createBookingWithMaterials(bookingData) {
    console.log('📋 Creating booking with materials:', bookingData);
    return this.post('/bookings/with-materials', bookingData);
  }

  // ✅ NOTIFICATIONS 
  async getNotifications(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    try {
      return this.get(`/notifications${queryString ? `?${queryString}` : ''}`);
    } catch (error) {
      console.error('❌ Notifications error:', error);
      return {
        success: true,
        data: { notifications: [] }
      };
    }
  }

  async getUnreadNotifications() {
    return this.get('/notifications/unread');
  }

  async getNotificationCount() {
    return this.get('/notifications/count');
  }

  async markNotificationAsRead(id) {
    return this.patch(`/notifications/${id}/read`);
  }

  async markAllNotificationsAsRead() {
    return this.patch('/notifications/mark-all-read');
  }

  async createNotification(data) {
    return this.post('/notifications', data);
  }

  // ✅ SEARCH
  async search(query, type = 'all') {
    const params = { q: query, type };
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/search?${queryString}`);
  }

  // ✅ FILE UPLOAD
  async uploadFile(file, type = 'general') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const token = await this.getAuthToken();
    const response = await fetch(`${this.baseURL}/upload`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    return response.json();
  }
}

// ✅ CRITICAL: Export the instance as default
export default new ApiClient();