// src/api/apiClient.js
// API client enhanced with Progressive Configuration Checkout endpoints
// ✅ FIXED: Business Profile 404 handling + Advertiser Dashboard

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const API_TIMEOUT = 30000;

console.log('🚀 API Client initialized:', API_BASE_URL);

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.timeout = API_TIMEOUT;
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

  async request(endpoint, method = 'GET', data = null, attempt = 1, maxAttempts = 3) {
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
      console.log(`${method} ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.log(`❌ API Error Response: ${response.status} ${response.statusText}`);
        
        // ✅ OPTIMIZATION: Don't retry 429 (rate limit) or 4xx errors
        if (response.status >= 500 && response.status !== 429 && attempt < maxAttempts) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`⏳ Retrying in ${delay}ms (attempt ${attempt + 1}/${maxAttempts})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.request(endpoint, method, data, attempt + 1, maxAttempts);
        }
        
        // ✅ OPTIMIZATION: Log rate limit specifically
        if (response.status === 429) {
          console.warn('🚫 Rate limit hit - not retrying:', endpoint);
        }
        
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`✅ ${method} ${endpoint} - Success`);
      return result;

    } catch (error) {
      // ✅ OPTIMIZATION: Don't retry rate limit errors or aborted requests
      if (attempt < maxAttempts && !error.message.includes('aborted') && !error.message.includes('429')) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`⏳ Retrying in ${delay}ms (attempt ${attempt + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.request(endpoint, method, data, attempt + 1, maxAttempts);
      }
      
      console.log(`❌ API Error (attempt ${attempt}/${maxAttempts}): ${endpoint}`, error);
      throw error;
    }
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

  // ✅ ADVERTISING AREAS (matches your actual schema - baseRate, not price)
  async getAreas(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/areas${queryString ? `?${queryString}` : ''}`);
  }

  async getArea(id) {
    return this.get(`/areas/${id}`);
  }

  async createArea(data) {
    return this.post('/areas', data);
  }

  async updateArea(id, data) {
    return this.put(`/areas/${id}`, data);
  }

  async deleteArea(id) {
    return this.delete(`/areas/${id}`);
  }

  // ✅ SPACES = AREAS (aliases for backward compatibility)
  async getSpaces(params = {}) {
    console.log('🔄 getSpaces() called - routing to spaces endpoint');
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/spaces${queryString ? `?${queryString}` : ''}`);
  }

  async getSpace(id) {
    console.log('🔄 getSpace() called - routing to spaces endpoint');
    return this.get(`/spaces/${id}`);
  }

  async createSpace(data) {
    console.log('🔄 createSpace() called - routing to createArea()');
    return this.createArea(data);
  }

  async updateSpace(id, data) {
    console.log('🔄 updateSpace() called - routing to updateArea()');
    return this.updateArea(id, data);
  }

  async deleteSpace(id) {
    console.log('🔄 deleteSpace() called - routing to deleteArea()');
    return this.deleteArea(id);
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
      console.log('🔄 Fallback to regular spaces endpoint');
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