import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import VideoLoader from '@/components/ui/VideoLoader'; // ✅ ADDED VideoLoader import
import apiClient from '../../../api/apiClient.js';
import {
  Calendar, TrendingUp, Eye, MessageCircle, ChevronRight,
  DollarSign, Clock, MapPin, User, Receipt, Plus, ArrowUp, ArrowDown,
  Target, Activity, BarChart3, AlertTriangle, Zap, CheckCircle, Bell
} from 'lucide-react';

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
  const { user, isLoaded: userLoaded } = useUser();
  const [activeTab, setActiveTab] = useState('campaigns');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Enhanced data states
  const [stats, setStats] = useState<DashboardStats>({
    activeCampaigns: 25,
    completedCampaigns: 120,
    needsAttention: 3,
    totalImpressions: 5680
  });

  const [campaigns, setCampaigns] = useState<Campaign[]>([
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

  const [invoices, setInvoices] = useState<Invoice[]>([
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

  // ✅ SIMPLE LOADING SIMULATION
  useEffect(() => {
    console.log('🎨 SIDEBAR ADVERTISER DASHBOARD: VideoLoader implementation starting', {
      userLoaded,
      userId: user?.id,
      loadingAnimationType: 'VideoLoader with 3-second branded animation',
      timestamp: new Date().toISOString()
    });

    if (userLoaded && user?.id) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        console.log('✅ SIDEBAR ADVERTISER DASHBOARD: VideoLoader loading complete', {
          result: 'Consistent branded loading animation displayed',
          nextPhase: 'Replace remaining 88 loading instances',
          timestamp: new Date().toISOString()
        });
      }, 2000);

      return () => clearTimeout(timer);
    } else if (userLoaded && !user) {
      setError('Please sign in to view your dashboard');
      setIsLoading(false);
    }
  }, [userLoaded, user?.id]);

  // ✅ SIMPLE KPI LINE ITEM - Just Text, No Card Styling
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
    <div className={`flex items-center justify-between py-2 ${highlighted ? 'text-red-600' : 'text-gray-700'}`}>
      <div className="flex items-center space-x-2">
        <Icon className="w-4 h-4" style={{ color: '#4668AB' }} />
        <span className="text-sm font-medium">{title}</span>
      </div>
      <div className="text-right">
        <span className="text-sm font-bold text-gray-900">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </span>
        {change && (
          <div className={`flex items-center justify-end text-xs ${
            trend === 'up' ? 'text-emerald-600' : 
            trend === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trend === 'up' && <ArrowUp className="w-3 h-3 mr-1" />}
            {trend === 'down' && <ArrowDown className="w-3 h-3 mr-1" />}
            {change}
          </div>
        )}
      </div>
    </div>
  );

  // ✅ COMPACT CAMPAIGN TABLE
  const EnhancedCampaignTable = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Campaign Performance</h3>
          <button
            onClick={() => window.location.href = '/create-campaign'}
            className="inline-flex items-center px-4 py-2 text-sm font-bold text-white rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            style={{ 
              background: 'linear-gradient(135deg, #4668AB 0%, #5B7BC7 100%)',
              boxShadow: '0 4px 12px rgba(70, 104, 171, 0.2)'
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
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
  );

  // ✅ COMPACT INVOICE TABLE
  const EnhancedInvoiceTable = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
        <h3 className="text-lg font-bold text-gray-900">Recent Invoices</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
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
  );

  // ✅ UPDATED: Loading state now uses VideoLoader
  if (isLoading) {
    console.log('⏳ ADVERTISER DASHBOARD: Showing VideoLoader');
    return (
      <div 
        className="min-h-screen flex items-center justify-center px-4"
        style={{ 
          background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)'
        }}
      >
        <div className="text-center">
          <VideoLoader 
            size="xl"
            theme="brand"
            message="Loading advertiser dashboard..."
            showMessage={true}
            centered={true}
            containerClassName="mb-4"
          />
        </div>
      </div>
    );
  }

  // ✅ UPDATED: Error state with consistent styling
  if (error) {
    console.log('❌ ADVERTISER DASHBOARD: Showing error state:', error);
    return (
      <div 
        className="min-h-screen flex items-center justify-center px-4"
        style={{ 
          background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)'
        }}
      >
        <div className="text-center p-8 rounded-xl bg-white shadow-lg">
          <p className="text-red-600 mb-4 font-semibold">{error}</p>
          <button 
            onClick={() => {
              console.log('🔄 ADVERTISER DASHBOARD: Retrying after error');
              window.location.reload();
            }}
            className="px-6 py-3 rounded-lg text-white font-bold hover:opacity-90 transition-opacity"
            style={{ 
              background: 'linear-gradient(135deg, #4668AB 0%, #5B7BC7 100%)'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex"
      style={{ 
        background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)'
      }}
    >
      {/* ✅ LEFT SIDEBAR - Compact Design */}
      <div 
        className="fixed left-0 top-14 bottom-0 w-80 bg-white shadow-xl border-r border-gray-200 overflow-y-auto"
        style={{ 
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFBFF 100%)'
        }}
      >
        <div className="p-4">
          {/* ✅ KPI METRICS SECTION - Simple Line Items */}
          <div className="mb-6">
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" style={{ color: '#4668AB' }} />
              Performance Metrics
            </h2>
            <div className="space-y-1">
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

          {/* ✅ RECENT ACTIVITY SECTION - Compact Design */}
          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
              <Activity className="w-4 h-4 mr-2" style={{ color: '#4668AB' }} />
              Recent Activity
            </h2>
            <div className="space-y-3">
              {recentMessages.map((message, index) => (
                <div 
                  key={message.id}
                  className="rounded-lg p-3 hover:shadow-sm transition-all duration-200 cursor-pointer relative border"
                  style={{ 
                    background: message.priority === 'high' ? '#FEF3F2' : '#FFFFFF',
                    borderColor: message.priority === 'high' ? '#FCA5A5' : '#E2E8F0'
                  }}
                >
                  {message.priority === 'high' && !message.isRead && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                  
                  <div className="flex items-start space-x-3">
                    <div className="text-lg flex-shrink-0">
                      {message.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold text-gray-900 truncate">{message.sender}</p>
                        <p className="text-xs text-gray-500">{message.timestamp}</p>
                      </div>
                      <p className="text-xs text-gray-700 line-clamp-2">{message.preview}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              <button 
                className="w-full text-center py-2 text-xs font-semibold rounded-lg transition-colors hover:bg-blue-50"
                style={{ color: '#4668AB' }}
              >
                View All Activity
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ MAIN CONTENT AREA */}
      <div className="flex-1 ml-80 p-6">
        <div className="max-w-6xl">
          {/* ✅ HEADER SECTION */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Campaign Management</h1>
          </div>

          {/* ✅ TAB NAVIGATION */}
          <div className="mb-6">
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

          {/* ✅ TAB CONTENT */}
          <div>
            {activeTab === 'campaigns' ? <EnhancedCampaignTable /> : <EnhancedInvoiceTable />}
          </div>
        </div>
      </div>
    </div>
  );
}