// src/pages/browse/components/mobile/MobileBottomSheet.jsx
// ✅ RESEARCH-BASED: Enhanced mobile bottom sheet with dual CTA system
// ✅ FIXED: Perfect bottom anchoring with height-only animation

import React, { useState, useEffect, useRef, useCallback, useMemo, useImperativeHandle, forwardRef } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { 
  X, ChevronUp, MapPin, Star, Users, Eye, ShoppingCart, 
  Calendar, Heart, Plus, CheckCircle, ArrowUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const MobileBottomSheet = forwardRef(({ 
  isOpen, 
  onClose, 
  selectedProperty, 
  spaces = [], 
  onSpaceSelect,
  // ✅ Cart and booking functionality props
  onBookNow,
  onAddToCart,
  isInCart,
  cartCount = 0,
  title = "Available Spaces"
}, ref) => {
  // ✅ RESEARCH-BASED: Precise viewport calculations for mobile navigation
  const MOBILE_TOP_BAR_HEIGHT = 64;     // h-16 from MobileTopBar
  const MOBILE_BOTTOM_NAV_HEIGHT = 60;  // MobileNav height
  const SAFE_AREA_BOTTOM = 0;           // ✅ FIXED: No gap needed - sheet should touch nav

  // ✅ FIXED: Height-based system with NO Y-axis dragging
  const [snapPoint, setSnapPoint] = useState('CLOSED');
  const [isAnimating, setIsAnimating] = useState(false);
  
  const sheetRef = useRef(null);
  const handleRef = useRef(null);
  
  // ✅ MOTION VALUES: For custom drag handling without Y transforms
  const dragY = useMotionValue(0);
  const isDragging = useRef(false);

  // ✅ CRITICAL FIX: Calculate heights - NO Y positioning
  const { availableHeight, snapHeights } = useMemo(() => {
    const windowHeight = window.innerHeight;
    const availableHeight = windowHeight - MOBILE_TOP_BAR_HEIGHT - MOBILE_BOTTOM_NAV_HEIGHT - SAFE_AREA_BOTTOM;
    
    // ✅ HEIGHT-BASED PERCENTAGES: Heights for each snap state
    const SNAP_PERCENTAGES = {
      CLOSED: 0,      // Completely hidden (0 height)
      PEEK: 0.15,     // Small peek (15% of available height)
      HALF: 0.5,      // Half visible (50% of available height)  
      FULL: 0.85      // Almost full (85% of available height)
    };

    // ✅ HEIGHTS: Calculate actual heights for each state
    const snapHeights = {};
    Object.entries(SNAP_PERCENTAGES).forEach(([state, percentage]) => {
      snapHeights[state] = availableHeight * percentage;
    });

    console.log('📐 Sheet Height-Only Calculations:', {
      windowHeight,
      availableHeight,
      snapHeights
    });

    return { availableHeight, snapHeights };
  }, []);

  // ✅ Filter and prepare spaces data
  const displaySpaces = useMemo(() => {
    if (!selectedProperty || !spaces.length) return [];
    
    return spaces.filter(space => {
      const matchesProperty = space.propertyId === selectedProperty.id ||
                            space.property?.id === selectedProperty.id;
      const hasRequiredData = space.id && space.title;
      return matchesProperty && hasRequiredData;
    });
  }, [spaces, selectedProperty]);

  // ✅ SMOOTH TRANSITIONS: Animation state tracking
  const changeSnapPoint = useCallback((newSnapPoint) => {
    console.log(`🎬 Height-only transition: ${snapPoint} → ${newSnapPoint}`);
    setIsAnimating(true);
    setSnapPoint(newSnapPoint);
    
    // Reset drag value when changing snap points
    dragY.set(0);
    
    setTimeout(() => {
      setIsAnimating(false);
      console.log('✅ Transition complete');
    }, 400);
  }, [snapPoint, dragY]);

  // ✅ OPENING ANIMATION: Smooth entrance from closed
  useEffect(() => {
    if (isOpen && snapPoint === 'CLOSED') {
      console.log('📱 Sheet opening - animating to PEEK');
      setTimeout(() => changeSnapPoint('PEEK'), 100);
    } else if (!isOpen && snapPoint !== 'CLOSED') {
      console.log('📱 Sheet closing - animating to CLOSED');
      changeSnapPoint('CLOSED');
    }
  }, [isOpen, snapPoint, changeSnapPoint]);

  // ✅ AUTO-EXPAND: Property selection expands to HALF
  useEffect(() => {
    if (selectedProperty && isOpen && snapPoint === 'PEEK') {
      console.log('🏢 Property selected, expanding to HALF');
      changeSnapPoint('HALF');
    }
  }, [selectedProperty, isOpen, snapPoint, changeSnapPoint]);

  // ✅ CUSTOM DRAG HANDLING: No Y transforms, only height calculations
  const handlePointerDown = useCallback((event) => {
    console.log('🖐️ Starting custom drag - no Y transform');
    event.preventDefault();
    isDragging.current = true;
    
    const startY = event.clientY;
    
    const handlePointerMove = (moveEvent) => {
      if (!isDragging.current) return;
      
      const deltaY = moveEvent.clientY - startY;
      dragY.set(deltaY);
    };
    
    const handlePointerUp = (upEvent) => {
      if (!isDragging.current) return;
      
      isDragging.current = false;
      const finalDelta = dragY.get();
      
      console.log('🖐️ Custom drag ended', { 
        deltaY: finalDelta,
        currentState: snapPoint 
      });
      
      // Smart snapping logic based on drag distance
      handleDragEnd(finalDelta);
      
      // Reset drag value
      dragY.set(0);
      
      // Cleanup event listeners
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
    
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  }, [snapPoint, dragY]);

  // ✅ IMPROVED SNAPPING: Based on drag distance only
  const handleDragEnd = useCallback((dragDistance) => {
    const SHORT_DRAG = 60;
    const MEDIUM_DRAG = 150;
    const LONG_DRAG = 250;

    let targetSnapPoint = snapPoint;

    // ✅ DISTANCE-BASED: Simple distance-based snapping
    if (Math.abs(dragDistance) > SHORT_DRAG) {
      if (dragDistance > 0) {
        // Dragging down - closing
        if (snapPoint === 'FULL') {
          if (dragDistance > LONG_DRAG) targetSnapPoint = 'PEEK';
          else if (dragDistance > MEDIUM_DRAG) targetSnapPoint = 'HALF';
          else targetSnapPoint = 'HALF';
        } else if (snapPoint === 'HALF') {
          if (dragDistance > MEDIUM_DRAG) targetSnapPoint = 'CLOSED';
          else targetSnapPoint = 'PEEK';
        } else if (snapPoint === 'PEEK') {
          targetSnapPoint = 'CLOSED';
        }
      } else {
        // Dragging up - opening
        if (snapPoint === 'CLOSED') {
          if (Math.abs(dragDistance) > LONG_DRAG) targetSnapPoint = 'HALF';
          else if (Math.abs(dragDistance) > MEDIUM_DRAG) targetSnapPoint = 'PEEK';
          else targetSnapPoint = 'PEEK';
        } else if (snapPoint === 'PEEK') {
          if (Math.abs(dragDistance) > MEDIUM_DRAG) targetSnapPoint = 'FULL';
          else targetSnapPoint = 'HALF';
        } else if (snapPoint === 'HALF') {
          targetSnapPoint = 'FULL';
        }
      }
    }

    console.log(`🎯 Height-based snapping: ${snapPoint} → ${targetSnapPoint} (distance: ${dragDistance}px)`);
    
    // ✅ CLOSE HANDLING: Proper closing with callback
    if (targetSnapPoint === 'CLOSED') {
      changeSnapPoint('CLOSED');
      setTimeout(() => onClose?.(), 300);
    } else {
      changeSnapPoint(targetSnapPoint);
    }
  }, [snapPoint, changeSnapPoint, onClose]);

  // ✅ SPACE INTERACTION: Smart expansion
  const handleSpaceClick = useCallback((space) => {
    console.log('🎯 Space clicked:', space.id);
    if (snapPoint === 'CLOSED' || snapPoint === 'PEEK') {
      changeSnapPoint('HALF');
    }
    onSpaceSelect?.(space);
  }, [snapPoint, onSpaceSelect, changeSnapPoint]);

  // ✅ Enhanced booking handler
  const handleBookNow = useCallback((space) => {
    console.log('📅 Book Now clicked:', space.id);
    onBookNow?.(space);
  }, [onBookNow]);

  // ✅ Enhanced cart handler
  const handleAddToCart = useCallback((space) => {
    console.log('🛒 Add to Cart clicked:', space.id);
    onAddToCart?.(space);
  }, [onAddToCart]);

  // ✅ BACK NAVIGATION: Step-down behavior
  const handleBack = useCallback(() => {
    if (snapPoint === 'FULL') {
      changeSnapPoint('HALF');
    } else if (snapPoint === 'HALF') {
      changeSnapPoint('PEEK');
    } else if (snapPoint === 'PEEK') {
      changeSnapPoint('CLOSED');
      setTimeout(() => onClose?.(), 300);
    } else {
      onClose?.();
    }
  }, [snapPoint, onClose, changeSnapPoint]);

  // ✅ EXTERNAL CONTROL: Ref interface
  useImperativeHandle(ref, () => ({
    minimize: () => {
      changeSnapPoint('CLOSED');
      setTimeout(() => onClose?.(), 300);
    }
  }), [changeSnapPoint, onClose]);

  // ✅ PERFORMANCE: Virtual scrolling during animations
  const visibleSpaces = useMemo(() => {
    if (isAnimating) return [];
    return displaySpaces.slice(0, 20);
  }, [displaySpaces, isAnimating]);

  // Don't render if closed
  if (!isOpen && snapPoint === 'CLOSED') return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="fixed inset-0 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ 
          pointerEvents: (snapPoint === 'CLOSED' || snapPoint === 'PEEK') ? 'none' : 'auto',
          // ✅ NAVIGATION SAFE: Don't interfere with top/bottom nav
          top: MOBILE_TOP_BAR_HEIGHT,
          bottom: MOBILE_BOTTOM_NAV_HEIGHT + SAFE_AREA_BOTTOM,
        }}
      >
        {/* ✅ SMART BACKDROP: Only visible when needed */}
        {(snapPoint === 'HALF' || snapPoint === 'FULL') && (
          <motion.div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onTap={() => {
              changeSnapPoint('CLOSED');
              setTimeout(() => onClose?.(), 300);
            }}
            style={{ pointerEvents: 'auto' }}
          />
        )}

        {/* ✅ PERFECT BOTTOM SHEET: Absolutely no Y transforms, only height */}
        <motion.div
          ref={sheetRef}
          className="absolute left-0 right-0 bg-white rounded-t-xl shadow-2xl border-t border-slate-200 overflow-hidden"
          animate={{ 
            height: snapHeights[snapPoint]
          }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 30,
            mass: 0.8,
            restDelta: 0.01,
            restSpeed: 0.01
          }}
          style={{
            // ✅ CRITICAL FIX: Absolutely anchored to bottom, no transforms allowed
            bottom: 0,                    // Always anchored to bottom
            height: snapHeights[snapPoint], // Height-based animation only
            touchAction: 'none',
            willChange: 'height',         // Optimize for height animation only
            pointerEvents: 'auto',
            // ✅ ENSURE NO TRANSFORMS: Force position to bottom
            transform: 'none',            // Never allow any transforms
            position: 'absolute'          // Ensure absolute positioning
          }}
        >
          {/* ✅ DRAG HANDLE: Custom drag without Y transforms */}
          <div
            ref={handleRef}
            className="flex items-center justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
            onPointerDown={handlePointerDown}
            style={{ 
              touchAction: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none'
            }}
          >
            <div 
              className="w-10 h-1 rounded-full transition-all duration-200 bg-slate-300 hover:bg-slate-400"
            />
          </div>

          {/* ✅ SHEET HEADER: Clean style */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <button 
                onClick={handleBack}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                <ArrowUp className="w-4 h-4 text-slate-600" />
              </button>
              <div>
                <h2 className="font-semibold text-slate-900">
                  {selectedProperty?.name || title}
                </h2>
                <p className="text-sm text-slate-500">
                  {displaySpaces.length} space{displaySpaces.length !== 1 ? 's' : ''} available
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          {/* ✅ SHEET CONTENT: Enhanced space cards with booking CTAs */}
          <div 
            className="flex-1 overflow-hidden"
            style={{ 
              height: `calc(${snapHeights[snapPoint]}px - 120px)` // Account for header + handle
            }}
          >
            <div className="h-full overflow-y-auto">
              {visibleSpaces.length > 0 ? (
                <div className="p-4 space-y-3">
                  {visibleSpaces.map((space) => (
                    // ✅ ENHANCED MOBILE SPACE CARD: Research-based design with dual CTAs
                    <EnhancedMobileSpaceCard
                      key={space.id}
                      space={space}
                      onBookNow={handleBookNow}
                      onAddToCart={handleAddToCart}
                      isInCart={isInCart}
                      onSpaceSelect={handleSpaceClick}
                      cartCount={cartCount}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <MapPin className="w-12 h-12 text-slate-300 mb-3" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No spaces available</h3>
                  <p className="text-slate-500 text-sm">
                    {selectedProperty ? 'This property has no available advertising spaces.' : 'Select a property to view available spaces.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

// ✅ ENHANCED MOBILE SPACE CARD COMPONENT: Research-based design
const EnhancedMobileSpaceCard = ({ 
  space, 
  onBookNow, 
  onAddToCart, 
  isInCart,
  onSpaceSelect,
  cartCount = 0 
}) => {
  const [showQuickActions, setShowQuickActions] = useState(false);

  return (
    <motion.div
      className="space-card bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm"
      whileTap={{ scale: 0.98 }}
      layout
    >
      {/* Main Space Info - Tappable for details */}
      <div 
        className="p-4 cursor-pointer"
        onClick={() => onSpaceSelect(space)}
      >
        <div className="flex items-start gap-3 mb-3">
          {/* Space Thumbnail */}
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
            <img 
              src={space.images || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200'} 
              alt={space.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200';
              }}
            />
          </div>

          {/* Space Details */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 mb-1">
              {space.title}
            </h3>
            <p className="text-xs text-slate-600 flex items-center gap-1 mb-2">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{space.propertyAddress}</span>
            </p>
            
            {/* Quick Metrics */}
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{space.daily_impressions || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{space.weekly_impressions || 0}</span>
              </div>
            </div>
          </div>

          {/* Price Badge */}
          <div className="text-right flex-shrink-0">
            <div className="bg-teal-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              ${space.daily_price || space.price || 0}
            </div>
            <div className="text-xs text-slate-500 mt-1">per day</div>
          </div>
        </div>

        {/* Space Type Badge & Quick Actions Toggle */}
        <div className="flex items-center justify-between">
          <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full">
            {space.space_type || 'Advertisement Space'}
          </span>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowQuickActions(!showQuickActions);
            }}
            className="text-xs text-teal-600 font-medium px-2 py-1 rounded hover:bg-teal-50 transition-colors"
          >
            {showQuickActions ? 'Hide Options' : 'Quick Book'}
          </button>
        </div>
      </div>

      {/* ✅ RESEARCH-BASED: Quick Action CTAs - Expandable Section */}
      <AnimatePresence>
        {showQuickActions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100 bg-slate-50 px-4 py-3"
          >
            <div className="grid grid-cols-2 gap-2">
              {/* Primary CTA: Book Now (Research: Red for urgency) */}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onBookNow(space);
                }}
                className="bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1"
              >
                <Calendar className="w-4 h-4" />
                Book Now
              </Button>

              {/* Secondary CTA: Add to Cart */}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(space);
                }}
                disabled={isInCart && isInCart(space.id)}
                className={`text-sm py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1 ${
                  isInCart && isInCart(space.id)
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {isInCart && isInCart(space.id) ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    In Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </>
                )}
              </Button>
            </div>

            {/* Material Configuration Hint */}
            <p className="text-xs text-slate-500 text-center mt-2">
              Tap "Book Now" for instant booking or "Add to Cart" to configure materials later
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MobileBottomSheet;