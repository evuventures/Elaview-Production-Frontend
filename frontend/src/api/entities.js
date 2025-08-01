// src/api/entities.js
// API entities updated to match your ACTUAL database structure

import apiClient from './apiClient.js';

console.log('🚀 API entities loaded - connecting to your actual PostgreSQL structure');

// Helper function to handle API errors gracefully
const handleApiError = (entityName, error) => {
  console.error(`❌ ${entityName} API Error:`, error.message);
  return []; // Return empty array for list operations, null for single items
};

// Helper function to extract data from API responses
const extractData = (response, fallback = []) => {
  if (!response) return fallback;
  
  // Handle different response formats
  if (Array.isArray(response)) return response;
  if (response.data && Array.isArray(response.data)) return response.data;
  if (response.items && Array.isArray(response.items)) return response.items;
  if (response.properties && Array.isArray(response.properties)) return response.properties;
  if (response.areas && Array.isArray(response.areas)) return response.areas;
  if (response.spaces && Array.isArray(response.spaces)) return response.spaces;
  if (response.results && Array.isArray(response.results)) return response.results;
  
  // For single item responses
  return response.data || response;
};

// =======================================================
// ✅ CORE ENTITIES (matches your actual database)
// =======================================================

export const User = {
  async list(params = {}) {
    try {
      const response = await apiClient.getUsers(params);
      const users = extractData(response);
      console.log(`✅ Users loaded from database: ${users.length}`);
      return users;
    } catch (error) {
      return handleApiError('User.list', error);
    }
  },

  async get(id) {
    try {
      const user = await apiClient.getUser(id);
      console.log(`✅ User loaded: ${user.firstName || user.email}`);
      return user;
    } catch (error) {
      console.error('❌ User.get error:', error);
      return null;
    }
  },

  async getProfile() {
    try {
      const profile = await apiClient.getUserProfile();
      console.log('✅ User profile loaded');
      return profile;
    } catch (error) {
      console.error('❌ User.getProfile error:', error);
      return null;
    }
  },

  async update(id, data) {
    try {
      const user = await apiClient.updateUser(id, data);
      console.log('✅ User updated:', user.firstName);
      return user;
    } catch (error) {
      console.error('❌ User.update error:', error);
      throw error;
    }
  }
};

