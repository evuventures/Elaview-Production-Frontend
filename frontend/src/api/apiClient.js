// src/api/apiClient.js
// API client for your Express backend with Material Sourcing MVP endpoints
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://elaview-backend.up.railway.app/api';

// ✅ PUBLIC ENDPOINTS - These don't require authentication
const PUBLIC_ENDPOINTS = [
  '/spaces',
  '/areas',
  '/spaces/search',
  '/materials/catalog', // Public material catalog
  // Add other public endpoints here
];

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // ✅ CHECK if endpoint is public
  isPublicEndpoint(endpoint) {
    return PUBLIC_ENDPOINTS.some(publicEndpoint => {
      // Handle exact matches and parameter routes
      if (endpoint === publicEndpoint) return true;
      // Handle GET /spaces with query params
      if (publicEndpoint === '/spaces' && endpoint.startsWith('/spaces?')) return true;
      if (publicEndpoint === '/materials/catalog' && endpoint.startsWith('/materials/catalog')) return true;
      return false;
    });
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // ✅ ONLY add auth token for protected endpoints
    const isPublic = this.isPublicEndpoint(endpoint);
    if (!isPublic) {
      // Only get auth token for protected routes
      const token = await this.getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else if (!isPublic) {
        // For protected routes without token, still try the request
        console.warn(`⚠️ No auth token for protected endpoint: ${endpoint}`);
      }
    } else {
      console.log(`🌍 Public endpoint: ${endpoint} - no auth required`);
    }

    try {
      const method = config.method || 'GET';
      console.log(`API Request: ${method} ${url}${isPublic ? ' (PUBLIC)' : ' (PROTECTED)'}`);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        console.error(`❌ API Error Response:`, response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ API Response: ${endpoint}`, data);
      return data;
    } catch (error) {
      console.error(`❌ API Error: ${endpoint}`, error);
      throw error;
    }
  }

  async getAuthToken() {
    // Get Clerk token for authenticated requests
    try {
      // Wait for Clerk to be ready
      if (!window.Clerk) {
        console.warn('🔄 Clerk not loaded yet, waiting...');
        // Wait a bit for Clerk to load
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Method 1: Try window.Clerk (most reliable)
      if (window.Clerk && window.Clerk.session) {
        const token = await window.Clerk.session.getToken();
        if (token) {
          console.log('✅ Got Clerk token via window.Clerk');
          return token;
        }
      }

      // Method 2: Check if user is signed out
      if (window.Clerk && !window.Clerk.user) {
        console.warn('⚠️ User not signed in to Clerk');
        return null;
      }

      console.warn('⚠️ No Clerk token available - user might not be signed in');
      return null;
    } catch (error) {
      console.warn('❌ Error getting auth token:', error);
      return null;
    }
  }

  // HTTP methods
  async get(endpoint) {
    return this.request(endpoint);
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // ========================================
  // MATERIAL SOURCING MVP ENDPOINTS
  // ========================================

  // 🏢 SPACE OWNER DASHBOARD ENDPOINTS
  async getSpaceOwnerDashboard() {
    try {
      console.log('📊 Fetching Space Owner Dashboard data...');
      const response = await this.get('/dashboard/space-owner');
      if (!response.success) {
        console.error('❌ Space Owner Dashboard fetch failed:', response.error);
        throw new Error(response.error || 'Failed to fetch dashboard data');
      }
      return response;
    } catch (error) {
      console.error('❌ Space Owner Dashboard error:', error);
      throw error;
    }
  }

  async getSpaceOwnerStats() {
    try {
      console.log('📈 Fetching Space Owner stats...');
      const response = await this.get('/dashboard/space-owner/stats');
      return response;
    } catch (error) {
      console.error('❌ Space Owner stats error:', error);
      throw error;
    }
  }

  async getSpaceOwnerBookings() {
    try {
      console.log('📋 Fetching Space Owner bookings...');
      const response = await this.get('/dashboard/space-owner/bookings');
      return response;
    } catch (error) {
      console.error('❌ Space Owner bookings error:', error);
      throw error;
    }
  }

  async getSpaceOwnerListings() {
    try {
      console.log('🏠 Fetching Space Owner listings...');
      const response = await this.get('/dashboard/space-owner/listings');
      return response;
    } catch (error) {
      console.error('❌ Space Owner listings error:', error);
      throw error;
    }
  }

  async getSpaceOwnerInstallations() {
    try {
      console.log('🔧 Fetching Space Owner installations...');
      const response = await this.get('/dashboard/space-owner/installations');
      return response;
    } catch (error) {
      console.error('❌ Space Owner installations error:', error);
      throw error;
    }
  }

  // 💼 ADVERTISER DASHBOARD ENDPOINTS
  async getAdvertiserDashboard() {
    try {
      console.log('📊 Fetching Advertiser Dashboard data...');
      const response = await this.get('/dashboard/advertiser');
      if (!response.success) {
        console.error('❌ Advertiser Dashboard fetch failed:', response.error);
        throw new Error(response.error || 'Failed to fetch dashboard data');
      }
      return response;
    } catch (error) {
      console.error('❌ Advertiser Dashboard error:', error);
      throw error;
    }
  }

  async getAdvertiserStats() {
    try {
      console.log('📈 Fetching Advertiser stats...');
      const response = await this.get('/dashboard/advertiser/stats');
      return response;
    } catch (error) {
      console.error('❌ Advertiser stats error:', error);
      throw error;
    }
  }

  async getAdvertiserBookings() {
    try {
      console.log('📋 Fetching Advertiser bookings...');
      const response = await this.get('/dashboard/advertiser/bookings');
      return response;
    } catch (error) {
      console.error('❌ Advertiser bookings error:', error);
      throw error;
    }
  }

  async searchAvailableSpaces(params = {}) {
    try {
      console.log('🔍 Searching available spaces...', params);
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `/spaces/available?${queryString}` : '/spaces/available';
      const response = await this.get(endpoint);
      return response;
    } catch (error) {
      console.error('❌ Search spaces error:', error);
      throw error;
    }
  }

  // 📦 MATERIAL ENDPOINTS
  async getMaterialsCatalog(filters = {}) {
    try {
      console.log('📦 Fetching materials catalog...', filters);
      const queryString = new URLSearchParams(filters).toString();
      const endpoint = queryString ? `/materials/catalog?${queryString}` : '/materials/catalog';
      const response = await this.get(endpoint);
      return response;
    } catch (error) {
      console.error('❌ Materials catalog error:', error);
      throw error;
    }
  }

  async getMaterialItem(materialId) {
    try {
      console.log('📦 Fetching material item:', materialId);
      const response = await this.get(`/materials/items/${materialId}`);
      return response;
    } catch (error) {
      console.error('❌ Material item error:', error);
      throw error;
    }
  }

  async getMaterialCompatibility(surfaceType) {
    try {
      console.log('🔧 Fetching material compatibility for:', surfaceType);
      const response = await this.get(`/materials/compatibility/${surfaceType}`);
      return response;
    } catch (error) {
      console.error('❌ Material compatibility error:', error);
      throw error;
    }
  }

  // 📋 MATERIAL ORDER ENDPOINTS
  async createMaterialOrder(orderData) {
    try {
      console.log('📦 Creating material order...', orderData);
      const response = await this.post('/material-orders', orderData);
      return response;
    } catch (error) {
      console.error('❌ Create material order error:', error);
      throw error;
    }
  }

  async getMaterialOrder(orderId) {
    try {
      console.log('📋 Fetching material order:', orderId);
      const response = await this.get(`/material-orders/${orderId}`);
      return response;
    } catch (error) {
      console.error('❌ Get material order error:', error);
      throw error;
    }
  }

  async updateMaterialOrderStatus(orderId, status) {
    try {
      console.log('📋 Updating material order status:', orderId, status);
      const response = await this.put(`/material-orders/${orderId}/status`, { status });
      return response;
    } catch (error) {
      console.error('❌ Update material order status error:', error);
      throw error;
    }
  }

  // 🔧 INSTALLATION ENDPOINTS
  async createInstallation(installationData) {
    try {
      console.log('🔧 Creating installation...', installationData);
      const response = await this.post('/installations', installationData);
      return response;
    } catch (error) {
      console.error('❌ Create installation error:', error);
      throw error;
    }
  }

  async getInstallation(installationId) {
    try {
      console.log('🔧 Fetching installation:', installationId);
      const response = await this.get(`/installations/${installationId}`);
      return response;
    } catch (error) {
      console.error('❌ Get installation error:', error);
      throw error;
    }
  }

  async updateInstallationStatus(installationId, status, data = {}) {
    try {
      console.log('🔧 Updating installation status:', installationId, status);
      const response = await this.put(`/installations/${installationId}/status`, { status, ...data });
      return response;
    } catch (error) {
      console.error('❌ Update installation status error:', error);
      throw error;
    }
  }

  async uploadInstallationPhotos(installationId, photos) {
    try {
      console.log('📸 Uploading installation photos:', installationId);
      const formData = new FormData();
      photos.forEach((photo, index) => {
        formData.append(`photos`, photo);
      });
      
      const response = await this.request(`/installations/${installationId}/photos`, {
        method: 'POST',
        body: formData,
        headers: {} // Let browser set Content-Type for FormData
      });
      return response;
    } catch (error) {
      console.error('❌ Upload installation photos error:', error);
      throw error;
    }
  }

  // 📊 INTEGRATED BOOKING WITH MATERIALS
  async createBookingWithMaterials(bookingData) {
    try {
      console.log('🎯 Creating booking with materials...', bookingData);
      const response = await this.post('/bookings/with-materials', bookingData);
      return response;
    } catch (error) {
      console.error('❌ Create booking with materials error:', error);
      throw error;
    }
  }

  async calculateBookingCost(data) {
    try {
      console.log('💰 Calculating booking cost...', data);
      const response = await this.post('/bookings/calculate-cost', data);
      return response;
    } catch (error) {
      console.error('❌ Calculate booking cost error:', error);
      throw error;
    }
  }

  // ========================================
  // EXISTING ENDPOINTS (PRESERVED)
  // ========================================

  // Campaign endpoints - ALL PROTECTED
  async getCampaigns() {
    return this.get('/campaigns');
  }

  async getCampaign(id) {
    return this.get(`/campaigns/${id}`);
  }

  async createCampaign(campaignData) {
    return this.post('/campaigns', campaignData);
  }

  async updateCampaign(id, campaignData) {
    return this.put(`/campaigns/${id}`, campaignData);
  }

  async deleteCampaign(id) {
    return this.delete(`/campaigns/${id}`);
  }

  // Advertising Space endpoints - MIXED PUBLIC/PROTECTED
  async getSpaces(params = {}) {
    // ✅ PUBLIC - Browse advertising spaces (no auth needed)
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/spaces?${queryString}` : '/spaces';
    return this.get(endpoint);
  }

  async getSpace(id) {
    // ✅ PROTECTED - Full space details (auth required)
    return this.get(`/spaces/${id}`);
  }

  async getMySpaces() {
    // ✅ PROTECTED - User's own advertising spaces
    return this.get('/spaces/my');
  }

  async createSpace(spaceData) {
    // ✅ PROTECTED - Create advertising space
    return this.post('/spaces', spaceData);
  }

  async updateSpace(id, spaceData) {
    // ✅ PROTECTED - Update advertising space
    return this.put(`/spaces/${id}`, spaceData);
  }

  async deleteSpace(id) {
    // ✅ PROTECTED - Delete advertising space
    return this.delete(`/spaces/${id}`);
  }

  // Booking endpoints - ALL PROTECTED
  async getBookings() {
    return this.get('/bookings');
  }

  async getBooking(id) {
    return this.get(`/bookings/${id}`);
  }

  async createBooking(bookingData) {
    return this.post('/bookings', bookingData);
  }

  async updateBooking(id, bookingData) {
    return this.put(`/bookings/${id}`, bookingData);
  }

  async cancelBooking(id) {
    return this.post(`/bookings/${id}/cancel`);
  }

  // 🔔 NEW: Booking approval/decline methods
  async approveBooking(bookingId) {
    return this.put(`/bookings/${bookingId}/approve`);
  }

  async declineBooking(bookingId, reason = '') {
    return this.put(`/bookings/${bookingId}/decline`, { reason });
  }

  async updateBookingStatus(bookingId, status) {
    return this.put(`/bookings/${bookingId}`, { status });
  }

  // Invoice endpoints - ALL PROTECTED
  async getInvoices() {
    return this.get('/invoices');
  }

  async getInvoice(id) {
    return this.get(`/invoices/${id}`);
  }

  async createInvoice(invoiceData) {
    return this.post('/invoices', invoiceData);
  }

  async payInvoice(id, paymentData) {
    return this.post(`/invoices/${id}/pay`, paymentData);
  }

  // Message endpoints - ALL PROTECTED
  async getMessages() {
    return this.get('/messages');
  }

  async getMessage(id) {
    return this.get(`/messages/${id}`);
  }

  async sendMessage(messageData) {
    return this.post('/messages', messageData);
  }

  async markMessageAsRead(id) {
    return this.post(`/messages/${id}/read`);
  }

  // 🔔 NEW: Notification endpoints - ALL PROTECTED
  async getNotifications(options = {}) {
    const { unread_only = false, limit = 20 } = options;
    const params = new URLSearchParams({ 
      unread_only: unread_only.toString(), 
      limit: limit.toString() 
    });
    
    return this.get(`/notifications?${params}`);
  }

  async getNotificationCount() {
    return this.get('/notifications/count');
  }

  async markNotificationAsRead(notificationId) {
    return this.post(`/notifications/${notificationId}/read`);
  }

  async markAllNotificationsAsRead() {
    return this.post('/notifications/mark-all-read');
  }

  // User endpoints - ALL PROTECTED
  async getUserProfile() {
    return this.get('/users/me');
  }

  async updateUserProfile(userData) {
    return this.put('/users/me', userData);
  }

  // Payment Settings endpoints - ALL PROTECTED
  async getPaymentSettings() {
    return this.get('/users/payment-settings');
  }

  async updatePaymentSettings(data) {
    return this.put('/users/payment-settings', data);
  }

  // Analytics endpoints - ALL PROTECTED
  async getDashboardAnalytics() {
    // Mock endpoint - you can implement these later
    console.log('📊 Mock dashboard analytics request');
    return {
      success: true,
      data: {
        totalSpaces: 3,
        totalCampaigns: 3,
        totalBookings: 2,
        totalRevenue: 7500
      }
    };
  }

  async getSpaceAnalytics(spaceId) {
    console.log('📊 Mock space analytics request for:', spaceId);
    return {
      success: true,
      data: {
        views: 250,
        bookings: 12,
        revenue: 3500
      }
    };
  }

  async getCampaignAnalytics(campaignId) {
    console.log('📊 Mock campaign analytics request for:', campaignId);
    return {
      success: true,
      data: {
        impressions: 15000,
        clicks: 1200,
        conversions: 85,
        spend: 1200
      }
    };
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();
export default apiClient;