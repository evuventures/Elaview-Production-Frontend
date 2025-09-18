// Space Owner Dashboard - REAL DATA VERSION WITH FIXED PRICING AND USER FILTERING
// ✅ REAL DATA: Fetches actual data from your backend API
// ✅ SPACES FIRST: Spaces tab is now default and first in order
// ✅ ERROR HANDLING: Proper error states and fallbacks
// ✅ LOADING STATES: Real loading indicators
// ✅ AUTO REFRESH: Refreshes data when returning from space creation
// ✅ FIXED PRICING: Shows correct rate period (per day/week/month)
// ✅ USER FILTERING: Only shows current user's spaces and bookings

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import {
 Plus, Building2, Calendar, Package, Camera,
 DollarSign, Clock, CheckCircle, AlertCircle,
 Eye, Upload, ChevronRight, MapPin, FileText,
 Download, Truck, Navigation, Star, TrendingUp, X,
 BarChart3, Activity, ArrowUp, ArrowDown, Loader2, RefreshCw,
 Edit2, Trash2
} from 'lucide-react';

// ✅ REAL DATA: Import your actual API client
import apiClient from '../../../api/apiClient.js';

// ✅ GLASSMORPHISM: Enhanced Z-Index Scale for glass layering
const Z_INDEX = {
 BACKGROUND: 1,
 GLASS_CONTAINERS: 10,
 GLASS_OVERLAYS: 15,
 CONTENT: 20,
 MODAL_BACKDROP: 50,
 MODAL_CONTENT: 55,
 DROPDOWN: 60,
 TOAST: 70
};

// ✅ EDGE-TO-EDGE: Navigation heights for native mobile experience
const NAVIGATION_HEIGHTS = {
 DESKTOP: 64, // h-16 = 64px from navbar
 MOBILE_TOP: 64, // h-16 = 64px from mobile navbar 
 MOBILE_BOTTOM: 80 // Estimated mobile bottom nav height
};

// ✅ EDGE-TO-EDGE: Desktop keeps padding, mobile goes edge-to-edge
const CONTAINER_PADDING = {
 DESKTOP: 24, // Desktop maintains spacing for premium look
 MOBILE: 0 // Mobile goes edge-to-edge for native feel
};

// ✅ EDGE-TO-EDGE: Calculate CSS values for native mobile experience
const CSS_VALUES = {
 DESKTOP_TOTAL_PADDING: NAVIGATION_HEIGHTS.DESKTOP + (CONTAINER_PADDING.DESKTOP * 2),
 MOBILE_TOTAL_PADDING: NAVIGATION_HEIGHTS.MOBILE_TOP + NAVIGATION_HEIGHTS.MOBILE_BOTTOM + (CONTAINER_PADDING.MOBILE * 2),
 DESKTOP_TOP_PADDING: NAVIGATION_HEIGHTS.DESKTOP + CONTAINER_PADDING.DESKTOP,
 MOBILE_TOP_PADDING: NAVIGATION_HEIGHTS.MOBILE_TOP + CONTAINER_PADDING.MOBILE,
 MOBILE_BOTTOM_PADDING: NAVIGATION_HEIGHTS.MOBILE_BOTTOM + CONTAINER_PADDING.MOBILE
};

// ✅ GLASSMORPHISM: Enhanced Loading Component

// ✅ REAL DATA: Updated Types to match your actual API responses
interface DashboardStats {
 totalRevenue: number;
 activeListings: number;
 pendingInstalls: number;
 completedBookings: number;
 totalBookings?: number;
}

interface Space {
 id: string;
 name: string;
 title?: string;
 type?: string;
 spaceType?: string;
 dimensions?: any;
 baseRate?: number;
 pricing?: any;
 ratePeriod?: string; // ✅ FIXED: Added ratePeriod field
 rateType?: string; // ✅ FIXED: Added rateType alternative
 status: string;
 isActive?: boolean;
 currency?: string;
 city?: string;
 country?: string;
 features?: any;
 images?: any;
 createdAt?: string;
 property?: {
 id: string;
 title: string;
 city: string;
 };
}

interface Booking {
 id: string;
 bookerId: string;
 booker?: {
 firstName?: string;
 lastName?: string;
 businessName?: string;
 };
 users?: {
 firstName?: string;
 lastName?: string;
 businessName?: string;
 };
 advertiserName?: string;
 spaceName?: string;
 space?: Space;
 property?: {
 title: string;
 };
 startDate: string;
 endDate: string;
 totalAmount: number;
 status: string;
 currency?: string;
 createdAt?: string;
}

interface RecentActivity {
 id: string;
 type: string;
 title: string;
 description: string;
 timestamp: string;
 priority: 'high' | 'normal';
 isRead: boolean;
}