export const Property = {
  async list(params = {}) {
    try {
      const response = await apiClient.getProperties(params);
      const properties = extractData(response);
      console.log(`✅ Properties loaded from database: ${properties.length}`);
      return properties;
    } catch (error) {
      return handleApiError('Property.list', error);
    }
  },

  async get(id) {
    try {
      const property = await apiClient.getProperty(id);
      console.log(`✅ Property loaded: ${property.title || property.name || property.id}`);
      return property;
    } catch (error) {
      console.error('❌ Property.get error:', error);
      return null;
    }
  },

  async create(data) {
    try {
      const property = await apiClient.createProperty(data);
      console.log('✅ Property created:', property.title || property.name);
      return property;
    } catch (error) {
      console.error('❌ Property.create error:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      const property = await apiClient.updateProperty(id, data);
      console.log('✅ Property updated:', property.title || property.name);
      return property;
    } catch (error) {
      console.error('❌ Property.update error:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      await apiClient.deleteProperty(id);
      console.log('✅ Property deleted:', id);
      return true;
    } catch (error) {
      console.error('❌ Property.delete error:', error);
      throw error;
    }
  }
};

export const Space = {
  async list(params = {}) {
    try {
      const response = await apiClient.getSpaces(params);
      const spaces = extractData(response);
      console.log(`✅ Spaces loaded from database: ${spaces.length}`);
      return spaces;
    } catch (error) {
      return handleApiError('Space.list', error);
    }
  },

  async get(id) {
    try {
      const space = await apiClient.getSpace(id);
      console.log(`✅ Space loaded: ${space.name || space.title || space.id}`);
      return space;
    } catch (error) {
      console.error('❌ Space.get error:', error);
      return null;
    }
  },

  async create(data) {
    try {
      const space = await apiClient.createSpace(data);
      console.log('✅ Space created:', space.name || space.title);
      return space;
    } catch (error) {
      console.error('❌ Space.create error:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      const space = await apiClient.updateSpace(id, data);
      console.log('✅ Space updated:', space.name || space.title);
      return space;
    } catch (error) {
      console.error('❌ Space.update error:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      await apiClient.deleteSpace(id);
      console.log('✅ Space deleted:', id);
      return true;
    } catch (error) {
      console.error('❌ Space.delete error:', error);
      throw error;
    }
  }
};

// ✅ MIGRATION COMPLETE: AdvertisingArea entity removed
// All advertising area functionality has been consolidated into Space entity
// Use Space.list(), Space.get(), Space.create(), Space.update(), Space.delete() instead

export const Campaign = {
  async list(params = {}) {
    try {
      const response = await apiClient.getCampaigns(params);
      const campaigns = extractData(response);
      console.log(`✅ Campaigns loaded from database: ${campaigns.length}`);
      return campaigns;
    } catch (error) {
      return handleApiError('Campaign.list', error);
    }
  },

  async get(id) {
    try {
      const campaign = await apiClient.getCampaign(id);
      console.log(`✅ Campaign loaded: ${campaign.name || campaign.title || campaign.id}`);
      return campaign;
    } catch (error) {
      console.error('❌ Campaign.get error:', error);
      return null;
    }
  },

  async create(data) {
    try {
      const campaign = await apiClient.createCampaign(data);
      console.log('✅ Campaign created:', campaign.name || campaign.title);
      return campaign;
    } catch (error) {
      console.error('❌ Campaign.create error:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      const campaign = await apiClient.updateCampaign(id, data);
      console.log('✅ Campaign updated:', campaign.name || campaign.title);
      return campaign;
    } catch (error) {
      console.error('❌ Campaign.update error:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      await apiClient.deleteCampaign(id);
      console.log('✅ Campaign deleted:', id);
      return true;
    } catch (error) {
      console.error('❌ Campaign.delete error:', error);
      throw error;
    }
  }
};

export const Booking = {
  async list(params = {}) {
    try {
      const response = await apiClient.getBookings(params);
      const bookings = extractData(response);
      console.log(`✅ Bookings loaded from database: ${bookings.length}`);
      return bookings;
    } catch (error) {
      return handleApiError('Booking.list', error);
    }
  },

  async get(id) {
    try {
      const booking = await apiClient.getBooking(id);
      console.log(`✅ Booking loaded: ${booking.id}`);
      return booking;
    } catch (error) {
      console.error('❌ Booking.get error:', error);
      return null;
    }
  },

  async create(data) {
    try {
      const booking = await apiClient.createBooking(data);
      console.log('✅ Booking created:', booking.id);
      return booking;
    } catch (error) {
      console.error('❌ Booking.create error:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      const booking = await apiClient.updateBooking(id, data);
      console.log('✅ Booking updated:', booking.id);
      return booking;
    } catch (error) {
      console.error('❌ Booking.update error:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      await apiClient.deleteBooking(id);
      console.log('✅ Booking deleted:', id);
      return true;
    } catch (error) {
      console.error('❌ Booking.delete error:', error);
      throw error;
    }
  }
};

export const Message = {
  async list(params = {}) {
    try {
      const response = await apiClient.getMessages(params);
      const messages = extractData(response);
      console.log(`✅ Messages loaded from database: ${messages.length}`);
      return messages;
    } catch (error) {
      return handleApiError('Message.list', error);
    }
  },

  async get(id) {
    try {
      const message = await apiClient.getMessage(id);
      console.log(`✅ Message loaded: ${message.id}`);
      return message;
    } catch (error) {
      console.error('❌ Message.get error:', error);
      return null;
    }
  },

  async create(data) {
    try {
      const message = await apiClient.createMessage(data);
      console.log('✅ Message created:', message.id);
      return message;
    } catch (error) {
      console.error('❌ Message.create error:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      const message = await apiClient.updateMessage(id, data);
      console.log('✅ Message updated:', message.id);
      return message;
    } catch (error) {
      console.error('❌ Message.update error:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      await apiClient.deleteMessage(id);
      console.log('✅ Message deleted:', id);
      return true;
    } catch (error) {
      console.error('❌ Message.delete error:', error);
      throw error;
    }
  }
};

export const Invoice = {
  async list(params = {}) {
    try {
      const response = await apiClient.getInvoices(params);
      const invoices = extractData(response);
      console.log(`✅ Invoices loaded from database: ${invoices.length}`);
      return invoices;
    } catch (error) {
      return handleApiError('Invoice.list', error);
    }
  },

  async get(id) {
    try {
      const invoice = await apiClient.getInvoice(id);
      console.log(`✅ Invoice loaded: ${invoice.invoiceNumber}`);
      return invoice;
    } catch (error) {
      console.error('❌ Invoice.get error:', error);
      return null;
    }
  },

  async create(data) {
    try {
      const invoice = await apiClient.createInvoice(data);
      console.log('✅ Invoice created:', invoice.invoiceNumber);
      return invoice;
    } catch (error) {
      console.error('❌ Invoice.create error:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      const invoice = await apiClient.updateInvoice(id, data);
      console.log('✅ Invoice updated:', invoice.invoiceNumber);
      return invoice;
    } catch (error) {
      console.error('❌ Invoice.update error:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      await apiClient.deleteInvoice(id);
      console.log('✅ Invoice deleted:', id);
      return true;
    } catch (error) {
      console.error('❌ Invoice.delete error:', error);
      throw error;
    }
  }
};

// =======================================================
// ✅ ENHANCED CHAT SYSTEM (matches your actual database)
// =======================================================

export const Conversation = {
  async list(params = {}) {
    try {
      const response = await apiClient.getConversations(params);
      const conversations = extractData(response);
      console.log(`✅ Conversations loaded from database: ${conversations.length}`);
      return conversations;
    } catch (error) {
      return handleApiError('Conversation.list', error);
    }
  },

  async get(id) {
    try {
      const conversation = await apiClient.getConversation(id);
      console.log(`✅ Conversation loaded: ${conversation.name || conversation.id}`);
      return conversation;
    } catch (error) {
      console.error('❌ Conversation.get error:', error);
      return null;
    }
  },

  async create(data) {
    try {
      const conversation = await apiClient.createConversation(data);
      console.log('✅ Conversation created:', conversation.name || conversation.id);
      return conversation;
    } catch (error) {
      console.error('❌ Conversation.create error:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      const conversation = await apiClient.updateConversation(id, data);
      console.log('✅ Conversation updated:', conversation.id);
      return conversation;
    } catch (error) {
      console.error('❌ Conversation.update error:', error);
      throw error;
    }
  },

  async archive(id) {
    try {
      const result = await apiClient.archiveConversation(id);
      console.log('✅ Conversation archived:', id);
      return result;
    } catch (error) {
      console.error('❌ Conversation.archive error:', error);
      throw error;
    }
  }
};

export const ChatMessage = {
  async list(params = {}) {
    try {
      const response = await apiClient.getChatMessages(params);
      const messages = extractData(response);
      console.log(`✅ Chat messages loaded: ${messages.length}`);
      return messages;
    } catch (error) {
      return handleApiError('ChatMessage.list', error);
    }
  },

  async send(data) {
    try {
      const message = await apiClient.sendChatMessage(data);
      console.log('✅ Chat message sent:', message.id);
      return message;
    } catch (error) {
      console.error('❌ ChatMessage.send error:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      const message = await apiClient.updateChatMessage(id, data);
      console.log('✅ Chat message updated:', message.id);
      return message;
    } catch (error) {
      console.error('❌ ChatMessage.update error:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      await apiClient.deleteChatMessage(id);
      console.log('✅ Chat message deleted:', id);
      return true;
    } catch (error) {
      console.error('❌ ChatMessage.delete error:', error);
      throw error;
    }
  }
};

// =======================================================
// ✅ CREATIVES (matches your actual database)
// =======================================================

export const Creative = {
  async list(params = {}) {
    try {
      const response = await apiClient.getCreatives(params);
      const creatives = extractData(response);
      console.log(`✅ Creatives loaded from database: ${creatives.length}`);
      return creatives;
    } catch (error) {
      return handleApiError('Creative.list', error);
    }
  },

  async get(id) {
    try {
      const creative = await apiClient.getCreative(id);
      console.log(`✅ Creative loaded: ${creative.name || creative.id}`);
      return creative;
    } catch (error) {
      console.error('❌ Creative.get error:', error);
      return null;
    }
  },

  async create(data) {
    try {
      const creative = await apiClient.createCreative(data);
      console.log('✅ Creative created:', creative.name);
      return creative;
    } catch (error) {
      console.error('❌ Creative.create error:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      const creative = await apiClient.updateCreative(id, data);
      console.log('✅ Creative updated:', creative.name);
      return creative;
    } catch (error) {
      console.error('❌ Creative.update error:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      await apiClient.deleteCreative(id);
      console.log('✅ Creative deleted:', id);
      return true;
    } catch (error) {
      console.error('❌ Creative.delete error:', error);
      throw error;
    }
  },

  async getCampaignCreatives(campaignId) {
    try {
      const response = await apiClient.getCampaignCreatives(campaignId);
      const creatives = extractData(response);
      console.log(`✅ Campaign creatives loaded: ${creatives.length}`);
      return creatives;
    } catch (error) {
      return handleApiError('Creative.getCampaignCreatives', error);
    }
  }
};

// =======================================================
// ✅ PROPERTY APPROVALS (matches your actual database)
// =======================================================

export const PropertyApproval = {
  async list(params = {}) {
    try {
      const response = await apiClient.getPropertyApprovals(params);
      const approvals = extractData(response);
      console.log(`✅ Property approvals loaded from database: ${approvals.length}`);
      return approvals;
    } catch (error) {
      return handleApiError('PropertyApproval.list', error);
    }
  },

  async get(id) {
    try {
      const approval = await apiClient.getPropertyApproval(id);
      console.log(`✅ Property approval loaded: ${approval.id}`);
      return approval;
    } catch (error) {
      console.error('❌ PropertyApproval.get error:', error);
      return null;
    }
  },

  async create(data) {
    try {
      const approval = await apiClient.createPropertyApproval(data);
      console.log('✅ Property approval created:', approval.id);
      return approval;
    } catch (error) {
      console.error('❌ PropertyApproval.create error:', error);
      throw error;
    }
  },

  async approve(id, data = {}) {
    try {
      const approval = await apiClient.approveProperty(id, data);
      console.log('✅ Property approved:', approval.id);
      return approval;
    } catch (error) {
      console.error('❌ PropertyApproval.approve error:', error);
      throw error;
    }
  },

  async reject(id, data = {}) {
    try {
      const approval = await apiClient.rejectProperty(id, data);
      console.log('✅ Property rejected:', approval.id);
      return approval;
    } catch (error) {
      console.error('❌ PropertyApproval.reject error:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      const approval = await apiClient.updatePropertyApproval(id, data);
      console.log('✅ Property approval updated:', approval.id);
      return approval;
    } catch (error) {
      console.error('❌ PropertyApproval.update error:', error);
      throw error;
    }
  }
};

// =======================================================
// ✅ NOTIFICATIONS (NEW - fixes your 500 errors!)
// =======================================================

export const Notification = {
  async list(params = {}) {
    try {
      const response = await apiClient.getNotifications(params);
      const notifications = extractData(response);
      console.log(`✅ Notifications loaded from database: ${notifications.length}`);
      return notifications;
    } catch (error) {
      return handleApiError('Notification.list', error);
    }
  },

  async getUnread() {
    try {
      const response = await apiClient.getUnreadNotifications();
      const notifications = extractData(response);
      console.log(`✅ Unread notifications loaded: ${notifications.length}`);
      return notifications;
    } catch (error) {
      return handleApiError('Notification.getUnread', error);
    }
  },

  async getCount() {
    try {
      const response = await apiClient.getNotificationCount();
      console.log(`✅ Notification count loaded: ${response.count || 0}`);
      return response.count || 0;
    } catch (error) {
      console.error('❌ Notification.getCount error:', error);
      return 0;
    }
  },

  async markAsRead(id) {
    try {
      const result = await apiClient.markNotificationAsRead(id);
      console.log('✅ Notification marked as read:', id);
      return result;
    } catch (error) {
      console.error('❌ Notification.markAsRead error:', error);
      throw error;
    }
  },

  async markAllAsRead() {
    try {
      const result = await apiClient.markAllNotificationsAsRead();
      console.log('✅ All notifications marked as read');
      return result;
    } catch (error) {
      console.error('❌ Notification.markAllAsRead error:', error);
      throw error;
    }
  },

  async create(data) {
    try {
      const notification = await apiClient.createNotification(data);
      console.log('✅ Notification created:', notification.title);
      return notification;
    } catch (error) {
      console.error('❌ Notification.create error:', error);
      throw error;
    }
  }
};

// =======================================================
// ✅ PAYMENT SYSTEM (matches your actual database)  
// =======================================================

export const PaymentSettings = {
  async get() {
    try {
      const settings = await apiClient.getPaymentSettings();
      console.log('✅ Payment settings loaded');
      return settings;
    } catch (error) {
      console.error('❌ PaymentSettings.get error:', error);
      return null;
    }
  },

  async update(data) {
    try {
      const settings = await apiClient.updatePaymentSettings(data);
      console.log('✅ Payment settings updated');
      return settings;
    } catch (error) {
      console.error('❌ PaymentSettings.update error:', error);
      throw error;
    }
  }
};

export const PaymentReminder = {
  async list(params = {}) {
    try {
      const response = await apiClient.getPaymentReminders(params);
      const reminders = extractData(response);
      console.log(`✅ Payment reminders loaded from database: ${reminders.length}`);
      return reminders;
    } catch (error) {
      return handleApiError('PaymentReminder.list', error);
    }
  },

  async create(data) {
    try {
      const reminder = await apiClient.createPaymentReminder(data);
      console.log('✅ Payment reminder created:', reminder.id);
      return reminder;
    } catch (error) {
      console.error('❌ PaymentReminder.create error:', error);
      throw error;
    }
  }
};

// =======================================================
// ✅ UTILITY FUNCTIONS
// =======================================================

export const Search = {
  async query(searchTerm, type = 'all') {
    try {
      const response = await apiClient.search(searchTerm, type);
      const results = extractData(response);
      console.log(`✅ Search results loaded: ${results.length} items`);
      return results;
    } catch (error) {
      return handleApiError('Search.query', error);
    }
  }
};

export const Upload = {
  async file(file, type = 'general') {
    try {
      const response = await apiClient.uploadFile(file, type);
      console.log('✅ File uploaded:', response.filename);
      return response;
    } catch (error) {
      console.error('❌ Upload.file error:', error);
      throw error;
    }
  }
};

export const HealthCheck = {
  async status() {
    try {
      const status = await apiClient.healthCheck();
      console.log('✅ API health check passed');
      return status;
    } catch (error) {
      console.error('❌ API health check failed:', error);
      return { status: 'ERROR', error: error.message };
    }
  }
};

console.log('✅ All entities loaded successfully - ready for your actual database structure');