// src/api/entities.js
// Real API entities connected to your PostgreSQL backend

import apiClient from './apiClient.js';

console.log('🚀 Real API entities loaded - connecting to PostgreSQL backend');

// Helper function to handle API errors gracefully
const handleApiError = (entityName, error) => {
  console.error(`${entityName}.list() error:`, error);
  return []; // Return empty array on error
};

// Helper function to safely get array length
const safeLength = (data) => {
  if (Array.isArray(data)) return data.length;
  if (data && Array.isArray(data.data)) return data.data.length;
  return 0;
};

// Helper function to safely extract data array
const extractData = (response) => {
  if (Array.isArray(response)) return response;
  if (response && Array.isArray(response.data)) return response.data;
  if (response && response.success && Array.isArray(response.data)) return response.data;
  return [];
};

export const Campaign = {
  async list() {
    try {
      const response = await apiClient.getCampaigns();
      const campaigns = extractData(response);
      console.log('✅ Campaigns loaded from database:', campaigns.length);
      return campaigns;
    } catch (error) {
      console.error('Campaign.list() error:', error);
      return [];
    }
  },

  async get(id) {
    try {
      const response = await apiClient.getCampaign(id);
      return response.data || response;
    } catch (error) {
      console.error('Campaign.get() error:', error);
      return null;
    }
  },

  async create(data) {
    try {
      const response = await apiClient.createCampaign(data);
      return response.data || response;
    } catch (error) {
      console.error('Campaign.create() error:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      const response = await apiClient.updateCampaign(id, data);
      return response.data || response;
    } catch (error) {
      console.error('Campaign.update() error:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      await apiClient.deleteCampaign(id);
      return true;
    } catch (error) {
      console.error('Campaign.delete() error:', error);
      throw error;
    }
  }
};

// ✅ NEW PRIMARY ENTITY - Space (replaces Property)
export const Space = {
  async list() {
    try {
      const response = await apiClient.getSpaces();
      const spaces = extractData(response);
      console.log('✅ Advertising spaces loaded from database:', spaces.length);
      return spaces;
    } catch (error) {
      console.error('Space.list() error:', error);
      return [];
    }
  },

  async get(id) {
    try {
      const response = await apiClient.getSpace(id);
      return response.data || response;
    } catch (error) {
      console.error('Space.get() error:', error);
      return null;
    }
  },

  async create(data) {
    try {
      const response = await apiClient.createSpace(data);
      return response.data || response;
    } catch (error) {
      console.error('Space.create() error:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      const response = await apiClient.updateSpace(id, data);
      return response.data || response;
    } catch (error) {
      console.error('Space.update() error:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      await apiClient.deleteSpace(id);
      return true;
    } catch (error) {
      console.error('Space.delete() error:', error);
      throw error;
    }
  },

  async search(filters = {}) {
    try {
      const response = await apiClient.searchSpaces(filters);
      const spaces = extractData(response);
      console.log('✅ Space search results:', spaces.length);
      return spaces;
    } catch (error) {
      console.error('Space.search() error:', error);
      return [];
    }
  },

  async getMy() {
    try {
      const response = await apiClient.getMySpaces();
      const spaces = extractData(response);
      console.log('✅ My spaces loaded from database:', spaces.length);
      return spaces;
    } catch (error) {
      console.error('Space.getMy() error:', error);
      return [];
    }
  }
};

// ✅ BACKWARD COMPATIBILITY - Property entity redirects to Space
export const Property = {
  async list() {
    console.log('⚠️ Property.list() is deprecated, use Space.list() instead');
    return Space.list();
  },

  async get(id) {
    console.log('⚠️ Property.get() is deprecated, use Space.get() instead');
    return Space.get(id);
  },

  async create(data) {
    console.log('⚠️ Property.create() is deprecated, use Space.create() instead');
    return Space.create(data);
  },

  async update(id, data) {
    console.log('⚠️ Property.update() is deprecated, use Space.update() instead');
    return Space.update(id, data);
  },

  async delete(id) {
    console.log('⚠️ Property.delete() is deprecated, use Space.delete() instead');
    return Space.delete(id);
  }
};

export const Booking = {
  async list() {
    try {
      const response = await apiClient.getBookings();
      const bookings = extractData(response);
      console.log('✅ Bookings loaded from database:', bookings.length);
      return bookings;
    } catch (error) {
      console.error('Booking.list() error:', error);
      return [];
    }
  },

  async get(id) {
    try {
      const response = await apiClient.getBooking(id);
      return response.data || response;
    } catch (error) {
      console.error('Booking.get() error:', error);
      return null;
    }
  },

  async create(data) {
    try {
      const response = await apiClient.createBooking(data);
      return response.data || response;
    } catch (error) {
      console.error('Booking.create() error:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      const response = await apiClient.updateBooking(id, data);
      return response.data || response;
    } catch (error) {
      console.error('Booking.update() error:', error);
      throw error;
    }
  },

  async cancel(id) {
    try {
      const response = await apiClient.cancelBooking(id);
      return response.data || response;
    } catch (error) {
      console.error('Booking.cancel() error:', error);
      throw error;
    }
  }
};

export const Invoice = {
  async list() {
    try {
      const response = await apiClient.getInvoices();
      const invoices = extractData(response);
      console.log('✅ Invoices loaded from database:', invoices.length);
      return invoices;
    } catch (error) {
      console.error('Invoice.list() error:', error);
      return [];
    }
  },

  async get(id) {
    try {
      const response = await apiClient.getInvoice(id);
      return response.data || response;
    } catch (error) {
      console.error('Invoice.get() error:', error);
      return null;
    }
  },

  async pay(id, paymentData) {
    try {
      const response = await apiClient.payInvoice(id, paymentData);
      return response.data || response;
    } catch (error) {
      console.error('Invoice.pay() error:', error);
      throw error;
    }
  }
};

export const Message = {
  async list() {
    try {
      const response = await apiClient.getMessages();
      const messages = extractData(response);
      console.log('✅ Messages loaded from database:', messages.length);
      return messages;
    } catch (error) {
      console.error('Message.list() error:', error);
      return [];
    }
  },

  async get(id) {
    try {
      const response = await apiClient.getMessage(id);
      return response.data || response;
    } catch (error) {
      console.error('Message.get() error:', error);
      return null;
    }
  },

  async send(data) {
    try {
      const response = await apiClient.sendMessage(data);
      return response.data || response;
    } catch (error) {
      console.error('Message.send() error:', error);
      throw error;
    }
  },

  async markAsRead(id) {
    try {
      const response = await apiClient.markMessageAsRead(id);
      return response.data || response;
    } catch (error) {
      console.error('Message.markAsRead() error:', error);
      throw error;
    }
  }
};

// ✅ UPDATED - AdvertisingArea entity (now works with Areas API)
export const AdvertisingArea = {
  async list() {
    try {
      const response = await apiClient.getAreas();
      const areas = extractData(response);
      console.log('✅ Advertising areas loaded from database:', areas.length);
      return areas;
    } catch (error) {
      console.error('AdvertisingArea.list() error:', error);
      return [];
    }
  },

  async get(id) {
    try {
      const response = await apiClient.getArea(id);
      return response.data || response;
    } catch (error) {
      console.error('AdvertisingArea.get() error:', error);
      return null;
    }
  },

  async create(data) {
    try {
      const response = await apiClient.createArea(data);
      return response.data || response;
    } catch (error) {
      console.error('AdvertisingArea.create() error:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      const response = await apiClient.updateArea(id, data);
      return response.data || response;
    } catch (error) {
      console.error('AdvertisingArea.update() error:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      await apiClient.deleteArea(id);
      return true;
    } catch (error) {
      console.error('AdvertisingArea.delete() error:', error);
      throw error;
    }
  }
};

// ✅ NEW - Area entity (alias for AdvertisingArea)
export const Area = AdvertisingArea;

export const User = {
  async getProfile() {
    try {
      const response = await apiClient.getUserProfile();
      console.log('✅ User profile loaded from database');
      return response.data || response;
    } catch (error) {
      console.error('User.getProfile() error:', error);
      return null;
    }
  },

  async updateProfile(data) {
    try {
      const response = await apiClient.updateUserProfile(data);
      return response.data || response;
    } catch (error) {
      console.error('User.updateProfile() error:', error);
      throw error;
    }
  },

  async get(id) {
    try {
      console.log('👤 Mock User.get:', id);
      return {
        id,
        firstName: 'Mock',
        lastName: 'User',
        email: 'mock@example.com',
        role: 'USER'
      };
    } catch (error) {
      console.error('User.get() error:', error);
      return null;
    }
  }
};

// Payment Settings Entity
export const PaymentSettings = {
  async list() {
    try {
      const response = await apiClient.getPaymentSettings();
      const settings = extractData(response);
      console.log('✅ Payment settings loaded from database:', settings.length);
      return settings;
    } catch (error) {
      console.error('PaymentSettings.list() error:', error);
      return [];
    }
  },

  async get() {
    try {
      const response = await apiClient.getPaymentSettings();
      console.log('✅ Payment settings loaded from database');
      return response.data || response;
    } catch (error) {
      console.error('PaymentSettings.get() error:', error);
      return {
        id: 'mock_payment_settings',
        stripeCustomerId: null,
        defaultPaymentMethod: null,
        autoPayEnabled: false,
        reminderEnabled: true,
        reminderDaysBefore: 3
      };
    }
  },

  async create(data) {
    try {
      const response = await apiClient.createPaymentSettings(data);
      return response.data || response;
    } catch (error) {
      console.error('PaymentSettings.create() error:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      const response = await apiClient.updatePaymentSettings(id, data);
      return response.data || response;
    } catch (error) {
      console.error('PaymentSettings.update() error:', error);
      throw error;
    }
  }
};

// Stripe Entity (for payment components)
export const Stripe = {
  async createPaymentIntent(data) {
    try {
      console.log('💳 Mock Stripe.createPaymentIntent:', data);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        client_secret: `pi_mock_${Date.now()}_secret_mock`,
        id: `pi_mock_${Date.now()}`,
        amount: data.amount,
        currency: data.currency || 'usd'
      };
    } catch (error) {
      console.error('Stripe.createPaymentIntent() error:', error);
      throw error;
    }
  },

  async confirmPayment(paymentIntentId) {
    try {
      console.log('💳 Mock Stripe.confirmPayment:', paymentIntentId);
      await new Promise(resolve => setTimeout(resolve, 1500));
      return {
        id: paymentIntentId,
        status: 'succeeded',
        payment_method: 'card_mock'
      };
    } catch (error) {
      console.error('Stripe.confirmPayment() error:', error);
      throw error;
    }
  }
};

// ✅ UPDATED - SpaceApproval Entity (renamed from PropertyApproval)
export const SpaceApproval = {
  async list() {
    try {
      const response = await apiClient.getSpaceApprovals();
      const approvals = extractData(response);
      console.log('✅ Space approvals loaded from database:', approvals.length);
      return approvals;
    } catch (error) {
      console.error('SpaceApproval.list() error:', error);
      return [];
    }
  },

  async get(id) {
    try {
      const response = await apiClient.getSpaceApproval(id);
      return response.data || response;
    } catch (error) {
      console.error('SpaceApproval.get() error:', error);
      return null;
    }
  },

  async create(data) {
    try {
      const response = await apiClient.createSpaceApproval(data);
      return response.data || response;
    } catch (error) {
      console.error('SpaceApproval.create() error:', error);
      throw error;
    }
  },

  async approve(spaceId, data) {
    try {
      const response = await apiClient.approveSpace(spaceId, data);
      return response.data || response;
    } catch (error) {
      console.error('SpaceApproval.approve() error:', error);
      throw error;
    }
  },

  async reject(spaceId, data) {
    try {
      const response = await apiClient.rejectSpace(spaceId, data);
      return response.data || response;
    } catch (error) {
      console.error('SpaceApproval.reject() error:', error);
      throw error;
    }
  }
};

// ✅ BACKWARD COMPATIBILITY - PropertyApproval redirects to SpaceApproval
export const PropertyApproval = {
  async list() {
    console.log('⚠️ PropertyApproval.list() is deprecated, use SpaceApproval.list() instead');
    return SpaceApproval.list();
  },

  async get(id) {
    console.log('⚠️ PropertyApproval.get() is deprecated, use SpaceApproval.get() instead');
    return SpaceApproval.get(id);
  },

  async create(data) {
    console.log('⚠️ PropertyApproval.create() is deprecated, use SpaceApproval.create() instead');
    return SpaceApproval.create(data);
  },

  async update(id, data) {
    console.log('⚠️ PropertyApproval.update() is deprecated, use SpaceApproval.update() instead');
    return SpaceApproval.update(id, data);
  },

  async approve(propertyId, data) {
    console.log('⚠️ PropertyApproval.approve() is deprecated, use SpaceApproval.approve() instead');
    return SpaceApproval.approve(propertyId, data);
  },

  async reject(propertyId, data) {
    console.log('⚠️ PropertyApproval.reject() is deprecated, use SpaceApproval.reject() instead');
    return SpaceApproval.reject(propertyId, data);
  }
};

// Verification Entity
export const Verification = {
  async verify(data) {
    try {
      console.log('🔍 Mock Verification.verify:', data);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        verified: true,
        confidence: 0.95,
        details: {
          address_verified: true,
          ownership_verified: true,
          permits_verified: false
        }
      };
    } catch (error) {
      console.error('Verification.verify() error:', error);
      throw error;
    }
  },

  async getStatus(spaceId) {
    try {
      console.log('🔍 Mock Verification.getStatus:', spaceId);
      return {
        status: 'pending',
        last_verified: null,
        verification_score: 0.0
      };
    } catch (error) {
      console.error('Verification.getStatus() error:', error);
      return { status: 'unknown' };
    }
  }
};

// Analytics Entities
export const Analytics = {
  async getDashboardData() {
    try {
      console.log('📊 Mock Analytics.getDashboardData');
      return {
        totalSpaces: 3, // Updated from totalProperties
        totalCampaigns: 3,
        totalBookings: 2,
        totalRevenue: 7500,
        monthlyGrowth: 12.5
      };
    } catch (error) {
      console.error('Analytics.getDashboardData() error:', error);
      return {};
    }
  },

  async getSpaceAnalytics() {
    try {
      console.log('📊 Mock Analytics.getSpaceAnalytics');
      return {
        totalViews: 1250,
        conversionRate: 8.5,
        averageBookingValue: 2500
      };
    } catch (error) {
      console.error('Analytics.getSpaceAnalytics() error:', error);
      return {};
    }
  },

  async getCampaignAnalytics() {
    try {
      console.log('📊 Mock Analytics.getCampaignAnalytics');
      return {
        impressions: 15000,
        clicks: 1200,
        conversions: 85,
        ctr: 8.0,
        cpc: 2.50
      };
    } catch (error) {
      console.error('Analytics.getCampaignAnalytics() error:', error);
      return {};
    }
  },

  // ✅ BACKWARD COMPATIBILITY
  async getPropertyAnalytics() {
    console.log('⚠️ Analytics.getPropertyAnalytics() is deprecated, use Analytics.getSpaceAnalytics() instead');
    return this.getSpaceAnalytics();
  }
};

// Space Analytics (enhanced)
export const SpaceAnalytics = {
  async getOccupancyData() {
    try {
      console.log('📊 Mock SpaceAnalytics.getOccupancyData');
      return {
        occupancyRate: 78.5,
        peakHours: ['9-11 AM', '2-4 PM'],
        averageDuration: 4.5
      };
    } catch (error) {
      console.error('SpaceAnalytics.getOccupancyData() error:', error);
      return {};
    }
  },

  async getPerformanceMetrics() {
    try {
      console.log('📊 Mock SpaceAnalytics.getPerformanceMetrics');
      return {
        impressions: 25000,
        engagement_rate: 12.5,
        click_through_rate: 3.2,
        conversion_rate: 8.1
      };
    } catch (error) {
      console.error('SpaceAnalytics.getPerformanceMetrics() error:', error);
      return {};
    }
  }
};

// Notification Entity (if needed)
export const Notification = {
  async list() {
    try {
      console.log('🔔 Mock Notification.list');
      return [];
    } catch (error) {
      console.error('Notification.list() error:', error);
      return [];
    }
  },

  async markAsRead(id) {
    try {
      console.log('🔔 Mock Notification.markAsRead', id);
      return { success: true };
    } catch (error) {
      console.error('Notification.markAsRead() error:', error);
      throw error;
    }
  }
};

// Chat Entity (if needed)
export const Chat = {
  async getConversations() {
    try {
      console.log('💬 Mock Chat.getConversations');
      return [];
    } catch (error) {
      console.error('Chat.getConversations() error:', error);
      return [];
    }
  },

  async sendMessage(data) {
    try {
      console.log('💬 Mock Chat.sendMessage', data);
      return { success: true, id: `msg_${Date.now()}` };
    } catch (error) {
      console.error('Chat.sendMessage() error:', error);
      throw error;
    }
  }
};

// ChatMessage Entity (for chatbot components)
export const ChatMessage = {
  async list(conversationId) {
    try {
      console.log('💬 Mock ChatMessage.list for conversation:', conversationId);
      return [
        {
          id: 'msg_1',
          content: 'Hello! How can I help you with your advertising spaces today?',
          sender: { id: 'bot', firstName: 'ElaView', lastName: 'Assistant' },
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          chatRoom: conversationId || 'general'
        },
        {
          id: 'msg_2', 
          content: 'I can help you with space management, campaigns, bookings, and more!',
          sender: { id: 'bot', firstName: 'ElaView', lastName: 'Assistant' },
          createdAt: new Date().toISOString(),
          chatRoom: conversationId || 'general'
        }
      ];
    } catch (error) {
      console.error('ChatMessage.list() error:', error);
      return [];
    }
  },

  async create(data) {
    try {
      console.log('💬 Mock ChatMessage.create:', data);
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        id: `msg_${Date.now()}`,
        content: data.content,
        sender: data.sender || { id: 'user', firstName: 'User' },
        createdAt: new Date().toISOString(),
        chatRoom: data.chatRoom || 'general'
      };
    } catch (error) {
      console.error('ChatMessage.create() error:', error);
      throw error;
    }
  },

  async send(data) {
    return await this.create(data);
  }
};

// Map Entity (for GoogleMap components)
export const Map = {
  async getSpaces(bounds) {
    try {
      console.log('🗺️ Mock Map.getSpaces:', bounds);
      const spaces = await Space.list();
      return spaces.filter(s => s.latitude && s.longitude);
    } catch (error) {
      console.error('Map.getSpaces() error:', error);
      return [];
    }
  },

  async getAreas(bounds) {
    try {
      console.log('🗺️ Mock Map.getAreas:', bounds);
      return await Area.list();
    } catch (error) {
      console.error('Map.getAreas() error:', error);
      return [];
    }
  },

  // ✅ BACKWARD COMPATIBILITY
  async getProperties(bounds) {
    console.log('⚠️ Map.getProperties() is deprecated, use Map.getSpaces() instead');
    return this.getSpaces(bounds);
  },

  async getAdvertisingAreas(bounds) {
    console.log('⚠️ Map.getAdvertisingAreas() is deprecated, use Map.getAreas() instead');
    return this.getAreas(bounds);
  }
};

// Auth Entity (for verification/debug components)
export const Auth = {
  async getCurrentUser() {
    try {
      return await User.getProfile();
    } catch (error) {
      console.error('Auth.getCurrentUser() error:', error);
      return null;
    }
  },

  async verifyToken(token) {
    try {
      console.log('🔐 Mock Auth.verifyToken');
      return { valid: true, user_id: 'mock_user' };
    } catch (error) {
      console.error('Auth.verifyToken() error:', error);
      return { valid: false };
    }
  }
};

// Export everything for compatibility
export default {
  Campaign,
  Space,
  Property, // Backward compatibility
  Booking,
  Invoice,
  Message,
  AdvertisingArea,
  Area,
  User,
  PaymentSettings,
  Stripe,
  SpaceApproval,
  PropertyApproval, // Backward compatibility
  Verification,
  Analytics,
  SpaceAnalytics,
  Notification,
  Chat,
  ChatMessage,
  Map,
  Auth
};