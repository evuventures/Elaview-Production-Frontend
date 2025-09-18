// src/components/messages/BusinessMessageComponents.jsx
// ✅ B2B FEATURES: RFQ, Contract attachments, Campaign discussions, Payment reminders
// ✅ MOBILE RESPONSIVE: Touch-friendly interactions, responsive layouts
// ✅ PROFESSIONAL: Business context integration, verification badges

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
 DollarSign, FileText, Download, Eye, Check, Clock, 
 AlertCircle, Calendar, MapPin, Building2, Briefcase,
 CreditCard, Upload, Play, Pause, Image, Video,
 Phone, ExternalLink, Star, Award, Shield,
 CheckCircle, XCircle, Timer, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

// ✅ RFQ (Request for Quote) Message Component
export const RFQMessage = ({ 
 message, 
 isMyMessage, 
 onRespondToRFQ, 
 onViewDetails 
}) => {
 const rfqData = message.businessData?.rfq || {};
 const [isExpanded, setIsExpanded] = useState(false);
 
 return (
 <Card className={`${
 isMyMessage 
 ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white' 
 : 'bg-white border-purple-200 shadow-sm'
 } rounded-2xl ${isMyMessage ? 'rounded-br-sm' : 'rounded-bl-sm'} overflow-hidden`}>
 <CardContent className="p-4">
 {/* RFQ Header */}
 <div className="flex items-center gap-2 mb-3">
 <div className={`p-2 rounded-lg ${
 isMyMessage ? 'bg-purple-400/30' : 'bg-purple-100'
 }`}>
 <DollarSign className={`w-4 h-4 ${
 isMyMessage ? 'text-white' : 'text-purple-600'
 }`} />
 </div>
 <div className="flex-1">
 <h4 className={`font-semibold text-sm ${
 isMyMessage ? 'text-white' : 'text-slate-900'
 }`}>
 Request for Quote
 </h4>
 <p className={`text-xs ${
 isMyMessage ? 'text-purple-100' : 'text-slate-500'
 }`}>
 {rfqData.propertyName || 'Property Campaign'}
 </p>
 </div>
 <Badge 
 variant={rfqData.priority === 'urgent' ? 'destructive' : 'secondary'}
 className="text-xs"
>
 {rfqData.priority || 'Standard'}
 </Badge>
 </div>

 {/* RFQ Details */}
 <div className="space-y-2 mb-3">
 <p className={`text-sm ${
 isMyMessage ? 'text-white' : 'text-slate-700'
 }`}>
 {message.content}
 </p>
 
 {/* Campaign Details */}
 <div className={`grid grid-cols-2 gap-2 p-3 rounded-lg ${
 isMyMessage ? 'bg-purple-400/20' : 'bg-slate-50'
 }`}>
 <div>
 <p className={`text-xs font-medium ${
 isMyMessage ? 'text-purple-100' : 'text-slate-500'
 }`}>
 Duration
 </p>
 <p className={`text-sm font-semibold ${
 isMyMessage ? 'text-white' : 'text-slate-900'
 }`}>
 {rfqData.duration || '4 weeks'}
 </p>
 </div>
 <div>
 <p className={`text-xs font-medium ${
 isMyMessage ? 'text-purple-100' : 'text-slate-500'
 }`}>
 Budget Range
 </p>
 <p className={`text-sm font-semibold ${
 isMyMessage ? 'text-white' : 'text-slate-900'
 }`}>
 {rfqData.budgetRange || '$5K - $10K'}
 </p>
 </div>
 <div>
 <p className={`text-xs font-medium ${
 isMyMessage ? 'text-purple-100' : 'text-slate-500'
 }`}>
 Start Date
 </p>
 <p className={`text-sm font-semibold ${
 isMyMessage ? 'text-white' : 'text-slate-900'
 }`}>
 {rfqData.startDate || 'July 1, 2025'}
 </p>
 </div>
 <div>
 <p className={`text-xs font-medium ${
 isMyMessage ? 'text-purple-100' : 'text-slate-500'
 }`}>
 Response By
 </p>
 <p className={`text-sm font-semibold ${
 isMyMessage ? 'text-white' : 'text-slate-900'
 }`}>
 {rfqData.responseDeadline || '48 hours'}
 </p>
 </div>
 </div>
 </div>

 {/* Action Buttons */}
 {!isMyMessage && (
 <div className="flex gap-2">
 <Button
 size={20}
 onClick={() => onRespondToRFQ?.(message)}
 className="flex-1 bg-purple-600 hover:bg-purple-700 text-white touch-target"
>
 <DollarSign className="w-4 h-4 mr-1" />
 Send Quote
 </Button>
 <Button
 size={20}
 variant="outline"
 onClick={() => onViewDetails?.(message)}
 className="touch-target"
>
 <Eye className="w-4 h-4" />
 </Button>
 </div>
 )}

 {/* Quote Status for sent RFQs */}
 {isMyMessage && rfqData.status && (
 <div className="flex items-center gap-2 mt-2 p-2 bg-purple-400/20 rounded-lg">
 {rfqData.status === 'pending' && <Clock className="w-4 h-4 text-purple-200" />}
 {rfqData.status === 'quoted' && <CheckCircle className="w-4 h-4 text-green-300" />}
 {rfqData.status === 'declined' && <XCircle className="w-4 h-4 text-red-300" />}
 <span className="text-sm text-purple-100">
 Status: {rfqData.status}
 </span>
 </div>
 )}

 {/* Timestamp */}
 <div className={`text-xs mt-2 ${
 isMyMessage ? 'text-purple-200' : 'text-slate-500'
 }`}>
 {format(new Date(message.created_date), 'MMM d, HH:mm')}
 </div>
 </CardContent>
 </Card>
 );
};

