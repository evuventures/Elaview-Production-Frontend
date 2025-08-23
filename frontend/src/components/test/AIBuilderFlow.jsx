import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import {
  X, ArrowLeft, ArrowRight, Check, Sparkles, FileText, Upload, 
  Target, Palette, MapPin, Zap, Crown, Star, Calendar, DollarSign,
  Users, MessageSquare, Loader2, ChevronRight, Plus, Image, Type,
  Paintbrush, Heart, Building, Coffee, ShoppingBag, Briefcase, Car,
  Home, Monitor, Eye, Camera, Wand2, Download, ExternalLink,
  RefreshCw, AlertTriangle
} from 'lucide-react';

// Import your actual API client and services
import apiClient from '../../api/apiClient.js';
import AIDesignService from '../../services/AIDesignService.js';
import CanvaService from '../../services/CanvaService.js';

// Mock service for fallback/demo purposes
const MockDesignService = {
  createAISession: async (sessionData) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      success: true,
      data: { sessionId: 'session-' + Date.now() }
    };
  },
  generateDesigns: async (sessionId, data) => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    return {
      success: true,
      data: {
        designs: [
          {
            id: 'design-1',
            thumbnailUrl: '/api/placeholder/300/200',
            title: 'Modern Bold Design',
            performanceScore: 8.5,
            tags: ['bold', 'modern', 'high-contrast'],
            canEdit: true
          },
          {
            id: 'design-2', 
            thumbnailUrl: '/api/placeholder/300/200',
            title: 'Elegant Minimal',
            performanceScore: 7.8,
            tags: ['minimal', 'elegant', 'clean'],
            canEdit: true
          },
          {
            id: 'design-3',
            thumbnailUrl: '/api/placeholder/300/200', 
            title: 'Vibrant Energy',
            performanceScore: 9.1,
            tags: ['vibrant', 'energetic', 'eye-catching'],
            canEdit: true
          }
        ]
      }
    };
  },
  createCampaign: async (campaignData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      data: { campaignId: 'campaign-' + Date.now() }
    };
  }
};

// Industry options with icons
const INDUSTRIES = [
  { id: 'restaurant', label: 'Restaurant', icon: Coffee },
  { id: 'retail', label: 'Retail Store', icon: ShoppingBag },
  { id: 'professional', label: 'Professional Services', icon: Briefcase },
  { id: 'automotive', label: 'Automotive', icon: Car },
  { id: 'real_estate', label: 'Real Estate', icon: Home },
  { id: 'tech', label: 'Technology', icon: Monitor },
  { id: 'beauty', label: 'Beauty & Wellness', icon: Heart },
  { id: 'construction', label: 'Construction', icon: Building },
];

// Placement types
const PLACEMENT_TYPES = [
  { id: 'storefront_window', label: 'Storefront Window', description: 'High visibility street-facing display' },
  { id: 'building_exterior', label: 'Building Exterior', description: 'Large outdoor building signs' },
  { id: 'digital_display', label: 'Digital Display', description: 'LED screens and digital billboards' },
  { id: 'event_space', label: 'Event Space', description: 'Temporary event and venue displays' }
];

// Tone options
const TONE_OPTIONS = [
  'Professional', 'Friendly', 'Bold', 'Elegant', 'Playful', 'Urgent', 'Trustworthy', 'Innovative'
];

const AI_BUILDER_PAGES = {
  METHOD_SELECTION: 0,
  CAMPAIGN_BASICS: 1, 
  BRAND_CONTENT: 2,
  PLACEMENT_CONTEXT: 3,
  AI_GENERATION: 4,
  DESIGN_SELECTION: 5
};

