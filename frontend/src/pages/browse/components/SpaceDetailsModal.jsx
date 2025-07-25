import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  X, ShoppingCart, Calendar, Calculator, MessageCircle, 
  CheckCircle, Star 
} from "lucide-react";
import { getAreaName, getAreaType, getAreaPrice } from '../utils/areaHelpers';
import { getBusinessInsights, getTrustIndicators, calculateROI } from '../utils/businessInsights';
import { getNumericPrice } from '../utils/areaHelpers';

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
  if (!selectedSpace || !detailsExpanded) return null;

  const roi = calculateROI(selectedSpace, getNumericPrice);
  const insights = getBusinessInsights(selectedSpace.property);
  const trust = getTrustIndicators(selectedSpace.property);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={() => {
          setSelectedSpace(null);
          setDetailsExpanded(false);
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-4xl bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 pb-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">{getAreaName(selectedSpace)}</h2>
                <p className="text-gray-400">at {selectedSpace.propertyName}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-lime-400 text-gray-900 px-3 py-1">
                  {getAreaType(selectedSpace)}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedSpace(null);
                    setDetailsExpanded(false);
                  }}
                  className="text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content - Split Layout */}
          <div className="flex h-[calc(85vh-140px)]">
            {/* Left Side - Image */}
            <div className="w-1/2 p-6 pr-3">
              <div className="relative w-full h-full rounded-xl overflow-hidden">
                <img 
                  src={selectedSpace.images || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'} 
                  alt={getAreaName(selectedSpace)}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800';
                  }}
                />
              </div>
            </div>

            {/* Right Side - Details */}
            <div className="w-1/2 p-6 pl-3 flex flex-col">
              {/* Price & Location */}
              <div className="grid grid-cols-1 gap-4 mb-6">
                <div className="p-4 bg-gray-700/50 rounded-xl border border-gray-600">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Price</p>
                      <p className="text-2xl font-bold text-lime-400">{getAreaPrice(selectedSpace)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Location</p>
                      <p className="text-base font-semibold text-white leading-tight">{selectedSpace.propertyAddress}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="mb-6">
                <div className="p-4 bg-gray-700/50 rounded-xl border border-gray-600">
                  <h3 className="font-semibold text-white mb-3">Performance & Trust</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Daily Traffic:</span>
                        <span className="font-semibold text-white">{(insights.footTraffic/1000).toFixed(0)}K</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Campaign Lift:</span>
                        <span className="font-semibold text-cyan-400">+{insights.avgCampaignLift}%</span>
                      </div>
                      {trust.verified && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Status:</span>
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Monthly Reach:</span>
                        <span className="font-semibold text-white">{roi.estimatedReach.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Est. ROI:</span>
                        <span className="font-bold text-lime-400">+{roi.roi}%</span>
                      </div>
                      {trust.rating && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Rating:</span>
                          <div className="flex items-center text-yellow-400">
                            <Star className="w-3 h-3 mr-1 fill-current" />
                            <span className="text-xs font-medium">{trust.rating}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Flex Grow */}
              <div className="flex-1 flex flex-col justify-end">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {!isInCart(selectedSpace.id) ? (
                    <Button 
                      className="bg-lime-400 text-gray-900 hover:bg-lime-500"
                      onClick={() => {
                        addToCart(selectedSpace);
                        // ✅ ADDED: Close the modal after adding to cart
                        setSelectedSpace(null);
                        setDetailsExpanded(false);
                      }}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  ) : (
                    <Button 
                      className="bg-green-500 text-white hover:bg-green-600"
                      disabled
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      In Cart
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={() => handleBookingNavigation(selectedSpace)}
                    className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Now
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowROICalculator(true)}
                    className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    ROI Calculator
                  </Button>
                  <Button 
                    variant="outline" 
                    className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact
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