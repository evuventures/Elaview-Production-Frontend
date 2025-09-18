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

interface UserStats {
 totalCampaigns: number;
 activeCampaigns: number;
 totalSpent: number;
 avgROAS?: number;
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

// Format numbers with commas
const formatNumber = (num: number): string => {
 if (num>= 1000000) {
 return (num / 1000000).toFixed(1) + 'M';
 } else if (num>= 1000) {
 return (num / 1000).toFixed(1) + 'K';
 }
 return num.toString();
};

export default function EnhancedCampaignSelection() {
 const navigate = useNavigate();
 const { user } = useUser();

 // State management
 const [campaigns, setCampaigns] = useState<Campaign[]>([]);
 const [userStats, setUserStats] = useState<UserStats>({
 totalCampaigns: 0,
 activeCampaigns: 0,
 totalSpent: 0,
 avgROAS: 0
 });
 const [isLoading, setIsLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

 // Initialize page data
 useEffect(() => {
 initializePage();
 }, []);

 const initializePage = async (): Promise<void> => {
 try {
 setIsLoading(true);
 
 // Check if we have selected spaces data
 const spacesData = sessionStorage.getItem('selectedSpaces') || sessionStorage.getItem('selectedSpace');
 if (!spacesData) {
 setError('No spaces selected. Please go back and select advertising spaces.');
 setIsLoading(false);
 return;
 }

 // Fetch user data
 await Promise.all([
 fetchCampaigns(),
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
 const campaignsWithROAS = campaignsArray.filter(c => c.totalSpent> 0 && c.conversions> 0);
 let avgROAS = 0;
 if (campaignsWithROAS.length> 0) {
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
 avgROAS: avgROAS> 0 ? avgROAS : undefined
 });
 }

 } catch (error) {
 console.error('Error fetching user stats:', error);
 // Keep default stats on error
 } finally {
 setIsLoading(false);
 }
 };

 // Handle campaign selection
 const handleCampaignSelect = (campaignId: string): void => {
 setSelectedCampaign(selectedCampaign === campaignId ? null : campaignId);
 };

 // Handle proceeding with selected campaign
 const handleProceedWithCampaign = (e?: React.MouseEvent): void => {
 e?.preventDefault();
 console.log('🚀 handleProceedWithCampaign called!');
 console.log('selectedCampaign:', selectedCampaign);
 
 if (!selectedCampaign) {
 console.error('❌ No campaign selected');
 alert('Please select a campaign first');
 return;
 }

 const campaign = campaigns.find(c => c.id === selectedCampaign);
 console.log('🎯 Found campaign:', campaign);

 // Store campaign data for next step
 const campaignData = {
 id: campaign?.id,
 name: campaign?.name,
 brand_name: campaign?.brand_name,
 objective: campaign?.primary_objective,
 description: campaign?.description,
 budget: campaign?.budget
 };
 
 console.log('💾 Storing campaign data:', campaignData);
 sessionStorage.setItem('selectedCampaign', JSON.stringify(campaignData));

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
 // Keep the selected spaces data for the new campaign
 const spacesData = sessionStorage.getItem('selectedSpaces') || sessionStorage.getItem('selectedSpace');
 if (spacesData) {
 sessionStorage.setItem('spacesForCampaign', spacesData);
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
 {/* Your Campaigns */}
 <div className="bg-white rounded-xl border border-gray-200 p-6">
 <div className="flex items-center justify-between mb-6">
 <div>
 <h2 className="text-lg font-semibold text-gray-900">Your Campaigns</h2>
 <p className="text-sm text-gray-500">{campaigns.length} total campaigns</p>
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
 
 <button
 onClick={handleCreateNewCampaign}
 className="w-full inline-flex items-center justify-center px-4 py-3 text-blue-600 border border-blue-200 rounded-lg font-medium hover:bg-blue-50"
>
 <Plus className="w-4 h-4 mr-2" />
 Create New Campaign
 </button>
 </div>

 {!selectedCampaign && campaigns.length> 0 && (
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
 {userStats.avgROAS && userStats.avgROAS> 0 && (
 <div className="flex justify-between">
 <span className="text-gray-600">Avg. ROAS</span>
 <span className="font-semibold text-green-600">{userStats.avgROAS.toFixed(1)}x</span>
 </div>
 )}
 </div>
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