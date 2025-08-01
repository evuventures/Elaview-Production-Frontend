import React, { useState } from 'react';
import { 
  Building2, Star, Phone, Mail, Globe, MapPin, 
  Clock, DollarSign, Package, TrendingUp, 
  MessageCircle, ExternalLink, Award, AlertTriangle,
  ChevronDown, ChevronUp, Calendar, CheckCircle
} from 'lucide-react';
import { SupplierDashboardProps } from '../types';
import { formatPrice, formatDeliveryDate } from '../utils';

export const SupplierDashboard: React.FC<SupplierDashboardProps> = ({ 
  suppliers,
  selectedSupplierId,
  onSelectSupplier,
  onContactSupplier,
  onViewSupplierDetails,
  onCompareSuppliers,
  onRequestQuote
}) => {
  const [expandedSupplier, setExpandedSupplier] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'delivery' | 'reliability'>('rating');

  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);

  // Sort suppliers based on selected criteria
  const sortedSuppliers = [...suppliers].sort((a, b) => {
    switch(sortBy) {
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'price':
        return (a.averagePrice || 0) - (b.averagePrice || 0);
      case 'delivery':
        return (a.averageDeliveryDays || 0) - (b.averageDeliveryDays || 0);
      case 'reliability':
        return (b.reliabilityScore || 0) - (a.reliabilityScore || 0);
      default:
        return 0;
    }
  });

  const getReliabilityColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600 bg-green-100';
    if (score >= 4.0) return 'text-blue-600 bg-blue-100';
    if (score >= 3.5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getDeliverySpeedBadge = (days: number) => {
    if (days <= 3) return { text: 'Fast', color: 'bg-green-100 text-green-800' };
    if (days <= 7) return { text: 'Standard', color: 'bg-blue-100 text-blue-800' };
    if (days <= 14) return { text: 'Slow', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Very Slow', color: 'bg-red-100 text-red-800' };
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-gray-600" />
            Supplier Network
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage relationships with material suppliers
          </p>
        </div>
        
        {/* Sort Controls */}
        <div className="flex items-center space-x-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="rating">Sort by Rating</option>
            <option value="price">Sort by Price</option>
            <option value="delivery">Sort by Delivery</option>
            <option value="reliability">Sort by Reliability</option>
          </select>
          
          <button
            onClick={onCompareSuppliers}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 text-sm"
          >
            Compare All
          </button>
        </div>
      </div>

      {/* Selected Supplier Highlight */}
      {selectedSupplier && (
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mr-4">
                <Building2 className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h4 className="font-medium text-teal-900">{selectedSupplier.name}</h4>
                <p className="text-sm text-teal-700">Current supplier for this order</p>
                <div className="flex items-center mt-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-teal-700 ml-1">
                    {selectedSupplier.rating} ({selectedSupplier.totalOrders} orders)
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => onViewSupplierDetails(selectedSupplier.id)}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 text-sm"
            >
              View Details
            </button>
          </div>
        </div>
      )}

      {/* Suppliers List */}
      <div className="space-y-4">
        {sortedSuppliers.map((supplier) => {
          const isExpanded = expandedSupplier === supplier.id;
          const isSelected = selectedSupplierId === supplier.id;
          const deliveryBadge = getDeliverySpeedBadge(supplier.averageDeliveryDays || 7);
          
          return (
            <div 
              key={supplier.id} 
              className={`border rounded-lg p-4 transition-all ${
                isSelected ? 'border-teal-300 bg-teal-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Supplier Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                    <Building2 className="w-5 h-5 text-gray-600" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium text-gray-900">{supplier.name}</h4>
                      {supplier.isPremium && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center">
                          <Award className="w-3 h-3 mr-1" />
                          Premium
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full ${deliveryBadge.color}`}>
                        {deliveryBadge.text}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span>{supplier.rating || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{supplier.averageDeliveryDays || 'N/A'} days avg</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        <span>{formatPrice(supplier.averagePrice)} avg</span>
                      </div>
                      <div className="flex items-center">
                        <Package className="w-4 h-4 mr-1" />
                        <span>{supplier.totalOrders || 0} orders</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onRequestQuote(supplier.id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Get Quote
                  </button>
                  <button
                    onClick={() => onContactSupplier(supplier.id)}
                    className="text-gray-600 hover:text-gray-900 p-1"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setExpandedSupplier(isExpanded ? null : supplier.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                  {/* Supplier Info */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Contact Information</h5>
                      <div className="space-y-2 text-sm">
                        {supplier.contactEmail && (
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 text-gray-400 mr-2" />
                            <a href={`mailto:${supplier.contactEmail}`} className="text-blue-600 hover:text-blue-700">
                              {supplier.contactEmail}
                            </a>
                          </div>
                        )}
                        {supplier.supportPhone && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 text-gray-400 mr-2" />
                            <a href={`tel:${supplier.supportPhone}`} className="text-blue-600 hover:text-blue-700">
                              {supplier.supportPhone}
                            </a>
                          </div>
                        )}
                        {supplier.website && (
                          <div className="flex items-center">
                            <Globe className="w-4 h-4 text-gray-400 mr-2" />
                            <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 flex items-center">
                              Visit Website <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Service Details</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Service Areas:</span>
                          <span className="font-medium">
                            {supplier.serviceAreas?.length || 0} regions
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Reliability Score:</span>
                          <span className={`font-medium px-2 py-1 rounded text-xs ${getReliabilityColor(supplier.reliabilityScore || 0)}`}>
                            {supplier.reliabilityScore || 'N/A'}/5
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Terms:</span>
                          <span className="font-medium">{supplier.paymentTerms || 'Standard'}</span>
                        </div>
                        {supplier.minimumOrder && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Minimum Order:</span>
                            <span className="font-medium">{formatPrice(supplier.minimumOrder)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Specialties */}
                  {supplier.specialties && supplier.specialties.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Specialties</h5>
                      <div className="flex flex-wrap gap-2">
                        {supplier.specialties.map((specialty) => (
                          <span key={specialty} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                            {specialty.replace(/_/g, ' ').toLowerCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Orders */}
                  {supplier.recentOrders && supplier.recentOrders.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Recent Orders</h5>
                      <div className="space-y-2">
                        {supplier.recentOrders.slice(0, 3).map((order) => (
                          <div key={order.id} className="flex items-center justify-between bg-gray-50 rounded p-2 text-sm">
                            <div className="flex items-center">
                              <span className="font-medium">#{order.orderNumber}</span>
                              <span className="text-gray-600 ml-2">{order.material}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-600">{formatDeliveryDate(order.completedAt)}</span>
                              <span className={`w-2 h-2 rounded-full ${
                                order.status === 'completed' ? 'bg-green-500' : 
                                order.status === 'delayed' ? 'bg-yellow-500' : 'bg-red-500'
                              }`}></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-3 gap-4 pt-2 border-t border-gray-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{supplier.onTimeDeliveryRate || 0}%</div>
                      <div className="text-xs text-gray-600">On-Time Delivery</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{supplier.qualityScore || 0}/5</div>
                      <div className="text-xs text-gray-600">Quality Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{supplier.responseTime || 0}h</div>
                      <div className="text-xs text-gray-600">Response Time</div>
                    </div>
                  </div>

                  {/* Warnings */}
                  {supplier.warnings && supplier.warnings.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-start">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h6 className="font-medium text-yellow-800 text-sm">Notices</h6>
                          <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                            {supplier.warnings.map((warning, index) => (
                              <li key={index}>• {warning}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {suppliers.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Suppliers Available</h3>
          <p className="text-gray-600 mb-6">
            Suppliers will be added to your network as you place orders
          </p>
        </div>
      )}

      {/* Footer Actions */}
      {suppliers.length > 1 && (
        <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {suppliers.length} suppliers in your network
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onCompareSuppliers}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm"
            >
              Compare Performance
            </button>
            <button
              onClick={() => console.log('Add new supplier')}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 text-sm"
            >
              Find New Suppliers
            </button>
          </div>
        </div>
      )}
    </div>
  );
};