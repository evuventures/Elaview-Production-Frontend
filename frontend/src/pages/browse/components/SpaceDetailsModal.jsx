// src/pages/browse/components/SpaceDetailsModal.jsx
// ✅ COMPACT CALENDAR: Smaller, more space-efficient design
// ✅ REDUCED: Padding, spacing, and calendar cell sizes
// ✅ OPTIMIZED: For better space utilization
// ✅ MOVED: Visibility score to top right of main image
// ✅ REMOVED: Redundant selected dates display from calendar section

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Button } from "@/components/ui/button";
import { 
  X, ShoppingCart, CheckCircle, Star, MapPin, Users, TrendingUp, Eye,
  Calendar, Heart, ChevronRight, ChevronLeft, Clock, DollarSign,
  Building2, Info, AlertCircle, MessageSquare, Send, 
  Maximize2, Timer, Shield, HelpCircle
} from "lucide-react";
import { getAreaName, getNumericPrice } from '../utils/areaHelpers';
import apiClient from '@/api/apiClient';

// Navbar height constant - matches the h-14 Tailwind class used in your navigation
const NAVBAR_HEIGHT = '56px';

export default function SpaceDetailsModal({ 
  selectedSpace, 
  detailsExpanded, 
  setSelectedSpace, 
  setDetailsExpanded,
  isInCart,
  addToCart,
  handleBookingNavigation
}) {
  const navigate = useNavigate();
  const { user: currentUser } = useUser();
  
  // State Management
  const [selectedDates, setSelectedDates] = useState({
    start: null,
    end: null
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showVisibilityInfo, setShowVisibilityInfo] = useState(false);
  
  // Message Owner state
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageContent, setMessageContent] = useState('');

  // Mock booked dates (replace with real data)
  const bookedDates = [
    '2025-08-25',
    '2025-08-26',
    '2025-08-27',
    '2025-09-15',
    '2025-09-16'
  ];

  // Mock multiple images
  const spaceImages = [
    selectedSpace?.images,
    selectedSpace?.images,
    selectedSpace?.images
  ].filter(Boolean);

  // Reset state when modal opens
  useEffect(() => {
    if (detailsExpanded && selectedSpace) {
      setCurrentImageIndex(0);
      setShowMessageModal(false);
      setMessageContent('');
      setSelectedDates({ start: null, end: null });
      setCurrentMonth(new Date());
    }
  }, [detailsExpanded, selectedSpace]);

  // Get visibility score
  const getVisibilityScore = () => {
    const impressions = selectedSpace?.daily_impressions || 5000;
    if (impressions > 10000) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (impressions > 7500) return { label: 'Great', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (impressions > 5000) return { label: 'Good', color: 'text-amber-600', bg: 'bg-amber-100' };
    return { label: 'OK', color: 'text-gray-600', bg: 'bg-gray-100' };
  };

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
      responseTime: '2 hours'
    };
  };

  // Calendar helpers
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const formatDateForComparison = (date) => {
    if (!date) return null;
    return date.toISOString().split('T')[0];
  };

  const isDateBooked = (date) => {
    if (!date) return false;
    return bookedDates.includes(formatDateForComparison(date));
  };

  const isDateSelected = (date) => {
    if (!date || (!selectedDates.start && !selectedDates.end)) return false;
    const dateStr = formatDateForComparison(date);
    const startStr = selectedDates.start ? formatDateForComparison(selectedDates.start) : null;
    const endStr = selectedDates.end ? formatDateForComparison(selectedDates.end) : null;
    
    if (startStr && endStr) {
      return dateStr >= startStr && dateStr <= endStr;
    }
    return dateStr === startStr;
  };

  const handleDateClick = (date) => {
    if (!date || isDateBooked(date) || date < new Date()) return;
    
    if (!selectedDates.start || (selectedDates.start && selectedDates.end)) {
      // Start new selection
      setSelectedDates({ start: date, end: null });
    } else if (selectedDates.start && !selectedDates.end) {
      // Complete the range
      if (date < selectedDates.start) {
        setSelectedDates({ start: date, end: selectedDates.start });
      } else {
        setSelectedDates({ start: selectedDates.start, end: date });
      }
    }
  };

  const getDuration = () => {
    if (!selectedDates.start || !selectedDates.end) return 0;
    const timeDiff = selectedDates.end.getTime() - selectedDates.start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end days
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

  // Navigate to CampaignSelection
  const handleBookNow = () => {
    if (!selectedSpace || !selectedDates.start || !selectedDates.end) {
      alert('Please select campaign dates first');
      return;
    }
    
    const duration = getDuration();
    const dailyPrice = getNumericPrice(selectedSpace);
    
    console.log('📅 Book Now clicked - navigating to Campaign Selection:', selectedSpace.id);
    
    // Store space data in session for the campaign flow
    sessionStorage.setItem('selectedSpace', JSON.stringify({
      id: selectedSpace.id,
      name: getAreaName(selectedSpace),
      price: dailyPrice,
      duration: duration,
      dates: {
        start: selectedDates.start.toISOString().split('T')[0],
        end: selectedDates.end.toISOString().split('T')[0]
      },
      totalPrice: dailyPrice * duration,
      propertyId: selectedSpace.property?.id || selectedSpace.propertyId
    }));
    
    // Navigate to campaign selection
    navigate('/CampaignSelection');
    
    // Close the modal
    setDetailsExpanded(false);
    setSelectedSpace(null);
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!selectedSpace || !selectedDates.start || !selectedDates.end) {
      alert('Please select campaign dates first');
      return;
    }
    
    console.log('🛒 Add to Cart clicked from SpaceDetailsModal:', selectedSpace.id);
    addToCart(selectedSpace, getDuration());
  };

  if (!detailsExpanded || !selectedSpace) return null;

  const dailyPrice = getNumericPrice(selectedSpace);
  const duration = getDuration();
  const totalPrice = dailyPrice * duration;
  const platformFee = totalPrice * 0.1;
  const grandTotal = totalPrice + platformFee;
  const owner = getPropertyOwner();
  const visibilityScore = getVisibilityScore();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        style={{ top: NAVBAR_HEIGHT }}
        onClick={() => {
          setDetailsExpanded(false);
          setSelectedSpace(null);
        }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="w-full max-w-7xl bg-white rounded-xl shadow-2xl overflow-hidden flex"
          style={{ maxHeight: `calc(100vh - ${NAVBAR_HEIGHT} - 6rem)` }}
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
                  
                  {/* Visibility Score - Top Right Corner */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <div className={`px-3 py-2 rounded-lg backdrop-blur-sm bg-white/90 flex items-center gap-2 shadow-lg`}>
                      <Eye className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-700">Visibility:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${visibilityScore.bg} ${visibilityScore.color}`}>
                        {visibilityScore.label}
                      </span>
                      <button
                        onClick={() => setShowVisibilityInfo(true)}
                        className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                      >
                        <HelpCircle className="w-3 h-3 text-slate-400 hover:text-slate-600" />
                      </button>
                    </div>
                  </div>
                  
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
            <div className="px-6 pt-6 border-b border-slate-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    {getAreaName(selectedSpace)}
                  </h2>
                  <div className="flex items-center gap-1 text-sm text-slate-600 mb-3">
                    <MapPin className="w-4 h-4" />
                    {selectedSpace.propertyAddress || 'High Traffic Location'}
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
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Features and Calendar Section */}
              <div className="mb-6">
                

                {/* Features and Calendar Container */}
                <div className="flex gap-4">
                  {/* Features Section - Left 50% */}
                  <div className="w-1/2">
                    <h4 className="text-sm font-medium text-slate-900 mb-3">Features</h4>
                    <div className="space-y-3">
                      {/* Ad Size */}
                      <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <Maximize2 className="w-3 h-3 text-slate-500" />
                          <span className="text-xs text-slate-600">Ad Size</span>
                        </div>
                        <span className="text-xs font-medium text-slate-900">
                          {selectedSpace?.dimensions ? 
                            (typeof selectedSpace.dimensions === 'object' ? 
                              `${selectedSpace.dimensions.width || 24}" × ${selectedSpace.dimensions.height || 36}"` : 
                              selectedSpace.dimensions
                            ) : 
                            '24" × 36"'
                          }
                        </span>
                      </div>

                      {/* Material Type */}
                      <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <Shield className="w-3 h-3 text-slate-500" />
                          <span className="text-xs text-slate-600">Material</span>
                        </div>
                        <span className="text-xs font-medium text-slate-900">
                          {selectedSpace?.material || 'Vinyl Banner'}
                        </span>
                      </div>

                      {/* Daily Price */}
                      <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-3 h-3 text-slate-500" />
                          <span className="text-xs text-slate-600">Daily Rate</span>
                        </div>
                        <span className="text-xs font-medium text-slate-900">
                          ${dailyPrice}/day
                        </span>
                      </div>

                      {/* Price Breakdown */}
                      {duration > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-200">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-600">Campaign ({duration} days)</span>
                              <span className="text-xs text-slate-900">${totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-600">
                                {selectedDates.start && selectedDates.end && 
                                  `${selectedDates.start.toLocaleDateString()} - ${selectedDates.end.toLocaleDateString()}`
                                }
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-600">Platform Fee (10%)</span>
                              <span className="text-xs text-slate-900">${platformFee.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between font-medium pt-1 border-t border-slate-100">
                              <span className="text-xs text-slate-900">Total</span>
                              <span className="text-xs text-slate-900">${grandTotal.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Calendar Section - Right 50% */}
                  <div className="w-1/2">
                    <h4 className="text-sm font-medium text-slate-900 mb-3">Select Dates</h4>
                    
                    {/* Compact Mini Calendar */}
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      {/* Calendar Header - Compact */}
                      <div className="bg-slate-50 px-3 py-2 flex items-center justify-between">
                        <button
                          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                          className="p-1 hover:bg-slate-200 rounded"
                        >
                          <ChevronLeft className="w-3 h-3" />
                        </button>
                        <h4 className="text-sm font-medium text-slate-900">
                          {currentMonth.toLocaleString('default', { month: 'short', year: 'numeric' })}
                        </h4>
                        <button
                          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                          className="p-1 hover:bg-slate-200 rounded"
                        >
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Days of Week - Compact */}
                      <div className="grid grid-cols-7 border-b border-slate-200">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                          <div key={day} className="p-1 text-center text-xs font-medium text-slate-500 bg-slate-50">
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Calendar Days - Compact */}
                      <div className="grid grid-cols-7">
                        {getDaysInMonth(currentMonth).map((date, index) => {
                          if (!date) {
                            return <div key={index} className="p-1 h-6" />;
                          }

                          const isBooked = isDateBooked(date);
                          const isSelected = isDateSelected(date);
                          const isPast = date < new Date().setHours(0, 0, 0, 0);
                          const isDisabled = isBooked || isPast;

                          return (
                            <button
                              key={date.toISOString()}
                              onClick={() => handleDateClick(date)}
                              disabled={isDisabled}
                              className={`
                                p-1 h-6 text-xs border-r border-b border-slate-100 transition-colors flex items-center justify-center
                                ${isSelected 
                                  ? 'bg-blue-500 text-white font-medium' 
                                  : isDisabled
                                  ? 'text-slate-300 cursor-not-allowed bg-slate-50'
                                  : 'hover:bg-slate-50 text-slate-700'
                                }
                                ${isBooked ? 'bg-red-50 text-red-400' : ''}
                              `}
                            >
                              {date.getDate()}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Legend - Compact */}
                    <div className="flex gap-3 mt-2 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-sm"></div>
                        <span className="text-slate-600">Selected</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-100 border border-red-200 rounded-sm"></div>
                        <span className="text-slate-600">Booked</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-slate-100 border border-slate-200 rounded-sm"></div>
                        <span className="text-slate-600">Past</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              
            </div>

            {/* Footer Actions - Sticky */}
            <div className="border-t border-slate-200 bg-slate-50 p-6">
              {/* Price Display */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-slate-500">Total Price</p>
                  <p className="text-2xl font-bold" style={{ color: '#4668AB' }}>
                    {duration > 0 ? `$${grandTotal.toFixed(2)}` : '$0.00'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {duration > 0 ? `${duration} days campaign` : 'Select dates to see price'}
                  </p>
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
                    disabled={!selectedDates.start || !selectedDates.end}
                    className="flex-1 flex items-center justify-center gap-2 hover:bg-slate-50 disabled:opacity-50"
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
                  disabled={!selectedDates.start || !selectedDates.end}
                  className="flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
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

        {/* Visibility Info Modal */}
        {showVisibilityInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-60 flex items-center justify-center p-4"
            onClick={() => setShowVisibilityInfo(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-6 h-6" style={{ color: '#4668AB' }} />
                <h3 className="text-lg font-semibold text-slate-900">
                  How We Measure Visibility Scores
                </h3>
              </div>

              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-600">Excellent</span>
                  <span>10,000+ daily impressions</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-600">Great</span>
                  <span>7,500+ daily impressions</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-600">Good</span>
                  <span>5,000+ daily impressions</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">OK</span>
                  <span>Under 5,000 daily impressions</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 mt-4 p-3 bg-slate-50 rounded-lg">
                Visibility scores are based on foot traffic data, location prominence, and historical performance metrics.
              </p>

              <div className="flex justify-end mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowVisibilityInfo(false)}
                >
                  Got it
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Message Composition Modal */}
        {showMessageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-60 flex items-center justify-center p-4"
            style={{ top: NAVBAR_HEIGHT }}
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