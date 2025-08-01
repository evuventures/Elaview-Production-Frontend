// src/api/apiClient.js
// API client enhanced with Progressive Configuration Checkout endpoints
// ✅ STEP 2: Business Profile Methods Enhanced

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

  // ✅ ENHANCED: BUSINESS PROFILE MANAGEMENT (Progressive Configuration)
  async getUserBusinessProfile() {
    console.log('🏢 Fetching user business profile...');
    try {
      const response = await this.get('/users/business-profile');
      
      if (response.success && response.data) {
        console.log('✅ Business profile retrieved:', response.data);
        return {
          success: true,
          data: response.data
        };
      } else {
        console.log('ℹ️ No business profile found');
        return {
          success: false,
          error: 'Business profile not found'
        };
      }
    } catch (error) {
      console.error('❌ Get business profile error:', error);
      return {
        success: false,
        error: 'Failed to get business profile'
      };
    }
  }

  async updateBusinessProfile(profileData) {
    console.log('🏢 Updating business profile:', profileData);
    try {
      // Validate required fields before sending
      const requiredFields = ['businessName', 'businessIndustry', 'businessAddress'];
      for (const field of requiredFields) {
        if (!profileData[field]) {
          return {
            success: false,
            error: `Missing required field: ${field}`
          };
        }
      }
      
      // Validate business address
      if (!profileData.businessAddress.street || !profileData.businessAddress.city) {
        return {
          success: false,
          error: 'Business address must include street and city'
        };
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

  async validateBusinessProfile() {
    console.log('🔍 Validating business profile completeness...');
    try {
      const response = await this.get('/users/business-profile/validate');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Validate business profile error:', error);
      return {
        success: false,
        error: 'Failed to validate business profile'
      };
    }
  }

  async checkBusinessProfileRequired() {
    console.log('❓ Checking if business profile setup is required...');
    try {
      const response = await this.get('/users/business-profile/required');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Check business profile required error:', error);
      return {
        success: false,
        error: 'Failed to check if business profile is required'
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

  // ✅ NEW: SPACE AVAILABILITY CHECKING (Progressive Configuration)
  async checkSpaceAvailability(spaceId, startDate, endDate) {
    console.log('📅 Checking availability for space:', spaceId, 'from', startDate, 'to', endDate);
    return this.get(`/spaces/${spaceId}/availability?start=${startDate}&end=${endDate}`);
  }

  async checkMultipleSpaceAvailability(spaceAvailabilityData) {
    console.log('📅 Checking availability for multiple spaces:', spaceAvailabilityData);
    return this.post('/spaces/availability/bulk', spaceAvailabilityData);
  }

  async getSpaceBookedDates(spaceId, monthYear) {
    console.log('📅 Getting booked dates for space:', spaceId, 'for month:', monthYear);
    return this.get(`/spaces/${spaceId}/booked-dates?month=${monthYear}`);
  }

  // ✅ SPACES = AREAS (aliases for backward compatibility)
  async getSpaces(params = {}) {
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

  // ✅ SPACE SEARCH (MISSING METHOD YOUR DASHBOARD NEEDS)
  async searchAvailableSpaces(filters = {}) {
    console.log('🔍 Searching available spaces with filters:', filters);
    const queryString = new URLSearchParams(filters).toString();
    return this.get(`/spaces/search${queryString ? `?${queryString}` : ''}`);
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

  async approveBooking(id) {
    return this.patch(`/bookings/${id}/approve`);
  }

  async declineBooking(id, reason = '') {
    return this.patch(`/bookings/${id}/decline`, { reason });
  }

  // ✅ BOOKING WITH MATERIALS (MISSING METHOD YOUR DASHBOARD CALLS)
  async createBookingWithMaterials(bookingData) {
    console.log('📋 Creating booking with materials:', bookingData);
    return this.post('/bookings/with-materials', bookingData);
  }

  // ✅ NEW: PROGRESSIVE CONFIGURATION CHECKOUT ENDPOINTS
  
  // Material Configuration Phase
  async getMaterialsForSpace(spaceId) {
    console.log('📦 Getting compatible materials for space:', spaceId);
    return this.get(`/spaces/${spaceId}/materials`);
  }

  async calculateMaterialPricing(configurationData) {
    console.log('💰 Calculating material pricing:', configurationData);
    return this.post('/materials/calculate-pricing', configurationData);
  }

  async validateMaterialConfiguration(configData) {
    console.log('✅ Validating material configuration:', configData);
    return this.post('/materials/validate-configuration', configData);
  }

  // Cart & Multi-Space Management
  async validateCartItems(cartData) {
    console.log('🛒 Validating cart items and configurations:', cartData);
    return this.post('/cart/validate', cartData);
  }

  async calculateCartTotal(cartData) {
    console.log('💰 Calculating total cart pricing:', cartData);
    return this.post('/cart/calculate-total', cartData);
  }

  async saveCartState(cartData) {
    console.log('💾 Saving cart state for user session:', cartData);
    return this.post('/cart/save-state', cartData);
  }

  async getCartState() {
    console.log('📥 Retrieving saved cart state...');
    return this.get('/cart/state');
  }

  // ✅ ENHANCED: CHECKOUT VALIDATION WITH BUSINESS PROFILE
  async validateCheckoutRequirements(checkoutData) {
    console.log('✅ Validating checkout requirements...');
    try {
      const validations = await Promise.all([
        this.checkBusinessProfileStatus(),
        this.validateCartItems(checkoutData.cartItems || []),
        this.validatePaymentMethod(checkoutData.paymentMethod || {})
      ]);
      
      const [businessProfile, cartValidation, paymentValidation] = validations;
      
      const requirements = {
        businessProfileComplete: businessProfile.data?.isComplete || false,
        cartValid: cartValidation.success,
        paymentMethodValid: paymentValidation.success,
        readyForCheckout: false
      };
      
      // Determine if checkout can proceed
      requirements.readyForCheckout = 
        requirements.businessProfileComplete && 
        requirements.cartValid && 
        requirements.paymentMethodValid;
      
      if (!requirements.readyForCheckout) {
        const issues = [];
        if (!requirements.businessProfileComplete) {
          issues.push('Business profile incomplete');
        }
        if (!requirements.cartValid) {
          issues.push('Cart validation failed');
        }
        if (!requirements.paymentMethodValid) {
          issues.push('Payment method invalid');
        }
        
        return {
          success: false,
          error: `Checkout requirements not met: ${issues.join(', ')}`,
          data: requirements
        };
      }
      
      return {
        success: true,
        data: requirements
      };
    } catch (error) {
      console.error('❌ Checkout validation error:', error);
      return {
        success: false,
        error: 'Failed to validate checkout requirements'
      };
    }
  }

  async validateCartItems(cartItems) {
    try {
      if (!cartItems || cartItems.length === 0) {
        return {
          success: false,
          error: 'Cart is empty'
        };
      }
      
      // Check each cart item
      for (const item of cartItems) {
        if (!item.spaceId || !item.dates || !item.materialConfiguration) {
          return {
            success: false,
            error: 'Cart contains incomplete items'
          };
        }
      }
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to validate cart'
      };
    }
  }

  async validatePaymentMethod(paymentMethod) {
    try {
      if (!paymentMethod || !paymentMethod.type) {
        return {
          success: false,
          error: 'No payment method specified'
        };
      }
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to validate payment method'
      };
    }
  }

  // Stripe Payment Processing
  async createPaymentIntent(paymentData) {
    console.log('💳 Creating Stripe payment intent:', paymentData);
    return this.post('/checkout/create-payment-intent', paymentData);
  }

  async confirmPayment(paymentIntentId, paymentDetails) {
    console.log('✅ Confirming payment:', paymentIntentId);
    return this.post('/checkout/confirm-payment', {
      paymentIntentId,
      ...paymentDetails
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

  async validateBookingData(bookingData) {
    console.log('✅ Validating booking data before creation:', bookingData);
    return this.post('/checkout/validate-booking', bookingData);
  }

  // Checkout Process Management
  async initializeCheckout(cartData) {
    console.log('🚀 Initializing checkout process:', cartData);
    return this.post('/checkout/initialize', cartData);
  }

  async finalizeCheckout(checkoutData) {
    console.log('🎯 Finalizing checkout and creating orders:', checkoutData);
    return this.post('/checkout/finalize', checkoutData);
  }

  async getCheckoutSession(sessionId) {
    console.log('📊 Getting checkout session details:', sessionId);
    return this.get(`/checkout/session/${sessionId}`);
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

  // ✅ DASHBOARD METHODS
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

  // ✅ NOTIFICATIONS (OPTIMIZED - single call methods)
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

  async handleNotificationClick(notification) {
    // Mark as read and return action URL
    await this.markNotificationAsRead(notification.id);
    
    // Determine where to navigate based on notification type
    const messageData = notification.messageData ? JSON.parse(notification.messageData) : {};
    
    switch (messageData.action) {
      case 'booking_approved':
      case 'booking_declined':
        return { success: true, actionUrl: '/dashboard' };
      case 'payment_reminder':
        return { success: true, actionUrl: '/invoices' };
      case 'new_message':
        return { success: true, actionUrl: `/messages?conversation=${messageData.conversationId}` };
      default:
        return { success: true, actionUrl: '/messages' };
    }
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

  // ✅ MATERIAL ORDERS (PHASE 3 ENDPOINTS - PROPERLY ORGANIZED)
  async getMaterialOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/material-orders${queryString ? `?${queryString}` : ''}`);
  }

  async getMaterialOrder(orderId) {
    return this.get(`/material-orders/${orderId}`);
  }

  async getMaterialOrderStatus(orderId) {
    return this.get(`/material-orders/${orderId}/status`);
  }

  async createMaterialOrder(data) {
    return this.post('/material-orders', data);
  }

  async updateMaterialOrder(orderId, data) {
    return this.put(`/material-orders/${orderId}`, data);
  }

  async cancelMaterialOrder(orderId, reason = '') {
    return this.patch(`/material-orders/${orderId}/cancel`, { reason });
  }

  // ✅ SUPPLIERS (PHASE 3 ENDPOINTS)  
  async getSuppliers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/suppliers${queryString ? `?${queryString}` : ''}`);
  }

  async getSupplier(supplierId) {
    return this.get(`/suppliers/${supplierId}`);
  }

  async requestQuote(supplierId, data) {
    return this.post(`/suppliers/${supplierId}/quote`, data);
  }

  async contactSupplier(supplierId, message) {
    return this.post(`/suppliers/${supplierId}/contact`, { message });
  }

  // ✅ ORDER TIMELINE (PHASE 3 ENDPOINTS)
  async getOrderTimeline(orderId) {
    return this.get(`/material-orders/${orderId}/timeline`);
  }

  async addTimelineEvent(orderId, eventData) {
    return this.post(`/material-orders/${orderId}/timeline`, eventData);
  }

  // ✅ DELIVERY COORDINATION (PHASE 3 ENDPOINTS)
  async scheduleDelivery(orderId, data) {
    return this.post(`/material-orders/${orderId}/delivery/schedule`, data);
  }

  async updateDeliveryInstructions(orderId, instructions) {
    return this.patch(`/material-orders/${orderId}/delivery/instructions`, { instructions });
  }

  async trackDelivery(orderId) {
    return this.get(`/material-orders/${orderId}/delivery/track`);
  }

  // ✅ COST OPTIMIZATION (PHASE 3 ENDPOINTS)
  async getCostAlternatives(orderId) {
    return this.get(`/material-orders/${orderId}/alternatives`);
  }

  async getCostRecommendations(orderId) {
    return this.get(`/material-orders/${orderId}/recommendations`);
  }

  async applyOptimization(orderId, optimizationId) {
    return this.post(`/material-orders/${orderId}/optimize`, { optimizationId });
  }

  // ✅ INSTALLATIONS (PHASE 2 ENDPOINTS)
  async getInstallations(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/installations${queryString ? `?${queryString}` : ''}`);
  }

  async getInstallation(installationId) {
    return this.get(`/installations/${installationId}`);
  }

  async updateInstallationStatus(installationId, status, data = {}) {
    return this.patch(`/installations/${installationId}/status`, { status, ...data });
  }

  async uploadInstallationPhoto(installationId, file, type = 'after') {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('type', type); // 'before' or 'after'

    const token = await this.getAuthToken();
    const response = await fetch(`${this.baseURL}/installations/${installationId}/photos`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Photo upload failed: ${response.status}`);
    }

    return response.json();
  }

  async scheduleInstallation(installationId, data) {
    return this.post(`/installations/${installationId}/schedule`, data);
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