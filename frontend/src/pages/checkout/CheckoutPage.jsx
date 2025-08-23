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
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Eye
} from 'lucide-react';
import { PageLoader, ButtonLoader } from '@/components/ui/LoadingAnimation';

import BusinessDetailsModal from './components/BusinessDetailsModal';
import apiClient from '../../api/apiClient';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function CheckoutPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ CART STATE - Get cart from navigation state or localStorage
  const [cart, setCart] = useState(() => {
    // First try to get cart from navigation state
    const navigationCart = location.state?.cart;
    if (navigationCart && Array.isArray(navigationCart) && navigationCart.length > 0) {
      console.log('💰 Cart loaded from navigation:', navigationCart);
      return navigationCart;
    }
    
    // Fallback to localStorage
    const savedCart = localStorage.getItem('checkoutCart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        console.log('💰 Cart loaded from localStorage:', parsedCart);
        return parsedCart;
      } catch (e) {
        console.error('Error parsing saved cart:', e);
      }
    }
    
    return [];
  });

  // ✅ CORE STATE MANAGEMENT
  const [profileLoading, setProfileLoading] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [businessProfile, setBusinessProfile] = useState(null);
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  // ✅ ORDER & PAYMENT STATE
  const [orderData, setOrderData] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [isCreatingPaymentIntent, setIsCreatingPaymentIntent] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // ✅ SAVE CART TO LOCALSTORAGE
  useEffect(() => {
    if (cart && cart.length > 0) {
      localStorage.setItem('checkoutCart', JSON.stringify(cart));
    }
  }, [cart]);

  // ✅ CALCULATE ORDER TOTALS
  const calculateOrderTotals = () => {
    if (!cart || cart.length === 0) return { subtotal: 0, platformFee: 0, total: 0 };
    
    const subtotal = cart.reduce((sum, item) => {
      return sum + (item.totalPrice || (item.pricePerDay * item.duration) || 0);
    }, 0);
    
    const platformFee = subtotal * 0.1; // 10% platform fee
    const total = subtotal + platformFee;
    
    return { subtotal, platformFee, total };
  };

  const orderTotals = calculateOrderTotals();

  // ✅ UPDATE CART ITEM QUANTITY
  const updateCartItemDuration = (cartItemId, newDuration) => {
    if (newDuration < 1) return;
    
    setCart(prevCart => prevCart.map(item => {
      if (item.id === cartItemId) {
        const updatedItem = {
          ...item,
          duration: newDuration,
          totalPrice: item.pricePerDay * newDuration
        };
        return updatedItem;
      }
      return item;
    }));
  };

  // ✅ REMOVE ITEM FROM CART
  const removeCartItem = (cartItemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== cartItemId));
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

  // 💰 ORDER DATA CALCULATION
  const calculateOrderData = () => {
    if (!cart || cart.length === 0) {
      setOrderData(null);
      return;
    }

    const orderInfo = {
      type: 'cart',
      items: cart.map(item => ({
        id: item.id,
        spaceId: item.spaceId || item.space?.id,
        spaceName: item.space?.name || item.space?.title || 'Advertising Space',
        propertyName: item.space?.propertyName || 'Property',
        propertyAddress: item.space?.propertyAddress || 'Location',
        duration: item.duration || 30,
        pricePerDay: item.pricePerDay || 0,
        totalPrice: item.totalPrice || 0,
        materialConfiguration: item.materialConfiguration || null
      })),
      ...orderTotals,
      itemCount: cart.length
    };

    console.log('💰 Order data calculated:', orderInfo);
    setOrderData(orderInfo);
  };

  // 💳 PAYMENT INTENT CREATION
  const createPaymentIntent = async () => {
    if (!isProfileComplete || !orderData || clientSecret || isCreatingPaymentIntent) {
      return;
    }

    console.log('💳 Creating payment intent for cart:', orderData);
    setIsCreatingPaymentIntent(true);

    try {
      const response = await apiClient.post('/checkout/create-payment-intent', {
        orderData,
        businessProfile,
        amount: Math.round(orderData.total * 100) // Convert to cents
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
    if (user?.id) {
      checkBusinessProfile();
    }
  }, [user?.id]);

  useEffect(() => {
    calculateOrderData();
  }, [cart]);

  useEffect(() => {
    if (isProfileComplete && orderData && !clientSecret && !isCreatingPaymentIntent) {
      createPaymentIntent();
    }
  }, [isProfileComplete, orderData, clientSecret, isCreatingPaymentIntent]);

  // ✅ NAVIGATION HANDLERS
  const handleBackToShopping = () => {
    // Save cart before navigating back
    localStorage.setItem('checkoutCart', JSON.stringify(cart));
    navigate('/browse');
  };

  // 🎨 RENDER LOGIC
  const shouldShowLoading = profileLoading || (!orderData && cart.length > 0);
  const shouldShowBusinessModal = showBusinessModal && !profileLoading;
  const shouldShowCheckout = !profileLoading && orderData && isProfileComplete && !paymentSuccess;
  const shouldShowSuccess = paymentSuccess;
  const shouldShowEmptyCart = !profileLoading && (!cart || cart.length === 0) && !paymentSuccess;

  // ✅ EMPTY CART STATE
  if (shouldShowEmptyCart) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBackToShopping}
              className="flex items-center gap-2 p-2 sm:p-3"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Checkout</h1>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="p-8 text-center">
              <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Your cart is empty</h3>
              <p className="text-slate-600 mb-6">Add some advertising spaces to your cart to proceed with checkout.</p>
              <Button onClick={handleBackToShopping} className="mx-auto">
                Browse Spaces
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
              onClick={handleBackToShopping}
              className="flex items-center gap-2 p-2 sm:p-3"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Checkout</h1>
          </div>

          <div className="max-w-6xl mx-auto">
            <Card className="p-4 sm:p-8">
              <PageLoader 
                message={profileLoading ? "Loading your business profile..." : "Preparing your order..."}
              />
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ✅ SUCCESS STATE - FIXED TO REDIRECT TO ADVERTISER DASHBOARD
  if (shouldShowSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <div className="max-w-md sm:max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
              <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h1>
              <p className="text-slate-600 mb-4 sm:mb-6">
                Your booking for {cart.length} {cart.length === 1 ? 'space' : 'spaces'} has been confirmed.
              </p>
              {/* ✅ FIXED: Navigate to Advertiser Dashboard instead of Space Owner Dashboard */}
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
            onClick={handleBackToShopping}
            className="flex items-center gap-2 p-2 sm:p-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Shopping</span>
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Checkout ({cart.length} {cart.length === 1 ? 'item' : 'items'})
          </h1>
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
            <CheckoutForm 
              cart={cart}
              orderData={orderData}
              businessProfile={businessProfile}
              updateCartItemDuration={updateCartItemDuration}
              removeCartItem={removeCartItem}
              onSuccess={() => {
                setPaymentSuccess(true);
                // Clear cart from localStorage on success
                localStorage.removeItem('checkoutCart');
              }}
            />
          </Elements>
        )}
      </div>
    </div>
  );
}

