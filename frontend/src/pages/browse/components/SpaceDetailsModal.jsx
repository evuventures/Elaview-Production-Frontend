// src/pages/browse/components/SpaceDetailsModal.jsx
// ✅ REDESIGNED: More condensed and UX-friendly with left image layout
// ✅ NEW: Book Now redirects to CampaignSelection flow
// ✅ ADJUSTED: Accounts for 56px navbar height (h-14 Tailwind class = 3.5rem = 56px)

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Button } from "@/components/ui/button";
import { 
  X, ShoppingCart, Plus, CheckCircle, Star, MapPin, Users, TrendingUp, Eye,
  Calendar, Heart, Calculator, ChevronRight, Package, Clock, DollarSign,
  Building2, Info, AlertCircle, MessageSquare, Send, ChevronLeft, ChevronDown,
  Maximize2, FileText, BarChart3, Verified, Timer, Shield
} from "lucide-react";
import { getAreaName, getNumericPrice } from '../utils/areaHelpers';
import apiClient from '@/api/apiClient';

// Navbar height constant - matches the h-14 Tailwind class used in your navigation
// h-14 = 3.5rem = 56px
const NAVBAR_HEIGHT = '56px';

export default function SpaceDetailsModal({ 
  selectedSpace, 
  detailsExpanded, 
  setSelectedSpace, 
  setDetailsExpanded,
  isInCart,
  addToCart,
  handleBookingNavigation,
  setShowROICalculator
}) {
  const navigate = useNavigate();
  const { user: currentUser } = useUser();
  
  // State Management
  const [duration, setDuration] = useState(30);
  const [selectedDates, setSelectedDates] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [expandedSection, setExpandedSection] = useState(''); // 'analytics' or 'pricing'
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Message Owner state
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageContent, setMessageContent] = useState('');

  // Mock multiple images (in production, these would come from selectedSpace)
  const spaceImages = [
    selectedSpace?.images,
    selectedSpace?.images, // Duplicate for demo - replace with actual multiple images
    selectedSpace?.images
  ].filter(Boolean);

  // Calculate duration from dates
  useEffect(() => {
    if (selectedDates.start && selectedDates.end) {
      const start = new Date(selectedDates.start);
      const end = new Date(selectedDates.end);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDuration(Math.max(7, diffDays)); // Minimum 7 days
    }
  }, [selectedDates]);

  // Reset state when modal opens
  useEffect(() => {
    if (detailsExpanded && selectedSpace) {
      setDuration(30);
      setExpandedSection('');
      setCurrentImageIndex(0);
      setShowMessageModal(false);
      setMessageContent('');
      
      // Set default dates
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 30);
      
      setSelectedDates({
        start: today.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      });
    }
  }, [detailsExpanded, selectedSpace]);

  // Get property owner information
  const getPropertyOwner = () => {
    if (!selectedSpace) return null;
    
    const ownerId = selectedSpace.property?.ownerId || 
                   selectedSpace.ownerId || 
                   selectedSpace.property?.users?.id;
                   
    return {
      id: ownerId,
      name: selectedSpace.property?.users?.firstName ? 
            `${selectedSpace.property.users.firstName} ${selectedSpace.property.users.lastName}`.trim() :
            selectedSpace.property?.users?.full_name ||
            'Property Owner',
      responseTime: '2 hours' // Mock data - replace with actual
    };
  };

  // Handle message owner functionality
  const handleMessageOwner = async () => {
    if (!currentUser?.id) {
      alert('Please sign in to message the property owner');
      return;
    }

    const owner = getPropertyOwner();
    
    if (!owner?.id) {
      alert('Unable to identify the property owner for this space');
      return;
    }

    setShowMessageModal(true);
  };

  // Send message and create conversation
  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      alert('Please enter a message');
      return;
    }

    setIsMessageLoading(true);

    try {
      const owner = getPropertyOwner();
      
      const conversationResponse = await apiClient.post('/conversations/create', {
        participantIds: [currentUser.id, owner.id],
        initialMessage: messageContent,
        type: 'DIRECT',
        propertyId: selectedSpace.property?.id || selectedSpace.propertyId,
        businessType: 'PROPERTY_INQUIRY',
        subject: `Inquiry about ${getAreaName(selectedSpace)}`,
        businessContext: {
          spaceId: selectedSpace.id,
          spaceName: getAreaName(selectedSpace),
          spaceType: selectedSpace.type || 'advertising_space',
          propertyAddress: selectedSpace.property?.address || selectedSpace.address,
          inquiryType: 'space_inquiry'
        }
      });

      if (conversationResponse.success) {
        setShowMessageModal(false);
        setDetailsExpanded(false);
        setSelectedSpace(null);
        
        navigate('/messages', { 
          state: { 
            conversationId: conversationResponse.data.id,
            openConversation: true
          } 
        });
        
        alert('Message sent successfully! Redirecting to your conversations.');
      } else {
        throw new Error(conversationResponse.error || 'Failed to send message');
      }

    } catch (error) {
      console.error('❌ Error sending message:', error);
      alert(`Failed to send message: ${error.message}`);
    } finally {
      setIsMessageLoading(false);
    }
  };

  // ✅ UPDATED: Navigate to CampaignSelection instead of checkout
  const handleBookNow = () => {
    if (!selectedSpace) return;
    
    console.log('📅 Book Now clicked - navigating to Campaign Selection:', selectedSpace.id);
    
    // Store space data in session for the campaign flow
    sessionStorage.setItem('selectedSpace', JSON.stringify({
      id: selectedSpace.id,
      name: getAreaName(selectedSpace),
      price: getNumericPrice(selectedSpace),
      duration: duration,
      dates: selectedDates,
      totalPrice: getNumericPrice(selectedSpace) * duration,
      propertyId: selectedSpace.property?.id || selectedSpace.propertyId
    }));
    
    // Navigate to campaign selection
    navigate('/TEMPUserJourney/CampaignSelection');
    
    // Close the modal
    setDetailsExpanded(false);
    setSelectedSpace(null);
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!selectedSpace) return;
    
    console.log('🛒 Add to Cart clicked from SpaceDetailsModal:', selectedSpace.id);
    addToCart(selectedSpace, duration);
  };

  if (!detailsExpanded || !selectedSpace) return null;

  const dailyPrice = getNumericPrice(selectedSpace);
  const totalPrice = dailyPrice * duration;
  const platformFee = totalPrice * 0.1;
  const grandTotal = totalPrice + platformFee;
  const owner = getPropertyOwner();

  // Format dimensions helper
  const formatDimensions = (dimensions) => {
    if (!dimensions) return 'Standard Size';
    if (typeof dimensions === 'string') return dimensions;
    if (typeof dimensions === 'object') {
      const { width, height, area, unit } = dimensions;
      if (width && height && unit) return `${width} x ${height} ${unit}`;
      if (area && unit) return `${area} ${unit}`;
      if (area) return `${area} sq ft`;
    }
    return 'Standard Size';
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        style={{ top: NAVBAR_HEIGHT }} // Account for navbar height
        onClick={() => {
          setDetailsExpanded(false);
          setSelectedSpace(null);
        }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="w-full max-w-6xl bg-white rounded-xl shadow-2xl overflow-hidden flex"
          style={{ maxHeight: `calc(100vh - ${NAVBAR_HEIGHT} - 2rem)` }} // Viewport height minus navbar and padding
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left Side - Image Gallery (50% width) */}
          <div className="w-1/2 bg-slate-900 relative flex flex-col" style={{ maxHeight: `calc(100vh - ${NAVBAR_HEIGHT} - 2rem)` }}>
            {/* Main Image */}
            <div className="flex-1 relative overflow-hidden">
              {spaceImages.length > 0 ? (
                <>
                  <img 
                    src={spaceImages[currentImageIndex]} 
                    alt={getAreaName(selectedSpace)}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/800x600/4668AB/ffffff?text=Advertisement+Space';
                    }}
                  />
                  
                  {/* Image Navigation */}
                  {spaceImages.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev - 1 + spaceImages.length) % spaceImages.length)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 hover:bg-white transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5 text-slate-700" />
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev + 1) % spaceImages.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 hover:bg-white transition-colors"
                      >
                        <ChevronRight className="w-5 h-5 text-slate-700" />
                      </button>
                    </>
                  )}
                  
                  {/* Image Indicators */}
                  {spaceImages.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {spaceImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentImageIndex 
                              ? 'w-8 bg-white' 
                              : 'bg-white/50 hover:bg-white/70'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                  <div className="text-center">
                    <Maximize2 className="w-16 h-16 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600">No image available</p>
                  </div>
                </div>
              )}
              
              {/* Property Badge */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2">
                <p className="text-xs text-slate-500">Property</p>
                <p className="font-medium text-slate-900">
                  {selectedSpace.propertyName || 'Prime Location'}
                </p>
              </div>
            </div>

            {/* Thumbnail Strip (if multiple images) */}
            {spaceImages.length > 1 && (
              <div className="h-20 bg-slate-800 flex gap-2 p-2 overflow-x-auto">
                {spaceImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-24 h-full rounded overflow-hidden border-2 transition-all ${
                      index === currentImageIndex 
                        ? 'border-white' 
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`View ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Details (50% width) */}
          <div className="w-1/2 flex flex-col" style={{ maxHeight: `calc(100vh - ${NAVBAR_HEIGHT} - 2rem)` }}>
            {/* Header */}
            <div className="p-6 border-b border-slate-200">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">
                    {getAreaName(selectedSpace)}
                  </h2>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {selectedSpace.propertyAddress || 'High Traffic Location'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield className="w-3 h-3 text-green-500" />
                      Verified
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setDetailsExpanded(false);
                    setSelectedSpace(null);
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Quick Stats Bar */}
              <div className="flex gap-4 pt-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Daily Views</p>
                    <p className="font-semibold text-slate-900">
                      {selectedSpace.daily_impressions?.toLocaleString() || '5,000'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Engagement</p>
                    <p className="font-semibold text-slate-900">92%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Rating</p>
                    <p className="font-semibold text-slate-900">4.8</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Calendar Selector */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" style={{ color: '#4668AB' }} />
                  Select Campaign Dates
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Start Date</label>
                    <input
                      type="date"
                      value={selectedDates.start}
                      onChange={(e) => setSelectedDates({...selectedDates, start: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">End Date</label>
                    <input
                      type="date"
                      value={selectedDates.end}
                      onChange={(e) => setSelectedDates({...selectedDates, end: e.target.value})}
                      min={selectedDates.start || new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Campaign Duration: <span className="font-medium text-slate-700">{duration} days</span> (Minimum: 7 days)
                </p>
              </div>

              {/* Key Features */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Key Features</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: Building2, text: formatDimensions(selectedSpace.dimensions) },
                    { icon: Clock, text: '24/7 Display Time' },
                    { icon: Shield, text: 'Weather Resistant' },
                    { icon: CheckCircle, text: 'Professional Installation' }
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <feature.icon className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-slate-600">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Property Owner Card */}
              {owner && (
                <div className="mb-6 bg-slate-50 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building2 className="w-5 h-5" style={{ color: '#4668AB' }} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{owner.name}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <Timer className="w-3 h-3" />
                          Typically responds in {owner.responseTime}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleMessageOwner}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Contact
                    </button>
                  </div>
                </div>
              )}

              {/* Collapsible Sections */}
              <div className="space-y-3">
                {/* Analytics Link */}
                <button
                  onClick={() => setExpandedSection(expandedSection === 'analytics' ? '' : 'analytics')}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" style={{ color: '#4668AB' }} />
                    <span className="text-sm font-medium text-slate-700">View Analytics & Demographics</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${
                    expandedSection === 'analytics' ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {/* Analytics Content */}
                <AnimatePresence>
                  {expandedSection === 'analytics' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 bg-white border border-slate-200 rounded-lg">
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="bg-slate-50 rounded-lg p-3">
                              <p className="text-lg font-bold text-slate-900">35K</p>
                              <p className="text-xs text-slate-500">Weekly Views</p>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-3">
                              <p className="text-lg font-bold text-slate-900">2.3%</p>
                              <p className="text-xs text-slate-500">CTR</p>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-3">
                              <p className="text-lg font-bold text-slate-900">A+</p>
                              <p className="text-xs text-slate-500">Location Score</p>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-xs font-medium text-slate-700 mb-2">Top Audience Demographics</p>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-600">Age 25-34</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-24 bg-slate-200 rounded-full h-1.5">
                                    <div className="h-1.5 rounded-full" style={{ width: '35%', backgroundColor: '#4668AB' }} />
                                  </div>
                                  <span className="font-medium">35%</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-600">Age 35-44</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-24 bg-slate-200 rounded-full h-1.5">
                                    <div className="h-1.5 rounded-full" style={{ width: '28%', backgroundColor: '#4668AB' }} />
                                  </div>
                                  <span className="font-medium">28%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Pricing Details Link */}
                <button
                  onClick={() => setExpandedSection(expandedSection === 'pricing' ? '' : 'pricing')}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4" style={{ color: '#4668AB' }} />
                    <span className="text-sm font-medium text-slate-700">View Pricing Breakdown</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${
                    expandedSection === 'pricing' ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {/* Pricing Content */}
                <AnimatePresence>
                  {expandedSection === 'pricing' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 bg-white border border-slate-200 rounded-lg">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-sm text-slate-600">Daily Rate</span>
                            <span className="text-sm font-medium text-slate-900">${dailyPrice.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-sm text-slate-600">Duration</span>
                            <span className="text-sm font-medium text-slate-900">{duration} days</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-sm text-slate-600">Subtotal</span>
                            <span className="text-sm font-medium text-slate-900">${totalPrice.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-sm text-slate-600">Platform Fee (10%)</span>
                            <span className="text-sm font-medium text-slate-900">${platformFee.toFixed(2)}</span>
                          </div>
                        </div>
                        
                        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-xs text-amber-800">
                            💡 <span className="font-medium">Pro tip:</span> Book 60+ days for a 15% discount
                          </p>
                        </div>
                        
                        <button
                          onClick={() => setShowROICalculator(true)}
                          className="w-full mt-3 text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Calculate ROI for this space →
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Footer Actions - Sticky */}
            <div className="border-t border-slate-200 bg-slate-50 p-6">
              {/* Price Display */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-slate-500">Total Price</p>
                  <p className="text-2xl font-bold" style={{ color: '#4668AB' }}>
                    ${grandTotal.toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-500">{duration} days campaign</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-green-600 font-medium">✓ Available Now</p>
                  <p className="text-xs text-slate-500 mt-1">Instant Booking</p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                {isInCart && isInCart(selectedSpace.id) ? (
                  <Button
                    variant="outline"
                    disabled
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    In Cart
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center gap-2 hover:bg-slate-50"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={handleMessageOwner}
                  className="flex-1 flex items-center justify-center gap-2"
                  style={{ 
                    borderColor: '#4668AB',
                    color: '#4668AB'
                  }}
                >
                  <MessageSquare className="w-4 h-4" />
                  Message Owner
                </Button>
                
                <Button
                  onClick={handleBookNow}
                  className="flex-1 flex items-center justify-center gap-2"
                  style={{ 
                    backgroundColor: '#4668AB',
                    color: 'white'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#39558C'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#4668AB'}
                >
                  Book Now
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Message Composition Modal */}
        {showMessageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-60 flex items-center justify-center p-4"
            style={{ top: NAVBAR_HEIGHT }} // Account for navbar height
            onClick={() => setShowMessageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-6 h-6" style={{ color: '#4668AB' }} />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Message {owner?.name}
                  </h3>
                  <p className="text-sm text-slate-600">
                    About: {getAreaName(selectedSpace)}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Your Message
                </label>
                <textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder={`Hi ${owner?.name}, I'm interested in your advertising space "${getAreaName(selectedSpace)}". Could you provide more information about availability and pricing?`}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-slate-500 mt-1">
                  {messageContent.length}/500 characters
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowMessageModal(false)}
                  disabled={isMessageLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageContent.trim() || isMessageLoading}
                  className="flex items-center gap-2"
                  style={{ 
                    backgroundColor: '#4668AB',
                    borderColor: '#4668AB',
                    color: 'white'
                  }}
                >
                  {isMessageLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}