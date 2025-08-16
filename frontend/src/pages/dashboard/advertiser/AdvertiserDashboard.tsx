// Advertiser Dashboard - Enhanced with Glassmorphism & Edge-to-Edge Mobile Design
// ✅ EDGE-TO-EDGE: Native mobile layout with zero container padding on mobile
// ✅ GLASSMORPHISM: Premium glass containers with immersive edge-to-edge experience
// ✅ NAVIGATION AWARE: Respects navbar height calculations
// ✅ CONDENSED LAYOUT: Optimized line items to fit within available height
// ✅ BUSINESS CONTEXT: Tailored for B2B campaign management needs

import React, { useState, useEffect } from 'react';
import {
  Calendar, TrendingUp, Eye, MessageCircle, ChevronRight,
  DollarSign, Clock, MapPin, User, Receipt, Plus, ArrowUp, ArrowDown,
  Target, Activity, BarChart3, AlertTriangle, Zap, CheckCircle, Bell, Loader2
} from 'lucide-react';

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

// Types
interface DashboardStats {
  activeCampaigns: number;
  completedCampaigns: number;
  needsAttention: number;
  totalImpressions: number;
}

interface Campaign {
  id: string;
  name: string;
  startDate: string;
  budget: number;
  spent: number;
  status: 'complete' | 'pending' | 'processing' | 'in transit' | 'arrived' | 'live';
}

interface RecentMessage {
  id: string;
  sender: string;
  avatar: string;
  preview: string;
  timestamp: string;
  isRead: boolean;
  priority: 'high' | 'normal';
}

interface Invoice {
  id: string;
  campaignName: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
}

