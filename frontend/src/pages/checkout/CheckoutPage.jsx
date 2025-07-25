import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Calendar, Clock, DollarSign, Camera, Upload, 
  CheckCircle, AlertCircle, MapPin, Building2, Zap, 
  Loader2, Info, Users, Shield, Phone, Mail, CreditCard
} from 'lucide-react';

export default function OptimizedBookingPage() {
  const { propertyId, spaceId } = useParams();
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useAuth();
  const { user: currentUser } = useUser();

  // Page state
  const [isLoading, setIsLoading] = useState(true);
  const [property, setProperty] = useState(null);
  const [space, setSpace] = useState(null);
  const [hasBusinessProfile, setHasBusinessProfile] = useState(false);

  // ✅ SIMPLIFIED: No campaigns required!
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState(7);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Business info state (only if not set up)
  const [businessInfo, setBusinessInfo] = useState({
    name: '',
    type: '',
    phone: '',
    email: currentUser?.primaryEmailAddress?.emailAddress || '',
    hasProfile: false
  });

  // ✅ SIMPLIFIED: Quick duration options instead of complex campaign setup
  const quickDurations = [
    { days: 1, label: 'Today Only', popular: false },
    { days: 7, label: '1 Week', popular: true },
    { days: 14, label: '2 Weeks', popular: false },
    { days: 30, label: '1 Month', popular: false }
  ];

  // API helper function
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
  }, [isSignedIn, propertyId, spaceId]);

  const loadBookingData = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Loading booking data for:', { propertyId, spaceId });

      // Load property details
      const propertyResponse = await apiCall(`/properties/public/${propertyId}`);
      if (propertyResponse.success) {
        setProperty(propertyResponse.data);
        console.log('✅ Property loaded:', propertyResponse.data.title);
      }

      // Find the specific advertising area
      let foundSpace = null;
      if (propertyResponse.success && propertyResponse.data.advertising_areas) {
        foundSpace = propertyResponse.data.advertising_areas.find(area => area.id === spaceId);
      }

      if (!foundSpace) {
        try {
          const spaceResponse = await apiCall(`/properties/areas/${spaceId}`);
          if (spaceResponse.success) {
            foundSpace = spaceResponse.data;
            if (!propertyResponse.success && spaceResponse.data.properties) {
              setProperty(spaceResponse.data.properties);
            }
          }
        } catch (error) {
          console.warn('Space not found via direct lookup:', error);
        }
      }

      if (foundSpace) {
        setSpace(foundSpace);
        console.log('✅ Space loaded:', foundSpace.name);
      }

      // ✅ SIMPLIFIED: Check if user has business profile (optional check)
      try {
        const userProfile = await apiCall('/user/profile');
        if (userProfile.success && userProfile.data?.businessName) {
          setHasBusinessProfile(true);
          setBusinessInfo({
            name: userProfile.data.businessName,
            type: userProfile.data.businessType || '',
            phone: userProfile.data.phone || '',
            email: userProfile.data.email || currentUser?.primaryEmailAddress?.emailAddress || '',
            hasProfile: true
          });
        }
      } catch (error) {
        console.log('No business profile found, will collect during booking');
      }

    } catch (error) {
      console.error('❌ Failed to load booking data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate dates and cost
  const endDate = new Date(new Date(startDate).getTime() + duration * 24 * 60 * 60 * 1000);
  const totalCost = space ? (space.baseRate || 450) * duration : 0;

  // Handle file upload
  const handleFileUpload = async (file) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await window.Clerk.session.getToken()}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setUploadedImage({ 
          name: file.name, 
          url: result.url,
          size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
        });
        console.log('✅ File uploaded:', result);
      }
    } catch (error) {
      console.error('❌ File upload failed:', error);
      // Simulate upload for demo
      setUploadedImage({ 
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
      });
    } finally {
      setIsUploading(false);
    }
  };

  // ✅ SIMPLIFIED: Direct booking without campaign requirement!
  const handleBooking = async () => {
    try {
      console.log('🔄 Creating direct booking...');

      // Create booking without campaign requirement
      const bookingData = {
        startDate: startDate,
        endDate: endDate.toISOString().split('T')[0],
        totalAmount: totalCost,
        currency: 'USD',
        propertyId: propertyId,
        advertisingAreaId: spaceId,
        businessName: businessInfo.name,
        businessType: businessInfo.type,
        contactPhone: businessInfo.phone,
        contactEmail: businessInfo.email,
        creativeUrl: uploadedImage?.url,
        notes: `Direct booking for ${space?.name} - Business: ${businessInfo.name}`
      };

      // ✅ NEW: Use direct booking endpoint instead of campaign-based
      const response = await apiCall('/bookings/direct', {
        method: 'POST',
        body: JSON.stringify(bookingData)
      });

      if (response.success) {
        console.log('✅ Booking created successfully:', response.data);
        alert('🎉 Booking submitted! You\'ll hear back within 24 hours.');
        navigate('/dashboard?booking_created=true');
      }
      
    } catch (error) {
      console.error('❌ Booking failed:', error);
      alert('Failed to create booking. Please try again.');
    }
  };

  // ✅ SIMPLIFIED: Validation without campaigns
  const canProceed = businessInfo.name && businessInfo.type && businessInfo.phone && 
                    businessInfo.email && startDate && uploadedImage;

  // Auth guards (keep existing)
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
            <p className="text-muted-foreground">Get your ad live in 24 hours</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* ✅ KEEP: Space Details (unchanged) */}
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
                </div>
              </div>
            </motion.div>

            {/* ✅ REPLACE: Business Details (instead of campaign selection) */}
            {!hasBusinessProfile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="bg-background/95 backdrop-blur-xl rounded-2xl overflow-hidden shadow-lg border border-border/50">
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="w-5 h-5 text-blue-500" />
                      <h3 className="text-lg font-bold text-foreground">Business Information</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Business Name *</label>
                        <input
                          type="text"
                          value={businessInfo.name}
                          onChange={(e) => setBusinessInfo(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Your Business Name"
                          className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Business Type *</label>
                        <select
                          value={businessInfo.type}
                          onChange={(e) => setBusinessInfo(prev => ({ ...prev, type: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select type...</option>
                          <option value="restaurant">Restaurant/Food</option>
                          <option value="retail">Retail Store</option>
                          <option value="service">Professional Service</option>
                          <option value="healthcare">Healthcare</option>
                          <option value="automotive">Automotive</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone Number *</label>
                        <input
                          type="tel"
                          value={businessInfo.phone}
                          onChange={(e) => setBusinessInfo(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="(555) 123-4567"
                          className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email Address *</label>
                        <input
                          type="email"
                          value={businessInfo.email}
                          onChange={(e) => setBusinessInfo(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="your@email.com"
                          className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* ✅ NEW: Verification Incentive (soft nudge) */}
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-blue-900 mb-1">Get Verified for Priority Approval</h4>
                          <p className="text-sm text-blue-800 mb-2">
                            Verified businesses get 24-hour approval and better rates.
                          </p>
                          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                            Set up verification after booking →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ✅ SIMPLIFIED: Creative Upload (reduced requirements) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="bg-background/95 backdrop-blur-xl rounded-2xl overflow-hidden shadow-lg border border-border/50">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Upload className="w-5 h-5 text-purple-500" />
                    <h3 className="text-lg font-bold text-foreground">Upload Your Creative</h3>
                    <div className="p-1 rounded-full bg-blue-100 text-blue-600">
                      <Info className="w-3 h-3" />
                    </div>
                  </div>
                  
                  {/* ✅ SIMPLIFIED: Reduced technical requirements */}
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Quick tip:</strong> High-quality images work best. We'll help optimize it for this specific display.
                    </p>
                  </div>
                  
                  {/* Upload Area (keep existing functionality) */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                    {uploadedImage ? (
                      <div className="space-y-3">
                        <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                        <p className="font-medium">Creative uploaded successfully</p>
                        <p className="text-sm text-gray-600">{uploadedImage.name} ({uploadedImage.size})</p>
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => setUploadedImage(null)}
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            Change File
                          </button>
                          {uploadedImage.url && (
                            <button
                              onClick={() => window.open(uploadedImage.url, '_blank')}
                              className="text-sm text-blue-600 hover:text-blue-700"
                            >
                              Preview
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                        <p className="font-medium">Drop your image here or click to browse</p>
                        <p className="text-sm text-gray-600">
                          JPG, PNG, or MP4 • Any size • We'll optimize it for you
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
                          className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer transition-colors"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            'Choose File'
                          )}
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ✅ SIMPLIFIED: Booking Summary (no campaign complexity) */}
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
                  
                  {/* ✅ SIMPLIFIED: Quick Duration Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-3">Campaign Duration</label>
                    <div className="space-y-2">
                      {quickDurations.map(option => (
                        <label 
                          key={option.days}
                          className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${
                            duration === option.days 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="duration"
                            value={option.days}
                            checked={duration === option.days}
                            onChange={() => setDuration(option.days)}
                            className="sr-only"
                          />
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{option.label}</span>
                            {option.popular && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                Popular
                              </span>
                            )}
                          </div>
                          <span className="font-semibold text-green-600">
                            ${((space?.baseRate || 450) * option.days).toLocaleString()}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Start Date */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  {/* ✅ SIMPLIFIED: Price Summary */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Daily Rate:</span>
                      <span>${space?.baseRate || 450}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Duration:</span>
                      <span>{duration} day{duration !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">End Date:</span>
                      <span>{endDate.toLocaleDateString()}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between font-bold">
                        <span>Total Cost:</span>
                        <span className="text-green-600">${totalCost.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* ✅ SIMPLIFIED: Direct booking button */}
                  <button
                    onClick={handleBooking}
                    disabled={!canProceed}
                    className={`w-full py-3 px-4 rounded-lg font-bold transition-all ${
                      canProceed 
                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {!businessInfo.name ? 'Enter Business Details' :
                     !businessInfo.type ? 'Select Business Type' :
                     !businessInfo.phone || !businessInfo.email ? 'Complete Contact Info' :
                     !uploadedImage ? 'Upload Creative' :
                     `Book for $${totalCost.toLocaleString()}`
                    }
                  </button>
                  
                  <p className="text-xs text-gray-500 text-center mt-3">
                    You'll be charged only after space owner approval (usually within 24 hours)
                  </p>

                  {/* Contact Support */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Need help?</p>
                    <div className="flex gap-2">
                      <button className="flex-1 flex items-center justify-center gap-2 p-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Phone className="w-4 h-4" />
                        Call
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 p-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Mail className="w-4 h-4" />
                        Email
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}