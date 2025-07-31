import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { 
  X, ShoppingCart, Calendar, CheckCircle, Star, Users, MapPin, Eye
} from "lucide-react";
import { getAreaName, getAreaType, getAreaPrice, getAreaCategoryIcon } from '../utils/areaHelpers';
import { getBusinessInsights, getTrustIndicators, calculateROI } from '../utils/businessInsights';
import { getNumericPrice } from '../utils/areaHelpers';

export default function SpaceDetailsModal({ 
  selectedSpace,
  detailsExpanded,
  setSelectedSpace,
  setDetailsExpanded,
  isInCart,
  addToCart,
  handleBookingNavigation
}) {
  if (!selectedSpace || !detailsExpanded) return null;

  const roi = calculateROI(selectedSpace, getNumericPrice);
  const insights = getBusinessInsights(selectedSpace.property);
  const trust = getTrustIndicators(selectedSpace.property);
  const IconComponent = getAreaCategoryIcon(selectedSpace);

  const closeModal = () => {
    setSelectedSpace(null);
    setDetailsExpanded(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-x-0 top-16 bottom-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-hidden"
        onClick={closeModal}
      >
        {/* Scalable Modal Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="
            w-full 
            max-w-[min(95vw,1400px)]
            h-[min(90vh,800px)]
            bg-white 
            rounded-xl 
            sm:rounded-2xl 
            overflow-hidden 
            shadow-2xl 
            border 
            border-slate-200 
            flex 
            flex-col
          "
          style={{
            aspectRatio: 'clamp(1.2, 1.6, 2.2)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Fluid Header */}
          <div className="bg-slate-25 border-b border-slate-200 p-3 sm:p-4 lg:p-6 flex-shrink-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-slate-900 truncate">
                    {getAreaName(selectedSpace)}
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-teal-500 text-white flex-shrink-0">
                    <IconComponent className="w-3 h-3" />
                    {getAreaType(selectedSpace)}
                  </span>
                </div>
                <p className="text-sm sm:text-base lg:text-lg text-slate-600 flex items-center gap-1 truncate">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">
                    {selectedSpace.propertyName} • {selectedSpace.propertyAddress}
                  </span>
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeModal}
                className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 flex-shrink-0 ml-3"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>

          {/* Responsive Main Content */}
          <div className="flex flex-col sm:flex-row flex-1 min-h-0">
            {/* Image Section - Maintains aspect ratio */}
            <div className="w-full sm:w-3/5 lg:w-2/3 p-3 sm:p-4 lg:p-6 sm:pr-2 lg:pr-3">
              <div 
                className="relative w-full h-full rounded-lg sm:rounded-xl overflow-hidden bg-slate-100"
                style={{ aspectRatio: '16/9', minHeight: 'clamp(200px, 25vh, 400px)' }}
              >
                <img 
                  src={selectedSpace.images || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'} 
                  alt={getAreaName(selectedSpace)}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800';
                  }}
                />
                
                {/* Responsive overlays */}
                {trust?.verified && (
                  <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
                    <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-success-500 text-white shadow-soft">
                      <CheckCircle className="w-3 h-3" />
                      <span className="hidden sm:inline">Verified Business</span>
                      <span className="sm:hidden">Verified</span>
                    </span>
                  </div>
                )}
                
                <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4">
                  <span className="bg-slate-900/90 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg font-bold shadow-soft backdrop-blur-sm text-sm sm:text-base lg:text-lg xl:text-xl">
                    {getAreaPrice(selectedSpace)}
                  </span>
                </div>
              </div>
            </div>

            {/* Details Section - Fluid sizing */}
            <div className="w-full sm:w-2/5 lg:w-1/3 p-3 sm:p-4 lg:p-6 sm:pl-2 lg:pl-3 flex flex-col min-h-0 overflow-y-auto">
              {/* Scalable Metrics */}
              <div className="space-y-3 sm:space-y-4 lg:space-y-6 mb-4 sm:mb-6 flex-1">
                <div className="bg-white border border-slate-200 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm">
                  <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-slate-800 mb-3 sm:mb-4 lg:mb-6">
                    Key Metrics
                  </h3>
                  
                  {/* Responsive metric grid */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4 lg:mb-6">
                    <div className="text-center p-2 sm:p-3 lg:p-4 bg-slate-50 rounded-md sm:rounded-lg">
                      <div className="flex items-center justify-center text-success-600 mb-1 sm:mb-2">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7" />
                      </div>
                      <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-success-600">
                        {(insights.footTraffic/1000).toFixed(0)}K
                      </div>
                      <div className="text-xs sm:text-sm lg:text-base text-slate-600">
                        Daily Traffic
                      </div>
                    </div>
                    
                    <div className="text-center p-2 sm:p-3 lg:p-4 bg-slate-50 rounded-md sm:rounded-lg">
                      <div className="flex items-center justify-center text-teal-600 mb-1 sm:mb-2">
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7" />
                      </div>
                      <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-teal-600">
                        {roi.estimatedReach.toLocaleString()}
                      </div>
                      <div className="text-xs sm:text-sm lg:text-base text-slate-600">
                        Monthly Reach
                      </div>
                    </div>
                  </div>
                  
                  {/* Business rating */}
                  {trust.rating && (
                    <div className="flex items-center justify-between pt-3 sm:pt-4 lg:pt-6 border-t border-slate-200">
                      <span className="text-xs sm:text-sm lg:text-base text-slate-600">
                        Business Rating
                      </span>
                      <div className="flex items-center text-amber-500">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 mr-1 fill-current" />
                        <span className="font-semibold text-sm sm:text-base lg:text-lg xl:text-xl">
                          {trust.rating}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Availability status */}
                <div className="bg-success-50/80 border border-success-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <div className="flex items-center justify-center text-success-700">
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                    <span className="text-xs sm:text-sm lg:text-base font-semibold">
                      Space Available for Booking
                    </span>
                  </div>
                </div>
              </div>

              {/* Responsive Action Buttons */}
              <div className="flex-shrink-0 mt-auto">
                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                  {!isInCart(selectedSpace.id) ? (
                    <Button 
                      className="btn-primary w-full h-10 sm:h-11 lg:h-12 xl:h-14 text-sm sm:text-base lg:text-lg font-semibold"
                      onClick={() => {
                        addToCart(selectedSpace);
                        closeModal();
                      }}
                    >
                      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Add to Cart
                    </Button>
                  ) : (
                    <Button 
                      className="btn-secondary bg-success-50 text-success-700 border-success-200 w-full h-10 sm:h-11 lg:h-12 xl:h-14 text-sm sm:text-base lg:text-lg font-semibold"
                      disabled
                    >
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      In Cart
                    </Button>
                  )}
                  
                  <Button 
                    onClick={() => handleBookingNavigation(selectedSpace)}
                    className="btn-outline w-full h-10 sm:h-11 lg:h-12 xl:h-14 text-sm sm:text-base lg:text-lg font-semibold"
                  >
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Book Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}