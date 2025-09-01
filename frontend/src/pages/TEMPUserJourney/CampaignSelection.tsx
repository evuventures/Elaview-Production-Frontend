// src/pages/campaigns/EnhancedCampaignSelection.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Plus, Sparkles, Target, BarChart3, Calendar, 
  DollarSign, Clock, CheckCircle2, AlertCircle, Loader2, 
  ChevronRight, MapPin, TrendingUp, Play, Eye
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
  impressions: number;
  clicks: number;
  conversions: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

// Status color mapping for campaigns
const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    DRAFT: 'bg-slate-100 text-slate-700',
    PENDING_APPROVAL: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-blue-100 text-blue-700',
    ACTIVE: 'bg-green-100 text-green-700',
    PAUSED: 'bg-orange-100 text-orange-700',
    COMPLETED: 'bg-purple-100 text-purple-700',
    CANCELLED: 'bg-red-100 text-red-700'
  };
  return colors[status] || 'bg-slate-100 text-slate-700';
};

// Format currency helper
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Format date helper
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export default function EnhancedCampaignSelection() {
  const navigate = useNavigate();
  const { user } = useUser();

  // State management
  const [selectedSpace, setSelectedSpace] = useState<SelectedSpace | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

  useEffect(() => {
    initializePage();
  }, []);

  // Initialize page data
  const initializePage = async (): Promise<void> => {
    try {
      // Retrieve space data from sessionStorage
      const spaceDataRaw = sessionStorage.getItem('selectedSpace');
      
      if (!spaceDataRaw) {
        setError('No space selected. Please go back and select a space.');
        setIsLoading(false);
        return;
      }

      const spaceData: SelectedSpace = JSON.parse(spaceDataRaw);
      setSelectedSpace(spaceData);

      // Fetch user's campaigns
      await fetchCampaigns();

    } catch (error) {
      console.error('Error initializing page:', error);
      setError('Failed to initialize page. Please try again.');
      setIsLoading(false);
    }
  };

  // Fetch user's campaigns
  const fetchCampaigns = async (): Promise<void> => {
    try {
      const response = await apiClient.getCampaigns({
        userId: user?.id,
        limit: 50,
        sortBy: 'updatedAt',
        sortOrder: 'desc'
      });

      if (response.success && response.data) {
        const campaignsArray: Campaign[] = Array.isArray(response.data) 
          ? response.data 
          : response.data.campaigns || [];
        setCampaigns(campaignsArray);
      } else {
        setCampaigns([]);
      }

    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setCampaigns([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle campaign selection
  const handleCampaignSelect = (campaignId: string): void => {
    setSelectedCampaign(campaignId);
  };

  // Handle proceeding with selected campaign
  const handleProceedWithCampaign = (): void => {
    if (!selectedCampaign || !selectedSpace) return;

    const campaign = campaigns.find(c => c.id === selectedCampaign);

    // Store both campaign and space data for next step
    sessionStorage.setItem('selectedCampaign', JSON.stringify({
      id: campaign?.id,
      name: campaign?.name,
      brand_name: campaign?.brand_name,
      objective: campaign?.primary_objective
    }));

    navigate('/AdvertiserConfirmation');
  };

  // Handle creating new campaign
  const handleCreateNewCampaign = (): void => {
    if (selectedSpace) {
      sessionStorage.setItem('spaceForCampaign', JSON.stringify(selectedSpace));
    }
    navigate('/create-campaign');
  };

  // Handle going back
  const handleGoBack = (): void => {
    navigate(-1);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner-glass w-8 h-8 mx-auto mb-4"></div>
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
          <button
            onClick={handleGoBack}
            className="btn-outline btn-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
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
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors focus-visible-ring"
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
        {/* Selected Space Summary */}
        {selectedSpace && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-glass-hover p-6 mb-8"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(70, 104, 171, 0.1)' }}
                >
                  <MapPin className="w-6 h-6" style={{ color: 'rgb(70, 104, 171)' }} />
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
                className="card-glass p-8 text-center"
              >
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ 
                    background: 'linear-gradient(135deg, rgb(70, 104, 171), rgb(91, 123, 199))'
                  }}
                >
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="heading-2 mb-3">Create your first campaign</h2>
                <p className="body-medium text-slate-600 mb-6 max-w-md mx-auto">
                  Get started with advertising on premium spaces. We'll guide you through creating a 
                  high-impact campaign that drives results.
                </p>
                
                {/* Benefits */}
                <div className="grid sm:grid-cols-3 gap-4 mb-8">
                  <div className="text-center">
                    <Target className="w-6 h-6 mx-auto mb-2" style={{ color: 'rgb(70, 104, 171)' }} />
                    <p className="text-sm font-medium text-slate-900">Targeted Reach</p>
                    <p className="text-xs text-slate-500">Reach your ideal customers</p>
                  </div>
                  <div className="text-center">
                    <BarChart3 className="w-6 h-6 mx-auto mb-2" style={{ color: 'rgb(70, 104, 171)' }} />
                    <p className="text-sm font-medium text-slate-900">Analytics</p>
                    <p className="text-xs text-slate-500">Track performance metrics</p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="w-6 h-6 mx-auto mb-2" style={{ color: 'rgb(70, 104, 171)' }} />
                    <p className="text-sm font-medium text-slate-900">Growth</p>
                    <p className="text-xs text-slate-500">Scale your business</p>
                  </div>
                </div>

                <button
                  onClick={handleCreateNewCampaign}
                  className="btn-primary btn-large"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Campaign
                </button>
              </motion.div>
            ) : (
              /* Existing Campaigns */
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="heading-3">
                    Your Campaigns ({campaigns.length})
                  </h2>
                  <button
                    onClick={handleCreateNewCampaign}
                    className="btn-outline btn-medium"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New
                  </button>
                </div>

                <div className="space-y-4">
                  {campaigns.map((campaign, index) => (
                    <motion.div
                      key={campaign.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`card-glass p-6 cursor-pointer transition-all hover:shadow-xl ${
                        selectedCampaign === campaign.id 
                          ? 'ring-2 ring-opacity-50' 
                          : ''
                      }`}
                      style={{
                        ...(selectedCampaign === campaign.id && {
                          '--tw-ring-color': 'rgb(70, 104, 171)'
                        })
                      }}
                      onClick={() => handleCampaignSelect(campaign.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-slate-900">
                              {campaign.name || campaign.brand_name}
                            </h3>
                            <span className={`mobile-badge ${getStatusColor(campaign.status)}`}>
                              {campaign.status}
                            </span>
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
                            <CheckCircle2 className="w-6 h-6" style={{ color: 'rgb(70, 104, 171)' }} />
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
            <div className="card-glass p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Next Steps</h3>
              
              {campaigns.length > 0 ? (
                <div className="space-y-3">
                  <button
                    onClick={handleProceedWithCampaign}
                    disabled={!selectedCampaign}
                    className="btn-primary btn-medium w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue with Selected Campaign
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </button>
                  
                  <div className="text-center text-sm text-slate-500">or</div>
                  
                  <button
                    onClick={handleCreateNewCampaign}
                    className="btn-outline btn-medium w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Campaign
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleCreateNewCampaign}
                  className="btn-primary btn-medium w-full"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get Started Now
                </button>
              )}
            </div>

            {/* Help Panel */}
            <div 
              className="card-glass p-6" 
              style={{ 
                background: 'linear-gradient(135deg, rgba(70, 104, 171, 0.1), rgba(70, 104, 171, 0.05))' 
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgb(70, 104, 171)' }}
                >
                  <Play className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-semibold" style={{ color: 'rgb(70, 104, 171)' }}>Need Help?</h4>
              </div>
              <p className="text-sm mb-4" style={{ color: 'rgb(57, 85, 140)' }}>
                Learn how to create effective advertising campaigns that drive results.
              </p>
              <button 
                className="btn-outline btn-small"
                style={{ 
                  color: 'rgb(70, 104, 171)',
                  borderColor: 'rgba(70, 104, 171, 0.3)'
                }}
              >
                Watch Tutorial
              </button>
            </div>

            {/* Stats Panel */}
            {campaigns.length > 0 && (
              <div className="card-glass p-6">
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
                    <span className="font-medium text-slate-600">
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