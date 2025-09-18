import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { X, ShoppingCart, Calendar, TrendingUp, Users, Eye, DollarSign } from "lucide-react";
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

 const closeModal = () => setShowROICalculator(false);

 return (
 <AnimatePresence>
 {showROICalculator && (
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
 className="w-full max-w-2xl bg-white rounded-2xl shadow-soft-lg border border-slate-200 max-h-[85vh] overflow-y-auto"
 onClick={(e) => e.stopPropagation()}
>
 {/* Header */}
 <div className="bg-slate-25 border-b border-slate-200 p-6">
 <div className="flex items-center justify-between">
 <div>
 <h3 className="heading-2 text-slate-900">ROI Calculator</h3>
 <p className="body-medium text-slate-600 mt-1">Investment analysis for {getAreaName(selectedSpace)}</p>
 </div>
 <Button
 variant="ghost"
 size={20}
 onClick={closeModal}
 className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
>
 <X className="w-5 h-5" />
 </Button>
 </div>
 </div>

 <div className="p-6 space-y-6">
 {/* Key Metrics Grid */}
 <div className="grid grid-cols-2 gap-4">
 <div className="card card-comfortable text-center">
 <div className="flex items-center justify-center text-teal-600 mb-3">
 <DollarSign className="w-6 h-6" />
 </div>
 <div className="metric-value text-teal-600">${roi.investment}</div>
 <div className="metric-label">Monthly Investment</div>
 </div>
 
 <div className="card card-comfortable text-center">
 <div className="flex items-center justify-center text-success-600 mb-3">
 <TrendingUp className="w-6 h-6" />
 </div>
 <div className="metric-value text-success-600">+{roi.roi}%</div>
 <div className="metric-label">Estimated ROI</div>
 </div>
 
 <div className="card card-comfortable text-center">
 <div className="flex items-center justify-center text-slate-600 mb-3">
 <Users className="w-6 h-6" />
 </div>
 <div className="metric-value text-slate-900">{roi.estimatedReach.toLocaleString()}</div>
 <div className="metric-label">Monthly Reach</div>
 </div>
 
 <div className="card card-comfortable text-center">
 <div className="flex items-center justify-center text-slate-600 mb-3">
 <Eye className="w-6 h-6" />
 </div>
 <div className="metric-value text-slate-900">${roi.estimatedRevenue.toLocaleString()}</div>
 <div className="metric-label">Est. Revenue</div>
 </div>
 </div>

 {/* ROI Breakdown */}
 <div className="card card-comfortable">
 <h4 className="heading-3 text-slate-800 mb-4">Investment Breakdown</h4>
 <div className="space-y-3">
 <div className="flex justify-between items-center py-2 border-b border-slate-100 last:border-b-0">
 <span className="body-medium text-slate-600">Daily foot traffic</span>
 <span className="label text-slate-900">{(insights.footTraffic/1000).toFixed(0)}K people</span>
 </div>
 <div className="flex justify-between items-center py-2 border-b border-slate-100 last:border-b-0">
 <span className="body-medium text-slate-600">Estimated view rate</span>
 <span className="label text-slate-900">70%</span>
 </div>
 <div className="flex justify-between items-center py-2 border-b border-slate-100 last:border-b-0">
 <span className="body-medium text-slate-600">Engagement rate</span>
 <span className="label text-slate-900">{insights.conversionRate}%</span>
 </div>
 <div className="flex justify-between items-center py-2 border-b border-slate-100 last:border-b-0">
 <span className="body-medium text-slate-600">Campaign lift</span>
 <span className="label text-success-600">+{insights.avgCampaignLift}%</span>
 </div>
 </div>
 </div>

 {/* Disclaimer */}
 <div className="bg-slate-50 rounded-lg p-4">
 <h5 className="label text-slate-700 mb-2">Important Notes</h5>
 <div className="caption text-slate-600 space-y-1">
 <p>• Calculations based on location foot traffic and industry averages</p>
 <p>• Actual results may vary based on campaign quality, timing, and market conditions</p>
 <p>• ROI estimates include projected {insights.conversionRate}% engagement rate</p>
 <p>• Contact our team for customized projections based on your specific goals</p>
 </div>
 </div>

 {/* Action Buttons */}
 <div className="flex gap-3">
 {!isInCart(selectedSpace.id) ? (
 <Button 
 className="flex-1 btn-primary"
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
 className="flex-1 btn-primary"
 onClick={() => {
 closeModal();
 handleBookingNavigation(selectedSpace);
 }}
>
 <Calendar className="w-4 h-4 mr-2" />
 Book This Space
 </Button>
 )}
 <Button 
 className="btn-secondary"
>
 Contact Expert
 </Button>
 </div>
 </div>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>
 );
}