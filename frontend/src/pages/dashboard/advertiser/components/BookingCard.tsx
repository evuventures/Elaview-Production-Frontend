import React from 'react';
import { MapPin, Eye, Download, FileImage, Truck } from 'lucide-react';
import { BookingCardProps } from '../types';
import { getStatusBadge, formatDateRange } from '../utils';

export const BookingCard: React.FC<BookingCardProps> = ({ 
  booking, 
  expandedBooking, 
  onToggleExpand 
}) => {
  const isExpanded = expandedBooking === booking.id;
  const statusBadge = getStatusBadge(booking.status);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
      <div 
        className="p-4 cursor-pointer"
        onClick={() => onToggleExpand(isExpanded ? null : booking.id)}
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">
              {booking.spaceName || 'Space Name'}
            </h3>
            <p className="text-sm text-gray-600 flex items-center mt-1">
              <MapPin className="w-3 h-3 mr-1" />
              {booking.location || 'Location'}
            </p>
          </div>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
            <statusBadge.icon className="w-3 h-3 mr-1" />
            {statusBadge.text}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Campaign Period</p>
            <p className="font-medium">
              {formatDateRange(booking.startDate, booking.endDate)}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Total Cost</p>
            <p className="font-bold text-green-600">
              {typeof booking.totalCost === 'number' ? `$${booking.totalCost}` : 'N/A'}
            </p>
          </div>
        </div>

        {booking.materialStatus === 'SHIPPED' && booking.estimatedDelivery && (
          <div className="mt-3 p-2 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800 flex items-center">
              <Truck className="w-3 h-3 mr-1" />
              Materials arriving by {new Date(booking.estimatedDelivery).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="space-y-4">
            {/* Cost Breakdown */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Cost Breakdown</h4>
              <div className="bg-white rounded p-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Space Rental</span>
                  <span>${booking.spaceCost || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Materials ({booking.materialType || 'N/A'})</span>
                  <span>${booking.materialCost || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform Fee (5%)</span>
                  <span>${booking.platformFee?.toFixed(2) || 'N/A'}</span>
                </div>
                <div className="flex justify-between font-medium pt-2 border-t">
                  <span>Total</span>
                  <span className="text-green-600">${booking.totalCost || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Material & Shipping Info */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Material Details</h4>
              <div className="bg-white rounded p-3 space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-gray-600">Type</p>
                    <p className="font-medium">{booking.materialType || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Dimensions</p>
                    <p className="font-medium">{booking.dimensions || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Order Status</p>
                    <p className="font-medium text-blue-600">{booking.materialStatus || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Installation</p>
                    <p className="font-medium">{booking.installationStatus || 'N/A'}</p>
                  </div>
                </div>
                {booking.trackingNumber && (
                  <div className="pt-2 border-t">
                    <p className="text-gray-600">Tracking</p>
                    <a 
                      href={booking.trackingUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 font-medium text-xs"
                    >
                      {booking.trackingNumber}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button 
                onClick={() => console.log('👁️ View details for booking:', booking.id)}
                className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 text-sm inline-flex items-center justify-center"
              >
                <Eye className="w-4 h-4 mr-1" />
                View Details
              </button>
              <button 
                onClick={() => console.log('📥 Download install guide for:', booking.id)}
                className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 text-sm inline-flex items-center justify-center"
              >
                <Download className="w-4 h-4 mr-1" />
                Install Guide
              </button>
              <button 
                onClick={() => console.log('🖼️ View design for:', booking.id)}
                className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 text-sm inline-flex items-center justify-center"
              >
                <FileImage className="w-4 h-4 mr-1" />
                View Design
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};