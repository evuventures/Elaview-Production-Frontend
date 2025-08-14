// src/pages/browse/components/SpaceDetailsModal.jsx
// ✅ FIXED: JSX structure error resolved
// ✅ FIXED: Proper handling of dimensions object to prevent React render error
// ✅ NEW: Added "Message Owner" functionality with conversation creation

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Button } from "@/components/ui/button";
import { 
  X, ShoppingCart, Plus, CheckCircle, Star, MapPin, Users, TrendingUp, Eye,
  Calendar as CalendarIcon, Heart, Calculator, ChevronRight, Package, Clock, DollarSign,
  Building2, Info, AlertCircle, MessageSquare, Send
} from "lucide-react";
import { getAreaName, getNumericPrice } from '../utils/areaHelpers';
import apiClient from '@/api/apiClient';
import { Calendar } from '@/components/ui/calendar';

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
  const [activeTab, setActiveTab] = useState('overview');
  const [isSaved, setIsSaved] = useState(false);
  const [duration, setDuration] = useState(30);
  const [showPricingDetails, setShowPricingDetails] = useState(false);
  
  // ✅ NEW: Message Owner state
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageContent, setMessageContent] = useState('');

  // Helper function to format dimensions object
  const formatDimensions = (dimensions) => {
    console.log('🔍 Dimensions data:', dimensions, typeof dimensions);
    
    if (!dimensions) {
      return 'Standard Size';
    }
    
    // If it's already a string, return as-is
    if (typeof dimensions === 'string') {
      return dimensions;
    }
    
    // If it's an object, format it properly
    if (typeof dimensions === 'object') {
      const { width, height, area, unit } = dimensions;
      
      if (width && height && unit) {
        return `${width} x ${height} ${unit}`;
      } else if (area && unit) {
        return `${area} ${unit}`;
      } else if (area) {
        return `${area} sq ft`;
      } else {
        // Fallback - convert object to readable string
        return Object.entries(dimensions)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
      }
    }
    
    return 'Standard Size';
  };

  // Reset state when modal opens
  useEffect(() => {
    if (detailsExpanded && selectedSpace) {
      setActiveTab('overview');
      setDuration(30);
      setShowPricingDetails(false);
      setShowMessageModal(false);
      setMessageContent('');
      
      // Debug log the selectedSpace to help identify data structure
      console.log('🏢 Selected Space Data:', {
        id: selectedSpace.id,
        dimensions: selectedSpace.dimensions,
        dimensionsType: typeof selectedSpace.dimensions,
        property: selectedSpace.property,
        ownerId: selectedSpace.property?.ownerId || selectedSpace.ownerId,
        fullSpace: selectedSpace
      });
    }
  }, [detailsExpanded, selectedSpace]);

  // ✅ NEW: Get property owner information
  const getPropertyOwner = () => {
    if (!selectedSpace) return null;
    
    // The owner ID should be the database ID, not Clerk ID
    const ownerId = selectedSpace.property?.ownerId || 
                   selectedSpace.ownerId || 
                   selectedSpace.property?.users?.id;
                   
    return {
      id: ownerId,
      name: selectedSpace.property?.users?.firstName ? 
            `${selectedSpace.property.users.firstName} ${selectedSpace.property.users.lastName}`.trim() :
            selectedSpace.property?.users?.full_name ||
            'Property Owner'
    };
  };

  // ✅ SIMPLIFIED: Handle message owner functionality
  const handleMessageOwner = async () => {
    console.log('💬 Message Owner clicked for space:', selectedSpace.id);
    
    if (!currentUser?.id) {
      alert('Please sign in to message the property owner');
      return;
    }

    const owner = getPropertyOwner();
    
    if (!owner?.id) {
      alert('Unable to identify the property owner for this space');
      return;
    }

    // Show message modal for composing message
    setShowMessageModal(true);
  };

  // ✅ SIMPLIFIED: Send message and create conversation
  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      alert('Please enter a message');
      return;
    }

    setIsMessageLoading(true);

    try {
      const owner = getPropertyOwner();
      
      console.log('💬 Creating conversation between users:');
      console.log('👤 Current user (Clerk ID):', currentUser.id);
      console.log('👤 Property owner (DB ID):', owner.id);
      console.log('💬 Message content:', messageContent);

      // ✅ SIMPLIFIED: Let the backend middleware handle user ID mapping
      // Just pass the Clerk ID - the backend will map it to database ID
      const conversationResponse = await apiClient.post('/conversations/create', {
        participantIds: [currentUser.id, owner.id], // Backend will handle ID mapping
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
        console.log('✅ Conversation created successfully:', conversationResponse.data);
        
        // Close modals
        setShowMessageModal(false);
        setDetailsExpanded(false);
        setSelectedSpace(null);
        
        // Navigate to messages page with the conversation
        navigate('/messages', { 
          state: { 
            conversationId: conversationResponse.data.id,
            openConversation: true
          } 
        });
        
        // Success feedback
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

  // Handle booking - Navigate to checkout with single item
  const handleBookNow = () => {
    if (!selectedSpace) return;
    
    console.log('📅 Book Now clicked from SpaceDetailsModal:', selectedSpace.id);
    
    // Create cart item for immediate checkout
    const cartItem = {
      id: `${selectedSpace.id}_${Date.now()}`,
      spaceId: selectedSpace.id,
      space: selectedSpace,
      duration: duration,
      pricePerDay: getNumericPrice(selectedSpace),
      totalPrice: getNumericPrice(selectedSpace) * duration,
      addedAt: new Date()
    };
    
    // Navigate to checkout with single item cart
    navigate('/checkout', { 
      state: { 
        cart: [cartItem],
        fromSpaceDetails: true
      } 
    });
    
    // Close the modal
    setDetailsExpanded(false);
    setSelectedSpace(null);
  };

  // Handle add to cart and checkout
  const handleAddToCartAndCheckout = () => {
    if (!selectedSpace) return;
    
    console.log('🛒 Add to Cart & Checkout clicked from SpaceDetailsModal:', selectedSpace.id);
    
    // Add to cart first
    addToCart(selectedSpace, duration);
    
    // Create cart item for checkout
    const cartItem = {
      id: `${selectedSpace.id}_${Date.now()}`,
      spaceId: selectedSpace.id,
      space: selectedSpace,
      duration: duration,
      pricePerDay: getNumericPrice(selectedSpace),
      totalPrice: getNumericPrice(selectedSpace) * duration,
      addedAt: new Date()
    };
    
    // Navigate to checkout
    navigate('/checkout', { 
      state: { 
        cart: [cartItem],
        fromSpaceDetails: true,
        addedToCart: true
      } 
    });
    
    // Close the modal
    setDetailsExpanded(false);
    setSelectedSpace(null);
  };

  // Handle add to cart only
  const handleAddToCart = () => {
    if (!selectedSpace) return;
    
    console.log('🛒 Add to Cart clicked from SpaceDetailsModal:', selectedSpace.id);
    addToCart(selectedSpace, duration);
  };

  // Availability calendar (minimal integration, derived from bookings)
  const [month, setMonth] = useState(new Date());
  const [bookedRanges, setBookedRanges] = useState([]);
  const [loadingCal, setLoadingCal] = useState(false);
  const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || '/api';

  useEffect(() => {
    if (!detailsExpanded || !selectedSpace?.id) return;
    const y = month.getFullYear();
    const m = `${month.getMonth() + 1}`.padStart(2, '0');
    const controller = new AbortController();
    const load = async () => {
      try {
        setLoadingCal(true);
        const res = await fetch(`${API_BASE_URL}/spaces/${selectedSpace.id}/booked-dates?month=${y}-${m}`, { signal: controller.signal });
        if (!res.ok) throw new Error('Failed to load availability');
        const json = await res.json();
        const ranges = (json?.data?.bookedRanges || []).map(r => ({ from: new Date(r.start), to: new Date(r.end) }));
        setBookedRanges(ranges);
      } catch (e) {
        if (e.name !== 'AbortError') console.warn('Calendar load error:', e);
      } finally {
        setLoadingCal(false);
      }
    };
    load();
    return () => controller.abort();
  }, [detailsExpanded, selectedSpace?.id, month]);

  if (!detailsExpanded || !selectedSpace) return null;

  const dailyPrice = getNumericPrice(selectedSpace);
  const totalPrice = dailyPrice * duration;
  const platformFee = totalPrice * 0.1;
  const grandTotal = totalPrice + platformFee;
  const owner = getPropertyOwner();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => {
          setDetailsExpanded(false);
          setSelectedSpace(null);
        }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
            {selectedSpace.images && (
              <img 
                src={selectedSpace.images} 
                alt={getAreaName(selectedSpace)}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent pointer-events-none" />
            
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              {/* Favorite button removed */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDetailsExpanded(false);
                  setSelectedSpace(null);
                }}
                className="bg-white/90 backdrop-blur-sm hover:bg-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="absolute bottom-4 left-6 right-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {getAreaName(selectedSpace)}
              </h2>
              <div className="flex items-center gap-4 text-white/90 text-sm">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {selectedSpace.propertyAddress || 'Location'}
                </span>
                <span className="flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {selectedSpace.propertyName || 'Property'}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            {['overview'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 px-4 text-sm font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'text-white border-b-2'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                style={activeTab === tab ? {
                  color: '#4668AB',
                  borderBottomColor: '#4668AB'
                } : {}}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: Space image */}
      <div className="rounded-lg overflow-hidden bg-slate-100 border border-slate-200 min-h-[240px] flex items-center justify-center">
                    {selectedSpace?.images ? (
                      <img
                        src={selectedSpace.images}
                        alt={getAreaName(selectedSpace)}
        className="w-full h-full max-h-[60vh] object-contain bg-slate-900"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="text-slate-500 text-sm p-6">No image available</div>
                    )}
                  </div>

                  {/* Right: Details + Availability */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-3">Space Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-xs text-slate-500 mb-1">Space Type</p>
                          <p className="font-medium text-slate-900">
                            {selectedSpace.space_type || 'Advertisement Space'}
                          </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-xs text-slate-500 mb-1">Dimensions</p>
                          <p className="font-medium text-slate-900">
                            {formatDimensions(selectedSpace.dimensions)}
                          </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-xs text-slate-500 mb-1">Min. Duration</p>
                          <p className="font-medium text-slate-900">7 days</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-3">Description</h3>
                      <p className="text-slate-600 leading-relaxed">
                        {selectedSpace.description || 'Prime advertising space in a high-traffic area. Perfect for brand visibility and customer engagement.'}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" /> Availability
                        </h3>
                        {loadingCal && (
                          <span className="text-xs text-slate-500">Loading…</span>
                        )}
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                        <Calendar
                          mode="range"
                          month={month}
                          onMonthChange={setMonth}
                          numberOfMonths={1}
                          disabled={bookedRanges}
                          showOutsideDays
                        />
                        <p className="mt-2 text-xs text-slate-500">Booked dates are disabled. You’ll select dates during checkout.</p>
                      </div>
                    </div>

                    {/* Owner info (kept) */}
                    {owner && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Building2 className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-900 mb-1">Property Owner</h4>
                            <p className="text-sm text-slate-600 mb-2">Managed by {owner.name}</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleMessageOwner}
                              className="text-blue-600 border-blue-300 hover:bg-blue-50 flex items-center gap-2"
                            >
                              <MessageSquare className="w-4 h-4" />
                              Message Owner
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {false && activeTab === 'analytics' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Performance Metrics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-50 rounded-lg p-4 text-center">
                      <Users className="w-8 h-8 mx-auto mb-2" style={{ color: '#4668AB' }} />
                      <p className="text-2xl font-bold text-slate-900">
                        {selectedSpace.daily_impressions?.toLocaleString() || '5,000'}
                      </p>
                      <p className="text-xs text-slate-500">Daily Impressions</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4 text-center">
                      <Eye className="w-8 h-8 mx-auto mb-2" style={{ color: '#4668AB' }} />
                      <p className="text-2xl font-bold text-slate-900">
                        {selectedSpace.weekly_impressions?.toLocaleString() || '35,000'}
                      </p>
                      <p className="text-xs text-slate-500">Weekly Views</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4 text-center">
                      <TrendingUp className="w-8 h-8 mx-auto mb-2" style={{ color: '#4668AB' }} />
                      <p className="text-2xl font-bold text-slate-900">92%</p>
                      <p className="text-xs text-slate-500">Engagement Rate</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Audience Demographics</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Age 25-34</span>
                        <span className="font-medium">35%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="h-2 rounded-full" style={{ width: '35%', backgroundColor: '#4668AB' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Age 35-44</span>
                        <span className="font-medium">28%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="h-2 rounded-full" style={{ width: '28%', backgroundColor: '#4668AB' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Age 18-24</span>
                        <span className="font-medium">22%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="h-2 rounded-full" style={{ width: '22%', backgroundColor: '#4668AB' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Calculator className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-slate-900 mb-1">Calculate Your ROI</h4>
                      <p className="text-sm text-slate-600 mb-2">
                        Estimate your return on investment based on your campaign goals.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowROICalculator(true)}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        Open ROI Calculator
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {false && activeTab === 'pricing' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Pricing Calculator</h3>
                  
                  <div className="bg-slate-50 rounded-lg p-4 mb-4">
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Campaign Duration
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="7"
                        max="90"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="flex-1"
                        style={{ accentColor: '#4668AB' }}
                      />
                      <div className="bg-white rounded-lg px-3 py-2 border border-slate-200 min-w-[80px] text-center">
                        <span className="font-semibold">{duration}</span> days
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-600">Daily Rate</span>
                      <span className="font-medium text-slate-900">
                        ${dailyPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-600">Duration</span>
                      <span className="font-medium text-slate-900">
                        {duration} days
                      </span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Subtotal</span>
                        <span className="font-medium text-slate-900">
                          ${totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-600">Platform Fee (10%)</span>
                      <span className="font-medium text-slate-900">
                        ${platformFee.toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-slate-900">Total</span>
                        <span className="text-xl font-bold" style={{ color: '#4668AB' }}>
                          ${grandTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-slate-900 mb-1">Volume Discounts Available</h4>
                      <p className="text-sm text-slate-600">
                        Book multiple spaces or longer durations to unlock special pricing.
                        Contact our sales team for custom quotes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-slate-200 bg-slate-50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total for {duration} days</p>
                <p className="text-2xl font-bold" style={{ color: '#4668AB' }}>
                  ${grandTotal.toFixed(2)}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {isInCart && isInCart(selectedSpace.id) ? (
                  <Button
                    variant="outline"
                    disabled
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    In Cart
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleAddToCart}
                    className="flex items-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </Button>
                )}
                
                <Button
                  onClick={handleBookNow}
                  className="flex items-center gap-2 px-6"
                  style={{ 
                    backgroundColor: '#4668AB',
                    borderColor: '#4668AB'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#39558C'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#4668AB'}
                >
                  <CalendarIcon className="w-4 h-4" />
                  Book Now
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ✅ NEW: Message Composition Modal */}
        {showMessageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-60 flex items-center justify-center p-4"
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
                    borderColor: '#4668AB'
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