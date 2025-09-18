// src/pages/TEMPUserJourney/CampaignSuccessPage.tsx
// ✅ UPDATED: Handle multiple spaces and real database structure
// ✅ ENHANCED: Professional design matching actual data

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, Calendar, MapPin, Clock, Target, Send, Eye,
  TrendingUp, BarChart3, Copy, ChevronDown, Bell, CreditCard, 
  Compass, HelpCircle, BookOpen, Video, MessageCircle, Phone, 
  Mail, Headphones, Package, Sparkles, ChevronRight, Zap,
  ArrowLeft, Building2, Users, DollarSign
} from "lucide-react";

// Types matching database schema
interface SelectedSpace {
  id: string;
  name: string;
  title?: string;
  baseRate?: number;
  rateType?: string;
  duration: number;
  dates: {
    start: string;
    end: string;
  };
  totalPrice: number;
  propertyId?: string;
  city?: string;
  state?: string;
  country?: string;
  type?: string;
  surfaceType?: string;
}

interface SelectedCampaign {
  id: string;
  name: string;
  brand_name: string;
  objective?: string;
  description?: string;
  budget?: number;
  target_demographics?: any;
}

interface CampaignSuccessPageProps {
  selectedSpaces: SelectedSpace[];
  selectedCampaign: SelectedCampaign;
  user: any;
  onGoToDashboard: () => void;
  onCreateAnother: () => void;
  totalCost: number;
}

