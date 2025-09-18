// src/pages/campaigns/EnhancedCampaignSelection.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Plus, Target, Calendar, Clock, CheckCircle2, 
  AlertCircle, Loader2, ChevronRight, MapPin, Play, 
  Edit, X, MoreVertical, Rocket, Zap, TrendingUp,
  MessageCircle, Phone, Mail, Settings
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
  type?: string;
  audience?: string;
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
  ctr?: number;
}

interface RecommendedSpace {
  id: string;
  name: string;
  type: string;
  audience: string;
  pricePerDay: number;
  location: string;
  image?: string;
}

// Status color mapping for campaigns
const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    DRAFT: 'bg-purple-100 text-purple-700',
    PENDING_APPROVAL: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-blue-100 text-blue-700',
    ACTIVE: 'bg-green-100 text-green-700',
    PAUSED: 'bg-orange-100 text-orange-700',
    COMPLETED: 'bg-gray-100 text-gray-700',
    CANCELLED: 'bg-red-100 text-red-700'
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
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

// Format numbers with commas
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export default function EnhancedCampaignSelection() {
  const navigate = useNavigate();
  const { user } = useUser();

  // State management
  const [selectedSpaces, setSelectedSpaces] = useState<SelectedSpace[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [recommendedSpaces, setRecommendedSpaces] = useState<RecommendedSpace[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalSpent: 0,
    avgROAS: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

  // Remove mock data - will fetch real data from API
  useEffect(() => {
    initializePage();
  }, []);

  // Initialize page data
  const initializePage = async (): Promise<void> => {
    try {
      // Retrieve space data from sessionStorage
      const spaceDataRaw = sessionStorage.getItem('selectedSpaces') || sessionStorage.getItem('selectedSpace');
      
      console.log('🔍 Raw space data from sessionStorage:', spaceDataRaw);
      
      if (!spaceDataRaw) {
        setError('No spaces selected. Please go back and select advertising spaces.');
        setIsLoading(false);
        return;
      }

      let spacesData: SelectedSpace[];
      const parsedData = JSON.parse(spaceDataRaw);
      
      console.log('📊 Parsed space data:', parsedData);
      
      // Handle both single space and multiple spaces
      if (Array.isArray(parsedData)) {
        spacesData = parsedData;
      } else {
        spacesData = [parsedData];
      }
      
      console.log('📋 Final spaces data:', spacesData);
      setSelectedSpaces(spacesData);

      // Fetch all data in parallel
      await Promise.all([
        fetchCampaigns(),
        fetchRecommendedSpaces(),
        fetchUserStats()
      ]);

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
    }
  };

  // Fetch recommended spaces based on current selection
  const fetchRecommendedSpaces = async (): Promise<void> => {
    try {
      // Get recommended spaces based on location and space type
      const selectedCities = [...new Set(selectedSpaces.map(space => space.city).filter(Boolean))];
      const selectedTypes = [...new Set(selectedSpaces.map(space => space.surfaceType || space.type).filter(Boolean))];
      
      const params = {
        limit: 6,
        featured: 'true',
        excludeIds: selectedSpaces.map(space => space.id).join(',')
      };
      
      // Add location filter if we have cities
      if (selectedCities.length > 0) {
        params.city = selectedCities[0]; // Use first city as base
      }

      const response = await apiClient.getSpaces(params);

      if (response.success && response.data) {
        const spacesArray: RecommendedSpace[] = Array.isArray(response.data) 
          ? response.data 
          : response.data.spaces || [];
        
        // Filter out already selected spaces and limit results
        const filteredSpaces = spacesArray
          .filter(space => !selectedSpaces.some(selected => selected.id === space.id))
          .slice(0, 6);
          
        setRecommendedSpaces(filteredSpaces);
      } else {
        setRecommendedSpaces([]);
      }

    } catch (error) {
      console.error('Error fetching recommended spaces:', error);
      setRecommendedSpaces([]);
    }
  };

  // Fetch user account statistics from campaigns
  const fetchUserStats = async (): Promise<void> => {
    try {
      const response = await apiClient.getCampaigns({
        userId: user?.id,
        limit: 100 // Get more to calculate stats
      });

      if (response.success && response.data) {
        const campaignsArray: Campaign[] = Array.isArray(response.data) 
          ? response.data 
          : response.data.campaigns || [];
        
        // Calculate stats from campaigns
        const totalCampaigns = campaignsArray.length;
        const activeCampaigns = campaignsArray.filter(c => c.status === 'ACTIVE').length;
        const totalSpent = campaignsArray.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
        
        // Calculate average ROAS if we have spend and conversions data
        const campaignsWithROAS = campaignsArray.filter(c => c.totalSpent > 0 && c.conversions > 0);
        let avgROAS = 0;
        if (campaignsWithROAS.length > 0) {
          const totalROAS = campaignsWithROAS.reduce((sum, c) => {
            const roas = (c.conversions * 50) / c.totalSpent; // Assume $50 per conversion
            return sum + roas;
          }, 0);
          avgROAS = totalROAS / campaignsWithROAS.length;
        }

        setUserStats({
          totalCampaigns,
          activeCampaigns,
          totalSpent,
          avgROAS: avgROAS > 0 ? avgROAS : undefined
        });
      }

    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Keep default stats on error
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate total cost and duration based on real space data
  const totalCost = selectedSpaces.reduce((sum, space) => {
    const rate = space.baseRate || space.totalPrice || 0;
    return sum + (rate * space.duration);
  }, 0);
  const totalDays = selectedSpaces.reduce((sum, space) => sum + space.duration, 0);

  // Handle campaign selection
  const handleCampaignSelect = (campaignId: string): void => {
    setSelectedCampaign(selectedCampaign === campaignId ? null : campaignId);
  };

  // Handle proceeding with selected campaign
  const handleProceedWithCampaign = (e?: React.MouseEvent): void => {
    e?.preventDefault();
    console.log('🚀 handleProceedWithCampaign called!');
    console.log('selectedCampaign:', selectedCampaign);
    console.log('selectedSpaces:', selectedSpaces);
    
    if (!selectedCampaign) {
      console.error('❌ No campaign selected');
      alert('Please select a campaign first');
      return;
    }
    
    if (selectedSpaces.length === 0) {
      console.error('❌ No spaces selected');
      alert('No advertising spaces selected');
      return;
    }

    const campaign = campaigns.find(c => c.id === selectedCampaign);
    console.log('🎯 Found campaign:', campaign);

    // Store both campaign and space data for next step
    const campaignData = {
      id: campaign?.id,
      name: campaign?.name,
      brand_name: campaign?.brand_name,
      objective: campaign?.primary_objective
    };
    
    console.log('💾 Storing campaign data:', campaignData);
    sessionStorage.setItem('selectedCampaign', JSON.stringify(campaignData));

    console.log('💾 Storing spaces data:', selectedSpaces);
    sessionStorage.setItem('selectedSpaces', JSON.stringify(selectedSpaces));

    console.log('🔄 Attempting navigation to /AdvertiserConfirmation');
    try {
      navigate('/AdvertiserConfirmation');
      console.log('✅ Navigation called successfully');
    } catch (error) {
      console.error('❌ Navigation failed:', error);
    }
  };

  // Handle creating new campaign
  const handleCreateNewCampaign = (): void => {
    if (selectedSpaces.length > 0) {
      sessionStorage.setItem('spacesForCampaign', JSON.stringify(selectedSpaces));
    }
    navigate('/create-campaign');
  };

  // Handle adding recommended space
  const handleAddRecommendedSpace = (space: RecommendedSpace): void => {
    // Convert recommended space to selected space format
    const newSpace: SelectedSpace = {
      id: space.id,
      name: space.name,
      title: space.title,
      baseRate: space.baseRate || 0,
      rateType: space.rateType as any || 'DAILY',
      duration: 7, // Default 7 days
      dates: {
        start: new Date().toISOString(),
        end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      totalPrice: (space.baseRate || 0) * 7,
      propertyId: space.propertyId || space.id,
      type: space.type,
      city: space.city,
      state: space.state,
      country: 'US', // Default
      dimensions: space.dimensions,
      features: space.features,
      surfaceType: space.surfaceType,
      spaceCategory: space.spaceCategory
    };

    setSelectedSpaces(prev => [...prev, newSpace]);
    
    // Update sessionStorage
    sessionStorage.setItem('selectedSpaces', JSON.stringify([...selectedSpaces, newSpace]));
    
    // Remove from recommended spaces
    setRecommendedSpaces(prev => prev.filter(s => s.id !== space.id));
  };

  // Handle removing space
  const handleRemoveSpace = (spaceId: string): void => {
    const updatedSpaces = selectedSpaces.filter(space => space.id !== spaceId);
    setSelectedSpaces(updatedSpaces);
    sessionStorage.setItem('selectedSpaces', JSON.stringify(updatedSpaces));
  };

  // Handle going back
  const handleGoBack = (): void => {
    navigate(-1);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading your campaigns...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleGoBack}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={handleGoBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Select Campaign</h1>
                <p className="text-sm text-gray-500">Choose an existing campaign or create a new one</p>
              </div>
            </div>
            
            {/* Breadcrumb */}
            <div className="hidden md:flex items-center text-sm text-gray-500">
              <span>Advertising Spaces</span>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span className="text-blue-600 font-medium">Select Campaign</span>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span>Review & Confirm</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Selected Advertising Spaces */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Selected Advertising Spaces ({selectedSpaces.length} items)
                </h2>
                <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700">
                  <Plus className="w-4 h-4 mr-1" />
                  Add More Spaces
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {selectedSpaces.map((space) => (
                  <div key={space.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{space.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span>{formatDate(space.dates.start)} - {formatDate(space.dates.end)}</span>
                          <span>{space.type || 'Premium location'}</span>
                          <span>{space.audience || 'High traffic'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-4">
                        <p className="text-sm text-gray-500">
                          {formatCurrency(space.baseRate || 0)}/{space.rateType?.toLowerCase() || 'day'}
                        </p>
                        <p className="font-semibold text-gray-900">
                          {formatCurrency((space.baseRate || 0) * space.duration)} total
                        </p>
                      </div>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleRemoveSpace(space.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Cost */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Campaign Cost</p>
                    <p className="text-xs text-gray-400">{selectedSpaces.length} spaces • {totalDays} total days</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalCost)}</p>
                    <p className="text-xs text-gray-500">+ applicable taxes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Your Campaigns */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Your Campaigns</h2>
                  <p className="text-sm text-gray-500">{campaigns.length} active campaigns</p>
                </div>
                <button
                  onClick={handleCreateNewCampaign}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New
                </button>
              </div>

              {campaigns.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Rocket className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Create your first campaign</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Get started with advertising on premium spaces. We'll guide you through creating a 
                    high-impact campaign that drives results.
                  </p>
                  <button
                    onClick={handleCreateNewCampaign}
                    className="inline-flex items-center px-6 py-3 text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700"
                  >
                    <Rocket className="w-5 h-5 mr-2" />
                    Create Your First Campaign
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {campaigns.map((campaign) => (
                    <motion.div
                      key={campaign.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`relative border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                        selectedCampaign === campaign.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleCampaignSelect(campaign.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            checked={selectedCampaign === campaign.id}
                            onChange={() => handleCampaignSelect(campaign.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            campaign.status === 'ACTIVE' ? 'bg-green-100' :
                            campaign.status === 'PAUSED' ? 'bg-orange-100' :
                            campaign.status === 'DRAFT' ? 'bg-purple-100' : 'bg-gray-100'
                          }`}>
                            <Zap className={`w-5 h-5 ${
                              campaign.status === 'ACTIVE' ? 'text-green-600' :
                              campaign.status === 'PAUSED' ? 'text-orange-600' :
                              campaign.status === 'DRAFT' ? 'text-purple-600' : 'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                            <p className="text-sm text-gray-600">{campaign.brand_name}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                            {campaign.status}
                          </span>
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
                        <div>
                          <p className="text-gray-500">Budget:</p>
                          <p className="font-medium">{campaign.budget ? formatCurrency(campaign.budget) : '--'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Impressions:</p>
                          <p className="font-medium">{formatNumber(campaign.impressions)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">CTR:</p>
                          <p className="font-medium">{campaign.ctr ? `${campaign.ctr}%` : '--'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Spent:</p>
                          <p className="font-medium">{formatCurrency(campaign.totalSpent)}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Recommended Spaces */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Recommended Spaces</h2>
                  <p className="text-sm text-gray-500">Expand your reach with these high-performing locations</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                {recommendedSpaces.map((space) => (
                  <div key={space.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{space.name}</h3>
                          <p className="text-sm text-gray-500">{space.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{formatCurrency(space.pricePerDay)}/day</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <p>{space.type} • {space.audience}</p>
                      </div>
                      <button
                        onClick={() => handleAddRecommendedSpace(space)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Next Steps */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h3>
              
              <div className="space-y-3">
                <button
                  onClick={handleProceedWithCampaign}
                  disabled={!selectedCampaign}
                  className="w-full inline-flex items-center justify-center px-4 py-3 text-white bg-blue-600 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue with Selected Campaign
                  <ChevronRight className="w-4 h-4 ml-2" />
                </button>
                
                {/* DEBUG: Test button to check if functions work */}
                <button
                  onClick={() => {
                    console.log('DEBUG: Test button clicked');
                    console.log('selectedCampaign:', selectedCampaign);
                    console.log('navigate function:', navigate);
                    navigate('/AdvertiserConfirmation');
                  }}
                  className="w-full inline-flex items-center justify-center px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg font-medium hover:bg-red-50"
                >
                  DEBUG: Test Navigation
                </button>
                
                <button
                  onClick={handleCreateNewCampaign}
                  className="w-full inline-flex items-center justify-center px-4 py-3 text-blue-600 border border-blue-200 rounded-lg font-medium hover:bg-blue-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Campaign
                </button>
              </div>

              {!selectedCampaign && campaigns.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-700">
                      Select a campaign above to continue with your advertising space booking.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Need Help */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Play className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-semibold text-blue-900">Need Help?</h4>
              </div>
              <p className="text-sm text-blue-700 mb-4">
                Learn how to create effective campaigns and maximize your advertising ROI.
              </p>
              <button className="w-full inline-flex items-center justify-center px-4 py-2 text-blue-600 border border-blue-200 rounded-lg text-sm font-medium hover:bg-white">
                <Play className="w-4 h-4 mr-2" />
                Watch Tutorial
              </button>
            </div>

            {/* Account Overview */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Account Overview</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Campaigns</span>
                  <span className="font-semibold">{userStats.totalCampaigns}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Campaigns</span>
                  <span className="font-semibold text-green-600">{userStats.activeCampaigns}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Spent (30d)</span>
                  <span className="font-semibold">{formatCurrency(userStats.totalSpent)}</span>
                </div>
                {userStats.avgROAS > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg. ROAS</span>
                    <span className="font-semibold text-green-600">{userStats.avgROAS.toFixed(1)}x</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Quick Actions</h4>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                  <Target className="w-4 h-4" />
                  Duplicate Campaign
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                  <TrendingUp className="w-4 h-4" />
                  View Analytics
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                  <Settings className="w-4 h-4" />
                  Campaign Settings
                </button>
              </div>
            </div>

            {/* Need Support */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Need Support?</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  support@elaview.com
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  1-800-ELAVIEW
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  Mon-Fri 9AM-6PM EST
                </div>
                <button className="w-full inline-flex items-center justify-center px-4 py-2 text-blue-600 bg-blue-50 rounded-lg text-sm font-medium hover:bg-blue-100 mt-3">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Start Live Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}