import React, { createContext, useContext, useState, useEffect } from 'react';
import { Property, AdvertisingArea, Booking, Campaign, Invoice, Message } from '@/api/entities';
import { useLocation } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';

const ChatBotContext = createContext(null);

export const useChatBotContext = () => {
  const context = useContext(ChatBotContext);
  if (!context) {
    throw new Error('useChatBotContext must be used within a ChatBotProvider');
  }
  return context;
};

export const ChatBotProvider = ({ children }) => {
  const [globalContext, setGlobalContext] = useState({
    user: null,
    properties: [],
    campaigns: [],
    areas: [],
    messages: [],
    invoices: [],
    bookings: [],
    currentPage: null,
    pageData: null,
    lastUpdated: null,
    isLoading: false
  });

  const location = useLocation();
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  // ✅ FIXED: Update page context when location changes
  useEffect(() => {
    updatePageContext();
  }, [location.pathname]); // ✅ FIXED: Added proper dependency array

  // ✅ FIXED: Initial data load - only when user is signed in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadAllData();
    }
  }, [isLoaded, isSignedIn]); // ✅ FIXED: Added proper dependency array

  const updatePageContext = () => {
    const pathname = location.pathname;
    const page = pathname.split('/').pop() || 'Dashboard';
    
    const pageContexts = {
      '': { name: 'Dashboard', type: 'dashboard' },
      'browse': { name: 'Browse', type: 'map' }, // ✅ ADDED: browse page context
      'map': { name: 'Map', type: 'map' },
      'search': { name: 'Search', type: 'search' }, // ✅ ADDED: search page context
      'messages': { name: 'Messages', type: 'communication' },
      'invoices': { name: 'Invoices', type: 'financial' },
      'profile': { name: 'Profile', type: 'account' },
      'create-property': { name: 'Create Property', type: 'form' },
      'create-campaign': { name: 'Create Campaign', type: 'form' },
      'admin': { name: 'Admin', type: 'administration' },
      'property-management': { name: 'Property Management', type: 'management' },
      'booking-management': { name: 'Booking Management', type: 'management' },
      'help': { name: 'Help', type: 'support' }
    };

    const currentPage = pageContexts[page] || { name: page, type: 'general' };
    
    setGlobalContext(prev => ({
      ...prev,
      currentPage,
      pageData: extractPageSpecificData(currentPage.type)
    }));
  };

  const extractPageSpecificData = (pageType) => {
    switch (pageType) {
      case 'dashboard':
        return {
          recentActivity: globalContext.bookings.slice(0, 5),
          activeProperties: globalContext.properties.filter(p => p.status === 'active'),
          pendingInvoices: globalContext.invoices.filter(i => i.status === 'pending'),
          unreadMessages: globalContext.messages.filter(m => !m.read)
        };
      case 'map':
        return {
          availableProperties: globalContext.properties.filter(p => p.availability_status === 'available'),
          areas: globalContext.areas,
          userLocation: null // Will be updated by geolocation
        };
      case 'search': // ✅ ADDED: search page data extraction
        return {
          properties: globalContext.properties,
          campaigns: globalContext.campaigns,
          areas: globalContext.areas,
          totalItems: globalContext.properties.length + globalContext.campaigns.length + globalContext.areas.length
        };
      case 'financial':
        return {
          invoices: globalContext.invoices,
          totalRevenue: globalContext.invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0),
          pendingPayments: globalContext.invoices.filter(i => i.status === 'pending')
        };
      case 'communication':
        return {
          conversations: globalContext.messages,
          unreadCount: globalContext.messages.filter(m => !m.read).length,
          contacts: [...new Set(globalContext.messages.map(m => m.sender_id))]
        };
      default:
        return {};
    }
  };

  const loadAllData = async () => {
    setGlobalContext(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Only load data if user is signed in
      if (!isSignedIn) {
        setGlobalContext(prev => ({ 
          ...prev, 
          isLoading: false,
          lastUpdated: new Date()
        }));
        return;
      }

      const [
        properties,
        campaigns,
        areas,
        messages,
        invoices,
        bookings
      ] = await Promise.all([
        Property.list().catch(() => []),
        Campaign.list().catch(() => []),
        AdvertisingArea.list().catch(() => []),
        Message.list().catch(() => []),
        Invoice.list().catch(() => []),
        Booking.list().catch(() => [])
      ]);

      setGlobalContext(prev => ({
        ...prev,
        user: null, // Will be handled by Clerk context
        properties,
        campaigns,
        areas,
        messages,
        invoices,
        bookings,
        lastUpdated: new Date(),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error loading global context:', error);
      setGlobalContext(prev => ({ ...prev, isLoading: false }));
    }
  };

  const refreshData = async (dataType = 'all') => {
    if (!isSignedIn) {
      console.log('Cannot refresh data: User not signed in');
      return;
    }

    if (dataType === 'all') {
      return loadAllData();
    }

    try {
      let newData;
      switch (dataType) {
        case 'properties':
          newData = await Property.list();
          setGlobalContext(prev => ({ ...prev, properties: newData }));
          break;
        case 'campaigns':
          newData = await Campaign.list();
          setGlobalContext(prev => ({ ...prev, campaigns: newData }));
          break;
        case 'messages':
          newData = await Message.list();
          setGlobalContext(prev => ({ ...prev, messages: newData }));
          break;
        case 'invoices':
          newData = await Invoice.list();
          setGlobalContext(prev => ({ ...prev, invoices: newData }));
          break;
        case 'bookings':
          newData = await Booking.list();
          setGlobalContext(prev => ({ ...prev, bookings: newData }));
          break;
      }
    } catch (error) {
      console.error(`Error refreshing ${dataType}:`, error);
    }
  };

  const getContextSummary = () => {
    const summary = {
      totalProperties: globalContext.properties.length,
      activeProperties: globalContext.properties.filter(p => p.status === 'active').length,
      totalCampaigns: globalContext.campaigns.length,
      activeCampaigns: globalContext.campaigns.filter(c => c.status === 'active').length,
      totalAreas: globalContext.areas.length,
      unreadMessages: globalContext.messages.filter(m => !m.read).length,
      pendingInvoices: globalContext.invoices.filter(i => i.status === 'pending').length,
      totalRevenue: globalContext.invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0),
      currentPage: globalContext.currentPage?.name || 'Unknown',
      lastUpdated: globalContext.lastUpdated,
      // Additional insights
      topPerformingProperty: getTopPerformingProperty(),
      recentActivity: getRecentActivity(),
      upcomingBookings: getUpcomingBookings(),
      financialSummary: getFinancialSummary()
    };
    
    return summary;
  };

  const getTopPerformingProperty = () => {
    if (!globalContext.properties.length) return null;
    
    // Sort by revenue or booking count (mock calculation)
    const topProperty = globalContext.properties.reduce((top, property) => {
      const propertyBookings = globalContext.bookings.filter(b => b.property_id === property.id);
      const propertyRevenue = propertyBookings.reduce((sum, booking) => sum + (booking.amount || 0), 0);
      
      if (!top || propertyRevenue > (top.revenue || 0)) {
        return { ...property, revenue: propertyRevenue, bookingCount: propertyBookings.length };
      }
      return top;
    }, null);
    
    return topProperty;
  };

  const getRecentActivity = () => {
    const activities = [];
    
    // Recent bookings
    const recentBookings = globalContext.bookings
      .filter(b => new Date(b.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .slice(0, 5);
    
    // Recent messages
    const recentMessages = globalContext.messages
      .filter(m => new Date(m.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .slice(0, 5);
    
    return {
      bookings: recentBookings,
      messages: recentMessages,
      total: recentBookings.length + recentMessages.length
    };
  };

  const getUpcomingBookings = () => {
    const upcoming = globalContext.bookings
      .filter(b => new Date(b.start_date) > new Date())
      .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
      .slice(0, 3);
    
    return upcoming;
  };

  const getFinancialSummary = () => {
    const invoices = globalContext.invoices;
    const paid = invoices.filter(i => i.status === 'paid');
    const pending = invoices.filter(i => i.status === 'pending');
    const overdue = invoices.filter(i => i.status === 'overdue');
    
    return {
      totalPaid: paid.reduce((sum, inv) => sum + (inv.amount || 0), 0),
      totalPending: pending.reduce((sum, inv) => sum + (inv.amount || 0), 0),
      totalOverdue: overdue.reduce((sum, inv) => sum + (inv.amount || 0), 0),
      paidCount: paid.length,
      pendingCount: pending.length,
      overdueCount: overdue.length
    };
  };

  const searchContent = (query, type = 'all') => {
    const searchQuery = query.toLowerCase();
    const results = {
      properties: [],
      campaigns: [],
      areas: [],
      messages: [],
      invoices: [],
      total: 0
    };

    if (type === 'all' || type === 'properties') {
      results.properties = globalContext.properties.filter(p =>
        p.name?.toLowerCase().includes(searchQuery) ||
        p.description?.toLowerCase().includes(searchQuery) ||
        p.location?.address?.toLowerCase().includes(searchQuery) ||
        p.type?.toLowerCase().includes(searchQuery) ||
        p.status?.toLowerCase().includes(searchQuery)
      );
    }

    if (type === 'all' || type === 'campaigns') {
      results.campaigns = globalContext.campaigns.filter(c =>
        c.name?.toLowerCase().includes(searchQuery) ||
        c.description?.toLowerCase().includes(searchQuery) ||
        c.status?.toLowerCase().includes(searchQuery) ||
        c.budget?.toString().includes(searchQuery)
      );
    }

    if (type === 'all' || type === 'areas') {
      results.areas = globalContext.areas.filter(a =>
        a.title?.toLowerCase().includes(searchQuery) ||
        a.description?.toLowerCase().includes(searchQuery) ||
        a.location?.toLowerCase().includes(searchQuery) ||
        a.type?.toLowerCase().includes(searchQuery)
      );
    }

    if (type === 'all' || type === 'messages') {
      results.messages = globalContext.messages.filter(m =>
        m.content?.toLowerCase().includes(searchQuery) ||
        m.subject?.toLowerCase().includes(searchQuery) ||
        m.sender_name?.toLowerCase().includes(searchQuery) ||
        (searchQuery === 'unread' && !m.read) ||
        (searchQuery === 'recent' && new Date(m.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      );
    }

    if (type === 'all' || type === 'invoices') {
      results.invoices = globalContext.invoices.filter(i =>
        i.description?.toLowerCase().includes(searchQuery) ||
        i.invoice_number?.toLowerCase().includes(searchQuery) ||
        i.status?.toLowerCase().includes(searchQuery) ||
        i.amount?.toString().includes(searchQuery) ||
        (searchQuery === 'pending' && i.status === 'pending') ||
        (searchQuery === 'overdue' && i.status === 'overdue')
      );
    }

    // Calculate total results
    results.total = results.properties.length + results.campaigns.length + 
                   results.areas.length + results.messages.length + results.invoices.length;

    return results;
  };

  const getSmartSuggestions = (query) => {
    const suggestions = [];
    const lowerQuery = query.toLowerCase();
    
    // Smart suggestions based on data
    if (lowerQuery.includes('property') || lowerQuery.includes('space')) {
      suggestions.push('Show me available properties');
      suggestions.push('Find properties by location');
    }
    
    if (lowerQuery.includes('campaign') || lowerQuery.includes('advertis')) {
      suggestions.push('Show active campaigns');
      suggestions.push('Create new campaign');
    }
    
    if (lowerQuery.includes('revenue') || lowerQuery.includes('money') || lowerQuery.includes('financial')) {
      suggestions.push('Show financial summary');
      suggestions.push('View pending invoices');
    }
    
    if (lowerQuery.includes('message') || lowerQuery.includes('communication')) {
      suggestions.push('Check unread messages');
      suggestions.push('View recent conversations');
    }
    
    return suggestions;
  };

  const contextValue = {
    globalContext,
    refreshData,
    getContextSummary,
    searchContent,
    getSmartSuggestions,
    updatePageContext,
    getTopPerformingProperty,
    getRecentActivity,
    getUpcomingBookings,
    getFinancialSummary,
    isSignedIn,
    isLoaded
  };

  return (
    <ChatBotContext.Provider value={contextValue}>
      {children}
    </ChatBotContext.Provider>
  );
};