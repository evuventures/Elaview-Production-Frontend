// src/pages/payments/CampaignCheckout.jsx
// ✅ CAMPAIGN CHECKOUT: Handles checkout for approved campaign invitations
// ✅ COMPREHENSIVE: Full payment flow for campaign bookings
// ✅ ENHANCED: Proper error handling and loading states
// ✅ FIXED: Removed BusinessDetailsModal dependency

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  CheckCircle, 
  Calendar, 
  MapPin, 
  Package, 
  DollarSign, 
  CreditCard,
  AlertCircle,
  Building2,
  Clock,
  Target,
  Eye,
  X
} from 'lucide-react';
import { PageLoader, ButtonLoader } from '@/components/ui/LoadingAnimation';
import apiClient from '../../api/apiClient';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// ✅ SIMPLE BUSINESS DETAILS MODAL COMPONENT
function SimpleBusinessDetailsModal({ isOpen, onClose, onComplete, required = true }) {
  const [formData, setFormData] = useState({
    businessName: '',
    businessIndustry: '',
    contactEmail: '',
    contactPhone: '',
    businessAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.businessName || !formData.businessIndustry || 
          !formData.businessAddress.street || !formData.businessAddress.city ||
          !formData.businessAddress.state || !formData.businessAddress.zipCode) {
        throw new Error('Please fill in all required fields');
      }

      const response = await apiClient.post('/profile/business', formData);
      
      if (response.success) {
        onComplete(formData);
      } else {
        throw new Error(response.error || 'Failed to save business profile');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Complete Business Profile</h2>
          {!required && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name *
              </label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your business name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Industry *
              </label>
              <select
                required
                value={formData.businessIndustry}
                onChange={(e) => handleInputChange('businessIndustry', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select industry</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Retail">Retail</option>
                <option value="Food & Beverage">Food & Beverage</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Marketing">Marketing</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="business@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Business Address</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address *
              </label>
              <input
                type="text"
                required
                value={formData.businessAddress.street}
                onChange={(e) => handleInputChange('businessAddress.street', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="123 Main St"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={formData.businessAddress.city}
                  onChange={(e) => handleInputChange('businessAddress.city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="New York"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  required
                  value={formData.businessAddress.state}
                  onChange={(e) => handleInputChange('businessAddress.state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="NY"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.businessAddress.zipCode}
                  onChange={(e) => handleInputChange('businessAddress.zipCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="10001"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            {!required && (
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
              style={{ backgroundColor: '#4668AB' }}
            >
              {isSubmitting ? (
                <>
                  <ButtonLoader size="sm" color="white" />
                  Saving...
                </>
              ) : (
                'Complete Profile'
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function CampaignCheckout() {
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { invitationId } = useParams();

  console.log('🎯 CAMPAIGN CHECKOUT: Loading for invitation ID:', invitationId);

  // ✅ CAMPAIGN INVITATION STATE
  const [invitation, setInvitation] = useState(null);
  const [invitationLoading, setInvitationLoading] = useState(true);
  const [invitationError, setInvitationError] = useState(null);

  // ✅ BUSINESS PROFILE STATE
  const [profileLoading, setProfileLoading] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [businessProfile, setBusinessProfile] = useState(null);
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  // ✅ PAYMENT STATE
  const [clientSecret, setClientSecret] = useState('');
  const [isCreatingPaymentIntent, setIsCreatingPaymentIntent] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // ✅ LOAD CAMPAIGN INVITATION
  const loadCampaignInvitation = async () => {
    if (!invitationId) {
      setInvitationError('No invitation ID provided');
      setInvitationLoading(false);
      return;
    }

    console.log('📡 CAMPAIGN CHECKOUT: Fetching invitation details for:', invitationId);
    
    try {
      const response = await apiClient.getCampaignInvitation(invitationId);
      
      if (response.success) {
        console.log('✅ CAMPAIGN CHECKOUT: Invitation loaded:', response.data);
        setInvitation(response.data);
        
        // Verify this invitation is approved
        if (response.data.status !== 'APPROVED') {
          setInvitationError(`Campaign invitation is ${response.data.status}. Only approved invitations can be checked out.`);
        }
      } else {
        setInvitationError(response.error || 'Failed to load campaign invitation');
      }
    } catch (error) {
      console.error('❌ CAMPAIGN CHECKOUT: Failed to load invitation:', error);
      setInvitationError('Failed to load campaign invitation details');
    } finally {
      setInvitationLoading(false);
    }
  };

  // 🏢 BUSINESS PROFILE CHECK
  const checkBusinessProfile = async () => {
    if (!user?.id) {
      console.log('🏢 No user - skipping business profile check');
      return;
    }

    setProfileLoading(true);
    setCheckoutError(null);

    try {
      const response = await apiClient.getUserBusinessProfile();
      
      if (response.success && response.data) {
        setBusinessProfile(response.data);
        
        const isComplete = response.data.businessName && 
                          response.data.businessIndustry &&
                          response.data.businessAddress?.street &&
                          response.data.businessAddress?.city &&
                          response.data.businessAddress?.state &&
                          response.data.businessAddress?.zipCode;
        
        if (isComplete) {
          setIsProfileComplete(true);
          setShowBusinessModal(false);
        } else {
          setIsProfileComplete(false);
          setShowBusinessModal(true);
        }
      } else if (response.needsProfile || response.error === 'Business profile not found') {
        setBusinessProfile(null);
        setIsProfileComplete(false);
        setShowBusinessModal(true);
      } else {
        setCheckoutError(`Error loading profile: ${response.error}`);
        setIsProfileComplete(false);
        setShowBusinessModal(false);
      }
    } catch (error) {
      console.error('🏢 Error in business profile check:', error);
      setCheckoutError(`Unexpected error: ${error.message}`);
      setIsProfileComplete(false);
      setShowBusinessModal(false);
    } finally {
      setProfileLoading(false);
    }
  };

  // 💳 PAYMENT INTENT CREATION
  const createPaymentIntent = async () => {
    if (!isProfileComplete || !invitation || clientSecret || isCreatingPaymentIntent) {
      return;
    }

    console.log('💳 Creating payment intent for campaign invitation:', invitation.id);
    setIsCreatingPaymentIntent(true);

    try {
      const response = await apiClient.post('/checkout/create-campaign-payment-intent', {
        invitationId: invitation.id,
        businessProfile,
        amount: Math.round(invitation.total_price * 100) // Convert to cents
      });

      if (response.success) {
        console.log('💳 Campaign payment intent created successfully');
        setClientSecret(response.data.clientSecret);
      } else {
        throw new Error(response.error || 'Failed to create payment intent');
      }
    } catch (error) {
      console.error('💳 Payment intent creation failed:', error);
      setCheckoutError(`Payment setup failed: ${error.message}`);
    } finally {
      setIsCreatingPaymentIntent(false);
    }
  };

  // ✅ BUSINESS PROFILE COMPLETION HANDLER
  const handleBusinessProfileComplete = async (profileData) => {
    console.log('📝 Business profile completed:', profileData);
    setBusinessProfile(profileData);
    setIsProfileComplete(true);
    setShowBusinessModal(false);
    setCheckoutError(null);
  };

  const handleBusinessModalClose = () => {
    setShowBusinessModal(false);
    if (!isProfileComplete) {
      setCheckoutError('Business profile is required to complete checkout');
    }
  };

  // 🎯 USEEFFECTS
  useEffect(() => {
    loadCampaignInvitation();
  }, [invitationId]);

  useEffect(() => {
    if (user?.id) {
      checkBusinessProfile();
    }
  }, [user?.id]);

  useEffect(() => {
    if (isProfileComplete && invitation && !clientSecret && !isCreatingPaymentIntent) {
      createPaymentIntent();
    }
  }, [isProfileComplete, invitation, clientSecret, isCreatingPaymentIntent]);

  // ✅ NAVIGATION HANDLERS
  const handleBackToAdvertiser = () => {
    navigate('/advertise');
  };

  // 🎨 RENDER LOGIC
  const shouldShowLoading = invitationLoading || profileLoading || (!invitation && !invitationError);
  const shouldShowBusinessModal = showBusinessModal && !shouldShowLoading;
  const shouldShowCheckout = !shouldShowLoading && invitation && isProfileComplete && !paymentSuccess && !invitationError;
  const shouldShowSuccess = paymentSuccess;
  const shouldShowError = invitationError || (!shouldShowLoading && !invitation && !paymentSuccess);

  // ✅ ERROR STATE
  if (shouldShowError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBackToAdvertiser}
              className="flex items-center gap-2 p-2 sm:p-3"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Campaign Checkout</h1>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="p-8 text-center">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Unable to Load Campaign</h3>
              <p className="text-slate-600 mb-6">
                {invitationError || 'We encountered an error loading your campaign invitation.'}
              </p>
              <Button onClick={handleBackToAdvertiser} className="mx-auto">
                Back to Campaigns
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ✅ LOADING STATE
  if (shouldShowLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBackToAdvertiser}
              className="flex items-center gap-2 p-2 sm:p-3"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Campaign Checkout</h1>
          </div>

          <div className="max-w-6xl mx-auto">
            <Card className="p-4 sm:p-8">
              <PageLoader 
                message={
                  invitationLoading ? "Loading campaign details..." :
                  profileLoading ? "Loading your business profile..." : 
                  "Preparing your checkout..."
                }
              />
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ✅ SUCCESS STATE
  if (shouldShowSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <div className="max-w-md sm:max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
              <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Campaign Booked Successfully!</h1>
              <p className="text-slate-600 mb-4 sm:mb-6">
                Your campaign for "{invitation?.campaign_data?.name || 'Your Campaign'}" has been booked and payment confirmed.
              </p>
              <Button 
                onClick={() => navigate('/advertise')} 
                className="w-full"
              >
                View Your Campaigns
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* ✅ HEADER */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBackToAdvertiser}
            className="flex items-center gap-2 p-2 sm:p-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Campaigns</span>
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Campaign Checkout
          </h1>
        </div>

        {/* Business Details Modal */}
        <AnimatePresence>
          {shouldShowBusinessModal && (
            <SimpleBusinessDetailsModal
              isOpen={shouldShowBusinessModal}
              onClose={handleBusinessModalClose}
              onComplete={handleBusinessProfileComplete}
              required={true}
            />
          )}
        </AnimatePresence>

        {/* ✅ MAIN CHECKOUT CONTENT */}
        {shouldShowCheckout && clientSecret && (
          <Elements 
            stripe={stripePromise} 
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#4668AB',
                }
              }
            }}
          >
            <CampaignCheckoutForm 
              invitation={invitation}
              businessProfile={businessProfile}
              onSuccess={() => setPaymentSuccess(true)}
            />
          </Elements>
        )}
      </div>
    </div>
  );
}

// 💳 CAMPAIGN PAYMENT FORM COMPONENT
function CampaignCheckoutForm({ invitation, businessProfile, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      setPaymentError(error.message);
    } else if (paymentIntent.status === 'succeeded') {
      try {
        await apiClient.post('/checkout/confirm-campaign-booking', {
          paymentIntentId: paymentIntent.id,
          invitationId: invitation.id,
          businessProfile
        });
        onSuccess();
      } catch (err) {
        setPaymentError('Payment succeeded but booking creation failed. Please contact support.');
      }
    }

    setIsProcessing(false);
  };

  // Format dates
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        
        {/* ✅ CAMPAIGN SUMMARY */}
        <div className="order-2 lg:order-1 lg:col-span-1">
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                Campaign Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {/* Campaign Info */}
              <div>
                <h3 className="font-semibold text-sm mb-2">
                  {invitation.campaign_data?.name || 'Your Campaign'}
                </h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">Space Name</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 flex-shrink-0" />
                    <span>{formatDate(invitation.start_date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    <span>{invitation.duration} days</span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Campaign Objective */}
              {invitation.campaign_data?.objective && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">OBJECTIVE</p>
                  <p className="text-sm">{invitation.campaign_data.objective.replace(/_/g, ' ')}</p>
                </div>
              )}
              
              <Separator />
              
              {/* Pricing */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Campaign Fee:</span>
                  <span>${invitation.total_price?.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center font-semibold text-base">
                  <span>Total:</span>
                  <span style={{ color: '#4668AB' }}>${invitation.total_price?.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ✅ SPACE OWNER APPROVAL */}
          <Card className="mt-4">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                Approved by Space Owner
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <p className="text-green-700 font-medium">✓ Campaign Approved</p>
                <p className="text-slate-600">
                  {invitation.response || 'The space owner has approved your campaign request.'}
                </p>
                {invitation.response_date && (
                  <p className="text-xs text-slate-500 mt-2">
                    Approved on {formatDate(invitation.response_date)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ✅ BUSINESS PROFILE SUMMARY */}
          <Card className="mt-4">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
                Billing Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <p className="font-medium truncate">{businessProfile.businessName}</p>
                <p className="text-slate-600 truncate">{businessProfile.businessIndustry}</p>
                {businessProfile.businessAddress && (
                  <div className="text-slate-600">
                    <p className="truncate">{businessProfile.businessAddress.street}</p>
                    <p className="truncate">
                      {businessProfile.businessAddress.city}, {businessProfile.businessAddress.state} {businessProfile.businessAddress.zipCode}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ✅ PAYMENT FORM */}
        <div className="order-1 lg:order-2 lg:col-span-2">
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <PaymentElement />
                
                {paymentError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-red-800 text-sm sm:text-base">{paymentError}</p>
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={!stripe || isProcessing}
                  className="w-full py-3 sm:py-4 text-white"
                  style={{ 
                    backgroundColor: '#4668AB',
                    borderColor: '#4668AB'
                  }}
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <ButtonLoader size="sm" color="white" />
                      Processing Payment...
                    </>
                  ) : (
                    `Complete Campaign Booking - $${invitation.total_price?.toFixed(2)}`
                  )}
                </Button>

                {/* Trust Indicators */}
                <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Secure checkout • SSL encrypted • Campaign approved</span>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default CampaignCheckout;