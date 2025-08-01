import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { 
  X, ShoppingCart, Plus, Minus, Calendar, MapPin, Package, 
  AlertCircle, CheckCircle, Clock, Eye, Calculator, ChevronRight,
  CalendarDays, Info
} from "lucide-react";
import { DayPicker } from 'react-day-picker';
import { getAreaName } from '../utils/areaHelpers';

// API client for availability checking
import apiClient from '../../../api/apiClient';

// Date utilities (using native JS to avoid import issues)
const formatDate = (date) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric' 
  }).format(date);
};

const getDaysDifference = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const diffTime = Math.abs(endDate - startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

const getStartOfDay = (date = new Date()) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

export default function EnhancedCartModal({ 
  showCart, 
  setShowCart, 
  cartItems, 
  updateCartItemQuantity, 
  removeFromCart,
  clearCart 
}) {
  // Date selection state for each cart item
  const [itemDates, setItemDates] = useState({});
  const [itemAvailability, setItemAvailability] = useState({});
  const [totalPricing, setTotalPricing] = useState({ subtotal: 0, total: 0 });
  const [incompleteItems, setIncompleteItems] = useState([]);
  const [showIncompleteWarning, setShowIncompleteWarning] = useState(false);

  // Initialize date state for cart items
  useEffect(() => {
    if (!cartItems || !Array.isArray(cartItems)) return;
    
    const newItemDates = {};
    cartItems.forEach(item => {
      if (!itemDates[item.id]) {
        newItemDates[item.id] = {
          startDate: null,
          endDate: null,
          isSelectingRange: false,
          availableDates: [],
          blockedDates: [],
          isLoading: false
        };
      }
    });
    
    if (Object.keys(newItemDates).length > 0) {
      setItemDates(prev => ({ ...prev, ...newItemDates }));
    }
  }, [cartItems]);

  // Calculate total pricing based on dates and materials
  useEffect(() => {
    if (!cartItems || !Array.isArray(cartItems)) {
      setTotalPricing({ subtotal: 0, total: 0 });
      return;
    }
    
    let subtotal = 0;
    
    cartItems.forEach(item => {
      const dates = itemDates[item.id];
      if (dates?.startDate && dates?.endDate) {
        const days = getDaysDifference(dates.startDate, dates.endDate);
        const basePrice = parseFloat(item.baseRate) || 0;
        const materialCost = item.materialConfiguration?.estimatedCost || basePrice;
        subtotal += materialCost * days;
      }
    });
    
    setTotalPricing({
      subtotal,
      total: subtotal * 1.1 // Including 10% platform fee
    });
  }, [cartItems, itemDates]);

  // Check for incomplete date selections
  useEffect(() => {
    if (!cartItems || !Array.isArray(cartItems)) {
      setIncompleteItems([]);
      return;
    }
    
    const incomplete = cartItems.filter(item => {
      const dates = itemDates[item.id];
      return !dates?.startDate || !dates?.endDate;
    });
    setIncompleteItems(incomplete);
  }, [cartItems, itemDates]);

  // Load availability for a specific space
  const loadAvailability = async (spaceId, month = new Date()) => {
    try {
      setItemDates(prev => ({
        ...prev,
        [spaceId]: { ...prev[spaceId], isLoading: true }
      }));

      const monthYear = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
      const response = await apiClient.getSpaceBookedDates(spaceId, monthYear);
      
      if (response.success) {
        const blockedDates = response.data.bookedDates.map(date => new Date(date));
        setItemAvailability(prev => ({
          ...prev,
          [spaceId]: { blockedDates, lastUpdated: new Date() }
        }));
      }
    } catch (error) {
      console.error('Error loading availability:', error);
    } finally {
      setItemDates(prev => ({
        ...prev,
        [spaceId]: { ...prev[spaceId], isLoading: false }
      }));
    }
  };

  // Clear dates for specific item
  const clearDatesForItem = (itemId) => {
    setItemDates(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        startDate: null,
        endDate: null,
        isSelectingRange: false
      }
    }));
  };

  // Calculate days and pricing for an item
  const getItemPricing = (item) => {
    const dates = itemDates[item.id];
    if (!dates?.startDate || !dates?.endDate) {
      return { days: 0, dailyRate: 0, total: 0 };
    }
    
    const days = getDaysDifference(dates.startDate, dates.endDate);
    const dailyRate = item.materialConfiguration?.estimatedCost || parseFloat(item.baseRate) || 0;
    const total = dailyRate * days;
    
    return { days, dailyRate, total };
  };

  // Proceed to checkout
  const handleProceedToCheckout = () => {
    if (!cartItems || cartItems.length === 0) {
      alert('Your cart is empty. Please add some spaces before proceeding.');
      return;
    }
    
    if (incompleteItems.length > 0) {
      setShowIncompleteWarning(true);
      return;
    }
    
    // Navigate to checkout with configured cart items
    const checkoutData = cartItems.map(item => ({
      ...item,
      dates: itemDates[item.id],
      pricing: getItemPricing(item)
    }));
    
    console.log('Proceeding to checkout with:', checkoutData);
    
    // For now, just show success - in next step we'll implement actual checkout
    alert(`Ready for checkout! ${checkoutData.length} spaces configured with dates and materials. Total: ${totalPricing.total.toFixed(2)}`);
  };

  // Continue with incomplete items
  const handleContinueWithIncomplete = () => {
    if (!cartItems || cartItems.length === 0) {
      alert('Your cart is empty.');
      return;
    }
    
    const completeItems = cartItems.filter(item => {
      const dates = itemDates[item.id];
      return dates?.startDate && dates?.endDate;
    });
    
    if (completeItems.length === 0) {
      alert('Please select dates for at least one space before proceeding.');
      return;
    }
    
    const checkoutData = completeItems.map(item => ({
      ...item,
      dates: itemDates[item.id],
      pricing: getItemPricing(item)
    }));
    
    console.log('Proceeding with complete items only:', checkoutData);
    setShowIncompleteWarning(false);
    
    // For now, just show success - in next step we'll implement actual checkout
    alert(`Proceeding with ${checkoutData.length} complete bookings. Total: ${checkoutData.reduce((sum, item) => sum + getItemPricing(item).total, 0).toFixed(2)}`);
  };

  if (!showCart) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => setShowCart(false)}
      >
        {/* Enhanced Cart Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="
            w-full 
            max-w-[min(95vw,1400px)]
            max-h-[90vh]
            bg-white 
            rounded-xl 
            shadow-2xl 
            border 
            border-slate-200 
            flex 
            flex-col
            overflow-hidden
          "
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-6 h-6 text-teal-600" />
              <h2 className="text-xl font-bold text-slate-900">
                Your Cart ({(cartItems?.length || 0)} {(cartItems?.length || 0) === 1 ? 'space' : 'spaces'})
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCart(false)}
              className="text-slate-500 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto">
            {!cartItems || cartItems.length === 0 ? (
              // Empty Cart State
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <ShoppingCart className="w-16 h-16 text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">Your cart is empty</h3>
                <p className="text-slate-500">Add some advertising spaces to get started!</p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {/* Multi-Space Items with Compact Horizontal Layout */}
                {(cartItems || []).map((item, index) => {
                  const dates = itemDates[item.id] || {};
                  const pricing = getItemPricing(item);
                  const availability = itemAvailability[item.id] || {};
                  const isDateComplete = dates.startDate && dates.endDate;
                  
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-slate-200 rounded-lg overflow-hidden bg-white"
                    >
                      {/* Compact Space Info Row */}
                      <div className="p-4">
                        <div className="flex items-center gap-4">
                          {/* Space Image Thumbnail */}
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                            <img 
                              src={item.images || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200'} 
                              alt={getAreaName(item)}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200';
                              }}
                            />
                          </div>

                          {/* Space Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 truncate">
                              {getAreaName(item)}
                            </h3>
                            <p className="text-sm text-slate-600 flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              {item.propertyAddress}
                            </p>
                            
                            {/* Material Configuration Display */}
                            {item.materialConfiguration && (
                              <div className="flex items-center gap-2 mt-1">
                                <Package className="w-3 h-3 text-teal-600" />
                                <span className="text-xs text-teal-600 font-medium">
                                  {item.materialConfiguration.material.name} • 
                                  {item.materialConfiguration.dimensions.width}×{item.materialConfiguration.dimensions.height} ft
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Date Selection Status */}
                          <div className="text-center min-w-[120px]">
                            {isDateComplete ? (
                              <div className="text-sm">
                                <div className="text-success-600 font-medium">
                                  {formatDate(dates.startDate)} - {formatDate(dates.endDate)}
                                </div>
                                <div className="text-slate-500">
                                  {pricing.days} {pricing.days === 1 ? 'day' : 'days'}
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm text-amber-600 font-medium">
                                <Clock className="w-4 h-4 mx-auto mb-1" />
                                Select Dates
                              </div>
                            )}
                          </div>

                          {/* Pricing */}
                          <div className="text-right min-w-[100px]">
                            <div className="font-bold text-slate-900">
                              {isDateComplete ? `$${pricing.total.toFixed(2)}` : '$0.00'}
                            </div>
                            <div className="text-xs text-slate-500">
                              ${pricing.dailyRate.toFixed(2)}/day
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Date Picker Row */}
                        <div className="mt-4 pt-4 border-t border-slate-100">
                          <div className="flex items-start gap-4">
                            {/* Date Picker */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-3">
                                <CalendarDays className="w-4 h-4 text-slate-600" />
                                <span className="text-sm font-medium text-slate-700">
                                  Select booking dates
                                </span>
                                {dates.startDate && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => clearDatesForItem(item.id)}
                                    className="text-xs text-slate-500 hover:text-slate-700 p-1 h-auto"
                                  >
                                    Clear dates
                                  </Button>
                                )}
                              </div>
                              
                              <div className="bg-slate-50 rounded-lg p-4">
                                <DayPicker
                                  mode="range"
                                  selected={{
                                    from: dates.startDate,
                                    to: dates.endDate
                                  }}
                                  onSelect={(range) => {
                                    if (range?.from) {
                                      setItemDates(prev => ({
                                        ...prev,
                                        [item.id]: {
                                          ...prev[item.id],
                                          startDate: range.from,
                                          endDate: range.to || null,
                                          isSelectingRange: !range.to
                                        }
                                      }));
                                    }
                                  }}
                                  disabled={[
                                    { before: getStartOfDay() },
                                    ...(availability.blockedDates || [])
                                  ]}
                                  modifiers={{
                                    booked: availability.blockedDates || []
                                  }}
                                  modifiersStyles={{
                                    booked: { 
                                      backgroundColor: '#fee2e2', 
                                      color: '#dc2626',
                                      textDecoration: 'line-through'
                                    }
                                  }}
                                  className="text-sm"
                                  captionLayout="dropdown-buttons"
                                  fromYear={new Date().getFullYear()}
                                  toYear={new Date().getFullYear() + 2}
                                  onMonthChange={(month) => loadAvailability(item.id, month)}
                                />
                              </div>
                              
                              {dates.isSelectingRange && dates.startDate && (
                                <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
                                  <Info className="w-3 h-3" />
                                  Select end date to complete your booking range
                                </div>
                              )}
                            </div>

                            {/* Quick Stats */}
                            {isDateComplete && (
                              <div className="w-48 bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg p-4 border border-teal-200">
                                <h4 className="font-medium text-slate-800 mb-3">Booking Summary</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-slate-600">Duration:</span>
                                    <span className="font-medium">{pricing.days} days</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-600">Daily rate:</span>
                                    <span className="font-medium">${pricing.dailyRate.toFixed(2)}</span>
                                  </div>
                                  <div className="border-t border-teal-200 pt-2">
                                    <div className="flex justify-between">
                                      <span className="font-medium text-slate-800">Subtotal:</span>
                                      <span className="font-bold text-teal-600">${pricing.total.toFixed(2)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer with Pricing and Actions */}
          {cartItems && cartItems.length > 0 && (
            <div className="border-t border-slate-200 bg-slate-50 p-6">
              {/* Incomplete Items Warning */}
              {incompleteItems.length > 0 && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <p className="text-sm text-amber-800">
                      <strong>{incompleteItems.length}</strong> {incompleteItems.length === 1 ? 'space has' : 'spaces have'} incomplete date selections.
                      Complete all dates or proceed with ready items only.
                    </p>
                  </div>
                </div>
              )}

              {/* Total Pricing */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm text-slate-600">
                    {(cartItems || []).filter(item => {
                      const dates = itemDates[item.id];
                      return dates?.startDate && dates?.endDate;
                    }).length} of {cartItems?.length || 0} spaces configured
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    Total: ${totalPricing.total.toFixed(2)}
                  </div>
                  <div className="text-xs text-slate-500">
                    Includes platform fee • ${totalPricing.subtotal.toFixed(2)} subtotal
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={clearCart}
                    className="text-slate-600 hover:text-slate-800"
                  >
                    Clear Cart
                  </Button>
                  
                  <Button
                    onClick={handleProceedToCheckout}
                    disabled={!cartItems || cartItems.length === 0}
                    className="btn-primary px-8 py-3 text-base font-semibold"
                  >
                    Proceed to Checkout
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Incomplete Items Warning Modal */}
        {showIncompleteWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/75 flex items-center justify-center p-4"
            onClick={() => setShowIncompleteWarning(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Incomplete Date Selections
                </h3>
                <p className="text-slate-600 mb-6">
                  You didn't set dates on <strong>{incompleteItems.length}</strong> booking{incompleteItems.length !== 1 ? 's' : ''}. 
                  You can proceed with the configured items or go back to complete all selections.
                </p>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowIncompleteWarning(false)}
                    className="flex-1"
                  >
                    Go Back
                  </Button>
                  <Button
                    onClick={handleContinueWithIncomplete}
                    className="flex-1 btn-primary"
                  >
                    Continue with {cartItems.length - incompleteItems.length} item{cartItems.length - incompleteItems.length !== 1 ? 's' : ''}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}