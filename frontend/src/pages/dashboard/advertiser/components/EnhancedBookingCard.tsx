import React, { useState } from 'react';
import { 
 MapPin, Eye, Download, FileImage, Truck, Clock, CheckCircle, 
 AlertCircle, Package, Camera, Calendar, DollarSign, Navigation,
 Star, User, Wrench, ChevronDown, ChevronUp, MessageCircle, Phone, X,
 BarChart3, Settings, TrendingDown
} from 'lucide-react';
import { EnhancedBookingCardProps } from '../types';
import { 
 getStatusBadge, 
 formatDateRange, 
 getInstallationStatusBadge,
 getMaterialOrderStatusBadge,
 formatPrice,
 calculateDaysUntilDeadline
} from '../utils';

// Import Phase 2 components
import { InstallationStatusTracker } from './InstallationStatusTracker';
import { InstallationPhotosViewer } from './InstallationPhotosViewer';
import { InstallationCommunication } from './InstallationCommunication';

// Import Phase 3 components
import { MaterialOrderTracker } from './MaterialOrderTracker';
import { SupplierDashboard } from './SupplierDashboard';
import { OrderTimeline } from './OrderTimeline';
import { CostOptimizer } from './CostOptimizer';
import { DeliveryCoordinator } from './DeliveryCoordinator';

