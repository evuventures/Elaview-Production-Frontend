import React, { useState } from 'react';
import { 
 Package, Clock, CheckCircle, Truck, AlertCircle, 
 DollarSign, Calendar, Phone, MessageCircle, Download,
 Eye, Edit, RefreshCw, MapPin, User, Building2,
 ChevronDown, ChevronUp, ExternalLink, Copy
} from 'lucide-react';
import { MaterialOrderTrackerProps } from '../types';
import { 
 getMaterialOrderStatusBadge, 
 formatPrice, 
 formatDeliveryDate,
 calculateDaysUntilDeadline
} from '../utils';

export const MaterialOrderTracker: React.FC<MaterialOrderTrackerProps> = ({ 
 booking,
 materialOrder,
 onContactSupplier,
 onRequestUpdate,
 onModifyOrder,
 onTrackShipment,
 onViewInvoice
}) => {
 const [expandedOrderItem, setExpandedOrderItem] = useState<string | null>(null);
 const [showOrderDetails, setShowOrderDetails] = useState(false);

 if (!materialOrder) {
 return (
 <div className="bg-white rounded-lg border border-gray-200 p-6">
 <div className="text-center py-8">
 <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
 <h3 className="text-lg font-medium text-gray-900 mb-2">No Material Order</h3>
 <p className="text-gray-600">
 Material order information will appear here once materials are ordered.
 </p>
 </div>
 </div>
 );
 }

 const statusBadge = getMaterialOrderStatusBadge(materialOrder.status);
 const daysUntilDelivery = materialOrder.estimatedDelivery ? 
 calculateDaysUntilDeadline(materialOrder.estimatedDelivery) : null;
 
 // Define order progression steps
 const orderSteps = [
 {
 id: 'quote_requested',
 title: 'Quote Requested',
 status: ['QUOTE_REQUESTED', 'QUOTED', 'CONFIRMED', 'PROCESSING', 'PRINTED', 'SHIPPED', 'DELIVERED'].includes(materialOrder.status) ? 'completed' : 'pending',
 timestamp: materialOrder.createdAt,
 icon: Clock,
 description: 'Quote request sent to supplier'
 },
 {
 id: 'quote_received',
 title: 'Quote Received',
 status: ['QUOTED', 'CONFIRMED', 'PROCESSING', 'PRINTED', 'SHIPPED', 'DELIVERED'].includes(materialOrder.status) ? 'completed' : 
 materialOrder.status === 'QUOTE_REQUESTED' ? 'in_progress' : 'pending',
 timestamp: materialOrder.quotedAt,
 icon: DollarSign,
 description: 'Supplier provided pricing and timeline'
 },
 {
 id: 'order_confirmed',
 title: 'Order Confirmed',
 status: ['CONFIRMED', 'PROCESSING', 'PRINTED', 'SHIPPED', 'DELIVERED'].includes(materialOrder.status) ? 'completed' : 
 materialOrder.status === 'QUOTED' ? 'pending' : 'disabled',
 timestamp: materialOrder.confirmedAt,
 icon: CheckCircle,
 description: 'Order confirmed and payment processed'
 },
 {
 id: 'production',
 title: 'In Production',
 status: ['PROCESSING', 'PRINTED', 'SHIPPED', 'DELIVERED'].includes(materialOrder.status) ? 'completed' : 
 materialOrder.status === 'CONFIRMED' ? 'in_progress' : 'disabled',
 timestamp: materialOrder.productionStartedAt,
 icon: Package,
 description: 'Materials being printed/manufactured'
 },
 {
 id: 'shipped',
 title: 'Shipped',
 status: ['SHIPPED', 'DELIVERED'].includes(materialOrder.status) ? 'completed' : 
 materialOrder.status === 'PRINTED' ? 'pending' : 'disabled',
 timestamp: materialOrder.shippedDate,
 icon: Truck,
 description: 'Materials shipped to installation location'
 },
 {
 id: 'delivered',
 title: 'Delivered',
 status: materialOrder.status === 'DELIVERED' ? 'completed' : 
 materialOrder.status === 'SHIPPED' ? 'in_progress' : 'disabled',
 timestamp: materialOrder.deliveredDate,
 icon: CheckCircle,
 description: 'Materials delivered and ready for installation'
 }
 ];

 const getStepStatusColor = (status: string) => {
 switch(status) {
 case 'completed': return 'bg-green-100 text-green-800 border-green-200';
 case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200'; 
 case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
 default: return 'bg-gray-100 text-gray-500 border-gray-200';
 }
 };

 const getStepIconColor = (status: string) => {
 switch(status) {
 case 'completed': return 'text-green-600 bg-green-100';
 case 'in_progress': return 'text-blue-600 bg-blue-100';
 case 'pending': return 'text-yellow-600 bg-yellow-100';
 default: return 'text-gray-400 bg-gray-100';
 }
 };

 return (
 <div className="bg-white rounded-lg border border-gray-200 p-6">
 {/* Header */}
 <div className="flex items-center justify-between mb-6">
 <div>
 <h3 className="text-lg font-semibold text-gray-900 flex items-center">
 <Package className="w-5 h-5 mr-2 text-gray-600" />
 Material Order #{materialOrder.orderNumber}
 </h3>
 <p className="text-sm text-gray-600 mt-1">
 Track your materials from order to delivery
 </p>
 </div>
 
 {/* Current Status Badge */}
 <div className="flex items-center space-x-3">
 <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusBadge.color}`}>
 <statusBadge.icon className="w-4 h-4 mr-1" />
 {statusBadge.text}
 </span>
 <button
 onClick={() => setShowOrderDetails(!showOrderDetails)}
 className="text-gray-400 hover:text-gray-600"
>
 {showOrderDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
 </button>
 </div>
 </div>

 {/* Delivery Alert */}
 {daysUntilDelivery !== null && daysUntilDelivery <= 5 && materialOrder.status === 'SHIPPED' && (
 <div className={`mb-6 p-4 rounded-lg border ${
 daysUntilDelivery <= 1 ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
 }`}>
 <div className="flex items-center">
 <Truck className={`w-5 h-5 mr-2 ${
 daysUntilDelivery <= 1 ? 'text-green-600' : 'text-blue-600'
 }`} />
 <div className="flex-1">
 <p className={`font-medium ${
 daysUntilDelivery <= 1 ? 'text-green-800' : 'text-blue-800'
 }`}>
 {daysUntilDelivery <= 0 ? 'Delivery Expected Today' : 
 daysUntilDelivery === 1 ? 'Delivery Expected Tomorrow' : 
 `Delivery in ${daysUntilDelivery} Days`}
 </p>
 <p className={`text-sm ${
 daysUntilDelivery <= 1 ? 'text-green-700' : 'text-blue-700'
 }`}>
 Estimated delivery: {formatDeliveryDate(materialOrder.estimatedDelivery)}
 </p>
 </div>
 {materialOrder.trackingNumber && (
 <button
 onClick={onTrackShipment}
 className={`px-3 py-1 rounded text-sm font-medium ${
 daysUntilDelivery <= 1 ? 'bg-green-600 text-white hover:bg-green-700' : 
 'bg-blue-600 text-white hover:bg-blue-700'
 }`}
>
 Track Package
 </button>
 )}
 </div>
 </div>
 )}

 {/* Order Progress Timeline */}
 <div className="space-y-4 mb-6">
 <h4 className="font-medium text-gray-900">Order Progress</h4>
 {orderSteps.map((step, index) => (
 <div key={step.id} className="flex items-start">
 {/* Timeline Line */}
 <div className="flex flex-col items-center mr-4">
 <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${getStepIconColor(step.status)}`}>
 <step.icon className="w-5 h-5" />
 </div>
 {index < orderSteps.length - 1 && (
 <div className={`w-0.5 h-8 mt-2 ${
 step.status === 'completed' ? 'bg-green-300' : 'bg-gray-300'
 }`} />
 )}
 </div>
 
 {/* Step Content */}
 <div className="flex-1 min-w-0">
 <div className={`p-3 rounded-lg border ${getStepStatusColor(step.status)}`}>
 <div className="flex items-center justify-between mb-1">
 <h5 className="font-medium">{step.title}</h5>
 {step.timestamp && (
 <span className="text-xs opacity-75">
 {formatDeliveryDate(step.timestamp)}
 </span>
 )}
 </div>
 <p className="text-sm opacity-90">{step.description}</p>
 
 {/* Step-specific Actions */}
 {step.id === 'quote_received' && step.status === 'completed' && materialOrder.status === 'QUOTED' && (
 <button
 onClick={onModifyOrder}
 className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
>
 Review & Confirm Order →
 </button>
 )}
 
 {step.id === 'shipped' && step.status === 'completed' && materialOrder.trackingNumber && (
 <div className="mt-2 flex items-center space-x-2">
 <span className="text-sm text-gray-600">Tracking:</span>
 <button
 onClick={onTrackShipment}
 className="text-sm text-blue-600 hover:text-blue-700 font-medium"
>
 {materialOrder.trackingNumber}
 </button>
 <button
 onClick={() => navigator.clipboard.writeText(materialOrder.trackingNumber || '')}
 className="text-gray-400 hover:text-gray-600"
>
 <Copy className="w-3 h-3" />
 </button>
 </div>
 )}
 </div>
 </div>
 </div>
 ))}
 </div>

 {/* Order Summary */}
 <div className="bg-gray-50 rounded-lg p-4 mb-6">
 <div className="flex items-center justify-between mb-3">
 <h4 className="font-medium text-gray-900">Order Summary</h4>
 <button
 onClick={onViewInvoice}
 className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