export default function SidebarAdvertiserDashboard() {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulated user for demo
  const user = { id: 'demo-user-123', firstName: 'Jane', lastName: 'Smith' };
  const userLoaded = true;

  // Enhanced data states
  const [stats, setStats] = useState<DashboardStats>({
    activeCampaigns: 25,
    completedCampaigns: 120,
    needsAttention: 3,
    totalImpressions: 5680
  });

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([
    {
      id: '1',
      sender: 'Campaign Manager',
      avatar: '👨‍💼',
      preview: 'Holiday campaign performance exceeded expectations. Consider scaling budget.',
      timestamp: '2h ago',
      isRead: false,
      priority: 'high'
    },
    {
      id: '2',
      sender: 'System Alert', 
      avatar: '🔔',
      preview: 'Daily budget limit reached for Product Launch campaign.',
      timestamp: '4h ago',
      isRead: false,
      priority: 'high'
    },
    {
      id: '3',
      sender: 'Analytics Team',
      avatar: '📊', 
      preview: 'Weekly performance report is ready for review.',
      timestamp: '1d ago',
      isRead: true,
      priority: 'normal'
    }
  ]);

  // ✅ EDGE-TO-EDGE: Enhanced console logging for mobile native experience
  useEffect(() => {
    console.log('🎨 ADVERTISER DASHBOARD GLASSMORPHISM: Native mobile styling applied', {
      navigationHeights: NAVIGATION_HEIGHTS,
      containerPadding: CONTAINER_PADDING,
      calculatedValues: CSS_VALUES,
      glassmorphismOptimizations: [
        'EDGE-TO-EDGE: Mobile containers extend to screen edges',
        'FLOATING GLASS: Premium glass containers with backdrop blur',
        'NAVIGATION AWARE: Respects navbar height calculations',
        'CONDENSED LAYOUT: Optimized KPI line items for height constraints',
        'BRAND CONSISTENCY: Matches messages page styling patterns',
        'RESPONSIVE DESIGN: Desktop preserves premium spacing'
      ],
      timestamp: new Date().toISOString()
    });
  }, []);

  // ✅ SIMPLE LOADING SIMULATION
  useEffect(() => {
    console.log('🎨 SIDEBAR ADVERTISER DASHBOARD: Loading simulation starting', {
      userLoaded,
      userId: user?.id,
      loadingAnimationType: 'EnterpriseLoader with 3-second branded animation',
      timestamp: new Date().toISOString()
    });

    if (userLoaded && user?.id) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        
        // Set mock campaign data
        setCampaigns([
          {
            id: '1',
            name: 'Holiday Season Campaign',
            startDate: '2025-01-15',
            budget: 15000,
            spent: 8500,
            status: 'live'
          },
          {
            id: '2',
            name: 'Brand Awareness Drive',
            startDate: '2025-01-10',
            budget: 8000,
            spent: 6200,
            status: 'live'
          },
          {
            id: '3',
            name: 'Product Launch Beta',
            startDate: '2025-01-20',
            budget: 12000,
            spent: 3200,
            status: 'processing'
          },
          {
            id: '4',
            name: 'Summer Promotion',
            startDate: '2025-01-22',
            budget: 5000,
            spent: 0,
            status: 'pending'
          },
          {
            id: '5',
            name: 'Q1 Brand Campaign',
            startDate: '2025-01-05',
            budget: 20000,
            spent: 20000,
            status: 'complete'
          }
        ]);

        // Set mock invoice data
        setInvoices([
          {
            id: '1',
            campaignName: 'Summer Billboard Campaign',
            amount: 2500,
            dueDate: '2025-01-15',
            status: 'pending'
          },
          {
            id: '2', 
            campaignName: 'Downtown Digital Display',
            amount: 1800,
            dueDate: '2025-01-20',
            status: 'paid'
          },
          {
            id: '3',
            campaignName: 'Highway Banner Ad',
            amount: 3200,
            dueDate: '2025-01-10',
            status: 'overdue'
          }
        ]);

        console.log('✅ SIDEBAR ADVERTISER DASHBOARD: Loading complete', {
          result: 'Consistent branded loading animation displayed',
          timestamp: new Date().toISOString()
        });
      }, 2000);

      return () => clearTimeout(timer);
    } else if (userLoaded && !user) {
      setError('Please sign in to view your dashboard');
      setIsLoading(false);
    }
  }, [userLoaded, user?.id]);

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

  // ✅ COMPACT CAMPAIGN TABLE with glassmorphism
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
            <h3 className="text-lg font-bold text-gray-900" style={{textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'}}>
              Campaign Performance
            </h3>
            <button
              onClick={() => console.log('Navigation: /create-campaign')}
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
              {campaigns.map((campaign, index) => (
                <tr 
                  key={campaign.id} 
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="py-3 px-6">
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">
                        {campaign.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{campaign.startDate}</div>
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-900">
                          ${campaign.spent.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500">
                          / ${campaign.budget.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${(campaign.spent / campaign.budget) * 100}%`,
                            background: 'linear-gradient(90deg, #4668AB 0%, #5B7BC7 100%)'
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-600">
                        {Math.round((campaign.spent / campaign.budget) * 100)}% utilized
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      campaign.status === 'live' ? 'bg-emerald-100 text-emerald-700' :
                      campaign.status === 'complete' ? 'bg-blue-100 text-blue-700' :
                      campaign.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                      campaign.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                      campaign.status === 'in transit' ? 'bg-purple-100 text-purple-700' :
                      campaign.status === 'arrived' ? 'bg-indigo-100 text-indigo-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-6">
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-xs hover:underline transition-colors">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ✅ COMPACT INVOICE TABLE with glassmorphism
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
          <table className="w-full">
            <thead 
              style={{
                background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(248, 250, 252, 0.9) 100%)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <tr>
                <th className="text-left py-3 px-6 font-semibold text-gray-800 text-xs uppercase tracking-wide">Campaign</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-800 text-xs uppercase tracking-wide">Amount</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-800 text-xs uppercase tracking-wide">Due Date</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-800 text-xs uppercase tracking-wide">Status</th>
                <th className="text-left py-3 px-6 font-semibold text-gray-800 text-xs uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                  <td className="py-3 px-6 font-semibold text-gray-900 text-sm">
                    {invoice.campaignName}
                  </td>
                  <td className="py-3 px-6">
                    <span className="font-bold text-lg text-gray-900">${invoice.amount.toLocaleString()}</span>
                  </td>
                  <td className="py-3 px-6 text-gray-600 text-sm">{invoice.dueDate}</td>
                  <td className="py-3 px-6">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                      invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-6">
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-xs hover:underline transition-colors">
                      Pay Now
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
        {/* Enhanced background pattern */}
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
                message="Loading advertiser dashboard..."
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
                onClick={() => window.location.reload()}
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
            /* ✅ EDGE-TO-EDGE: Mobile containers extend to edges */
            border-radius: 0 !important;
            border-left: none !important;
            border-right: none !important;
          }
          .glassmorphism-main {
            height: calc(100vh - ${CSS_VALUES.MOBILE_TOTAL_PADDING}px) !important;
            max-height: calc(100vh - ${CSS_VALUES.MOBILE_TOTAL_PADDING}px) !important;
            /* ✅ EDGE-TO-EDGE: Mobile containers extend to edges */
            border-radius: 0 !important;
            border-left: none !important;
            border-right: none !important;
          }
          
          /* ✅ EDGE-TO-EDGE: Remove spacing between containers on mobile */
          .dashboard-container > div {
            margin-left: 0 !important;
            margin-right: 0 !important;
          }
        }
        
        /* ✅ CRITICAL: Prevent any scrolling */
        .dashboard-container, .glassmorphism-sidebar, .glassmorphism-main {
          overflow: hidden !important;
        }
        
        /* ✅ EDGE-TO-EDGE: Loading states respect the same patterns */
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
            {/* ✅ CONDENSED KPI METRICS SECTION */}
            <div className="mb-4">
              <h2 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" style={{ color: '#4668AB' }} />
                Performance Metrics
              </h2>
              <div className="space-y-0.5">
                <KPILineItem
                  title="Active Campaigns"
                  value={stats.activeCampaigns}
                  change="+2"
                  trend="up"
                  icon={Calendar}
                />
                <KPILineItem
                  title="Completed Campaigns"
                  value={stats.completedCampaigns}
                  change="+5"
                  trend="up"
                  icon={CheckCircle}
                />
                <KPILineItem
                  title="Needs Attention"
                  value={stats.needsAttention}
                  change="+1"
                  trend="up"
                  icon={AlertTriangle}
                  highlighted={stats.needsAttention > 0}
                />
                <KPILineItem
                  title="Total Impressions"
                  value={stats.totalImpressions}
                  icon={Eye}
                />
              </div>
            </div>

            {/* ✅ CONDENSED RECENT ACTIVITY SECTION */}
            <div>
              <h2 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                <Activity className="w-4 h-4 mr-2" style={{ color: '#4668AB' }} />
                Recent Activity
              </h2>
              <div className="space-y-2">
                {recentMessages.map((message, index) => (
                  <div 
                    key={message.id}
                    className="rounded-lg p-2.5 hover:shadow-sm transition-all duration-200 cursor-pointer relative border"
                    style={{ 
                      background: message.priority === 'high' ? 'rgba(254, 243, 242, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                      borderColor: message.priority === 'high' ? 'rgba(252, 165, 165, 0.5)' : 'rgba(226, 232, 240, 0.5)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    {message.priority === 'high' && !message.isRead && (
                      <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    )}
                    
                    <div className="flex items-start space-x-2">
                      <div className="text-sm flex-shrink-0">
                        {message.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-xs font-semibold text-gray-900 truncate">{message.sender}</p>
                          <p className="text-xs text-gray-500">{message.timestamp}</p>
                        </div>
                        <p className="text-xs text-gray-700 line-clamp-2">{message.preview}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button 
                  className="w-full text-center py-1.5 text-xs font-semibold rounded-lg transition-colors hover:bg-blue-50"
                  style={{ color: '#4668AB' }}
                >
                  View All Activity
                </button>
              </div>
            </div>
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
                    Campaigns
                  </button>
                  <button
                    onClick={() => setActiveTab('invoices')}
                    className={`py-3 px-2 text-sm font-semibold border-b-2 transition-all duration-200 ${
                      activeTab === 'invoices'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Invoices
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