// ✅ Contract/Document Message Component
export const ContractMessage = ({ 
 message, 
 isMyMessage, 
 onDownload, 
 onView,
 onSign 
}) => {
 const contractData = message.businessData?.contract || {};
 const attachments = message.attachments || [];
 
 return (
 <Card className={`${
 isMyMessage 
 ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white' 
 : 'bg-white border-orange-200 shadow-sm'
 } rounded-2xl ${isMyMessage ? 'rounded-br-sm' : 'rounded-bl-sm'} overflow-hidden`}>
 <CardContent className="p-4">
 {/* Contract Header */}
 <div className="flex items-center gap-2 mb-3">
 <div className={`p-2 rounded-lg ${
 isMyMessage ? 'bg-orange-400/30' : 'bg-orange-100'
 }`}>
 <FileText className={`w-4 h-4 ${
 isMyMessage ? 'text-white' : 'text-orange-600'
 }`} />
 </div>
 <div className="flex-1">
 <h4 className={`font-semibold text-sm ${
 isMyMessage ? 'text-white' : 'text-slate-900'
 }`}>
 {contractData.type || 'Contract Document'}
 </h4>
 <p className={`text-xs ${
 isMyMessage ? 'text-orange-100' : 'text-slate-500'
 }`}>
 {contractData.propertyName || 'Campaign Agreement'}
 </p>
 </div>
 {contractData.requiresSignature && (
 <Badge variant="secondary" className="text-xs">
 Signature Required
 </Badge>
 )}
 </div>

 {/* Message Content */}
 <p className={`text-sm mb-3 ${
 isMyMessage ? 'text-white' : 'text-slate-700'
 }`}>
 {message.content}
 </p>

 {/* Contract Details */}
 {contractData.value && (
 <div className={`p-3 rounded-lg mb-3 ${
 isMyMessage ? 'bg-orange-400/20' : 'bg-slate-50'
 }`}>
 <div className="grid grid-cols-2 gap-2">
 <div>
 <p className={`text-xs font-medium ${
 isMyMessage ? 'text-orange-100' : 'text-slate-500'
 }`}>
 Contract Value
 </p>
 <p className={`text-sm font-semibold ${
 isMyMessage ? 'text-white' : 'text-slate-900'
 }`}>
 ${contractData.value.toLocaleString()}
 </p>
 </div>
 <div>
 <p className={`text-xs font-medium ${
 isMyMessage ? 'text-orange-100' : 'text-slate-500'
 }`}>
 Duration
 </p>
 <p className={`text-sm font-semibold ${
 isMyMessage ? 'text-white' : 'text-slate-900'
 }`}>
 {contractData.duration || '30 days'}
 </p>
 </div>
 </div>
 </div>
 )}

 {/* Attachments */}
 {attachments.length> 0 && (
 <div className="space-y-2 mb-3">
 {attachments.map((attachment, index) => (
 <div 
 key={index}
 className={`flex items-center gap-2 p-2 rounded-lg ${
 isMyMessage ? 'bg-orange-400/20' : 'bg-slate-100'
 }`}
>
 <FileText className={`w-4 h-4 ${
 isMyMessage ? 'text-orange-200' : 'text-slate-500'
 }`} />
 <div className="flex-1 min-w-0">
 <p className={`text-sm font-medium truncate ${
 isMyMessage ? 'text-white' : 'text-slate-700'
 }`}>
 {attachment.name}
 </p>
 <p className={`text-xs ${
 isMyMessage ? 'text-orange-200' : 'text-slate-500'
 }`}>
 {attachment.size || '2.4 MB'} • {attachment.type || 'PDF'}
 </p>
 </div>
 <div className="flex gap-1">
 <Button
 size={20}
 variant="ghost"
 onClick={() => onView?.(attachment)}
 className={`touch-target h-8 w-8 p-0 ${
 isMyMessage 
 ? 'text-orange-200 hover:text-white hover:bg-orange-400/30' 
 : 'text-slate-500 hover:text-slate-700'
 }`}
>
 <Eye className="w-3 h-3" />
 </Button>
 <Button
 size={20}
 variant="ghost"
 onClick={() => onDownload?.(attachment)}
 className={`touch-target h-8 w-8 p-0 ${
 isMyMessage 
 ? 'text-orange-200 hover:text-white hover:bg-orange-400/30' 
 : 'text-slate-500 hover:text-slate-700'
 }`}
>
 <Download className="w-3 h-3" />
 </Button>
 </div>
 </div>
 ))}
 </div>
 )}

 {/* Action Buttons */}
 {!isMyMessage && contractData.requiresSignature && (
 <div className="flex gap-2 mb-2">
 <Button
 size={20}
 onClick={() => onSign?.(message)}
 className="flex-1 bg-orange-600 hover:bg-orange-700 text-white touch-target"
>
 <FileText className="w-4 h-4 mr-1" />
 Sign Contract
 </Button>
 <Button
 size={20}
 variant="outline"
 onClick={() => onView?.(message)}
 className="touch-target"
>
 <Eye className="w-4 h-4" />
 </Button>
 </div>
 )}

 {/* Contract Status */}
 {contractData.status && (
 <div className="flex items-center gap-2 p-2 bg-orange-400/20 rounded-lg mb-2">
 {contractData.status === 'pending_signature' && <Clock className="w-4 h-4" />}
 {contractData.status === 'signed' && <CheckCircle className="w-4 h-4 text-green-300" />}
 {contractData.status === 'rejected' && <XCircle className="w-4 h-4 text-red-300" />}
 <span className={`text-sm ${
 isMyMessage ? 'text-orange-100' : 'text-slate-600'
 }`}>
 Status: {contractData.status.replace('_', ' ')}
 </span>
 </div>
 )}

 {/* Timestamp */}
 <div className={`text-xs ${
 isMyMessage ? 'text-orange-200' : 'text-slate-500'
 }`}>
 {format(new Date(message.created_date), 'MMM d, HH:mm')}
 </div>
 </CardContent>
 </Card>
 );
};

