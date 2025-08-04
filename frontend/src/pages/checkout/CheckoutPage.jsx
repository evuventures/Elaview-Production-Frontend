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
  Loader2,
  Building2,
  Clock,
  ShoppingCart
} from 'lucide-react';

import BusinessDetailsModal from './components/BusinessDetailsModal';
import apiClient from '../../api/apiClient';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function CheckoutPage({ cartData, onBack, onSuccess }) {
  const { user } = useUser();
  const { propertyId, spaceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ MOBILE: Add console log for mobile debugging
  useEffect(() => {
    console.log('📱 CHECKOUT PAGE: Mobile viewport check', {
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      isMobile: window.innerWidth < 768
    });
  }, []);

  // ✅ CORE STATE MANAGEMENT
  const [profileLoading, setProfileLoading] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [businessProfile, setBusinessProfile] = useState(null);
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  // ✅ ORDER & PAYMENT STATE
  const [orderData, setOrderData] = useState(null);
  const [isLoadingOrderData, setIsLoadingOrderData] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [isCreatingPaymentIntent, setIsCreatingPaymentIntent] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // ✅ DEBUG LOGGING
  console.log('🔄 CheckoutPage RENDER - Initial props:', {
    cartData: cartData ? 'exists' : 'null/undefined',
    hasOnBack: !!onBack,
    hasOnSuccess: !!onSuccess,
    user: user?.id,
    propertyId,
    spaceId
  });

  // 🏢 BUSINESS PROFILE CHECK - COMPLETELY FIXED
  const checkBusinessProfile = async () => {
    if (!user?.id) {
      console.log('🏢 No user - skipping business profile check');
      return;
    }

    console.log('🏢 === STARTING BUSINESS PROFILE CHECK ===');
    console.log('🏢 Step 1: Setting loading states');
    setProfileLoading(true);
    setCheckoutError(null);

    console.log('🏢 Step 2: Making API call for user:', user.id);
    try {
      const response = await apiClient.getUserBusinessProfile();
      console.log('🏢 Step 3: API Response received:', {
        success: response.success,
        hasData: !!response.data,
        needsProfile: response.needsProfile,
        networkError: response.networkError,
        error: response.error
      });

      if (response.success && response.data) {
        console.log('📝 Step 4a: Existing profile found');
        setBusinessProfile(response.data);
        
        // ✅ COMPLETELY FIXED: Correct field names matching backend response
        const isComplete = response.data.businessName && 
                          response.data.businessIndustry &&           // ✅ FIXED: Was 'industry', now 'businessIndustry'
                          response.data.businessAddress?.street &&   // ✅ FIXED: Was 'address', now 'businessAddress'
                          response.data.businessAddress?.city &&
                          response.data.businessAddress?.state &&
                          response.data.businessAddress?.zipCode;
        
        console.log('📝 Step 4b: Profile completeness check:', {
          hasBusinessName: !!response.data.businessName,
          hasIndustry: !!response.data.businessIndustry,        // ✅ FIXED: Field name
          hasAddress: !!response.data.businessAddress?.street,  // ✅ FIXED: Field name
          hasCity: !!response.data.businessAddress?.city,
          hasState: !!response.data.businessAddress?.state,
          hasZipCode: !!response.data.businessAddress?.zipCode,
          isComplete
        });

        // ✅ ENHANCED: Better logging for debugging
        if (!isComplete) {
          const missingFields = [];
          if (!response.data.businessName) missingFields.push('Business Name');
          if (!response.data.businessIndustry) missingFields.push('Industry');
          if (!response.data.businessAddress?.street) missingFields.push('Street Address');
          if (!response.data.businessAddress?.city) missingFields.push('City');
          if (!response.data.businessAddress?.state) missingFields.push('State');
          if (!response.data.businessAddress?.zipCode) missingFields.push('ZIP Code');
          
          console.log('📋 Missing required fields:', missingFields);
        }

        if (isComplete) {
          console.log('📝 Step 4c: Profile is complete - proceeding');
          setIsProfileComplete(true);
          setShowBusinessModal(false);
          
          // ✅ ENHANCED: Double-check localStorage consistency
          const completionKey = `businessProfile_${user.id}`;
          if (localStorage.getItem(completionKey) !== 'completed') {
            console.log('✅ Updating localStorage to match database state');
            localStorage.setItem(completionKey, 'completed');
            localStorage.setItem(`businessProfileCompletedAt_${user.id}`, new Date().toISOString());
          }
        } else {
          console.log('📝 Step 4d: Profile incomplete - need more info');
          setIsProfileComplete(false);
          setShowBusinessModal(true);
        }
      } else if (response.needsProfile || response.error === 'Business profile not found') {
        console.log('📝 Step 4d: New user or incomplete profile detected');
        setBusinessProfile(null);
        setIsProfileComplete(false);
        console.log('📝 Step 4e: Business modal should now show');
        setShowBusinessModal(true);
      } else if (response.networkError) {
        console.log('📝 Step 4f: Network error occurred');
        setCheckoutError(`Network error: ${response.error}`);
        setIsProfileComplete(false);
        setShowBusinessModal(false);
      } else {
        console.log('📝 Step 4g: Unknown error occurred');
        setCheckoutError(`Error loading profile: ${response.error}`);
        setIsProfileComplete(false);
        setShowBusinessModal(false);
      }

      console.log('🏢 Step 5: Setting profileLoading to false');
    } catch (error) {
      console.error('🏢 Step 6: Unexpected error in business profile check:', error);
      setCheckoutError(`Unexpected error: ${error.message}`);
      setIsProfileComplete(false);
      setShowBusinessModal(false);
    } finally {
      console.log('🏢 Step 7: FINALLY - Setting profileLoading to false');
      setProfileLoading(false);
    }
    console.log('🏢 === BUSINESS PROFILE CHECK COMPLETE ===');
  };

  // 💰 ORDER DATA CALCULATION - HANDLES BOTH CART AND DIRECT BOOKINGS
  const calculateOrderData = async () => {
    console.log('💰 === ORDER DATA CALCULATION TRIGGERED ===');
    
    // Handle cart-based checkout
    if (cartData && Array.isArray(cartData) && cartData.length > 0) {
      console.log('💰 Cart data detected:', { length: cartData.length });
      setOrderData({
        type: 'cart',
        items: cartData,
        total: cartData.reduce((sum, item) => sum + (item.price || 0), 0),
        itemCount: cartData.length
      });
      return;
    }

    // Handle direct booking from URL parameters
    if (propertyId && spaceId) {
      console.log('💰 Direct booking detected from URL:', { propertyId, spaceId });
      setIsLoadingOrderData(true);
      
      try {
        // Fetch space data first
        console.log('💰 Fetching space data...');
        const spaceResponse = await apiClient.get(`/spaces/${spaceId}`);
        
        if (!spaceResponse.success) {
          throw new Error('Failed to load space data');
        }

        const space = spaceResponse.data;
        console.log('💰 Space data loaded:', {
          spaceName: space.name,
          spacePrice: space.baseRate || space.price,
          spaceData: space
        });

        // Try to fetch property data, but handle 404 gracefully
        let property = null;
        let propertyError = null;
        
        try {
          console.log('💰 Attempting to fetch property data...');
          const propertyResponse = await apiClient.get(`/properties/${propertyId}`);
          if (propertyResponse.success) {
            property = propertyResponse.data;
            console.log('💰 Property data loaded:', {
              propertyName: property.name,
              propertyAddress: property.address
            });
          }
        } catch (propError) {
          console.log('💰 Property API failed, using space data as fallback:', propError.message);
          propertyError = propError.message;
          
          // Create fallback property data from space
          property = {
            id: propertyId,
            name: space.propertyName || space.location || `Property for ${space.name}`,
            address: space.address || space.location || 'Address not available',
            // Add any other property fields that might be available in space
            type: space.propertyType || 'Unknown',
            description: `Property containing ${space.name}`
          };
          console.log('💰 Created fallback property data:', property);
        }

        // Get any saved booking configuration from location state
        const bookingConfig = location.state?.bookingConfig || {};
        
        const directOrderData = {
          type: 'direct',
          propertyId,
          spaceId,
          space,
          property,
          bookingConfig,
          total: space.baseRate || space.price || 0,
          itemCount: 1,
          // Flag to indicate if we used fallback property data
          usedFallbackProperty: !!propertyError
        };
        
        console.log('💰 Direct booking order data created:', {
          ...directOrderData,
          spaceName: space.name,
          propertyName: property.name,
          total: directOrderData.total,
          usedFallback: directOrderData.usedFallbackProperty
        });
        
        setOrderData(directOrderData);
        
        // Clear any previous errors since we successfully created order data
        setCheckoutError(null);
        
      } catch (error) {
        console.error('💰 Error loading direct booking data:', error);
        setCheckoutError(`Failed to load booking data: ${error.message}`);
        setOrderData(null);
      } finally {
        setIsLoadingOrderData(false);
      }
      return;
    }

    // No valid data found
    console.log('💰 No valid cart or URL data - setting orderData to null');
    setOrderData(null);
  };

  // 💳 PAYMENT INTENT CREATION
  const createPaymentIntent = async () => {
    if (!isProfileComplete || !orderData || clientSecret || isCreatingPaymentIntent) {
      console.log('💳 Conditions not met - skipping payment intent creation:', {
        isProfileComplete,
        hasOrderData: !!orderData,
        hasClientSecret: !!clientSecret,
        isCreatingPaymentIntent
      });
      return;
    }

    console.log('💳 Creating payment intent...');
    setIsCreatingPaymentIntent(true);

    try {
      const response = await apiClient.post('/checkout/create-payment-intent', {
        orderData,
        businessProfile
      });

      if (response.success) {
        console.log('💳 Payment intent created successfully');
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

  // ✅ BUSINESS PROFILE COMPLETION HANDLER - ENHANCED
  const handleBusinessProfileComplete = async (profileData) => {
    console.log('📝 Business profile completed:', profileData);
    setBusinessProfile(profileData);
    setIsProfileComplete(true);
    setShowBusinessModal(false);
    setCheckoutError(null);
    
    // ✅ ENHANCED: Ensure localStorage is updated
    const completionKey = `businessProfile_${user.id}`;
    localStorage.setItem(completionKey, 'completed');
    localStorage.setItem(`businessProfileCompletedAt_${user.id}`, new Date().toISOString());
    console.log('✅ Profile completion stored in localStorage');
  };

  // ✅ ENHANCED: Better modal close handling
  const handleBusinessModalClose = () => {
    console.log('🚪 Business modal close requested');
    
    // Check if profile is actually complete (might have been updated in localStorage)
    const completionKey = `businessProfile_${user.id}`;
    const hasCompletedProfile = localStorage.getItem(completionKey) === 'completed';
    
    if (hasCompletedProfile) {
      console.log('✅ Profile completion found in localStorage, proceeding');
      setIsProfileComplete(true);
      setShowBusinessModal(false);
      return;
    }
    
    setShowBusinessModal(false);
    if (!isProfileComplete) {
      setCheckoutError('Business profile is required to complete checkout');
    }
  };

  // 🎯 USEEFFECTS
  useEffect(() => {
    console.log('🔄 STATE UPDATE:', {
      profileLoading,
      isProfileComplete,
      orderData: orderData ? 'exists' : 'null',
      showBusinessModal,
      checkoutError: checkoutError || 'none'
    });
  });

  // Business profile check
  useEffect(() => {
    console.log('🔄 Business profile check useEffect triggered:', { user: user?.id });
    if (user?.id) {
      // ✅ ENHANCED: Check localStorage first for quick response
      const completionKey = `businessProfile_${user.id}`;
      const hasCompletedProfile = localStorage.getItem(completionKey) === 'completed';
      
      if (hasCompletedProfile) {
        console.log('⚡ Profile completion found in localStorage, checking database...');
      }
      
      checkBusinessProfile();
    }
  }, [user?.id]);

  // Order data calculation
  useEffect(() => {
    console.log('🔄 Order data calculation useEffect triggered');
    calculateOrderData();
  }, [cartData, propertyId, spaceId, location.state]);

  // Payment intent creation
  useEffect(() => {
    console.log('💳 Payment intent useEffect triggered:', {
      isProfileComplete,
      hasOrderData: !!orderData,
      hasClientSecret: !!clientSecret,
      isCreatingPaymentIntent
    });
    
    if (isProfileComplete && orderData && !clientSecret && !isCreatingPaymentIntent) {
      createPaymentIntent();
    }
  }, [isProfileComplete, orderData, clientSecret, isCreatingPaymentIntent]);

  // 🎨 RENDER LOGIC
  const shouldShowLoading = profileLoading || isLoadingOrderData || (!orderData && !checkoutError);
  const shouldShowBusinessModal = showBusinessModal && !profileLoading;
  const shouldShowCheckout = !profileLoading && !isLoadingOrderData && orderData && isProfileComplete && !paymentSuccess;
  const shouldShowSuccess = paymentSuccess;

  console.log('🔄 RENDER DECISION:', {
    profileLoading,
    isLoadingOrderData,
    orderData: !!orderData,
    shouldShowLoading,
    paymentSuccess,
    showBusinessModal: shouldShowBusinessModal,
    shouldShowCheckout,
    shouldShowSuccess
  });

  if (shouldShowLoading) {
    console.log('🔄 SHOWING LOADING SCREEN because:', {
      profileLoading: profileLoading ? 'true (still loading profile)' : 'false',
      isLoadingOrderData: isLoadingOrderData ? 'true (loading order data)' : 'false',
      orderData: orderData ? 'exists' : 'null (no order data)',
      checkoutError: checkoutError ? `error: ${checkoutError}` : 'no error'
    });
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
          {/* ✅ MOBILE: Header with responsive spacing */}
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 p-2 sm:p-3"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Checkout</h1>
          </div>

          {/* ✅ MOBILE: Error Display with responsive design */}
          {checkoutError && (
            <div className="max-w-6xl mx-auto mb-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-red-800 text-sm sm:text-base">Setup Error</p>
                    <p className="text-sm text-red-700 mt-1">{checkoutError}</p>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setCheckoutError(null);
                    if (profileLoading || !orderData) {
                      checkBusinessProfile();
                      calculateOrderData();
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="mt-3 text-red-600 border-red-200 hover:bg-red-50"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* ✅ MOBILE: Loading Card with responsive design */}
          <div className="max-w-6xl mx-auto">
            <Card className="p-4 sm:p-8">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-blue-600" />
                <div className="text-center">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900">Setting up your checkout...</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {profileLoading && "Loading your business profile..."}
                    {isLoadingOrderData && "Loading booking details..."}
                    {!profileLoading && !isLoadingOrderData && !orderData && "Preparing your order..."}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (shouldShowSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <div className="max-w-md sm:max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
              <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h1>
              <p className="text-slate-600 mb-4 sm:mb-6">Your booking has been confirmed.</p>
              <Button onClick={() => navigate('/dashboard')} className="w-full">
                View Your Bookings
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
        {/* ✅ MOBILE: Header with responsive spacing */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 p-2 sm:p-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Checkout</h1>
        </div>

        {/* Business Details Modal */}
        <AnimatePresence>
          {shouldShowBusinessModal && (
            <BusinessDetailsModal
              isOpen={shouldShowBusinessModal}
              onClose={handleBusinessModalClose}
              onComplete={handleBusinessProfileComplete}
              required={true}
            />
          )}
        </AnimatePresence>

        {/* ✅ MOBILE: Main Checkout Content with responsive layout */}
        {shouldShowCheckout && clientSecret && (
          <Elements 
            stripe={stripePromise} 
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#2563eb',
                }
              }
            }}
          >
            <CheckoutForm 
              orderData={orderData}
              businessProfile={businessProfile}
              onSuccess={() => {
                setPaymentSuccess(true);
                if (onSuccess) onSuccess();
              }}
            />
          </Elements>
        )}
      </div>
    </div>
  );
}

// 💳 PAYMENT FORM COMPONENT - MOBILE RESPONSIVE
function CheckoutForm({ orderData, businessProfile, onSuccess }) {
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
      // Create booking record
      try {
        await apiClient.post('/checkout/confirm-booking', {
          paymentIntentId: paymentIntent.id,
          orderData,
          businessProfile
        });
        onSuccess();
      } catch (err) {
        setPaymentError('Payment succeeded but booking creation failed. Please contact support.');
      }
    }

    setIsProcessing(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* ✅ MOBILE: Responsive grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        
        {/* ✅ MOBILE: Order Summary - Full width on mobile, sidebar on desktop */}
        <div className="order-2 lg:order-1 lg:col-span-1">
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 text-sm sm:text-base">
              {orderData.type === 'direct' ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{orderData.space.name}</p>
                      <p className="text-sm text-slate-600 truncate">{orderData.property.name}</p>
                      <div className="flex items-start gap-1 text-sm text-slate-500 mt-1">
                        <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        <span className="truncate">{orderData.property.address}</span>
                      </div>
                      {orderData.usedFallbackProperty && (
                        <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                          <AlertCircle className="w-3 h-3 flex-shrink-0" />
                          <span>Property details estimated</span>
                        </div>
                      )}
                    </div>
                    <p className="font-medium flex-shrink-0">${orderData.space.baseRate || orderData.space.price}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {orderData.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.name}</p>
                        <p className="text-sm text-slate-600 truncate">{item.description}</p>
                      </div>
                      <p className="font-medium flex-shrink-0">${item.price}</p>
                    </div>
                  ))}
                </div>
              )}
              
              <Separator />
              <div className="flex justify-between items-center font-semibold">
                <span>Total</span>
                <span>${orderData.total}</span>
              </div>
            </CardContent>
          </Card>

          {/* ✅ MOBILE: Business Profile Summary - Responsive */}
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
                    <p className="truncate">{businessProfile.businessAddress.city}, {businessProfile.businessAddress.state} {businessProfile.businessAddress.zipCode}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ✅ MOBILE: Payment Form - Full width on mobile, main content on desktop */}
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
                  className="w-full py-3 sm:py-4"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processing Payment...
                    </>
                  ) : (
                    `Complete Payment - $${orderData.total}`
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;