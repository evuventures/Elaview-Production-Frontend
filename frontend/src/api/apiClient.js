// src/api/apiClient.js
// API client for your Express backend

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://elaview-backend.up.railway.app/api';

// ✅ PUBLIC ENDPOINTS - These don't require authentication
const PUBLIC_ENDPOINTS = [
  '/spaces',
  '/areas', 
  '/spaces/search',
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

  // Legacy property endpoints - keeping for backward compatibility
  async getProperties(params = {}) {
    // Redirect to spaces
    return this.getSpaces(params);
  }

  async getProperty(id) {
    // Redirect to spaces
    return this.getSpace(id);
  }

  async getMyProperties() {
    // Redirect to spaces
    return this.getMySpaces();
  }

  async createProperty(propertyData) {
    // Redirect to spaces
    return this.createSpace(propertyData);
  }

  async updateProperty(id, propertyData) {
    // Redirect to spaces
    return this.updateSpace(id, propertyData);
  }

  async deleteProperty(id) {
    // Redirect to spaces
    return this.deleteSpace(id);
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

  // Advertising Area endpoints - PUBLIC for browsing
  async getAreas(params = {}) {
    // ✅ PUBLIC - Browse advertising areas within spaces
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/areas?${queryString}` : '/areas';
    return this.get(endpoint);
  }

  async getArea(id) {
    // ✅ PROTECTED - Full area details
    return this.get(`/areas/${id}`);
  }

  // Legacy advertising-areas endpoints - keeping for backward compatibility
  async getAdvertisingAreas(params = {}) {
    return this.getAreas(params);
  }

  async getAdvertisingArea(id) {
    return this.getArea(id);
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

  // Space Approval endpoints - ALL PROTECTED (ADMIN)
  async getSpaceApprovals() {
    return this.get('/space-approvals');
  }

  async getSpaceApproval(id) {
    return this.get(`/space-approvals/${id}`);
  }

  async approveSpace(spaceId, data) {
    return this.post(`/spaces/${spaceId}/approve`, data);
  }

  async rejectSpace(spaceId, data) {
    return this.post(`/spaces/${spaceId}/reject`, data);
  }

  // Legacy property approval endpoints - keeping for backward compatibility
  async getPropertyApprovals() {
    return this.getSpaceApprovals();
  }

  async getPropertyApproval(id) {
    return this.getSpaceApproval(id);
  }

  async approveProperty(propertyId, data) {
    return this.approveSpace(propertyId, data);
  }

  async rejectProperty(propertyId, data) {
    return this.rejectSpace(propertyId, data);
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

  // Legacy property analytics - keeping for backward compatibility
  async getPropertyAnalytics(propertyId) {
    return this.getSpaceAnalytics(propertyId);
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

  // ✅ NEW: Public advertising space search
  async searchSpaces(filters = {}) {
    const queryString = new URLSearchParams(filters).toString();
    const endpoint = queryString ? `/spaces?${queryString}` : '/spaces';
    return this.get(endpoint);
  }

  // ✅ NEW: Get space details for public viewing
  async getPublicSpace(id) {
    // For public space viewing - this would need a new backend endpoint
    // For now, use the regular endpoint but handle 401 gracefully
    try {
      return await this.get(`/spaces/${id}`);
    } catch (error) {
      if (error.message.includes('401')) {
        console.log('Space details require authentication');
        return null;
      }
      throw error;
    }
  }

  // Legacy methods - keeping for backward compatibility
  async searchProperties(filters = {}) {
    return this.searchSpaces(filters);
  }

  async getPublicProperty(id) {
    return this.getPublicSpace(id);
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();
export default apiClient;