>
 <Eye className="w-4 h-4 mr-1" />
 View Invoice
 </button>
 </div>
 
 <div className="grid grid-cols-2 gap-4 text-sm">
 <div>
 <p className="text-gray-600">Supplier</p>
 <p className="font-medium flex items-center">
 <Building2 className="w-3 h-3 mr-1" />
 {materialOrder.supplierName || 'Standard Print Shop'}
 </p>
 </div>
 <div>
 <p className="text-gray-600">Order Total</p>
 <p className="font-bold text-green-600">{formatPrice(materialOrder.totalCost)}</p>
 </div>
 <div>
 <p className="text-gray-600">Items Ordered</p>
 <p className="font-medium">{materialOrder.orderItems?.length || 1} item(s)</p>
 </div>
 <div>
 <p className="text-gray-600">Expected Delivery</p>
 <p className="font-medium">{formatDeliveryDate(materialOrder.estimatedDelivery)}</p>
 </div>
 </div>

 {/* Shipping Address */}
 {materialOrder.shippingAddress && (
 <div className="mt-4 pt-4 border-t border-gray-200">
 <p className="text-gray-600 text-sm mb-1">Shipping To:</p>
 <p className="text-sm font-medium flex items-center">
 <MapPin className="w-3 h-3 mr-1" />
 {typeof materialOrder.shippingAddress === 'string' 
 ? materialOrder.shippingAddress 
 : `${materialOrder.shippingAddress.street}, ${materialOrder.shippingAddress.city}`}
 </p>
 </div>
 )}
 </div>

 {/* Expandable Order Details */}
 {showOrderDetails && (
 <div className="border-t border-gray-200 pt-6 space-y-4">
 <h4 className="font-medium text-gray-900">Order Items</h4>
 
 {materialOrder.orderItems && materialOrder.orderItems.length> 0 ? (
 <div className="space-y-3">
 {materialOrder.orderItems.map((item) => (
 <div key={item.id} className="bg-gray-50 rounded-lg p-4">
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <h5 className="font-medium text-gray-900">{item.materialName}</h5>
 <p className="text-sm text-gray-600 mt-1">{item.description}</p>
 <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
 <div>
 <span className="text-gray-600">Quantity:</span>
 <span className="ml-1 font-medium">{item.quantity} {item.unit}</span>
 </div>
 <div>
 <span className="text-gray-600">Unit Price:</span>
 <span className="ml-1 font-medium">{formatPrice(item.unitPrice)}</span>
 </div>
 <div>
 <span className="text-gray-600">Total:</span>
 <span className="ml-1 font-medium">{formatPrice(item.totalPrice)}</span>
 </div>
 </div>
 
 {/* Custom Specs */}
 {item.customSpecs && (
 <div className="mt-2">
 <p className="text-xs text-gray-600">Custom Specifications:</p>
 <div className="mt-1 flex flex-wrap gap-2">
 {Object.entries(item.customSpecs).map(([key, value]) => (
 <span key={key} className="text-xs bg-white px-2 py-1 rounded border">
 {key}: {String(value)}
 </span>
 ))}
 </div>
 </div>
 )}
 </div>
 
 {item.designFileUrl && (
 <button
 onClick={() => window.open(item.designFileUrl, '_blank')}
 className="ml-4 text-teal-600 hover:text-teal-700"
>
 <ExternalLink className="w-4 h-4" />
 </button>
 )}
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="bg-gray-50 rounded-lg p-4">
 <p className="text-sm text-gray-600">Order item details not available</p>
 </div>
 )}

 {/* Special Instructions */}
 {materialOrder.specialInstructions && (
 <div>
 <h4 className="font-medium text-gray-900 mb-2">Special Instructions</h4>
 <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
 <p className="text-sm text-yellow-800">{materialOrder.specialInstructions}</p>
 </div>
 </div>
 )}
 </div>
 )}

 {/* Action Buttons */}
 <div className="flex gap-3 pt-4">
 <button
 onClick={onContactSupplier}
 className="flex-1 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors inline-flex items-center justify-center"
>
 <MessageCircle className="w-4 h-4 mr-2" />
 Contact Supplier
 </button>
 
 {materialOrder.status === 'QUOTED' && (
 <button
 onClick={onModifyOrder}
 className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
>
 <Edit className="w-4 h-4 mr-2" />
 Review Order
 </button>
 )}
 
 {['PROCESSING', 'PRINTED', 'SHIPPED'].includes(materialOrder.status) && (
 <button
 onClick={onRequestUpdate}
 className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center justify-center"
>
 <RefreshCw className="w-4 h-4 mr-2" />
 Request Update
 </button>
 )}
 
 {materialOrder.trackingNumber && (
 <button
 onClick={onTrackShipment}
 className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center justify-center"
>
 <Truck className="w-4 h-4 mr-2" />
 Track Package
 </button>
 )}
 </div>

 {/* Order Issues */}
 {materialOrder.status === 'FAILED' && (
 <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
 <div className="flex items-start">
 <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
 <div className="flex-1">
 <h4 className="font-medium text-red-800">Order Issue</h4>
 <p className="text-sm text-red-700 mt-1">
 {materialOrder.notes || 'There was an issue with your material order. Please contact the supplier or our support team.'}
 </p>
 <div className="mt-3 flex gap-2">
 <button
 onClick={onContactSupplier}
 className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
>
 Contact Supplier
 </button>
 <button
 onClick={() => console.log('Escalate order issue')}
 className="text-sm bg-white text-red-600 border border-red-300 px-3 py-1 rounded hover:bg-red-50"
>
 Get Support
 </button>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 );
};