export default function SpaceOwnerDashboardMVP() {
 const navigate = useNavigate();
 const { user } = useUser();
 const [searchParams] = useSearchParams();
 
 // ✅ SPACES FIRST: Changed default tab to 'spaces'
 const [activeTab, setActiveTab] = useState('spaces');
 const [isLoading, setIsLoading] = useState(true);
 const [isRefreshing, setIsRefreshing] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [showSuccessMessage, setShowSuccessMessage] = useState(false);
 
 // ✅ REAL DATA: States for actual API data
 const [stats, setStats] = useState<DashboardStats>({
 totalRevenue: 0,
 activeListings: 0,
 pendingInstalls: 0,
 completedBookings: 0,
 totalBookings: 0
 });
 
 const [spaces, setSpaces] = useState<Space[]>([]);
 const [bookings, setBookings] = useState<Booking[]>([]);
 const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
 const [lastUpdated, setLastUpdated] = useState<string>('');
 const [deletingSpaceId, setDeletingSpaceId] = useState<string | null>(null);
 const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

 // ✅ FIXED PRICING: Helper function to get rate period display text
 const getRatePeriodLabel = (period?: string) => {
 if (!period) return 'per month'; // Default fallback
 
 const labels = {
 DAILY: 'per day',
 WEEKLY: 'per week', 
 MONTHLY: 'per month',
 // Handle legacy/alternative formats
 daily: 'per day',
 weekly: 'per week',
 monthly: 'per month',
 DAY: 'per day',
 WEEK: 'per week',
 MONTH: 'per month'
 };
 return labels[period] || 'per month'; // fallback to 'per month'
 };

 // ✅ SPACE MANAGEMENT: Edit and delete functions
 const handleEditSpace = (spaceId: string) => {
 console.log('🔧 Editing space:', spaceId);
 navigate(`/spaces/${spaceId}/edit`);
 };

 const handleDeleteSpace = async (spaceId: string) => {
 console.log('🗑️ Deleting space:', spaceId);
 setDeletingSpaceId(spaceId);
 setError(null);
 
 try {
 const response = await apiClient.deleteSpace(spaceId);
 
 if (response.success) {
 console.log('✅ Space deleted successfully');
 // Remove space from local state
 setSpaces(prev => prev.filter(space => space.id !== spaceId));
 // Update stats
 setStats(prev => ({
 ...prev,
 activeListings: Math.max(0, prev.activeListings - 1)
 }));
 setShowDeleteConfirm(null);
 } else {
 console.error('❌ Failed to delete space:', response.error);
 setError(response.error || 'Failed to delete space');
 }
 } catch (error: any) {
 console.error('❌ Delete space error:', error);
 setError('Failed to delete space. Please try again.');
 } finally {
 setDeletingSpaceId(null);
 }
 };

 const confirmDeleteSpace = (spaceId: string, spaceName: string) => {
 setShowDeleteConfirm(spaceId);
 };

 const cancelDelete = () => {
 setShowDeleteConfirm(null);
 };

 // ✅ SPACE CREATION: Check for space creation success
 useEffect(() => {
 const created = searchParams.get('created');
 const tab = searchParams.get('tab');
 
 if (created === 'true') {
 console.log('🎉 Space creation detected - showing success and refreshing data');
 setShowSuccessMessage(true);
 setTimeout(() => setShowSuccessMessage(false), 5000);
 
 if (tab) {
 setActiveTab(tab);
 }
 // Force refresh data
 fetchAllData(true);
 
 // Clear URL params after processing
 navigate('/dashboard', { replace: true });
 }
 }, [searchParams, navigate]);

 // ✅ UTILITY: Format timestamp
 const formatTimestamp = (timestamp: string | undefined): string => {
 if (!timestamp) return 'Recently';
 
 const date = new Date(timestamp);
 const now = new Date();
 const diffMs = now.getTime() - date.getTime();
 const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
 const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
 
 if (diffHours < 1) return 'Just now';
 if (diffHours < 24) return `${diffHours}h ago`;
 if (diffDays < 7) return `${diffDays}d ago`;
 
 return date.toLocaleDateString();
 };

 // ✅ UTILITY: Get booker name
 const getBookerName = (booking: Booking): string => {
 if (booking.advertiserName) return booking.advertiserName;
 if (booking.booker?.businessName) return booking.booker.businessName;
 if (booking.users?.businessName) return booking.users.businessName;
 if (booking.booker?.firstName && booking.booker?.lastName) {
 return `${booking.booker.firstName} ${booking.booker.lastName}`;
 }
 if (booking.users?.firstName && booking.users?.lastName) {
 return `${booking.users.firstName} ${booking.users.lastName}`;
 }
 return 'Advertiser';
 };

 // ✅ UTILITY: Get space name
 const getSpaceName = (booking: Booking): string => {
 if (booking.spaceName) return booking.spaceName;
 if (booking.space?.name) return booking.space.name;
 if (booking.space?.title) return booking.space.title;
 if (booking.property?.title) return booking.property.title;
 return 'Advertising Space';
 };

 // ✅ REAL DATA: Fetch recent activity (messages/notifications)
 const fetchRecentActivity = async () => {
 try {
 console.log('📊 Fetching recent activity...');
 
 // Try to get notifications first
 const notificationsResponse = await apiClient.getNotifications({ limit: 5 });
 
 if (notificationsResponse.success && notificationsResponse.data?.notifications) {
 const activities = notificationsResponse.data.notifications.map((notif: any) => ({
 id: notif.id,
 type: notif.type || 'notification',
 title: notif.title,
 description: notif.message,
 timestamp: formatTimestamp(notif.created_at),
 priority: notif.type === 'urgent' ? 'high' : 'normal',
 isRead: notif.is_read
 }));
 
 setRecentActivity(activities);
 console.log('✅ Recent activity loaded:', activities.length, 'items');
 } else {
 // Fallback: create activity from recent bookings
 const recentBookings = bookings.slice(0, 3);
 const activities = recentBookings.map((booking, index) => ({
 id: `booking-${booking.id}`,
 type: 'booking',
 title: 'Booking Update',
 description: `New booking from ${getBookerName(booking)} is ${booking.status.toLowerCase()}`,
 timestamp: formatTimestamp(booking.createdAt || new Date().toISOString()),
 priority: 'normal' as const,
 isRead: true
 }));
 
 setRecentActivity(activities);
 console.log('✅ Recent activity (fallback) loaded:', activities.length, 'items');
 }
 } catch (error) {
 console.error('❌ Recent activity fetch error:', error);
 setRecentActivity([]);
 }
 };

 // ✅ FIXED: Fetch all data - now properly filtered by user
 const fetchAllData = async (force = false) => {
 if (force) {
 setIsRefreshing(true);
 } else {
 setIsLoading(true);
 }
 
 setError(null);
 
 try {
 console.log('🔄 Fetching all space owner dashboard data...');
 
 // ✅ FIXED: Use dashboard endpoint for ALL data to ensure user filtering
 const dashboardResponse = await apiClient.getSpaceOwnerDashboard();
 
 if (dashboardResponse.success && dashboardResponse.data) {
 // Set stats
 const { stats: apiStats } = dashboardResponse.data;
 setStats({
 totalRevenue: apiStats.totalRevenue || 0,
 activeListings: apiStats.activeListings || 0,
 pendingInstalls: apiStats.pendingInstalls || 0,
 completedBookings: apiStats.completedBookings || 0,
 totalBookings: apiStats.totalBookings || 0
 });
 
 // Set spaces (already filtered by user)
 const userSpaces = dashboardResponse.data.spaces || dashboardResponse.data.listings || [];
 setSpaces(userSpaces.map(space => ({
 ...space,
 ratePeriod: space.ratePeriod || space.rateType || 'MONTHLY'
 })));
 
 // Set bookings (already filtered by user)
 setBookings(dashboardResponse.data.bookings || []);
 
 console.log('✅ Dashboard data loaded:', {
 spaces: userSpaces.length,
 bookings: (dashboardResponse.data.bookings || []).length,
 stats: apiStats
 });
 }
 
 // Fetch activity separately
 await fetchRecentActivity();
 
 setLastUpdated(new Date().toISOString());
 console.log('✅ All space owner dashboard data loaded successfully');
 
 } catch (error) {
 console.error('❌ Error fetching space owner dashboard data:', error);
 setError('Failed to load dashboard data. Please try again.');
 } finally {
 setIsLoading(false);
 setIsRefreshing(false);
 }
 };

 // ✅ REAL DATA: Initial data load
 useEffect(() => {
 if (user?.id) {
 console.log('🎯 User authenticated, loading space owner dashboard data...');
 fetchAllData();
 }
 }, [user?.id]);

 // ✅ REFRESH: Manual refresh function
 const handleRefresh = () => {
 console.log('🔄 Manual refresh triggered');
 fetchAllData(true);
 };

 // ✅ REAL DATA: Format currency
 const formatCurrency = (amount: number | undefined, currency = 'USD'): string => {
 if (amount === undefined || amount === null) return '$0';
 
 const symbols: { [key: string]: string } = {
 USD: '$', EUR: '€', GBP: '£', CAD: 'C$', AUD: 'A$'
 };
 
 const symbol = symbols[currency] || '$';
 return `${symbol}${amount.toLocaleString()}`;
 };

 // ✅ REAL DATA: Get space status color
 const getStatusColor = (status: string, isActive?: boolean) => {
 if (!isActive) {
 return 'bg-gray-100 text-gray-700';
 }
 
 const statusLower = status.toLowerCase();
 
 if (['active', 'approved', 'published'].includes(statusLower)) {
 return 'bg-emerald-100 text-emerald-700';
 }
 if (['pending', 'draft', 'under_review'].includes(statusLower)) {
 return 'bg-yellow-100 text-yellow-700';
 }
 if (['rejected', 'suspended'].includes(statusLower)) {
 return 'bg-red-100 text-red-700';
 }
 
 return 'bg-gray-100 text-gray-700';
 };

 // ✅ REAL DATA: Get booking status color
 const getBookingStatusColor = (status: string) => {
 const statusLower = status.toLowerCase();
 
 if (['confirmed', 'active', 'live'].includes(statusLower)) {
 return 'bg-emerald-100 text-emerald-700';
 }
 if (['pending', 'pending_install'].includes(statusLower)) {
 return 'bg-yellow-100 text-yellow-700';
 }
 if (['completed', 'finished'].includes(statusLower)) {
 return 'bg-blue-100 text-blue-700';
 }
 if (['cancelled', 'rejected'].includes(statusLower)) {
 return 'bg-red-100 text-red-700';
 }
 
 return 'bg-gray-100 text-gray-700';
 };

 // Calculate derived stats
 const totalPendingRevenue = bookings
 .filter(b => ['pending', 'confirmed'].includes(b.status.toLowerCase()))
 .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

 // ✅ CONDENSED KPI LINE ITEM - Optimized for height constraints
 const KPILineItem = ({ 
 title, 
 value, 
 change, 
 trend, 
 icon: Icon, 
 highlighted = false,
 prefix = '',
 suffix = ''
 }: {
 title: string;
 value: number | string;
 change?: string;
 trend?: 'up' | 'down';
 icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
 highlighted?: boolean;
 prefix?: string;
 suffix?: string;
 }) => (
 <div className={`flex items-center justify-between py-1.5 ${highlighted ? 'text-red-600' : 'text-gray-700'}`}>
 <div className="flex items-center space-x-2">
 <Icon className="w-3.5 h-3.5" style={{ color: '#4668AB' }} />
 <span className="text-xs font-medium">{title}</span>
 </div>
 <div className="text-right">
 <span className="text-xs font-bold text-gray-900">
 {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
 </span>
 {change && (
 <div className={`flex items-center justify-end text-xs ${
 trend === 'up' ? 'text-emerald-600' : 
 trend === 'down' ? 'text-red-600' : 'text-gray-600'
 }`}>
 {trend === 'up' && <ArrowUp className="w-2.5 h-2.5 mr-0.5" />}
 {trend === 'down' && <ArrowDown className="w-2.5 h-2.5 mr-0.5" />}
 {change}
 </div>
 )}
 </div>
 </div>
 );

 // ✅ FIXED PRICING: Enhanced Spaces Table with correct rate period display
 const EnhancedSpacesTable = () => (
 <div 
 className="rounded-2xl overflow-hidden relative"
 style={{
 background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.35) 50%, rgba(255, 255, 255, 0.25) 100%)',
 backdropFilter: 'blur(20px) saturate(180%)',
 WebkitBackdropFilter: 'blur(20px) saturate(180%)',
 border: '1px solid rgba(255, 255, 255, 0.18)',
 boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(255, 255, 255, 0.05)'
 }}
>
 {/* Glass reflection overlay */}
 <div 
 className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-t-2xl"
 style={{
 background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)',
 zIndex: Z_INDEX.GLASS_OVERLAYS
 }}
 />

 <div className="relative" style={{ zIndex: Z_INDEX.CONTENT }}>
 <div 
 className="px-6 py-4 border-b relative"
 style={{
 background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0.4) 100%)',
 backdropFilter: 'blur(15px) saturate(150%)',
 borderBottomColor: 'rgba(255, 255, 255, 0.15)'
 }}
