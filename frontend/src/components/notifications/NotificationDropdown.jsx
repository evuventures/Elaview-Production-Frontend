// src/components/notifications/NotificationDropdown.jsx
// Clean version with click-outside functionality and no debug code

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Loader2, Check, Building2, Clock, MessageSquare,
  CheckCircle, XCircle, DollarSign, Calendar, User, Target,
  Eye, ThumbsUp, ThumbsDown, MapPin, Sparkles
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import apiClient from '@/api/apiClient';

// Campaign invitation notification component
const CampaignInvitationCard = ({ notification, onAction }) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  // Parse notification data - campaign invitations store data in the 'data' field
  let campaignData = {};
  
  try {
    // Handle different data formats
    if (notification.data) {
      if (typeof notification.data === 'string') {
        campaignData = JSON.parse(notification.data);
      } else if (typeof notification.data === 'object') {
        campaignData = notification.data;
      }
    }
  } catch (error) {
    console.error('Failed to parse campaign data:', error);
    campaignData = {};
  }

  const {
    campaign_id,
    space_id,
    invitation_id,
    advertiser_name,
    space_name,
    total_price,
    action_url
  } = campaignData;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Handle view campaign invitation
  const handleViewCampaign = async (e) => {
    e.stopPropagation();
    try {
      setIsProcessing(true);
      
      // Mark notification as read
      await apiClient.markNotificationAsRead(notification.id);
      
      // Navigate to space owner confirmation page
      const targetUrl = action_url || `/SpaceOwnerConfirmation/${invitation_id}`;
      navigate(targetUrl);
      
      // Callback to refresh notifications
      if (onAction) onAction('viewed');
      
    } catch (error) {
      console.error('Failed to view campaign invitation:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle quick approve
  const handleQuickApprove = async (e) => {
    e.stopPropagation();
    try {
      setIsProcessing(true);
      
      const result = await apiClient.approveCampaignInvitation(
        invitation_id, 
        'Campaign approved! You can now proceed with booking.'
      );
      
      if (result.success) {
        await apiClient.markNotificationAsRead(notification.id);
        if (onAction) onAction('approved');
      }
    } catch (error) {
      console.error('Failed to approve campaign:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 border-l-4 border-l-blue-400 bg-blue-50 hover:bg-blue-100 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-blue-900 text-sm">Campaign Request</span>
          <Badge className="bg-blue-200 text-blue-800 text-xs">
            Pending Review
          </Badge>
        </div>
        <span className="text-xs text-gray-500">
          {formatDistanceToNow(new Date(notification.created_at || notification.createdAt), { addSuffix: true })}
        </span>
      </div>

      {/* Campaign Info */}
      <div className="mb-3">
        <p className="font-medium text-gray-900 text-sm mb-1">
          <span className="text-blue-600">{advertiser_name || 'Advertiser'}</span> is interested in booking your space
        </p>
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span className="font-medium">{space_name || 'Your Space'}</span>
          </div>
          {total_price && (
            <div className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              <span className="font-semibold text-green-600">
                {formatCurrency(total_price)} campaign value
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Message Preview */}
      <div className="mb-3 p-2 bg-white/50 rounded text-xs text-gray-700">
        {notification.message || notification.title || 'New campaign invitation'}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleViewCampaign}
          disabled={isProcessing}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-3 flex-1"
        >
          {isProcessing ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <>
              <Eye className="w-3 h-3 mr-1" />
              View Details
            </>
          )}
        </Button>
        
        <Button
          onClick={handleQuickApprove}
          disabled={isProcessing}
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-3"
        >
          {isProcessing ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <>
              <ThumbsUp className="w-3 h-3 mr-1" />
              Approve
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

// Booking notification component
const BookingNotificationCard = ({ notification, onAction }) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  // Parse notification data
  const messageData = notification.messageData ? JSON.parse(notification.messageData) : {};
  const { bookingDetails, businessInfo } = messageData;

  // Handle approve booking
  const handleApprove = async (e) => {
    e.stopPropagation();
    try {
      setIsProcessing(true);
      
      const result = await apiClient.approveBooking(messageData.bookingId);
      
      if (result.success) {
        await apiClient.markNotificationAsRead(notification.id);
        if (onAction) onAction('approved');
        alert('✅ Booking approved! The advertiser has been notified.');
      }
    } catch (error) {
      console.error('Failed to approve booking:', error);
      alert('Failed to approve booking. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle decline booking
  const handleDecline = async (e) => {
    e.stopPropagation();
    try {
      setIsProcessing(true);
      
      const result = await apiClient.declineBooking(messageData.bookingId, declineReason);
      
      if (result.success) {
        await apiClient.markNotificationAsRead(notification.id);
        if (onAction) onAction('declined');
        alert('❌ Booking declined. The advertiser has been notified.');
        setShowDeclineForm(false);
      }
    } catch (error) {
      console.error('Failed to decline booking:', error);
      alert('Failed to decline booking. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle message advertiser
  const handleMessage = async (e) => {
    e.stopPropagation();
    try {
      await apiClient.markNotificationAsRead(notification.id);
      navigate(`/messages?conversation=${messageData.conversationId}`);
      if (onAction) onAction('messaged');
    } catch (error) {
      console.error('Failed to open conversation:', error);
    }
  };

  return (
    <div className="p-4 border-l-4 border-l-orange-400 bg-orange-50 hover:bg-orange-100 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-orange-600" />
          <span className="font-semibold text-orange-900 text-sm">Booking Request</span>
          <Badge className="bg-orange-200 text-orange-800 text-xs">
            Pending
          </Badge>
        </div>
        <span className="text-xs text-gray-500">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </span>
      </div>

      {/* Business & Booking Info */}
      <div className="mb-3">
        <p className="font-medium text-gray-900 text-sm mb-1">
          {businessInfo?.name} ({businessInfo?.type})
        </p>
        {bookingDetails && (
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>📅 {new Date(bookingDetails.startDate).toLocaleDateString()}</span>
              <span className="font-semibold text-green-600">
                ${bookingDetails.totalAmount?.toLocaleString()}
              </span>
            </div>
            <div>
              📞 {businessInfo?.phone} • 📧 {businessInfo?.email}
            </div>
          </div>
        )}
      </div>

      {/* Decline Form */}
      {showDeclineForm && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded">
          <textarea
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            placeholder="Optional: Why are you declining?"
            className="w-full p-2 text-xs border rounded"
            rows={2}
          />
          <div className="flex gap-1 mt-2">
            <Button
              onClick={handleDecline}
              disabled={isProcessing}
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-2"
            >
              {isProcessing ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                'Confirm Decline'
              )}
            </Button>
            <Button
              onClick={() => setShowDeclineForm(false)}
              size="sm"
              variant="ghost"
              className="text-xs py-1 px-2"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {!showDeclineForm && (
          <>
            <Button
              onClick={handleApprove}
              disabled={isProcessing}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-3"
            >
              {isProcessing ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Approve
                </>
              )}
            </Button>
            
            <Button
              onClick={() => setShowDeclineForm(true)}
              disabled={isProcessing}
              size="sm"
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 text-xs py-1 px-3"
            >
              <XCircle className="w-3 h-3 mr-1" />
              Decline
            </Button>
          </>
        )}
        
        <Button
          onClick={handleMessage}
          disabled={isProcessing}
          size="sm"
          variant="ghost"
          className="text-blue-600 hover:bg-blue-100 text-xs py-1 px-3"
        >
          <MessageSquare className="w-3 h-3 mr-1" />
          Message
        </Button>
      </div>
    </div>
  );
};

// Standard notification card
const StandardNotificationCard = ({ notification, onClick }) => {
  const getNotificationIcon = (notification) => {
    // Handle campaign notifications
    if (notification.type === 'CAMPAIGN_INVITATION') {
      return <Target className="w-4 h-4 text-blue-600" />;
    }
    if (notification.type === 'CAMPAIGN_APPROVED') {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
    if (notification.type === 'CAMPAIGN_DENIED') {
      return <XCircle className="w-4 h-4 text-red-600" />;
    }
    if (notification.type === 'CAMPAIGN_INFO_REQUEST') {
      return <MessageSquare className="w-4 h-4 text-orange-600" />;
    }

    // Handle other notification types
    const messageData = notification.messageData ? JSON.parse(notification.messageData) : {};
    
    switch (messageData.action) {
      case 'booking_approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'booking_declined':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'payment_reminder':
        return <DollarSign className="w-4 h-4 text-orange-600" />;
      default:
        return <Bell className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div
      onClick={() => onClick(notification)}
      className="p-4 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
          {getNotificationIcon(notification)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 line-clamp-2">
            {notification.subject || notification.title || 'Notification'}
          </p>
          <p className="text-sm text-slate-600 line-clamp-2 mt-1">
            {notification.content || notification.message || 'You have a new notification'}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            {formatDistanceToNow(new Date(notification.created_at || notification.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
};

// Main notification dropdown component
const NotificationDropdown = ({ 
  isOpen, 
  onClose, 
  onNotificationAction,
  notifications = [],
  notificationCount = 0,
  isLoading = false
}) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle standard notification click
  const handleNotificationClick = async (notification) => {
    try {
      // For campaign notifications, handle special routing
      if (notification.type === 'CAMPAIGN_INVITATION' && notification.data?.action_url) {
        await apiClient.markNotificationAsRead(notification.id);
        onClose();
        navigate(notification.data.action_url);
        if (onNotificationAction) onNotificationAction('viewed');
        return;
      }

      // For other campaign notifications
      if (notification.type?.startsWith('CAMPAIGN_')) {
        await apiClient.markNotificationAsRead(notification.id);
        onClose();
        
        const actionUrl = notification.data?.action_url || '/advertise';
        navigate(actionUrl);
        if (onNotificationAction) onNotificationAction('viewed');
        return;
      }

      // For other notifications, try the standard flow
      const result = await apiClient.handleNotificationClick(notification);
      
      if (result.success) {
        onClose();
        navigate(result.actionUrl);
        if (onNotificationAction) onNotificationAction('clicked');
      }
    } catch (error) {
      console.error('Failed to handle notification click:', error);
      
      // Still close and navigate on error
      onClose();
      navigate('/messages'); // Fallback navigation
    }
  };

  // Handle campaign invitation action
  const handleCampaignAction = (action) => {
    if (onNotificationAction) {
      onNotificationAction(action);
    }
  };

  // Handle booking action
  const handleBookingAction = (action) => {
    if (onNotificationAction) {
      onNotificationAction(action);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.markAllNotificationsAsRead();
      
      if (onNotificationAction) {
        onNotificationAction('mark_all_read');
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      
      if (onNotificationAction) {
        onNotificationAction('mark_all_read');
      }
      
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed top-16 right-4 w-96 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden z-[999999]"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Notifications</h3>
            {notificationCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>
          {notificationCount > 0 && (
            <p className="text-xs text-slate-600 mt-1">
              {notificationCount} unread notification{notificationCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        
        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-6 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="font-medium">All caught up!</p>
              <p className="text-xs mt-1">No new notifications</p>
            </div>
          ) : (
            notifications.map(notification => {
              // Handle campaign invitation notifications
              if (notification.type === 'CAMPAIGN_INVITATION') {
                return (
                  <CampaignInvitationCard
                    key={notification.id}
                    notification={notification}
                    onAction={handleCampaignAction}
                  />
                );
              }

              // Handle booking request notifications
              let messageData = {};
              try {
                messageData = notification.messageData ? JSON.parse(notification.messageData) : {};
              } catch (e) {
                console.warn('Failed to parse messageData:', e);
              }
              
              const isBookingRequest = messageData.action === 'booking_request';
              
              if (isBookingRequest) {
                return (
                  <BookingNotificationCard
                    key={notification.id}
                    notification={notification}
                    onAction={handleBookingAction}
                  />
                );
              }
              
              // Handle all other notifications
              return (
                <StandardNotificationCard
                  key={notification.id}
                  notification={notification}
                  onClick={handleNotificationClick}
                />
              );
            })
          )}
        </div>
        
        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50">
          <button
            onClick={() => {
              onClose();
              navigate('/messages');
            }}
            className="block w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all messages
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationDropdown;