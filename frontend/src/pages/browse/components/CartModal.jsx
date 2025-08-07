import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  X, ShoppingCart, Plus, Minus, Calendar, MapPin, Package, 
  AlertCircle, CheckCircle, Clock, Eye, Calculator, ChevronRight,
  CalendarDays, Info, Trash2
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

export default function CartModal({ 
  showCart, 
  setShowCart, 
  cart,  // Changed from cartItems to cart
  setCart,  // Added setCart prop
  removeFromCart,
  updateCartItemDuration,  // Changed from updateCartItemQuantity
  getTotalCartValue  // Added getTotalCartValue prop
}) {
  const navigate = useNavigate();
  
  // Date selection state for each cart item
  const [itemDates, setItemDates] = useState({});
  const [itemAvailability, setItemAvailability] = useState({});
  const [totalPricing, setTotalPricing] = useState({ subtotal: 0, total: 0 });
  const [incompleteItems, setIncompleteItems] = useState([]);
  const [showIncompleteWarning, setShowIncompleteWarning] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('🛒 Cart Modal - cart items:', cart);
    console.log('🛒 Cart Modal - showCart:', showCart);
    console.log('🛒 Cart Modal - cart length:', cart?.length);
  }, [cart, showCart]);

  // Initialize date state for cart items
  useEffect(() => {
    if (!cart || !Array.isArray(cart)) return;
    
    const newItemDates = {};
    cart.forEach(item => {
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
  }, [cart]);

  // Calculate total pricing based on cart items
  useEffect(() => {
    if (!cart || !Array.isArray(cart)) {
      setTotalPricing({ subtotal: 0, total: 0 });
      return;
    }
    
    // Use the actual cart item prices
    let subtotal = 0;
    cart.forEach(item => {
      // Cart items already have totalPrice calculated
      subtotal += item.totalPrice || 0;
    });
    
    setTotalPricing({
      subtotal,
      total: subtotal * 1.1 // Including 10% platform fee
    });
  }, [cart]);

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

  // Handle duration change for cart item
  const handleDurationChange = (cartItemId, newDuration) => {
    if (newDuration < 1) return;
    if (updateCartItemDuration) {
      updateCartItemDuration(cartItemId, newDuration);
    }
  };

  // Clear cart
  const clearCart = () => {
    if (setCart) {
      setCart([]);
      console.log('🗑️ Cart cleared');
    }
  };

  // Proceed to checkout - FIXED to navigate properly
  const handleProceedToCheckout = () => {
    if (!cart || cart.length === 0) {
      alert('Your cart is empty. Please add some spaces before proceeding.');
      return;
    }
    
    console.log('🛒 Proceeding to checkout with full cart:', cart);
    
    // Navigate to checkout with the full cart in state
    navigate('/checkout', { 
      state: { 
        cart: cart,
        fromCart: true
      } 
    });
    
    // Close the cart modal
    setShowCart(false);
  };

  if (!showCart) return null;

  // Get item display name
  const getItemDisplayName = (item) => {
    // Handle different possible structures of cart items
    if (item.space) {
      return getAreaName(item.space);
    }
    return item.name || item.title || 'Advertising Space';
  };

  // Get item address
  const getItemAddress = (item) => {
    if (item.space) {
      return item.space.propertyAddress || item.space.address || 'Location';
    }
    return item.propertyAddress || item.address || 'Location';
  };

  // Get item image
  const getItemImage = (item) => {
    if (item.space && item.space.images) {
      return item.space.images;
    }
    return item.images || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200';
  };

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
            max-w-[min(95vw,1200px)]
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
              <ShoppingCart className="w-6 h-6" style={{ color: '#4668AB' }} />
              <h2 className="text-xl font-bold text-slate-900">
                Your Cart ({(cart?.length || 0)} {(cart?.length || 0) === 1 ? 'space' : 'spaces'})
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
            {!cart || cart.length === 0 ? (
              // Empty Cart State
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <ShoppingCart className="w-16 h-16 text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">Your cart is empty</h3>
                <p className="text-slate-500">Add some advertising spaces to get started!</p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {/* Cart Items - Simplified Display */}
                {cart.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-slate-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"
                  >
                    <div className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Space Image Thumbnail */}
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                          <img 
                            src={getItemImage(item)}
                            alt={getItemDisplayName(item)}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200';
                            }}
                          />
                        </div>

                        {/* Space Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 text-lg">
                            {getItemDisplayName(item)}
                          </h3>
                          <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            {getItemAddress(item)}
                          </p>
                          <p className="text-sm text-slate-500 mt-1">
                            Added: {new Date(item.addedAt).toLocaleDateString()}
                          </p>
                        </div>

                        {/* Duration Controls */}
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <p className="text-xs text-slate-500 mb-1">Duration</p>
                            <div className="flex items-center gap-1 bg-slate-50 rounded-lg border border-slate-200 px-2 py-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDurationChange(item.id, item.duration - 1)}
                                className="p-1 h-auto text-slate-600 hover:text-slate-800"
                                disabled={item.duration <= 1}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="text-sm font-semibold text-slate-900 px-3 min-w-[50px] text-center">
                                {item.duration} {item.duration === 1 ? 'day' : 'days'}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDurationChange(item.id, item.duration + 1)}
                                className="p-1 h-auto text-slate-600 hover:text-slate-800"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Pricing */}
                        <div className="text-right min-w-[120px]">
                          <div className="text-xs text-slate-500">Daily Rate</div>
                          <div className="font-medium text-slate-700">${item.pricePerDay?.toFixed(2)}/day</div>
                          <div className="text-xs text-slate-500 mt-2">Total</div>
                          <div className="font-bold text-lg" style={{ color: '#4668AB' }}>
                            ${item.totalPrice?.toFixed(2)}
                          </div>
                        </div>

                        {/* Remove Button */}
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Remove from cart"
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer with Pricing and Actions */}
          {cart && cart.length > 0 && (
            <div className="border-t border-slate-200 bg-slate-50 p-6">
              {/* Total Pricing */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-600">
                    {cart.length} {cart.length === 1 ? 'space' : 'spaces'} in cart
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    Subtotal: ${totalPricing.subtotal.toFixed(2)}
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    Platform fee (10%): ${(totalPricing.subtotal * 0.1).toFixed(2)}
                  </div>
                  <div className="text-xl font-bold mt-2" style={{ color: '#4668AB' }}>
                    Total: ${totalPricing.total.toFixed(2)}
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
                    disabled={!cart || cart.length === 0}
                    className="px-8 py-3 text-base font-semibold text-white"
                    style={{ 
                      backgroundColor: '#4668AB',
                      borderColor: '#4668AB'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#39558C'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#4668AB'}
                  >
                    Proceed to Checkout
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}