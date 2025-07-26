import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { 
  X, ShoppingCart, Calendar, Calculator, MessageCircle, 
  CheckCircle, Star, Users, TrendingUp, MapPin, Eye
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
  handleBookingNavigation,
  setShowROICalculator 
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
        className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={closeModal}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-5xl bg-white rounded-2xl overflow-hidden shadow-soft-lg border border-slate-200 h-[90vh] max-h-[800px]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Elaview styling */}
          <div className="bg-slate-25 border-b border-slate-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="heading-2 text-slate-900">{getAreaName(selectedSpace)}</h2>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-teal-500 text-white">
                    <IconComponent className="w-3 h-3" />
                    {getAreaType(selectedSpace)}
                  </span>
                </div>
                <p className="body-medium text-slate-600 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {selectedSpace.propertyName} • {selectedSpace.propertyAddress}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeModal}
                className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Main Content - Split Layout */}
          <div className="flex h-[calc(90vh-140px)] max-h-[660px]">
            {/* Left Side - Image */}
            <div className="w-1/2 p-6 pr-3">
              <div className="relative w-full h-full rounded-xl overflow-hidden bg-slate-100">
                <img 
                  src={selectedSpace.images || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'} 
                  alt={getAreaName(selectedSpace)}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800';
                  }}
                />
                
                {/* Image overlays */}
                {trust?.verified && (
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-success-500 text-white shadow-soft">
                      <CheckCircle className="w-3 h-3" />
                      Verified Business
                    </span>
                  </div>
                )}
                
                <div className="absolute bottom-4 right-4">
                  <span className="property-price bg-slate-900/90 text-white px-4 py-2 rounded-lg text-lg font-bold shadow-soft backdrop-blur-sm">
                    {getAreaPrice(selectedSpace)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Side - Details */}
            <div className="w-1/2 p-6 pl-3 flex flex-col overflow-y-auto">
              {/* Key Metrics Cards */}
              <div className="space-y-4 mb-6">
                {/* Performance Metrics */}
                <div className="card card-comfortable">
                  <h3 className="heading-3 text-slate-800 mb-4">Performance Metrics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-center text-success-600 mb-2">
                        <Users className="w-5 h-5 mr-1" />
                      </div>
                      <div className="metric-value text-success-600">{(insights.footTraffic/1000).toFixed(0)}K</div>
                      <div className="metric-label">Daily Traffic</div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-center text-teal-600 mb-2">
                        <TrendingUp className="w-5 h-5 mr-1" />
                      </div>
                      <div className="metric-value text-teal-600">+{insights.avgCampaignLift}%</div>
                      <div className="metric-label">Campaign Lift</div>
                    </div>
                  </div>
                </div>

                {/* ROI & Reach */}
                <div className="card card-comfortable">
                  <h3 className="heading-3 text-slate-800 mb-4">Estimated Returns</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="label text-slate-600 mb-1">Monthly Reach</div>
                      <div className="text-xl font-bold text-slate-900">{roi.estimatedReach.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="label text-slate-600 mb-1">Est. ROI</div>
                      <div className="text-xl font-bold text-success-600">+{roi.roi}%</div>
                    </div>
                  </div>
                  
                  {trust.rating && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
                      <span className="label text-slate-600">Business Rating</span>
                      <div className="flex items-center text-amber-500">
                        <Star className="w-4 h-4 mr-1 fill-current" />
                        <span className="font-semibold">{trust.rating}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Availability Status */}
                <div className="card card-comfortable bg-success-50 border-success-200">
                  <div className="flex items-center justify-center text-success-700">
                    <Eye className="w-5 h-5 mr-2" />
                    <span className="label font-semibold">Space Available for Booking</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-auto space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {!isInCart(selectedSpace.id) ? (
                    <Button 
                      className="btn-primary"
                      onClick={() => {
                        addToCart(selectedSpace);
                        closeModal();
                      }}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  ) : (
                    <Button 
                      className="btn-secondary bg-success-50 text-success-700 border-success-200"
                      disabled
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      In Cart
                    </Button>
                  )}
                  <Button 
                    onClick={() => handleBookingNavigation(selectedSpace)}
                    className="btn-outline"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Now
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={() => setShowROICalculator(true)}
                    className="btn-secondary"
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    ROI Calculator
                  </Button>
                  <Button 
                    className="btn-secondary"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact Owner
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