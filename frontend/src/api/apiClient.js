// src/api/apiClient.js
// API client updated to match your ACTUAL database structure
// ✅ FIXED: Added missing getSpaces, getSpaceOwnerDashboard, getAdvertiserDashboard methods

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
        
        if (response.status >= 500 && attempt < maxAttempts) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`⏳ Retrying in ${delay}ms (attempt ${attempt + 1}/${maxAttempts})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.request(endpoint, method, data, attempt + 1, maxAttempts);
        }
        
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`✅ ${method} ${endpoint} - Success`);
      return result;

    } catch (error) {
      if (attempt < maxAttempts && !error.message.includes('aborted')) {
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
  // These methods fix the "getSpaces is not a function" error!
  async getSpaces(params = {}) {
    // Spaces and areas are the same thing - just call getAreas()
    console.log('🔄 getSpaces() called - routing to getAreas()');
    return this.getAreas(params);
  }

  async getSpace(id) {
    console.log('🔄 getSpace() called - routing to getArea()');
    return this.getArea(id);
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

  // ✅ DASHBOARD METHODS (fixes the "NOT FETCHING" errors!)
  async getSpaceOwnerDashboard() {
    console.log('📊 Fetching space owner dashboard...');
    return this.get('/dashboard/space-owner');
  }

  async getAdvertiserDashboard() {
    console.log('📊 Fetching advertiser dashboard...');
    return this.get('/dashboard/advertiser');
  }

  async getMaterialsCatalog(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    console.log('📦 Fetching materials catalog...');
    return this.get(`/materials/catalog${queryString ? `?${queryString}` : ''}`);
  }

  // ✅ CONVERSATIONS (matches your actual schema)
  async getConversations(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/conversations${queryString ? `?${queryString}` : ''}`);
  }

  async getConversation(id) {
    return this.get(`/conversations/${id}`);
  }

  async createConversation(data) {
    return this.post('/conversations', data);
  }

  async updateConversation(id, data) {
    return this.put(`/conversations/${id}`, data);
  }

  async deleteConversation(id) {
    return this.delete(`/conversations/${id}`);
  }

  async archiveConversation(id) {
    return this.patch(`/conversations/${id}/archive`);
  }

  // ✅ CHAT MESSAGES (matches your actual schema)
  async getChatMessages(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/chat-messages${queryString ? `?${queryString}` : ''}`);
  }

  async sendChatMessage(data) {
    return this.post('/chat-messages', data);
  }

  async updateChatMessage(messageId, data) {
    return this.put(`/chat-messages/${messageId}`, data);
  }

  async deleteChatMessage(messageId) {
    return this.delete(`/chat-messages/${messageId}`);
  }

  // ✅ CREATIVES (matches your actual schema)
  async getCreatives(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/creatives${queryString ? `?${queryString}` : ''}`);
  }

  async getCreative(id) {
    return this.get(`/creatives/${id}`);
  }

  async createCreative(data) {
    return this.post('/creatives', data);
  }

  async updateCreative(id, data) {
    return this.put(`/creatives/${id}`, data);
  }

  async deleteCreative(id) {
    return this.delete(`/creatives/${id}`);
  }

  async getCampaignCreatives(campaignId) {
    return this.get(`/campaigns/${campaignId}/creatives`);
  }

  // ✅ PROPERTY APPROVALS (matches your actual schema)
  async getPropertyApprovals(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/property-approvals${queryString ? `?${queryString}` : ''}`);
  }

  async getPropertyApproval(id) {
    return this.get(`/property-approvals/${id}`);
  }

  async createPropertyApproval(data) {
    return this.post('/property-approvals', data);
  }

  async approveProperty(id, data = {}) {
    return this.patch(`/property-approvals/${id}/approve`, data);
  }

  async rejectProperty(id, data = {}) {
    return this.patch(`/property-approvals/${id}/reject`, data);
  }

  async updatePropertyApproval(id, data) {
    return this.put(`/property-approvals/${id}`, data);
  }

  // ✅ PAYMENT SYSTEM (matches your actual schema)
  async getPaymentSettings() {
    return this.get('/payment-settings');
  }

  async updatePaymentSettings(data) {
    return this.put('/payment-settings', data);
  }

  async getPaymentReminders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/payment-reminders${queryString ? `?${queryString}` : ''}`);
  }

  async createPaymentReminder(data) {
    return this.post('/payment-reminders', data);
  }

  // ✅ NOTIFICATIONS (NEW - fixes your 500 errors!)
  async getNotifications(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/notifications${queryString ? `?${queryString}` : ''}`);
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

  // ✅ MESSAGE REACTIONS & ATTACHMENTS (matches your actual schema)
  async addMessageReaction(messageId, reaction) {
    return this.post(`/messages/${messageId}/reactions`, { reaction });
  }

  async removeMessageReaction(messageId, reaction) {
    return this.delete(`/messages/${messageId}/reactions/${reaction}`);
  }

  async getMessageAttachments(messageId) {
    return this.get(`/messages/${messageId}/attachments`);
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

export default new ApiClient();