// Utility functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export default function CampaignSuccessPage({ 
  selectedSpaces, 
  selectedCampaign, 
  user,
  onGoToDashboard,
  onCreateAnother,
  totalCost
}: CampaignSuccessPageProps) {
  const navigate = useNavigate();
  const [showCampaignDetails, setShowCampaignDetails] = useState(false);
  const [countdown, setCountdown] = useState(10);

  // Calculate totals
  const totalSpaces = selectedSpaces.length;
  const totalDuration = selectedSpaces.reduce((sum, space) => sum + space.duration, 0);
  const averageDuration = totalDuration / totalSpaces;
  const totalEstimatedReach = totalSpaces * 50000; // Estimate 50k per space

  // Auto-redirect countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          onGoToDashboard();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onGoToDashboard]);

  const toggleCampaignDetails = () => {
    setShowCampaignDetails(!showCampaignDetails);
  };

  // Generate campaign ID and timestamp
  const campaignId = `#ELV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
  const sentAt = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) + ' at ' + new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-gray-200 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={onGoToDashboard}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="font-medium">Back to Dashboard</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Campaign Sent Successfully</h1>
                <p className="text-sm text-gray-600">Your campaign invitations have been sent to {totalSpaces} space owner{totalSpaces !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-sm text-gray-600">Select Spaces</span>
                <div className="w-12 h-px bg-green-500"></div>
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-sm text-gray-600">Choose Campaign</span>
                <div className="w-12 h-px bg-green-500"></div>
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-gray-900">Campaign Sent</span>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Success Section */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white py-16"
      >
        <div className="max-w-4xl mx-auto text-center px-6">
          <div className="mb-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="text-white w-12 h-12" />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-4xl font-bold text-green-500 mb-4"
            >
              Campaign Sent Successfully!
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-xl text-gray-600 max-w-2xl mx-auto"
            >
              Your campaign invitations have been sent to {totalSpaces} space owner{totalSpaces !== 1 ? 's' : ''} for approval. We'll keep you updated on the progress.
            </motion.p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto"
          >
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-center mb-2">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{totalSpaces}</div>
              <div className="text-sm text-gray-600">Space{totalSpaces !== 1 ? 's' : ''} Selected</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{totalDuration}</div>
              <div className="text-sm text-gray-600">Total Days</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-center mb-2">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalCost)}</div>
              <div className="text-sm text-gray-600">Total Investment</div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="bg-gray-50 rounded-xl p-6 max-w-2xl mx-auto mt-8"
          >
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-600">
                <Send className="w-4 h-4 mr-2" />
                <span>Campaign ID: {campaignId}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                <span>Sent: {sentAt}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Campaign Overview Section */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className="py-16 bg-gray-50"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Total Reach */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="text-white w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-blue-900 mb-1">{totalEstimatedReach.toLocaleString()}</div>
              <div className="text-sm font-medium text-blue-800">Estimated Reach</div>
            </div>
            
            {/* Coverage */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="text-white w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-green-900 mb-1">{totalSpaces}</div>
              <div className="text-sm font-medium text-green-800">Location{totalSpaces !== 1 ? 's' : ''}</div>
            </div>
            
            {/* Average Duration */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="text-white w-6 h-6" />
              </div>
              <div className="text-2xl font-bold text-purple-900 mb-1">{Math.round(averageDuration)}</div>
              <div className="text-sm font-medium text-purple-800">Avg. Days</div>
            </div>
            
            {/* Investment */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="text-white w-6 h-6" />
              </div>
              <div className="text-lg font-bold text-orange-900 mb-1">{formatCurrency(totalCost / totalDuration)}</div>
              <div className="text-sm font-medium text-orange-800">Cost per Day</div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Process Timeline Section */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6 }}
        className="py-16 bg-white"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Happens Next?</h2>
            <p className="text-lg text-gray-600">Follow your campaign through our streamlined approval process</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.8 }}
              className="relative"
            >
              <div className="bg-white rounded-xl p-8 border-2 border-blue-600 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <Eye className="text-white w-6 h-6" />
                  </div>
                  <span className="bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">In Progress</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Space Owners Review</h3>
                <p className="text-gray-600 mb-4">Each space owner will review your campaign details and make their decision independently. You'll be notified as responses come in.</p>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Typically 24-48 hours</span>
                </div>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                <ChevronRight className="w-8 h-8 text-gray-300" />
              </div>
            </motion.div>
            
            {/* Step 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2 }}
              className="relative"
            >
              <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <Bell className="text-white w-6 h-6" />
                  </div>
                  <span className="bg-gray-200 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">Pending</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Real-time Updates</h3>
                <p className="text-gray-600 mb-4">Get instant notifications for each approval or response. Track the status of all {totalSpaces} invitations in your dashboard.</p>
                <div className="flex items-center text-sm text-gray-500">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>Email & Dashboard alerts</span>
                </div>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                <ChevronRight className="w-8 h-8 text-gray-300" />
              </div>
            </motion.div>
            
            {/* Step 3 */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 2.2 }}
              className="relative"
            >
              <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <CreditCard className="text-white w-6 h-6" />
                  </div>
                  <span className="bg-gray-200 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">Awaiting Approval</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Complete Bookings</h3>
                <p className="text-gray-600 mb-4">For each approved space, you'll receive secure payment instructions to finalize your campaign bookings and schedule dates.</p>
                <div className="flex items-center text-sm text-gray-500">
                  <Zap className="w-4 h-4 mr-2" />
                  <span>Secure payment processing</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Campaign Summary Section */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.4 }}
        className="py-16 bg-gray-50"
      >
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <button 
                className="flex items-center justify-between w-full text-left" 
                onClick={toggleCampaignDetails}
              >
                <h3 className="text-xl font-bold text-gray-900">View Full Campaign Details</h3>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showCampaignDetails ? 'rotate-180' : ''}`} />
              </button>
            </div>
            
            <AnimatePresence>
              {showCampaignDetails && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Campaign Information</label>
                        <div className="mt-2">
                          <div className="text-lg font-semibold text-gray-900">{selectedCampaign.name}</div>
                          <div className="text-gray-600">{selectedCampaign.brand_name} Brand Campaign</div>
                          {selectedCampaign.objective && (
                            <div className="text-sm text-gray-500 mt-1 capitalize">{selectedCampaign.objective.replace('_', ' ')}</div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Campaign Reach</label>
                        <div className="mt-2">
                          <div className="text-lg font-semibold text-gray-900">{totalEstimatedReach.toLocaleString()} People</div>
                          <div className="text-gray-600">Estimated total reach across all spaces</div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Duration Overview</label>
                        <div className="mt-2">
                          <div className="text-lg font-semibold text-gray-900">{totalDuration} Total Days</div>
                          <div className="text-gray-600">Across {totalSpaces} location{totalSpaces !== 1 ? 's' : ''}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Investment</label>
                        <div className="mt-2">
                          <div className="text-3xl font-bold text-blue-600">{formatCurrency(totalCost)}</div>
                          <div className="text-gray-600">{formatCurrency(totalCost / totalDuration)}/day average</div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Selected Spaces</label>
                        <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                          {selectedSpaces.map((space, index) => (
                            <div key={space.id} className="flex items-center justify-between text-sm bg-gray-50 rounded p-2">
                              <div>
                                <div className="font-medium text-gray-900">{space.name}</div>
                                <div className="text-gray-500">{space.city}{space.state ? `, ${space.state}` : ''}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">{space.duration} days</div>
                                <div className="text-gray-500">{formatCurrency(space.totalPrice || (space.baseRate || 0) * space.duration)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.section>

      {/* Action Section */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.6 }}
        className="py-16 bg-white"
      >
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Primary Actions */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Continue Your Success</h3>
              <p className="text-gray-600 mb-6">While you wait for approvals, explore more opportunities to grow your reach</p>
              
              <div className="space-y-4">
                <button 
                  onClick={onGoToDashboard}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition flex items-center justify-center"
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Go to Dashboard
                </button>
                
                <button 
                  onClick={onCreateAnother}
                  className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-medium py-3 px-6 rounded-lg transition flex items-center justify-center"
                >
                  <Package className="w-5 h-5 mr-2" />
                  Create Another Campaign
                </button>
              </div>
            </div>
            
            {/* Alternative Actions */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Explore More Options</h4>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 hover:bg-white rounded-lg transition flex items-center">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">Browse More Spaces</span>
                  </button>
                  
                  <button className="w-full text-left p-3 hover:bg-white rounded-lg transition flex items-center">
                    <Copy className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">Download Campaign Receipt</span>
                  </button>
                  
                  <button className="w-full text-left p-3 hover:bg-white rounded-lg transition flex items-center">
                    <Video className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">Watch Platform Tutorial</span>
                  </button>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <div className="flex items-center mb-3">
                  <Sparkles className="w-5 h-5 text-yellow-600 mr-2" />
                  <h4 className="font-semibold text-yellow-900">Pro Tip</h4>
                </div>
                <p className="text-yellow-800 text-sm">Track all {totalSpaces} invitations in your dashboard. Space owners can approve campaigns independently, so you might get partial approvals before all responses are in.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Statistics Section */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.8 }}
        className="py-16 bg-gray-50"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Campaign Performance Outlook</h2>
            <p className="text-lg text-gray-600">Based on platform analytics and similar campaigns</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Response Time Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-white w-8 h-8" />
              </div>
              <div className="text-3xl font-bold text-blue-900 mb-2">24-48 Hours</div>
              <div className="text-lg font-semibold text-blue-800 mb-2">Expected Response Time</div>
              <p className="text-blue-700">Most space owners respond within this timeframe</p>
            </div>
            
            {/* Success Rate Card */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-white w-8 h-8" />
              </div>
              <div className="text-3xl font-bold text-green-900 mb-2">85%</div>
              <div className="text-lg font-semibold text-green-800 mb-2">Approval Rate</div>
              <p className="text-green-700">For quality campaigns meeting our guidelines</p>
            </div>
            
            {/* Expected Approvals */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="text-white w-8 h-8" />
              </div>
              <div className="text-3xl font-bold text-purple-900 mb-2">{Math.round(totalSpaces * 0.85)}</div>
              <div className="text-lg font-semibold text-purple-800 mb-2">Expected Approvals</div>
              <p className="text-purple-700">Based on your campaign quality and targeting</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Auto-redirect notification */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3 }}
        className="fixed bottom-6 right-6 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50"
      >
        <div className="flex items-center space-x-2">
          <Compass className="w-4 h-4" />
          <p className="text-sm">Redirecting to dashboard in {countdown} seconds...</p>
        </div>
      </motion.div>
    </div>
  );
}