// 💳 ENHANCED PAYMENT FORM COMPONENT WITH FULL CART DISPLAY
function CheckoutForm({ cart, orderData, businessProfile, updateCartItemDuration, removeCartItem, onSuccess }) {
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        
        {/* ✅ ORDER SUMMARY - FULL CART DISPLAY */}
        <div className="order-2 lg:order-1 lg:col-span-1">
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                Order Summary ({cart.length} {cart.length === 1 ? 'item' : 'items'})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {/* ✅ CART ITEMS WITH EDIT CAPABILITY */}
              <div className="max-h-96 overflow-y-auto space-y-3">
                {cart.map((item, index) => (
                  <div key={item.id} className="border-b border-slate-100 pb-3 last:border-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {item.space?.name || item.space?.title || 'Advertising Space'}
                        </p>
                        <p className="text-xs text-slate-600 truncate">
                          {item.space?.propertyName || 'Property'}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">
                            {item.space?.propertyAddress || 'Location'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeCartItem(item.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Duration Controls */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600">Duration:</span>
                        <div className="flex items-center gap-1 bg-slate-50 rounded border border-slate-200">
                          <button
                            onClick={() => updateCartItemDuration(item.id, item.duration - 1)}
                            disabled={item.duration <= 1}
                            className="p-1 hover:bg-slate-100 disabled:opacity-50"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 min-w-[40px] text-center">
                            {item.duration} {item.duration === 1 ? 'day' : 'days'}
                          </span>
                          <button
                            onClick={() => updateCartItemDuration(item.id, item.duration + 1)}
                            className="p-1 hover:bg-slate-100"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className="font-medium">${item.totalPrice?.toFixed(2)}</p>
                    </div>
                    
                    <div className="text-xs text-slate-500 mt-1">
                      ${item.pricePerDay?.toFixed(2)}/day × {item.duration} days
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              {/* ✅ PRICING BREAKDOWN */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal:</span>
                  <span>${orderData.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Platform Fee (10%):</span>
                  <span>${orderData.platformFee?.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center font-semibold text-base">
                  <span>Total:</span>
                  <span style={{ color: '#4668AB' }}>${orderData.total?.toFixed(2)}</span>
                </div>
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
                  disabled={!stripe || isProcessing || cart.length === 0}
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
                    `Complete Payment - $${orderData.total?.toFixed(2)}`
                  )}
                </Button>

                {/* Trust Indicators */}
                <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Secure checkout • SSL encrypted • No hidden fees</span>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;