>
 <div className="flex justify-between items-center">
 <div className="flex items-center">
 <h3 className="text-lg font-bold text-gray-900 mr-4" style={{textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'}}>
 Your Ad Spaces ({spaces.length})
 </h3>
 {isRefreshing && (
 <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
 )}
 </div>
 
 <button 
 type="button"
 onClick={() => {
 console.log('🎯 Navigating to /list-space');
 navigate('/list-space');
 }}
 className="inline-flex items-center px-4 py-2 text-sm font-bold text-white rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300 relative overflow-hidden"
 style={{ 
 background: 'linear-gradient(135deg, #4668AB 0%, #5B7BC7 100%)',
 boxShadow: '0 4px 12px rgba(70, 104, 171, 0.2)'
 }}
>
 <div 
 className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-lg"
 style={{
 background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, transparent 100%)'
 }}
 />
 <Plus className="w-4 h-4 mr-2 relative z-10" />
 <span className="relative z-10">Add Space</span>
 </button>
 </div>
 </div>
 
 <div className="overflow-x-auto">
 {spaces.length === 0 ? (
 <div className="text-center py-12">
 <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
 <h3 className="text-lg font-medium text-gray-900 mb-2">No spaces listed</h3>
 <p className="text-gray-500 mb-4">Start earning by listing your available advertising spaces</p>
 <button
 onClick={() => navigate('/list-space')}
 className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg"
 style={{ backgroundColor: '#4668AB' }}
>
 <Plus className="w-4 h-4 mr-2" />
 List Your First Space
 </button>
 </div>
 ) : (
 <table className="w-full">
 <thead 
 style={{
 background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(248, 250, 252, 0.9) 100%)',
 backdropFilter: 'blur(10px)'
 }}
>
 <tr>
 <th className="text-left py-3 px-6 font-semibold text-gray-800 text-xs uppercase tracking-wide">Space Details</th>
 <th className="text-left py-3 px-6 font-semibold text-gray-800 text-xs uppercase tracking-wide">Location & Type</th>
 <th className="text-left py-3 px-6 font-semibold text-gray-800 text-xs uppercase tracking-wide">Pricing</th>
 <th className="text-left py-3 px-6 font-semibold text-gray-800 text-xs uppercase tracking-wide">Status</th>
 <th className="text-left py-3 px-6 font-semibold text-gray-800 text-xs uppercase tracking-wide">Actions</th>
 </tr>
 </thead>
 <tbody>
 {spaces.map((space) => {
 const dimensions = space.dimensions ? 
 (typeof space.dimensions === 'string' ? space.dimensions : JSON.stringify(space.dimensions)) : 
 'N/A';
 const price = space.baseRate || (space.pricing?.baseRate) || 0;
 
 return (
 <tr 
 key={space.id} 
 className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150"
>
 <td className="py-3 px-6">
 <div className="flex items-center">
 <div className="flex-1">
 <div className="font-semibold text-gray-900 text-sm flex items-center">
 {space.title || space.name}
 {space.isActive && (
 <CheckCircle className="w-3 h-3 text-green-600 ml-2" />
 )}
 </div>
 <div className="text-xs text-gray-500 mt-1">
 {space.type || space.spaceType || 'Space'}
 </div>
 </div>
 </div>
 </td>
 <td className="py-3 px-6">
 <div className="text-sm">
 <div className="font-medium text-gray-900 flex items-center">
 <MapPin className="w-3 h-3 mr-1" />
 {space.city || space.property?.city || 'N/A'}
 </div>
 <div className="text-xs text-gray-500 mt-1">
 {dimensions}
 </div>
 </div>
 </td>
 <td className="py-3 px-6">
 <div className="text-sm">
 <div className="font-semibold text-gray-900">
 {formatCurrency(price, space.currency)}
 </div>
 <div className="text-xs text-gray-500 mt-1">
 {getRatePeriodLabel(space.ratePeriod || space.rateType)}
 </div>
 </div>
 </td>
 <td className="py-3 px-6">
 <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(space.status, space.isActive)}`}>
 {space.isActive ? 'Active' : (space.status || 'Inactive')}
 </span>
 </td>
 <td className="py-3 px-6">
 <div className="flex items-center gap-2">
 <button 
 onClick={() => handleEditSpace(space.id)}
 className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-all shadow-sm hover:shadow-md"
 title="Edit space details"
>
 <Edit2 className="w-3.5 h-3.5 mr-1" />
 Edit
 </button>
 <button 
 onClick={() => confirmDeleteSpace(space.id, space.title || space.name)}
 disabled={deletingSpaceId === space.id}
 className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
 title="Delete this space"
>
 {deletingSpaceId === space.id ? (
 <>
 <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
 Deleting...
 </>
 ) : (
 <>
 <Trash2 className="w-3.5 h-3.5 mr-1" />
 Delete
 </>
 )}
 </button>
 </div>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 )}
 </div>
 </div>
 </div>
 );

 // ✅ REAL DATA: Enhanced Bookings Table with real data
 const EnhancedBookingsTable = () => (
 <div 
 className="rounded-2xl overflow-hidden relative"
 style={{
 background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.35) 50%, rgba(255, 255, 255, 0.25) 100%)',
 backdropFilter: 'blur(20px) saturate(180%)',
 WebkitBackdropFilter: 'blur(20px) saturate(180%)',
 border: '1px solid rgba(255, 255, 255, 0.18)',
 boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(255, 255, 255, 0.05)'
 }}
>
 {/* Glass reflection overlay */}
 <div 
 className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-t-2xl"
 style={{
 background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)',
 zIndex: Z_INDEX.GLASS_OVERLAYS
 }}
 />

 <div className="relative" style={{ zIndex: Z_INDEX.CONTENT }}>
 <div 
 className="px-6 py-4 border-b relative"
 style={{
 background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0.4) 100%)',
 backdropFilter: 'blur(15px) saturate(150%)',
 borderBottomColor: 'rgba(255, 255, 255, 0.15)'
 }}
>
 <div className="flex justify-between items-center">
 <h3 className="text-lg font-bold text-gray-900" style={{textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'}}>
 Active & Pending Bookings ({bookings.length})
 </h3>
 <span className="text-sm text-gray-600" style={{textShadow: '0 1px 2px rgba(255, 255, 255, 0.6)'}}>
 {formatCurrency(totalPendingRevenue)} pending revenue
 </span>
 </div>
 </div>
 
 <div className="overflow-x-auto">
 {bookings.length === 0 ? (
 <div className="text-center py-12">
 <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
 <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
 <p className="text-gray-500 mb-4">Once advertisers book your spaces, you'll see them here</p>
 <button 
 onClick={() => navigate('/list-space')}
 className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg"
 style={{ backgroundColor: '#4668AB' }}
>
 <Building2 className="w-4 h-4 mr-2" />
 View Your Spaces
 </button>
 </div>
 ) : (
 <table className="w-full">
 <thead 
 style={{
 background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(248, 250, 252, 0.9) 100%)',
 backdropFilter: 'blur(10px)'
 }}
>
 <tr>
 <th className="text-left py-3 px-6 font-semibold text-gray-800 text-xs uppercase tracking-wide">Booking Details</th>
 <th className="text-left py-3 px-6 font-semibold text-gray-800 text-xs uppercase tracking-wide">Campaign Period</th>
 <th className="text-left py-3 px-6 font-semibold text-gray-800 text-xs uppercase tracking-wide">Revenue</th>
 <th className="text-left py-3 px-6 font-semibold text-gray-800 text-xs uppercase tracking-wide">Status</th>
 <th className="text-left py-3 px-6 font-semibold text-gray-800 text-xs uppercase tracking-wide">Actions</th>
 </tr>
 </thead>
 <tbody>
 {bookings.map((booking) => (
 <tr 
 key={booking.id} 
 className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150"
>
 <td className="py-3 px-6">
 <div>
 <div className="font-semibold text-gray-900 text-sm">
 {getBookerName(booking)}
 </div>
 <div className="text-xs text-gray-500 mt-1 flex items-center">
 <MapPin className="w-3 h-3 mr-1" />
 {getSpaceName(booking)}
 </div>
 </div>
 </td>
 <td className="py-3 px-6">
 <div className="text-sm">
 <div className="font-medium text-gray-900">
 {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
 </div>
 <div className="text-xs text-gray-500 mt-1">
 {Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
 </div>
 </div>
 </td>
 <td className="py-3 px-6">
 <div className="font-bold text-lg text-gray-900">
 {formatCurrency(booking.totalAmount, booking.currency)}
 </div>
 </td>
 <td className="py-3 px-6">
 <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getBookingStatusColor(booking.status)}`}>
 {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('_', ' ')}
 </span>
 </td>
 <td className="py-3 px-6">
 <button 
 onClick={() => navigate(`/bookings/${booking.id}`)}
 className="text-blue-600 hover:text-blue-800 font-medium text-xs hover:underline transition-colors"
>
 View Details
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 )}
 </div>
 </div>
 </div>
 );

 // ✅ GLASSMORPHISM: Enhanced loading state
 if (isLoading) {
 return (
 <div 
 className="dashboard-loading-state relative"
 style={{ 
 position: 'fixed',
 top: 0,
 left: 0,
 right: 0,
 bottom: 0,
 width: '100vw',
 height: '100vh',
 overflow: 'hidden',
 background: 'linear-gradient(135deg, #F8FAFF 0%, #E8F2FF 50%, #F0F8FF 100%)'
 }}
>
 <div 
 className="absolute inset-0 opacity-30"
 style={{
 background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(120, 198, 119, 0.3) 0%, transparent 50%)'
 }}
 />
 
 <div className="flex items-center justify-center" style={{ height: '100vh' }}>
 <div 
 className="relative rounded-2xl p-8 text-center max-w-md mx-4 overflow-hidden"
 style={{
 background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.35) 50%, rgba(255, 255, 255, 0.25) 100%)',
 backdropFilter: 'blur(20px) saturate(180%)',
 WebkitBackdropFilter: 'blur(20px) saturate(180%)',
 border: '1px solid rgba(255, 255, 255, 0.18)',
 boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(255, 255, 255, 0.05)',
 zIndex: Z_INDEX.GLASS_CONTAINERS
 }}
