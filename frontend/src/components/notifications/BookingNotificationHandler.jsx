// src/components/notifications/BookingNotificationHandler.jsx
// Handles booking approval/decline actions from notifications
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
 CheckCircle, XCircle, MessageSquare, Calendar, 
 DollarSign, Building2, User, Phone, Mail, 
 Clock, Loader2, Bell
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import apiClient from '@/api/apiClient';
import { formatDistanceToNow } from 'date-fns';

const BookingNotificationHandler = ({ notification, onAction }) => {
 const navigate = useNavigate();
 const [isProcessing, setIsProcessing] = useState(false);
 const [showDeclineForm, setShowDeclineForm] = useState(false);
 const [declineReason, setDeclineReason] = useState('');

 // Parse notification data
 const messageData = notification.messageData ? JSON.parse(notification.messageData) : {};
 const { bookingDetails, businessInfo, actionButtons } = messageData;

 // Handle approve booking
 const handleApprove = async () => {
 try {
 setIsProcessing(true);
 
 const result = await apiClient.put(`/bookings/${messageData.bookingId}/approve`);
 
 if (result.success) {
 // Mark notification as read
 await apiClient.markNotificationAsRead(notification.id);
 
 // Show success message
 alert('✅ Booking approved! The advertiser has been notified.');
 
 // Callback to parent to refresh notifications
 if (onAction) onAction('approved');
 
 // Navigate to booking details
 navigate(`/bookings/${messageData.bookingId}`);
 }
 } catch (error) {
 console.error('❌ Failed to approve booking:', error);
 alert('Failed to approve booking. Please try again.');
 } finally {
 setIsProcessing(false);
 }
 };

 // Handle decline booking
 const handleDecline = async () => {
 try {
 setIsProcessing(true);
 
 const result = await apiClient.put(`/bookings/${messageData.bookingId}/decline`, {
 reason: declineReason
 });
 
 if (result.success) {
 // Mark notification as read
 await apiClient.markNotificationAsRead(notification.id);
 
 // Show success message
 alert('❌ Booking declined. The advertiser has been notified.');
 
 // Callback to parent to refresh notifications
 if (onAction) onAction('declined');
 
 // Close decline form
 setShowDeclineForm(false);
 }
 } catch (error) {
 console.error('❌ Failed to decline booking:', error);
 alert('Failed to decline booking. Please try again.');
 } finally {
 setIsProcessing(false);
 }
 };

 // Handle message advertiser
 const handleMessage = async () => {
 try {
 // Mark notification as read
 await apiClient.markNotificationAsRead(notification.id);
 
 // Navigate to conversation
 const conversationUrl = `/messages?conversation=${messageData.conversationId || ''}`;
 navigate(conversationUrl);
 
 if (onAction) onAction('messaged');
 } catch (error) {
 console.error('❌ Failed to open conversation:', error);
 }
 };

 return (
 <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
 {/* Header */}
 <div className="flex items-start justify-between mb-3">
 <div className="flex items-center gap-2">
 <Calendar className="w-5 h-5 text-blue-600" />
 <span className="font-semibold text-blue-900">New Booking Request</span>
 <Badge className="bg-orange-100 text-orange-700">
 Pending Approval
 </Badge>
 </div>
 <Clock className="w-4 h-4 text-gray-500" />
 </div>

 {/* Business Info */}
 {businessInfo && (
 <div className="mb-4 p-3 bg-white rounded-lg border border-blue-100">
 <div className="flex items-center gap-2 mb-2">
 <Building2 className="w-4 h-4 text-gray-600" />
 <span className="font-medium text-gray-900">{businessInfo.name}</span>
 <Badge variant="outline" className="text-xs">
 {businessInfo.type}
 </Badge>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
 <div className="flex items-center gap-2">
 <Mail className="w-3 h-3" />
 <span>{businessInfo.email}</span>
 </div>
 <div className="flex items-center gap-2">
 <Phone className="w-3 h-3" />
 <span>{businessInfo.phone}</span>
 </div>
 </div>
 </div>
 )}

 {/* Booking Details */}
 {bookingDetails && (
 <div className="mb-4 p-3 bg-white rounded-lg border border-blue-100">
 <div className="grid grid-cols-2 gap-3 text-sm">
 <div>
 <span className="text-gray-600">Start Date:</span>
 <p className="font-medium">{new Date(bookingDetails.startDate).toLocaleDateString()}</p>
 </div>
 <div>
 <span className="text-gray-600">End Date:</span>
 <p className="font-medium">{new Date(bookingDetails.endDate).toLocaleDateString()}</p>
 </div>
 <div>
 <span className="text-gray-600">Duration:</span>
 <p className="font-medium">
 {Math.ceil((new Date(bookingDetails.endDate) - new Date(bookingDetails.startDate)) / (1000 * 60 * 60 * 24))} days
 </p>
 </div>
 <div>
 <span className="text-gray-600">Total Amount:</span>
 <p className="font-semibold text-green-600 flex items-center gap-1">
 <DollarSign className="w-3 h-3" />
 {bookingDetails.totalAmount?.toLocaleString()} {bookingDetails.currency}
 </p>
 </div>
 </div>
 </div>
 )}

 {/* Decline Form */}
 {showDeclineForm && (
 <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
 <h4 className="font-medium text-red-900 mb-2">Decline Reason (Optional)</h4>
 <textarea
 value={declineReason}
 onChange={(e) => setDeclineReason(e.target.value)}
 placeholder="Let the advertiser know why you're declining (e.g., dates not available, wrong type of business, etc.)"
 className="w-full p-2 border border-red-300 rounded-lg text-sm"
 rows={3}
 />
 <div className="flex gap-2 mt-3">
 <Button
 onClick={handleDecline}
 disabled={isProcessing}
 size={20}
 className="bg-red-600 hover:bg-red-700 text-white"
>
 {isProcessing ? (
 <>
 <Loader2 className="w-3 h-3 mr-1 animate-spin" />
 Declining...
 </>
 ) : (
 <>
 <XCircle className="w-3 h-3 mr-1" />
 Confirm Decline
 </>
 )}
 </Button>
 <Button
 onClick={() => setShowDeclineForm(false)}
 disabled={isProcessing}
 size={20}
 variant="ghost"
 className="text-gray-600"
>
 Cancel
 </Button>
 </div>
 </div>
 )}

 {/* Action Buttons */}
 <div className="flex flex-wrap gap-2">
 {!showDeclineForm && (
 <>
 <Button
 onClick={handleApprove}
 disabled={isProcessing}
 size={20}
 className="bg-green-600 hover:bg-green-700 text-white"
>
 {isProcessing ? (
 <>
 <Loader2 className="w-3 h-3 mr-1 animate-spin" />
 Approving...
 </>
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
 size={20}
 variant="outline"
 className="border-red-300 text-red-600 hover:bg-red-50"
>
 <XCircle className="w-3 h-3 mr-1" />
 Decline
 </Button>
 </>
 )}
 
 <Button
 onClick={handleMessage}
 disabled={isProcessing}
 size={20}
 variant="ghost"
 className="text-blue-600 hover:bg-blue-100"
>
 <MessageSquare className="w-3 h-3 mr-1" />
 Message
 </Button>
 </div>

 {/* Quick Info */}
 <div className="mt-3 pt-3 border-t border-blue-200">
 <p className="text-xs text-blue-700">
 ⏰ <strong>Response Time:</strong> Please respond within 24 hours to maintain your response rate
 </p>
 </div>
 </div>
 );
};

export default BookingNotificationHandler;