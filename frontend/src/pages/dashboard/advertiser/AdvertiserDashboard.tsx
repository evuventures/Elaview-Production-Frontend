// Advertiser Dashboard - REAL DATA VERSION
// ✅ REAL DATA: Fetches actual data from your backend API
// ✅ CAMPAIGN REFRESH: Shows newly created campaigns immediately
// ✅ ERROR HANDLING: Proper error states and fallbacks
// ✅ LOADING STATES: Real loading indicators
// ✅ AUTO REFRESH: Refreshes data when returning from campaign creation

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import {
  Calendar, TrendingUp, Eye, MessageCircle, ChevronRight,
  DollarSign, Clock, MapPin, User, Receipt, Plus, ArrowUp, ArrowDown,
  Target, Activity, BarChart3, AlertTriangle, Zap, CheckCircle, Bell, Loader2,
  RefreshCw
} from 'lucide-react';

// ✅ REAL DATA: Import your actual API client
import apiClient from '../../../api/apiClient';

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
  MOBILE: 0    // Mobile goes edge-to-edge for native feel
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
const EnterpriseLoader = ({ 
  size = "md", 
  theme = "brand", 
  message = "", 
  showMessage = false,
  centered = false,
  className = ""
}) => {
  const sizeClasses = {
    xs: "w-4 h-4",
    sm: "w-6 h-6", 
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  };

  const themeColors = {
    brand: "#4668AB",
    white: "#FFFFFF",
    gray: "#6B7280"
  };

  return (
    <div className={`${centered ? 'flex flex-col items-center justify-center' : ''} ${className}`}>
      <div 
        className={`${sizeClasses[size]} animate-spin rounded-full border-3 border-t-transparent`}
        style={{
          borderColor: `${themeColors[theme]}33`,
          borderTopColor: themeColors[theme],
          background: `conic-gradient(from 0deg, ${themeColors[theme]}00, ${themeColors[theme]})`
        }}
      />
      {showMessage && message && (
        <p 
          className="mt-3 text-sm font-medium"
          style={{ color: themeColors[theme] }}
        >
          {message}
        </p>
      )}
    </div>
  );
};

// ✅ REAL DATA: Updated Types to match your actual API responses
interface DashboardStats {
  activeCampaigns: number;
  completedCampaigns: number;
  totalSpent: number;
  pendingMaterials: number;
  totalImpressions?: number;
  needsAttention?: number;
}

interface Campaign {
  id: string;
  name: string;
  title?: string;
  startDate?: string;
  start_date?: string;
  budget?: number;
  total_budget?: number;
  totalSpent?: number;
  spent?: number;
  status: string;
  isActive?: boolean;
  currency?: string;
  brand_name?: string;
  createdAt?: string;
}

interface Invoice {
  id: string;
  invoiceNumber?: string;
  campaignId?: string;
  campaign?: { name: string };
  amount: number;
  dueDate: string;
  status: string;
  description?: string;
  currency?: string;
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

export default function SidebarAdvertiserDashboard() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [searchParams] = useSearchParams();
  
  // ✅ REAL DATA: State management for real data
  const [activeTab, setActiveTab] = useState('campaigns');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // ✅ REAL DATA: States for actual API data
  const [stats, setStats] = useState<DashboardStats>({
    activeCampaigns: 0,
    completedCampaigns: 0,
    totalSpent: 0,
    pendingMaterials: 0,
    totalImpressions: 0,
    needsAttention: 0
  });
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // ✅ CAMPAIGN REFRESH: Check for campaign creation success
  useEffect(() => {
    const created = searchParams.get('created');
    const tab = searchParams.get('tab');
    
    if (created === 'true') {
      console.log('🎉 Campaign creation detected - showing success and refreshing data');
      if (tab) {
        setActiveTab(tab);
      }
      // Force refresh data
      fetchAllData(true);
      
      // Clear URL params after processing
      navigate('/advertise', { replace: true });
    }
  }, [searchParams, navigate]);

  // ✅ REAL DATA: Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      console.log('📊 Fetching advertiser dashboard stats...');
      const response = await apiClient.getAdvertiserDashboard();
      
