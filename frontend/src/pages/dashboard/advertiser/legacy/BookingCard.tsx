import React from 'react';
import { 
  MapPin, Eye, Download, FileImage, Truck, Clock, CheckCircle, 
  AlertCircle, Package, Camera, Calendar, DollarSign, Navigation,
  Star, User, Wrench, ChevronDown, ChevronUp
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

export const EnhancedBookingCard: React.FC<EnhancedBookingCardProps> = ({ 
  booking, 
  expandedBooking, 
  onToggleExpand 
}) => {
  const isExpanded = expandedBooking === booking.id;
  const statusBadge = getStatusBadge(booking.status);
  const installationBadge = getInstallationStatusBadge(booking.installationStatus);
  const materialBadge = getMaterialOrderStatusBadge(booking.materialStatus);
  
  // Calculate urgency for installation deadline
  const daysUntilDeadline = booking.installDeadline ? 
    calculateDaysUntilDeadline(booking.installDeadline) : null;
  const isUrgent = daysUntilDeadline !== null && daysUntilDeadline <= 3;

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
                {booking.installationCost && booking.installationCost > 0 && (
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
                {booking.orderTimeline && booking.orderTimeline.length > 0 && (
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

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
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
              
              {booking.materialStatus === 'DELIVERED' && booking.installationStatus === 'PENDING' && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('📞 Contact property owner about installation:', booking.id);
                  }}
                  className="flex-1 bg-yellow-100 text-yellow-700 px-3 py-2 rounded-lg hover:bg-yellow-200 text-sm inline-flex items-center justify-center transition-colors"
                >
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Follow Up Install
                </button>
              )}
              
              {booking.installationStatus === 'COMPLETED' && !booking.verificationImageUrl && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('📸 Request verification photo:', booking.id);
                  }}
                  className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 text-sm inline-flex items-center justify-center transition-colors"
                >
                  <Camera className="w-4 h-4 mr-1" />
                  Request Photo
                </button>
              )}
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('📊 View analytics:', booking.id);
                }}
                className="flex-1 bg-teal-600 text-white px-3 py-2 rounded-lg hover:bg-teal-700 text-sm inline-flex items-center justify-center transition-colors"
              >
                <Navigation className="w-4 h-4 mr-1" />
                Analytics
              </button>
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
    </div>
  );
};