// src/api/apiClient.js
// ✅ UPDATED: Added user resolution methods for Clerk ID vs UUID mapping
// ✅ FIXED: Complete ApiClient with conversation methods properly integrated
// ✅ RATE LIMITING FIXES: Request deduplication, caching, and exponential backoff

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const API_TIMEOUT = 30000;
const CACHE_DURATION = 60000; // 1 minute cache

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
    
    // ✅ NEW: User ID resolution cache for Clerk ID vs UUID mapping
    this.userIdCache = new Map(); // Cache user ID mappings
    
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
    
    // Also clean user ID cache
    for (const [key, value] of this.userIdCache) {
      if (now - value.timestamp > CACHE_DURATION) {
        this.userIdCache.delete(key);
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
    this.userIdCache.clear();
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
      for (const [key] of this.userIdCache) {
        if (key.includes(pattern)) {
          this.userIdCache.delete(key);
        }
      }
      console.log(`💾 CACHE CLEAR: Cleared entries matching "${pattern}"`);
    } else {
      this.responseCache.clear();
      this.userIdCache.clear();
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
      rateLimited: this.rateLimitBackoff.size,
      userIdMappings: this.userIdCache.size
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

  // ✅ NEW: USER ID RESOLUTION METHODS (Fixes Clerk ID vs UUID mismatch)
  async resolveUserId(identifier) {
    console.log('🔍 Resolving user ID:', identifier);
    
    // Check cache first
    const cached = this.userIdCache.get(identifier);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      console.log(`💾 USER ID CACHE HIT: ${identifier}`);
      return cached.data;
    }
    
    try {
      const response = await this.get(`/users/resolve/${identifier}`);
      
      if (response.success) {
        // Cache the result
        this.userIdCache.set(identifier, {
          data: response.data,
          timestamp: Date.now()
        });
        
        // Also cache reverse mapping
        this.userIdCache.set(response.data.id, {
          data: response.data,
          timestamp: Date.now()
        });
        this.userIdCache.set(response.data.clerkId, {
          data: response.data,
          timestamp: Date.now()
        });
        
        console.log('✅ User ID resolved:', response.data.id, '→', response.data.clerkId);
        return response.data;
      } else {
        console.log('⚠️ User ID not found:', identifier);
        return null;
      }
    } catch (error) {
      console.error('❌ Error resolving user ID:', error);
      return null;
    }
  }

  async resolveUserIds(identifiers) {
    console.log('🔍 Resolving multiple user IDs:', identifiers.length);
    
    const resolved = new Map();
    const toResolve = [];
    
    // Check cache first
    for (const id of identifiers) {
      const cached = this.userIdCache.get(id);
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        resolved.set(id, cached.data);
      } else {
        toResolve.push(id);
      }
    }
    
    // Resolve uncached IDs
    if (toResolve.length > 0) {
      try {
        const promises = toResolve.map(id => this.resolveUserId(id));
        const results = await Promise.all(promises);
        
        results.forEach((userData, index) => {
          if (userData) {
            const originalId = toResolve[index];
            resolved.set(originalId, userData);
          }
        });
      } catch (error) {
        console.error('❌ Error resolving multiple user IDs:', error);
      }
    }
    
    console.log(`✅ Resolved ${resolved.size}/${identifiers.length} user IDs`);
    return resolved;
  }

  // ✅ ENHANCED: Check if current user owns message (handles ID mismatch)
  async isMyMessage(message, currentClerkId) {
    if (!currentClerkId || !message.senderId) return false;
    
    // Direct match
    if (message.senderId === currentClerkId) return true;
    
    // Resolve sender ID to check for match
    const senderData = await this.resolveUserId(message.senderId);
    if (senderData && senderData.clerkId === currentClerkId) return true;
    
    // Handle prefix variations
    const clerkIdWithoutPrefix = currentClerkId.replace(/^user_/, '');
    if (message.senderId === clerkIdWithoutPrefix) return true;
    
    const messageIdWithPrefix = `user_${message.senderId}`;
    if (currentClerkId === messageIdWithPrefix) return true;
    
    return false;
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

  // ✅ ENHANCED: CONVERSATIONS with user resolution 
  async getConversations(params = {}) {
    console.log('💬 Getting conversations with params:', params);
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await this.get(`/conversations${queryString ? `?${queryString}` : ''}`);
      
      if (response.success && response.data) {
        // ✅ Resolve user IDs for all participants
        const allUserIds = new Set();
        
        response.data.forEach(conv => {
          if (conv.participants) {
            conv.participants.forEach(p => {
              if (p.userId) allUserIds.add(p.userId);
              if (p.user?.id) allUserIds.add(p.user.id);
            });
          }
          if (conv.lastMessage?.senderId) {
            allUserIds.add(conv.lastMessage.senderId);
          }
        });
        
        // Resolve all user IDs at once
        const userMappings = await this.resolveUserIds(Array.from(allUserIds));
        
        // Enhance conversations with resolved user data
        const enhancedConversations = response.data.map(conv => ({
          ...conv,
          participants: conv.participants?.map(p => ({
            ...p,
            user: userMappings.get(p.userId) || userMappings.get(p.user?.id) || p.user
          })),
          lastMessage: conv.lastMessage ? {
            ...conv.lastMessage,
            sender: userMappings.get(conv.lastMessage.senderId)
          } : undefined
        }));
        
        return {
          ...response,
          data: enhancedConversations
        };
      }
      
      return response;
    } catch (error) {
      console.error('❌ Error getting conversations:', error);
      throw error;
    }
  }

  async getConversation(id) {
    console.log('💬 Getting conversation:', id);
    try {
      const response = await this.get(`/conversations/${id}`);
      
      if (response.success && response.data?.messages) {
        // ✅ Resolve user IDs for all message senders
        const senderIds = response.data.messages
          .map(msg => msg.senderId)
          .filter(Boolean);
        
        const userMappings = await this.resolveUserIds(senderIds);
        
        // Enhance messages with sender data
        const enhancedMessages = response.data.messages.map(msg => ({
          ...msg,
          sender: userMappings.get(msg.senderId)
        }));
        
        return {
          ...response,
          data: {
            ...response.data,
            messages: enhancedMessages
          }
        };
      }
      
      return response;
    } catch (error) {
      console.error('❌ Error getting conversation:', error);
      throw error;
    }
  }

  async createConversation(data) {
    console.log('💬 Creating conversation:', data);
    return this.post('/conversations/create', data);
  }

  async sendMessageToConversation(conversationId, messageData) {
    console.log('💬 Sending message to conversation:', conversationId, messageData);
    return this.post(`/conversations/${conversationId}/messages`, messageData);
  }

  async archiveConversation(conversationId, isArchived = true) {
    console.log('💬 Archiving conversation:', conversationId, isArchived);
    return this.patch(`/conversations/${conversationId}/archive`, { isArchived });
  }

  // ✅ ENHANCED MESSAGES (B2B specific message types)
  async sendPropertyInquiry(propertyData) {
    console.log('🏢 Sending property inquiry:', propertyData);
    return this.post('/messages/property-inquiry', propertyData);
  }

  async sendRFQ(rfqData) {
    console.log('📋 Sending RFQ:', rfqData);
    return this.post('/messages/rfq', rfqData);
  }

  async sendContract(contractData) {
    console.log('📄 Sending contract:', contractData);
    return this.post('/messages/contract', contractData);
  }

  async getUnreadMessagesCount() {
    console.log('📨 Getting unread messages count');
    try {
      const response = await this.get('/messages/unread/count');
      return response;
    } catch (error) {
      console.error('❌ Failed to get unread count:', error);
      return { success: true, data: { count: 0 } };
    }
  }

  async markConversationAsRead(conversationId) {
    console.log('✅ Marking conversation as read:', conversationId);
    return this.post(`/conversations/${conversationId}/mark-read`);
  }

  // ✅ USER LOOKUP (for messaging)
  async findUsersByBusinessName(searchTerm) {
    console.log('🔍 Searching users by business name:', searchTerm);
    const params = { search: searchTerm, type: 'business' };
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/users/search?${queryString}`);
  }

  async getUserByClerkId(clerkId) {
    console.log('👤 Getting user by Clerk ID:', clerkId);
    return this.get(`/users/clerk/${clerkId}`);
  }

  // ✅ PROPERTY OWNER LOOKUP (specific to messaging property owners)
  async getPropertyOwner(propertyId) {
    console.log('🏢 Getting property owner for property:', propertyId);
    try {
      const response = await this.get(`/properties/${propertyId}/owner`);
      return response;
    } catch (error) {
      console.error('❌ Failed to get property owner:', error);
      // Fallback: try to get from property data
      const property = await this.get(`/properties/${propertyId}`);
      if (property.success && property.data.ownerId) {
        const owner = await this.get(`/users/${property.data.ownerId}`);
        return owner;
      }
      throw error;
    }
  }

  async getSpaceOwner(spaceId) {
    console.log('🏢 Getting space owner for space:', spaceId);
    try {
      const space = await this.getSpace(spaceId);
      if (space.success && space.data.property?.ownerId) {
        return this.getUser(space.data.property.ownerId);
      }
      throw new Error('Space owner not found');
    } catch (error) {
      console.error('❌ Failed to get space owner:', error);
      throw error;
    }
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

  // Add these methods to your existing src/api/apiClient.js file

// ✅ NEW: Intro tutorial methods
async completeIntroTutorial() {
  console.log('🎯 Completing intro tutorial...');
  try {
    const response = await this.post('/users/complete-intro');
    
    if (response.success) {
      console.log('✅ Intro tutorial completed successfully');
      // Clear any intro-related cache
      this.clearCache('users/first-time');
      return response;
    } else {
      console.error('❌ Failed to complete intro tutorial:', response.error);
      return response;
    }
  } catch (error) {
    console.error('❌ Complete intro tutorial error:', error);
    return {
      success: false,
      error: 'Failed to complete intro tutorial'
    };
  }
}

async checkFirstTimeStatus() {
  console.log('🔍 Checking first-time login status...');
  try {
    const response = await this.get('/users/first-time-status');
    
    if (response.success) {
      console.log('✅ First-time status retrieved:', response.data.isFirstTime);
      return response;
    } else {
      console.error('❌ Failed to check first-time status:', response.error);
      return response;
    }
  } catch (error) {
    console.error('❌ Check first-time status error:', error);
    return {
      success: false,
      error: 'Failed to check first-time status',
      data: { isFirstTime: false } // Default to false to avoid blocking
    };
  }
}

// ✅ DEVELOPMENT: Reset intro status (dev environment only)
async resetIntroStatus() {
  console.log('🔄 Resetting intro status (DEV ONLY)...');
  try {
    const response = await this.post('/users/reset-intro');
    
    if (response.success) {
      console.log('✅ Intro status reset successfully');
      // Clear related cache
      this.clearCache('users/first-time');
      this.clearCache('users/profile');
      return response;
    } else {
      console.error('❌ Failed to reset intro status:', response.error);
      return response;
    }
  } catch (error) {
    console.error('❌ Reset intro status error:', error);
    return {
      success: false,
      error: 'Failed to reset intro status'
    };
  }
}

// ✅ ENHANCED: Get user profile with intro status
async getUserProfileWithIntro() {
  console.log('👤 Getting user profile with intro status...');
  try {
    const [profileResponse, introResponse] = await Promise.all([
      this.getUserProfile(),
      this.checkFirstTimeStatus()
    ]);
    
    if (profileResponse.success && introResponse.success) {
      return {
        success: true,
        data: {
          ...profileResponse.data,
          isFirstTime: introResponse.data.isFirstTime,
          lastSeenAt: introResponse.data.lastSeenAt
        }
      };
    } else {
      // Return profile data even if intro check fails
      return profileResponse;
    }
  } catch (error) {
    console.error('❌ Get user profile with intro error:', error);
    return {
      success: false,
      error: 'Failed to get user profile with intro status'
    };
  }
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



// ✅ CRITICAL: Export the instance as default - NO CODE AFTER THIS LINE
export default new ApiClient();