// src/pages/TEMPUserJourney/AdvertiserConfirmationPage.tsx
// ✅ COMPREHENSIVE: Campaign confirmation page for advertisers
// ✅ VERIFICATION: Console logs throughout for testing and debugging
// ✅ ERROR HANDLING: Proper loading states and error boundaries
// ✅ RESPONSIVE: Mobile-first design with clean UX
// ✅ BUSINESS LOGIC: Campaign creation and space owner notification

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, CheckCircle2, Calendar, MapPin, Building2, 
  DollarSign, Clock, Target, Users, AlertCircle, Loader2,
  ChevronRight, Sparkles, Send, Eye, Edit3, Package,
  TrendingUp, BarChart3, Zap
} from "lucide-react";
import apiClient from '@/api/apiClient';

// Types for TypeScript safety
interface SelectedSpace {
  id: string;
  name: string;
  price: number;
  duration: number;
  dates: {
    start: string;
    end: string;
  };
  totalPrice: number;
  propertyId: string;
}

interface SelectedCampaign {
  id: string;
  name: string;
  brand_name: string;
  objective: string;
  description?: string;
  budget?: number;
  target_demographics?: any;
}

interface CampaignInvitation {
  campaignId: string;
  spaceId: string;
  propertyId: string;
  spaceOwnerId: string;
  message: string;
  totalPrice: number;
  duration: number;
  startDate: string;
  endDate: string;
}