export const EnhancedBookingCard: React.FC<EnhancedBookingCardProps> = ({ 
 booking, 
 expandedBooking, 
 onToggleExpand 
}) => {
 // Modal states for Phase 2 installation components
 const [showInstallationTracker, setShowInstallationTracker] = useState(false);
 const [showPhotosViewer, setShowPhotosViewer] = useState(false);
 const [showCommunication, setShowCommunication] = useState(false);
 const [installationMessages, setInstallationMessages] = useState([]);

 // Modal states for Phase 3 material order components
 const [showMaterialOrderTracker, setShowMaterialOrderTracker] = useState(false);
 const [showSupplierDashboard, setShowSupplierDashboard] = useState(false);
 const [showOrderTimeline, setShowOrderTimeline] = useState(false);
 const [showCostOptimizer, setShowCostOptimizer] = useState(false);
 const [showDeliveryCoordinator, setShowDeliveryCoordinator] = useState(false);

 const isExpanded = expandedBooking === booking.id;
 const statusBadge = getStatusBadge(booking.status);
 const installationBadge = getInstallationStatusBadge(booking.installationStatus);
 const materialBadge = getMaterialOrderStatusBadge(booking.materialStatus);
 
 // Calculate urgency for installation deadline
 const daysUntilDeadline = booking.installDeadline ? 
 calculateDaysUntilDeadline(booking.installDeadline) : null;
 const isUrgent = daysUntilDeadline !== null && daysUntilDeadline <= 3;

 // Installation component handlers
 const handleViewInstallationProgress = () => {
 setShowInstallationTracker(true);
 };

 const handleViewInstallationPhotos = () => {
 setShowPhotosViewer(true);
 };

 const handleContactOwner = () => {
 setShowCommunication(true);
 };

 const handleInstallationMessage = (message: string) => {
 console.log('📧 Sending installation message:', message);
 // TODO: Implement API call to send message
 };

 const handleRequestCall = () => {
 console.log('📞 Requesting call for booking:', booking.id);
 // TODO: Implement API call to request call
 };

 const handleEscalateIssue = () => {
 console.log('🚨 Escalating issue for booking:', booking.id);
 // TODO: Implement API call to escalate issue
 };

 // Phase 3: Material order component handlers
 const handleViewMaterialOrder = () => {
 setShowMaterialOrderTracker(true);
 };

 const handleViewSuppliers = () => {
 setShowSupplierDashboard(true);
 };

 const handleViewOrderTimeline = () => {
 setShowOrderTimeline(true);
 };

 const handleOptimizeCosts = () => {
 setShowCostOptimizer(true);
 };

 const handleCoordinateDelivery = () => {
 setShowDeliveryCoordinator(true);
 };

 const handleContactSupplier = () => {
 console.log('📞 Contacting supplier for booking:', booking.id);
 // TODO: Implement API call to contact supplier
 };

 const handleTrackShipment = () => {
 console.log('📦 Tracking shipment for booking:', booking.id);
 if (booking.trackingUrl) {
 window.open(booking.trackingUrl, '_blank');
 }
 };

 return (
 <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
 {/* Main Card Content */}
 <div 
 className="p-4 cursor-pointer"
 onClick={() => onToggleExpand(isExpanded ? null : booking.id)}
>
 {/* Header with Space Name and Primary Status */}
 <div className="flex justify-between items-start mb-3">
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-1">
 <h3 className="font-semibold text-gray-900">
 {booking.spaceName || 'Space Name'}
 </h3>
 {booking.verificationImageUrl && (
 <div className="bg-green-100 p-1 rounded-full">
 <CheckCircle className="w-3 h-3 text-green-600" />
 </div>
 )}
 </div>
 <p className="text-sm text-gray-600 flex items-center">
 <MapPin className="w-3 h-3 mr-1" />
 {booking.location || 'Location'}
 </p>
 {booking.propertyOwnerName && (
 <p className="text-xs text-gray-500 flex items-center mt-1">
 <User className="w-3 h-3 mr-1" />
 Owner: {booking.propertyOwnerName}
 </p>
 )}
 </div>
 
 {/* Primary Status Badge */}
 <div className="flex flex-col items-end gap-1">
 <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
 <statusBadge.icon className="w-3 h-3 mr-1" />
 {statusBadge.text}
 </span>
 {isExpanded ? (
 <ChevronUp className="w-4 h-4 text-gray-400" />
 ) : (
 <ChevronDown className="w-4 h-4 text-gray-400" />
 )}
 </div>
 </div>
 
 {/* Quick Stats Grid */}
 <div className="grid grid-cols-2 gap-4 text-sm mb-3">
 <div>
 <p className="text-gray-600">Campaign Period</p>
 <p className="font-medium">
 {formatDateRange(booking.startDate, booking.endDate)}
 </p>
 </div>
 <div>
 <p className="text-gray-600">Total Investment</p>
 <p className="font-bold text-green-600">
 {formatPrice(booking.totalCost)}
 </p>
 </div>
 </div>

 {/* Status Pills Row */}
 <div className="flex gap-2 mb-3">
 <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${materialBadge.color}`}>
 <materialBadge.icon className="w-3 h-3 mr-1" />
 {materialBadge.text}
 </span>
 <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${installationBadge.color}`}>
 <installationBadge.icon className="w-3 h-3 mr-1" />
 {installationBadge.text}
 </span>
 </div>

 {/* Urgent Deadline Warning */}
 {isUrgent && booking.installDeadline && (
 <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-3">
 <p className="text-xs text-red-800 flex items-center">
 <AlertCircle className="w-3 h-3 mr-1" />
 Urgent: Installation deadline in {daysUntilDeadline} day{daysUntilDeadline === 1 ? '' : 's'} 
 ({new Date(booking.installDeadline).toLocaleDateString()})
 </p>
 </div>
 )}

 {/* Material Shipping Alert */}
 {booking.materialStatus === 'SHIPPED' && booking.estimatedDelivery && (
 <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
 <p className="text-xs text-blue-800 flex items-center">
 <Truck className="w-3 h-3 mr-1" />
 Materials arriving by {new Date(booking.estimatedDelivery).toLocaleDateString()}
 {booking.trackingNumber && (
 <span className="ml-2">
 (Track: 
 <a 
 href={booking.trackingUrl || '#'} 
 target="_blank" 
 rel="noopener noreferrer"
 className="text-blue-600 hover:text-blue-700 font-medium ml-1"
 onClick={(e) => e.stopPropagation()}
>
 {booking.trackingNumber}
 </a>)
 </span>
 )}
 </p>
 </div>
 )}
 </div>

 {/* Expanded Details */}
 {isExpanded && (
 <div className="border-t border-gray-200 bg-gray-50">
 <div className="p-4 space-y-4">
 
 {/* Cost Breakdown */}
 <div>
 <h4 className="font-medium text-gray-900 mb-2 flex items-center">
 <DollarSign className="w-4 h-4 mr-1" />
 Investment Breakdown
 </h4>
 <div className="bg-white rounded-lg p-3 space-y-2 text-sm">
 <div className="flex justify-between">
 <span className="text-gray-600">Space Rental ({booking.duration || '30'} days)</span>
 <span>{formatPrice(booking.spaceCost)}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-gray-600">Materials & Printing</span>
 <span>{formatPrice(booking.materialCost)}</span>
 </div>
 {booking.installationCost && booking.installationCost> 0 && (
 <div className="flex justify-between">
 <span className="text-gray-600">Professional Installation</span>
 <span>{formatPrice(booking.installationCost)}</span>
 </div>
 )}
 <div className="flex justify-between">
 <span className="text-gray-600">Platform Fee (5%)</span>
 <span>{formatPrice(booking.platformFee)}</span>
 </div>
 <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
 <span>Total Investment</span>
 <span className="text-green-600">{formatPrice(booking.totalCost)}</span>
 </div>
 </div>
 </div>

 {/* Material & Order Details */}
 <div>
 <h4 className="font-medium text-gray-900 mb-2 flex items-center">
 <Package className="w-4 h-4 mr-1" />
 Material Order Details
 </h4>
 <div className="bg-white rounded-lg p-3 space-y-2 text-sm">
 <div className="grid grid-cols-2 gap-3">
 <div>
 <p className="text-gray-600">Material Type</p>
 <p className="font-medium">{booking.materialType || 'N/A'}</p>
 </div>
 <div>
 <p className="text-gray-600">Dimensions</p>
 <p className="font-medium">{booking.dimensions || 'N/A'}</p>
 </div>
 <div>
 <p className="text-gray-600">Order Status</p>
 <p className="font-medium text-blue-600">
 {booking.materialStatus?.replace('_', ' ').toLowerCase() || 'N/A'}
 </p>
 </div>
 <div>
 <p className="text-gray-600">Supplier</p>
 <p className="font-medium">{booking.supplierName || 'Standard Print Shop'}</p>
 </div>
 </div>
 
 {/* Order Timeline */}
 {booking.orderTimeline && booking.orderTimeline.length> 0 && (
 <div className="pt-2 border-t border-gray-100">
 <p className="font-medium text-gray-700 mb-2">Order Timeline</p>
 <div className="space-y-1">
 {booking.orderTimeline.map((event, index) => (
 <div key={index} className="flex justify-between text-xs">
 <span className="text-gray-600">{event.status}</span>
 <span className="text-gray-500">
 {new Date(event.timestamp).toLocaleDateString()}
 </span>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 </div>

 {/* Installation Details */}
 <div>
 <h4 className="font-medium text-gray-900 mb-2 flex items-center">
 <Wrench className="w-4 h-4 mr-1" />
 Installation Details
 </h4>
 <div className="bg-white rounded-lg p-3 space-y-2 text-sm">
 <div className="grid grid-cols-2 gap-3">
 <div>
 <p className="text-gray-600">Installation Type</p>
 <p className="font-medium">
 {booking.installerType === 'SELF_INSTALL' ? 'Property Owner (DIY)' :
 booking.installerType === 'PLATFORM_INSTALLER' ? 'Professional Installer' :
 booking.installerType === 'THIRD_PARTY' ? 'Third Party' : 'N/A'}
 </p>
 </div>
 <div>
 <p className="text-gray-600">Status</p>
 <p className="font-medium text-purple-600">
 {booking.installationStatus?.replace('_', ' ').toLowerCase() || 'N/A'}
 </p>
 </div>
 {booking.scheduledInstallDate && (
 <>
 <div>
 <p className="text-gray-600">Scheduled Date</p>
 <p className="font-medium">
 {new Date(booking.scheduledInstallDate).toLocaleDateString()}
 </p>
 </div>
 <div>
 <p className="text-gray-600">Est. Duration</p>
 <p className="font-medium">{booking.estimatedInstallTime || '30'} minutes</p>
 </div>
 </>
 )}
 </div>

 {/* Professional Installer Details */}
 {booking.installerType === 'PLATFORM_INSTALLER' && booking.installerDetails && (
 <div className="pt-2 border-t border-gray-100">
 <div className="flex items-center justify-between">
 <div className="flex items-center">
 <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
 <User className="w-4 h-4 text-gray-600" />
 </div>
 <div>
 <p className="font-medium">{booking.installerDetails.name}</p>
 <div className="flex items-center">
 <Star className="w-3 h-3 text-yellow-400 mr-1" />
 <span className="text-xs text-gray-600">
 {booking.installerDetails.rating} ({booking.installerDetails.reviewCount} reviews)
 </span>
 </div>
 </div>
 </div>
 <button 
 className="text-teal-600 hover:text-teal-700 text-xs font-medium"
 onClick={(e) => {
 e.stopPropagation();
 console.log('Contact installer:', booking.installerDetails?.id);
 }}
>
 Contact
 </button>
 </div>
 </div>
 )}
 </div>
 </div>

 {/* Action Buttons - Enhanced with Installation & Material Order Features */}
 <div className="space-y-3 pt-2">
 {/* Primary Action Row */}
 <div className="flex gap-2">
 {/* Material Order Tracking - Show if materials ordered */}
 {booking.materialStatus && booking.materialStatus !== 'NOT_ORDERED' && (
 <button 
 onClick={(e) => {
 e.stopPropagation();
 handleViewMaterialOrder();
 }}
 className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm inline-flex items-center justify-center transition-colors"
>
 <Package className="w-4 h-4 mr-1" />
 Track Materials
 </button>
 )}
 
 {/* Installation Progress - Always show if materials ordered */}
 {booking.materialStatus && booking.materialStatus !== 'NOT_ORDERED' && (
 <button 
 onClick={(e) => {
 e.stopPropagation();
 handleViewInstallationProgress();
 }}
 className="flex-1 bg-teal-600 text-white px-3 py-2 rounded-lg hover:bg-teal-700 text-sm inline-flex items-center justify-center transition-colors"
>
 <Wrench className="w-4 h-4 mr-1" />
 Installation
 </button>
 )}
 
 {/* View Photos - Show if photos available */}
 {(booking.verificationImageUrl || (booking.installationPhotos && booking.installationPhotos.length> 0)) && (
 <button 
 onClick={(e) => {
 e.stopPropagation();
 handleViewInstallationPhotos();
 }}
 className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm inline-flex items-center justify-center transition-colors"
>
 <Camera className="w-4 h-4 mr-1" />
 Photos
 </button>
 )}

 {/* Default View Details if no materials yet */}
 {(!booking.materialStatus || booking.materialStatus === 'NOT_ORDERED') && (
 <button 
 onClick={(e) => {
 e.stopPropagation();
 console.log('👁️ View campaign details:', booking.id);
 }}
 className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 text-sm inline-flex items-center justify-center transition-colors"
>
 <Eye className="w-4 h-4 mr-1" />
 View Details
 </button>
 )}
 
 {/* Analytics - Always show for campaigns */}
 <button 
 onClick={(e) => {
 e.stopPropagation();
 console.log('📊 View analytics:', booking.id);
 }}
 className="flex-1 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 text-sm inline-flex items-center justify-center transition-colors"
>
 <BarChart3 className="w-4 h-4 mr-1" />
 Analytics
 </button>
 </div>

 {/* Secondary Action Row - Material Order Management */}
 {booking.materialStatus && booking.materialStatus !== 'NOT_ORDERED' && (
 <div className="flex gap-2">
 {/* Cost Optimizer - Show if order exists */}
 <button 
 onClick={(e) => {
 e.stopPropagation();
 handleOptimizeCosts();
 }}
 className="flex-1 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg hover:bg-orange-200 text-xs inline-flex items-center justify-center transition-colors"
>
 <TrendingDown className="w-3 h-3 mr-1" />
 Optimize Costs
 </button>
 
 {/* Delivery Coordination */}
 <button 
 onClick={(e) => {
 e.stopPropagation();
 handleCoordinateDelivery();
 }}
 className="flex-1 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 text-xs inline-flex items-center justify-center transition-colors"
>
 <Truck className="w-3 h-3 mr-1" />
 Delivery
 </button>
 
 {/* Order Timeline */}
 <button 
 onClick={(e) => {
 e.stopPropagation();
 handleViewOrderTimeline();
 }}
 className="flex-1 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 text-xs inline-flex items-center justify-center transition-colors"
>
 <Clock className="w-3 h-3 mr-1" />
 Timeline
 </button>
 
 {/* Supplier Dashboard */}
 <button 
 onClick={(e) => {
 e.stopPropagation();
 handleViewSuppliers();
 }}
 className="flex-1 bg-teal-100 text-teal-700 px-3 py-1.5 rounded-lg hover:bg-teal-200 text-xs inline-flex items-center justify-center transition-colors"
>
 <Settings className="w-3 h-3 mr-1" />
 Suppliers
 </button>
 </div>
 )}

 {/* Contextual Action Row - Communication & Urgent Actions */}
 {(booking.materialStatus === 'DELIVERED' || booking.installationStatus === 'PENDING' || booking.installationStatus === 'SCHEDULED') && (
 <div className="flex gap-2">
 <button 
 onClick={(e) => {
 e.stopPropagation();
 handleContactOwner();
 }}
 className="flex-1 bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-lg hover:bg-yellow-200 text-xs inline-flex items-center justify-center transition-colors"
>
 <MessageCircle className="w-3 h-3 mr-1" />
 Contact Owner
 </button>
 
 {booking.trackingNumber && (
 <button 
 onClick={(e) => {
 e.stopPropagation();
 handleTrackShipment();
 }}
 className="flex-1 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-200 text-xs inline-flex items-center justify-center transition-colors"
>
 <Navigation className="w-3 h-3 mr-1" />
 Track Package
 </button>
 )}
 </div>
 )}
 </div>

 {/* Campaign Performance Preview (if active) */}
 {booking.status === 'active' && booking.performanceData && (
 <div className="pt-3 border-t border-gray-200">
 <h4 className="font-medium text-gray-900 mb-2">Campaign Performance</h4>
 <div className="bg-gradient-to-r from-teal-50 to-green-50 rounded-lg p-3">
 <div className="grid grid-cols-3 gap-4 text-sm">
 <div className="text-center">
 <p className="font-bold text-lg text-gray-900">
 {booking.performanceData.impressions?.toLocaleString() || '0'}
 </p>
 <p className="text-gray-600">Impressions</p>
 </div>
 <div className="text-center">
 <p className="font-bold text-lg text-gray-900">
 {booking.performanceData.clicks?.toLocaleString() || '0'}
 </p>
 <p className="text-gray-600">Engagements</p>
 </div>
 <div className="text-center">
 <p className="font-bold text-lg text-green-600">
 ${booking.performanceData.estimatedValue?.toFixed(2) || '0.00'}
 </p>
 <p className="text-gray-600">Est. Value</p>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 )}

 {/* Phase 2: Installation Status Tracker Modal */}
 {showInstallationTracker && (
 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
 <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
 <div className="p-2">
 <button
 onClick={() => setShowInstallationTracker(false)}
 className="float-right p-2 text-gray-400 hover:text-gray-600"
>
 <X className="w-6 h-6" />
 </button>
 </div>
 <div className="px-6 pb-6">
 <InstallationStatusTracker
 booking={booking}
 onRequestUpdate={() => console.log('Request update')}
 onContactOwner={handleContactOwner}
 onViewPhotos={handleViewInstallationPhotos}
 onReportIssue={handleEscalateIssue}
 />
 </div>
 </div>
 </div>
 )}

 {/* Phase 2: Installation Photos Viewer Modal */}
 <InstallationPhotosViewer
 booking={booking}
 showModal={showPhotosViewer}
 onClose={() => setShowPhotosViewer(false)}
 onRequestRetake={() => console.log('Request photo retake')}
 onApprovePhotos={() => console.log('Approve photos')}
 onReportIssue={handleEscalateIssue}
 />

 {/* Phase 2: Installation Communication Modal */}
 <InstallationCommunication
 booking={booking}
 messages={installationMessages}
 showModal={showCommunication}
 onClose={() => setShowCommunication(false)}
 onSendMessage={handleInstallationMessage}
 onRequestCall={handleRequestCall}
 onEscalateIssue={handleEscalateIssue}
 />

 {/* Phase 3: Material Order Tracker Modal */}
 {showMaterialOrderTracker && (
 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
 <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
 <div className="p-2">
 <button
 onClick={() => setShowMaterialOrderTracker(false)}
 className="float-right p-2 text-gray-400 hover:text-gray-600"
>
 <X className="w-6 h-6" />
 </button>
 </div>
 <div className="px-6 pb-6">
 <MaterialOrderTracker
 booking={booking}
 materialOrder={booking.materialOrder || null}
 onContactSupplier={handleContactSupplier}
 onRequestUpdate={() => console.log('Request material order update')}
 onModifyOrder={() => console.log('Modify material order')}
 onTrackShipment={handleTrackShipment}
 onViewInvoice={() => console.log('View material order invoice')}
 />
 </div>
 </div>
 </div>
 )}

 {/* Phase 3: Supplier Dashboard Modal */}
 {showSupplierDashboard && (
 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
 <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
 <div className="p-2">
 <button
 onClick={() => setShowSupplierDashboard(false)}
 className="float-right p-2 text-gray-400 hover:text-gray-600"
>
 <X className="w-6 h-6" />
 </button>
 </div>
 <div className="px-6 pb-6">
 <SupplierDashboard
 suppliers={booking.availableSuppliers || []}
 selectedSupplierId={booking.materialOrder?.supplierId}
 onSelectSupplier={(supplierId) => console.log('Select supplier:', supplierId)}
 onContactSupplier={handleContactSupplier}
 onViewSupplierDetails={(supplierId) => console.log('View supplier details:', supplierId)}
 onCompareSuppliers={() => console.log('Compare suppliers')}
 onRequestQuote={(supplierId) => console.log('Request quote from supplier:', supplierId)}
 />
 </div>
 </div>
 </div>
 )}

 {/* Phase 3: Order Timeline Modal */}
 {showOrderTimeline && (
 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
 <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
 <div className="p-2">
 <button
 onClick={() => setShowOrderTimeline(false)}
 className="float-right p-2 text-gray-400 hover:text-gray-600"
>
 <X className="w-6 h-6" />
 </button>
 </div>
 <div className="px-6 pb-6">
 <OrderTimeline
 materialOrder={booking.materialOrder!}
 timelineEvents={booking.orderTimeline || []}
 onViewDocument={(url) => window.open(url, '_blank')}
 onContactSupplier={handleContactSupplier}
 onDownloadInvoice={() => console.log('Download invoice')}
 />
 </div>
 </div>
 </div>
 )}

 {/* Phase 3: Cost Optimizer Modal */}
 {showCostOptimizer && (
 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
 <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
 <div className="p-2">
 <button
 onClick={() => setShowCostOptimizer(false)}
 className="float-right p-2 text-gray-400 hover:text-gray-600"
>
 <X className="w-6 h-6" />
 </button>
 </div>
 <div className="px-6 pb-6">
 <CostOptimizer
 currentOrder={booking.materialOrder}
 alternatives={booking.costAlternatives || []}
 recommendations={booking.costRecommendations || []}
 onSelectAlternative={(altId) => console.log('Select alternative:', altId)}
 onRequestQuote={(supplierId) => console.log('Request quote:', supplierId)}
 onApplyOptimization={(recId) => console.log('Apply optimization:', recId)}
 onViewAnalytics={() => console.log('View cost analytics')}
 />
 </div>
 </div>
 </div>
 )}

 {/* Phase 3: Delivery Coordinator Modal */}
 {showDeliveryCoordinator && (
 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
 <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
 <div className="p-2">
 <button
 onClick={() => setShowDeliveryCoordinator(false)}
 className="float-right p-2 text-gray-400 hover:text-gray-600"
>
 <X className="w-6 h-6" />
 </button>
 </div>
 <div className="px-6 pb-6">
 <DeliveryCoordinator
 booking={booking}
 materialOrder={booking.materialOrder || null}
 onScheduleDelivery={(date, timeSlot) => console.log('Schedule delivery:', date, timeSlot)}
 onRescheduleDelivery={(date, timeSlot) => console.log('Reschedule delivery:', date, timeSlot)}
 onContactDriver={() => console.log('Contact driver')}
 onContactOwner={handleContactOwner}
 onUpdateDeliveryInstructions={(instructions) => console.log('Update delivery instructions:', instructions)}
 />
 </div>
 </div>
 </div>
 )}
 </div>
 );
};