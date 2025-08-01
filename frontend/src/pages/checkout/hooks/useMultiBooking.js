// src/pages/checkout/hooks/useMultiBooking.js
// ✅ STEP 6: Multi-space booking management hook
// Handles creation of multiple bookings after payment success

import { useState, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import apiClient from '../../../api/apiClient';

/**
 * Custom hook for managing multi-space booking creation
 * Handles the process of creating multiple bookings after successful payment
 */
export function useMultiBooking() {
  const { user } = useUser();
  
  // Booking creation state
  const [isCreatingBookings, setIsCreatingBookings] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [createdBookings, setCreatedBookings] = useState(null);

  /**
   * Create multiple bookings after successful payment
   * This is called by the payment success handler
   */
  const createMultipleBookings = useCallback(async (paymentIntentId, orderData, totalAmount) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    if (!paymentIntentId || !orderData?.items) {
      throw new Error('Invalid booking data');
    }

    setIsCreatingBookings(true);
    setBookingError(null);
    setCreatedBookings(null);

    try {
      console.log('📝 Creating multiple bookings:', {
        paymentIntentId,
        itemCount: orderData.items.length,
        totalAmount
      });

      // Validate all required booking data before sending to API
      const validatedItems = orderData.items.map((item, index) => {
        if (!item.spaceId) {
          throw new Error(`Missing space ID for item ${index + 1}`);
        }
        
        if (!item.dates?.startDate || !item.dates?.endDate) {
          throw new Error(`Missing dates for item ${index + 1}: ${item.spaceName || 'Unknown space'}`);
        }

        if (!item.pricing?.total || item.pricing.total <= 0) {
          throw new Error(`Invalid pricing for item ${index + 1}: ${item.spaceName || 'Unknown space'}`);
        }

        return {
          spaceId: item.spaceId,
          spaceName: item.spaceName || 'Advertising Space',
          dates: {
            startDate: item.dates.startDate,
            endDate: item.dates.endDate
          },
          pricing: {
            days: item.pricing.days || 1,
            dailyRate: item.pricing.dailyRate || 0,
            total: item.pricing.total
          },
          materialConfiguration: item.materialConfiguration || null
        };
      });

      // Call API to create bookings
      const response = await apiClient.createMultipleBookings({
        paymentIntentId,
        orderData: {
          items: validatedItems
        },
        totalAmount
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to create bookings');
      }

      const bookings = response.data.bookings;
      console.log(`✅ Successfully created ${bookings.length} bookings`);

      // Set created bookings for success handling
      setCreatedBookings({
        bookings: bookings,
        count: bookings.length,
        totalAmount: totalAmount,
        paymentIntentId: paymentIntentId
      });

      // Return success data
      return {
        success: true,
        bookings: bookings,
        count: bookings.length,
        totalAmount: totalAmount
      };

    } catch (error) {
      console.error('❌ Multi-booking creation failed:', error);
      
      const errorMessage = error.message || 'Failed to create bookings';
      setBookingError(errorMessage);
      
      // Re-throw the error so the payment handler can deal with it
      throw new Error(errorMessage);
    } finally {
      setIsCreatingBookings(false);
    }
  }, [user?.id]);

  /**
   * Validate booking data before attempting to create bookings
   * Useful for pre-flight checks in the UI
   */
  const validateBookingData = useCallback((orderData) => {
    const errors = [];

    if (!orderData || !orderData.items || orderData.items.length === 0) {
      errors.push('No booking items provided');
      return { isValid: false, errors };
    }

    orderData.items.forEach((item, index) => {
      const itemNum = index + 1;
      const spaceName = item.spaceName || `Space ${itemNum}`;

      // Check space ID
      if (!item.spaceId) {
        errors.push(`${spaceName}: Missing space ID`);
      }

      // Check dates
      if (!item.dates?.startDate || !item.dates?.endDate) {
        errors.push(`${spaceName}: Missing booking dates`);
      } else {
        const startDate = new Date(item.dates.startDate);
        const endDate = new Date(item.dates.endDate);
        
        if (startDate >= endDate) {
          errors.push(`${spaceName}: End date must be after start date`);
        }
        
        if (startDate < new Date()) {
          errors.push(`${spaceName}: Start date cannot be in the past`);
        }
      }

      // Check pricing
      if (!item.pricing?.total || item.pricing.total <= 0) {
        errors.push(`${spaceName}: Invalid pricing information`);
      }

      if (!item.pricing?.days || item.pricing.days <= 0) {
        errors.push(`${spaceName}: Invalid booking duration`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }, []);

  /**
   * Calculate total booking summary from order data
   * Useful for displaying summaries in the UI
   */
  const calculateBookingSummary = useCallback((orderData) => {
    if (!orderData?.items || orderData.items.length === 0) {
      return {
        totalSpaces: 0,
        totalDays: 0,
        subtotal: 0,
        platformFee: 0,
        total: 0,
        averageDailyRate: 0
      };
    }

    let totalDays = 0;
    let subtotal = 0;
    let totalSpaces = orderData.items.length;

    orderData.items.forEach(item => {
      if (item.pricing) {
        totalDays += item.pricing.days || 0;
        subtotal += item.pricing.total || 0;
      }
    });

    const platformFee = subtotal * 0.1; // 10% platform fee
    const total = subtotal + platformFee;
    const averageDailyRate = totalDays > 0 ? subtotal / totalDays : 0;

    return {
      totalSpaces,
      totalDays,
      subtotal,
      platformFee,
      total,
      averageDailyRate
    };
  }, []);

  /**
   * Get booking status for a specific payment intent
   * Useful for checking if bookings were already created
   */
  const getBookingStatus = useCallback(async (paymentIntentId) => {
    try {
      // This would require an additional API endpoint to check booking status
      // For now, we'll just check if we have created bookings in state
      if (createdBookings?.paymentIntentId === paymentIntentId) {
        return {
          hasBookings: true,
          bookings: createdBookings.bookings,
          count: createdBookings.count
        };
      }

      return {
        hasBookings: false,
        bookings: [],
        count: 0
      };
    } catch (error) {
      console.error('❌ Error checking booking status:', error);
      return {
        hasBookings: false,
        bookings: [],
        count: 0
      };
    }
  }, [createdBookings]);

  /**
   * Clear booking state (useful for cleanup or retries)
   */
  const clearBookingState = useCallback(() => {
    setBookingError(null);
    setCreatedBookings(null);
    setIsCreatingBookings(false);
  }, []);

  /**
   * Format booking data for display in success screens
   */
  const formatBookingsForDisplay = useCallback((bookings) => {
    if (!bookings || bookings.length === 0) return [];

    return bookings.map(booking => ({
      id: booking.id,
      spaceName: booking.advertising_area?.name || 'Advertising Space',
      propertyName: booking.properties?.title || 'Property',
      address: booking.properties?.address || '',
      startDate: new Date(booking.startDate),
      endDate: new Date(booking.endDate),
      totalAmount: booking.totalAmount,
      status: booking.status,
      isPaid: booking.isPaid,
      materialStatus: booking.materialStatus,
      installationStatus: booking.installationStatus
    }));
  }, []);

  return {
    // State
    isCreatingBookings,
    bookingError,
    createdBookings,
    
    // Actions
    createMultipleBookings,
    clearBookingState,
    
    // Validation & Utilities
    validateBookingData,
    calculateBookingSummary,
    getBookingStatus,
    formatBookingsForDisplay,
    
    // Status helpers
    hasCreatedBookings: !!createdBookings,
    isBookingInProgress: isCreatingBookings,
    hasBookingError: !!bookingError
  };
}

/**
 * Standalone utility function to validate individual booking item
 * Useful for validating items before adding to cart
 */
export function validateBookingItem(item) {
  const errors = [];
  const spaceName = item.spaceName || 'Space';

  if (!item.spaceId) {
    errors.push('Missing space ID');
  }

  if (!item.dates?.startDate || !item.dates?.endDate) {
    errors.push('Missing booking dates');
  } else {
    const startDate = new Date(item.dates.startDate);
    const endDate = new Date(item.dates.endDate);
    
    if (startDate >= endDate) {
      errors.push('End date must be after start date');
    }
    
    if (startDate < new Date()) {
      errors.push('Start date cannot be in the past');
    }
  }

  if (!item.pricing?.total || item.pricing.total <= 0) {
    errors.push('Invalid pricing information');
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
    spaceName: spaceName
  };
}

export default useMultiBooking;