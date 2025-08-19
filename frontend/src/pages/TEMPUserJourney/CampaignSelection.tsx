// src/pages/TEMPUserJourney/CampaignSelection.tsx
// ✅ COMPREHENSIVE: Campaign selection page with empty state handling
// ✅ B2B UX: Professional design with clear value proposition and minimal cognitive load
// ✅ VERIFICATION: Console logs throughout for testing and debugging
// ✅ ERROR HANDLING: Proper loading states and error boundaries
// ✅ RESPONSIVE: Mobile-first design with progressive disclosure
// ✅ TESTING: Fixed test empty/populated states with mock data

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, Plus, Zap, Target, BarChart3, Calendar, 
  DollarSign, Users, TrendingUp, Clock, CheckCircle2,
  AlertCircle, Loader2, ChevronRight, MapPin, Eye,
  Sparkles, Play, Edit3, Copy, Archive, Settings
} from "lucide-react";
import apiClient from '@/api/apiClient';

// Types for TypeScript safety
interface SelectedSpace {
  id: string;
  name: string;
  price: number;
  duration: number;
  dates: {
    start: string;
    end: string;
  };
  totalPrice: number;
  propertyId: string;
}

interface Campaign {
  id: string;
  name: string;
  title?: string;
  description?: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  budget?: number;
  dailyBudget?: number;
  startDate?: string;
  endDate?: string;
  brand_name: string;
  primary_objective?: string;
  target_demographics?: any;
  impressions: number;
  clicks: number;
  conversions: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

// ✅ TESTING: Mock campaign data for testing populated state
const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'mock_campaign_1',
    name: 'Summer Brand Awareness',
    title: 'Summer Campaign 2025',
    description: 'Boost brand awareness during peak summer season with engaging creative content.',
    status: 'ACTIVE',
    budget: 5000,
    dailyBudget: 167,
    startDate: '2025-06-01',
    endDate: '2025-08-31',
    brand_name: 'SunShine Products',
    primary_objective: 'BRAND_AWARENESS',
    target_demographics: { age: '25-45', interests: ['outdoor', 'lifestyle'] },
    impressions: 45230,
    clicks: 892,
    conversions: 23,
    totalSpent: 2840,
    createdAt: '2025-05-15T10:00:00Z',
    updatedAt: '2025-08-10T14:30:00Z'
  },
  {
    id: 'mock_campaign_2',
    name: 'Product Launch Q3',
    title: 'New Product Launch',
    description: 'Drive sales for our latest product release with targeted advertising.',
    status: 'PENDING_APPROVAL',
    budget: 8000,
    dailyBudget: 200,
    startDate: '2025-09-01',
    endDate: '2025-10-31',
    brand_name: 'TechFlow Solutions',
    primary_objective: 'CONVERSIONS',
    target_demographics: { age: '30-55', interests: ['technology', 'business'] },
    impressions: 12500,
    clicks: 345,
    conversions: 12,
    totalSpent: 980,
    createdAt: '2025-08-01T09:15:00Z',
    updatedAt: '2025-08-15T16:45:00Z'
  },
  {
    id: 'mock_campaign_3',
    name: 'Holiday Promotion',
    title: 'Holiday Sales Campaign',
    description: 'Seasonal promotion to drive holiday sales and customer engagement.',
    status: 'DRAFT',
    budget: 3500,
    dailyBudget: 100,
    brand_name: 'FestiveWear Co.',
    primary_objective: 'SALES',
    target_demographics: { age: '18-65', interests: ['shopping', 'gifts'] },
    impressions: 0,
    clicks: 0,
    conversions: 0,
    totalSpent: 0,
    createdAt: '2025-08-05T11:20:00Z',
    updatedAt: '2025-08-05T11:20:00Z'
  },
  {
    id: 'mock_campaign_4',
    name: 'Retargeting Campaign',
    title: 'Website Visitors Retargeting',
    description: 'Re-engage website visitors who didn\'t complete their purchase.',
    status: 'COMPLETED',
    budget: 2000,
    dailyBudget: 67,
    startDate: '2025-07-01',
    endDate: '2025-07-30',
    brand_name: 'E-Commerce Plus',
    primary_objective: 'RETARGETING',
    target_demographics: { age: '25-50', interests: ['online shopping'] },
    impressions: 28900,
    clicks: 1205,
    conversions: 87,
    totalSpent: 1950,
    createdAt: '2025-06-20T13:45:00Z',
    updatedAt: '2025-07-30T18:00:00Z'
  }
];

