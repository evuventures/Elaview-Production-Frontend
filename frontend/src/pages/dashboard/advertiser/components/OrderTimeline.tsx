import React, { useState } from 'react';
import { 
 Clock, CheckCircle, AlertCircle, Package, Truck, 
 DollarSign, MessageCircle, User, Calendar, 
 ChevronDown, ChevronRight, ExternalLink, Download,
 MapPin, Camera, FileText, Phone
} from 'lucide-react';
import { OrderTimelineProps } from '../types';
import { formatDeliveryDate, formatPrice } from '../utils';

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ 
 materialOrder,
 timelineEvents,
 onViewDocument,
 onContactSupplier,
 onDownloadInvoice
}) => {
 const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
 const [showAllEvents, setShowAllEvents] = useState(false);

 if (!materialOrder || !timelineEvents || timelineEvents.length === 0) {
 return (
 <div className="bg-white rounded-lg border border-gray-200 p-6">
 <div className="text-center py-8">
 <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
 <h3 className="text-lg font-medium text-gray-900 mb-2">No Timeline Available</h3>
 <p className="text-gray-600">
 Timeline information will appear once your material order is processed.
 </p>
 </div>
 </div>
 );
 }

 const getEventIcon = (eventType: string) => {
 const icons = {
 'order_created': Clock,
 'quote_requested': DollarSign,
 'quote_received': CheckCircle,
 'order_confirmed': CheckCircle,
 'payment_processed': DollarSign,
 'production_started': Package,
 'quality_check': CheckCircle,
 'production_completed': Package,
 'shipped': Truck,
 'in_transit': Truck,
 'out_for_delivery': Truck,
 'delivered': CheckCircle,
 'installation_ready': Package,
 'supplier_message': MessageCircle,
 'issue_reported': AlertCircle,
 'issue_resolved': CheckCircle
 };
 return icons[eventType as keyof typeof icons] || Clock;
 };

 const getEventColor = (eventType: string, status: string) => {
 if (status === 'failed' || eventType === 'issue_reported') {
 return 'text-red-600 bg-red-100 border-red-200';
 }
 if (status === 'in_progress') {
 return 'text-blue-600 bg-blue-100 border-blue-200';
 }
 if (status === 'completed') {
 return 'text-green-600 bg-green-100 border-green-200';
 }
 return 'text-gray-600 bg-gray-100 border-gray-200';
 };

 const getEventBackgroundColor = (eventType: string, status: string) => {
 if (status === 'failed' || eventType === 'issue_reported') {
 return 'bg-red-50 border-red-200';
 }
 if (status === 'in_progress') {
 return 'bg-blue-50 border-blue-200';
 }
 if (status === 'completed') {
 return 'bg-green-50 border-green-200';
 }
 return 'bg-gray-50 border-gray-200';
 };

 // Sort events by timestamp
 const sortedEvents = [...timelineEvents].sort((a, b) => 
 new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
 );

 const visibleEvents = showAllEvents ? sortedEvents : sortedEvents.slice(0, 6);

 return (
 <div className="bg-white rounded-lg border border-gray-200 p-6">
 {/* Header */}
 <div className="flex items-center justify-between mb-6">
 <div>
 <h3 className="text-lg font-semibold text-gray-900 flex items-center">
 <Clock className="w-5 h-5 mr-2 text-gray-600" />
 Order Timeline
 </h3>
 <p className="text-sm text-gray-600 mt-1">
 Complete journey of your material order
 </p>
 </div>
 
 {/* Timeline Actions */}
 <div className="flex items-center space-x-3">
 <button
 onClick={onDownloadInvoice}
 className="text-gray-600 hover:text-gray-900 flex items-center text-sm"
>
 <Download className="w-4 h-4 mr-1" />
 Invoice
 </button>
 <button
 onClick={onContactSupplier}
 className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 text-sm"
>
 Contact Supplier
 </button>
 </div>
 </div>

 {/* Order Summary */}
 <div className="bg-gray-50 rounded-lg p-4 mb-6">
 <div className="grid grid-cols-4 gap-4 text-center">
 <div>
 <div className="text-2xl font-bold text-gray-900">#{materialOrder.orderNumber}</div>
 <div className="text-xs text-gray-600">Order Number</div>
 </div>
 <div>
 <div className="text-2xl font-bold text-green-600">{formatPrice(materialOrder.totalCost)}</div>
 <div className="text-xs text-gray-600">Total Value</div>
 </div>
 <div>
 <div className="text-2xl font-bold text-blue-600">{timelineEvents.length}</div>
 <div className="text-xs text-gray-600">Timeline Events</div>
 </div>
 <div>
 <div className="text-2xl font-bold text-purple-600">
 {Math.ceil((new Date().getTime() - new Date(materialOrder.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
 </div>
 <div className="text-xs text-gray-600">Days Since Order</div>
 </div>
 </div>
 </div>

 {/* Timeline */}
 <div className="space-y-4">
 {visibleEvents.map((event, index) => {
 const Icon = getEventIcon(event.eventType);
 const isExpanded = expandedEvent === event.id;
 const eventColor = getEventColor(event.eventType, event.status);
 const bgColor = getEventBackgroundColor(event.eventType, event.status);
 
 return (
 <div key={event.id} className="flex items-start">
 {/* Timeline Line */}
 <div className="flex flex-col items-center mr-4">
 <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${eventColor}`}>
 <Icon className="w-5 h-5" />
 </div>
 {index < visibleEvents.length - 1 && (
 <div className="w-0.5 h-12 bg-gray-300 mt-2" />
 )}
 </div>
 
 {/* Event Content */}
 <div className="flex-1 min-w-0">
 <div className={`border rounded-lg ${bgColor}`}>
 <div 
 className="p-4 cursor-pointer"
 onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
>
 <div className="flex items-center justify-between">
 <div className="flex-1">
 <div className="flex items-center space-x-2">
 <h4 className="font-medium text-gray-900">{event.title}</h4>
 {event.isAutomated && (
 <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
 Automated
 </span>
 )}
 </div>
 <p className="text-sm text-gray-600 mt-1">{event.description}</p>
 <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
 <span className="flex items-center">
 <Calendar className="w-3 h-3 mr-1" />
 {formatDeliveryDate(event.timestamp)}
 </span>
 {event.actor && (
 <span className="flex items-center">
 <User className="w-3 h-3 mr-1" />
 {event.actor}
 </span>
 )}
 {event.location && (
 <span className="flex items-center">
 <MapPin className="w-3 h-3 mr-1" />
 {event.location}
 </span>
 )}
 </div>
 </div>
 
 <div className="flex items-center space-x-2">
 {event.hasAttachments && (
 <span className="text-gray-400">
 <FileText className="w-4 h-4" />
 </span>
 )}
 {event.canExpand && (
 <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
 isExpanded ? 'transform rotate-180' : ''
 }`} />
 )}
 </div>
 </div>
 </div>

 {/* Expanded Details */}
 {isExpanded && event.details && (
 <div className="border-t p-4 bg-white bg-opacity-50">
 <div className="space-y-3">
 {/* Additional Information */}
 {event.details.additionalInfo && (
 <div>
 <h5 className="font-medium text-gray-900 text-sm mb-2">Details</h5>
 <p className="text-sm text-gray-700">{event.details.additionalInfo}</p>
 </div>
 )}

 {/* Cost Information */}
 {event.details.cost && (
 <div>
 <h5 className="font-medium text-gray-900 text-sm mb-2">Cost Impact</h5>
 <div className="bg-white rounded p-3 text-sm">
 <div className="flex justify-between">
 <span className="text-gray-600">Amount:</span>
 <span className="font-medium">{formatPrice(event.details.cost.amount)}</span>
 </div>
 {event.details.cost.description && (
 <p className="text-gray-600 text-xs mt-1">{event.details.cost.description}</p>
 )}
 </div>
 </div>
 )}

 {/* Attachments */}
 {event.details.attachments && event.details.attachments.length> 0 && (
 <div>
 <h5 className="font-medium text-gray-900 text-sm mb-2">Attachments</h5>
 <div className="space-y-2">
 {event.details.attachments.map((attachment) => (
 <div key={attachment.id} className="flex items-center justify-between bg-white rounded p-2 text-sm">
 <div className="flex items-center">
 <FileText className="w-4 h-4 text-gray-400 mr-2" />
 <span>{attachment.name}</span>
 </div>
 <button
 onClick={() => onViewDocument(attachment.url)}
 className="text-blue-600 hover:text-blue-700"
>
 <ExternalLink className="w-4 h-4" />
 </button>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Photos */}
 {event.details.photos && event.details.photos.length> 0 && (
 <div>
 <h5 className="font-medium text-gray-900 text-sm mb-2">Photos</h5>
 <div className="grid grid-cols-3 gap-2">
 {event.details.photos.map((photo) => (
 <div key={photo.id} className="aspect-square bg-gray-100 rounded overflow-hidden">
 <img
 src={photo.url}
 alt={photo.caption || 'Event photo'}
 className="w-full h-full object-cover cursor-pointer hover:opacity-80"
 onClick={() => onViewDocument(photo.url)}
 />
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Contact Information */}
 {event.details.contact && (
 <div>
 <h5 className="font-medium text-gray-900 text-sm mb-2">Contact</h5>
 <div className="bg-white rounded p-3 text-sm">
 <p className="font-medium">{event.details.contact.name}</p>
 <div className="flex items-center space-x-4 mt-1">
 {event.details.contact.email && (
 <a 
 href={`mailto:${event.details.contact.email}`}
 className="text-blue-600 hover:text-blue-700 flex items-center"
>
 <MessageCircle className="w-3 h-3 mr-1" />
 Email
 </a>
 )}
 {event.details.contact.phone && (
 <a 
 href={`tel:${event.details.contact.phone}`}
 className="text-blue-600 hover:text-blue-700 flex items-center"
>
 <Phone className="w-3 h-3 mr-1" />
 Call
 </a>
 )}
 </div>
 </div>
 </div>
 )}

 {/* Next Steps */}
 {event.details.nextSteps && event.details.nextSteps.length> 0 && (
 <div>
 <h5 className="font-medium text-gray-900 text-sm mb-2">Next Steps</h5>
 <ul className="space-y-1">
 {event.details.nextSteps.map((step, stepIndex) => (
 <li key={stepIndex} className="text-sm text-gray-700 flex items-start">
 <ChevronRight className="w-3 h-3 text-gray-400 mr-1 mt-0.5 flex-shrink-0" />
 {step}
 </li>
 ))}
 </ul>
 </div>
 )}
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 );
 })}
 </div>

 {/* Show More Button */}
 {timelineEvents.length> 6 && (
 <div className="text-center mt-6">
 <button
 onClick={() => setShowAllEvents(!showAllEvents)}
 className="text-teal-600 hover:text-teal-700 text-sm font-medium"
>
 {showAllEvents ? 'Show Less' : `Show ${timelineEvents.length - 6} More Events`}
 </button>
 </div>
 )}

 {/* Timeline Summary */}
 <div className="mt-6 pt-6 border-t border-gray-200">
 <div className="grid grid-cols-2 gap-6 text-sm">
 <div>
 <h4 className="font-medium text-gray-900 mb-2">Order Progress</h4>
 <div className="space-y-1">
 <div className="flex justify-between">
 <span className="text-gray-600">Started:</span>
 <span className="font-medium">{formatDeliveryDate(materialOrder.createdAt)}</span>
 </div>
 {materialOrder.estimatedDelivery && (
 <div className="flex justify-between">
 <span className="text-gray-600">Est. Delivery:</span>
 <span className="font-medium">{formatDeliveryDate(materialOrder.estimatedDelivery)}</span>
 </div>
 )}
 {materialOrder.deliveredDate && (
 <div className="flex justify-between">
 <span className="text-gray-600">Delivered:</span>
 <span className="font-medium text-green-600">{formatDeliveryDate(materialOrder.deliveredDate)}</span>
 </div>
 )}
 </div>
 </div>
 
 <div>
 <h4 className="font-medium text-gray-900 mb-2">Event Summary</h4>
 <div className="space-y-1">
 <div className="flex justify-between">
 <span className="text-gray-600">Total Events:</span>
 <span className="font-medium">{timelineEvents.length}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-gray-600">Issues:</span>
 <span className="font-medium text-red-600">
 {timelineEvents.filter(e => e.eventType === 'issue_reported').length}
 </span>
 </div>
 <div className="flex justify-between">
 <span className="text-gray-600">Last Update:</span>
 <span className="font-medium">
 {formatDeliveryDate(timelineEvents[0]?.timestamp)}
 </span>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
};