// src/pages/campaigns/CreateCampaignWizard.jsx
// ✅ FIXED: Redirects to /advertise (Advertiser Dashboard) after campaign creation

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { 
  ArrowLeft, ArrowRight, Plus, X, Upload, Calendar, 
  DollarSign, Target, Check, AlertCircle, Image, 
  FileText, Video, Users, MapPin, TrendingUp
} from 'lucide-react';

import apiClient from '../../api/apiClient.js';

export default function CreateCampaignWizard() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Campaign data
  const [campaignData, setCampaignData] = useState({
    name: '',
    title: '',
    description: '',
    brand_name: '',
    budget: '',
    dailyBudget: '',
    currency: 'USD',
    startDate: '',
    endDate: '',
    primary_objective: '',
    creative_concept: '',
    call_to_action: '',
    content_description: '',
    media_files: [],
    targetAudience: {},
    geographic_targeting: {},
    keywords: [],
    target_demographics: {},
    brand_guidelines: {},
    placement_preferences: {}
  });

  // File upload state
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // Campaign objectives
  const campaignObjectives = [
    { value: 'BRAND_AWARENESS', label: 'Brand Awareness', description: 'Increase brand recognition and visibility' },
    { value: 'LEAD_GENERATION', label: 'Lead Generation', description: 'Generate qualified leads and inquiries' },
    { value: 'SALES_CONVERSION', label: 'Sales Conversion', description: 'Drive direct sales and conversions' },
    { value: 'FOOT_TRAFFIC', label: 'Foot Traffic', description: 'Increase store visits and walk-ins' },
    { value: 'PRODUCT_LAUNCH', label: 'Product Launch', description: 'Promote new products or services' },
    { value: 'EVENT_PROMOTION', label: 'Event Promotion', description: 'Promote events or special offers' }
  ];

  // Content types
  const contentTypes = [
    { value: 'STATIC_IMAGE', label: 'Static Image', icon: Image },
    { value: 'VIDEO_CONTENT', label: 'Video Content', icon: Video },
    { value: 'TEXT_ONLY', label: 'Text Only', icon: FileText },
    { value: 'INTERACTIVE', label: 'Interactive', icon: Target }
  ];

  // Target audience options
  const audienceOptions = [
    { value: 'LOCAL_RESIDENTS', label: 'Local Residents', description: 'People living in the area' },
    { value: 'COMMUTERS', label: 'Commuters', description: 'People passing through daily' },
    { value: 'SHOPPERS', label: 'Shoppers', description: 'Retail and shopping focused' },
    { value: 'BUSINESS_PROFESSIONALS', label: 'Business Professionals', description: 'Office workers and professionals' },
    { value: 'TOURISTS', label: 'Tourists', description: 'Visitors and tourists' },
    { value: 'STUDENTS', label: 'Students', description: 'College and university students' }
  ];

  // Handle file upload
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploadingFiles(true);
    setError('');

    try {
      const uploadPromises = files.map(async (file) => {
        // Validate file
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/') && file.type !== 'application/pdf') {
          throw new Error(`Unsupported file type: ${file.type}`);
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          throw new Error(`File too large: ${file.name} (max 10MB)`);
        }

        console.log('🖼️ Uploading file:', file.name, file.size);
        const uploadResult = await apiClient.uploadFile(file, 'campaign_media');
        
        if (uploadResult.success) {
          console.log('✅ File uploaded successfully:', uploadResult.data.url);
          return {
            name: file.name,
            url: uploadResult.data.url,
            type: file.type,
            size: file.size
          };
        } else {
          throw new Error(`Failed to upload ${file.name}: ${uploadResult.error}`);
        }
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      setUploadedFiles(prev => [...prev, ...uploadedFiles]);
      setCampaignData(prev => ({
        ...prev,
        media_files: [...prev.media_files, ...uploadedFiles]
      }));

    } catch (error) {
      console.error('❌ Upload error:', error);
      setError('Failed to upload files: ' + error.message);
    } finally {
      setUploadingFiles(false);
    }
  };

  // Remove uploaded file
  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setCampaignData(prev => ({
      ...prev,
      media_files: prev.media_files.filter((_, i) => i !== index)
    }));
  };

  // Update campaign data
  const updateCampaignData = (field, value) => {
    setCampaignData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Step navigation with validation
  const nextStep = () => {
    setError('');
    
    if (currentStep === 1) {
      // Validate campaign basics
      if (!campaignData.name.trim()) {
        setError('Campaign name is required');
        return;
      }
      if (!campaignData.startDate) {
        setError('Start date is required');
        return;
      }
      if (!campaignData.endDate) {
        setError('End date is required');
        return;
      }
      if (new Date(campaignData.endDate) <= new Date(campaignData.startDate)) {
        setError('End date must be after start date');
        return;
      }
      if (!campaignData.budget || parseFloat(campaignData.budget) <= 0) {
        setError('Valid budget is required');
        return;
      }
      if (!campaignData.brand_name.trim()) {
        setError('Brand name is required');
        return;
      }
    }
    
    if (currentStep === 2) {
      // Validate creative assets
      if (!campaignData.primary_objective) {
        setError('Please select a campaign objective');
        return;
      }
      if (!campaignData.content_description?.trim()) {
        setError('Content description is required');
        return;
      }
    }
    
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Submit campaign
  const submitCampaign = async () => {
    setIsLoading(true);
    setError('');

    try {
      console.log('🚀 Creating campaign...');
      
      const campaignPayload = {
        name: campaignData.name,
        title: campaignData.title || campaignData.name,
        description: campaignData.description,
        brand_name: campaignData.brand_name,
        budget: parseFloat(campaignData.budget),
        dailyBudget: campaignData.dailyBudget ? parseFloat(campaignData.dailyBudget) : null,
        currency: campaignData.currency,
        start_date: campaignData.startDate,
        end_date: campaignData.endDate,
        primary_objective: campaignData.primary_objective,
        creative_concept: campaignData.creative_concept,
        call_to_action: campaignData.call_to_action,
        content_description: campaignData.content_description,
        media_files: campaignData.media_files,
        targetAudience: campaignData.targetAudience,
        geographic_targeting: campaignData.geographic_targeting,
        keywords: campaignData.keywords,
        target_demographics: campaignData.target_demographics,
        brand_guidelines: campaignData.brand_guidelines,
        placement_preferences: campaignData.placement_preferences,
        status: 'DRAFT',
        isActive: false
      };

      console.log('📋 Campaign payload to send:', JSON.stringify(campaignPayload, null, 2));
      
      const result = await apiClient.createCampaign(campaignPayload);
      
      if (!result.success) {
        console.error('❌ Backend validation failed:', result);
        if (result.errors) {
          const errorMessages = Object.entries(result.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join('\n');
          throw new Error(`Validation failed:\n${errorMessages}`);
        }
        throw new Error(result.error || result.message || 'Failed to create campaign');
      }

      console.log('✅ Campaign created successfully:', result.data);
      
      // Check for return navigation parameters
      const urlParams = new URLSearchParams(window.location.search);
      const returnTo = urlParams.get('returnTo');
      const spaceId = urlParams.get('spaceId');
      
      if (returnTo === 'space' && spaceId) {
        // Store the new campaign data and redirect back to space details
        sessionStorage.setItem('newCampaign', JSON.stringify(result.data));
        navigate(`/browse?spaceId=${spaceId}&campaignCreated=true`);
      } else {
        // ✅ FIXED: Redirect to /advertise (Advertiser Dashboard) instead of /dashboard
        console.log('🎯 Redirecting to Advertiser Dashboard at /advertise');
        navigate('/advertise?tab=campaigns&created=true');
      }

    } catch (error) {
      console.error('❌ Submit error:', error);
      
      let errorMessage = error.message;
      
      if (error.message.includes('422')) {
        errorMessage = 'Validation failed. Please check all required fields are filled correctly.';
      } else if (error.message.includes('401')) {
        errorMessage = 'Authentication error. Please try signing out and back in.';
      } else if (error.message.includes('500')) {
        errorMessage = 'Server error. Please try again in a moment.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  const getCurrencySymbol = (currency) => {
    const symbols = { 
      USD: '$', 
      ILS: '₪', 
      EUR: '€', 
      GBP: '£',
      CAD: 'C$',
      AUD: 'A$',
      JPY: '¥',
      CNY: '¥',
      INR: '₹',
      BRL: 'R$',
      MXN: '$'
    };
    return symbols[currency] || '$';
  };

  const currencyOptions = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'ILS', label: 'ILS (₪)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'CAD', label: 'CAD (C$)' },
    { value: 'AUD', label: 'AUD (A$)' }
  ];

  return (
    <div 
      className="min-h-screen p-4 sm:p-6"
      style={{ backgroundColor: '#FFFFFF' }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/advertise')}
            className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Advertiser Dashboard
          </button>
          
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Create New Campaign
          </h1>
          <p className="text-slate-600">
            Set up your advertising campaign with targeting and creative assets
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map(step => (
            <div key={step} className="flex items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step <= currentStep 
                    ? 'text-white' 
                    : 'bg-slate-200 text-slate-500'
                }`}
                style={step <= currentStep ? { backgroundColor: '#4668AB' } : {}}
              >
                {step < currentStep ? <Check className="w-4 h-4" /> : step}
              </div>
              {step < 3 && (
                <div 
                  className={`h-0.5 w-16 sm:w-24 mx-2 transition-colors ${
                    step < currentStep ? 'bg-blue-500' : 'bg-slate-200'
                  }`}
                  style={step < currentStep ? { backgroundColor: '#4668AB' } : {}}
                />
              )}
            </div>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="text-red-700 text-sm">
              <div className="font-medium mb-1">Error:</div>
              <div className="whitespace-pre-line">{error}</div>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div 
          className="border rounded-xl p-6 sm:p-8 shadow-sm mb-8"
          style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' }}
        >
          {/* STEP 1: Campaign Basics */}
          {currentStep === 1 && (
            <div>
              <div className="flex items-center mb-6">
                <Target className="w-6 h-6 mr-3" style={{ color: '#4668AB' }} />
                <h2 className="text-xl font-semibold text-slate-900">Campaign Basics</h2>
              </div>

              <div className="space-y-6">
                {/* Campaign Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    value={campaignData.name}
                    onChange={(e) => updateCampaignData('name', e.target.value)}
                    placeholder="Enter campaign name"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Campaign Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Campaign Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={campaignData.title}
                    onChange={(e) => updateCampaignData('title', e.target.value)}
                    placeholder="Enter campaign title"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Brand Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    value={campaignData.brand_name}
                    onChange={(e) => updateCampaignData('brand_name', e.target.value)}
                    placeholder="Enter brand name"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Campaign Description
                  </label>
                  <textarea
                    value={campaignData.description}
                    onChange={(e) => updateCampaignData('description', e.target.value)}
                    placeholder="Describe your campaign goals and messaging"
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={campaignData.startDate}
                      onChange={(e) => updateCampaignData('startDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={campaignData.endDate}
                      onChange={(e) => updateCampaignData('endDate', e.target.value)}
                      min={campaignData.startDate || new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Budget Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Total Budget *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-slate-500">
                        {getCurrencySymbol(campaignData.currency)}
                      </span>
                      <input
                        type="number"
                        value={campaignData.budget}
                        onChange={(e) => updateCampaignData('budget', e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Daily Budget (Optional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-slate-500">
                        {getCurrencySymbol(campaignData.currency)}
                      </span>
                      <input
                        type="number"
                        value={campaignData.dailyBudget}
                        onChange={(e) => updateCampaignData('dailyBudget', e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Currency
                    </label>
                    <select
                      value={campaignData.currency}
                      onChange={(e) => updateCampaignData('currency', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {currencyOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Creative Assets */}
          {currentStep === 2 && (
            <div>
              <div className="flex items-center mb-6">
                <Image className="w-6 h-6 mr-3" style={{ color: '#4668AB' }} />
                <h2 className="text-xl font-semibold text-slate-900">Creative Assets</h2>
              </div>

              <div className="space-y-6">
                {/* Campaign Objective */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Campaign Objective *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {campaignObjectives.map(objective => (
                      <label 
                        key={objective.value} 
                        className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${
                          campaignData.primary_objective === objective.value 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="primary_objective"
                          value={objective.value}
                          checked={campaignData.primary_objective === objective.value}
                          onChange={(e) => updateCampaignData('primary_objective', e.target.value)}
                          className="mt-1 mr-3"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{objective.label}</p>
                          <p className="text-sm text-slate-600">{objective.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Content Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Content Description *
                  </label>
                  <textarea
                    value={campaignData.content_description}
                    onChange={(e) => updateCampaignData('content_description', e.target.value)}
                    placeholder="Describe your campaign content, messaging, and creative approach"
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Creative Concept */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Creative Concept
                  </label>
                  <textarea
                    value={campaignData.creative_concept}
                    onChange={(e) => updateCampaignData('creative_concept', e.target.value)}
                    placeholder="Describe your creative concept and visual approach"
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Call to Action */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Call to Action
                  </label>
                  <input
                    type="text"
                    value={campaignData.call_to_action}
                    onChange={(e) => updateCampaignData('call_to_action', e.target.value)}
                    placeholder="e.g., Visit our store, Call now, Learn more"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Media Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Media Files
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm text-slate-600 mb-2">
                      Upload images, videos, or documents for your campaign
                    </p>
                    <p className="text-xs text-slate-500 mb-4">
                      Supported formats: JPG, PNG, GIF, MP4, PDF (Max 10MB each)
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="media-upload"
                    />
                    <label
                      htmlFor="media-upload"
                      className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer"
                    >
                      {uploadingFiles ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        'Choose Files'
                      )}
                    </label>
                  </div>

                  {/* Uploaded Files */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-slate-700">Uploaded Files:</p>
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 text-slate-500 mr-2" />
                            <span className="text-sm text-slate-700">{file.name}</span>
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Targeting & Review */}
          {currentStep === 3 && (
            <div>
              <div className="flex items-center mb-6">
                <Users className="w-6 h-6 mr-3" style={{ color: '#4668AB' }} />
                <h2 className="text-xl font-semibold text-slate-900">Targeting & Review</h2>
              </div>

              <div className="space-y-6">
                {/* Target Audience */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Target Audience
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {audienceOptions.map(audience => (
                      <label 
                        key={audience.value} 
                        className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${
                          campaignData.targetAudience[audience.value] 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={campaignData.targetAudience[audience.value] || false}
                          onChange={(e) => {
                            const newTargetAudience = {
                              ...campaignData.targetAudience,
                              [audience.value]: e.target.checked
                            };
                            updateCampaignData('targetAudience', newTargetAudience);
                          }}
                          className="mt-1 mr-3"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{audience.label}</p>
                          <p className="text-sm text-slate-600">{audience.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Keywords */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Keywords (Optional)
                  </label>
                  <textarea
                    value={campaignData.keywords.join(', ')}
                    onChange={(e) => {
                      const keywords = e.target.value.split(',').map(k => k.trim()).filter(k => k);
                      updateCampaignData('keywords', keywords);
                    }}
                    placeholder="Enter keywords separated by commas (e.g., local, restaurant, delivery)"
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Campaign Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-3">Campaign Summary</h3>
                  <div className="space-y-2 text-sm text-blue-800">
                    <div className="flex justify-between">
                      <span>Campaign Name:</span>
                      <span className="font-medium">{campaignData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Brand:</span>
                      <span className="font-medium">{campaignData.brand_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">
                        {campaignData.startDate && campaignData.endDate 
                          ? `${campaignData.startDate} to ${campaignData.endDate}`
                          : 'Not set'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Budget:</span>
                      <span className="font-medium">
                        {campaignData.budget 
                          ? `${getCurrencySymbol(campaignData.currency)}${campaignData.budget}`
                          : 'Not set'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Objective:</span>
                      <span className="font-medium">
                        {campaignObjectives.find(o => o.value === campaignData.primary_objective)?.label || 'Not set'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Media Files:</span>
                      <span className="font-medium">{uploadedFiles.length} uploaded</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="inline-flex items-center px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </button>

          {currentStep < 3 ? (
            <button
              onClick={nextStep}
              className="inline-flex items-center px-6 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#4668AB' }}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button
              onClick={submitCampaign}
              disabled={isLoading}
              className="inline-flex items-center px-6 py-2 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ backgroundColor: '#4668AB' }}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  Create Campaign
                  <Check className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}