>
 <div 
 className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-t-2xl"
 style={{
 background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)',
 zIndex: Z_INDEX.GLASS_OVERLAYS
 }}
 />
 
 <div style={{ zIndex: Z_INDEX.CONTENT }} className="relative">
 <EnterpriseLoader 
 size={40}
 
 
 
 centered={true}
 />
 </div>
 </div>
 </div>
 </div>
 );
 }

 // ✅ GLASSMORPHISM: Enhanced error state
 if (error) {
 return (
 <div 
 className="dashboard-loading-state relative"
 style={{ 
 position: 'fixed',
 top: 0,
 left: 0,
 right: 0,
 bottom: 0,
 width: '100vw',
 height: '100vh',
 overflow: 'hidden',
 background: 'linear-gradient(135deg, #FFF8F8 0%, #FFE8E8 50%, #FFF0F0 100%)'
 }}
>
 <div 
 className="absolute inset-0 opacity-20"
 style={{
 background: 'radial-gradient(circle at 20% 80%, rgba(239, 68, 68, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(239, 68, 68, 0.2) 0%, transparent 50%)'
 }}
 />
 
 <div className="flex items-center justify-center" style={{ height: '100vh' }}>
 <div 
 className="relative rounded-2xl p-8 text-center max-w-md mx-4 overflow-hidden"
 style={{
 background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.35) 50%, rgba(255, 255, 255, 0.25) 100%)',
 backdropFilter: 'blur(20px) saturate(180%)',
 WebkitBackdropFilter: 'blur(20px) saturate(180%)',
 border: '1px solid rgba(255, 255, 255, 0.18)',
 boxShadow: '0 8px 32px rgba(239, 68, 68, 0.15), 0 4px 16px rgba(239, 68, 68, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(255, 255, 255, 0.05)',
 zIndex: Z_INDEX.GLASS_CONTAINERS
 }}