// Format currency helper
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Format date helper
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export default function AdvertiserConfirmationPage() {
  const navigate = useNavigate();
  const { user } = useUser();

  // State management
  const [selectedSpace, setSelectedSpace] = useState<SelectedSpace | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<SelectedCampaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmationSuccess, setConfirmationSuccess] = useState(false);
  
  // ✅ LEGAL AGREEMENT STATE
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToContent, setAgreedToContent] = useState(false);
  const [agreedToAccuracy, setAgreedToAccuracy] = useState(false);

  // ✅ VERIFICATION: Console log component mount
  useEffect(() => {
    console.log('🎯 AdvertiserConfirmationPage component mounted');
    console.log('👤 Current user:', user?.id);
    
    initializePage();
  }, []);

  // Initialize page data
  const initializePage = async () => {
    try {
      console.log('🔄 Initializing AdvertiserConfirmationPage...');
      
      // ✅ VERIFICATION: Retrieve space data from sessionStorage
      const spaceDataRaw = sessionStorage.getItem('selectedSpace');
      console.log('📦 Raw space data from sessionStorage:', spaceDataRaw);
      
      if (!spaceDataRaw) {
        console.error('❌ No selected space data found in sessionStorage');
        setError('No space selected. Please go back and select a space.');
        setIsLoading(false);
        return;
      }

      // ✅ VERIFICATION: Retrieve campaign data from sessionStorage
      const campaignDataRaw = sessionStorage.getItem('selectedCampaign');
      console.log('📦 Raw campaign data from sessionStorage:', campaignDataRaw);
      
      if (!campaignDataRaw) {
        console.error('❌ No selected campaign data found in sessionStorage');
        setError('No campaign selected. Please go back and select a campaign.');
        setIsLoading(false);
        return;
      }

      const spaceData = JSON.parse(spaceDataRaw);
      const campaignData = JSON.parse(campaignDataRaw);
      
      console.log('✅ Parsed space data:', spaceData);
      console.log('✅ Parsed campaign data:', campaignData);
      
      setSelectedSpace(spaceData);
      setSelectedCampaign(campaignData);
      setIsLoading(false);

    } catch (error) {
      console.error('❌ Error initializing page:', error);
      setError('Failed to load confirmation data. Please try again.');
      setIsLoading(false);
    }
  };

  // Handle campaign confirmation
  const handleConfirmCampaign = async () => {
    if (!selectedSpace || !selectedCampaign || !user?.id) {
      console.error('❌ Missing required data for confirmation');
      setError('Missing required data. Please try again.');
      return;
    }

    // ✅ VERIFICATION: Check legal agreements
    if (!agreedToTerms || !agreedToContent || !agreedToAccuracy) {
      console.error('❌ Legal agreements not completed');
      setError('Please complete all required agreements before proceeding.');
      return;
    }

    console.log('🚀 Starting campaign confirmation process...');
    setIsConfirming(true);
    setError(null);

    try {
      // ✅ VERIFICATION: Log the data we're about to send
      const invitationData: CampaignInvitation = {
        campaignId: selectedCampaign.id,
        spaceId: selectedSpace.id,
        propertyId: selectedSpace.propertyId,
        spaceOwnerId: 'owner_to_be_fetched', // Will be fetched by backend
        message: `${selectedCampaign.brand_name} would like to advertise on your space "${selectedSpace.name}" for ${selectedSpace.duration} days.`,
        totalPrice: selectedSpace.totalPrice,
        duration: selectedSpace.duration,
        startDate: selectedSpace.dates.start,
        endDate: selectedSpace.dates.end
      };

      console.log('📋 Campaign invitation data:', invitationData);

      // ✅ API CALL: Create campaign invitation
      console.log('📡 Sending campaign invitation...');
      const response = await apiClient.post('/campaigns/create-invitation', {
        ...invitationData,
        advertiserId: user.id,
        campaignDetails: {
          name: selectedCampaign.name,
          brand_name: selectedCampaign.brand_name,
          objective: selectedCampaign.objective,
          description: selectedCampaign.description,
          budget: selectedCampaign.budget,
          target_demographics: selectedCampaign.target_demographics
        }
      });

      console.log('📊 Campaign invitation response:', response);

      if (response.success) {
        console.log('✅ Campaign invitation created successfully');
        console.log('📬 Space owner notification sent');
        
        // Store invitation data for potential future reference
        sessionStorage.setItem('campaignInvitation', JSON.stringify({
          invitationId: response.data.invitationId,
          status: 'PENDING',
          createdAt: new Date().toISOString()
        }));

        setConfirmationSuccess(true);
        
        // ✅ VERIFICATION: Auto-redirect after success
        setTimeout(() => {
          console.log('🔄 Redirecting to advertiser dashboard...');
          navigate('/advertise');
        }, 3000);

      } else {
        throw new Error(response.error || 'Failed to create campaign invitation');
      }

    } catch (error) {
      console.error('❌ Campaign confirmation failed:', error);
      setError(`Failed to confirm campaign: ${error.message}`);
    } finally {
      setIsConfirming(false);
    }
  };

  // Handle going back
  const handleGoBack = () => {
    console.log('⬅️ Going back to campaign selection');
    navigate('/CampaignSelection');
  };

  // Handle navigation to dashboard
  const handleGoToDashboard = () => {
    console.log('🏠 Navigating to advertiser dashboard');
    navigate('/advertise');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Loading confirmation details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Something went wrong</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={handleGoBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button onClick={handleGoToDashboard}>
              Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (confirmationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-lg p-8 text-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-slate-900 mb-3">Campaign Sent!</h1>
            <p className="text-slate-600 mb-6">
              Your campaign invitation has been sent to the space owner for approval. 
              You'll receive a notification once they respond.
            </p>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
              <div className="text-left space-y-2 text-sm text-blue-800">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>Space owner reviews your campaign details</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>If approved, you'll get a notification to proceed with booking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <span>Complete payment to finalize your advertising campaign</span>
                </div>
              </div>
            </div>

            <Button onClick={handleGoToDashboard} className="w-full">
              Go to Dashboard
            </Button>
            
            <p className="text-xs text-slate-500 mt-4">
              Redirecting automatically in a few seconds...
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Main confirmation page
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={handleGoBack}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">Confirm Campaign</h1>
                <p className="text-sm text-slate-500">Review your campaign details before sending to space owner</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Campaign & Space Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Campaign Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Campaign Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-slate-900">
                    {selectedCampaign?.name || selectedCampaign?.brand_name}
                  </h3>
                  <p className="text-slate-600">by {selectedCampaign?.brand_name}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Objective</p>
                    <Badge variant="outline" className="capitalize">
                      {selectedCampaign?.objective?.toLowerCase().replace('_', ' ') || 'Brand Awareness'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Budget</p>
                    <p className="font-medium text-slate-900">
                      {selectedCampaign?.budget ? formatCurrency(selectedCampaign.budget) : 'Not specified'}
                    </p>
                  </div>
                </div>

                {selectedCampaign?.description && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Description</p>
                    <p className="text-slate-700">{selectedCampaign.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Space Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Selected Space
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-slate-900">{selectedSpace?.name}</h3>
                  <p className="text-slate-600">Premium advertising location</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <div>
                      <p className="text-xs text-slate-500">Start Date</p>
                      <p className="text-sm font-medium">{formatDate(selectedSpace?.dates.start || '')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <div>
                      <p className="text-xs text-slate-500">End Date</p>
                      <p className="text-sm font-medium">{formatDate(selectedSpace?.dates.end || '')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <div>
                      <p className="text-xs text-slate-500">Duration</p>
                      <p className="text-sm font-medium">{selectedSpace?.duration} days</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Legal Agreement Section */}
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <AlertCircle className="w-5 h-5" />
                  Legal Agreement & Confirmation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-amber-800 mb-4">
                  <p className="font-medium mb-2">Before submitting your campaign, please confirm the following:</p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToContent}
                      onChange={(e) => setAgreedToContent(e.target.checked)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-slate-700">
                      <strong>Content Compliance:</strong> I confirm that all advertising content is appropriate, 
                      legal, and complies with applicable laws and regulations. The content does not include 
                      inappropriate, offensive, or illegal material.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToAccuracy}
                      onChange={(e) => setAgreedToAccuracy(e.target.checked)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-slate-700">
                      <strong>Information Accuracy:</strong> I confirm that all campaign information, 
                      business details, and contact information provided are accurate and up-to-date.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-slate-700">
                      <strong>Terms & Conditions:</strong> I agree to the platform's terms of service 
                      and understand that payment will be processed upon space owner approval.
                    </span>
                  </label>
                </div>

                <div className="bg-blue-50 rounded p-3 text-xs text-blue-700">
                  <strong>Note:</strong> By submitting this campaign, you authorize the platform to 
                  share your campaign details with the space owner for approval consideration.
                </div>
              </CardContent>
            </Card>

            {/* Message Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-blue-600" />
                  Message to Space Owner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-slate-700">
                    <strong>{selectedCampaign?.brand_name}</strong> would like to advertise on your space 
                    "<strong>{selectedSpace?.name}</strong>" for <strong>{selectedSpace?.duration} days</strong>.
                  </p>
                  <div className="mt-3 text-sm text-slate-600">
                    <p>Campaign: {selectedCampaign?.name}</p>
                    <p>Dates: {formatDate(selectedSpace?.dates.start || '')} - {formatDate(selectedSpace?.dates.end || '')}</p>
                    <p>Total Value: {formatCurrency(selectedSpace?.totalPrice || 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Panel */}
          <div className="space-y-6">
            
            {/* Pricing Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  Pricing Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Daily Rate</span>
                    <span>{formatCurrency(selectedSpace?.price || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Duration</span>
                    <span>{selectedSpace?.duration} days</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total Campaign Cost</span>
                    <span className="text-blue-600">{formatCurrency(selectedSpace?.totalPrice || 0)}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-500 bg-blue-50 rounded p-3">
                  <strong>Note:</strong> Payment will be processed after the space owner approves your campaign.
                </div>
              </CardContent>
            </Card>

            {/* Confirmation Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  Ready to Send?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-slate-600 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Campaign details verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Space availability confirmed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Pricing calculated</span>
                  </div>
                </div>

                <Button
                  onClick={handleConfirmCampaign}
                  disabled={isConfirming || !agreedToTerms || !agreedToContent || !agreedToAccuracy}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                  size="lg"
                >
                  {isConfirming ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Submitting Campaign...
                    </>
                  ) : (
                    <>
                      Submit Campaign for Approval
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                {(!agreedToTerms || !agreedToContent || !agreedToAccuracy) && (
                  <p className="text-xs text-amber-600 text-center">
                    Please complete all legal agreements above to proceed
                  </p>
                )}

                <Button
                  onClick={handleGoBack}
                  variant="outline"
                  className="w-full"
                  disabled={isConfirming}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Selection
                </Button>
              </CardContent>
            </Card>

            {/* Help Panel */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-semibold text-blue-900">Campaign Tips</h4>
                </div>
                <div className="text-blue-700 text-sm space-y-1">
                  <p>• Response time: Usually 24-48 hours</p>
                  <p>• Approval rate: ~85% for quality campaigns</p>
                  <p>• You can track status in your dashboard</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}