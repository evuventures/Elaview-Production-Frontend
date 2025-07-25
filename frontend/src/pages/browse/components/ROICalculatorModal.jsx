import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { X, ShoppingCart, Calendar } from "lucide-react";
import { getAreaName, getNumericPrice } from '../utils/areaHelpers';
import { getBusinessInsights, calculateROI } from '../utils/businessInsights';

export default function ROICalculatorModal({ 
  showROICalculator,
  setShowROICalculator,
  selectedSpace,
  isInCart,
  addToCart,
  handleBookingNavigation 
}) {
  if (!selectedSpace) return null;

  const roi = calculateROI(selectedSpace, getNumericPrice);
  const insights = getBusinessInsights(selectedSpace.property);

  return (
    <AnimatePresence>
      {showROICalculator && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowROICalculator(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-lg bg-gray-800 rounded-2xl border border-gray-700 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">ROI Calculator</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowROICalculator(false)}
                  className="text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-gray-700/50 rounded-xl border border-gray-600">
                  <h4 className="font-semibold text-white mb-4">{getAreaName(selectedSpace)}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Monthly Investment</p>
                      <p className="text-xl font-bold text-white">${roi.investment}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Estimated ROI</p>
                      <p className="text-xl font-bold text-lime-400">+{roi.roi}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Monthly Reach</p>
                      <p className="text-xl font-bold text-white">{roi.estimatedReach.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Est. Revenue</p>
                      <p className="text-xl font-bold text-white">${roi.estimatedRevenue.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-400 space-y-1">
                  <p>• Based on location foot traffic and industry averages</p>
                  <p>• Actual results may vary based on campaign quality and timing</p>
                  <p>• Includes estimated 70% view rate and {insights.conversionRate}% engagement rate</p>
                </div>

                <div className="flex gap-3">
                  {!isInCart(selectedSpace.id) ? (
                    <Button 
                      className="flex-1 bg-lime-400 text-gray-900 hover:bg-lime-500"
                      onClick={() => {
                        addToCart(selectedSpace);
                        setShowROICalculator(false);
                      }}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  ) : (
                    <Button 
                      className="flex-1 bg-lime-400 text-gray-900 hover:bg-lime-500"
                      onClick={() => {
                        setShowROICalculator(false);
                        handleBookingNavigation(selectedSpace);
                      }}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Book This Space
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
                  >
                    Discuss Details
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}