      if (response.success && response.data) {
        const { stats: apiStats } = response.data;
        
        setStats({
          activeCampaigns: apiStats.activeCampaigns || 0,
          completedCampaigns: apiStats.completedCampaigns || 0,
          totalSpent: apiStats.totalSpent || 0,
          pendingMaterials: apiStats.pendingMaterials || 0,
          totalImpressions: apiStats.totalImpressions || 0,
          needsAttention: apiStats.needsAttention || 0
        });
        
        console.log('✅ Dashboard stats loaded:', apiStats);
      } else {
        console.error('❌ Failed to fetch dashboard stats:', response.error);
      }
    } catch (error) {
      console.error('❌ Dashboard stats error:', error);
    }
  };

  // ✅ REAL DATA: Fetch campaigns
  const fetchCampaigns = async () => {
    try {
      console.log('📊 Fetching campaigns...');
      const response = await apiClient.getCampaigns({ limit: 10 });
      
      if (response.success && response.data) {
        setCampaigns(response.data);
        console.log('✅ Campaigns loaded:', response.data.length, 'campaigns');
      } else {
        console.error('❌ Failed to fetch campaigns:', response.error);
        setCampaigns([]);
      }
    } catch (error) {
      console.error('❌ Campaigns fetch error:', error);
      setCampaigns([]);
    }
  };

  // ✅ REAL DATA: Fetch invoices
  const fetchInvoices = async () => {
    try {
      console.log('📊 Fetching invoices...');
      const response = await apiClient.getInvoices({ limit: 5 });
      
      if (response.success && response.data) {
        setInvoices(response.data);
        console.log('✅ Invoices loaded:', response.data.length, 'invoices');
      } else {
        console.error('❌ Failed to fetch invoices:', response.error);
        setInvoices([]);
      }
    } catch (error) {
      console.error('❌ Invoices fetch error:', error);
      setInvoices([]);
    }
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
        // Fallback: create activity from recent campaigns
        const recentCampaigns = campaigns.slice(0, 3);
        const activities = recentCampaigns.map((campaign, index) => ({
          id: `campaign-${campaign.id}`,
          type: 'campaign',
          title: 'Campaign Update',
          description: `${campaign.name} is ${campaign.status.toLowerCase()}`,
          timestamp: formatTimestamp(campaign.createdAt || new Date().toISOString()),
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

  // ✅ REAL DATA: Fetch all data
  const fetchAllData = async (force = false) => {
    if (force) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    setError(null);
    
    try {
      console.log('🔄 Fetching all dashboard data...');
      
      // Fetch all data in parallel for better performance
      await Promise.all([
        fetchDashboardStats(),
        fetchCampaigns(),
        fetchInvoices()
      ]);
      
      // Fetch activity after campaigns are loaded (for fallback)
      await fetchRecentActivity();
      
      setLastUpdated(new Date().toISOString());
      console.log('✅ All dashboard data loaded successfully');
      
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // ✅ REAL DATA: Initial data load
  useEffect(() => {
    if (user?.id) {
      console.log('🎯 User authenticated, loading dashboard data...');
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

  // ✅ REAL DATA: Get campaign progress
  const getCampaignProgress = (campaign: Campaign) => {
    const spent = campaign.totalSpent || campaign.spent || 0;
    const budget = campaign.total_budget || campaign.budget || 1;
    return Math.min(Math.round((spent / budget) * 100), 100);
  };

  // ✅ REAL DATA: Get campaign status color
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    
    if (['active', 'live', 'approved'].includes(statusLower)) {
      return 'bg-emerald-100 text-emerald-700';
    }
    if (['completed', 'complete'].includes(statusLower)) {
      return 'bg-blue-100 text-blue-700';
    }
    if (['draft', 'planning'].includes(statusLower)) {
      return 'bg-gray-100 text-gray-700';
    }
    if (['pending', 'pending_approval'].includes(statusLower)) {
      return 'bg-yellow-100 text-yellow-700';
    }
    if (['paused', 'cancelled'].includes(statusLower)) {
      return 'bg-red-100 text-red-700';
    }
    
    return 'bg-gray-100 text-gray-700';
  };

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

  // ✅ REAL DATA: Enhanced Campaign Table with real data
  const EnhancedCampaignTable = () => (
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
                Campaign Performance
              </h3>
              {isRefreshing && (
                <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
              )}
            </div>
            
            <button
              type="button"
              onClick={() => {
                console.log('🎯 Navigating to /create-campaign');
                navigate('/create-campaign');
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
              <span className="relative z-10">Create Campaign</span>
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
              <p className="text-gray-500 mb-4">Create your first campaign to start advertising</p>
              <button
                onClick={() => navigate('/create-campaign')}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg"
                style={{ backgroundColor: '#4668AB' }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
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
                  <th className="text-left py-3 px-6 font-semibold text-gray-800 text-xs uppercase tracking-wide">Campaign</th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-800 text-xs uppercase tracking-wide">Budget Progress</th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-800 text-xs uppercase tracking-wide">Status</th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-800 text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => {
                  const progress = getCampaignProgress(campaign);
                  const spent = campaign.totalSpent || campaign.spent || 0;
                  const budget = campaign.total_budget || campaign.budget || 0;
                  const startDate = campaign.start_date || campaign.startDate;
                  
                  return (
                    <tr 
                      key={campaign.id} 
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="py-3 px-6">
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">
                            {campaign.title || campaign.name}
                          </div>
                          {campaign.brand_name && (
                            <div className="text-xs text-gray-500 mt-0.5">{campaign.brand_name}</div>
                          )}
                          {startDate && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              {new Date(startDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-6">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-gray-900">
                              {formatCurrency(spent, campaign.currency)}
                            </span>
                            <span className="text-xs text-gray-500">
                              / {formatCurrency(budget, campaign.currency)}
                            </span>
                          </div>
                          {budget > 0 && (
                            <>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="h-2 rounded-full transition-all duration-500"
                                  style={{ 
                                    width: `${progress}%`,
                                    background: 'linear-gradient(90deg, #4668AB 0%, #5B7BC7 100%)'
                                  }}
                                ></div>
                              </div>
                              <div className="text-xs text-gray-600">
                                {progress}% utilized
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-6">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-6">
                        <button 
                          onClick={() => navigate(`/campaigns/${campaign.id}`)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-xs hover:underline transition-colors"
                        >
                          View Details
                        </button>
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

  // ✅ REAL DATA: Enhanced Invoice Table with real data
  const EnhancedInvoiceTable = () => (
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
          <h3 className="text-lg font-bold text-gray-900" style={{textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'}}>
            Recent Invoices
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          {invoices.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
              <p className="text-gray-500">Invoices will appear here after campaign bookings</p>
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
                  <th className="text-left py-3 px-6 font-semibold text-gray-800 text-xs uppercase tracking-wide">Invoice</th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-800 text-xs uppercase tracking-wide">Amount</th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-800 text-xs uppercase tracking-wide">Due Date</th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-800 text-xs uppercase tracking-wide">Status</th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-800 text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-3 px-6">
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">
                          {invoice.invoiceNumber || `Invoice #${invoice.id.slice(0, 8)}`}
                        </div>
                        {invoice.description && (
                          <div className="text-xs text-gray-500 mt-0.5">{invoice.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-6">
                      <span className="font-bold text-lg text-gray-900">
                        {formatCurrency(invoice.amount, invoice.currency)}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-gray-600 text-sm">
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-6">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <button className="text-blue-600 hover:text-blue-800 font-medium text-xs hover:underline transition-colors">
                        {invoice.status.toLowerCase() === 'paid' ? 'View' : 'Pay Now'}
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
                size="xl"
                theme="brand"
                message="Loading your dashboard..."
                showMessage={true}
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
              <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
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
        /* ✅ EDGE-TO-EDGE: Desktop layout with premium spacing */
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
        
        /* ✅ EDGE-TO-EDGE: Mobile native edge-to-edge layout */
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
          
          .dashboard-container > div {
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
                  title="Active Campaigns"
                  value={stats.activeCampaigns}
                  icon={Calendar}
                />
                <KPILineItem
                  title="Completed Campaigns"
                  value={stats.completedCampaigns}
                  icon={CheckCircle}
                />
                <KPILineItem
                  title="Total Spent"
                  value={formatCurrency(stats.totalSpent)}
                  icon={DollarSign}
                />
                <KPILineItem
                  title="Pending Materials"
                  value={stats.pendingMaterials}
                  icon={Clock}
                  highlighted={stats.pendingMaterials > 0}
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
                          {activity.type === 'campaign' ? '📊' : 
                           activity.type === 'notification' ? '🔔' : '📋'}
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
              Campaign Management
            </h1>

            {/* ✅ TAB NAVIGATION */}
            <div className="mt-4">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab('campaigns')}
                    className={`py-3 px-2 text-sm font-semibold border-b-2 transition-all duration-200 ${
                      activeTab === 'campaigns'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Campaigns ({campaigns.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('invoices')}
                    className={`py-3 px-2 text-sm font-semibold border-b-2 transition-all duration-200 ${
                      activeTab === 'invoices'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Invoices ({invoices.length})
                  </button>
                </nav>
              </div>
            </div>
          </div>

          {/* ✅ TAB CONTENT */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'campaigns' ? <EnhancedCampaignTable /> : <EnhancedInvoiceTable />}
          </div>
        </div>
      </div>
    </div>
  );
}