>
 <div 
 className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-t-2xl"
 style={{
 background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)',
 zIndex: Z_INDEX.GLASS_OVERLAYS
 }}
 />
 
 <div style={{ zIndex: Z_INDEX.CONTENT }} className="relative">
 <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
 <h3 className="text-lg font-semibold text-gray-900 mb-2">Connection Error</h3>
 <p className="text-red-600 mb-4">{error}</p>
 <button
 onClick={() => fetchAllData()}
 className="px-6 py-3 rounded-lg text-white font-bold hover:opacity-90 transition-all duration-300 relative overflow-hidden"
 style={{ 
 background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
 boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
 }}
>
 Try Again
 </button>
 </div>
 </div>
 </div>
 </div>
 );
 }

 return (
 <div 
 className="flex dashboard-container"
 style={{ 
 position: 'fixed',
 top: 0,
 left: 0,
 right: 0,
 bottom: 0,
 width: '100vw',
 height: '100vh',
 overflow: 'hidden',
 background: 'linear-gradient(135deg, #F8FAFF 0%, #E8F2FF 25%, #F0F8FF 50%, #E8F2FF 75%, #F8FAFF 100%)'
 }}
>
 {/* ✅ GLASSMORPHISM: Enhanced background with subtle patterns */}
 <div 
 className="absolute inset-0 opacity-40"
 style={{
 background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(120, 198, 119, 0.1) 0%, transparent 50%)',
 zIndex: Z_INDEX.BACKGROUND
 }}
 />

 {/* ✅ EDGE-TO-EDGE: Mobile goes full-width, desktop maintains premium spacing */}
 <style>{`
 @media (min-width: 768px) {
 .dashboard-container {
 padding: ${CONTAINER_PADDING.DESKTOP}px;
 padding-top: ${CSS_VALUES.DESKTOP_TOP_PADDING}px;
 padding-bottom: ${CONTAINER_PADDING.DESKTOP}px;
 }
 .glassmorphism-sidebar {
 height: calc(100vh - ${CSS_VALUES.DESKTOP_TOTAL_PADDING}px) !important;
 max-height: calc(100vh - ${CSS_VALUES.DESKTOP_TOTAL_PADDING}px) !important;
 }
 .glassmorphism-main {
 height: calc(100vh - ${CSS_VALUES.DESKTOP_TOTAL_PADDING}px) !important;
 max-height: calc(100vh - ${CSS_VALUES.DESKTOP_TOTAL_PADDING}px) !important;
 }
 }
 
 @media (max-width: 767px) {
 .dashboard-container {
 padding: ${CONTAINER_PADDING.MOBILE}px;
 padding-top: ${CSS_VALUES.MOBILE_TOP_PADDING}px;
 padding-bottom: ${CSS_VALUES.MOBILE_BOTTOM_PADDING}px;
 }
 .glassmorphism-sidebar {
 height: calc(100vh - ${CSS_VALUES.MOBILE_TOTAL_PADDING}px) !important;
 max-height: calc(100vh - ${CSS_VALUES.MOBILE_TOTAL_PADDING}px) !important;
 border-radius: 0 !important;
 border-left: none !important;
 border-right: none !important;
 }
 .glassmorphism-main {
 height: calc(100vh - ${CSS_VALUES.MOBILE_TOTAL_PADDING}px) !important;
 max-height: calc(100vh - ${CSS_VALUES.MOBILE_TOTAL_PADDING}px) !important;
 border-radius: 0 !important;
 border-left: none !important;
 border-right: none !important;
 }
 
 .dashboard-container> div {
 margin-left: 0 !important;
 margin-right: 0 !important;
 }
 }
 
 .dashboard-container, .glassmorphism-sidebar, .glassmorphism-main {
 overflow: hidden !important;
 }
 
 .dashboard-loading-state {
 padding: ${CONTAINER_PADDING.DESKTOP}px !important;
 }
 
 @media (min-width: 768px) {
 .dashboard-loading-state {
 padding-top: ${CSS_VALUES.DESKTOP_TOP_PADDING}px !important;
 padding-bottom: ${CONTAINER_PADDING.DESKTOP}px !important;
 }
 }
 
 @media (max-width: 767px) {
 .dashboard-loading-state {
 padding: ${CONTAINER_PADDING.MOBILE}px !important;
 padding-top: ${CSS_VALUES.MOBILE_TOP_PADDING}px !important;
 padding-bottom: ${CSS_VALUES.MOBILE_BOTTOM_PADDING}px !important;
 }
 }
 `}</style>

 {/* Success Message */}
 {showSuccessMessage && (
 <div className="fixed top-4 right-4 z-50 max-w-sm">
 <div 
 className="rounded-lg p-4 shadow-lg relative overflow-hidden"
 style={{
 background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.15) 100%)',
 backdropFilter: 'blur(20px)',
 border: '1px solid rgba(16, 185, 129, 0.2)'
 }}
