// src/components/campaigns/CampaignSelection.jsx
// ✅ NEW: Campaign selection component for space details modal

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
 Target, Plus, Calendar, DollarSign, Eye, 
 Play, Pause, CheckCircle, AlertCircle, Loader2 
} from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import apiClient from '../../api/apiClient.js';

export default function CampaignSelection({ 
 selectedCampaign, 
 onCampaignSelect, 
 onCreateCampaign,
 spaceId 
}) {
 const { user } = useUser();
 const [campaigns, setCampaigns] = useState([]);
 const [isLoading, setIsLoading] = useState(true);
 const [error, setError] = useState(null);

 // Fetch user's campaigns
 useEffect(() => {
 const fetchCampaigns = async () => {
 if (!user) return;
 
 try {
 setIsLoading(true);
 setError(null);
 
 const response = await apiClient.getCampaigns();
 if (response.success) {
 setCampaigns(response.data || []);
 } else {
 setError('Failed to load campaigns');
 }
 } catch (err) {
 console.error('Error fetching campaigns:', err);
 setError('Failed to load campaigns');
 } finally {
 setIsLoading(false);
 }
 };

 fetchCampaigns();
 }, [user]);

 const getStatusColor = (status) => {
 switch (status?.toLowerCase()) {
 case 'active':
 case 'approved':
 return 'bg-green-100 text-green-800';
 case 'paused':
 case 'pending_approval':
 return 'bg-yellow-100 text-yellow-800';
 case 'completed':
 return 'bg-blue-100 text-blue-800';
 case 'draft':
 case 'planning':
 return 'bg-gray-100 text-gray-800';
 case 'cancelled':
 case 'rejected':
 return 'bg-red-100 text-red-800';
 default:
 return 'bg-gray-100 text-gray-800';
 }
 };

 const getStatusIcon = (status) => {
 switch (status?.toLowerCase()) {
 case 'active':
 case 'approved':
 return <Play className="w-4 h-4" />;
 case 'paused':
 case 'pending_approval':
 return <Pause className="w-4 h-4" />;
 case 'completed':
 return <CheckCircle className="w-4 h-4" />;
 case 'draft':
 case 'planning':
 return <AlertCircle className="w-4 h-4" />;
 default:
 return <AlertCircle className="w-4 h-4" />;
 }
 };

 const formatCurrency = (amount, currency = 'USD') => {
 const symbols = { 
 USD: '$', 
 ILS: '₪', 
 EUR: '€', 
 GBP: '£',
 CAD: 'C$',
 AUD: 'A$'
 };
 const symbol = symbols[currency] || '$';
 return `${symbol}${parseFloat(amount || 0).toLocaleString()}`;
 };

 const formatDate = (dateString) => {
 if (!dateString) return 'Not set';
 try {
 const date = new Date(dateString);
 return date.toLocaleDateString('en-US', { 
 month: 'short', 
 day: 'numeric', 
 year: 'numeric' 
 });
 } catch {
 return 'Invalid date';
 }
 };

 if (isLoading) {
 return (
 <div className="flex items-center justify-center py-8">
 <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
 <span className="text-gray-600">Loading campaigns...</span>
 </div>
 );
 }

 if (error) {
 return (
 <div className="text-center py-8">
 <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
 <p className="text-red-600 mb-4">{error}</p>
 <Button 
 variant="outline" 
 onClick={() => window.location.reload()}
>
 Try Again
 </Button>
 </div>
 );
 }

 return (
 <div className="space-y-4">
 {/* Header */}
 <div className="flex items-center justify-between">
 <h3 className="text-lg font-semibold text-gray-900">
 Select Campaign
 </h3>
 <Button
 onClick={() => onCreateCampaign(spaceId)}
 size={20}
 className="bg-blue-600 hover:bg-blue-700 text-white"
>
 <Plus className="w-4 h-4 mr-2" />
 Create Campaign
 </Button>
 </div>

 {/* Campaigns Grid */}
 {campaigns.length> 0 ? (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
 {campaigns.map((campaign) => (
 <Card
 key={campaign.id}
 className={`cursor-pointer transition-all hover:shadow-md ${
 selectedCampaign?.id === campaign.id 
 ? 'ring-2 ring-blue-500 bg-blue-50' 
 : 'hover:bg-gray-50'
 }`}
 onClick={() => onCampaignSelect(campaign)}
>
 <CardHeader className="pb-2">
 <div className="flex items-start justify-between">
 <div className="flex-1 min-w-0">
 <CardTitle className="text-base font-semibold text-gray-900 truncate">
 {campaign.name || campaign.title}
 </CardTitle>
 <p className="text-sm text-gray-600 truncate">
 {campaign.brand_name}
 </p>
 </div>
 <Badge className={`text-xs ${getStatusColor(campaign.status)}`}>
 <span className="mr-1">
 {getStatusIcon(campaign.status)}
 </span>
 {campaign.status?.replace('_', ' ').toLowerCase()}
 </Badge>
 </div>
 </CardHeader>
 
 <CardContent className="pt-0">
 <div className="space-y-2 text-sm">
 {/* Campaign Details */}
 <div className="flex items-center gap-2">
 <Calendar className="w-4 h-4 text-gray-500" />
 <span className="text-gray-600">
 {formatDate(campaign.start_date || campaign.startDate)} - {formatDate(campaign.end_date || campaign.endDate)}
 </span>
 </div>
 
 <div className="flex items-center gap-2">
 <DollarSign className="w-4 h-4 text-gray-500" />
 <span className="text-gray-600">
 Budget: {formatCurrency(campaign.budget || campaign.total_budget, campaign.currency)}
 </span>
 </div>

 {campaign.primary_objective && (
 <div className="flex items-center gap-2">
 <Target className="w-4 h-4 text-gray-500" />
 <span className="text-gray-600">
 {campaign.primary_objective.replace('_', ' ').toLowerCase()}
 </span>
 </div>
 )}

 {/* Media Files Indicator */}
 {campaign.media_files && campaign.media_files.length> 0 && (
 <div className="flex items-center gap-2">
 <Eye className="w-4 h-4 text-gray-500" />
 <span className="text-gray-600">
 {campaign.media_files.length} media file{campaign.media_files.length !== 1 ? 's' : ''}
 </span>
 </div>
 )}
 </div>
 </CardContent>
 </Card>
 ))}
 </div>
 ) : (
 /* Empty State */
 <div className="text-center py-8">
 <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
 <h4 className="text-lg font-medium text-gray-900 mb-2">No Campaigns Yet</h4>
 <p className="text-gray-600 mb-4">
 Create your first campaign to start advertising on this space.
 </p>
 <Button
 onClick={() => onCreateCampaign(spaceId)}
 className="bg-blue-600 hover:bg-blue-700 text-white"
>
 <Plus className="w-4 h-4 mr-2" />
 Create Your First Campaign
 </Button>
 </div>
 )}

 {/* Selected Campaign Summary */}
 {selectedCampaign && (
 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
 <h4 className="font-medium text-blue-900 mb-2">Selected Campaign</h4>
 <div className="space-y-1 text-sm text-blue-800">
 <p><strong>Name:</strong> {selectedCampaign.name || selectedCampaign.title}</p>
 <p><strong>Brand:</strong> {selectedCampaign.brand_name}</p>
 <p><strong>Budget:</strong> {formatCurrency(selectedCampaign.budget || selectedCampaign.total_budget, selectedCampaign.currency)}</p>
 <p><strong>Status:</strong> {selectedCampaign.status?.replace('_', ' ').toLowerCase()}</p>
 </div>
 </div>
 )}
 </div>
 );
} 