// src/pages/TEMPUserJourney/AdvertiserConfirmationPage.tsx
// ✅ FIXED: Updated to work with actual database schema and API
// ✅ ENHANCED: Professional design with real data integration

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, CheckCircle2, Calendar, MapPin, Building2, 
  DollarSign, Clock, Target, Users, AlertCircle, Loader2,
  ChevronRight, Sparkles, Send, Eye, Edit3, Package,
  TrendingUp, BarChart3, Zap, Copy, RefreshCw, ChevronDown,
  Bell, CreditCard, Compass, HelpCircle, BookOpen,
  Video, MessageCircle, Phone, Mail, Headphones, Shield,
  Monitor, ChevronLeft, Info, ExternalLink
} from "lucide-react";
import apiClient from '@/api/apiClient';
import CampaignSuccessPage from './CampaignSuccessPage';

// Types matching your database schema
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
  spaceCategory?: string;
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

interface ErrorDetails {
  message: string;
  details?: any;
  status?: number;
  endpoint?: string;
  requestData?: any;
  validationErrors?: Array<{
    field: string;
    message: string;
    value?: any;
    expected?: any;
  }>;
  timestamp?: string;
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

// Error display component
const ErrorDetailsComponent = ({ errorDetails, onRetry, onCopyDetails }: {
  errorDetails: ErrorDetails;
  onRetry?: () => void;
  onCopyDetails?: () => void;
}) => {
  const [showFullDetails, setShowFullDetails] = useState(false);

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-900">
          <AlertCircle className="w-5 h-5" />
          Campaign Invitation Failed
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white rounded p-3 border-l-4 border-l-red-400">
          <p className="font-medium text-red-900 mb-1">Error Message:</p>
          <p className="text-red-800">{errorDetails.message}</p>
          {errorDetails.status && (
            <p className="text-sm text-red-600 mt-1">
              HTTP Status: {errorDetails.status}
              {errorDetails.endpoint && ` (${errorDetails.endpoint})`}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          {onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
          <Button
            onClick={() => setShowFullDetails(!showFullDetails)}
            variant="outline"
            size="sm"
          >
            {showFullDetails ? 'Hide' : 'Show'} Technical Details
          </Button>
          {onCopyDetails && (
            <Button onClick={onCopyDetails} variant="outline" size="sm">
              <Copy className="w-4 h-4 mr-2" />
              Copy Error Info
            </Button>
          )}
        </div>

        {showFullDetails && (
          <div className="bg-slate-100 rounded p-3 text-xs font-mono">
            <p className="font-bold mb-2">Technical Details:</p>
            <div className="whitespace-pre-wrap text-slate-700">
              {JSON.stringify(errorDetails, null, 2)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function AdvertiserConfirmationPage() {
  const navigate = useNavigate();
  const { user } = useUser();

  // State management
  const [selectedSpaces, setSelectedSpaces] = useState<SelectedSpace[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<SelectedCampaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<ErrorDetails | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmationSuccess, setConfirmationSuccess] = useState(false);
  
  // Legal agreement state
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToContent, setAgreedToContent] = useState(false);
  const [agreedToAccuracy, setAgreedToAccuracy] = useState(false);

  // Component mount and initialization
  useEffect(() => {
    console.log('🎯 AdvertiserConfirmationPage component mounted');
    console.log('👤 Current user:', user?.id);
    initializePage();
  }, []);

  // Initialize page data
  const initializePage = async () => {
    try {
      console.log('🔄 Initializing AdvertiserConfirmationPage...');
      
      // Get data from sessionStorage - handle both old and new format
      const spacesDataRaw = sessionStorage.getItem('selectedSpaces') || sessionStorage.getItem('selectedSpace');
      const campaignDataRaw = sessionStorage.getItem('selectedCampaign');
      
      console.log('📊 Raw session data:');
      console.log('  Spaces:', spacesDataRaw);
      console.log('  Campaign:', campaignDataRaw);
      
      if (!spacesDataRaw || !campaignDataRaw) {
        setError('Missing selection data. Please go back and select spaces and a campaign.');
        setIsLoading(false);
        return;
      }

      // Parse spaces data
      let spacesData: SelectedSpace[];
      const parsedSpacesData = JSON.parse(spacesDataRaw);
      
      if (Array.isArray(parsedSpacesData)) {
        spacesData = parsedSpacesData;
      } else {
        // Convert single space to array
        spacesData = [parsedSpacesData];
      }
      
      const campaignData = JSON.parse(campaignDataRaw);
      
      console.log('✅ Parsed data:');
      console.log('  Spaces:', spacesData);
      console.log('  Campaign:', campaignData);
      
      setSelectedSpaces(spacesData);
      setSelectedCampaign(campaignData);
      setIsLoading(false);

    } catch (error) {
      console.error('❌ Error initializing page:', error);
      setError('Failed to load confirmation data. Please try again.');
      setIsLoading(false);
    }
  };

  // Calculate totals
  const totalCost = selectedSpaces.reduce((sum, space) => sum + (space.totalPrice || (space.baseRate || 0) * space.duration), 0);
  const totalDuration = selectedSpaces.reduce((sum, space) => sum + space.duration, 0);

  // Handle campaign confirmation
  const handleConfirmCampaign = async () => {
    if (!selectedSpaces.length || !selectedCampaign || !user?.id) {
      setError('Missing required data. Please try again.');
      return;
    }

    if (!agreedToTerms || !agreedToContent || !agreedToAccuracy) {
      setError('Please complete all required agreements before proceeding.');
      return;
    }

    setIsConfirming(true);
    setError(null);
    setErrorDetails(null);

    try {
      // Create invitation for each space (in real app, you might want to batch these)
      const invitationPromises = selectedSpaces.map(async (space) => {
        const invitationData = {
          campaignId: selectedCampaign.id,
          spaceId: space.id,
          propertyId: space.propertyId || space.id,
          advertiserId: user.id,
          message: `${selectedCampaign.brand_name} would like to advertise on your space "${space.name}" for ${space.duration} days.`,
          totalPrice: space.totalPrice || (space.baseRate || 0) * space.duration,
          duration: space.duration,
          startDate: space.dates.start,
          endDate: space.dates.end,
          campaignDetails: {
            name: selectedCampaign.name,
            brand_name: selectedCampaign.brand_name,
            objective: selectedCampaign.objective,
            description: selectedCampaign.description,
            budget: selectedCampaign.budget,
            target_demographics: selectedCampaign.target_demographics
          }
        };

        console.log('📤 Sending invitation for space:', space.name);
        console.log('📋 Invitation data:', invitationData);

        return apiClient.createCampaignInvitation(invitationData);
      });

      const results = await Promise.all(invitationPromises);
      
      // Check if all invitations were successful
      const failedInvitations = results.filter(result => !result.success);
      
      if (failedInvitations.length > 0) {
        console.error('❌ Some invitations failed:', failedInvitations);
        throw new Error(`Failed to send ${failedInvitations.length} of ${results.length} invitations`);
      }

      console.log('✅ All campaign invitations sent successfully');

      // Store success data
      sessionStorage.setItem('campaignInvitations', JSON.stringify({
        invitationIds: results.map(r => r.data?.invitationId).filter(Boolean),
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        totalInvitations: results.length
      }));

      setConfirmationSuccess(true);

    } catch (error: any) {
      console.error('❌ Campaign confirmation failed:', error);
      
      let errorMessage = error.message || 'An unexpected error occurred';
      let details = null;
      
      // Extract detailed error info if available
      if (error.response) {
        details = error.response;
        if (error.response.details) {
          errorMessage = error.response.details.summary || error.response.message || errorMessage;
        }
      }
      
      setError(errorMessage);
      setErrorDetails({
        message: errorMessage,
        status: error.status,
        endpoint: error.endpoint,
        requestData: error.requestData,
        details: details,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsConfirming(false);
    }
  };

  // Navigation handlers
  const handleGoBack = () => navigate('/CampaignSelection');
  const handleGoToDashboard = () => navigate('/advertise');
  const handleCreateAnother = () => navigate('/CampaignSelection');

  // Copy error details
  const handleCopyErrorDetails = async () => {
    if (!errorDetails) return;
    try {
      const errorText = JSON.stringify(errorDetails, null, 2);
      await navigator.clipboard.writeText(errorText);
      alert('Error details copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy error details:', error);
    }
  };

  // Retry function
  const handleRetry = () => {
    setError(null);
    setErrorDetails(null);
    handleConfirmCampaign();
  };

  // Check if all legal agreements are completed
  const allAgreementsCompleted = agreedToTerms && agreedToContent && agreedToAccuracy;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading confirmation details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !isConfirming) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGoBack}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="font-medium">Back</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Campaign Error</h1>
                <p className="text-sm text-gray-600">There was an issue with your campaign invitation</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-8">
          {errorDetails ? (
            <ErrorDetailsComponent
              errorDetails={errorDetails}
              onRetry={selectedSpaces.length && selectedCampaign ? handleRetry : undefined}
              onCopyDetails={handleCopyErrorDetails}
            />
          ) : (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={handleGoBack} variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                  </Button>
                  <Button onClick={handleGoToDashboard}>Dashboard</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    );
  }

  // Success state - render separate component
  if (confirmationSuccess && selectedSpaces.length && selectedCampaign) {
    return (
      <CampaignSuccessPage
        selectedSpaces={selectedSpaces}
        selectedCampaign={selectedCampaign}
        user={user}
        onGoToDashboard={handleGoToDashboard}
        onCreateAnother={handleCreateAnother}
        totalCost={totalCost}
      />
    );
  }

  // Main confirmation page
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleGoBack}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="font-medium">Back</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Confirm Campaign</h1>
                <p className="text-sm text-gray-600">Review your campaign details before sending to space owners</p>
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
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <span className="text-sm font-medium text-gray-900">Confirm & Submit</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Review & Agreement */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Campaign Details Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center mr-3">
                  <Target className="text-blue-600 w-6 h-6" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Campaign Details</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{selectedCampaign?.name}</h3>
                      <Badge variant="outline" className="capitalize bg-green-50 text-green-700 border-green-200">
                        {selectedCampaign?.objective?.toLowerCase().replace('_', ' ') || 'Brand Awareness'}
                      </Badge>
                    </div>
                    <p className="text-gray-600">
                      {selectedCampaign?.description || `Promoting ${selectedCampaign?.brand_name} with focus on brand awareness and market reach.`}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Budget</label>
                      <div className="text-lg font-semibold text-gray-900">
                        {selectedCampaign?.budget ? formatCurrency(selectedCampaign.budget) : 'Not specified'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                      <div className="text-sm text-gray-600">{selectedCampaign?.brand_name}</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <BarChart3 className="text-blue-600 w-5 h-5 mr-2" />
                    <span className="font-medium text-gray-900">Campaign Metrics</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Total Spaces</div>
                      <div className="font-semibold">{selectedSpaces.length}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Total Duration</div>
                      <div className="font-semibold">{totalDuration} days</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Est. Impressions</div>
                      <div className="font-semibold">{(selectedSpaces.length * 50000).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Coverage</div>
                      <div className="font-semibold">{selectedSpaces.length > 1 ? 'Multi-location' : 'Single location'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Spaces Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center mr-3">
                  <MapPin className="text-blue-600 w-6 h-6" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Selected Spaces ({selectedSpaces.length})</h2>
              </div>
              
              <div className="space-y-4">
                {selectedSpaces.map((space, index) => (
                  <div key={space.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{space.name}</h3>
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{space.city}{space.state ? `, ${space.state}` : ''}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-gray-500">Duration</div>
                            <div className="font-medium">{space.duration} days</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Daily Rate</div>
                            <div className="font-medium">{formatCurrency(space.baseRate || 0)}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Total Cost</div>
                            <div className="font-medium text-blue-600">{formatCurrency(space.totalPrice || (space.baseRate || 0) * space.duration)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {formatDate(space.dates.start)} - {formatDate(space.dates.end)}
                        </span>
                        <span className="text-gray-600">
                          {space.type || space.surfaceType || 'Physical space'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Legal Agreement Section */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-lg bg-amber-200 flex items-center justify-center mr-3">
                  <AlertCircle className="text-amber-700 w-6 h-6" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Legal Agreement & Confirmation</h2>
              </div>
              
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-4 border border-amber-300">
                  <div className="flex items-start">
                    <input 
                      type="checkbox" 
                      id="content-compliance"
                      checked={agreedToContent}
                      onChange={(e) => setAgreedToContent(e.target.checked)}
                      className="mt-1 mr-4 w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <div className="flex-1">
                      <label htmlFor="content-compliance" className="font-semibold text-gray-900 cursor-pointer">Content Compliance</label>
                      <p className="text-sm text-gray-700 mt-1">I confirm that all advertising content is appropriate, legal, and complies with applicable laws. Content does not include inappropriate, offensive, or illegal material.</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-amber-300">
                  <div className="flex items-start">
                    <input 
                      type="checkbox" 
                      id="information-accuracy"
                      checked={agreedToAccuracy}
                      onChange={(e) => setAgreedToAccuracy(e.target.checked)}
                      className="mt-1 mr-4 w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <div className="flex-1">
                      <label htmlFor="information-accuracy" className="font-semibold text-gray-900 cursor-pointer">Information Accuracy</label>
                      <p className="text-sm text-gray-700 mt-1">I confirm that all campaign information, business details, and contact information provided are accurate and up-to-date.</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-amber-300">
                  <div className="flex items-start">
                    <input 
                      type="checkbox" 
                      id="terms-conditions"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1 mr-4 w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <div className="flex-1">
                      <label htmlFor="terms-conditions" className="font-semibold text-gray-900 cursor-pointer">Terms & Conditions</label>
                      <p className="text-sm text-gray-700 mt-1">I agree to the platform's terms of service and understand that payment will be processed upon space owner approval.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Action Panel */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Pricing Summary Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center mr-3">
                  <DollarSign className="text-blue-600 w-6 h-6" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Pricing Summary</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Spaces:</span>
                  <span className="font-medium">{selectedSpaces.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Duration:</span>
                  <span className="font-medium">{totalDuration} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(totalCost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Platform Fee (8%):</span>
                  <span className="font-medium">{formatCurrency(totalCost * 0.08)}</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">Total Campaign Cost:</span>
                  <span className="text-2xl font-bold text-blue-600">{formatCurrency(totalCost)}</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <CreditCard className="text-blue-600 w-5 h-5 mr-2 mt-0.5" />
                  <div className="text-xs text-blue-800">
                    <strong>Payment Terms:</strong> Payment processed after space owner approval. You'll be notified before any charges.
                  </div>
                </div>
              </div>
            </div>

            {/* Action Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mr-3">
                  <Sparkles className="text-green-600 w-6 h-6" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Ready to Send?</h2>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="text-green-500 w-5 h-5 mr-3" />
                  <span className="text-gray-700">Campaign details verified</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="text-green-500 w-5 h-5 mr-3" />
                  <span className="text-gray-700">{selectedSpaces.length} space(s) selected</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="text-green-500 w-5 h-5 mr-3" />
                  <span className="text-gray-700">Pricing calculated</span>
                </div>
                <div className="flex items-center text-sm">
                  {allAgreementsCompleted ? (
                    <CheckCircle2 className="text-green-500 w-5 h-5 mr-3" />
                  ) : (
                    <AlertCircle className="text-red-500 w-5 h-5 mr-3" />
                  )}
                  <span className="text-gray-700">
                    {allAgreementsCompleted ? 'Legal agreements completed' : 'Legal agreements pending'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={handleConfirmCampaign}
                  disabled={!allAgreementsCompleted || isConfirming}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
                    allAgreementsCompleted && !isConfirming
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isConfirming ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Submitting Campaign...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Campaign for Approval
                    </>
                  )}
                </button>
                
                <button 
                  onClick={handleGoBack}
                  className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
                  disabled={isConfirming}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Selection
                </button>
              </div>
              
              <div className="mt-4 text-xs text-gray-600 text-center">
                By clicking submit, you agree to all terms and conditions above
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}