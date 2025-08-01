import React, { useState } from 'react';
import { 
  Truck, Calendar, MapPin, Clock, CheckCircle, 
  AlertCircle, Phone, MessageCircle, Package,
  Navigation, User, Building2, Wrench,
  ChevronLeft, ChevronRight, Edit, Save, X
} from 'lucide-react';
import { DeliveryCoordinatorProps } from '../types';
import { formatDeliveryDate, calculateDaysUntilDeadline } from '../utils';

export const DeliveryCoordinator: React.FC<DeliveryCoordinatorProps> = ({ 
  booking,
  materialOrder,
  availableTimeSlots,
  onScheduleDelivery,
  onRescheduleDelivery,
  onContactDriver,
  onContactOwner,
  onUpdateDeliveryInstructions
}) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [deliveryInstructions, setDeliveryInstructions] = useState(
    booking.deliveryInstructions || ''
  );
  const [isEditing, setIsEditing] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  if (!materialOrder) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-8">
          <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Delivery to Schedule</h3>
          <p className="text-gray-600">
            Delivery coordination will be available once materials are ordered.
          </p>
        </div>
      </div>
    );
  }

  const isDeliveryScheduled = !!materialOrder.scheduledDeliveryDate;
  const isDelivered = materialOrder.status === 'DELIVERED';
  const isInTransit = materialOrder.status === 'SHIPPED';
  const daysUntilDelivery = materialOrder.estimatedDelivery ? 
    calculateDaysUntilDelivery(materialOrder.estimatedDelivery) : null;
  const daysUntilInstallation = booking.installDeadline ? 
    calculateDaysUntilDeadline(booking.installDeadline) : null;

  // Generate next 14 days for calendar
  const getNext14Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const getDeliveryStatusColor = () => {
    if (isDelivered) return 'bg-green-100 text-green-800 border-green-200';
    if (isInTransit) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (isDeliveryScheduled) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getDeliveryStatusIcon = () => {
    if (isDelivered) return CheckCircle;
    if (isInTransit) return Truck;
    if (isDeliveryScheduled) return Calendar;
    return Clock;
  };

  const StatusIcon = getDeliveryStatusIcon();

  const handleSaveInstructions = () => {
    onUpdateDeliveryInstructions(deliveryInstructions);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Truck className="w-5 h-5 mr-2 text-gray-600" />
            Delivery Coordination
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Schedule and track material delivery to your installation site
          </p>
        </div>
        
        {/* Delivery Status */}
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getDeliveryStatusColor()}`}>
          <StatusIcon className="w-4 h-4 mr-1" />
          {isDelivered ? 'Delivered' : 
           isInTransit ? 'In Transit' : 
           isDeliveryScheduled ? 'Scheduled' : 'Pending Schedule'}
        </div>
      </div>

      {/* Delivery Timeline Coordination */}
      <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Timeline Coordination</h4>
        <div className="grid grid-cols-3 gap-4">
          {/* Material Production */}
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Production</p>
            <p className="text-xs text-gray-600">
              {materialOrder.status === 'PROCESSING' ? 'In Progress' : 
               materialOrder.status === 'PRINTED' ? 'Complete' : 'Pending'}
            </p>
            {materialOrder.estimatedProductionComplete && (
              <p className="text-xs text-blue-600">
                {formatDeliveryDate(materialOrder.estimatedProductionComplete)}
              </p>
            )}
          </div>

          {/* Delivery */}
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Truck className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Delivery</p>
            <p className="text-xs text-gray-600">
              {isDelivered ? 'Complete' : 
               isInTransit ? 'In Transit' : 
               isDeliveryScheduled ? 'Scheduled' : 'TBD'}
            </p>
            {materialOrder.estimatedDelivery && (
              <p className="text-xs text-purple-600">
                {formatDeliveryDate(materialOrder.estimatedDelivery)}
              </p>
            )}
          </div>

          {/* Installation */}
          <div className="text-center">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Wrench className="w-6 h-6 text-teal-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Installation</p>
            <p className="text-xs text-gray-600">
              {booking.installationStatus === 'COMPLETED' ? 'Complete' :
               booking.installationStatus === 'IN_PROGRESS' ? 'In Progress' :
               booking.scheduledInstallDate ? 'Scheduled' : 'TBD'}
            </p>
            {booking.installDeadline && (
              <p className="text-xs text-teal-600">
                Due: {formatDeliveryDate(booking.installDeadline)}
              </p>
            )}
          </div>
        </div>

        {/* Timeline Alerts */}
        {daysUntilInstallation !== null && daysUntilDelivery !== null && 
         daysUntilDelivery >= daysUntilInstallation && (
          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
              <p className="text-sm text-yellow-800">
                <strong>Timeline Risk:</strong> Delivery may arrive too close to installation deadline. 
                Consider expedited shipping or rescheduling installation.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Current Delivery Status */}
      {isDelivered ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
              <div>
                <h4 className="font-medium text-green-800">Delivery Complete</h4>
                <p className="text-sm text-green-700">
                  Materials delivered on {formatDeliveryDate(materialOrder.deliveredDate!)}
                </p>
              </div>
            </div>
            {booking.installationStatus === 'PENDING' && (
              <button
                onClick={onContactOwner}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
              >
                Notify Owner to Install
              </button>
            )}
          </div>
        </div>
      ) : isInTransit ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Truck className="w-6 h-6 text-blue-600 mr-3" />
              <div>
                <h4 className="font-medium text-blue-800">In Transit</h4>
                <p className="text-sm text-blue-700">
                  Expected delivery: {formatDeliveryDate(materialOrder.estimatedDelivery!)}
                </p>
                {materialOrder.trackingNumber && (
                  <p className="text-xs text-blue-600 mt-1">
                    Tracking: {materialOrder.trackingNumber}
                  </p>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              {materialOrder.driverContact && (
                <button
                  onClick={onContactDriver}
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm"
                >
                  <Phone className="w-4 h-4 mr-1" />
                  Call Driver
                </button>
              )}
              <button
                onClick={() => console.log('Track shipment')}
                className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 text-sm"
              >
                Track Package
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Delivery Scheduling */
        <div className="space-y-6">
          {/* Delivery Address */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Delivery Location</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-600 mr-3 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{booking.spaceName}</p>
                  <p className="text-sm text-gray-600">{booking.location}</p>
                  {booking.deliveryAddress && (
                    <p className="text-sm text-gray-600 mt-1">
                      {typeof booking.deliveryAddress === 'string' 
                        ? booking.deliveryAddress 
                        : `${booking.deliveryAddress.street}, ${booking.deliveryAddress.city}`}
                    </p>
                  )}
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Schedule Delivery */}
          {!isDeliveryScheduled ? (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Schedule Delivery</h4>
              
              {/* Quick Schedule Options */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <button
                  onClick={() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    setSelectedDate(tomorrow.toISOString().split('T')[0]);
                    setSelectedTimeSlot('morning');
                  }}
                  className="p-4 border border-gray-300 rounded-lg hover:border-teal-300 hover:bg-teal-50 text-left"
                >
                  <div className="font-medium text-gray-900">ASAP Delivery</div>
                  <div className="text-sm text-gray-600">Tomorrow morning (if available)</div>
                </button>
                
                <button
                  onClick={() => {
                    const optimal = new Date();
                    optimal.setDate(optimal.getDate() + (daysUntilInstallation ? Math.max(2, daysUntilInstallation - 2) : 3));
                    setSelectedDate(optimal.toISOString().split('T')[0]);
                    setSelectedTimeSlot('morning');
                  }}
                  className="p-4 border border-gray-300 rounded-lg hover:border-teal-300 hover:bg-teal-50 text-left"
                >
                  <div className="font-medium text-gray-900">Optimal Timing</div>
                  <div className="text-sm text-gray-600">2 days before installation deadline</div>
                </button>
              </div>

              {/* Custom Date Selection */}
              <div className="border border-gray-300 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-gray-900">Choose Custom Date</h5>
                  <button
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="text-teal-600 hover:text-teal-700 text-sm"
                  >
                    {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
                  </button>
                </div>

                {showCalendar && (
                  <div className="mb-4">
                    <div className="grid grid-cols-7 gap-2">
                      {getNext14Days().slice(0, 14).map((date) => {
                        const dateStr = date.toISOString().split('T')[0];
                        const isSelected = selectedDate === dateStr;
                        const isToday = date.toDateString() === new Date().toDateString();
                        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                        const dayNum = date.getDate();
                        
                        return (
                          <button
                            key={dateStr}
                            onClick={() => setSelectedDate(dateStr)}
                            className={`p-2 rounded-lg text-sm ${
                              isSelected 
                                ? 'bg-teal-600 text-white' 
                                : isToday 
                                ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            <div className="font-medium">{dayName}</div>
                            <div>{dayNum}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Time Slot Selection */}
                {selectedDate && (
                  <div>
                    <h6 className="font-medium text-gray-900 mb-2">Select Time Slot</h6>
                    <div className="grid grid-cols-3 gap-2">
                      {['morning', 'afternoon', 'evening'].map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedTimeSlot(slot)}
                          className={`p-3 rounded-lg text-sm ${
                            selectedTimeSlot === slot
                              ? 'bg-teal-600 text-white'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          <div className="font-medium capitalize">{slot}</div>
                          <div className="text-xs opacity-75">
                            {slot === 'morning' ? '8AM - 12PM' :
                             slot === 'afternoon' ? '12PM - 5PM' : '5PM - 8PM'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confirm Scheduling */}
                {selectedDate && selectedTimeSlot && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {new Date(selectedDate).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                        <p className="text-sm text-gray-600 capitalize">
                          {selectedTimeSlot} ({
                            selectedTimeSlot === 'morning' ? '8AM - 12PM' :
                            selectedTimeSlot === 'afternoon' ? '12PM - 5PM' : '5PM - 8PM'
                          })
                        </p>
                      </div>
                      <button
                        onClick={() => onScheduleDelivery(selectedDate, selectedTimeSlot)}
                        className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
                      >
                        Confirm Schedule
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Scheduled Delivery Info */
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Scheduled Delivery</h4>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="w-6 h-6 text-yellow-600 mr-3" />
                    <div>
                      <p className="font-medium text-yellow-800">
                        {formatDeliveryDate(materialOrder.scheduledDeliveryDate!)}
                      </p>
                      <p className="text-sm text-yellow-700">
                        {materialOrder.scheduledTimeSlot} delivery window
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => console.log('Reschedule delivery')}
                    className="bg-yellow-600 text-white px-3 py-2 rounded-lg hover:bg-yellow-700 text-sm"
                  >
                    Reschedule
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delivery Instructions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Delivery Instructions</h4>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-teal-600 hover:text-teal-700 text-sm"
                >
                  <Edit className="w-4 h-4 mr-1 inline" />
                  Edit
                </button>
              )}
            </div>
            
            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  placeholder="Add special instructions for the delivery driver..."
                  className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveInstructions}
                    className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 text-sm flex items-center"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setDeliveryInstructions(booking.deliveryInstructions || '');
                      setIsEditing(false);
                    }}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm flex items-center"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700">
                  {deliveryInstructions || 'No special instructions provided'}
                </p>
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <User className="w-4 h-4 text-gray-600 mr-2" />
                  <span className="font-medium text-gray-900">Property Owner</span>
                </div>
                <p className="text-sm text-gray-600">{booking.propertyOwnerName || 'N/A'}</p>
                <button
                  onClick={onContactOwner}
                  className="mt-2 text-teal-600 hover:text-teal-700 text-sm"
                >
                  <MessageCircle className="w-4 h-4 mr-1 inline" />
                  Message
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Building2 className="w-4 h-4 text-gray-600 mr-2" />
                  <span className="font-medium text-gray-900">Supplier</span>
                </div>
                <p className="text-sm text-gray-600">{materialOrder.supplierName || 'N/A'}</p>
                <button
                  onClick={() => console.log('Contact supplier')}
                  className="mt-2 text-teal-600 hover:text-teal-700 text-sm"
                >
                  <MessageCircle className="w-4 h-4 mr-1 inline" />
                  Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};