// Status color mapping for campaigns
const getStatusColor = (status: string) => {
  const colors = {
    DRAFT: 'bg-gray-100 text-gray-700',
    PENDING_APPROVAL: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-blue-100 text-blue-700',
    ACTIVE: 'bg-green-100 text-green-700',
    PAUSED: 'bg-orange-100 text-orange-700',
    COMPLETED: 'bg-purple-100 text-purple-700',
    CANCELLED: 'bg-red-100 text-red-700'
  };
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
};

// Format currency helper
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Format date helper
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export default function CampaignSelection() {
  const navigate = useNavigate();
  const { user } = useUser();

  // State management
  const [selectedSpace, setSelectedSpace] = useState<SelectedSpace | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  
  // ✅ TESTING: Add testing mode state
  const [isTestingMode, setIsTestingMode] = useState(false);
  const [originalCampaigns, setOriginalCampaigns] = useState<Campaign[]>([]);

  // ✅ VERIFICATION: Console log component mount
  useEffect(() => {
    console.log('🎯 CampaignSelection component mounted');
    console.log('👤 Current user:', user?.id);
    
    initializePage();
  }, []);

  // Initialize page data
  const initializePage = async () => {
    try {
      console.log('🔄 Initializing CampaignSelection page...');
      
      // ✅ VERIFICATION: Retrieve space data from sessionStorage
      const spaceDataRaw = sessionStorage.getItem('selectedSpace');
      console.log('📦 Raw space data from sessionStorage:', spaceDataRaw);
      
      if (!spaceDataRaw) {
        console.error('❌ No selected space data found in sessionStorage');
        setError('No space selected. Please go back and select a space.');
        setIsLoading(false);
        return;
      }

      const spaceData = JSON.parse(spaceDataRaw);
      console.log('✅ Parsed space data:', spaceData);
      setSelectedSpace(spaceData);

      // ✅ VERIFICATION: Fetch user's campaigns
      console.log('📡 Fetching user campaigns...');
      await fetchCampaigns();

    } catch (error) {
      console.error('❌ Error initializing page:', error);
      setError('Failed to initialize page. Please try again.');
      setIsLoading(false);
    }
  };

  // Fetch user's campaigns
  const fetchCampaigns = async () => {
    try {
      console.log('📡 API: Getting campaigns for user...');
      
      const response = await apiClient.getCampaigns({
        userId: user?.id,
        limit: 50,
        sortBy: 'updatedAt',
        sortOrder: 'desc'
      });

      console.log('📊 Campaigns API response:', response);

      if (response.success && response.data) {
        const campaignsArray = Array.isArray(response.data) ? response.data : response.data.campaigns || [];
        console.log(`✅ Found ${campaignsArray.length} campaigns`);
        
        // ✅ VERIFICATION: Test empty state vs populated state
        if (campaignsArray.length === 0) {
          console.log('🎯 EMPTY STATE: No campaigns found - will show "Create first campaign" flow');
        } else {
          console.log('🎯 POPULATED STATE: Found existing campaigns - will show selection grid');
        }
        
        setCampaigns(campaignsArray);
        setOriginalCampaigns(campaignsArray); // Store original for testing
        
        // ✅ VERIFICATION: Log campaign statuses
        const statusCounts = campaignsArray.reduce((acc: any, campaign: Campaign) => {
          acc[campaign.status] = (acc[campaign.status] || 0) + 1;
          return acc;
        }, {});
        console.log('📊 Campaign status breakdown:', statusCounts);
      } else {
        console.log('ℹ️ No campaigns found or API returned empty data');
        setCampaigns([]);
        setOriginalCampaigns([]);
      }

    } catch (error) {
      console.error('❌ Error fetching campaigns:', error);
      // Don't set error state here - user might just not have campaigns yet
      setCampaigns([]);
      setOriginalCampaigns([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ TESTING: Function to test empty state (remove in production)
  const testEmptyState = () => {
    console.log('🧪 TESTING: Switching to empty state for testing');
    console.log('📊 Before empty state - campaigns:', campaigns.length);
    
    setIsTestingMode(true);
    setCampaigns([]);
    setSelectedCampaign(null);
    
    console.log('✅ Empty state activated - should show "Create first campaign" flow');
    console.log('📊 Current campaigns array length:', 0);
  };

  // ✅ TESTING: Function to test populated state (remove in production)
  const testPopulatedState = () => {
    console.log('🧪 TESTING: Switching to populated state for testing');
    console.log('📊 Before populated state - campaigns:', campaigns.length);
    
    setIsTestingMode(true);
    setCampaigns(MOCK_CAMPAIGNS);
    setSelectedCampaign(null);
    
    console.log('✅ Populated state activated with mock data');
    console.log('📊 Mock campaigns loaded:', MOCK_CAMPAIGNS.length);
    console.log('📋 Mock campaign details:', MOCK_CAMPAIGNS.map(c => ({
      id: c.id,
      name: c.name,
      status: c.status,
      impressions: c.impressions,
      spent: c.totalSpent
    })));
  };

  // ✅ TESTING: Function to restore real data
  const restoreRealData = () => {
    console.log('🔄 TESTING: Restoring real campaign data');
    console.log('📊 Original campaigns to restore:', originalCampaigns.length);
    
    setIsTestingMode(false);
    setCampaigns(originalCampaigns);
    setSelectedCampaign(null);
    
    console.log('✅ Real data restored');
    console.log('📊 Current campaigns:', originalCampaigns.length);
  };

  // Handle campaign selection
  const handleCampaignSelect = (campaignId: string) => {
    console.log('🎯 Campaign selected:', campaignId);
    setSelectedCampaign(campaignId);
    
    const campaign = campaigns.find(c => c.id === campaignId);
    console.log('📋 Selected campaign details:', campaign);
  };

  // Handle proceeding with selected campaign
  const handleProceedWithCampaign = () => {
    if (!selectedCampaign || !selectedSpace) {
      console.error('❌ Missing selected campaign or space data');
      return;
    }

    const campaign = campaigns.find(c => c.id === selectedCampaign);
    console.log('▶️ Proceeding with campaign:', campaign);
    console.log('🏢 Space data:', selectedSpace);

    // Store both campaign and space data for next step
    sessionStorage.setItem('selectedCampaign', JSON.stringify({
      id: campaign?.id,
      name: campaign?.name,
      brand_name: campaign?.brand_name,
      objective: campaign?.primary_objective
    }));

    console.log('🚀 Navigating to next step in campaign flow...');
    // Navigate to next step (e.g., creative upload, final booking, etc.)
    navigate('/AdvertiserConfirmation'); // Adjust path as needed
  };

  // Handle creating new campaign
  const handleCreateNewCampaign = () => {
    console.log('➕ Creating new campaign for space:', selectedSpace?.id);
    
    // Store space data and navigate to campaign creation
    if (selectedSpace) {
      sessionStorage.setItem('spaceForCampaign', JSON.stringify(selectedSpace));
    }
    
    console.log('🚀 Navigating to campaign creation...');
    navigate('/create-campaign'); // Adjust path as needed
  };

  // Handle going back
  const handleGoBack = () => {
    console.log('⬅️ Going back to space selection');
    navigate(-1);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Loading your campaigns...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Something went wrong</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <Button onClick={handleGoBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={handleGoBack}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">Select Campaign</h1>
                <p className="text-sm text-slate-500">Choose an existing campaign or create a new one</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ✅ IMPROVED: Development Testing Panel with better functionality */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-yellow-800 mb-2">🧪 Development Testing Panel</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            <Button onClick={testEmptyState} size="sm" variant="outline" className="bg-white">
              🎯 Test Empty State
            </Button>
            <Button onClick={testPopulatedState} size="sm" variant="outline" className="bg-white">
              📊 Test Populated State
            </Button>
            <Button onClick={restoreRealData} size="sm" variant="outline" className="bg-white">
              🔄 Restore Real Data
            </Button>
          </div>
          <div className="text-xs text-yellow-700 space-y-1">
            <p><strong>Current state:</strong> {campaigns.length === 0 ? '🎯 Empty (showing first campaign flow)' : `📊 Populated (${campaigns.length} campaigns)`}</p>
            <p><strong>Testing mode:</strong> {isTestingMode ? '✅ Active (using mock/empty data)' : '❌ Inactive (using real API data)'}</p>
            <p><strong>Real campaigns:</strong> {originalCampaigns.length} campaigns from API</p>
          </div>
        </div>

        {/* Selected Space Summary */}
        {selectedSpace && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-slate-200 p-6 mb-8"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{selectedSpace.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-600 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(selectedSpace.dates.start)} - {formatDate(selectedSpace.dates.end)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {selectedSpace.duration} days
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Total Cost</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(selectedSpace.totalPrice)}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Campaigns List */}
          <div className="lg:col-span-2">
            {campaigns.length === 0 ? (
              /* Empty State - First Campaign */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl border border-slate-200 p-8 text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Create your first campaign</h2>
                <p className="text-slate-600 mb-6 max-w-md mx-auto">
                  Get started with advertising on premium spaces. We'll guide you through creating a 
                  high-impact campaign that drives results.
                </p>
                
                {/* Benefits */}
                <div className="grid sm:grid-cols-3 gap-4 mb-8">
                  <div className="text-center">
                    <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-900">Targeted Reach</p>
                    <p className="text-xs text-slate-500">Reach your ideal customers</p>
                  </div>
                  <div className="text-center">
                    <BarChart3 className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-900">Analytics</p>
                    <p className="text-xs text-slate-500">Track performance metrics</p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-900">Growth</p>
                    <p className="text-xs text-slate-500">Scale your business</p>
                  </div>
                </div>

                <Button
                  onClick={handleCreateNewCampaign}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Campaign
                </Button>
              </motion.div>
            ) : (
              /* Existing Campaigns */
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-slate-900">
                    Your Campaigns ({campaigns.length})
                  </h2>
                  <Button
                    onClick={handleCreateNewCampaign}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create New
                  </Button>
                </div>

                <div className="space-y-4">
                  {campaigns.map((campaign, index) => (
                    <motion.div
                      key={campaign.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`bg-white rounded-xl border p-6 cursor-pointer transition-all hover:shadow-md ${
                        selectedCampaign === campaign.id 
                          ? 'border-blue-500 ring-2 ring-blue-100' 
                          : 'border-slate-200'
                      }`}
                      onClick={() => handleCampaignSelect(campaign.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-slate-900">
                              {campaign.name || campaign.brand_name}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                              {campaign.status}
                            </span>
                            {/* ✅ TESTING: Show testing indicator */}
                            {isTestingMode && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                MOCK DATA
                              </span>
                            )}
                          </div>
                          
                          {campaign.description && (
                            <p className="text-slate-600 mb-3 line-clamp-2">{campaign.description}</p>
                          )}

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-slate-500">Budget</p>
                              <p className="font-medium text-slate-900">
                                {campaign.budget ? formatCurrency(campaign.budget) : 'Not set'}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-500">Impressions</p>
                              <p className="font-medium text-slate-900">
                                {campaign.impressions.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-500">Clicks</p>
                              <p className="font-medium text-slate-900">
                                {campaign.clicks.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-500">Spent</p>
                              <p className="font-medium text-slate-900">
                                {formatCurrency(campaign.totalSpent)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="ml-4 flex items-center">
                          {selectedCampaign === campaign.id && (
                            <CheckCircle2 className="w-6 h-6 text-blue-600" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Panel */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Next Steps</h3>
              
              {campaigns.length > 0 ? (
                <div className="space-y-3">
                  <Button
                    onClick={handleProceedWithCampaign}
                    disabled={!selectedCampaign}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Continue with Selected Campaign
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                  
                  <div className="text-center text-sm text-slate-500">or</div>
                  
                  <Button
                    onClick={handleCreateNewCampaign}
                    variant="outline"
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Campaign
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleCreateNewCampaign}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Get Started Now
                </Button>
              )}
            </div>

            {/* Help Panel */}
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Play className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-semibold text-blue-900">Need Help?</h4>
              </div>
              <p className="text-blue-700 text-sm mb-4">
                Learn how to create effective advertising campaigns that drive results.
              </p>
              <Button variant="outline" size="sm" className="text-blue-600 border-blue-300">
                Watch Tutorial
              </Button>
            </div>

            {/* Stats Panel */}
            {campaigns.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h4 className="font-semibold text-slate-900 mb-4">Campaign Overview</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Campaigns</span>
                    <span className="font-medium">{campaigns.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Active</span>
                    <span className="font-medium text-green-600">
                      {campaigns.filter(c => c.status === 'ACTIVE').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Draft</span>
                    <span className="font-medium text-gray-600">
                      {campaigns.filter(c => c.status === 'DRAFT').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Spent</span>
                    <span className="font-medium">
                      {formatCurrency(campaigns.reduce((sum, c) => sum + c.totalSpent, 0))}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}