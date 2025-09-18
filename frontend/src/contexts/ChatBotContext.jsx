import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Property, Space, Booking, Campaign, Invoice, Message } from '@/api/entities';
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

 const isMountedRef = useRef(true);
 const loadingTimeoutRef = useRef(null);
 const abortControllerRef = useRef(null);

 // ✅ RATE LIMITING: Track component mount/unmount for React dev mode
 useEffect(() => {
 isMountedRef.current = true;
 console.log('🔄 CHATBOT CONTEXT: Component mounted (dev mode may cause double mount)');
 
 return () => {
 isMountedRef.current = false;
 
 // Cancel any pending requests
 if (abortControllerRef.current) {
 abortControllerRef.current.abort();
 console.log('🔄 CHATBOT CONTEXT: Aborted pending requests on unmount');
 }
 
 // Clear loading timeout
 if (loadingTimeoutRef.current) {
 clearTimeout(loadingTimeoutRef.current);
 }
 
 console.log('🔄 CHATBOT CONTEXT: Component unmounted and cleaned up');
 };
 }, []);

 // ✅ RATE LIMITING: Update page context when location changes
 const updatePageContextCallback = useCallback(() => {
 if (!isMountedRef.current) return;
 updatePageContext();
 }, [location.pathname]);

 useEffect(() => {
 updatePageContextCallback();
 }, [updatePageContextCallback]);

 // ✅ RATE LIMITING: Lazy data loading - only when user is signed in and component is mounted
 useEffect(() => {
 if (!isMountedRef.current) {
 console.log('🔄 CHATBOT CONTEXT: Skipping data load - component unmounted');
 return;
 }
 
 if (isLoaded && isSignedIn) {
 console.log('🔄 CHATBOT CONTEXT: User signed in, starting lazy data load');
 
 // Delay initial load to avoid React dev mode double-mounting issues
 loadingTimeoutRef.current = setTimeout(() => {
 if (isMountedRef.current) {
 loadDataLazily();
 }
 }, 100);
 } else {
 console.log('🔄 CHATBOT CONTEXT: User not ready, clearing data');
 if (isMountedRef.current) {
 setGlobalContext(prev => ({
 ...prev,
 isLoading: false,
 lastUpdated: new Date()
 }));
 }
 }
 
 return () => {
 if (loadingTimeoutRef.current) {
 clearTimeout(loadingTimeoutRef.current);
 }
 };
 }, [isLoaded, isSignedIn]);

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

 // ✅ RATE LIMITING: Lazy data loading with prioritization and stale-while-revalidate
 const loadDataLazily = useCallback(async () => {
 if (!isMountedRef.current || !isSignedIn) {
 console.log('🔄 CHATBOT CONTEXT: Skipping lazy load - not ready');
 return;
 }

 console.log('🔄 CHATBOT CONTEXT: Starting lazy data loading...');
 const startTime = Date.now();
 
 // Create abort controller for this load operation
 if (abortControllerRef.current) {
 abortControllerRef.current.abort();
 }
 abortControllerRef.current = new AbortController();
 
 if (isMountedRef.current) {
 setGlobalContext(prev => ({ ...prev, isLoading: true }));
 }
 
 try {
 // ✅ RATE LIMITING: Load critical data first (staggered loading)
 console.log('🔄 CHATBOT CONTEXT: Phase 1 - Loading critical data (properties, campaigns)');
 const criticalStartTime = Date.now();
 
 const [properties, campaigns] = await Promise.all([
 Property.list().catch(err => {
 console.warn('Failed to load properties:', err.message);
 return [];
 }),
 Campaign.list().catch(err => {
 console.warn('Failed to load campaigns:', err.message);
 return [];
 })
 ]);
 
 const criticalDuration = Date.now() - criticalStartTime;
 console.log(`🔄 CHATBOT CONTEXT: Phase 1 complete in ${criticalDuration}ms`);
 
 // Update with critical data first
 if (isMountedRef.current) {
 setGlobalContext(prev => ({
 ...prev,
 properties,
 campaigns,
 lastUpdated: new Date()
 }));
 }
 
 // ✅ RATE LIMITING: Load secondary data (delayed to reduce initial load)
 console.log('🔄 CHATBOT CONTEXT: Phase 2 - Loading secondary data (spaces, messages)');
 const secondaryStartTime = Date.now();
 
 const [areas, messages] = await Promise.all([
 Space.list().catch(err => {
 console.warn('Failed to load spaces:', err.message);
 return [];
 }),
 Message.list().catch(err => {
 console.warn('Failed to load messages:', err.message);
 return [];
 })
 ]);
 
 const secondaryDuration = Date.now() - secondaryStartTime;
 console.log(`🔄 CHATBOT CONTEXT: Phase 2 complete in ${secondaryDuration}ms`);
 
 // Update with secondary data
 if (isMountedRef.current) {
 setGlobalContext(prev => ({
 ...prev,
 areas,
 messages
 }));
 }
 
 // ✅ RATE LIMITING: Load tertiary data (least critical)
 console.log('🔄 CHATBOT CONTEXT: Phase 3 - Loading tertiary data (invoices, bookings)');
 const tertiaryStartTime = Date.now();
 
 const [invoices, bookings] = await Promise.all([
 Invoice.list().catch(err => {
 console.warn('Failed to load invoices:', err.message);
 return [];
 }),
 Booking.list().catch(err => {
 console.warn('Failed to load bookings:', err.message);
 return [];
 })
 ]);
 
 const tertiaryDuration = Date.now() - tertiaryStartTime;
 const totalDuration = Date.now() - startTime;
 console.log(`🔄 CHATBOT CONTEXT: Phase 3 complete in ${tertiaryDuration}ms (total: ${totalDuration}ms)`);
 
 // Final update with all data
 if (isMountedRef.current) {
 setGlobalContext(prev => ({
 ...prev,
 user: null, // Will be handled by Clerk context
 invoices,
 bookings,
 lastUpdated: new Date(),
 isLoading: false
 }));
 }
 
 console.log(`🔄 CHATBOT CONTEXT: Lazy loading complete in ${totalDuration}ms`);
 
 } catch (error) {
 const errorDuration = Date.now() - startTime;
 console.error(`🔄 CHATBOT CONTEXT: Lazy loading failed after ${errorDuration}ms:`, error);
 
 if (isMountedRef.current) {
 setGlobalContext(prev => ({ 
 ...prev, 
 isLoading: false,
 lastUpdated: new Date()
 }));
 }
 } finally {
 // Clear the abort controller
 if (abortControllerRef.current) {
 abortControllerRef.current = null;
 }
 }
 }, [isSignedIn]);

 const refreshData = useCallback(async (dataType = 'all') => {
 if (!isMountedRef.current || !isSignedIn) {
 console.log('🔄 CHATBOT CONTEXT: Cannot refresh data - component unmounted or user not signed in');
 return;
 }

 if (dataType === 'all') {
 console.log('🔄 CHATBOT CONTEXT: Refreshing all data...');
 return loadDataLazily();
 }
 
 console.log(`🔄 CHATBOT CONTEXT: Refreshing ${dataType} data...`);
 const startTime = Date.now();

 try {
 let newData;
 switch (dataType) {
 case 'properties':
 newData = await Property.list();
 if (isMountedRef.current) {
 setGlobalContext(prev => ({ ...prev, properties: newData }));
 }
 break;
 case 'campaigns':
 newData = await Campaign.list();
 if (isMountedRef.current) {
 setGlobalContext(prev => ({ ...prev, campaigns: newData }));
 }
 break;
 case 'messages':
 newData = await Message.list();
 if (isMountedRef.current) {
 setGlobalContext(prev => ({ ...prev, messages: newData }));
 }
 break;
 case 'invoices':
 newData = await Invoice.list();
 if (isMountedRef.current) {
 setGlobalContext(prev => ({ ...prev, invoices: newData }));
 }
 break;
 case 'bookings':
 newData = await Booking.list();
 if (isMountedRef.current) {
 setGlobalContext(prev => ({ ...prev, bookings: newData }));
 }
 break;
 }
 
 const refreshDuration = Date.now() - startTime;
 console.log(`🔄 CHATBOT CONTEXT: Refreshed ${dataType} in ${refreshDuration}ms`);
 
 } catch (error) {
 const errorDuration = Date.now() - startTime;
 console.error(`🔄 CHATBOT CONTEXT: Failed to refresh ${dataType} after ${errorDuration}ms:`, error);
 }
 }, [isSignedIn, loadDataLazily]);

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
 
 if (!top || propertyRevenue> (top.revenue || 0)) {
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
 .filter(b => new Date(b.created_at)> new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
 .slice(0, 5);
 
 // Recent messages
 const recentMessages = globalContext.messages
 .filter(m => new Date(m.created_at)> new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
 .slice(0, 5);
 
 return {
 bookings: recentBookings,
 messages: recentMessages,
 total: recentBookings.length + recentMessages.length
 };
 };

 const getUpcomingBookings = () => {
 const upcoming = globalContext.bookings
 .filter(b => new Date(b.start_date)> new Date())
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
 (searchQuery === 'recent' && new Date(m.created_at)> new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
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