// ✅ Campaign Discussion Message Component
export const CampaignMessage = ({ 
 message, 
 isMyMessage, 
 onViewCampaign,
 onApproveCreative,
 onRequestChanges 
}) => {
 const campaignData = message.businessData?.campaign || {};
 const creatives = message.attachments?.filter(att => att.type?.startsWith('image/')) || [];
 
 return (
 <Card className={`${
 isMyMessage 
 ? 'bg-gradient-to-br from-green-500 to-green-600 text-white' 
 : 'bg-white border-green-200 shadow-sm'
 } rounded-2xl ${isMyMessage ? 'rounded-br-sm' : 'rounded-bl-sm'} overflow-hidden`}>
 <CardContent className="p-4">
 {/* Campaign Header */}
 <div className="flex items-center gap-2 mb-3">
 <div className={`p-2 rounded-lg ${
 isMyMessage ? 'bg-green-400/30' : 'bg-green-100'
 }`}>
 <Briefcase className={`w-4 h-4 ${
 isMyMessage ? 'text-white' : 'text-green-600'
 }`} />
 </div>
 <div className="flex-1">
 <h4 className={`font-semibold text-sm ${
 isMyMessage ? 'text-white' : 'text-slate-900'
 }`}>
 Campaign Discussion
 </h4>
 <p className={`text-xs ${
 isMyMessage ? 'text-green-100' : 'text-slate-500'
 }`}>
 {campaignData.name || 'Summer Campaign 2025'}
 </p>
 </div>
 <Badge 
 variant={campaignData.status === 'active' ? 'default' : 'secondary'}
 className="text-xs"
>
 {campaignData.status || 'Planning'}
 </Badge>
 </div>

 {/* Message Content */}
 <p className={`text-sm mb-3 ${
 isMyMessage ? 'text-white' : 'text-slate-700'
 }`}>
 {message.content}
 </p>

 {/* Campaign Stats */}
 {campaignData.stats && (
 <div className={`grid grid-cols-3 gap-2 p-3 rounded-lg mb-3 ${
 isMyMessage ? 'bg-green-400/20' : 'bg-slate-50'
 }`}>
 <div className="text-center">
 <p className={`text-lg font-bold ${
 isMyMessage ? 'text-white' : 'text-slate-900'
 }`}>
 {campaignData.stats.impressions || '12.5K'}
 </p>
 <p className={`text-xs ${
 isMyMessage ? 'text-green-100' : 'text-slate-500'
 }`}>
 Impressions
 </p>
 </div>
 <div className="text-center">
 <p className={`text-lg font-bold ${
 isMyMessage ? 'text-white' : 'text-slate-900'
 }`}>
 {campaignData.stats.clicks || '326'}
 </p>
 <p className={`text-xs ${
 isMyMessage ? 'text-green-100' : 'text-slate-500'
 }`}>
 Clicks
 </p>
 </div>
 <div className="text-center">
 <p className={`text-lg font-bold ${
 isMyMessage ? 'text-white' : 'text-slate-900'
 }`}>
 {campaignData.stats.ctr || '2.6%'}
 </p>
 <p className={`text-xs ${
 isMyMessage ? 'text-green-100' : 'text-slate-500'
 }`}>
 CTR
 </p>
 </div>
 </div>
 )}

 {/* Creative Attachments */}
 {creatives.length> 0 && (
 <div className="space-y-2 mb-3">
 <p className={`text-xs font-medium ${
 isMyMessage ? 'text-green-100' : 'text-slate-500'
 }`}>
 Creative Assets ({creatives.length})
 </p>
 <div className="grid grid-cols-2 gap-2">
 {creatives.slice(0, 4).map((creative, index) => (
 <div 
 key={index}
 className={`relative rounded-lg overflow-hidden aspect-video ${
 isMyMessage ? 'bg-green-400/20' : 'bg-slate-100'
 }`}
>
 {creative.preview ? (
 <img 
 src={creative.preview} 
 alt={creative.name}
 className="w-full h-full object-cover"
 />
 ) : (
 <div className="w-full h-full flex items-center justify-center">
 <Image className={`w-6 h-6 ${
 isMyMessage ? 'text-green-200' : 'text-slate-400'
 }`} />
 </div>
 )}
 <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
 <Button
 size={20}
 variant="secondary"
 className="h-8 w-8 p-0"
 onClick={() => onViewCampaign?.(creative)}
>
 <Eye className="w-3 h-3" />
 </Button>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Action Buttons for Creative Approval */}
 {!isMyMessage && campaignData.requiresApproval && (
 <div className="flex gap-2 mb-2">
 <Button
 size={20}
 onClick={() => onApproveCreative?.(message)}
 className="flex-1 bg-green-600 hover:bg-green-700 text-white touch-target"
>
 <Check className="w-4 h-4 mr-1" />
 Approve
 </Button>
 <Button
 size={20}
 variant="outline"
 onClick={() => onRequestChanges?.(message)}
 className="touch-target"
>
 Request Changes
 </Button>
 </div>
 )}

 {/* Campaign Performance Trend */}
 {campaignData.trend && (
 <div className="flex items-center gap-2 p-2 bg-green-400/20 rounded-lg mb-2">
 <TrendingUp className={`w-4 h-4 ${
 campaignData.trend === 'up' ? 'text-green-300' : 'text-red-300'
 }`} />
 <span className={`text-sm ${
 isMyMessage ? 'text-green-100' : 'text-slate-600'
 }`}>
 Performance {campaignData.trend === 'up' ? 'improving' : 'declining'} by {campaignData.trendPercent || '12%'}
 </span>
 </div>
 )}

 {/* Timestamp */}
 <div className={`text-xs ${
 isMyMessage ? 'text-green-200' : 'text-slate-500'
 }`}>
 {format(new Date(message.created_date), 'MMM d, HH:mm')}
 </div>
 </CardContent>
 </Card>
 );
};

// ✅ Payment/Invoice Message Component
export const PaymentMessage = ({ 
 message, 
 isMyMessage, 
 onPayNow, 
 onViewInvoice,
 onDownloadReceipt 
}) => {
 const paymentData = message.businessData?.payment || {};
 
 return (
 <Card className={`${
 isMyMessage 
 ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
 : 'bg-white border-blue-200 shadow-sm'
 } rounded-2xl ${isMyMessage ? 'rounded-br-sm' : 'rounded-bl-sm'} overflow-hidden`}>
 <CardContent className="p-4">
 {/* Payment Header */}
 <div className="flex items-center gap-2 mb-3">
 <div className={`p-2 rounded-lg ${
 isMyMessage ? 'bg-blue-400/30' : 'bg-blue-100'
 }`}>
 <CreditCard className={`w-4 h-4 ${
 isMyMessage ? 'text-white' : 'text-blue-600'
 }`} />
 </div>
 <div className="flex-1">
 <h4 className={`font-semibold text-sm ${
 isMyMessage ? 'text-white' : 'text-slate-900'
 }`}>
 {paymentData.type === 'invoice' ? 'Invoice' : 'Payment'} 
 #{paymentData.number || '2025-001'}
 </h4>
 <p className={`text-xs ${
 isMyMessage ? 'text-blue-100' : 'text-slate-500'
 }`}>
 {paymentData.description || 'Campaign Payment'}
 </p>
 </div>
 <Badge 
 variant={paymentData.status === 'paid' ? 'default' : 'secondary'}
 className={`text-xs ${
 paymentData.status === 'paid' ? 'bg-green-500' : 
 paymentData.status === 'overdue' ? 'bg-red-500' : ''
 }`}
>
 {paymentData.status || 'Pending'}
 </Badge>
 </div>

 {/* Message Content */}
 <p className={`text-sm mb-3 ${
 isMyMessage ? 'text-white' : 'text-slate-700'
 }`}>
 {message.content}
 </p>

 {/* Payment Details */}
 <div className={`p-3 rounded-lg mb-3 ${
 isMyMessage ? 'bg-blue-400/20' : 'bg-slate-50'
 }`}>
 <div className="flex justify-between items-center mb-2">
 <span className={`text-sm ${
 isMyMessage ? 'text-blue-100' : 'text-slate-500'
 }`}>
 Amount Due
 </span>
 <span className={`text-lg font-bold ${
 isMyMessage ? 'text-white' : 'text-slate-900'
 }`}>
 ${paymentData.amount?.toLocaleString() || '2,450.00'}
 </span>
 </div>
 
 {paymentData.dueDate && (
 <div className="flex justify-between items-center">
 <span className={`text-sm ${
 isMyMessage ? 'text-blue-100' : 'text-slate-500'
 }`}>
 Due Date
 </span>
 <span className={`text-sm font-medium ${
 isMyMessage ? 'text-white' : 'text-slate-700'
 }`}>
 {format(new Date(paymentData.dueDate), 'MMM d, yyyy')}
 </span>
 </div>
 )}
 </div>

 {/* Action Buttons */}
 {!isMyMessage && paymentData.status !== 'paid' && (
 <div className="flex gap-2 mb-2">
 <Button
 size={20}
 onClick={() => onPayNow?.(message)}
 className="flex-1 bg-blue-600 hover:bg-blue-700 text-white touch-target"
>
 <CreditCard className="w-4 h-4 mr-1" />
 Pay Now
 </Button>
 <Button
 size={20}
 variant="outline"
 onClick={() => onViewInvoice?.(message)}
 className="touch-target"
>
 <Eye className="w-4 h-4" />
 </Button>
 </div>
 )}

 {/* Payment Confirmation */}
 {paymentData.status === 'paid' && (
 <div className="flex items-center gap-2 p-2 bg-green-100 text-green-800 rounded-lg mb-2">
 <CheckCircle className="w-4 h-4" />
 <span className="text-sm font-medium">Payment Received</span>
 <Button
 size={20}
 variant="ghost"
 onClick={() => onDownloadReceipt?.(message)}
 className="ml-auto touch-target text-green-700 hover:text-green-800"
>
 <Download className="w-3 h-3" />
 </Button>
 </div>
 )}

 {/* Timestamp */}
 <div className={`text-xs ${
 isMyMessage ? 'text-blue-200' : 'text-slate-500'
 }`}>
 {format(new Date(message.created_date), 'MMM d, HH:mm')}
 </div>
 </CardContent>
 </Card>
 );
};

// ✅ Business Message Router Component
export const BusinessMessage = ({ message, isMyMessage, onAction }) => {
 const messageType = message.businessData?.type || message.message_type;
 
 const handleAction = (actionType, data) => {
 onAction?.(actionType, { message, ...data });
 };
 
 switch (messageType) {
 case 'rfq':
 case 'quote_request':
 return (
 <RFQMessage 
 message={message}
 isMyMessage={isMyMessage}
 onRespondToRFQ={(msg) => handleAction('respond_rfq', { message: msg })}
 onViewDetails={(msg) => handleAction('view_rfq_details', { message: msg })}
 />
 );
 
 case 'contract':
 case 'document':
 return (
 <ContractMessage 
 message={message}
 isMyMessage={isMyMessage}
 onDownload={(att) => handleAction('download_attachment', { attachment: att })}
 onView={(att) => handleAction('view_attachment', { attachment: att })}
 onSign={(msg) => handleAction('sign_contract', { message: msg })}
 />
 );
 
 case 'campaign':
 case 'campaign_discussion':
 return (
 <CampaignMessage 
 message={message}
 isMyMessage={isMyMessage}
 onViewCampaign={(data) => handleAction('view_campaign', data)}
 onApproveCreative={(msg) => handleAction('approve_creative', { message: msg })}
 onRequestChanges={(msg) => handleAction('request_changes', { message: msg })}
 />
 );
 
 case 'payment':
 case 'invoice':
 case 'payment_reminder':
 return (
 <PaymentMessage 
 message={message}
 isMyMessage={isMyMessage}
 onPayNow={(msg) => handleAction('pay_now', { message: msg })}
 onViewInvoice={(msg) => handleAction('view_invoice', { message: msg })}
 onDownloadReceipt={(msg) => handleAction('download_receipt', { message: msg })}
 />
 );
 
 default:
 // Return regular message bubble for standard text messages
 return null;
 }
};