>
 <div className="flex items-center">
 <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
 <div>
 <p className="text-green-800 font-medium text-sm">Space Created Successfully!</p>
 <p className="text-green-700 text-xs mt-1">Your space is now listed and available for booking.</p>
 </div>
 <button 
 onClick={() => setShowSuccessMessage(false)}
 className="ml-3 text-green-400 hover:text-green-600"
>
 <X className="w-4 h-4" />
 </button>
 </div>
 </div>
 </div>
 )}

 {/* ✅ GLASSMORPHISM: FLOATING SIDEBAR */}
 <div 
 className="glassmorphism-sidebar w-80 md:mr-6 rounded-2xl overflow-hidden relative"
 style={{
 background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.35) 50%, rgba(255, 255, 255, 0.25) 100%)',
 backdropFilter: 'blur(20px) saturate(180%)',
 WebkitBackdropFilter: 'blur(20px) saturate(180%)',
 border: '1px solid rgba(255, 255, 255, 0.18)',
 boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(255, 255, 255, 0.05)',
 zIndex: Z_INDEX.GLASS_CONTAINERS
 }}
>
 {/* Glass reflection overlay */}
 <div 
 className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-t-2xl"
 style={{
 background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)',
 zIndex: Z_INDEX.GLASS_OVERLAYS
 }}
 />

 <div className="flex flex-col relative h-full overflow-y-auto" style={{ zIndex: Z_INDEX.CONTENT }}>
 <div className="p-4">
 {/* ✅ REAL DATA: Performance Metrics */}
 <div className="mb-4">
 <div className="flex items-center justify-between mb-2">
 <h2 className="text-sm font-bold text-gray-900 flex items-center">
 <BarChart3 className="w-4 h-4 mr-2" style={{ color: '#4668AB' }} />
 Performance Metrics
 </h2>
 <button
 onClick={handleRefresh}
 className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
 disabled={isRefreshing}
