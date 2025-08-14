// src/pages/TEMPUserJourney/CampaignSelection.tsx
// Campaign selection flow for booking advertising spaces
// Handles both existing campaigns and new campaign creation

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ArrowRight, Plus, Calendar, Target, Image, 
  FileText, Video, AlertCircle, Check, ChevronRight,
  Briefcase, Clock, DollarSign, TrendingUp, Upload,
  Info, Search, Filter, Eye, Edit2, Copy, Star,
  BarChart3, Users, MapPin, Package, Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import apiClient from '@/api/apiClient';

interface Campaign {
  id: string;
  name: string;
  title: string;
  brand_name: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  start_date: string;
  end_date: string;
  budget: number;
  dailyBudget?: number;
  currency: string;
  primary_objective: string;
  media_files: any[];
  created_at: string;
  isActive: boolean;
}

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

const CampaignSelection: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  
  // State Management
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedSpace, setSelectedSpace] = useState<SelectedSpace | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateFlow, setShowCreateFlow] = useState(false);
  
  // New Campaign Creation State
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    brand_name: '',
    primary_objective: '',
    creative_concept: '',
    content_description: '',
    media_files: [] as any[],
    mediaRequirements: {
      bleed: 0.25,
      dpi: 300,
      format: 'static'
    }
  });
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Campaign objectives
  const campaignObjectives = [
    { value: 'BRAND_AWARENESS', label: 'Brand Awareness', icon: TrendingUp, color: '#4668AB' },
    { value: 'LEAD_GENERATION', label: 'Lead Generation', icon: Users, color: '#10B981' },
    { value: 'SALES_CONVERSION', label: 'Sales Conversion', icon: DollarSign, color: '#F59E0B' },
    { value: 'FOOT_TRAFFIC', label: 'Foot Traffic', icon: MapPin, color: '#8B5CF6' },
    { value: 'PRODUCT_LAUNCH', label: 'Product Launch', icon: Package, color: '#EC4899' },
    { value: 'EVENT_PROMOTION', label: 'Event Promotion', icon: Calendar, color: '#06B6D4' }
  ];

  // Load selected space from session storage
  useEffect(() => {
    const spaceData = sessionStorage.getItem('selectedSpace');
    if (spaceData) {
      setSelectedSpace(JSON.parse(spaceData));
    } else {
      // If no space selected, redirect back to browse
      navigate('/browse');
    }
  }, [navigate]);

  // Fetch user's campaigns
  useEffect(() => {
    fetchCampaigns();
  }, [user]);

  const fetchCampaigns = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('📋 Fetching user campaigns...');
      const result = await apiClient.getCampaigns();
      
      if (result.success && result.data) {
        setCampaigns(result.data);
        console.log(`✅ Loaded ${result.data.length} campaigns`);
      } else {
        console.log('📭 No campaigns found');
        setCampaigns([]);
      }
    } catch (error) {
      console.error('❌ Error fetching campaigns:', error);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload with validation
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setUploadingFiles(true);
    setValidationErrors({});

    try {
      const uploadPromises = files.map(async (file) => {
        // Validate file type
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/') && file.type !== 'application/pdf') {
          throw new Error(`Unsupported file type: ${file.type}`);
        }

        // Validate file size (max 50MB for high-res images)
        if (file.size > 50 * 1024 * 1024) {
          throw new Error(`File too large: ${file.name} (max 50MB)`);
        }

        // For images, validate DPI and dimensions (would need image processing library in production)
        if (file.type.startsWith('image/')) {
          // Note: In production, you'd use a library to check actual DPI
          // For now, we'll just check file size as a proxy for quality
          if (file.size < 500 * 1024) { // Less than 500KB might be low quality
            console.warn(`⚠️ ${file.name} might be low resolution. Ensure it's at least 300 DPI.`);
          }
        }

        console.log('📤 Uploading file:', file.name);
        const uploadResult = await apiClient.uploadFile(file, 'campaign_media');
        
        if (uploadResult.success) {
          return {
            name: file.name,
            url: uploadResult.data.url,
            type: file.type,
            size: file.size,
            metadata: {
              dpi: 300, // Would be calculated in production
              hasBleed: true // Would be verified in production
            }
          };
        } else {
          throw new Error(`Failed to upload ${file.name}`);
        }
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      setNewCampaign(prev => ({
        ...prev,
        media_files: [...prev.media_files, ...uploadedFiles]
      }));

      console.log('✅ Files uploaded successfully');
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      setValidationErrors({ upload: error.message });
    } finally {
      setUploadingFiles(false);
    }
  };

  // Validate campaign before submission
  const validateCampaign = (): boolean => {
    const errors: Record<string, string> = {};

    if (!newCampaign.name.trim()) {
      errors.name = 'Campaign name is required';
    }
    if (!newCampaign.brand_name.trim()) {
      errors.brand = 'Brand name is required';
    }
    if (!newCampaign.primary_objective) {
      errors.objective = 'Please select a campaign objective';
    }
    if (!newCampaign.content_description.trim()) {
      errors.content = 'Content description is required';
    }
    if (newCampaign.media_files.length === 0) {
      errors.media = 'Please upload at least one media file';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Create new campaign
  const handleCreateCampaign = async () => {
    if (!validateCampaign()) {
      return;
    }

    setLoading(true);
    try {
      console.log('🚀 Creating new campaign...');
      
      const campaignPayload = {
        name: newCampaign.name,
        title: newCampaign.name,
        description: newCampaign.content_description,
        brand_name: newCampaign.brand_name,
        budget: selectedSpace?.totalPrice || 0,
        currency: 'USD',
        start_date: selectedSpace?.dates.start || new Date().toISOString(),
        end_date: selectedSpace?.dates.end || new Date().toISOString(),
        primary_objective: newCampaign.primary_objective,
        creative_concept: newCampaign.creative_concept,
        content_description: newCampaign.content_description,
        media_files: newCampaign.media_files,
        status: 'DRAFT',
        isActive: false,
        metadata: {
          createdFrom: 'booking_flow',
          spaceId: selectedSpace?.id,
          mediaRequirements: newCampaign.mediaRequirements
        }
      };

      const result = await apiClient.createCampaign(campaignPayload);
      
      if (result.success) {
        console.log('✅ Campaign created:', result.data);
        
        // Store campaign data for confirmation page
        sessionStorage.setItem('newCampaign', JSON.stringify(result.data));
        sessionStorage.setItem('selectedCampaignId', result.data.id);
        
        // Navigate to advertiser confirmation
        navigate('/TEMPUserJourney/AdvertiserConfirmation');
      } else {
        throw new Error(result.error || 'Failed to create campaign');
      }
    } catch (error: any) {
      console.error('❌ Error creating campaign:', error);
      setValidationErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Handle campaign selection
  const handleSelectCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    sessionStorage.setItem('selectedCampaignId', campaign.id);
    
    // Navigate to advertiser confirmation
    navigate('/TEMPUserJourney/AdvertiserConfirmation');
  };

  // Filter campaigns based on search and status
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.brand_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-50';
      case 'DRAFT': return 'text-gray-600 bg-gray-50';
      case 'PAUSED': return 'text-yellow-600 bg-yellow-50';
      case 'COMPLETED': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: '#4668AB' }} />
          <p className="text-gray-600">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Space Details
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Select Campaign for Booking
              </h1>
              <p className="text-gray-600">
                Choose an existing campaign or create a new one for {selectedSpace?.name}
              </p>
            </div>
            
            {/* Selected Space Info */}
            {selectedSpace && (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Selected Space</p>
                <p className="font-semibold text-gray-900">{selectedSpace.name}</p>
                <p className="text-sm text-gray-600">
                  ${selectedSpace.totalPrice.toFixed(2)} for {selectedSpace.duration} days
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        {campaigns.length === 0 ? (
          // View 1: No campaigns - Must create new
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                No Campaigns Found
              </h2>
              <p className="text-gray-600 mb-8">
                You need to create a campaign before booking this advertising space. 
                Let's set up your first campaign now.
              </p>
              
              <Button
                onClick={() => setShowCreateFlow(true)}
                className="inline-flex items-center gap-2 px-6 py-3"
                style={{ backgroundColor: '#4668AB', color: 'white' }}
              >
                <Plus className="w-5 h-5" />
                Create Your First Campaign
              </Button>
              
              <div className="mt-8 p-4 bg-blue-50 rounded-lg text-left">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      Why do I need a campaign?
                    </p>
                    <p className="text-sm text-blue-700">
                      Campaigns organize your advertising content, targeting, and objectives. 
                      Each booking needs to be associated with a campaign to ensure proper 
                      tracking and management of your advertisements.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // View 2: Has campaigns - Choose or create new
          <>
            {!showCreateFlow ? (
              <>
                {/* Search and Filter Bar */}
                <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search campaigns..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="DRAFT">Draft</option>
                        <option value="PAUSED">Paused</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                      
                      <Button
                        onClick={() => setShowCreateFlow(true)}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        New Campaign
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Campaigns Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {filteredCampaigns.map((campaign) => (
                    <motion.div
                      key={campaign.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-all cursor-pointer"
                      onClick={() => handleSelectCampaign(campaign)}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {campaign.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {campaign.brand_name}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                            {campaign.status}
                          </span>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {new Date(campaign.start_date).toLocaleDateString()} - 
                              {new Date(campaign.end_date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <DollarSign className="w-3 h-3" />
                            <span>Budget: ${campaign.budget.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Target className="w-3 h-3" />
                            <span>
                              {campaignObjectives.find(o => o.value === campaign.primary_objective)?.label || 'Not set'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            {campaign.media_files.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Image className="w-3 h-3" />
                                {campaign.media_files.length} files
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(campaign.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Create New Campaign Option */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Need a Different Campaign?
                      </h3>
                      <p className="text-gray-600">
                        Create a new campaign specifically for this advertising space with custom objectives and creative assets.
                      </p>
                    </div>
                    <Button
                      onClick={() => setShowCreateFlow(true)}
                      className="flex items-center gap-2"
                      style={{ backgroundColor: '#4668AB', color: 'white' }}
                    >
                      <Plus className="w-4 h-4" />
                      Create New Campaign
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              // Create New Campaign Flow (Simplified)
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center mb-6">
                  <Target className="w-6 h-6 mr-3" style={{ color: '#4668AB' }} />
                  <h2 className="text-xl font-semibold text-gray-900">Create New Campaign</h2>
                </div>

                {/* Validation Errors */}
                {Object.keys(validationErrors).length > 0 && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div className="text-sm text-red-700">
                        {Object.values(validationErrors).map((error, idx) => (
                          <p key={idx}>{error}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Campaign Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Campaign Name *
                    </label>
                    <input
                      type="text"
                      value={newCampaign.name}
                      onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                      placeholder="e.g., Summer 2024 Brand Awareness"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Brand Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand Name *
                    </label>
                    <input
                      type="text"
                      value={newCampaign.brand_name}
                      onChange={(e) => setNewCampaign({...newCampaign, brand_name: e.target.value})}
                      placeholder="Your brand or company name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Campaign Objective */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Campaign Objective *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {campaignObjectives.map(objective => (
                        <label 
                          key={objective.value} 
                          className={`flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            newCampaign.primary_objective === objective.value 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="primary_objective"
                            value={objective.value}
                            checked={newCampaign.primary_objective === objective.value}
                            onChange={(e) => setNewCampaign({...newCampaign, primary_objective: e.target.value})}
                            className="sr-only"
                          />
                          <objective.icon 
                            className="w-8 h-8 mb-2" 
                            style={{ color: newCampaign.primary_objective === objective.value ? objective.color : '#9CA3AF' }}
                          />
                          <span className="text-xs font-medium text-center">{objective.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Content Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content Description *
                    </label>
                    <textarea
                      value={newCampaign.content_description}
                      onChange={(e) => setNewCampaign({...newCampaign, content_description: e.target.value})}
                      placeholder="Describe your campaign message and creative approach..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Media Upload with Requirements */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Media Files *
                    </label>
                    
                    {/* Requirements Notice */}
                    <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-amber-900 mb-1">Media Requirements</p>
                          <ul className="text-amber-700 space-y-1">
                            <li>• Static images must include 0.25" bleed on all sides</li>
                            <li>• Minimum 300 DPI resolution required</li>
                            <li>• Accepted formats: JPG, PNG, PDF (RGB or CMYK)</li>
                            <li>• Maximum file size: 50MB per file</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 mb-2">
                        Upload print-ready artwork for your campaign
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        Ensure files meet the requirements above
                      </p>
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="media-upload-campaign"
                      />
                      <label
                        htmlFor="media-upload-campaign"
                        className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer"
                      >
                        {uploadingFiles ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Uploading...
                          </>
                        ) : (
                          'Choose Files'
                        )}
                      </label>
                    </div>

                    {/* Uploaded Files Display */}
                    {newCampaign.media_files.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
                        {newCampaign.media_files.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              {file.type.startsWith('image/') ? (
                                <Image className="w-4 h-4 text-gray-500" />
                              ) : (
                                <FileText className="w-4 h-4 text-gray-500" />
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-700">{file.name}</p>
                                <p className="text-xs text-gray-500">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                  {file.metadata?.dpi && ` • ${file.metadata.dpi} DPI`}
                                  {file.metadata?.hasBleed && ' • ✓ Bleed'}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setNewCampaign(prev => ({
                                  ...prev,
                                  media_files: prev.media_files.filter((_, i) => i !== index)
                                }));
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateFlow(false)}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Campaigns
                  </Button>
                  
                  <Button
                    onClick={handleCreateCampaign}
                    disabled={loading}
                    className="flex items-center gap-2"
                    style={{ backgroundColor: '#4668AB', color: 'white' }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        Create & Continue
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CampaignSelection;