import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import apiClient from '../../../api/apiClient.js';
import {
  Calendar, TrendingUp, Eye, MessageCircle, ChevronRight,
  DollarSign, Clock, MapPin, User, Receipt, Plus
} from 'lucide-react';



// Types
interface DashboardStats {
  activeCampaigns: number;
  completedCampaigns: number;
  estimatedImpressions: number;
  totalSpent: number;
}

interface Campaign {
  id: string;
  name: string;
  startDate: string;
  budget: number;
  performance: string;
  status: 'active' | 'paused' | 'completed';
}

interface Invoice {
  id: string;
  campaignName: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
}

interface RecentMessage {
  id: string;
  sender: string;
  avatar: string;
  preview: string;
  timestamp: string;
  isRead: boolean;
}

export default function AdvertiserDashboard() {
  const { user, isLoaded: userLoaded } = useUser();
  const [activeTab, setActiveTab] = useState('campaigns');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [stats, setStats] = useState<DashboardStats>({
    activeCampaigns: 25,
    completedCampaigns: 120,
    estimatedImpressions: 5680,
    totalSpent: 0
  });

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

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
      sender: 'Send',
      avatar: '👤',
      preview: 'Your your visible your your message',
      timestamp: '2h ago',
      isRead: false
    },
    {
      id: '2',
      sender: 'Send', 
      avatar: '👤',
      preview: 'Your your resolve your message',
      timestamp: '4h ago',
      isRead: false
    },
    {
      id: '3',
      sender: 'Send',
      avatar: '👤', 
      preview: 'Your your sometimes hope',
      timestamp: '1d ago',
      isRead: true
    }
  ]);

  // ✅ Updated color scheme verification
  useEffect(() => {
    console.log('🎨 ADVERTISER DASHBOARD: Updated color scheme verification', {
      primaryBlue: '#4668AB',
      lightBlueBackground: '#F8FAFF',
      offWhiteCards: '#F9FAFB',
      lightGrayBorders: '#E5E7EB',
      timestamp: new Date().toISOString()
    });
  }, []);

  // ✅ Section titles verification
  useEffect(() => {
    console.log('✅ ADVERTISER DASHBOARD: Section titles verification', {
      leftSectionTitles: ['Key 3 Cards', 'Recent Messages'],
      rightSectionTitle: 'My Campaigns',
      layoutStructure: '50/50 split with aligned section titles',
      timestamp: new Date().toISOString()
    });
  }, []);

  // Fetch data on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch campaigns
        const campaignsResponse = await apiClient.getCampaigns();
        if (campaignsResponse.success) {
          setCampaigns(campaignsResponse.data || []);
        }
        
        // Fetch dashboard stats
        const dashboardResponse = await apiClient.getAdvertiserDashboard();
        if (dashboardResponse.success) {
          setStats({
            activeCampaigns: dashboardResponse.data.stats.activeCampaigns || 0,
            completedCampaigns: dashboardResponse.data.stats.completedCampaigns || 0,
            estimatedImpressions: dashboardResponse.data.stats.estimatedImpressions || 0,
            totalSpent: dashboardResponse.data.stats.totalSpent || 0
          });
        }
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    if (userLoaded && user?.id) {
      fetchDashboardData();
    } else if (userLoaded && !user) {
      setError('Please sign in to view your dashboard');
      setIsLoading(false);
    }
  }, [userLoaded, user?.id]);

  // ✅ CLEANED UP: Simplified Key Cards Component
  const KeyCard = ({ title, value, icon: Icon, comingSoon = false, highlighted = false }) => (
    <div 
      className={`rounded-lg p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
        highlighted ? 'ring-2 ring-blue-200' : ''
      }`}
      style={{ 
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: '#EFF6FF' }}
        >
          <Icon className="w-5 h-5" style={{ color: '#4668AB' }} />
        </div>
        {highlighted && (
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: '#4668AB' }}
          ></div>
        )}
      </div>
      <div className="text-xs text-gray-600 mb-1 font-medium">{title}</div>
      <div className="text-2xl font-bold text-gray-900 mb-1">#{value}</div>
      {comingSoon && (
        <div 
          className="text-xs font-medium mt-2 px-2 py-1 rounded-full inline-block"
          style={{ 
            backgroundColor: '#EFF6FF',
            color: '#4668AB'
          }}
        >
          Coming Soon
        </div>
      )}
    </div>
  );

  // ✅ CLEANED UP: Campaign Table Component
  const CampaignTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-medium text-gray-700">Campaign Name</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">Start Date</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">Budget</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">Performance</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign, index) => (
            <tr 
              key={campaign.id} 
              className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                index === 1 ? 'bg-blue-50' : ''
              }`}
              style={index === 1 ? { backgroundColor: '#EFF6FF' } : {}}
            >
              <td className="py-3 px-4 text-gray-900">{campaign.name}</td>
              <td className="py-3 px-4 text-gray-600">{campaign.startDate}</td>
              <td className="py-3 px-4 text-gray-600">{campaign.budget}</td>
              <td className="py-3 px-4 font-semibold text-gray-900">{campaign.performance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // ✅ CLEANED UP: Invoice Table Component  
  const InvoiceTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-medium text-gray-700">Campaign</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">Due Date</th>
            <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4 text-gray-900">{invoice.campaignName}</td>
              <td className="py-3 px-4 font-semibold text-gray-900">${invoice.amount.toLocaleString()}</td>
              <td className="py-3 px-4 text-gray-600">{invoice.dueDate}</td>
              <td className="py-3 px-4">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                  invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: '#F8FAFF' }}
      >
        <div className="text-center">
          <div 
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: '#4668AB', borderTopColor: 'transparent' }}
          ></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: '#F8FAFF' }}
      >
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#4668AB' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-full w-full"
      style={{ backgroundColor: '#F8FAFF' }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        
        {/* ✅ MAIN LAYOUT: 50/50 split - Key Cards & Messages | Campaigns & Invoices */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* ✅ LEFT SECTION - Key Cards & Recent Messages */}
          <div className="space-y-6">
            
            {/* Key 3 Cards Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Key 3 Cards</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <KeyCard
                  title="Active Campaigns"
                  value={stats.activeCampaigns}
                  icon={Calendar}
                />
                <KeyCard
                  title="Completed Campaigns"
                  value={stats.completedCampaigns}
                  icon={TrendingUp}
                  highlighted={false}
                />
                <KeyCard
                  title="Estimated Total Impressions"
                  value={stats.estimatedImpressions}
                  icon={Eye}
                  comingSoon={true}
                />
              </div>
            </div>

            {/* ✅ CLEANED UP: Recent Messages Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Messages</h2>
                <button 
                  className="text-sm font-medium hover:underline transition-colors"
                  style={{ color: '#4668AB' }}
                >
                  View All
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {recentMessages.map((message) => (
                  <div 
                    key={message.id}
                    className="rounded-lg p-3 hover:shadow-md transition-all duration-200 cursor-pointer"
                    style={{ 
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB'
                    }}
                  >
                    <div className="flex items-start space-x-2">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                        style={{ backgroundColor: '#EFF6FF' }}
                      >
                        {message.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-medium text-gray-900 truncate">{message.sender}</p>
                          <p className="text-xs text-gray-500">{message.timestamp}</p>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">{message.preview}</p>
                        {!message.isRead && (
                          <div 
                            className="w-1.5 h-1.5 rounded-full mt-2"
                            style={{ backgroundColor: '#4668AB' }}
                          ></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ✅ RIGHT SECTION - Campaigns/Invoices */}
          <div>
            {/* ✅ NEW: Add section title to match left column */}
            <h2 className="text-lg font-semibold text-gray-900 mb-4">My Campaigns</h2>
            
            <div 
              className="rounded-lg shadow-md transition-all duration-200"
              style={{ 
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB'
              }}
            >
              
              {/* ✅ CLEANED UP: Tab Headers */}
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('campaigns')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 ${
                      activeTab === 'campaigns'
                        ? 'text-white'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                    style={activeTab === 'campaigns' ? { 
                      borderBottomColor: '#4668AB',
                      backgroundColor: '#4668AB'
                    } : {}}
                  >
                    Campaigns
                  </button>
                  <button
                    onClick={() => setActiveTab('invoices')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 ${
                      activeTab === 'invoices'
                        ? 'text-white'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                    style={activeTab === 'invoices' ? {
                      borderBottomColor: '#4668AB',
                      backgroundColor: '#4668AB'
                    } : {}}
                  >
                    Invoices
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                <div className="mb-4 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {activeTab === 'campaigns' ? 'Campaign Performance' : 'Recent Invoices'}
                  </h3>
                  {activeTab === 'campaigns' && (
                    <button
                      onClick={() => window.location.href = '/create-campaign'}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Campaign
                    </button>
                  )}
                </div>

                {activeTab === 'campaigns' ? <CampaignTable /> : <InvoiceTable />}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ✅ Add verification function for testing
if (typeof window !== 'undefined') {
  window.verifyAdvertiserColors = () => {
    const lightBlueElements = document.querySelectorAll('[style*="F8FAFF"]');
    const whiteElements = document.querySelectorAll('[style*="FFFFFF"]');
    const blueElements = document.querySelectorAll('[style*="4668AB"]');
    
    console.log('🔍 ADVERTISER DASHBOARD COLOR VERIFICATION:', {
      lightBlueBackgroundFound: lightBlueElements.length,
      whiteCardsFound: whiteElements.length,
      blueElementsFound: blueElements.length,
      colorSchemeComplete: lightBlueElements.length > 0 && whiteElements.length > 0 && blueElements.length > 0
    });
    
    return {
      status: lightBlueElements.length > 0 && blueElements.length > 0 ? 'SUCCESS' : 'NEEDS_UPDATE',
      lightBlueElements: lightBlueElements.length,
      whiteElements: whiteElements.length,
      blueElements: blueElements.length
    };
  };
}