>
 <RefreshCw className={`w-3 h-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
 Refresh
 </button>
 </div>
 <div className="space-y-0.5">
 <KPILineItem
 title="Total Revenue"
 value={formatCurrency(stats.totalRevenue)}
 icon={DollarSign}
 />
 <KPILineItem
 title="Active Spaces"
 value={stats.activeListings}
 icon={Building2}
 />
 <KPILineItem
 title="Pending Installs"
 value={stats.pendingInstalls}
 icon={Clock}
 highlighted={stats.pendingInstalls> 0}
 />
 <KPILineItem
 title="Completed Bookings"
 value={stats.completedBookings}
 icon={CheckCircle}
 />
 </div>
 </div>

 {/* ✅ REAL DATA: Recent Activity */}
 <div>
 <h2 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
 <Activity className="w-4 h-4 mr-2" style={{ color: '#4668AB' }} />
 Recent Activity
 </h2>
 <div className="space-y-2">
 {recentActivity.length === 0 ? (
 <div className="text-center py-4">
 <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
 <p className="text-xs text-gray-500">No recent activity</p>
 </div>
 ) : (
 recentActivity.slice(0, 3).map((activity) => (
 <div 
 key={activity.id}
 className="rounded-lg p-2.5 hover:shadow-sm transition-all duration-200 cursor-pointer relative border"
 style={{ 
 background: activity.priority === 'high' ? 'rgba(254, 243, 242, 0.8)' : 'rgba(255, 255, 255, 0.8)',
 borderColor: activity.priority === 'high' ? 'rgba(252, 165, 165, 0.5)' : 'rgba(226, 232, 240, 0.5)',
 backdropFilter: 'blur(10px)'
 }}
>
 {activity.priority === 'high' && !activity.isRead && (
 <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
 )}
 
 <div className="flex items-start space-x-2">
 <div className="text-sm flex-shrink-0">
 {activity.type === 'booking' ? '📅' : 
 activity.type === 'notification' ? '🔔' : '🏢'}
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center justify-between mb-0.5">
 <p className="text-xs font-semibold text-gray-900 truncate">{activity.title}</p>
 <p className="text-xs text-gray-500">{activity.timestamp}</p>
 </div>
 <p className="text-xs text-gray-700 line-clamp-2">{activity.description}</p>
 </div>
 </div>
 </div>
 ))
 )}
 
 <button 
 className="w-full text-center py-1.5 text-xs font-semibold rounded-lg transition-colors hover:bg-blue-50"
 style={{ color: '#4668AB' }}
 onClick={() => navigate('/notifications')}
>
 View All Activity
 </button>
 </div>
 </div>

 {/* ✅ REAL DATA: Last Updated */}
 {lastUpdated && (
 <div className="mt-4 pt-3 border-t border-gray-200">
 <p className="text-xs text-gray-500 text-center">
 Last updated: {formatTimestamp(lastUpdated)}
 </p>
 </div>
 )}
 </div>
 </div>
 </div>

 {/* ✅ GLASSMORPHISM: MAIN CONTENT AREA */}
 <div 
 className="glassmorphism-main flex-1 rounded-2xl overflow-hidden relative"
 style={{
 background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.35) 50%, rgba(255, 255, 255, 0.25) 100%)',
 backdropFilter: 'blur(20px) saturate(180%)',
 WebkitBackdropFilter: 'blur(20px) saturate(180%)',
 border: '1px solid rgba(255, 255, 255, 0.18)',
 boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(255, 255, 255, 0.05)',
 zIndex: Z_INDEX.GLASS_CONTAINERS
 }}
>
 {/* Glass reflection overlay */}
 <div 
 className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-t-2xl"
 style={{
 background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)',
 zIndex: Z_INDEX.GLASS_OVERLAYS
 }}
 />

 <div className="flex flex-col relative h-full" style={{ zIndex: Z_INDEX.CONTENT }}>
 {/* ✅ GLASSMORPHISM: Enhanced Header */}
 <div 
 className="flex-shrink-0 p-6 relative"
 style={{
 background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0.4) 100%)',
 backdropFilter: 'blur(15px) saturate(150%)',
 WebkitBackdropFilter: 'blur(15px) saturate(150%)',
 borderBottom: '1px solid rgba(255, 255, 255, 0.15)'
 }}
>
 <h1 className="text-2xl font-bold text-gray-900" style={{textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'}}>
 Space Management
 </h1>

 {/* ✅ SPACES FIRST: Changed tab order and navigation */}
 <div className="mt-4">
 <div className="border-b border-gray-200">
 <nav className="flex space-x-8">
 <button
 onClick={() => setActiveTab('spaces')}
 className={`py-3 px-2 text-sm font-semibold border-b-2 transition-all duration-200 ${
 activeTab === 'spaces'
 ? 'border-blue-500 text-blue-600'
 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
 }`}
>
 Spaces ({spaces.length})
 </button>
 <button
 onClick={() => setActiveTab('bookings')}
 className={`py-3 px-2 text-sm font-semibold border-b-2 transition-all duration-200 ${
 activeTab === 'bookings'
 ? 'border-blue-500 text-blue-600'
 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
 }`}
>
 Bookings ({bookings.length})
 </button>
 </nav>
 </div>
 </div>
 </div>

 {/* ✅ TAB CONTENT - SPACES FIRST */}
 <div className="flex-1 p-6 overflow-y-auto">
 {activeTab === 'spaces' ? <EnhancedSpacesTable /> : <EnhancedBookingsTable />}
 </div>
 </div>
 </div>

 {/* ✅ DELETE CONFIRMATION MODAL */}
 {showDeleteConfirm && (
 <div 
 className="fixed inset-0 flex items-center justify-center z-50"
 style={{ 
 background: 'rgba(0, 0, 0, 0.5)',
 backdropFilter: 'blur(4px)'
 }}
>
 <div 
 className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-xl border"
 style={{
 background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%)',
 backdropFilter: 'blur(20px)',
 border: '1px solid rgba(255, 255, 255, 0.2)'
 }}
>
 <div className="flex items-center mb-4">
 <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
 <AlertCircle className="w-6 h-6 text-red-600" />
 </div>
 <div>
 <h3 className="text-lg font-semibold text-gray-900">
 Delete Space
 </h3>
 <p className="text-sm text-gray-600">
 This action cannot be undone
 </p>
 </div>
 </div>

 <div className="mb-6">
 <p className="text-gray-700 text-sm">
 Are you sure you want to delete this space? This will permanently remove:
 </p>
 <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-1">
 <li>The space listing</li>
 <li>All associated images</li>
 <li>Space availability data</li>
 </ul>
 <p className="mt-3 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
 ⚠️ Active bookings for this space will not be affected but new bookings will be disabled.
 </p>
 </div>

 <div className="flex gap-3 justify-end">
 <button
 onClick={cancelDelete}
 className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
>
 Cancel
 </button>
 <button
 onClick={() => handleDeleteSpace(showDeleteConfirm)}
 disabled={deletingSpaceId === showDeleteConfirm}
 className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
>
 {deletingSpaceId === showDeleteConfirm ? (
 <>
 <Loader2 className="w-4 h-4 mr-2 animate-spin" />
 Deleting...
 </>
 ) : (
 <>
 <Trash2 className="w-4 h-4 mr-2" />
 Delete Space
 </>
 )}
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}