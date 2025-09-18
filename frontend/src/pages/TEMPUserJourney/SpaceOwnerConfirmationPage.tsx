// src/pages/TEMPUserJourney/SpaceOwnerConfirmationPage.tsx
// ✅ COMPREHENSIVE: Campaign approval page for space owners
// ✅ VERIFICATION: Console logs throughout for testing and debugging
// ✅ ERROR HANDLING: Proper loading states and error boundaries
// ✅ RESPONSIVE: Mobile-first design with clean UX
// ✅ BUSINESS LOGIC: Campaign approval/denial and advertiser notification

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { 
 ArrowLeft, CheckCircle2, XCircle, MessageCircle, Calendar, 
 MapPin, Building2, DollarSign, Clock, Target, Users, 
 AlertCircle, Loader2, ChevronRight, Eye, Send, 
 ThumbsUp, ThumbsDown, HelpCircle, Sparkles, Package,
 TrendingUp, BarChart3, Info
} from "lucide-react";
import apiClient from '@/api/apiClient';

// Types for TypeScript safety
interface CampaignInvitation {
 id: string;
 campaignId: string;
 spaceId: string;
 propertyId: string;
 advertiserId: string;
 spaceOwnerId: string;
 status: 'PENDING' | 'APPROVED' | 'DENIED' | 'INFO_REQUESTED';
 message: string;
 totalPrice: number;
 duration: number;
 startDate: string;
 endDate: string;
 createdAt: string;
 campaign: {
 id: string;
 name: string;
 brand_name: string;
 description?: string;
 objective: string;
 budget?: number;
 target_demographics?: any;
 };
 space: {
 id: string;
 name: string;
 description?: string;
 address?: string;
 };
 advertiser: {
 id: string;
 name: string;
 email: string;
 businessName?: string;
 };
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

// Status color mapping
const getStatusColor = (status: string) => {
 const colors = {
 PENDING: 'bg-yellow-100 text-yellow-700',
 APPROVED: 'bg-green-100 text-green-700',
 DENIED: 'bg-red-100 text-red-700',
 INFO_REQUESTED: 'bg-blue-100 text-blue-700'
 };
 return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
};

export default function SpaceOwnerConfirmationPage() {
 const navigate = useNavigate();
 const { campaignId } = useParams<{ campaignId?: string }>();
 const { user } = useUser();

 // State management
 const [invitation, setInvitation] = useState<CampaignInvitation | null>(null);
 const [isLoading, setIsLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [isProcessing, setIsProcessing] = useState(false);
 const [responseMessage, setResponseMessage] = useState('');
 const [actionSuccess, setActionSuccess] = useState<string | null>(null);
 
 // ✅ LEGAL AGREEMENT STATE
 const [agreedToTerms, setAgreedToTerms] = useState(false);
 const [agreedToLiability, setAgreedToLiability] = useState(false);

 // ✅ VERIFICATION: Console log component mount
 useEffect(() => {
 console.log('🎯 SpaceOwnerConfirmationPage component mounted');
 console.log('👤 Current user:', user?.id);
 console.log('📋 Campaign ID from URL:', campaignId);
 
 initializePage();
 }, [campaignId, user?.id]);

 // Initialize page data
 const initializePage = async () => {
 try {
 console.log('🔄 Initializing SpaceOwnerConfirmationPage...');
 
 if (!campaignId) {
 console.error('❌ No campaign ID provided in URL');
 setError('Invalid campaign link. Please check the URL and try again.');
 setIsLoading(false);
 return;
 }

 if (!user?.id) {
 console.error('❌ No user found');
 setError('Please sign in to view this campaign invitation.');
 setIsLoading(false);
 return;
 }

 // ✅ VERIFICATION: Fetch campaign invitation
 console.log('📡 Fetching campaign invitation...');
 await fetchCampaignInvitation();

 } catch (error) {
 console.error('❌ Error initializing page:', error);
 setError('Failed to load campaign invitation. Please try again.');
 setIsLoading(false);
 }
 };

 // Fetch campaign invitation details
 const fetchCampaignInvitation = async () => {
 try {
 console.log('📡 API: Getting campaign invitation details...');
 
 const response = await apiClient.get(`/campaigns/invitations/${campaignId}`, {
 userId: user?.id
 });

 console.log('📊 Campaign invitation response:', response);

 if (response.success && response.data) {
 console.log('✅ Campaign invitation loaded successfully');
 setInvitation(response.data);
 
 // ✅ VERIFICATION: Log invitation details
 console.log('📋 Invitation details:', {
 id: response.data.id,
 status: response.data.status,
 campaignName: response.data.campaign?.name,
 advertiser: response.data.advertiser?.businessName,
 totalPrice: response.data.totalPrice,
 duration: response.data.duration
 });
 
 } else {
 throw new Error(response.error || 'Campaign invitation not found');
 }

 } catch (error) {
 console.error('❌ Error fetching campaign invitation:', error);
 setError(`Failed to load campaign details: ${error.message}`);
 } finally {
 setIsLoading(false);
 }
 };

 // Handle campaign approval
 const handleApprove = async () => {
 // ✅ VERIFICATION: Check legal agreements for approval
 if (!agreedToTerms || !agreedToLiability) {
 setError('Please complete all required agreements before approving this campaign.');
 return;
 }
 await handleInvitationResponse('APPROVED', 'Campaign approved! The advertiser can now proceed with booking.');
 };

 // Handle campaign denial
 const handleDeny = async () => {
 if (!responseMessage.trim()) {
 setError('Please provide a reason for denying this campaign.');
 return;
 }
 // ✅ Note: No legal agreements required for denial
 await handleInvitationResponse('DENIED', responseMessage);
 };

 // Handle request for more information
 const handleRequestInfo = async () => {
 if (!responseMessage.trim()) {
 setError('Please specify what additional information you need.');
 return;
 }
 // ✅ Note: No legal agreements required for info requests
 await handleInvitationResponse('INFO_REQUESTED', responseMessage);
 };

 // Handle invitation response
 const handleInvitationResponse = async (status: string, message: string) => {
 if (!invitation || !user?.id) {
 console.error('❌ Missing invitation or user data');
 return;
 }

 console.log(`🚀 Processing ${status} response...`);
 setIsProcessing(true);
 setError(null);

 try {
 // ✅ VERIFICATION: Log the response data
 const responseData = {
 invitationId: invitation.id,
 campaignId: invitation.campaignId,
 spaceOwnerId: user.id,
 advertiserId: invitation.advertiserId,
 status: status,
 message: message,
 responseDate: new Date().toISOString()
 };

 console.log('📋 Response data:', responseData);

 // ✅ API CALL: Submit response
 console.log('📡 Sending response to advertiser...');
 const response = await apiClient.post('/campaigns/invitations/respond', responseData);

 console.log('📊 Response submission result:', response);

 if (response.success) {
 console.log(`✅ Campaign ${status.toLowerCase()} successfully`);
 console.log('📬 Advertiser notification sent');
 
 // Update local state
 setInvitation(prev => prev ? { ...prev, status: status as any } : null);
 
 // Set success message
 const successMessages = {
 APPROVED: 'Campaign approved! The advertiser has been notified and can now proceed with booking.',
 DENIED: 'Campaign denied. The advertiser has been notified with your feedback.',
 INFO_REQUESTED: 'Information request sent. The advertiser will respond with additional details.'
 };
 
 setActionSuccess(successMessages[status as keyof typeof successMessages] || 'Response sent successfully.');
 
 // Clear response message
 setResponseMessage('');
 
 // ✅ VERIFICATION: Auto-redirect after success (except for info requests)
 if (status !== 'INFO_REQUESTED') {
 setTimeout(() => {
 console.log('🔄 Redirecting to dashboard...');
 navigate('/dashboard');
 }, 3000);
 }

 } else {
 throw new Error(response.error || `Failed to ${status.toLowerCase()} campaign`);
 }

 } catch (error) {
 console.error(`❌ ${status} response failed:`, error);
 setError(`Failed to ${status.toLowerCase()} campaign: ${error.message}`);
 } finally {
 setIsProcessing(false);
 }
 };

 // Handle going back
 const handleGoBack = () => {
 console.log('⬅️ Going back to dashboard');
 navigate('/dashboard');
 };

 // Loading state
 if (isLoading) {
 return (
 <div className="min-h-screen bg-slate-50 flex items-center justify-center">
 <div className="text-center">
 <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
 <p className="text-slate-600">Loading campaign details...</p>
 </div>
 </div>
 );
 }

 // Error state
 if (error && !invitation) {
 return (
 <div className="min-h-screen bg-slate-50 flex items-center justify-center">
 <div className="text-center max-w-md mx-auto p-6">
 <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
 <h2 className="text-xl font-semibold text-slate-900 mb-2">Something went wrong</h2>
 <p className="text-slate-600 mb-4">{error}</p>
 <Button onClick={handleGoBack} variant="outline">
 <ArrowLeft className="w-4 h-4 mr-2" />
 Go to Dashboard
 </Button>
 </div>
 </div>
 );
 }

 // Success state (for actions other than info requests)
 if (actionSuccess && invitation?.status !== 'INFO_REQUESTED') {
 return (
 <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
 <div className="max-w-2xl mx-auto px-4 py-16">
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 className="bg-white rounded-xl shadow-lg p-8 text-center"
>
 <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
 {invitation?.status === 'APPROVED' ? (
 <CheckCircle2 className="w-8 h-8 text-green-600" />
 ) : (
 <XCircle className="w-8 h-8 text-red-600" />
 )}
 </div>
 
 <h1 className="text-2xl font-bold text-slate-900 mb-3">
 {invitation?.status === 'APPROVED' ? 'Campaign Approved!' : 'Response Sent!'}
 </h1>
 <p className="text-slate-600 mb-6">{actionSuccess}</p>

 <Button onClick={handleGoBack} className="w-full">
 Return to Dashboard
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
 <h1 className="text-lg font-semibold text-slate-900">Campaign Approval</h1>
 <p className="text-sm text-slate-500">Review and respond to advertising campaign request</p>
 </div>
 </div>
 <Badge className={getStatusColor(invitation?.status || 'PENDING')}>
 {invitation?.status || 'PENDING'}
 </Badge>
 </div>
 </div>
 </div>

 <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
 
 {/* Success Message */}
 {actionSuccess && invitation?.status === 'INFO_REQUESTED' && (
 <motion.div
 initial={{ opacity: 0, y: -20 }}
 animate={{ opacity: 1, y: 0 }}
 className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
>
 <div className="flex items-center gap-2">
 <CheckCircle2 className="w-5 h-5 text-green-600" />
 <p className="text-green-800">{actionSuccess}</p>
 </div>
 </motion.div>
 )}

 {/* Error Message */}
 {error && (
 <motion.div
 initial={{ opacity: 0, y: -20 }}
 animate={{ opacity: 1, y: 0 }}
 className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
>
 <div className="flex items-center gap-2">
 <AlertCircle className="w-5 h-5 text-red-600" />
 <p className="text-red-800">{error}</p>
 </div>
 </motion.div>
 )}

 <div className="grid lg:grid-cols-3 gap-8">
 
 {/* Campaign Details */}
 <div className="lg:col-span-2 space-y-6">
 
 {/* Campaign Overview */}
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Target className="w-5 h-5 text-blue-600" />
 Campaign Request
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 <div>
 <h3 className="font-semibold text-lg text-slate-900">
 {invitation?.campaign.name}
 </h3>
 <p className="text-slate-600">by {invitation?.campaign.brand_name}</p>
 </div>

 <div className="bg-blue-50 rounded-lg p-4">
 <p className="text-blue-800 font-medium mb-2">Advertiser Message:</p>
 <p className="text-blue-700">{invitation?.message}</p>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <p className="text-sm text-slate-500 mb-1">Campaign Objective</p>
 <Badge variant="outline" className="capitalize">
 {invitation?.campaign.objective?.toLowerCase().replace('_', ' ')}
 </Badge>
 </div>
 <div>
 <p className="text-sm text-slate-500 mb-1">Budget</p>
 <p className="font-medium text-slate-900">
 {invitation?.campaign.budget ? formatCurrency(invitation.campaign.budget) : 'Not disclosed'}
 </p>
 </div>
 </div>

 {invitation?.campaign.description && (
 <div>
 <p className="text-sm text-slate-500 mb-1">Campaign Description</p>
 <p className="text-slate-700">{invitation.campaign.description}</p>
 </div>
 )}
 </CardContent>
 </Card>

 {/* Space & Timing Details */}
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <MapPin className="w-5 h-5 text-blue-600" />
 Space & Schedule
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 <div>
 <h3 className="font-semibold text-lg text-slate-900">{invitation?.space.name}</h3>
 {invitation?.space.description && (
 <p className="text-slate-600">{invitation.space.description}</p>
 )}
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div className="flex items-center gap-2">
 <Calendar className="w-4 h-4 text-slate-500" />
 <div>
 <p className="text-xs text-slate-500">Start Date</p>
 <p className="text-sm font-medium">{formatDate(invitation?.startDate || '')}</p>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <Calendar className="w-4 h-4 text-slate-500" />
 <div>
 <p className="text-xs text-slate-500">End Date</p>
 <p className="text-sm font-medium">{formatDate(invitation?.endDate || '')}</p>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <Clock className="w-4 h-4 text-slate-500" />
 <div>
 <p className="text-xs text-slate-500">Duration</p>
 <p className="text-sm font-medium">{invitation?.duration} days</p>
 </div>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Advertiser Information */}
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Building2 className="w-5 h-5 text-blue-600" />
 Advertiser Information
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 <div>
 <h3 className="font-semibold text-lg text-slate-900">
 {invitation?.advertiser.businessName || invitation?.advertiser.name}
 </h3>
 <p className="text-slate-600">{invitation?.advertiser.email}</p>
 </div>
 </CardContent>
 </Card>

 {/* Response Section */}
 {invitation?.status === 'PENDING' && (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <MessageCircle className="w-5 h-5 text-blue-600" />
 Your Response
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 <div>
 <label className="text-sm font-medium text-slate-700 mb-2 block">
 Message to Advertiser (required for denial or info requests)
 </label>
 <Textarea
 value={responseMessage}
 onChange={(e) => setResponseMessage(e.target.value)}
 placeholder="Provide feedback, ask questions, or explain your decision..."
 className="min-h-[100px]"
 disabled={isProcessing}
 />
 </div>
 </CardContent>
 </Card>
 )}
 </div>

 {/* Action Panel */}
 <div className="space-y-6">
 
 {/* Financial Summary */}
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <DollarSign className="w-5 h-5 text-blue-600" />
 Financial Details
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="text-center">
 <p className="text-2xl font-bold text-blue-600">
 {formatCurrency(invitation?.totalPrice || 0)}
 </p>
 <p className="text-sm text-slate-500">Total Campaign Value</p>
 </div>
 
 <Separator />
 
 <div className="space-y-2 text-sm">
 <div className="flex justify-between">
 <span className="text-slate-600">Duration:</span>
 <span>{invitation?.duration} days</span>
 </div>
 <div className="flex justify-between">
 <span className="text-slate-600">Daily Rate:</span>
 <span>{formatCurrency((invitation?.totalPrice || 0) / (invitation?.duration || 1))}</span>
 </div>
 </div>

 <div className="text-xs text-slate-500 bg-green-50 rounded p-3">
 <strong>Note:</strong> Payment will be processed upon your approval.
 </div>
 </CardContent>
 </Card>

 {/* Legal Agreement Section - Only for Pending Status */}
 {invitation?.status === 'PENDING' && (
 <Card className="border-amber-200 bg-amber-50">
 <CardHeader>
 <CardTitle className="flex items-center gap-2 text-amber-900">
 <AlertCircle className="w-5 h-5" />
 Legal Agreement & Responsibilities
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="text-sm text-amber-800 mb-4">
 <p className="font-medium mb-2">Before approving this campaign, please confirm the following:</p>
 </div>

 <div className="space-y-3">
 <label className="flex items-start gap-3 cursor-pointer">
 <input
 type="checkbox"
 checked={agreedToLiability}
 onChange={(e) => setAgreedToLiability(e.target.checked)}
 className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
 />
 <span className="text-sm text-slate-700">
 <strong>Content Responsibility:</strong> I understand that I am responsible for 
 reviewing the advertiser's content and ensuring it meets my property's standards. 
 I have the right to request content modifications or reject inappropriate material.
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
 <strong>Terms & Payment:</strong> I agree to the platform's terms of service 
 and understand that payment processing will be handled securely through the platform. 
 Funds will be released according to the agreed payment schedule.
 </span>
 </label>
 </div>

 <div className="bg-blue-50 rounded p-3 text-xs text-blue-700">
 <strong>Note:</strong> Approving this campaign creates a binding agreement between 
 you and the advertiser. You can still communicate about content details before 
 the campaign goes live.
 </div>
 </CardContent>
 </Card>
 )}

 {/* Action Buttons */}
 {invitation?.status === 'PENDING' && (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Sparkles className="w-5 h-5 text-blue-600" />
 Your Decision
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-3">
 <Button
 onClick={handleApprove}
 disabled={isProcessing || !agreedToTerms || !agreedToLiability}
 className="w-full bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
 size={32}
>
 {isProcessing ? (
 <Loader2 className="w-4 h-4 animate-spin mr-2" />
 ) : (
 <ThumbsUp className="w-4 h-4 mr-2" />
 )}
 Approve Campaign
 </Button>

 {(!agreedToTerms || !agreedToLiability) && (
 <p className="text-xs text-amber-600 text-center">
 Complete legal agreements above to approve
 </p>
 )}

 <Button
 onClick={handleRequestInfo}
 disabled={isProcessing || !responseMessage.trim()}
 variant="outline"
 className="w-full"
>
 {isProcessing ? (
 <Loader2 className="w-4 h-4 animate-spin mr-2" />
 ) : (
 <HelpCircle className="w-4 h-4 mr-2" />
 )}
 Request More Info
 </Button>

 <Button
 onClick={handleDeny}
 disabled={isProcessing || !responseMessage.trim()}
 variant="outline"
 className="w-full border-red-200 text-red-600 hover:bg-red-50"
>
 {isProcessing ? (
 <Loader2 className="w-4 h-4 animate-spin mr-2" />
 ) : (
 <ThumbsDown className="w-4 h-4 mr-2" />
 )}
 Deny Campaign
 </Button>
 </CardContent>
 </Card>
 )}

 {/* Status Card for Non-Pending */}
 {invitation?.status !== 'PENDING' && (
 <Card className="bg-slate-50">
 <CardContent className="p-4 text-center">
 <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${getStatusColor(invitation?.status || '')}`}>
 {invitation?.status === 'APPROVED' && <CheckCircle2 className="w-4 h-4" />}
 {invitation?.status === 'DENIED' && <XCircle className="w-4 h-4" />}
 {invitation?.status === 'INFO_REQUESTED' && <MessageCircle className="w-4 h-4" />}
 {invitation?.status?.replace('_', ' ')}
 </div>
 <p className="text-sm text-slate-600 mt-2">
 {invitation?.status === 'APPROVED' && 'Campaign approved - advertiser notified'}
 {invitation?.status === 'DENIED' && 'Campaign denied - advertiser notified'}
 {invitation?.status === 'INFO_REQUESTED' && 'Waiting for advertiser response'}
 </p>
 </CardContent>
 </Card>
 )}

 {/* Help Panel */}
 <Card className="bg-blue-50 border-blue-200">
 <CardContent className="p-4">
 <div className="flex items-center gap-3 mb-3">
 <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
 <Info className="w-4 h-4 text-white" />
 </div>
 <h4 className="font-semibold text-blue-900">Need Help?</h4>
 </div>
 <div className="text-blue-700 text-sm space-y-1">
 <p>• Review campaign details carefully</p>
 <p>• Check advertiser's business profile</p>
 <p>• Consider your space availability</p>
 <p>• Contact support if you have questions</p>
 </div>
 </CardContent>
 </Card>
 </div>
 </div>
 </div>
 </div>
 );
}