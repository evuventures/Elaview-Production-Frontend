import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Calendar, Clock, DollarSign, Camera, Upload, 
  CheckCircle, AlertCircle, MapPin, Building2, Zap, 
  Plus, ChevronDown, ChevronUp, Loader2, Info
} from 'lucide-react';

export default function BookingPage() {
  const { propertyId, spaceId } = useParams();
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useAuth();
  const { user: currentUser } = useUser();

  // Page state
  const [isLoading, setIsLoading] = useState(true);
  const [property, setProperty] = useState(null);
  const [space, setSpace] = useState(null);
  const [campaigns, setCampaigns] = useState([]);

  // Booking state
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [duration, setDuration] = useState(7);
  const [uploadedImage, setUploadedImage] = useState(null);

  // Campaign creation state
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    budget: 0,
    description: '',
    dailyBudget: 0
  });
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);

  // API helper function following your pattern
  const apiCall = async (endpoint, options = {}) => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    
    let authToken = '';
    try {
      if (window.Clerk?.session) {
        authToken = await window.Clerk.session.getToken();
      }
    } catch (error) {
      console.error('Failed to get auth token:', error);
      throw new Error('Authentication failed');
    }

    const response = await fetch(`${apiBaseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API call failed: ${response.status} ${errorText}`);
    }

    return await response.json();
  };

  // Load booking data
  useEffect(() => {
    if (isSignedIn && propertyId && spaceId) {
      loadBookingData();
    }
  }, [isSignedIn, propertyId, spaceId, duration]);

  const loadBookingData = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Loading booking data for:', { propertyId, spaceId });

      // Load property details using public endpoint
      const propertyResponse = await apiCall(`/properties/public/${propertyId}`);
      if (propertyResponse.success) {
        setProperty(propertyResponse.data);
        console.log('✅ Property loaded:', propertyResponse.data.title);
      }

      // Find the specific advertising area (space) within the property
      let foundSpace = null;
      if (propertyResponse.success && propertyResponse.data.advertising_areas) {
        foundSpace = propertyResponse.data.advertising_areas.find(area => area.id === spaceId);
      }

      // If not found in property, try direct space lookup using new endpoint
      if (!foundSpace) {
        try {
          const spaceResponse = await apiCall(`/properties/areas/${spaceId}`);
          if (spaceResponse.success) {
            foundSpace = spaceResponse.data;
            // If we got the space but not the property, get property from space
            if (!propertyResponse.success && spaceResponse.data.properties) {
              setProperty(spaceResponse.data.properties);
              console.log('✅ Property loaded from space:', spaceResponse.data.properties.title);
            }
          }
        } catch (error) {
          console.warn('Space not found via direct lookup:', error);
        }
      }

      if (foundSpace) {
        setSpace(foundSpace);
        console.log('✅ Space loaded:', foundSpace.name);
        
        // Auto-fill campaign form with space details
        setNewCampaign(prev => ({
          ...prev,
          title: `${foundSpace.name} Campaign`,
          budget: Math.ceil((foundSpace.baseRate || 450) * duration * 1.2), // 20% buffer
          dailyBudget: foundSpace.baseRate || 450
        }));
      } else {
        console.error('❌ Space not found');
      }

      // Load user's campaigns
      const campaignsResponse = await apiCall('/campaigns');
      if (campaignsResponse.success) {
        setCampaigns(campaignsResponse.data);
        console.log('✅ Campaigns loaded:', campaignsResponse.data.length);
      }

    } catch (error) {
      console.error('❌ Failed to load booking data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate total cost
  const totalCost = space ? (space.baseRate || 450) * duration : 0;

  // Handle campaign creation
  const handleCreateCampaign = async () => {
    setIsCreatingCampaign(true);
    try {
      console.log('🔄 Creating campaign:', newCampaign);

      const campaignData = {
        title: newCampaign.title,
        description: newCampaign.description,
        budget: newCampaign.budget,
        dailyBudget: newCampaign.dailyBudget,
        startDate: startDate || new Date().toISOString(),
        endDate: endDate || new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString(),
        propertyId: propertyId
      };

      const response = await apiCall('/campaigns', {
        method: 'POST',
        body: JSON.stringify(campaignData)
      });

      if (response.success) {
        const createdCampaign = {
          ...response.data,
          remaining: response.data.budget - (response.data.totalSpent || 0)
        };
        
        setCampaigns(prev => [...prev, createdCampaign]);
        setSelectedCampaign(createdCampaign);
        setShowCampaignForm(false);
        console.log('✅ Campaign created:', createdCampaign.title);
      }
      
    } catch (error) {
      console.error('❌ Failed to create campaign:', error);
      alert('Failed to create campaign. Please try again.');
    } finally {
      setIsCreatingCampaign(false);
    }
  };

  // Handle booking creation
  const handleBooking = async () => {
    if (!selectedCampaign || !startDate || !endDate || !uploadedImage) return;
    
    try {
      console.log('🔄 Creating booking...');

      const bookingData = {
        startDate: startDate,
        endDate: endDate,
        totalAmount: totalCost,
        currency: 'USD',
        propertyId: propertyId,
        campaignId: selectedCampaign.id,
        advertisingAreaId: spaceId,
        notes: `Booking for ${space?.name} - Campaign: ${selectedCampaign.title}`
      };

      const response = await apiCall('/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData)
      });

      if (response.success) {
        console.log('✅ Booking created successfully:', response.data);
        alert('🎉 Booking created successfully!');
        navigate('/dashboard?booking_created=true');
      }
      
    } catch (error) {
      console.error('❌ Booking failed:', error);
      alert('Failed to create booking. Please try again.');
    }
  };

  // Handle file upload (placeholder - integrate with your upload route)
  const handleFileUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Use your existing upload route
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await window.Clerk.session.getToken()}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setUploadedImage({ name: file.name, url: result.url });
        console.log('✅ File uploaded:', result);
      }
    } catch (error) {
      console.error('❌ File upload failed:', error);
      // For now, simulate upload
      setUploadedImage({ name: file.name });
    }
  };

  // Auth guards
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">Please sign in to book this advertising space.</p>
          <button 
            onClick={() => navigate('/sign-in')}
            className="btn-gradient btn-lg font-bold"
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!property || !space) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Space Not Found</h1>
          <p className="text-muted-foreground mb-6">The advertising space you're looking for could not be found.</p>
          <button 
            onClick={() => navigate('/browse')}
            className="btn-gradient btn-lg font-bold"
          >
            Browse Other Spaces
          </button>
        </div>
      </div>
    );
  }

  const canProceed = selectedCampaign && startDate && endDate && uploadedImage;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4"
        >
          <button 
            onClick={() => navigate(-1)}
            className="btn-ghost p-2 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Book Advertising Space</h1>
            <p className="text-muted-foreground">Complete your booking for this premium location</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Property & Space Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="bg-background/95 backdrop-blur-xl rounded-2xl overflow-hidden shadow-lg border border-border/50">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={space?.images || property?.images?.[0] || property?.primary_image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800'} 
                    alt={space?.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                    {space?.type === 'digital_display' ? <Zap className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                    {space?.type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Advertising Space'}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-foreground mb-2">{space?.name || space?.title}</h2>
                    <p className="text-muted-foreground flex items-center gap-2 mb-2">
                      <Building2 className="w-4 h-4" />
                      {property?.title || property?.name}
                    </p>
                    <p className="text-muted-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {property?.address || `${property?.city}, ${property?.state || property?.country}`}
                    </p>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">{space?.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Daily Rate:</span>
                      <p className="font-medium">${space?.baseRate || 450}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <p className="font-medium">{space?.type?.replace('_', ' ') || 'Digital Display'}</p>
                    </div>
                  </div>
                  
                  {space?.features && (
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(space.features) ? space.features : JSON.parse(space.features || '[]')).map((feature, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 rounded-lg text-xs">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Campaign Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-background/95 backdrop-blur-xl rounded-2xl overflow-hidden shadow-lg border border-border/50">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-foreground mb-4">Select Campaign</h3>
                  
                  {campaigns.length > 0 ? (
                    <div className="space-y-3">
                      {campaigns.map((campaign) => {
                        const remaining = (campaign.budget || 0) - (campaign.totalSpent || 0);
                        return (
                          <div
                            key={campaign.id}
                            onClick={() => setSelectedCampaign({...campaign, remaining})}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              selectedCampaign?.id === campaign.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold">{campaign.title || campaign.name}</h4>
                              <span className="text-sm text-green-600 font-medium">
                                ${remaining.toLocaleString()} remaining
                              </span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>Budget: ${(campaign.budget || 0).toLocaleString()}</span>
                              <span>Status: {campaign.status || 'active'}</span>
                            </div>
                            
                            {remaining < totalCost && (
                              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-yellow-800 text-xs flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  Insufficient budget for this booking (${totalCost} needed)
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      
                      {/* Create New Campaign Button */}
                      <button
                        onClick={() => setShowCampaignForm(!showCampaignForm)}
                        className="w-full p-4 border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-xl transition-all text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Plus className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="font-medium">Create New Campaign</span>
                          </div>
                          {showCampaignForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </button>
                    </div>
                  ) : (
                    /* No Campaigns State */
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-8 h-8 text-blue-600" />
                      </div>
                      <h4 className="font-semibold mb-2">Create Your First Campaign</h4>
                      <p className="text-gray-600 text-sm mb-4">
                        You need a campaign to book advertising spaces. Create one now to continue.
                      </p>
                      <button
                        onClick={() => setShowCampaignForm(true)}
                        className="btn-gradient btn-lg font-bold"
                      >
                        Create Campaign
                      </button>
                    </div>
                  )}
                  
                  {/* Expandable Campaign Creation Form */}
                  <AnimatePresence>
                    {showCampaignForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200"
                      >
                        <h4 className="font-semibold mb-4">Create New Campaign</h4>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Campaign Name</label>
                            <input
                              type="text"
                              value={newCampaign.title}
                              onChange={(e) => setNewCampaign(prev => ({ ...prev, title: e.target.value }))}
                              className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter campaign name"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">Budget</label>
                            <input
                              type="number"
                              value={newCampaign.budget}
                              onChange={(e) => setNewCampaign(prev => ({ ...prev, budget: parseInt(e.target.value) || 0 }))}
                              className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="0"
                              min={totalCost}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Minimum ${totalCost} required for this booking
                            </p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                            <textarea
                              value={newCampaign.description}
                              onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
                              className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Describe your campaign objectives..."
                              rows={3}
                            />
                          </div>
                          
                          <div className="flex gap-3">
                            <button
                              onClick={() => setShowCampaignForm(false)}
                              className="btn-outline flex-1"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleCreateCampaign}
                              disabled={!newCampaign.title || newCampaign.budget < totalCost || isCreatingCampaign}
                              className="btn-gradient flex-1 flex items-center justify-center"
                            >
                              {isCreatingCampaign ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Creating...
                                </>
                              ) : (
                                'Save & Select Campaign'
                              )}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* Image Upload */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="bg-background/95 backdrop-blur-xl rounded-2xl overflow-hidden shadow-lg border border-border/50">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-lg font-bold text-foreground">Upload Creative</h3>
                    <div className="p-1 rounded-full bg-blue-100 text-blue-600">
                      <Info className="w-3 h-3" />
                    </div>
                  </div>
                  
                  {/* Image Requirements */}
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Image Requirements</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                      <div>Resolution: 1920 × 1080 (recommended)</div>
                      <div>Aspect Ratio: 16:9</div>
                      <div>Formats: JPG, PNG, MP4</div>
                      <div>Max Size: 50MB</div>
                    </div>
                  </div>
                  
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                    {uploadedImage ? (
                      <div className="space-y-3">
                        <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                        <p className="font-medium">Creative uploaded successfully</p>
                        <p className="text-sm text-gray-600">{uploadedImage.name}</p>
                        <button
                          onClick={() => setUploadedImage(null)}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          Change Image
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                        <p className="font-medium">Upload your creative</p>
                        <p className="text-sm text-gray-600">
                          Drag and drop your image here or click to browse
                        </p>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              handleFileUpload(file);
                            }
                          }}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="btn-primary btn-sm cursor-pointer"
                        >
                          Choose File
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="sticky top-8"
            >
              <div className="bg-background/95 backdrop-blur-xl rounded-2xl overflow-hidden shadow-lg border border-border/50">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-foreground mb-4">Booking Summary</h3>
                  
                  {/* Duration Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Campaign Duration</label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value))}
                      className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={7}>1 Week</option>
                      <option value={14}>2 Weeks</option>
                      <option value={30}>1 Month</option>
                      <option value={60}>2 Months</option>
                      <option value={90}>3 Months</option>
                    </select>
                  </div>
                  
                  {/* Date Selection */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Start Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">End Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate || new Date().toISOString().split('T')[0]}
                        className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  {/* Price Breakdown */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Daily Rate:</span>
                      <span>${space?.baseRate || 450}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Duration:</span>
                      <span>{duration} days</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between font-bold">
                        <span>Total Cost:</span>
                        <span className="text-green-600">${totalCost.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Selected Campaign */}
                  {selectedCampaign && (
                    <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Campaign Selected</span>
                      </div>
                      <p className="text-sm text-green-700">{selectedCampaign.title || selectedCampaign.name}</p>
                      <p className="text-xs text-green-600">
                        ${selectedCampaign.remaining?.toLocaleString() || '0'} budget remaining
                      </p>
                    </div>
                  )}
                  
                  {/* Book Button */}
                  <button
                    onClick={handleBooking}
                    disabled={!canProceed}
                    className="btn-gradient btn-xl w-full font-bold transition-all hover:scale-105 active:scale-95"
                  >
                    {!selectedCampaign ? 'Select Campaign to Continue' :
                     !startDate || !endDate ? 'Select Dates to Continue' :
                     !uploadedImage ? 'Upload Creative to Continue' :
                     `Book for $${totalCost.toLocaleString()}`
                    }
                  </button>
                  
                  <p className="text-xs text-gray-500 text-center mt-3">
                    You'll be charged after the property owner approves your booking
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}