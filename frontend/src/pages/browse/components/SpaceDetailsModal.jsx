// src/pages/browse/components/SpaceDetailsModal.jsx
// ✅ UPDATED: Clean, responsive space details modal with campaign selection

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { 
  X, Calendar, CheckCircle, Star, Users, MapPin, Eye,
  AlertCircle, Info, Target, DollarSign
} from "lucide-react";
import { getAreaName, getAreaType, getAreaPrice, getAreaCategoryIcon } from '../utils/areaHelpers';
import { getBusinessInsights, getTrustIndicators, calculateROI } from '../utils/businessInsights';
import { getNumericPrice } from '../utils/areaHelpers';
import CampaignSelection from '../../../components/campaigns/CampaignSelection';

export default function EnhancedSpaceDetailsModal({ 
  selectedSpace,
  detailsExpanded,
  setSelectedSpace,
  setDetailsExpanded,
  isInCart,
  addToCart,
  handleBookingNavigation
}) {
  // Campaign selection state
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showCampaignSelection, setShowCampaignSelection] = useState(false);

  // Check for newly created campaign from sessionStorage
  useEffect(() => {
    const newCampaign = sessionStorage.getItem('newCampaign');
    if (newCampaign) {
      try {
        const campaign = JSON.parse(newCampaign);
        setSelectedCampaign(campaign);
        sessionStorage.removeItem('newCampaign');
      } catch (error) {
        console.error('Error parsing new campaign:', error);
      }
    }
  }, []);

  // Early return if no space selected
  if (!selectedSpace || !detailsExpanded) return null;

  const closeModal = () => {
    setSelectedSpace(null);
    setDetailsExpanded(false);
    setSelectedCampaign(null);
    setShowCampaignSelection(false);
  };

  const handleCampaignSelect = (campaign) => {
    setSelectedCampaign(campaign);
  };

  const handleCreateCampaign = (spaceId) => {
    // Store current space details for return navigation
    sessionStorage.setItem('spaceDetails', JSON.stringify({
      spaceId: selectedSpace.id,
      spaceName: getAreaName(selectedSpace),
      returnTo: 'space'
    }));
    
    // Navigate to create campaign with return parameters
    window.location.href = `/create-campaign?returnTo=space&spaceId=${spaceId}`;
  };

  const handleBookWithCampaign = () => {
    if (selectedCampaign) {
      // Pass campaign data to booking navigation
      handleBookingNavigation(selectedSpace, selectedCampaign);
    } else {
      // No campaign selected, proceed with normal booking
      handleBookingNavigation(selectedSpace);
    }
  };

  // Helper functions
  const IconComponent = getAreaCategoryIcon(selectedSpace.type);
  const insights = getBusinessInsights(selectedSpace.property);
  const trust = getTrustIndicators(selectedSpace.property);
  const roi = calculateROI(selectedSpace, getNumericPrice);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={closeModal}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 mb-1">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                    {getAreaName(selectedSpace)}
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-500 text-white flex-shrink-0">
                    <IconComponent className="w-3 h-3" />
                    {getAreaType(selectedSpace)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 flex items-center gap-1 truncate">
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
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 flex-shrink-0 ml-3"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row max-h-[calc(90vh-120px)] overflow-hidden">
            
            {/* Left Side - Image and Basic Details */}
            <div className="w-full lg:w-1/2 p-4 sm:p-6">
              {/* Image */}
              <div 
                className="relative w-full rounded-lg overflow-hidden bg-gray-100 mb-4"
                style={{ aspectRatio: '16/9', minHeight: '200px' }}
              >
                <img 
                  src={selectedSpace.images || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'} 
                  alt={getAreaName(selectedSpace)}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800';
                  }}
                />
                
                {trust?.verified && (
                  <div className="absolute top-2 left-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500 text-white shadow-sm">
                      <CheckCircle className="w-3 h-3" />
                      <span className="hidden sm:inline">Verified</span>
                    </span>
                  </div>
                )}
                
                <div className="absolute bottom-2 right-2">
                  <span className="bg-black/90 text-white px-3 py-1.5 rounded-md font-bold shadow-sm text-sm">
                    {getAreaPrice(selectedSpace)}
                  </span>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-base font-bold text-gray-800 mb-3">Key Metrics</h3>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center justify-center text-green-600 mb-1">
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="text-xl font-bold text-green-600">
                      {(insights.footTraffic/1000).toFixed(0)}K
                    </div>
                    <div className="text-sm text-gray-600">Daily Traffic</div>
                  </div>
                  
                  <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center justify-center text-blue-600 mb-1">
                      <Eye className="w-5 h-5" />
                    </div>
                    <div className="text-xl font-bold text-blue-600">
                      {roi.estimatedReach.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Monthly Reach</div>
                  </div>
                </div>
                
                {trust.rating && (
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <span className="text-sm text-gray-600">Business Rating</span>
                    <div className="flex items-center text-amber-500">
                      <Star className="w-4 h-4 mr-1 fill-current" />
                      <span className="font-semibold">{trust.rating}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Campaign Selection */}
            <div className="w-full lg:w-1/2 p-4 sm:p-6 border-l border-gray-200 overflow-y-auto">
              
              {/* Campaign Selection */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Configure Your Advertisement</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCampaignSelection(!showCampaignSelection)}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    {showCampaignSelection ? 'Hide Campaigns' : 'Select Campaign'}
                  </Button>
                </div>

                {/* Quick Info */}
                {!showCampaignSelection && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-800 font-medium mb-1">Select a Campaign</p>
                        <p className="text-xs text-blue-700">
                          Choose an existing campaign or create a new one to advertise on this space.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Campaign Selection Panel */}
              <AnimatePresence>
                {showCampaignSelection && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6"
                  >
                    <CampaignSelection
                      selectedCampaign={selectedCampaign}
                      onCampaignSelect={handleCampaignSelect}
                      onCreateCampaign={handleCreateCampaign}
                      spaceId={selectedSpace.id}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Selected Campaign Summary */}
              {selectedCampaign && !showCampaignSelection && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-green-900 mb-2">Selected Campaign</h4>
                  <div className="space-y-1 text-sm text-green-800">
                    <p><strong>Name:</strong> {selectedCampaign.name || selectedCampaign.title}</p>
                    <p><strong>Brand:</strong> {selectedCampaign.brand_name}</p>
                    <p><strong>Budget:</strong> ${(selectedCampaign.budget || selectedCampaign.total_budget || 0).toLocaleString()}</p>
                    <p><strong>Status:</strong> {selectedCampaign.status?.replace('_', ' ').toLowerCase()}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {!isInCart(selectedSpace.id) ? (
                  <>
                    {/* Book with Campaign */}
                    {selectedCampaign ? (
                      <Button 
                        onClick={handleBookWithCampaign}
                        className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Calendar className="w-5 h-5 mr-2" />
                        Book with {selectedCampaign.name}
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => setShowCampaignSelection(true)}
                        className="w-full h-12 text-base font-semibold bg-gray-600 hover:bg-gray-700 text-white"
                      >
                        <Target className="w-5 h-5 mr-2" />
                        Select Campaign to Book
                      </Button>
                    )}
                    
                    {/* Quick Add to Cart */}
                    <Button 
                      variant="outline"
                      onClick={() => {
                        addToCart(selectedSpace);
                        closeModal();
                      }}
                      className="w-full h-12 text-base font-semibold"
                    >
                      <Eye className="w-5 h-5 mr-2" />
                      Quick Add to Cart
                    </Button>
                  </>
                ) : (
                  <Button 
                    className="w-full h-12 text-base font-semibold bg-green-100 text-green-700 border-green-200"
                    disabled
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Already in Cart
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}