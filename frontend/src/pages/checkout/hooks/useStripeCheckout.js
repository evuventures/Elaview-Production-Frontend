// src/pages/checkout/hooks/useStripeCheckout.js
// ✅ STEP 5: Stripe checkout management hook
// Handles payment intent creation, payment processing, and payment state

import { useState, useCallback, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import apiClient from '../../../api/apiClient';

/**
 * Custom hook for managing Stripe checkout process
 * Handles payment intent creation, payment processing, and state management
 */
export function useStripeCheckout() {
  const { user } = useUser();
  const stripe = useStripe();
  const elements = useElements();
  
  // Payment state
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  /**
   * Create Stripe payment intent
   * Called when user proceeds to checkout with validated order data
   */
  const createPaymentIntent = useCallback(async (orderData, businessProfile) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    if (!orderData?.items || orderData.items.length === 0) {
      throw new Error('No items in order');
    }

    setIsCreatingIntent(true);
    setPaymentError(null);
    setPaymentSuccess(false);

    try {
      console.log('💳 Creating payment intent:', {
        userId: user.id,
        itemCount: orderData.items.length,
        totalAmount: orderData.total
      });

      // Calculate total amount in cents (Stripe expects cents)
      const amountInCents = Math.round(orderData.total * 100);

      if (amountInCents <= 0) {
        throw new Error('Invalid order amount');
      }

      // Call API to create payment intent
      const response = await apiClient.createPaymentIntent({
        amount: amountInCents,
        currency: 'usd',
        orderData: {
          items: orderData.items.map(item => ({
            spaceId: item.id || item.spaceId,
            spaceName: item.spaceName || item.name || 'Advertising Space',
            dates: item.dates,
            pricing: item.pricing,
            materialConfiguration: item.materialConfiguration
          }))
        },
        businessProfile: businessProfile
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to create payment intent');
      }

      const { clientSecret: secret, paymentIntentId, amount, currency } = response.data;

      console.log('✅ Payment intent created:', {
        paymentIntentId,
        amount: amount / 100, // Convert back to dollars for logging
        currency
      });

      // Set payment intent data
      setClientSecret(secret);
      setPaymentIntent({
        id: paymentIntentId,
        amount: amount,
        currency: currency,
        status: 'requires_payment_method'
      });

      return {
        success: true,
        clientSecret: secret,
        paymentIntentId: paymentIntentId
      };

    } catch (error) {
      console.error('❌ Payment intent creation failed:', error);
      
      const errorMessage = error.message || 'Failed to create payment intent';
      setPaymentError(errorMessage);
      
      throw new Error(errorMessage);
    } finally {
      setIsCreatingIntent(false);
    }
  }, [user?.id]);

  /**
   * Process payment using Stripe Elements
   * Called when user clicks "Complete Payment" button
   */
  const processPayment = useCallback(async (confirmationData = {}) => {
    if (!stripe || !elements) {
      throw new Error('Stripe not loaded');
    }

    if (!clientSecret) {
      throw new Error('No payment intent created');
    }

    setIsProcessingPayment(true);
    setPaymentError(null);

    try {
      console.log('💳 Processing payment...');

      // Confirm payment with Stripe
      const { error, paymentIntent: confirmedPaymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
          ...confirmationData
        },
        redirect: 'if_required' // Important: prevents redirect for embedded checkout
      });

      if (error) {
        console.error('❌ Payment confirmation failed:', error);
        
        let userFriendlyMessage = 'Payment failed. Please try again.';
        
        // Provide specific error messages for common issues
        switch (error.type) {
          case 'card_error':
            userFriendlyMessage = error.message || 'Your card was declined.';
            break;
          case 'validation_error':
            userFriendlyMessage = 'Please check your payment information and try again.';
            break;
          case 'api_connection_error':
            userFriendlyMessage = 'Network error. Please check your connection and try again.';
            break;
          case 'rate_limit_error':
            userFriendlyMessage = 'Too many requests. Please wait a moment and try again.';
            break;
          case 'authentication_error':
          case 'api_error':
            userFriendlyMessage = 'Payment processing error. Please try again or contact support.';
            break;
        }
        
        setPaymentError(userFriendlyMessage);
        throw new Error(userFriendlyMessage);
      }

      if (confirmedPaymentIntent && confirmedPaymentIntent.status === 'succeeded') {
        console.log('✅ Payment successful:', confirmedPaymentIntent.id);
        
        setPaymentSuccess(true);
        setPaymentIntent(confirmedPaymentIntent);
        
        return {
          success: true,
          paymentIntent: confirmedPaymentIntent
        };
      } else {
        const status = confirmedPaymentIntent?.status || 'unknown';
        console.log(`⚠️ Payment status: ${status}`);
        
        if (status === 'processing') {
          // Payment is being processed
          setPaymentError('Payment is being processed. Please wait...');
          return {
            success: false,
            paymentIntent: confirmedPaymentIntent,
            status: 'processing'
          };
        } else if (status === 'requires_action') {
          // Additional authentication required
          setPaymentError('Additional authentication required. Please complete the verification.');
          return {
            success: false,
            paymentIntent: confirmedPaymentIntent,
            status: 'requires_action'
          };
        } else {
          throw new Error(`Payment not completed. Status: ${status}`);
        }
      }

    } catch (error) {
      console.error('❌ Payment processing error:', error);
      
      if (!paymentError) { // Only set if not already set above
        setPaymentError(error.message || 'Payment processing failed');
      }
      
      throw error;
    } finally {
      setIsProcessingPayment(false);
    }
  }, [stripe, elements, clientSecret, paymentError]);

  /**
   * Get payment status for a specific payment intent
   * Useful for polling payment status or debugging
   */
  const getPaymentStatus = useCallback(async (paymentIntentId) => {
    try {
      const response = await apiClient.getPaymentIntentStatus(paymentIntentId);
      
      if (response.success) {
        return {
          success: true,
          status: response.data.status,
          paymentIntent: response.data
        };
      } else {
        throw new Error(response.error || 'Failed to get payment status');
      }
    } catch (error) {
      console.error('❌ Error getting payment status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }, []);

  /**
   * Clear payment state (useful for cleanup or retries)
   */
  const clearPaymentState = useCallback(() => {
    setClientSecret(null);
    setPaymentIntent(null);
    setPaymentError(null);
    setPaymentSuccess(false);
    setIsCreatingIntent(false);
    setIsProcessingPayment(false);
  }, []);

  /**
   * Retry payment intent creation
   * Useful when initial creation fails
   */
  const retryPaymentIntent = useCallback(async (orderData, businessProfile) => {
    clearPaymentState();
    return await createPaymentIntent(orderData, businessProfile);
  }, [createPaymentIntent, clearPaymentState]);

  /**
   * Format amount for display (converts cents to dollars)
   */
  const formatAmount = useCallback((amountInCents, currency = 'USD') => {
    const amount = amountInCents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  }, []);

  /**
   * Validate payment readiness
   * Checks if all required components are ready for payment
   */
  const validatePaymentReadiness = useCallback(() => {
    const errors = [];

    if (!stripe) {
      errors.push('Stripe not loaded');
    }

    if (!elements) {
      errors.push('Payment form not loaded');
    }

    if (!clientSecret) {
      errors.push('Payment intent not created');
    }

    if (!user?.id) {
      errors.push('User not authenticated');
    }

    return {
      isReady: errors.length === 0,
      errors: errors
    };
  }, [stripe, elements, clientSecret, user?.id]);

  // Auto-clear error after some time
  useEffect(() => {
    if (paymentError) {
      const timer = setTimeout(() => {
        setPaymentError(null);
      }, 10000); // Clear error after 10 seconds

      return () => clearTimeout(timer);
    }
  }, [paymentError]);

  return {
    // State
    clientSecret,
    paymentIntent,
    isCreatingIntent,
    isProcessingPayment,
    paymentError,
    paymentSuccess,
    
    // Actions
    createPaymentIntent,
    processPayment,
    clearPaymentState,
    retryPaymentIntent,
    
    // Utilities
    getPaymentStatus,
    formatAmount,
    validatePaymentReadiness,
    
    // Status helpers
    hasPaymentIntent: !!clientSecret,
    isPaymentReady: !!clientSecret && !!stripe && !!elements,
    isLoading: isCreatingIntent || isProcessingPayment,
    hasError: !!paymentError,
    
    // Stripe objects (for custom implementations)
    stripe,
    elements
  };
}

/**
 * Standalone utility function to validate order data for payment
 * Useful for pre-payment validation
 */
export function validateOrderForPayment(orderData) {
  const errors = [];

  if (!orderData) {
    errors.push('No order data provided');
    return { isValid: false, errors };
  }

  if (!orderData.items || orderData.items.length === 0) {
    errors.push('No items in order');
  }

  if (!orderData.total || orderData.total <= 0) {
    errors.push('Invalid order total');
  }

  // Validate each item
  orderData.items?.forEach((item, index) => {
    const itemNum = index + 1;
    
    if (!item.id && !item.spaceId) {
      errors.push(`Item ${itemNum}: Missing space ID`);
    }
    
    if (!item.dates?.startDate || !item.dates?.endDate) {
      errors.push(`Item ${itemNum}: Missing booking dates`);
    }
    
    if (!item.pricing?.total || item.pricing.total <= 0) {
      errors.push(`Item ${itemNum}: Invalid pricing`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * Format Stripe error for user display
 * Converts technical Stripe errors to user-friendly messages
 */
export function formatStripeError(error) {
  if (!error) return 'An unknown error occurred';
  
  // Handle specific Stripe error types
  const errorMessages = {
    'card_declined': 'Your card was declined. Please try a different payment method.',
    'expired_card': 'Your card has expired. Please use a different card.',
    'incorrect_cvc': 'Your card\'s security code is incorrect.',
    'processing_error': 'An error occurred while processing your card. Please try again.',
    'incorrect_number': 'Your card number is incorrect.',
    'incomplete_number': 'Your card number is incomplete.',
    'incomplete_cvc': 'Your card\'s security code is incomplete.',
    'incomplete_expiry': 'Your card\'s expiration date is incomplete.',
    'postal_code': 'Your postal code is incorrect.',
    'email_invalid': 'Your email address is invalid.'
  };

  return errorMessages[error.code] || error.message || 'Payment failed. Please try again.';
}

export default useStripeCheckout;