export default function AIBuilderFlow() {
  const navigate = useNavigate();
  const { user } = useUser();
  
  // Modal and flow state
  const [isOpen, setIsOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(AI_BUILDER_PAGES.METHOD_SELECTION);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form data
  const [sessionData, setSessionData] = useState({
    // Campaign Basics (Page 2)
    campaignName: '',
    campaignType: '',
    targetAudience: {
      ageRange: [18, 65],
      interests: []
    },
    budgetRange: [0, 10000],
    duration: {
      startDate: '',
      endDate: ''
    },
    primaryGoal: '',
    
    // Brand & Content (Page 3)
    brandData: {
      businessName: '',
      industry: '',
      colors: [],
      logoFile: null,
      keyMessage: '',
      cta: '',
      tone: ''
    },
    
    // Placement Context (Page 4)
    placementContext: {
      spaceType: '',
      location: 'urban',
      demographics: {},
      viewingDistance: 'medium',
      duration: 'quick_glance'
    }
  });
  
  // AI Generation state
  const [aiSessionId, setAiSessionId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDesigns, setGeneratedDesigns] = useState([]);
  const [selectedDesign, setSelectedDesign] = useState(null);
  
  // User tier (mock - replace with actual user data)
  const [userTier, setUserTier] = useState('FREE'); // or 'PREMIUM'

  // Close modal
  const handleClose = () => {
    setIsOpen(false);
    navigate(-1);
  };

  // Navigation
  const nextPage = () => {
    if (currentPage < AI_BUILDER_PAGES.DESIGN_SELECTION) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > AI_BUILDER_PAGES.METHOD_SELECTION) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Handle design editing
  const handleEditDesign = async (design) => {
    if (userTier === 'FREE') {
      setError('Design editing requires a Premium subscription.');
      return;
    }

    try {
      if (design.canvaDesignId && process.env.REACT_APP_CANVA_API_KEY) {
        // Open Canva editor in new tab
        if (CanvaService?.getEditUrl && typeof CanvaService.getEditUrl === 'function') {
          const editUrl = CanvaService.getEditUrl(design.canvaDesignId, user.id);
          window.open(editUrl, '_blank', 'width=1200,height=800');
        } else {
          throw new Error('CanvaService.getEditUrl not available');
        }
      } else {
        // Fallback: Show customization options
        setError('Advanced editing requires Canva integration. Please contact support.');
      }
    } catch (err) {
      setError('Failed to open design editor. Please try again.');
      console.error('Edit design error:', err);
    }
  };

  // Handle design export
  const handleExportDesign = async (design) => {
    if (userTier === 'FREE') {
      setError('Design export requires a Premium subscription.');
      return;
    }

    try {
      if (design.canvaDesignId && process.env.REACT_APP_CANVA_API_KEY) {
        if (CanvaService?.initializeCanvaConnect && CanvaService?.exportDesign && 
            typeof CanvaService.initializeCanvaConnect === 'function' && 
            typeof CanvaService.exportDesign === 'function') {
          const canvaAuth = await CanvaService.initializeCanvaConnect(user.id, sessionData);
          
          if (canvaAuth.success) {
            const exportResult = await CanvaService.exportDesign(
              design.canvaDesignId, 
              'PNG', 
              canvaAuth.accessToken
            );
            
            if (exportResult.success) {
              // Download the file
              const link = document.createElement('a');
              link.href = exportResult.downloadUrl;
              link.download = `${sessionData.campaignName}-${design.title}.png`;
              link.click();
            } else {
              throw new Error('Export failed');
            }
          }
        } else {
          throw new Error('CanvaService methods not available');
        }
      } else {
        // Mock export for demo
        const link = document.createElement('a');
        link.href = design.thumbnailUrl;
        link.download = `${sessionData.campaignName}-${design.title}.png`;
        link.click();
      }
    } catch (err) {
      setError('Failed to export design. Please try again.');
      console.error('Export design error:', err);
    }
  };

  // Generate content variations (Premium feature)
  const generateContentVariations = async (type) => {
    if (userTier === 'FREE') {
      setError('Content variations require a Premium subscription.');
      return;
    }

    try {
      setIsLoading(true);
      // Implementation would go here
      console.log(`Generating ${type} variations`);
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1500));
      setError(null);
    } catch (err) {
      setError(`Failed to generate ${type} variations. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Update session data
  const updateSessionData = (updates) => {
    setSessionData(prev => ({ ...prev, ...updates }));
  };

  // Handle AI generation with real services
  const handleAIGeneration = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      // Create AI session with your backend
      if (!aiSessionId) {
        console.log('🤖 Creating AI design session...');
        let sessionResponse;
        
        // Try real service first, fallback to mock
        try {
          if (AIDesignService?.createSession && typeof AIDesignService.createSession === 'function') {
            sessionResponse = await AIDesignService.createSession(sessionData);
          } else {
            throw new Error('AIDesignService not available');
          }
        } catch (err) {
          console.log('Using mock service for session creation');
          sessionResponse = await MockDesignService.createAISession(sessionData);
        }
        
        if (sessionResponse.success) {
          setAiSessionId(sessionResponse.data.sessionId);
        } else {
          throw new Error(sessionResponse.error);
        }
      }
      
      // Generate designs using your backend services
      let designResponse;
      
      try {
        const aiEnabled = AIDesignService?.isAIEnabled && typeof AIDesignService.isAIEnabled === 'function' ? AIDesignService.isAIEnabled() : false;
        const canvaEnabled = CanvaService?.isCanvaEnabled && typeof CanvaService.isCanvaEnabled === 'function' ? CanvaService.isCanvaEnabled() : false;
        
        if (aiEnabled && canvaEnabled) {
          console.log('🎨 Using real AI + Canva integration');
          designResponse = await AIDesignService.generateDesigns(
            aiSessionId || sessionResponse.data.sessionId, 
            sessionData
          );
        } else if (canvaEnabled) {
          console.log('🎨 Using Canva integration only');
          designResponse = await CanvaService.generateDesigns(sessionData);
        } else {
          throw new Error('Fallback to mock service');
        }
      } catch (err) {
        console.log('🎭 Using mock design generation');
        designResponse = await MockDesignService.generateDesigns(aiSessionId, sessionData);
      }
      
      if (designResponse.success) {
        setGeneratedDesigns(designResponse.designs || designResponse.data?.designs || []);
        nextPage(); // Move to design selection
      } else {
        throw new Error(designResponse.error);
      }
    } catch (err) {
      setError('Failed to generate designs. Please try again.');
      console.error('AI Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle campaign creation with your actual API
  const handleCreateCampaign = async () => {
    try {
      setIsLoading(true);
      
      const campaignPayload = {
        name: sessionData.campaignName,
        title: sessionData.campaignName,
        description: `AI-generated campaign for ${sessionData.brandData.businessName}`,
        brand_name: sessionData.brandData.businessName,
        budget: sessionData.budgetRange[1],
        dailyBudget: null,
        currency: 'USD',
        start_date: sessionData.duration.startDate,
        end_date: sessionData.duration.endDate,
        primary_objective: sessionData.primaryGoal?.toUpperCase() || 'BRAND_AWARENESS',
        creative_concept: `AI-optimized ${sessionData.brandData.tone} design for ${sessionData.placementContext.spaceType}`,
        call_to_action: sessionData.brandData.cta,
        content_description: sessionData.brandData.keyMessage,
        media_files: [],
        targetAudience: sessionData.targetAudience,
        geographic_targeting: { location: sessionData.placementContext.location },
        keywords: [],
        target_demographics: {},
        brand_guidelines: {
          colors: sessionData.brandData.colors,
          tone: sessionData.brandData.tone,
          industry: sessionData.brandData.industry
        },
        placement_preferences: {
          spaceType: sessionData.placementContext.spaceType,
          viewingDistance: sessionData.placementContext.viewingDistance,
          duration: sessionData.placementContext.duration
        },
        status: 'DRAFT',
        isActive: false,
        // AI-specific fields
        aiSessionId,
        aiGenerated: true,
        selectedDesignId: selectedDesign?.id,
        contextData: sessionData.placementContext
      };
      
      console.log('🚀 Creating AI campaign:', campaignPayload);
      
      if (apiClient?.createCampaign && typeof apiClient.createCampaign === 'function') {
        const response = await apiClient.createCampaign(campaignPayload);
        
        if (response.success) {
          handleClose();
          navigate('/advertise?tab=campaigns&created=true');
        } else {
          throw new Error(response.error || 'Failed to create campaign');
        }
      } else {
        // Mock successful campaign creation for demo
        console.log('Using mock campaign creation');
        await new Promise(resolve => setTimeout(resolve, 1000));
        handleClose();
        navigate('/advertise?tab=campaigns&created=true');
      }
    } catch (err) {
      setError('Failed to create campaign. Please try again.');
      console.error('Campaign creation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Color picker component
  const ColorPicker = ({ colors, onChange }) => {
    const presetColors = ['#FF6B35', '#004E89', '#1A5C96', '#E63946', '#F77F00', '#FCBF49', '#2A9D8F', '#264653'];
    
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {presetColors.map((color) => (
            <button
              key={color}
              onClick={() => {
                const newColors = colors.includes(color) 
                  ? colors.filter(c => c !== color)
                  : [...colors, color];
                onChange(newColors);
              }}
              className={`w-8 h-8 rounded-full border-2 ${
                colors.includes(color) ? 'border-gray-900' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {colors.map((color, index) => (
            <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
              {color}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // Progress indicator
  const ProgressIndicator = () => (
    <div className="flex items-center justify-center space-x-2 mb-6">
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${
            i <= currentPage ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        />
      ))}
    </div>
  );

  // Free tier upgrade prompt
  const UpgradePrompt = ({ feature }) => (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-4">
      <div className="flex items-start space-x-3">
        <Crown className="w-5 h-5 text-purple-600 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-purple-900">Unlock Premium AI Features</h4>
          <p className="text-sm text-purple-700 mt-1">
            {feature} requires a Premium subscription.
          </p>
          <button className="mt-2 text-sm font-medium text-purple-600 hover:text-purple-800">
            Upgrade to Premium →
          </button>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ paddingTop: '64px' }}>
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleClose} />
        
        {/* Center alignment helper for larger screens */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-[calc(100vh-64px)]" aria-hidden="true">&#8203;</span>
        
        {/* Modal */}
        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl sm:align-middle">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              {currentPage > AI_BUILDER_PAGES.METHOD_SELECTION && (
                <button onClick={prevPage} className="p-1 hover:bg-gray-100 rounded">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <h2 className="text-xl font-bold text-gray-900">
                {currentPage === AI_BUILDER_PAGES.METHOD_SELECTION && 'Create Your Campaign'}
                {currentPage === AI_BUILDER_PAGES.CAMPAIGN_BASICS && 'Campaign Basics'}
                {currentPage === AI_BUILDER_PAGES.BRAND_CONTENT && 'Brand & Content'}
                {currentPage === AI_BUILDER_PAGES.PLACEMENT_CONTEXT && 'Placement Context'}
                {currentPage === AI_BUILDER_PAGES.AI_GENERATION && 'AI Generation'}
                {currentPage === AI_BUILDER_PAGES.DESIGN_SELECTION && 'Select Your Design'}
              </h2>
            </div>
            <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Indicator */}
          {currentPage > AI_BUILDER_PAGES.METHOD_SELECTION && (
            <div className="px-6 pt-4">
              <ProgressIndicator />
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {/* Page 1: Method Selection */}
            {currentPage === AI_BUILDER_PAGES.METHOD_SELECTION && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <p className="text-gray-600">Choose how you'd like to create your campaign</p>
                </div>
                
                <div className="grid gap-4 md:grid-cols-3">
                  {/* AI Builder - Recommended */}
                  <button
  onClick={() => setCurrentPage(AI_BUILDER_PAGES.CAMPAIGN_BASICS)}
  className="group relative p-6 text-left rounded-xl transition-all duration-300 bg-white hover:shadow-xl hover:scale-[1.02] overflow-hidden"
>
  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl p-[2px]">
    <div className="h-full w-full bg-white rounded-[10px]"></div>
  </div>
  
  <div className="relative z-10">
    <div className="absolute top-4 right-4">
      <span className="px-2 py-1 text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
        Recommended
      </span>
    </div>
    <Sparkles className="w-8 h-8 text-blue-600 mb-4 group-hover:text-purple-600 transition-colors" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Builder</h3>
    <p className="text-sm text-gray-600">
      Let AI create optimized ads for you based on your business and goals
    </p>
  </div>
</button>

                  {/* Template Builder */}
                  <button
  onClick={() => alert('Template builder coming soon!')}
  className="group relative p-6 text-left rounded-xl transition-all duration-300 bg-white hover:shadow-xl hover:scale-[1.02] overflow-hidden"
>
  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-xl p-[2px] opacity-60 group-hover:opacity-100 transition-opacity">
    <div className="h-full w-full bg-white rounded-[10px]"></div>
  </div>
  
  <div className="relative z-10">
    <FileText className="w-8 h-8 text-gray-600 mb-4 group-hover:text-emerald-600 transition-colors" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">Build from Template</h3>
    <p className="text-sm text-gray-600">
      Start with proven templates and customize to your needs
    </p>
  </div>
</button>

                  {/* Upload Creative */}
                  <button
  onClick={() => alert('Upload creative coming soon!')}
  className="group relative p-6 text-left rounded-xl transition-all duration-300 bg-white hover:shadow-xl hover:scale-[1.02] overflow-hidden"
>
  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-xl p-[2px] opacity-60 group-hover:opacity-100 transition-opacity">
    <div className="h-full w-full bg-white rounded-[10px]"></div>
  </div>
  
  <div className="relative z-10">
    <Upload className="w-8 h-8 text-gray-600 mb-4 group-hover:text-orange-600 transition-colors" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Creative</h3>
    <p className="text-sm text-gray-600">
      Use your existing designs and assets
    </p>
  </div>
</button>
                </div>
              </div>
            )}

            {/* Page 2: Campaign Basics */}
            {currentPage === AI_BUILDER_PAGES.CAMPAIGN_BASICS && (
              <div className="space-y-6 max-w-2xl">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Campaign Name
                    </label>
                    <input
                      type="text"
                      value={sessionData.campaignName}
                      onChange={(e) => updateSessionData({ campaignName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Summer Sale Campaign"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Campaign Type
                    </label>
                    <select
                      value={sessionData.campaignType}
                      onChange={(e) => updateSessionData({ campaignType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select type...</option>
                      <option value="brand_awareness">Brand Awareness</option>
                      <option value="sales">Sales & Promotion</option>
                      <option value="event">Event Promotion</option>
                      <option value="grand_opening">Grand Opening</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Goal
                  </label>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {['Traffic', 'Conversions', 'Brand Awareness'].map((goal) => (
                      <button
                        key={goal}
                        onClick={() => updateSessionData({ primaryGoal: goal.toLowerCase() })}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          sessionData.primaryGoal === goal.toLowerCase()
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Range: ${sessionData.budgetRange[0].toLocaleString()} - ${sessionData.budgetRange[1].toLocaleString()}
                  </label>
                  <div className="px-2">
                    <input
                      type="range"
                      min="0"
                      max="50000"
                      step="500"
                      value={sessionData.budgetRange[1]}
                      onChange={(e) => {
                        const maxBudget = parseInt(e.target.value);
                        const minBudget = Math.min(sessionData.budgetRange[0], maxBudget - 500);
                        updateSessionData({ 
                          budgetRange: [minBudget >= 0 ? minBudget : 0, maxBudget] 
                        });
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>$0</span>
                      <span>$50,000+</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={sessionData.duration.startDate}
                      onChange={(e) => updateSessionData({ 
                        duration: { ...sessionData.duration, startDate: e.target.value } 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={sessionData.duration.endDate}
                      onChange={(e) => updateSessionData({ 
                        duration: { ...sessionData.duration, endDate: e.target.value } 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Page 3: Brand & Content */}
            {currentPage === AI_BUILDER_PAGES.BRAND_CONTENT && (
              <div className="space-y-6 max-w-2xl">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Name
                    </label>
                    <input
                      type="text"
                      value={sessionData.brandData.businessName}
                      onChange={(e) => updateSessionData({ 
                        brandData: { ...sessionData.brandData, businessName: e.target.value } 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Joe's Coffee"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry
                    </label>
                    <select
                      value={sessionData.brandData.industry}
                      onChange={(e) => updateSessionData({ 
                        brandData: { ...sessionData.brandData, industry: e.target.value } 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select industry...</option>
                      {INDUSTRIES.map((industry) => (
                        <option key={industry.id} value={industry.id}>
                          {industry.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand Colors
                  </label>
                  <ColorPicker
                    colors={sessionData.brandData.colors}
                    onChange={(colors) => updateSessionData({ 
                      brandData: { ...sessionData.brandData, colors } 
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo Upload (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Upload your logo</p>
                    <button className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">
                      Choose File
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Message
                  </label>
                  <input
                    type="text"
                    value={sessionData.brandData.keyMessage}
                    onChange={(e) => updateSessionData({ 
                      brandData: { ...sessionData.brandData, keyMessage: e.target.value } 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Best Coffee in Town"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Call-to-Action
                    </label>
                    <input
                      type="text"
                      value={sessionData.brandData.cta}
                      onChange={(e) => updateSessionData({ 
                        brandData: { ...sessionData.brandData, cta: e.target.value } 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Visit Today"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tone of Voice
                    </label>
                    <select
                      value={sessionData.brandData.tone}
                      onChange={(e) => updateSessionData({ 
                        brandData: { ...sessionData.brandData, tone: e.target.value } 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select tone...</option>
                      {TONE_OPTIONS.map((tone) => (
                        <option key={tone} value={tone.toLowerCase()}>
                          {tone}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Page 4: Placement Context */}
            {currentPage === AI_BUILDER_PAGES.PLACEMENT_CONTEXT && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Placement Type
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {PLACEMENT_TYPES.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => updateSessionData({ 
                          placementContext: { ...sessionData.placementContext, spaceType: type.id } 
                        })}
                        className={`p-4 text-left border rounded-lg transition-colors ${
                          sessionData.placementContext.spaceType === type.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <h4 className="font-medium text-gray-900 mb-1">{type.label}</h4>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location Context
                  </label>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {['urban', 'suburban', 'rural'].map((location) => (
                      <button
                        key={location}
                        onClick={() => updateSessionData({ 
                          placementContext: { ...sessionData.placementContext, location } 
                        })}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                          sessionData.placementContext.location === location
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {location}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Viewing Distance
                  </label>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {[
                      { id: 'close', label: 'Close (1-5ft)' },
                      { id: 'medium', label: 'Medium (5-15ft)' },
                      { id: 'far', label: 'Far (15ft+)' }
                    ].map((distance) => (
                      <button
                        key={distance.id}
                        onClick={() => updateSessionData({ 
                          placementContext: { ...sessionData.placementContext, viewingDistance: distance.id } 
                        })}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          sessionData.placementContext.viewingDistance === distance.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {distance.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Viewing Duration
                  </label>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {[
                      { id: 'quick_glance', label: 'Quick Glance' },
                      { id: 'brief_view', label: 'Brief View' },
                      { id: 'extended_view', label: 'Extended View' }
                    ].map((duration) => (
                      <button
                        key={duration.id}
                        onClick={() => updateSessionData({ 
                          placementContext: { ...sessionData.placementContext, duration: duration.id } 
                        })}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          sessionData.placementContext.duration === duration.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {duration.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Page 5: AI Generation */}
            {currentPage === AI_BUILDER_PAGES.AI_GENERATION && (
              <div className="space-y-6 max-w-2xl mx-auto text-center">
                {!isGenerating && !generatedDesigns.length && (
                  <>
                    <div className="mb-6">
                      <Wand2 className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Ready to Generate Your Designs
                      </h3>
                      <p className="text-gray-600">
                        Our AI will create optimized designs based on your campaign requirements
                      </p>
                    </div>

                    {/* Feature comparison */}
                    <div className="grid gap-4 md:grid-cols-2 text-left">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">Free Tier</h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                          <li>• 3 design variations</li>
                          <li>• Basic templates</li>
                          <li>• Standard optimization</li>
                        </ul>
                      </div>
                      
                      <div className="p-4 border-2 border-purple-200 bg-purple-50 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Crown className="w-4 h-4 text-purple-600 mr-2" />
                          <h4 className="font-semibold text-purple-900">Premium Tier</h4>
                        </div>
                        <ul className="space-y-1 text-sm text-purple-700">
                          <li>• Unlimited variations</li>
                          <li>• Advanced market insights</li>
                          <li>• A/B testing recommendations</li>
                          <li>• Performance predictions</li>
                        </ul>
                      </div>
                    </div>

                    {userTier === 'FREE' && (
                      <UpgradePrompt feature="Unlimited AI generations and advanced features" />
                    )}

                    <button
                      onClick={handleAIGeneration}
                      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Sparkles className="w-5 h-5" />
                      <span>Generate AI Designs</span>
                    </button>
                  </>
                )}

                {isGenerating && (
                  <div className="py-12">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="relative">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                        <div className="absolute inset-0 rounded-full bg-blue-100 animate-pulse" />
                      </div>
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Creating Your Designs
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>• Analyzing your requirements...</p>
                          <p>• Applying market insights...</p>
                          <p>• Generating optimized designs...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <p className="text-red-700">{error}</p>
                    </div>
                    <button
                      onClick={handleAIGeneration}
                      className="mt-2 text-sm font-medium text-red-600 hover:text-red-800"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Page 6: Design Selection & Editing */}
            {currentPage === AI_BUILDER_PAGES.DESIGN_SELECTION && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Choose Your Design
                  </h3>
                  <p className="text-gray-600">
                    Select the design that best represents your campaign
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  {generatedDesigns.map((design) => (
                    <div
                      key={design.id}
                      className={`border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                        selectedDesign?.id === design.id
                          ? 'border-blue-500 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedDesign(design)}
                    >
                      <div className="aspect-w-3 aspect-h-2 bg-gray-100 relative">
                        <img
                          src={design.thumbnailUrl}
                          alt={design.title}
                          className="w-full h-48 object-cover"
                        />
                        {selectedDesign?.id === design.id && (
                          <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{design.title}</h4>
                          {design.canEdit && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditDesign(design);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">{design.performanceScore}/10</span>
                          </div>
                          {userTier === 'PREMIUM' && (
                            <span className="text-xs text-green-600 font-medium">Predicted High Performance</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {design.tags?.map((tag) => (
                            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        {/* Design Actions */}
                        <div className="flex space-x-2">
                          {design.canEdit && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditDesign(design);
                              }}
                              className="flex-1 px-3 py-1.5 text-sm border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                            >
                              <Wand2 className="w-3 h-3 inline mr-1" />
                              Customize
                            </button>
                          )}
                          
                          {userTier === 'PREMIUM' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExportDesign(design);
                              }}
                              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                            >
                              <Download className="w-3 h-3 inline mr-1" />
                              Export
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Content Variations (Premium Feature) */}
                {selectedDesign && userTier === 'PREMIUM' && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <h4 className="font-semibold text-purple-900 mb-4 flex items-center">
                      <Sparkles className="w-5 h-5 mr-2" />
                      AI Content Variations
                    </h4>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-purple-800 mb-2">
                          Headline Variations
                        </label>
                        <button
                          onClick={() => generateContentVariations('HEADLINE')}
                          disabled={isLoading}
                          className="w-full text-left p-3 bg-white border border-purple-200 rounded-lg hover:border-purple-300 transition-colors disabled:opacity-50"
                        >
                          <div className="text-sm text-purple-700">
                            {isLoading ? 'Generating...' : 'Generate AI-powered headline alternatives →'}
                          </div>
                        </button>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-purple-800 mb-2">
                          Call-to-Action Options
                        </label>
                        <button
                          onClick={() => generateContentVariations('CTA')}
                          disabled={isLoading}
                          className="w-full text-left p-3 bg-white border border-purple-200 rounded-lg hover:border-purple-300 transition-colors disabled:opacity-50"
                        >
                          <div className="text-sm text-purple-700">
                            {isLoading ? 'Generating...' : 'Generate compelling CTA variations →'}
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {userTier === 'FREE' && (
                  <div className="text-center">
                    <p className="text-gray-600 mb-2">Want more design options and editing features?</p>
                    <button className="text-purple-600 font-medium hover:text-purple-800">
                      Upgrade to Premium for unlimited variations and advanced editing →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 bg-gray-50 border-t">
            <div className="flex items-center space-x-4">
              {currentPage > AI_BUILDER_PAGES.METHOD_SELECTION && currentPage < AI_BUILDER_PAGES.AI_GENERATION && (
                <button
                  onClick={prevPage}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {currentPage === AI_BUILDER_PAGES.METHOD_SELECTION && (
                <button
                  onClick={handleClose}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              )}

              {currentPage === AI_BUILDER_PAGES.CAMPAIGN_BASICS && (
                <button
                  onClick={nextPage}
                  disabled={!sessionData.campaignName || !sessionData.campaignType}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {currentPage === AI_BUILDER_PAGES.BRAND_CONTENT && (
                <button
                  onClick={nextPage}
                  disabled={!sessionData.brandData.businessName || !sessionData.brandData.industry}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {currentPage === AI_BUILDER_PAGES.PLACEMENT_CONTEXT && (
                <button
                  onClick={nextPage}
                  disabled={!sessionData.placementContext.spaceType}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Generate Designs</span>
                  <Sparkles className="w-4 h-4" />
                </button>
              )}

              {currentPage === AI_BUILDER_PAGES.DESIGN_SELECTION && (
                <button
                  onClick={handleCreateCampaign}
                  disabled={!selectedDesign || isLoading}
                  className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Create Campaign</span>
                  {!isLoading && <Check className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}